import { Component, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { VocabularioService } from '../../../core/dados/vocabulario.service';
import { Tom } from '../../../core/pinyin/pinyin';
import { SilabasService } from '../../../core/pinyin/silabas.service';
import { Candidato, candidatosTeclado, chaveTeclado } from '../../../core/pinyin/teclado';
import { VozService } from '../../../core/voz/voz.service';
import { BotaoAudio } from '../../../shared/botao-audio/botao-audio';
import { PinyinColorido } from '../../../shared/pinyin-colorido/pinyin-colorido';
import { ItemTeclado, ResultadoItem } from '../sessao.model';
import { IdiomaService } from '../../../core/i18n/idioma.service';

/**
 * Digitar como no teclado chinês do celular: escreve-se o pinyin sem tons e escolhe-se
 * o caractere certo na barra de candidatos (onde aparecem os homófonos!).
 */
@Component({
  selector: 'app-ex-teclado',
  imports: [FormsModule, BotaoAudio, PinyinColorido],
  template: `
    <p class="enunciado">{{ i.t('Digite como no teclado chinês', 'Type it like on a Chinese keyboard') }}</p>
    <div class="pergunta">
      <p class="texto-pergunta">{{ i.tr(item().palavra, 'traducao') }}</p>
      <div class="linha centro">
        <app-botao-audio [texto]="item().palavra.hanzi" [legenda]="i.t('Ouvir', 'Listen')" [rotulo]="i.t('a palavra', 'the word')" />
      </div>
    </div>

    <label for="campo-teclado" class="visualmente-oculto">{{ i.t('Pinyin sem tons', 'Pinyin without tones') }}</label>
    <input
      id="campo-teclado"
      class="campo"
      autocomplete="off"
      autocapitalize="off"
      spellcheck="false"
      [placeholder]="i.t('pinyin sem tons (ex.: nihao)', 'pinyin without tones (e.g. nihao)')"
      [ngModel]="texto()"
      (ngModelChange)="texto.set($event)"
      [disabled]="escolhido() !== null"
    />
    <div class="barra-candidatos" role="listbox" [attr.aria-label]="i.t('Candidatos', 'Candidates')">
      @for (c of candidatos(); track c.hanzi; let idx = $index) {
        <button
          type="button"
          role="option"
          class="candidato"
          lang="zh-CN"
          [class.correto]="escolhido() !== null && c.hanzi === item().palavra.hanzi"
          [class.errado]="escolhido() === c.hanzi && c.hanzi !== item().palavra.hanzi"
          [disabled]="escolhido() !== null"
          (click)="escolher(c)"
        >
          <span class="num" aria-hidden="true">{{ idx + 1 }}</span>{{ c.hanzi }}
        </button>
      } @empty {
        <span class="suave pequeno">{{ texto() ? i.t('Nenhum candidato — confira a grafia.', 'No candidates — check the spelling.') : i.t('Os caracteres aparecem aqui enquanto você digita.', 'Characters show up here as you type.') }}</span>
      }
    </div>
    <p class="suave pequeno">{{ i.t('No celular, é assim que se escreve em chinês: teclado "Chinês (Pinyin)" nas configurações.', 'On a phone, this is how people write Chinese: add the "Chinese (Pinyin)" keyboard in settings.') }}</p>

    @if (escolhido() !== null) {
      <div [class]="acertou() ? 'sucesso retorno' : 'erro retorno'" role="status">
        <strong>{{ acertou() ? i.t('Certo!', 'Correct!') : i.t('Era outro caractere:', 'It was a different character:') }}</strong>
        <span class="resposta">
          <span lang="zh-CN" class="hanzi-resposta">{{ item().palavra.hanzi }}</span>
          <app-pinyin [texto]="item().palavra.pinyin" />
        </span>
        @if (!acertou() && homofono()) {
          <span class="explicacao">{{ i.t('Mesmo som, caractere diferente — por isso no chinês é preciso reconhecer o caractere certo!', 'Same sound, different character — that’s why in Chinese you need to recognize the right character!') }}</span>
        }
      </div>
      <button type="button" class="botao botao-primario botao-bloco" (click)="concluir.emit({ acertou: acertou() })">{{ i.t('Continuar', 'Continue') }}</button>
    } @else {
      <button type="button" class="botao botao-texto botao-bloco" (click)="desistir()">{{ i.t('Não sei', 'I don’t know') }}</button>
    }
  `,
  styleUrl: './exercicios.css',
  styles: `
    .barra-candidatos {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      min-height: 56px;
      align-items: center;
      padding: 8px;
      margin: 8px 0;
      border-radius: var(--raio-p);
      background: var(--cor-superficie-2);
    }
    .candidato {
      position: relative;
      min-width: 52px;
      min-height: 48px;
      padding: 4px 12px;
      border-radius: 8px;
      border: 1px solid var(--cor-borda);
      background: var(--cor-superficie);
      color: var(--cor-texto);
      font-family: var(--fonte-hanzi);
      font-size: 1.5rem;
      cursor: pointer;
    }
    .candidato.correto {
      border-color: var(--cor-sucesso);
      background: var(--cor-sucesso-suave);
    }
    .candidato.errado {
      border-color: var(--cor-erro);
      background: var(--cor-erro-suave);
    }
    .num {
      position: absolute;
      top: 1px;
      left: 4px;
      font-family: var(--fonte-texto);
      font-size: 0.6rem;
      color: var(--cor-texto-suave);
    }
  `,
})
export class ExTeclado {
  protected readonly i = inject(IdiomaService);
  private readonly vocabulario = inject(VocabularioService);
  private readonly silabas = inject(SilabasService);
  private readonly voz = inject(VozService);
  readonly item = input.required<ItemTeclado>();
  readonly concluir = output<ResultadoItem>();

  protected readonly texto = signal('');
  protected readonly escolhido = signal<string | null>(null);
  protected readonly acertou = computed(() => this.escolhido() === this.item().palavra.hanzi);
  protected readonly homofono = computed(
    () => chaveTeclado(this.texto()) === chaveTeclado(this.item().palavra.pinyin),
  );

  /** Vocabulário + caracteres de mesma sílaba (homófonos), como num teclado de verdade. */
  private readonly fonte = computed<Candidato[]>(() => {
    const doVocabulario = this.vocabulario
      .palavras()
      .filter((p) => !p.hanzi.includes('…'))
      .map((p) => ({ hanzi: p.hanzi, pinyin: p.pinyin }));
    const chave = chaveTeclado(this.texto()).replace(/v/g, 'ü');
    const homofonos = this.silabas.carregado()
      ? ([1, 2, 3, 4] as Tom[]).map((t) => this.silabas.obter(chave, t)).filter((s) => s && !s.raro)
      : [];
    return [...doVocabulario, ...homofonos.map((s) => ({ hanzi: s!.caractere, pinyin: s!.pinyin }))];
  });

  protected readonly candidatos = computed(() => candidatosTeclado(this.texto(), this.fonte()));

  constructor() {
    void this.silabas.carregar();
  }

  protected escolher(c: Candidato): void {
    if (this.escolhido() !== null) return;
    this.escolhido.set(c.hanzi);
    void this.voz.falar(this.item().palavra.hanzi);
  }

  protected desistir(): void {
    this.escolhido.set('');
  }
}
