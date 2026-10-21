import { Injectable, inject } from '@angular/core';
import { LeituraService, hanziDaLinha, pinyinDaLinha } from '../../core/dados/leitura.service';
import { Frase, Palavra } from '../../core/dados/modelos';
import { analisarPinyin } from '../../core/pinyin/pinyin';
import { embaralhar, montarAlternativas, sortear } from '../../core/util/aleatorio';
import { ItemSessao } from './sessao.model';

let contador = 0;
const novoId = (p: string) => `${p}-frase-${++contador}`;

/**
 * Gera os exercícios com frases que entram no treino diário quando a pessoa já
 * conhece vocabulário suficiente: ditado, leitura e fala (shadowing).
 */
@Injectable({ providedIn: 'root' })
export class ItensDeFraseService {
  private readonly leitura = inject(LeituraService);

  carregar(): Promise<void> {
    return this.leitura.carregar();
  }

  gerar(conhecidas: Palavra[]): ItemSessao[] {
    const itens: ItemSessao[] = [];
    const exemplos: (Frase & { chave: string })[] = conhecidas
      .filter((p) => p.exemplo)
      .map((p) => ({ ...p.exemplo!, chave: p.id }));

    // Ditado: ouvir uma frase de exemplo e reconhecê-la entre outras
    if (exemplos.length >= 4) {
      const alvo = sortear(exemplos);
      const opcoes = montarAlternativas(alvo, exemplos, 4, (e) => e.hanzi);
      itens.push({
        id: novoId('ditado'),
        tipo: 'escolha',
        modulo: 'escuta',
        enunciado: 'Ouça a frase e escolha o que foi dito',
        enunciadoEn: 'Listen to the sentence and choose what was said',
        pergunta: { audio: alvo.hanzi },
        opcoes: opcoes.map((o) => ({ valor: o.chave, rotulo: o.hanzi, hanzi: true })),
        correta: alvo.chave,
        tons: analisarPinyin(alvo.pinyin).map((s) => s.tom),
        resposta: { hanzi: alvo.hanzi, pinyin: alvo.pinyin, traducao: alvo.traducao, traducaoEn: alvo.traducaoEn },
      });
    }

    // Leitura: entender uma linha de um diálogo ou historinha
    const linhas = this.leitura
      .textos()
      .filter((t) => t.nivel <= (conhecidas.length > 120 ? 2 : 1))
      .flatMap((t) =>
        t.linhas.map((l, i) => ({
          chave: `${t.id}:${i}`,
          hanzi: hanziDaLinha(l),
          pinyin: pinyinDaLinha(l),
          traducao: l.traducao,
          traducaoEn: l.traducaoEn,
        })),
      )
      .filter((l) => [...l.hanzi].length <= 18);
    if (linhas.length >= 4) {
      const alvo = sortear(linhas);
      const opcoes = montarAlternativas(alvo, embaralhar(linhas), 4, (l) => l.traducao);
      itens.push({
        id: novoId('leitura'),
        tipo: 'escolha',
        modulo: 'leitura',
        enunciado: 'Leia e escolha a tradução',
        enunciadoEn: 'Read and choose the translation',
        pergunta: { hanzi: alvo.hanzi, audio: alvo.hanzi },
        opcoes: opcoes.map((o) => ({ valor: o.chave, rotulo: o.traducao, rotuloEn: o.traducaoEn })),
        correta: alvo.chave,
        resposta: { hanzi: alvo.hanzi, pinyin: alvo.pinyin, traducao: alvo.traducao, traducaoEn: alvo.traducaoEn },
      });
    }

    // Fala: repetir uma frase (shadowing)
    if (exemplos.length) {
      const alvo = sortear(exemplos);
      itens.push({
        id: novoId('fala'),
        tipo: 'falar',
        frase: { hanzi: alvo.hanzi, pinyin: alvo.pinyin, traducao: alvo.traducao, traducaoEn: alvo.traducaoEn },
      });
    }

    return itens;
  }
}
