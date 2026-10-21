import { Component, OnInit, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ResultadoPinyin, compararPinyin } from '../../../core/pinyin/pinyin';
import { VozService } from '../../../core/voz/voz.service';
import { BotaoAudio } from '../../../shared/botao-audio/botao-audio';
import { PinyinColorido } from '../../../shared/pinyin-colorido/pinyin-colorido';
import { ItemDigitarPinyin, ResultadoItem } from '../sessao.model';

/** Digitar o pinyin de uma palavra ou frase (com números ou acentos). */
@Component({
  selector: 'app-ex-digitar-pinyin',
  imports: [FormsModule, BotaoAudio, PinyinColorido],
  template: `
    <p class="enunciado">{{ item().enunciado }}</p>
    <div class="pergunta">
      @if (!item().soAudio || resultado()) {
        <p class="hanzi-pergunta" lang="zh-CN">{{ item().hanzi }}</p>
      }
      @if (!item().soAudio) {
        <p class="suave">{{ item().traducao }}</p>
      }
      <div class="linha centro">
        <app-botao-audio [texto]="item().hanzi" legenda="Ouvir" rotulo="o áudio" />
        <app-botao-audio [texto]="item().hanzi" legenda="Devagar" rotulo="o áudio" velocidade="lenta" />
      </div>
    </div>

    <form (submit)="$event.preventDefault(); verificar()">
      <label for="resposta-pinyin" class="visualmente-oculto">Sua resposta em pinyin</label>
      <input
        id="resposta-pinyin"
        class="campo"
        autocomplete="off"
        autocapitalize="off"
        spellcheck="false"
        placeholder="ex.: ni3 hao3 ou nǐ hǎo"
        [ngModel]="texto()"
        (ngModelChange)="texto.set($event)"
        name="resposta"
        [disabled]="!!resultado()"
        autofocus
      />
      <p class="suave pequeno dica">Tons com números: 1 ā · 2 á · 3 ǎ · 4 à · 5 neutro · v = ü</p>
      @if (!resultado()) {
        <div class="linha">
          <button type="submit" class="botao botao-primario" [disabled]="!texto().trim()">Verificar</button>
          <button type="button" class="botao botao-texto" (click)="desistir()">Não sei</button>
        </div>
      }
    </form>

    @if (resultado(); as r) {
      <div [class]="r.correto ? 'sucesso retorno' : 'erro retorno'" role="status">
        <strong>{{ r.mensagem }}</strong>
        <span class="silabas">
          @for (s of r.silabas; track $index) {
            <span class="silaba" [class]="'silaba ' + s.estado" [title]="s.nota ?? ''">
              {{ s.esperada }}
              @if (s.estado !== 'certo' && s.digitada) {
                <small>(você: {{ s.digitada }})</small>
              }
            </span>
          }
        </span>
        @for (s of r.silabas; track $index) {
          @if (s.nota) {
            <span class="explicacao">{{ s.nota }}</span>
          }
        }
        <span class="resposta">
          Resposta: <app-pinyin [texto]="item().pinyin" /> — {{ item().traducao }}
        </span>
      </div>
      <button type="button" class="botao botao-primario botao-bloco" (click)="concluir.emit({ acertou: r.correto })">
        Continuar
      </button>
    }
  `,
  styleUrl: './exercicios.css',
  styles: `
    form {
      margin-bottom: 12px;
    }
    .dica {
      margin: 6px 0 10px;
    }
    .silabas {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      flex-basis: 100%;
    }
    .silaba {
      padding: 2px 8px;
      border-radius: 8px;
      font-weight: 700;
      background: var(--cor-superficie);
      color: var(--cor-texto);
    }
    .silaba.certo {
      outline: 2px solid var(--cor-sucesso);
    }
    .silaba.tom-errado,
    .silaba.sem-tom {
      outline: 2px solid var(--cor-aviso);
    }
    .silaba.letras-erradas {
      outline: 2px solid var(--cor-erro);
    }
  `,
})
export class ExDigitarPinyin implements OnInit {
  private readonly voz = inject(VozService);
  readonly item = input.required<ItemDigitarPinyin>();
  readonly concluir = output<ResultadoItem>();
  protected readonly texto = signal('');
  protected readonly resultado = signal<ResultadoPinyin | null>(null);

  ngOnInit(): void {
    if (this.item().soAudio) void this.voz.falar(this.item().hanzi);
  }

  protected verificar(): void {
    if (!this.texto().trim() || this.resultado()) return;
    this.resultado.set(compararPinyin(this.texto(), this.item().pinyin, { hanzi: this.item().hanzi }));
  }

  protected desistir(): void {
    this.resultado.set({ ...compararPinyin('', this.item().pinyin), mensagem: 'Tudo bem! Veja a resposta:' });
  }
}
