import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProgressoService } from '../../../core/progresso/progresso.service';
import { IdiomaService } from '../../../core/i18n/idioma.service';

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
        <p class="rotulo" id="titulo-plano">📌 {{ i.t('Meu plano', 'My plan') }}</p>
        <p class="frase-plano">“{{ plano()!.quando }}, {{ plano()!.onde }}, {{ i.t('eu faço o meu treino de mandarim.', 'I do my Mandarin training.') }}”</p>
        <button type="button" class="botao botao-texto pequeno" (click)="abrir()">{{ i.t('mudar', 'change') }}</button>
      } @else if (!plano() && !editando()) {
        <div class="convite">
          <p id="titulo-plano"><strong>📌 {{ i.t('Quando e onde você vai estudar?', 'When and where will you study?') }}</strong><br /><span class="suave pequeno">{{ i.t('Um plano concreto ajuda a manter o hábito.', 'A concrete plan helps you keep the habit.') }}</span></p>
          <button type="button" class="botao" (click)="abrir()">{{ i.t('Definir', 'Set up') }}</button>
        </div>
      } @else {
        <h2 id="titulo-plano">📌 {{ i.t('Quando e onde você vai estudar?', 'When and where will you study?') }}</h2>
        <p class="suave pequeno">
          {{ i.t('Quem decide de antemão quando e onde vai fazer algo cumpre muito mais', 'People who decide in advance when and where they will do something follow through much more') }}
          (<a routerLink="/metodo">{{ i.t('veja o porquê', 'see why') }}</a>). {{ i.t('Escolha um momento que já existe na sua rotina.', 'Pick a moment that already exists in your routine.') }}
        </p>
        <form (submit)="$event.preventDefault(); salvar()">
          <label>
            {{ i.t('Quando?', 'When?') }}
            <input class="campo" list="sugestoes-quando" [ngModel]="quando()" (ngModelChange)="quando.set($event)" name="quando" maxlength="60" [placeholder]="i.t('Ex.: Depois do café da manhã', 'E.g.: After breakfast')" />
          </label>
          <datalist id="sugestoes-quando">
            @for (s of i.ingles() ? sugestoesQuandoEn : sugestoesQuando; track s) {
              <option [value]="s"></option>
            }
          </datalist>
          <label>
            {{ i.t('Onde?', 'Where?') }}
            <input class="campo" list="sugestoes-onde" [ngModel]="onde()" (ngModelChange)="onde.set($event)" name="onde" maxlength="60" [placeholder]="i.t('Ex.: na mesa da cozinha', 'E.g.: at the kitchen table')" />
          </label>
          <datalist id="sugestoes-onde">
            @for (s of i.ingles() ? sugestoesOndeEn : sugestoesOnde; track s) {
              <option [value]="s"></option>
            }
          </datalist>
          <div class="linha">
            <button type="submit" class="botao botao-primario" [disabled]="!quando().trim() || !onde().trim()">{{ i.t('Salvar meu plano', 'Save my plan') }}</button>
            <button type="button" class="botao botao-texto" (click)="editando.set(false)">{{ i.t('Cancelar', 'Cancel') }}</button>
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
  protected readonly i = inject(IdiomaService);
  private readonly progresso = inject(ProgressoService);
  protected readonly sugestoesQuando = SUGESTOES_QUANDO;
  protected readonly sugestoesOnde = SUGESTOES_ONDE;
  protected readonly sugestoesQuandoEn = ['After breakfast', 'At lunch', 'On the bus/subway', 'After work', 'Before bed'];
  protected readonly sugestoesOndeEn = ['at the kitchen table', 'on the couch', 'on the commute', 'at work', 'in my room'];
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
