import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { taxa } from '../../core/progresso/estatisticas';
import { confusoesFrequentes } from '../../core/progresso/tons-dificeis';
import { LIMITES_METAS, Modulo, NOMES_MODULOS } from '../../core/progresso/progresso.model';
import { ProgressoService } from '../../core/progresso/progresso.service';
import { estagio } from '../../core/srs/sm2';
import { PreferenciaTema, TemaService } from '../../core/tema/tema.service';
import { DataISO, deDataISO, somarDias } from '../../core/util/datas';
import { VozService } from '../../core/voz/voz.service';

const SEMANAS = 18;
const NOMES_TONS: Record<string, string> = { '1': '1º tom', '2': '2º tom', '3': '3º tom', '4': '4º tom', '5': 'Neutro' };
const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

@Component({
  selector: 'app-progresso',
  imports: [FormsModule, RouterLink],
  templateUrl: './progresso.html',
  styleUrl: './progresso.css',
})
export class ProgressoPagina {
  protected readonly progresso = inject(ProgressoService);
  protected readonly tema = inject(TemaService);
  protected readonly voz = inject(VozService);
  protected readonly limites = LIMITES_METAS;

  // ------------------------------------------------------------------ resumo
  protected readonly diasPraticados = computed(
    () => Object.values(this.progresso.estado().atividade).filter((a) => a.exercicios > 0).length,
  );
  protected readonly minutosTotais = computed(() =>
    Math.round(Object.values(this.progresso.estado().atividade).reduce((t, a) => t + (a.segundos ?? 0), 0) / 60),
  );
  protected readonly contagem = computed(() => {
    const c = { estudadas: 0, dominadas: 0, caracteres: 0, frases: 0 };
    for (const cartao of this.progresso.cartoes()) {
      if (cartao.revisoes === 0) continue;
      if (cartao.tipo === 'palavra') {
        c.estudadas++;
        if (estagio(cartao) === 'maduro') c.dominadas++;
      } else if (cartao.tipo === 'escrita') c.caracteres++;
      else c.frases++;
    }
    return c;
  });

  // ------------------------------------------------------------------ calendário
  protected readonly calendario = computed(() => {
    const hoje = this.progresso.hoje();
    const atividade = this.progresso.estado().atividade;
    const diaSemana = (deDataISO(hoje).getDay() + 6) % 7; // segunda = 0
    const inicio = somarDias(hoje, -(SEMANAS - 1) * 7 - diaSemana);
    const semanas: { dias: { data: DataISO; nivel: number; rotulo: string; futuro: boolean }[]; mes: string }[] = [];
    for (let s = 0; s < SEMANAS; s++) {
      const dias = [];
      for (let d = 0; d < 7; d++) {
        const data = somarDias(inicio, s * 7 + d);
        const n = atividade[data]?.exercicios ?? 0;
        const nivel = n === 0 ? 0 : n < 10 ? 1 : n < 30 ? 2 : n < 60 ? 3 : 4;
        const [a, m, dd] = data.split('-');
        dias.push({ data, nivel, futuro: data > hoje, rotulo: `${dd}/${m}/${a}: ${n} exercício(s)` });
      }
      const primeiro = deDataISO(dias[0].data);
      const mes = s === 0 || primeiro.getDate() <= 7 ? MESES[primeiro.getMonth()] : '';
      semanas.push({ dias, mes });
    }
    return semanas;
  });

  // ------------------------------------------------------------------ taxas
  protected readonly porModulo = computed(() =>
    (Object.keys(NOMES_MODULOS) as Modulo[]).map((m) => {
      const p = this.progresso.estado().porModulo[m];
      return { nome: NOMES_MODULOS[m], total: p?.total ?? 0, taxa: taxa(p?.acertos ?? 0, p?.total ?? 0) };
    }),
  );
  protected readonly porTom = computed(() =>
    ['1', '2', '3', '4', '5'].map((t) => {
      const p = this.progresso.estado().porTom[t as '1'];
      return { tom: t, nome: NOMES_TONS[t], total: p?.total ?? 0, taxa: taxa(p?.acertos ?? 0, p?.total ?? 0) };
    }),
  );

