import { Injectable, inject, signal } from '@angular/core';
import { DadosService } from '../dados/dados.service';
import { Tom, silabaComAcento } from './pinyin';

/** sílaba → tom → caractere ("*" no fim = caractere raro) */
type MapaSilabas = Record<string, Partial<Record<'1' | '2' | '3' | '4', string>>>;

export interface SilabaTocavel {
  letras: string;
  tom: Tom;
  pinyin: string;
  caractere: string;
  raro: boolean;
}

/**
 * Como a voz sintetizada lê caracteres (e não pinyin), cada sílaba+tom é tocada
 * através de um caractere comum com essa pronúncia (ex.: mǎ → 马).
 */
@Injectable({ providedIn: 'root' })
export class SilabasService {
  private readonly dados = inject(DadosService);
  private mapa: MapaSilabas | null = null;
  readonly carregado = signal(false);

  async carregar(): Promise<void> {
    if (this.mapa) return;
    this.mapa = await this.dados.carregar<MapaSilabas>('pinyin/silabas.json');
    this.carregado.set(true);
  }

  existe(letras: string): boolean {
    return !!this.mapa?.[letras];
  }

  /** Tons disponíveis para a sílaba (1–4). */
  tons(letras: string): Tom[] {
    const t = this.mapa?.[letras];
    return t ? (Object.keys(t).map(Number) as Tom[]) : [];
  }

  obter(letras: string, tom: Tom): SilabaTocavel | null {
    if (tom === 5) return null;
    const valor = this.mapa?.[letras]?.[String(tom) as '1'];
    if (!valor) return null;
    const raro = valor.endsWith('*');
    return {
      letras,
      tom,
      pinyin: silabaComAcento(letras, tom),
      caractere: raro ? valor.slice(0, -1) : valor,
      raro,
    };
  }

  /** Sílabas (com caractere comum) que existem nos 4 tons — boas para pares mínimos. */
  comQuatroTons(): string[] {
    if (!this.mapa) return [];
    return Object.entries(this.mapa)
      .filter(([, t]) => ['1', '2', '3', '4'].every((k) => t[k as '1'] && !t[k as '1']!.endsWith('*')))
      .map(([s]) => s);
  }

  /** Todas as combinações tocáveis (sem caracteres raros). */
  todas(): SilabaTocavel[] {
    if (!this.mapa) return [];
    return Object.keys(this.mapa).flatMap((letras) =>
      this.tons(letras)
        .map((tom) => this.obter(letras, tom)!)
        .filter((s) => !s.raro),
    );
  }
}
