import { Component, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProgressoService } from '../../core/progresso/progresso.service';

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
        <label [for]="'nota-' + palavraId()">Sua dica para lembrar</label>
        <textarea
          [id]="'nota-' + palavraId()"
          class="campo"
          rows="2"
          maxlength="300"
          [placeholder]="exemplo()"
          [ngModel]="rascunho()"
          (ngModelChange)="rascunho.set($event)"
          name="nota"
        ></textarea>
        <div class="linha">
          <button type="submit" class="botao botao-primario">Salvar</button>
          <button type="button" class="botao botao-texto" (click)="editando.set(false)">Cancelar</button>
        </div>
      </form>
    } @else if (nota()) {
      <p class="nota">
        💡 <span>{{ nota() }}</span>
        <button type="button" class="botao botao-texto pequeno" (click)="abrir()">editar</button>
      </p>
    } @else {
      <button type="button" class="botao botao-texto pequeno" (click)="abrir()">💡 Criar uma dica para lembrar</button>
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
