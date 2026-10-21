import { Component, inject } from '@angular/core';
import { VozService } from '../../core/voz/voz.service';

/**
 * Seletor de velocidade da voz (lenta/normal) + avisos quando não há voz chinesa.
 */
@Component({
  selector: 'app-controle-voz',
  template: `
    @if (!voz.suportado) {
      <p class="aviso" role="status">
        Seu navegador não tem síntese de voz, então o áudio não vai tocar. Experimente o Chrome,
        Edge ou Safari atualizados.
      </p>
    } @else if (voz.semVozChinesa()) {
      <div class="aviso" role="status">
        <strong>Nenhuma voz em chinês encontrada.</strong> O áudio pode sair com sotaque errado.
        <details>
          <summary>Como instalar uma voz chinesa</summary>
          <ul>
            <li>
              <strong>iPhone/iPad:</strong> Ajustes › Acessibilidade › Conteúdo Falado › Vozes ›
              Chinês (China continental) e baixe uma voz (ex.: Tingting).
            </li>
            <li>
              <strong>Android:</strong> Configurações › Acessibilidade › Conversão de texto em voz ›
              mecanismo do Google › instale "Chinês (Mandarim)".
            </li>
            <li>
              <strong>Windows:</strong> Configurações › Hora e idioma › Fala › Adicionar vozes ›
              Chinês (simplificado).
            </li>
            <li>
              <strong>Mac:</strong> Ajustes do Sistema › Acessibilidade › Conteúdo Falado › Voz do
              sistema › Gerenciar vozes › Chinês.
            </li>
          </ul>
        </details>
      </div>
    }
    <div class="controle" role="group" aria-label="Velocidade da voz">
      <span class="rotulo">Velocidade:</span>
      <button
        type="button"
        [class.ativo]="voz.velocidade() === 'lenta'"
        [attr.aria-pressed]="voz.velocidade() === 'lenta'"
        (click)="voz.velocidade.set('lenta')"
      >
        Lenta
      </button>
      <button
        type="button"
        [class.ativo]="voz.velocidade() === 'normal'"
        [attr.aria-pressed]="voz.velocidade() === 'normal'"
        (click)="voz.velocidade.set('normal')"
      >
        Normal
      </button>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .aviso {
      margin-bottom: 8px;
    }
    details {
      margin-top: 6px;
    }
    ul {
      margin: 6px 0 0;
      padding-left: 18px;
    }
    .controle {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px;
      border-radius: 999px;
      background: var(--cor-superficie-2);
      border: 1px solid var(--cor-borda);
    }
    .rotulo {
      padding: 0 8px;
      font-size: 0.875rem;
      color: var(--cor-texto-suave);
      font-weight: 600;
    }
    button {
      min-height: 36px;
      padding: 4px 14px;
      border: 0;
      border-radius: 999px;
      background: transparent;
      color: var(--cor-texto);
      font: inherit;
      font-weight: 600;
      cursor: pointer;
    }
    button.ativo {
      background: var(--cor-primaria);
      color: var(--cor-sobre-primaria);
    }
  `,
})
export class ControleVoz {
  protected readonly voz = inject(VozService);
}
