import { Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IdiomaService } from '../../../core/i18n/idioma.service';

/** Explicação do site: o que é, como usar no dia a dia e sugestões. */
@Component({
  selector: 'app-como-usar',
  imports: [RouterLink],
  template: `
    <details class="cartao como-usar" [class.destaque]="destaque()">
      <summary>
        <h2>
          @if (destaque()) {
            {{ i.t('👋 Novo por aqui? Veja como usar o site', '👋 New here? See how to use the site') }}
          } @else {
            {{ i.t('👋 Como usar o site', '👋 How to use the site') }}
          }
        </h2>
      </summary>

      @if (i.ingles()) {
        <p>
          <strong>Learn Mandarin</strong> is a free site to learn Mandarin from scratch. No sign-up needed: your
          progress is saved on this device (make a backup in <a routerLink="/progresso">Progress</a>). You can install
          it as an app and use it offline.
        </p>

        <h3>The path</h3>
        <ol>
          <li><strong>Pinyin and tones</strong> (first days): the sounds of Mandarin and its 4 melodies.</li>
          <li><strong>Words and characters</strong>: HSK 1 and 2 vocabulary, with spaced repetition.</li>
          <li><strong>Sentences</strong>: reading, listening, speaking and grammar with what you’ve learned.</li>
        </ol>
        <p class="suave pequeno">The site decides when to move on to the next stage — just follow Today’s training.</p>

        <h3>Day to day</h3>
        <ol>
          <li>
            <strong>Do Today’s training</strong> (15–20 min), ideally at the same time every day. It mixes everything
            and brings reviews at the right moment.
          </li>
          <li><strong>Read the phrase of the day out loud</strong> and, if you like, add it to your reviews.</li>
          <li>Extra time? Go to <a routerLink="/praticar">Practice</a>: flashcards, reading, listening, speaking…</li>
          <li>Outside the site, listen to and read things at your level — see <a routerLink="/recursos">Study resources</a>.</li>
        </ol>

        <h3>Tips that make a difference</h3>
        <ul>
          <li>🎧 <strong>Use headphones</strong> and <strong>always speak out loud</strong> — repeating is part of the training.</li>
          <li>✋ <strong>Draw the tone contour in the air</strong> with your hand while you repeat words.</li>
          <li>🧠 <strong>Try to remember before seeing the answer</strong>, even if you get it wrong: the effort is what makes it stick.</li>
          <li>💡 A word that won’t stick? <strong>Create a memory hint</strong> (an image, a little story).</li>
          <li>📅 <strong>Don’t break your streak</strong>: on a busy day, just do the start of the training — a little every day beats a lot once in a while.</li>
          <li>⏳ Be patient: a habit takes weeks or months to become automatic, and Mandarin is a marathon.</li>
          <li>⚙️ Adjust the pace in <a routerLink="/progresso">Progress</a> (new words per day, handwriting, voice).</li>
        </ul>

        <p class="pequeno">
          Curious why the site works this way? See <a routerLink="/metodo">The method and the science</a>, with the
          study references.
        </p>
      } @else {

      <p>
        O <strong>Aprenda Mandarim</strong> é um site gratuito para aprender mandarim do zero, em português. Não precisa
        de cadastro: o seu progresso fica salvo neste aparelho (faça backup em
        <a routerLink="/progresso">Progresso</a>). Dá para instalar como app e usar offline.
      </p>

      <h3>O caminho</h3>
      <ol>
        <li><strong>Pinyin e tons</strong> (primeiros dias): os sons do mandarim e as 4 melodias.</li>
        <li><strong>Palavras e caracteres</strong>: o vocabulário do HSK 1 e 2, com revisão espaçada.</li>
        <li><strong>Frases</strong>: leitura, escuta, fala e gramática com o que você já aprendeu.</li>
      </ol>
      <p class="suave pequeno">O site decide sozinho quando passar para a próxima etapa — é só seguir o Treino de hoje.</p>

      <h3>No dia a dia</h3>
      <ol>
        <li>
          <strong>Faça o Treino de hoje</strong> (15–20 min), de preferência sempre no mesmo horário. Ele mistura tudo e
          traz as revisões no momento certo.
        </li>
        <li><strong>Leia a frase do dia em voz alta</strong> e, se quiser, adicione à revisão.</li>
        <li>
          Sobrou tempo? Vá em <a routerLink="/praticar">Praticar</a>: cartões, leitura, escuta, fala, números,
          gramática…
        </li>
        <li>
          Fora do site, ouça e leia coisas no seu nível — veja <a routerLink="/recursos">Recursos para estudar</a>.
        </li>
      </ol>

      <h3>Dicas que fazem diferença</h3>
      <ul>
        <li>🎧 <strong>Use fones de ouvido</strong> e <strong>fale sempre em voz alta</strong> — repetir é parte do treino.</li>
        <li>✋ <strong>Desenhe a curva do tom no ar</strong> com a mão enquanto repete as palavras.</li>
        <li>🧠 <strong>Tente lembrar antes de ver a resposta</strong>, mesmo que erre: o esforço de lembrar é o que fixa.</li>
        <li>💡 Palavra que não entra na cabeça? <strong>Crie uma dica para lembrar</strong> (uma imagem, uma história).</li>
        <li>📅 <strong>Não quebre a sequência</strong>: num dia corrido, faça só o começo do treino — um pouco todo dia vale mais que muito de vez em quando.</li>
        <li>⏳ Paciência: um hábito leva semanas ou meses para ficar automático, e o mandarim é uma maratona.</li>
        <li>⚙️ Ajuste o ritmo em <a routerLink="/progresso">Progresso</a> (palavras novas por dia, escrita à mão, voz).</li>
      </ul>

      <p class="pequeno">
        Quer saber por que o site funciona assim? Veja <a routerLink="/metodo">O método e a ciência</a>, com as
        referências dos estudos.
      </p>
      }
    </details>
  `,
  styles: `
    .como-usar {
      margin-top: 12px;
    }
    .como-usar.destaque {
      border: 2px solid var(--cor-primaria);
      background: var(--cor-primaria-suave);
    }
    .como-usar.destaque[open] {
      background: var(--cor-superficie);
    }
    summary {
      cursor: pointer;
      list-style: none;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
    }
    summary::-webkit-details-marker {
      display: none;
    }
    summary::after {
      content: '▾';
      color: var(--cor-texto-suave);
      transition: transform 0.15s;
    }
    details[open] summary::after {
      transform: rotate(180deg);
    }
    summary h2 {
      display: inline;
      font-size: 1.1rem;
      margin: 0;
    }
    h3 {
      margin-top: 14px;
      font-size: 1rem;
    }
    ol,
    ul {
      padding-left: 20px;
      margin: 0 0 8px;
    }
    li {
      margin-bottom: 4px;
    }
  `,
})
export class ComoUsar {
  protected readonly i = inject(IdiomaService);
  /** chamada destacada para quem está começando */
  readonly destaque = input(false);
}
