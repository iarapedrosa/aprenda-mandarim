import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { ArmazenamentoService } from '../armazenamento/armazenamento.service';
import {
  CartaoSrs,
  Nota,
  TipoCartao,
  cartoesVencidos,
  idCartao,
  novoCartao,
  revisarCartao,
} from '../srs/sm2';
import { DataISO, hoje } from '../util/datas';
import { melhorSequencia, sequenciaAtual } from './estatisticas';
import {
  AtividadeDia,
  Backup,
  ChaveTom,
  EstadoProgresso,
  LIMITES_METAS,
  METAS_PADRAO,
  METAS_PADRAO_ANTIGO,
  Metas,
  Modulo,
  Placar,
} from './progresso.model';

const CHAVE = 'progresso';
/** Preferências (fora do progresso) que também vão no backup. */
const CHAVES_PREFERENCIAS = ['tema', 'velocidade-voz', 'voz', 'variar-vozes'];

function estadoInicial(): EstadoProgresso {
  return {
    versao: 1,
    inicio: hoje(),
    metas: { ...METAS_PADRAO },
    atividade: {},
    porModulo: {},
    porTom: {},
    cartoes: {},
    licoesPinyin: {},
    textos: {},
  };
}

export function atividadeVazia(): AtividadeDia {
  return { exercicios: 0, acertos: 0, novas: 0, revisoes: 0, treinoConcluido: false, segundos: 0 };
}

function somar(placar: Placar | undefined, acertou: boolean): Placar {
  return { acertos: (placar?.acertos ?? 0) + (acertou ? 1 : 0), total: (placar?.total ?? 0) + 1 };
}

function metasNormalizadas(metas: Partial<Metas> | undefined): Metas {
  const m = { ...METAS_PADRAO, ...(metas ?? {}) };
  const eraPadraoAntigo =
    !m.personalizadas &&
    m.novasPorDia === METAS_PADRAO_ANTIGO.novasPorDia &&
    m.revisoesPorDia === METAS_PADRAO_ANTIGO.revisoesPorDia;
  return eraPadraoAntigo ? { ...METAS_PADRAO } : m;
}

/** Completa um estado lido (de versões antigas ou de um backup) com valores padrão. */
export function normalizarEstado(bruto: Partial<EstadoProgresso>): EstadoProgresso {
  const base = estadoInicial();
  const licoes = Array.isArray(bruto.licoesPinyin)
    ? Object.fromEntries((bruto.licoesPinyin as string[]).map((id) => [id, base.inicio]))
    : (bruto.licoesPinyin ?? {});
  const atividade = Object.fromEntries(
    Object.entries(bruto.atividade ?? {}).map(([d, a]) => [d, { ...atividadeVazia(), ...a }]),
  );
  return {
    ...base,
    ...bruto,
    versao: 1,
    metas: metasNormalizadas(bruto.metas),
    atividade,
    licoesPinyin: licoes,
    cartoes: bruto.cartoes ?? {},
    textos: bruto.textos ?? {},
    porModulo: bruto.porModulo ?? {},
    porTom: bruto.porTom ?? {},
  };
}

/**
 * Todo o progresso (repetição espaçada, estatísticas, atividade diária, lições),
 * salvo no localStorage. Pode ser exportado/importado em JSON como backup.
 */
@Injectable({ providedIn: 'root' })
export class ProgressoService {
  private readonly armazenamento = inject(ArmazenamentoService);

  readonly estado = signal<EstadoProgresso>(this.carregar());
  /** muda a cada hora cheia, para atualizar "hoje" após a meia-noite */
  private readonly relogio = signal(hoje());

  readonly hoje = computed(() => this.relogio());
  readonly metas = computed(() => this.estado().metas);
  readonly atividadeHoje = computed(() => this.estado().atividade[this.hoje()] ?? atividadeVazia());
  readonly licoesConcluidas = computed(() => new Set(Object.keys(this.estado().licoesPinyin)));
  readonly sequencia = computed(() => sequenciaAtual(this.estado().atividade, this.hoje()));
  readonly melhorSequencia = computed(() => melhorSequencia(this.estado().atividade));
  readonly cartoes = computed(() => Object.values(this.estado().cartoes));
  readonly vencidos = computed(() => cartoesVencidos(this.cartoes(), this.hoje()));
  /** palavras já estudadas (cartão revisado ao menos uma vez) */
  readonly palavrasEstudadas = computed(() =>
    this.cartoes().filter((c) => c.tipo === 'palavra' && c.revisoes > 0),
  );

  constructor() {
    effect(() => this.armazenamento.salvar(CHAVE, this.estado()));
    if (typeof window !== 'undefined') {
      setInterval(() => this.relogio.set(hoje()), 60_000);
      document.addEventListener('visibilitychange', () => this.relogio.set(hoje()));
    }
  }