  /** Pares de tons mais confundidos (o treino passa a sortear mais esses tons). */
  protected readonly confusoes = computed(() => confusoesFrequentes(this.progresso.estado().confusaoTons ?? {}));
  protected nomeTom(t: number): string {
    return t === 5 ? 'neutro' : `${t}º`;
  }

  /** Revisões previstas para os próximos 7 dias. */
  protected readonly previsao = computed(() => {
    const hoje = this.progresso.hoje();
    const dias = Array.from({ length: 7 }, (_, i) => somarDias(hoje, i));
    const cont = dias.map((d, i) =>
      this.progresso.cartoes().filter((c) => c.revisoes > 0 && (i === 0 ? c.vencimento <= d : c.vencimento === d)).length,
    );
    const max = Math.max(1, ...cont);
    return dias.map((d, i) => ({
      rotulo: i === 0 ? 'hoje' : ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'][deDataISO(d).getDay()],
      total: cont[i],
      altura: (cont[i] / max) * 100,
    }));
  });

  // ------------------------------------------------------------------ backup
  protected readonly mensagemBackup = signal<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);
  protected readonly backupPendente = signal<{ conteudo: unknown; resumo: string } | null>(null);
  protected readonly confirmarApagar = signal(false);

  protected definirMeta(campo: 'novasPorDia' | 'revisoesPorDia', valor: number | string): void {
    const numero = Number(valor);
    if (Number.isFinite(numero)) this.progresso.definirMetas({ [campo]: numero });
  }

  protected exportar(): void {
    const dados = JSON.stringify(this.progresso.exportar(), null, 2);
    const url = URL.createObjectURL(new Blob([dados], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `aprenda-mandarim-backup-${this.progresso.hoje()}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    this.mensagemBackup.set({ tipo: 'sucesso', texto: 'Backup baixado. Guarde o arquivo em um lugar seguro (ex.: Google Drive).' });
  }

  protected async escolherArquivo(evento: Event): Promise<void> {
    const entrada = evento.target as HTMLInputElement;
    const arquivo = entrada.files?.[0];
    entrada.value = '';
    if (!arquivo) return;
    try {
      const conteudo = JSON.parse(await arquivo.text());
      const p = conteudo?.progresso;
      if (conteudo?.app !== 'aprenda-mandarim' || !p) throw new Error('Este arquivo não é um backup do Aprenda Mandarim.');
      const cartoes = Object.keys(p.cartoes ?? {}).length;
      const dias = Object.keys(p.atividade ?? {}).length;
      const data = conteudo.exportadoEm ? new Date(conteudo.exportadoEm).toLocaleDateString('pt-BR') : '?';
      this.backupPendente.set({ conteudo, resumo: `Backup de ${data}: ${cartoes} cartões de revisão e ${dias} dias de atividade.` });
      this.mensagemBackup.set(null);
    } catch (e) {
      this.mensagemBackup.set({
        tipo: 'erro',
        texto: e instanceof SyntaxError ? 'O arquivo não é um JSON válido.' : (e as Error).message,
      });
    }
  }

  protected confirmarImportacao(): void {
    const pendente = this.backupPendente();
    if (!pendente) return;
    try {
      this.progresso.importar(pendente.conteudo);
      this.mensagemBackup.set({ tipo: 'sucesso', texto: 'Progresso restaurado com sucesso!' });
    } catch (e) {
      this.mensagemBackup.set({ tipo: 'erro', texto: (e as Error).message });
    }
    this.backupPendente.set(null);
  }

  protected apagar(): void {
    this.progresso.apagarTudo();
    this.confirmarApagar.set(false);
    this.mensagemBackup.set({ tipo: 'sucesso', texto: 'Progresso apagado. Um novo começo!' });
  }

  protected mudarTema(valor: PreferenciaTema): void {
    this.tema.preferencia.set(valor);
  }

  protected testarVoz(): void {
    void this.voz.falar('你好，欢迎学习中文！');
  }
}
