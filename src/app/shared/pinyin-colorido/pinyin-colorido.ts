import { Component, computed, input } from '@angular/core';
import { Tom, analisarPinyin, silabaComAcento } from '../../core/pinyin/pinyin';

interface Pedaco {
  texto: string;
  tom: Tom | null;
}

/** Divide um texto em pinyin em pedaços coloridos pelo tom de cada sílaba. */
export function colorirPinyin(texto: string): Pedaco[] {
  const pedacos: Pedaco[] = [];
  for (const parte of texto.split(/(\s+)/)) {
    if (!parte) continue;
    if (/^\s+$/.test(parte)) {
      pedacos.push({ texto: parte, tom: null });
      continue;
    }
    const [, antes, palavra, depois] = /^([^\p{L}]*)([\p{L}'’-]*)(.*)$/u.exec(parte) ?? ['', '', parte, ''];
    if (antes) pedacos.push({ texto: antes, tom: null });
    const silabas = palavra ? analisarPinyin(palavra) : [];
    const valido = silabas.length > 0 && silabas.every((s) => s.letras.length > 0);
    if (!valido) {
      if (palavra) pedacos.push({ texto: palavra, tom: null });
    } else {
      const maiuscula = /^\p{Lu}/u.test(palavra);
      const hifen = palavra.includes('-');
      silabas.forEach((s, i) => {
        let t = silabaComAcento(s.letras, s.tom);
        if (i === 0 && maiuscula) t = t.charAt(0).toUpperCase() + t.slice(1);
        if (i > 0 && /^[aeoāáǎàēéěèōóǒò]/.test(t)) t = (hifen ? '-' : "'") + t;
        else if (i > 0 && hifen) t = '-' + t;
        pedacos.push({ texto: t, tom: s.tom });
      });
    }
    if (depois) pedacos.push({ texto: depois, tom: null });
  }
  return pedacos;
}

/**
 * Mostra pinyin com cada sílaba colorida pelo tom (1 vermelho, 2 laranja, 3 verde, 4 azul, neutro cinza).
 */
@Component({
  selector: 'app-pinyin',
  template: `<span class="pinyin-colorido" [attr.lang]="'zh-Latn-pinyin'"
    >@for (p of pedacos(); track $index) {<span [class]="p.tom ? 'tom-' + p.tom : ''">{{ p.texto }}</span>}</span
  >`,
  styles: `
    .pinyin-colorido {
      font-weight: 600;
      white-space: pre-wrap;
    }
  `,
})
export class PinyinColorido {
  readonly texto = input.required<string>();
  protected readonly pedacos = computed(() => colorirPinyin(this.texto()));
}
