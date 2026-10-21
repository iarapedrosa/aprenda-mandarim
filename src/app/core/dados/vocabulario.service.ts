import { Injectable, computed, inject, signal } from '@angular/core';
import { Tom, analisarPinyin, silabaComAcento } from '../pinyin/pinyin';
import { DadosService } from './dados.service';
import { IndiceVocabulario, NivelVocabulario, Palavra, Radical } from './modelos';

/**
 * Vocabulário de todos os níveis listados em public/data/vocabulario/index.json.
 * Para adicionar o HSK 3, basta criar hsk3.json e registrá-lo no index.
 */
@Injectable({ providedIn: 'root' })
export class VocabularioService {
  private readonly dados = inject(DadosService);
  private carregamento: Promise<void> | null = null;

  readonly niveis = signal<NivelVocabulario[]>([]);
  readonly palavras = signal<Palavra[]>([]);
  readonly radicais = signal<Radical[]>([]);
  readonly carregado = signal(false);
  readonly erro = signal<string | null>(null);

  readonly porId = computed(() => new Map(this.palavras().map((p) => [p.id, p])));

  /** caractere → palavras em que aparece (na ordem do vocabulário) */
  readonly porCaractere = computed(() => {
    const mapa = new Map<string, Palavra[]>();
    for (const p of this.palavras()) {
      for (const c of caracteresDe(p.hanzi)) {
        const lista = mapa.get(c) ?? [];
        lista.push(p);
        mapa.set(c, lista);
      }
    }
    return mapa;
  });

  /** Palavras de um só caractere, indexadas pelo caractere (para mostrar significado do caractere). */
  readonly caractereIsolado = computed(() => {
    const mapa = new Map<string, Palavra>();
    for (const p of this.palavras()) if (caracteresDe(p.hanzi).length === 1) mapa.set(p.hanzi, p);
    return mapa;
  });

  /** Pinyin e significado de um caractere, a partir do vocabulário. */
  infoCaractere(c: string): InfoCaractere {
    const isolado = this.caractereIsolado().get(c);
    if (isolado) return { hanzi: c, pinyin: isolado.pinyin, traducao: isolado.traducao, palavra: isolado };
    const palavra = this.porCaractere().get(c)?.[0];
    if (!palavra) return { hanzi: c, pinyin: '', traducao: '' };
    return {
      hanzi: c,
      pinyin: pinyinDoCaractere(palavra.hanzi, palavra.pinyin, c) ?? '',
      traducao: `parte de ${palavra.hanzi} (${palavra.traducao})`,
      palavra,
    };
  }

  carregar(): Promise<void> {
    this.carregamento ??= (async () => {
      try {
        const [indice, radicais] = await Promise.all([
          this.dados.carregar<IndiceVocabulario>('vocabulario/index.json'),
          this.dados.carregar<Radical[]>('radicais.json'),
        ]);
        const listas = await Promise.all(
          indice.niveis.map((n) => this.dados.carregar<Palavra[]>(`vocabulario/${n.arquivo}`)),
        );
        this.niveis.set(indice.niveis);
        this.palavras.set(listas.flat());
        this.radicais.set(radicais);
        this.carregado.set(true);
      } catch (e) {
        this.carregamento = null;
        this.erro.set(e instanceof Error ? e.message : 'Erro ao carregar o vocabulário.');
      }
    })();
    return this.carregamento;
  }
}

/** Caracteres chineses de um texto (ignora pontuação e reticências). */
export function caracteresDe(texto: string): string[] {
  return [...texto].filter((c) => /\p{Script=Han}/u.test(c));
}

export interface InfoCaractere {
  hanzi: string;
  pinyin: string;
  traducao: string;
  palavra?: Palavra;
}

/** Pinyin de um caractere dentro de uma palavra (ex.: 京 em 北京 → jīng). */
export function pinyinDoCaractere(hanzi: string, pinyin: string, caractere: string): string | null {
  const silabas = analisarPinyin(pinyin);
  let cs = caracteresDe(hanzi);
  // erhua (哪儿 nǎr): o 儿 não tem sílaba própria; já em 女儿 (nǚ'ér) tem.
  if (cs.length !== silabas.length) cs = cs.filter((c) => c !== '儿');
  if (cs.length !== silabas.length) return null;
  const i = cs.indexOf(caractere);
  if (i < 0) return null;
  const s = silabas[i];
  const letras = s.letras !== 'er' && s.letras.endsWith('r') ? s.letras.slice(0, -1) : s.letras;
  return silabaComAcento(letras, s.tom as Tom);
}
