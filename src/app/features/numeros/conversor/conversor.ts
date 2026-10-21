import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  NUMERO_MAXIMO,
  NumeroChines,
  ano,
  digitoADigito,
  hora,
  lerNumeroDigitado,
  numero,
  preco,
} from '../../../core/numeros/numeros';
import { VozService } from '../../../core/voz/voz.service';
import { BotaoAudio } from '../../../shared/botao-audio/botao-audio';
import { PinyinColorido } from '../../../shared/pinyin-colorido/pinyin-colorido';
import { Categoria, sortearAlvo } from '../alvos';

type Tipo = 'numero' | 'preco' | 'hora' | 'telefone' | 'ano';

const TIPOS: { id: Tipo; nome: string; exemplo: string; categoria: Categoria }[] = [
  { id: 'numero', nome: 'Número', exemplo: '2026', categoria: 'grandes' },
  { id: 'preco', nome: 'Preço', exemplo: '12,50', categoria: 'precos' },
  { id: 'hora', nome: 'Hora', exemplo: '8:30', categoria: 'horas' },
  { id: 'telefone', nome: 'Telefone', exemplo: '138 1234 5678', categoria: 'telefones' },
  { id: 'ano', nome: 'Ano', exemplo: '1990', categoria: 'anos' },
];

@Component({
  selector: 'app-conversor',
  imports: [FormsModule, BotaoAudio, PinyinColorido],
  template: `
    <p>Digite qualquer número para ver como se escreve e se fala em chinês.</p>

    <div class="tipos" role="radiogroup" aria-label="Tipo">
      @for (t of tipos; track t.id) {
        <button type="button" role="radio" [attr.aria-checked]="tipo() === t.id" [class.ativo]="tipo() === t.id" (click)="mudarTipo(t.id)">
          {{ t.nome }}
        </button>
      }
    </div>

    <form class="entrada" (submit)="$event.preventDefault(); falar()">
      <label for="numero-conversor" class="visualmente-oculto">Número</label>
      <input
        id="numero-conversor"
        class="campo grande"
        inputmode="decimal"
        autocomplete="off"
        [placeholder]="'ex.: ' + exemploAtual()"
        [ngModel]="texto()"
        (ngModelChange)="texto.set($event)"
        name="numero"
      />
      <button type="button" class="botao" (click)="aleatorio()">🎲 Aleatório</button>
    </form>

    @if (resultado(); as r) {
      @if (r.erro) {
        <p class="aviso" role="status">{{ r.erro }}</p>
      } @else {
        <section class="cartao resultado" aria-live="polite">
          <p class="hanzi-resultado" lang="zh-CN">{{ r.valor!.hanzi }}</p>
          <p class="pinyin-resultado"><app-pinyin [texto]="r.valor!.pinyin" /></p>
          <div class="linha centro">
            <app-botao-audio [texto]="r.valor!.hanzi" [rotulo]="r.valor!.pinyin" legenda="Ouvir" />
            <app-botao-audio [texto]="r.valor!.hanzi" [rotulo]="r.valor!.pinyin" legenda="Devagar" velocidade="lenta" />
          </div>
        </section>
      }
    }
  `,
  styles: `
    .tipos {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 12px;
    }
    .tipos button {
      min-height: 40px;
      padding: 6px 14px;
      border-radius: 999px;
      border: 1px solid var(--cor-borda);
      background: var(--cor-superficie);
      color: var(--cor-texto);
      font: inherit;
      font-weight: 600;
      cursor: pointer;
    }
    .tipos button.ativo {
      background: var(--cor-texto);
      color: var(--cor-fundo);
    }
    .entrada {
      display: flex;
      gap: 8px;
      margin-bottom: 12px;
    }
    .grande {
      font-size: 1.4rem;
      font-weight: 700;
    }
    .resultado {
      text-align: center;
    }
    .hanzi-resultado {
      font-family: var(--fonte-hanzi);
      font-size: clamp(2rem, 10vw, 3.4rem);
      line-height: 1.3;
      margin: 0;
      word-break: break-all;
    }
    .pinyin-resultado {
      font-size: 1.3rem;
    }
    .centro {
      justify-content: center;
    }
  `,
})
export class ConversorPagina {
  private readonly voz = inject(VozService);
  protected readonly tipos = TIPOS;
  protected readonly tipo = signal<Tipo>('numero');
  protected readonly texto = signal('2026');
  protected readonly exemploAtual = computed(() => TIPOS.find((t) => t.id === this.tipo())!.exemplo);

  protected readonly resultado = computed<{ valor?: NumeroChines; erro?: string } | null>(() => {
    const texto = this.texto().trim();
    if (!texto) return null;
    switch (this.tipo()) {
      case 'preco': {
        const v = lerNumeroDigitado(texto);
        if (v === null || v > 99_999) return { erro: 'Digite um valor como 12,50 (até 99.999).' };
        return { valor: preco(v) };
      }
      case 'hora': {
        const m = /^(\d{1,2})\s*[:hH.]?\s*(\d{2})?$/.exec(texto);
        if (!m || Number(m[1]) > 24 || Number(m[2] ?? 0) > 59) return { erro: 'Digite uma hora como 8:30.' };
        return { valor: hora(Number(m[1]), Number(m[2] ?? 0)) };
      }
      case 'telefone': {
        const d = texto.replace(/\D/g, '');
        return d ? { valor: digitoADigito(d, true) } : { erro: 'Digite os números do telefone.' };
      }
      case 'ano': {
        const a = Number(texto.replace(/\D/g, ''));
        return a > 0 && a < 10000 ? { valor: ano(a) } : { erro: 'Digite um ano como 1990.' };
      }
      default: {
        const v = lerNumeroDigitado(texto);
        if (v === null || !Number.isInteger(v)) return { erro: 'Digite um número inteiro (ex.: 2026).' };
        if (v > NUMERO_MAXIMO) return { erro: 'Digite um número até 99.999.999.' };
        return { valor: numero(v) };
      }
    }
  });

  protected mudarTipo(t: Tipo): void {
    this.tipo.set(t);
    this.texto.set(TIPOS.find((x) => x.id === t)!.exemplo);
  }

  protected aleatorio(): void {
    const t = TIPOS.find((x) => x.id === this.tipo())!;
    this.texto.set(sortearAlvo(t.categoria).exibicao.replace(' yuans', ''));
    setTimeout(() => this.falar());
  }

  protected falar(): void {
    const v = this.resultado()?.valor;
    if (v) void this.voz.falar(v.hanzi);
  }
}
