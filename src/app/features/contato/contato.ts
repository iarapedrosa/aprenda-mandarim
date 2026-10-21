import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IdiomaService } from '../../core/i18n/idioma.service';

/**
 * Chave pública do Web3Forms: só permite enviar mensagens para o email cadastrado nela
 * (o email da autora não aparece no site). Feita para ficar no código do navegador.
 */
const CHAVE_WEB3FORMS = '230d33e4-fb72-442e-aa21-a8fc75a7638e';
const ENDPOINT = 'https://api.web3forms.com/submit';

type Estado = 'editando' | 'enviando' | 'enviado' | 'erro';

/** Formulário de contato: a mensagem chega no email da autora via Web3Forms. */
@Component({
  selector: 'app-contato',
  imports: [FormsModule],
  template: `
    <section class="pagina">
      <header>
        <h1>{{ i.t('Fale comigo', 'Get in touch') }}</h1>
        <p class="subtitulo">
          {{
            i.t(
              'Dúvidas, sugestões, um erro de tradução ou um recurso legal para indicar? Escreva aqui — a mensagem chega direto para mim.',
              'Questions, suggestions, a translation mistake or a great resource to share? Write here — the message comes straight to me.'
            )
          }}
        </p>
      </header>

      @if (estado() === 'enviado') {
        <section class="cartao sucesso-envio" role="status">
          <h2>✅ {{ i.t('Mensagem enviada!', 'Message sent!') }}</h2>
          <p>{{ i.t('Obrigada por escrever. Vou responder no email que você informou.', 'Thanks for writing. I’ll reply to the email you provided.') }}</p>
          <button type="button" class="botao" (click)="novaMensagem()">{{ i.t('Escrever outra mensagem', 'Write another message') }}</button>
        </section>
      } @else {
        <form class="cartao formulario" (submit)="$event.preventDefault(); enviar()">
          <label>
            {{ i.t('Seu nome', 'Your name') }} <span class="suave pequeno">{{ i.t('(opcional)', '(optional)') }}</span>
            <input class="campo" name="nome" autocomplete="name" maxlength="100" [ngModel]="nome()" (ngModelChange)="nome.set($event)" />
          </label>
          <label>
            {{ i.t('Seu email', 'Your email') }}
            <input
              class="campo"
              type="email"
              name="email"
              autocomplete="email"
              required
              maxlength="200"
              [ngModel]="email()"
              (ngModelChange)="email.set($event)"
              [placeholder]="i.t('para eu poder responder', 'so I can reply')"
            />
          </label>
          <label>
            {{ i.t('Mensagem', 'Message') }}
            <textarea
              class="campo"
              name="mensagem"
              rows="6"
              required
              maxlength="5000"
              [ngModel]="mensagem()"
              (ngModelChange)="mensagem.set($event)"
            ></textarea>
          </label>
          <!-- armadilha para robôs: pessoas não veem nem preenchem este campo -->
          <input type="checkbox" name="botcheck" class="armadilha" tabindex="-1" aria-hidden="true" [ngModel]="robo()" (ngModelChange)="robo.set($event)" />

          @if (estado() === 'erro') {
            <p class="erro" role="alert">{{ erro() }}</p>
          }
          <button type="submit" class="botao botao-primario" [disabled]="!podeEnviar()">
            {{ estado() === 'enviando' ? i.t('Enviando…', 'Sending…') : i.t('Enviar mensagem', 'Send message') }}
          </button>
          <p class="suave pequeno">
            {{
              i.t(
                'Seu email é usado só para eu responder e não fica salvo neste site. O envio é feito pelo serviço Web3Forms.',
                'Your email is only used so I can reply and is not stored on this site. Messages are delivered by the Web3Forms service.'
              )
            }}
          </p>
        </form>
      }
    </section>
  `,
  styles: `
    .formulario {
      display: flex;
      flex-direction: column;
      gap: 14px;
      max-width: 640px;
    }
    label {
      display: flex;
      flex-direction: column;
      gap: 6px;
      font-weight: 600;
    }
    textarea.campo {
      resize: vertical;
      min-height: 140px;
      font: inherit;
    }
    .armadilha {
      position: absolute;
      left: -9999px;
    }
    .formulario .botao-primario {
      align-self: flex-start;
    }
    .formulario p,
    .sucesso-envio p {
      margin: 0;
    }
    .sucesso-envio {
      max-width: 640px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      align-items: flex-start;
    }
  `,
})
export class ContatoPagina {
  protected readonly i = inject(IdiomaService);
  protected readonly nome = signal('');
  protected readonly email = signal('');
  protected readonly mensagem = signal('');
  protected readonly robo = signal(false);
  protected readonly estado = signal<Estado>('editando');
  protected readonly erro = signal('');

  protected podeEnviar(): boolean {
    return this.estado() !== 'enviando' && /^\S+@\S+\.\S+$/.test(this.email().trim()) && this.mensagem().trim().length > 0;
  }

  protected async enviar(): Promise<void> {
    if (!this.podeEnviar()) return;
    if (!navigator.onLine) {
      this.falhar(this.i.t('Você está sem internet. Conecte-se e tente de novo — sua mensagem continua aqui.', 'You’re offline. Connect and try again — your message is still here.'));
      return;
    }
    this.estado.set('enviando');
    try {
      // FormData (e não JSON) para ser uma requisição "simples": o Web3Forms recusa a verificação prévia de CORS
      const corpo = new FormData();
      const campos: Record<string, string> = {
        access_key: CHAVE_WEB3FORMS,
        subject: `Aprenda Mandarim — mensagem de ${this.nome().trim() || this.email().trim()}`,
        from_name: 'Aprenda Mandarim',
        name: this.nome().trim() || '(sem nome)',
        email: this.email().trim(),
        message: this.mensagem().trim(),
        idioma: this.i.idioma(),
      };
      for (const [chave, valor] of Object.entries(campos)) corpo.append(chave, valor);
      if (this.robo()) corpo.append('botcheck', 'on');
      const resposta = await fetch(ENDPOINT, { method: 'POST', headers: { Accept: 'application/json' }, body: corpo });
      const dados = await resposta.json().catch(() => ({}));
      if (!resposta.ok || !dados.success) throw new Error(dados.message);
      this.estado.set('enviado');
      this.mensagem.set('');
    } catch {
      this.falhar(this.i.t('Não foi possível enviar agora. Tente de novo em alguns minutos.', 'Couldn’t send right now. Please try again in a few minutes.'));
    }
  }

  protected novaMensagem(): void {
    this.estado.set('editando');
  }

  private falhar(mensagem: string): void {
    this.erro.set(mensagem);
    this.estado.set('erro');
  }
}
