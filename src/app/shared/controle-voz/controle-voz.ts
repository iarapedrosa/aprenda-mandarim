import { Component, inject } from '@angular/core';
import { VozService } from '../../core/voz/voz.service';
import { IdiomaService } from '../../core/i18n/idioma.service';

/**
 * Seletor de velocidade da voz (lenta/normal) + avisos quando não há voz chinesa.
 */
@Component({
  selector: 'app-controle-voz',
  template: `
    @if (!voz.suportado) {
      <p class="aviso" role="status">
{{ i.t('Seu navegador não tem síntese de voz, então o áudio não vai tocar. Experimente o Chrome, Edge ou Safari atualizados.', 'Your browser has no speech synthesis, so audio won’t play. Try an up-to-date Chrome, Edge or Safari.') }}
      </p>
    } @else if (voz.semVozChinesa()) {
      <div class="aviso" role="status">
        <strong>{{ i.t('Nenhuma voz em chinês encontrada.', 'No Chinese voice found.') }}</strong> {{ i.t('O áudio pode sair com sotaque errado.', 'Audio may come out with the wrong accent.') }}
        <details>
          <summary>{{ i.t('Como instalar uma voz chinesa', 'How to install a Chinese voice') }}</summary>
          <ul>
            <li>
              <strong>iPhone/iPad:</strong> {{ i.t('Ajustes › Acessibilidade › Conteúdo Falado › Vozes › Chinês (China continental) e baixe uma voz (ex.: Tingting).', 'Settings › Accessibility › Spoken Content › Voices › Chinese (Mainland China), then download a voice (e.g. Tingting).') }}
            </li>
            <li>
              <strong>Android:</strong> {{ i.t('Configurações › Acessibilidade › Conversão de texto em voz › mecanismo do Google › instale “Chinês (Mandarim)”.', 'Settings › Accessibility › Text-to-speech › Google engine › install “Chinese (Mandarin)”.') }}
            </li>
            <li>
              <strong>Windows:</strong> {{ i.t('Configurações › Hora e idioma › Fala › Adicionar vozes › Chinês (simplificado).', 'Settings › Time & language › Speech › Add voices › Chinese (Simplified).') }}
            </li>
            <li>
              <strong>Mac:</strong> {{ i.t('Ajustes do Sistema › Acessibilidade › Conteúdo Falado › Voz do sistema › Gerenciar vozes › Chinês.', 'System Settings › Accessibility › Spoken Content › System voice › Manage voices › Chinese.') }}
            </li>
          </ul>
        </details>
      </div>
    }
    <div class="controle" role="group" [attr.aria-label]="i.t('Velocidade da voz', 'Voice speed')">
      <span class="rotulo"><span aria-hidden="true">🔊</span><span class="texto-rotulo"> {{ i.t('Velocidade:', 'Speed:') }}</span></span>
      <button
        type="button"
        [class.ativo]="voz.velocidade() === 'lenta'"
        [attr.aria-pressed]="voz.velocidade() === 'lenta'"
        (click)="voz.velocidade.set('lenta')"
      >
        {{ i.t('Lenta', 'Slow') }}
      </button>
      <button
        type="button"
        [class.ativo]="voz.velocidade() === 'normal'"
        [attr.aria-pressed]="voz.velocidade() === 'normal'"
        (click)="voz.velocidade.set('normal')"
      >
        {{ i.t('Normal', 'Normal') }}
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
    @media (max-width: 599px) {
      .texto-rotulo {
        display: none;
      }
      .rotulo {
        padding: 0 4px 0 6px;
      }
      button {
        min-height: 32px;
        padding: 2px 10px;
        font-size: 0.875rem;
      }
    }
  `,
})
export class ControleVoz {
  protected readonly i = inject(IdiomaService);
  protected readonly voz = inject(VozService);
}
