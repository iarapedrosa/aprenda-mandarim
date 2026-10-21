import { ExercicioGramatica, LicaoGramatica } from '../../core/dados/gramatica.service';
import { embaralhar } from '../../core/util/aleatorio';
import { ItemEscolha } from './sessao.model';

let contador = 0;

/** Converte um exercício de gramática em item de múltipla escolha (com opções embaralhadas). */
export function exercicioDeGramatica(licao: LicaoGramatica, ex: ExercicioGramatica): ItemEscolha {
  const opcoes = ex.opcoes.map((texto, i) => ({ texto, i }));
  const temHanzi = ex.opcoes.every((o) => /\p{Script=Han}/u.test(o));
  return {
    id: `gram-${licao.id}-${++contador}`,
    tipo: 'escolha',
    modulo: 'gramatica',
    enunciado: ex.pergunta,
    enunciadoEn: ex.perguntaEn,
    pergunta: ex.frase ? { hanzi: ex.frase } : {},
    opcoes: embaralhar(opcoes).map((o) => ({ valor: String(o.i), rotulo: o.texto, hanzi: temHanzi })),
    correta: String(ex.correta),
    explicacao: ex.explicacao,
    explicacaoEn: ex.explicacaoEn,
    licao: `gramatica:${licao.id}`,
  };
}

export function itensDaLicaoGramatica(licao: LicaoGramatica): ItemEscolha[] {
  return licao.exercicios.map((ex) => exercicioDeGramatica(licao, ex));
}
