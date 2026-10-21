import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProgressoService } from '../../../core/progresso/progresso.service';

const SUGESTOES_QUANDO = ['Depois do café da manhã', 'No almoço', 'No ônibus/metrô', 'Depois do trabalho', 'Antes de dormir'];
const SUGESTOES_ONDE = ['na mesa da cozinha', 'no sofá', 'no transporte', 'no trabalho', 'no quarto'];

/**
 * "Meu plano": decidir de antemão QUANDO e ONDE estudar aumenta muito a chance de cumprir
 * (intenções de implementação — Gollwitzer, 1999, American Psychologist).
 */
@Component({
  selector: 'app-meu-plano',
  imports: [FormsModule, RouterLink],
  template: `
    <section class="cartao plano" aria-labelledby="titulo-plano">
      @if (plano() && !editando()) {
        <p class="rotulo" id="titulo-plano">📌 Meu plano</p>
        <p class="frase-plano">“{{ plano()!.quando }}, {{ plano()!.onde }}, eu faço o meu treino de mandarim.”</p>
        <button type="button" class="botao botao-texto pequeno" (click)="abrir()">mudar</button>
      } @else if (!plano() && !editando()) {
        <div class="convite">
          <p id="titulo-plano"><strong>📌 Quando e onde você vai estudar?</strong><br /><span class="suave pequeno">Um plano concreto ajuda a manter o hábito.</span></p>
          <button type="button" class="botao" (click)="abrir()">Definir</button>
        </div>
      } @else {
        <h2 id="titulo-plano">📌 Quando e onde você vai estudar?</h2>
        <p class="suave pequeno">
          Quem decide de antemão quando e onde vai fazer algo cumpre muito mais
          (<a routerLink="/metodo">veja o porquê</a>). Escolha um momento que já existe na sua rotina.
        </p>
        <form (submit)="$event.preventDefault(); salvar()">
          <label>
            Quando?
            <input class="campo" list="sugestoes-quando" [ngModel]="quando()" (ngModelChange)="quando.set($event)" name="quando" maxlength="60" placeholder="Ex.: Depois do café da manhã" />
          </label>
          <datalist id="sugestoes-quando">
            @for (s of sugestoesQuando; track s) {
              <option [value]="s"></option>
            }
          </datalist>
          <label>
            Onde?
            <input class="campo" list="sugestoes-onde" [ngModel]="onde()" (ngModelChange)="onde.set($event)" name="onde" maxlength="60" placeholder="Ex.: na mesa da cozinha" />
          </label>
          <datalist id="sugestoes-onde">
            @for (s of sugestoesOnde; track s) {
              <option [value]="s"></option>
            }
          </datalist>
          <div class="linha">
            <button type="submit" class="botao botao-primario" [disabled]="!quando().trim() || !onde().trim()">Salvar meu plano</button>
            <button type="button" class="botao botao-texto" (click)="editando.set(false)">Cancelar</button>
          </div>
        </form>
      }
    </section>
  `,
  styles: `
    .plano {
      margin-top: 12px;
    }
    .rotulo {
      font-size: 0.8rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--cor-primaria);
      margin: 0 0 4px;
    }
    .frase-plano {
      font-size: 1.05rem;
      font-weight: 600;
      margin: 0 0 4px;
    }
    form {
      display: grid;
      gap: 10px;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr));
    }
    form label {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    form .linha {
      grid-column: 1 / -1;
    }
    h2 {
      font-size: 1.1rem;
    }
    .convite {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }
    .convite p {
      margin: 0;
    }
  `,
})
export class MeuPlano {
  private readonly progresso = inject(ProgressoService);
  protected readonly sugestoesQuando = SUGESTOES_QUANDO;
  protected readonly sugestoesOnde = SUGESTOES_ONDE;
  protected readonly plano = computed(() => this.progresso.estado().plano ?? null);
  protected readonly editando = signal(false);
  protected readonly quando = signal('');
  protected readonly onde = signal('');

  protected abrir(): void {
    this.quando.set(this.plano()?.quando ?? '');
    this.onde.set(this.plano()?.onde ?? '');
    this.editando.set(true);
  }

  protected salvar(): void {
    const quando = this.quando().trim();
    const onde = this.onde().trim();
    if (!quando || !onde) return;
    this.progresso.definirPlano({ quando: quando.charAt(0).toUpperCase() + quando.slice(1), onde: onde.charAt(0).toLowerCase() + onde.slice(1) });
    this.editando.set(false);
  }
}
