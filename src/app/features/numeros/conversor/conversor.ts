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
import { IdiomaService } from '../../../core/i18n/idioma.service';

type Tipo = 'numero' | 'preco' | 'hora' | 'telefone' | 'ano';

const TIPOS: { id: Tipo; nome: string; nomeEn: string; exemplo: string; exemploEn: string; categoria: Categoria }[] = [
  { id: 'numero', nome: 'Número', nomeEn: 'Number', exemplo: '2026', exemploEn: '2026', categoria: 'grandes' },
  { id: 'preco', nome: 'Preço', nomeEn: 'Price', exemplo: '12,50', exemploEn: '12.50', categoria: 'precos' },
  { id: 'hora', nome: 'Hora', nomeEn: 'Time', exemplo: '8:30', exemploEn: '8:30', categoria: 'horas' },
  { id: 'telefone', nome: 'Telefone', nomeEn: 'Phone', exemplo: '138 1234 5678', exemploEn: '138 1234 5678', categoria: 'telefones' },
  { id: 'ano', nome: 'Ano', nomeEn: 'Year', exemplo: '1990', exemploEn: '1990', categoria: 'anos' },
];

@Component({
  selector: 'app-conversor',
  imports: [FormsModule, BotaoAudio, PinyinColorido],
  template: `
    <p class="suave pequeno intro">{{ i.t('Digite qualquer número para ver como se escreve e se fala em chinês.', 'Type any number to see how it is written and said in Chinese.') }}</p>

    <div class="tipos chips-rolagem" role="radiogroup" [attr.aria-label]="i.t('Tipo', 'Type')">
      @for (t of tipos; track t.id) {
        <button type="button" role="radio" [attr.aria-checked]="tipo() === t.id" [class.ativo]="tipo() === t.id" (click)="mudarTipo(t.id)">
          {{ i.tr(t, 'nome') }}
        </button>
      }
    </div>

    <form class="entrada" (submit)="$event.preventDefault(); falar()">
      <label for="numero-conversor" class="visualmente-oculto">{{ i.t('Número', 'Number') }}</label>
      <input
        id="numero-conversor"
        class="campo grande"
        inputmode="decimal"
        autocomplete="off"
        [placeholder]="i.t('ex.: ', 'e.g. ') + exemploAtual()"
        [ngModel]="texto()"
        (ngModelChange)="texto.set($event)"
        name="numero"
      />
      <button type="button" class="botao aleatorio" (click)="aleatorio()" [attr.aria-label]="i.t('Número aleatório', 'Random number')" [title]="i.t('Número aleatório', 'Random number')">🎲<span class="rotulo-aleatorio">{{ i.t('Aleatório', 'Random') }}</span></button>
    </form>

    @if (resultado(); as r) {
      @if (r.erro) {
        <p class="aviso" role="status">{{ r.erro }}</p>
      } @else {
        <section class="cartao resultado" aria-live="polite">
          <p class="hanzi-resultado" lang="zh-CN">{{ r.valor!.hanzi }}</p>
          <p class="pinyin-resultado"><app-pinyin [texto]="r.valor!.pinyin" /></p>
          <div class="linha centro">
            <app-botao-audio [texto]="r.valor!.hanzi" [rotulo]="r.valor!.pinyin" [legenda]="i.t('Ouvir', 'Listen')" />
            <app-botao-audio [texto]="r.valor!.hanzi" [rotulo]="r.valor!.pinyin" [legenda]="i.t('Devagar', 'Slow')" velocidade="lenta" />
          </div>
        </section>
      }
    }
  `,
  styles: `
    .intro {
      margin: 0 0 10px;
    }
    .entrada {
      display: flex;
      gap: 8px;
      margin-bottom: 12px;
    }
    .entrada .campo {
      flex: 1;
      min-width: 0;
    }
    .aleatorio {
      flex: none;
      white-space: nowrap;
    }
    @media (max-width: 599px) {
      .rotulo-aleatorio {
        display: none;
      }
      .aleatorio {
        width: 52px;
        padding: 0;
        font-size: 1.3rem;
      }
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
  protected readonly i = inject(IdiomaService);
  private readonly voz = inject(VozService);
  protected readonly tipos = TIPOS;
  protected readonly tipo = signal<Tipo>('numero');
  protected readonly texto = signal('2026');
  protected readonly exemploAtual = computed(() => this.i.tr(TIPOS.find((t) => t.id === this.tipo())!, 'exemplo'));

  protected readonly resultado = computed<{ valor?: NumeroChines; erro?: string } | null>(() => {
    const texto = this.texto().trim();
    if (!texto) return null;
    switch (this.tipo()) {
      case 'preco': {
        const v = lerNumeroDigitado(texto);
        if (v === null || v > 99_999) return { erro: this.i.t('Digite um valor como 12,50 (até 99.999).', 'Type an amount like 12.50 (up to 99,999).') };
        return { valor: preco(v) };
      }
      case 'hora': {
        const m = /^(\d{1,2})\s*[:hH.]?\s*(\d{2})?$/.exec(texto);
        if (!m || Number(m[1]) > 24 || Number(m[2] ?? 0) > 59) return { erro: this.i.t('Digite uma hora como 8:30.', 'Type a time like 8:30.') };
        return { valor: hora(Number(m[1]), Number(m[2] ?? 0)) };
      }
      case 'telefone': {
        const d = texto.replace(/\D/g, '');
        return d ? { valor: digitoADigito(d, true) } : { erro: this.i.t('Digite os números do telefone.', 'Type the phone number digits.') };
      }
      case 'ano': {
        const a = Number(texto.replace(/\D/g, ''));
        return a > 0 && a < 10000 ? { valor: ano(a) } : { erro: this.i.t('Digite um ano como 1990.', 'Type a year like 1990.') };
      }
      default: {
        const v = lerNumeroDigitado(texto);
        if (v === null || !Number.isInteger(v)) return { erro: this.i.t('Digite um número inteiro (ex.: 2026).', 'Type a whole number (e.g. 2026).') };
        if (v > NUMERO_MAXIMO) return { erro: this.i.t('Digite um número até 99.999.999.', 'Type a number up to 99,999,999.') };
        return { valor: numero(v) };
      }
    }
  });

  protected mudarTipo(t: Tipo): void {
    this.tipo.set(t);
    this.texto.set(this.i.tr(TIPOS.find((x) => x.id === t)!, 'exemplo'));
  }

  protected aleatorio(): void {
    const t = TIPOS.find((x) => x.id === this.tipo())!;
    const alvo = sortearAlvo(t.categoria);
    this.texto.set(this.i.tr(alvo, 'exibicao').replace(/ yuans?$/, ''));
    setTimeout(() => this.falar());
  }

  protected falar(): void {
    const v = this.resultado()?.valor;
    if (v) void this.voz.falar(v.hanzi);
  }
}
