import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { ArmazenamentoService } from '../armazenamento/armazenamento.service';
import { DataISO, hoje } from '../util/datas';
import {
  AtividadeDia,
  ChaveTom,
  EstadoProgresso,
  METAS_PADRAO,
  Modulo,
  Placar,
} from './progresso.model';

const CHAVE = 'progresso';

function estadoInicial(): EstadoProgresso {
  return {
    versao: 1,
    inicio: hoje(),
    metas: { ...METAS_PADRAO },
    atividade: {},
    porModulo: {},
    porTom: {},
    licoesPinyin: [],
    textos: {},
  };
}

function atividadeVazia(): AtividadeDia {
  return { exercicios: 0, acertos: 0, novas: 0, revisoes: 0, treinoConcluido: false };
}

function somar(placar: Placar | undefined, acertou: boolean): Placar {
  return { acertos: (placar?.acertos ?? 0) + (acertou ? 1 : 0), total: (placar?.total ?? 0) + 1 };
}

/**
 * Todo o progresso da pessoa (estatísticas, atividade diária, lições), salvo no localStorage.
 */
@Injectable({ providedIn: 'root' })
export class ProgressoService {
  private readonly armazenamento = inject(ArmazenamentoService);

  readonly estado = signal<EstadoProgresso>(this.carregar());

  readonly metas = computed(() => this.estado().metas);
  readonly atividadeHoje = computed(() => this.estado().atividade[hoje()] ?? atividadeVazia());
  readonly licoesPinyin = computed(() => new Set(this.estado().licoesPinyin));

  constructor() {
    effect(() => this.armazenamento.salvar(CHAVE, this.estado()));
  }

  private carregar(): EstadoProgresso {
    const salvo = this.armazenamento.ler<Partial<EstadoProgresso> | null>(CHAVE, null);
    return { ...estadoInicial(), ...(salvo ?? {}) };
  }

  /** Registra o resultado de um exercício (alimenta streak, calendário e estatísticas). */
  registrarResposta(modulo: Modulo, acertou: boolean, tom?: number): void {
    this.estado.update((e) => {
      const dia = hoje();
      const atividade = e.atividade[dia] ?? atividadeVazia();
      const porTom =
        tom && tom >= 1 && tom <= 5
          ? { ...e.porTom, [String(tom)]: somar(e.porTom[String(tom) as ChaveTom], acertou) }
          : e.porTom;
      return {
        ...e,
        atividade: {
          ...e.atividade,
          [dia]: {
            ...atividade,
            exercicios: atividade.exercicios + 1,
            acertos: atividade.acertos + (acertou ? 1 : 0),
          },
        },
        porModulo: { ...e.porModulo, [modulo]: somar(e.porModulo[modulo], acertou) },
        porTom,
      };
    });
  }

  atualizarDia(mudanca: (a: AtividadeDia) => Partial<AtividadeDia>, dia: DataISO = hoje()): void {
    this.estado.update((e) => {
      const atual = e.atividade[dia] ?? atividadeVazia();
      return { ...e, atividade: { ...e.atividade, [dia]: { ...atual, ...mudanca(atual) } } };
    });
  }

  concluirLicaoPinyin(id: string): void {
    this.estado.update((e) =>
      e.licoesPinyin.includes(id) ? e : { ...e, licoesPinyin: [...e.licoesPinyin, id] },
    );
  }
}