  private carregar(): EstadoProgresso {
    const salvo = this.armazenamento.ler<Partial<EstadoProgresso> | null>(CHAVE, null);
    return salvo ? normalizarEstado(salvo) : estadoInicial();
  }

  // ------------------------------------------------------------------ atividade

  /** Registra o resultado de um exercício (alimenta streak, calendário e estatísticas). */
  registrarResposta(modulo: Modulo, acertou: boolean, tons?: number | number[]): void {
    this.estado.update((e) => {
      const dia = hoje();
      const atividade = e.atividade[dia] ?? atividadeVazia();
      const porTom = { ...e.porTom };
      for (const t of ([] as number[]).concat(tons ?? [])) {
        if (t >= 1 && t <= 5) porTom[String(t) as ChaveTom] = somar(porTom[String(t) as ChaveTom], acertou);
      }
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
      e.licoesPinyin[id] ? e : { ...e, licoesPinyin: { ...e.licoesPinyin, [id]: hoje() } },
    );
  }

  concluirTexto(id: string, acertos: number, total: number): void {
    this.estado.update((e) => ({ ...e, textos: { ...e.textos, [id]: { data: hoje(), acertos, total } } }));
  }

  definirMetas(metas: Partial<Metas>): void {
    const limitar = (v: number, l: { min: number; max: number }) =>
      Math.min(l.max, Math.max(l.min, Math.round(Number.isFinite(v) ? v : l.min)));
    this.estado.update((e) => ({
      ...e,
      metas: {
        personalizadas: true,
        novasPorDia: limitar(metas.novasPorDia ?? e.metas.novasPorDia, LIMITES_METAS.novasPorDia),
        revisoesPorDia: limitar(metas.revisoesPorDia ?? e.metas.revisoesPorDia, LIMITES_METAS.revisoesPorDia),
      },
    }));
  }

  // ------------------------------------------------------------------ repetição espaçada

  cartao(tipo: TipoCartao, ref: string): CartaoSrs | undefined {
    return this.estado().cartoes[idCartao(tipo, ref)];
  }

  /** Cria o cartão se ainda não existir. */
  adicionarCartao(tipo: TipoCartao, ref: string): CartaoSrs {
    const existente = this.cartao(tipo, ref);
    if (existente) return existente;
    const cartao = novoCartao(tipo, ref, hoje());
    this.estado.update((e) => ({ ...e, cartoes: { ...e.cartoes, [cartao.id]: cartao } }));
    return cartao;
  }

  /**
   * Aplica uma revisão SM-2. Só a primeira revisão do dia conta para o agendamento;
   * repetições no mesmo dia (reforço depois de errar) não mexem no intervalo.
   */
  revisar(tipo: TipoCartao, ref: string, nota: Nota): CartaoSrs {
    const dia = hoje();
    const atual = this.cartao(tipo, ref) ?? novoCartao(tipo, ref, dia);
    if (atual.ultimaRevisao === dia) return atual;
    const novo = atual.revisoes === 0;
    const revisado = revisarCartao(atual, nota, dia);
    this.estado.update((e) => ({ ...e, cartoes: { ...e.cartoes, [revisado.id]: revisado } }));
    this.atualizarDia((a) =>
      tipo === 'palavra' && novo ? { novas: a.novas + 1 } : novo ? {} : { revisoes: a.revisoes + 1 },
    );
    return revisado;
  }

  removerCartao(tipo: TipoCartao, ref: string): void {
    this.estado.update((e) => {
      const cartoes = { ...e.cartoes };
      delete cartoes[idCartao(tipo, ref)];
      return { ...e, cartoes };
    });
  }

  // ------------------------------------------------------------------ backup

  exportar(): Backup {
    const preferencias = Object.fromEntries(
      CHAVES_PREFERENCIAS.map((k) => [k, this.armazenamento.ler<unknown>(k, null)]).filter(([, v]) => v !== null),
    );
    return {
      app: 'aprenda-mandarim',
      versao: 1,
      exportadoEm: new Date().toISOString(),
      progresso: this.estado(),
      preferencias,
    };
  }

  /** Valida e aplica um backup. Lança erro com mensagem amigável se o arquivo for inválido. */
  importar(conteudo: unknown): void {
    const backup = conteudo as Partial<Backup> | null;
    if (!backup || typeof backup !== 'object' || backup.app !== 'aprenda-mandarim' || !backup.progresso) {
      throw new Error('Este arquivo não é um backup do Aprenda Mandarim.');
    }
    const p = backup.progresso as Partial<EstadoProgresso>;
    if (typeof p !== 'object' || (p.cartoes && typeof p.cartoes !== 'object')) {
      throw new Error('O backup está corrompido.');
    }
    this.estado.set(normalizarEstado(p));
    for (const [chave, valor] of Object.entries(backup.preferencias ?? {})) {
      if (CHAVES_PREFERENCIAS.includes(chave)) this.armazenamento.salvar(chave, valor);
    }
  }

  apagarTudo(): void {
    this.estado.set(estadoInicial());
  }
}
