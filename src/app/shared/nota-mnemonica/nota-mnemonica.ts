import { Component, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProgressoService } from '../../core/progresso/progresso.service';
import { IdiomaService } from '../../core/i18n/idioma.service';

/**
 * Dica pessoal para lembrar uma palavra (mnemônico). Associações criadas pela própria pessoa
 * — uma imagem, uma história, uma palavra em português com som parecido — ajudam a memorizar
 * (método da palavra-chave: Atkinson & Raugh, 1975).
 */
@Component({
  selector: 'app-nota-mnemonica',
  imports: [FormsModule],
  template: `
    @if (editando()) {
      <form class="editor" (submit)="$event.preventDefault(); salvar()">
        <label [for]="'nota-' + palavraId()">{{ i.t('Sua dica para lembrar', 'Your memory hint') }}</label>
        <textarea
          [id]="'nota-' + palavraId()"
          class="campo"
          rows="2"
          maxlength="300"
          [placeholder]="i.t(exemplo(), 'E.g.: 门 (door) looks like saloon doors; 妈 = woman (女) + the sound “ma” (马).')"
          [ngModel]="rascunho()"
          (ngModelChange)="rascunho.set($event)"
          name="nota"
        ></textarea>
        <div class="linha">
          <button type="submit" class="botao botao-primario">{{ i.t('Salvar', 'Save') }}</button>
          <button type="button" class="botao botao-texto" (click)="editando.set(false)">{{ i.t('Cancelar', 'Cancel') }}</button>
        </div>
      </form>
    } @else if (nota()) {
      <p class="nota">
        💡 <span>{{ nota() }}</span>
        <button type="button" class="botao botao-texto pequeno" (click)="abrir()">{{ i.t('editar', 'edit') }}</button>
      </p>
    } @else {
      <button type="button" class="botao botao-texto pequeno" (click)="abrir()">💡 {{ i.t('Criar uma dica para lembrar', 'Create a memory hint') }}</button>
    }
  `,
  styles: `
    :host {
      display: block;
    }
    .editor {
      display: flex;
      flex-direction: column;
      gap: 6px;
      text-align: left;
    }
    textarea {
      font-size: 1rem;
      resize: vertical;
    }
    .nota {
      margin: 0;
      padding: 8px 10px;
      border-radius: var(--raio-p);
      background: var(--cor-aviso-suave);
      color: var(--cor-texto);
      text-align: left;
    }
  `,
})
export class NotaMnemonica {
  protected readonly i = inject(IdiomaService);
  private readonly progresso = inject(ProgressoService);
  readonly palavraId = input.required<string>();
  /** texto de exemplo no campo vazio */
  readonly exemplo = input('Ex.: 门 (porta) parece uma porta de saloon; 妈 = mulher (女) + som "ma" (马).');

  protected readonly nota = computed(() => this.progresso.estado().notas?.[this.palavraId()] ?? '');
  protected readonly editando = signal(false);
  protected readonly rascunho = signal('');

  protected abrir(): void {
    this.rascunho.set(this.nota());
    this.editando.set(true);
  }

  protected salvar(): void {
    this.progresso.definirNota(this.palavraId(), this.rascunho());
    this.editando.set(false);
  }
}
