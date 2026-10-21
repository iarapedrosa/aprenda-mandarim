import { Component, OnInit, computed, inject, input, output, signal } from '@angular/core';
import { soCaracteres } from '../../../core/dados/segmentar';
import { embaralhar } from '../../../core/util/aleatorio';
import { VozService } from '../../../core/voz/voz.service';
import { BotaoAudio } from '../../../shared/botao-audio/botao-audio';
import { PinyinColorido } from '../../../shared/pinyin-colorido/pinyin-colorido';
import { ItemMontar, ResultadoItem } from '../sessao.model';

interface Peca {
  id: number;
  texto: string;
}

/** "Monte a frase": tocar nas palavras na ordem certa. */
@Component({
  selector: 'app-ex-montar',
  imports: [BotaoAudio, PinyinColorido],
  template: `
    <p class="enunciado">Monte a frase em chinês</p>
    <div class="pergunta">
      <p class="texto-pergunta">{{ item().frase.traducao }}</p>
      <div class="linha centro">
        <app-botao-audio [texto]="item().frase.hanzi" legenda="Ouvir" rotulo="a frase" />
        <app-botao-audio [texto]="item().frase.hanzi" legenda="Devagar" rotulo="a frase" velocidade="lenta" />
      </div>
    </div>

    <div class="resposta-montada" [class.certa]="verificado() && acertou()" [class.errada]="verificado() && !acertou()" aria-label="Sua frase" role="group">
      @for (p of escolhidas(); track p.id) {
        <button type="button" class="peca" lang="zh-CN" (click)="devolver(p)" [disabled]="verificado()" [attr.aria-label]="'Tirar ' + p.texto">{{ p.texto }}</button>
      } @empty {
        <span class="suave pequeno">Toque nas palavras abaixo, na ordem certa.</span>
      }
    </div>

    <div class="banco" aria-label="Palavras disponíveis" role="group">
      @for (p of banco(); track p.id) {
        <button type="button" class="peca" lang="zh-CN" (click)="escolher(p)" [disabled]="verificado()">{{ p.texto }}</button>
      }
    </div>

    @if (!verificado()) {
      <button type="button" class="botao botao-primario botao-bloco" [disabled]="banco().length > 0" (click)="verificar()">Verificar</button>
    } @else {
      <div [class]="acertou() ? 'sucesso retorno' : 'erro retorno'" role="status">
        <strong>{{ acertou() ? 'Certo!' : 'A ordem certa é:' }}</strong>
        <span class="resposta">
          <span lang="zh-CN" class="hanzi-resposta">{{ item().frase.hanzi }}</span>
          <app-pinyin [texto]="item().frase.pinyin" />
        </span>
        @if (!acertou()) {
          <span class="explicacao">Às vezes há mais de uma ordem possível (o tempo pode abrir a frase), mas aqui vale a do exemplo.</span>
        }
      </div>
      <button type="button" class="botao botao-primario botao-bloco" (click)="concluir.emit({ acertou: acertou() })">Continuar</button>
    }
  `,
  styleUrl: './exercicios.css',
  styles: `
    .resposta-montada {
      min-height: 64px;
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      align-items: center;
      padding: 10px;
      margin-bottom: 12px;
      border-radius: var(--raio-p);
      border: 2px dashed var(--cor-borda);
    }
    .resposta-montada.certa {
      border: 2px solid var(--cor-sucesso);
      background: var(--cor-sucesso-suave);
    }
    .resposta-montada.errada {
      border: 2px solid var(--cor-erro);
      background: var(--cor-erro-suave);
    }
    .banco {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      justify-content: center;
      min-height: 52px;
      margin-bottom: 14px;
    }
    .peca {
      min-height: 46px;
      padding: 6px 14px;
      border-radius: 10px;
      border: 1px solid var(--cor-borda);
      border-bottom-width: 3px;
      background: var(--cor-superficie);
      color: var(--cor-texto);
      font-family: var(--fonte-hanzi);
      font-size: 1.4rem;
      cursor: pointer;
    }
    .peca:hover:not(:disabled) {
      border-color: var(--cor-primaria);
    }
  `,
})
export class ExMontar implements OnInit {
  private readonly voz = inject(VozService);
  readonly item = input.required<ItemMontar>();
  readonly concluir = output<ResultadoItem>();

  private readonly todas = signal<Peca[]>([]);
  protected readonly escolhidas = signal<Peca[]>([]);
  protected readonly banco = computed(() => this.todas().filter((p) => !this.escolhidas().includes(p)));
  protected readonly verificado = signal(false);
  protected readonly acertou = signal(false);

  ngOnInit(): void {
    const pecas = this.item().pedacos.map((texto, id) => ({ id, texto }));
    let embaralhadas = embaralhar(pecas);
    // evita começar já na ordem certa
    for (let t = 0; t < 5 && embaralhadas.every((p, i) => p.id === i) && pecas.length > 1; t++) embaralhadas = embaralhar(pecas);
    this.todas.set(embaralhadas);
  }

  protected escolher(p: Peca): void {
    this.escolhidas.update((e) => [...e, p]);
  }

  protected devolver(p: Peca): void {
    this.escolhidas.update((e) => e.filter((x) => x !== p));
  }

  protected verificar(): void {
    const montada = this.escolhidas().map((p) => p.texto).join('');
    this.acertou.set(montada === soCaracteres(this.item().frase.hanzi));
    this.verificado.set(true);
    void this.voz.falar(this.item().frase.hanzi);
  }
}
