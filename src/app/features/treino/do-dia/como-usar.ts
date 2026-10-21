import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

/** Explicação do site: o que é, como usar no dia a dia e sugestões. */
@Component({
  selector: 'app-como-usar',
  imports: [RouterLink],
  template: `
    <details class="cartao como-usar" [open]="aberto()">
      <summary><h2>👋 Como usar o site</h2></summary>

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
    </details>
  `,
  styles: `
    .como-usar {
      margin-top: 12px;
    }
    summary {
      cursor: pointer;
      list-style-position: outside;
    }
    summary h2 {
      display: inline;
      font-size: 1.15rem;
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
  /** aberto por padrão para quem está começando */
  readonly aberto = input(false);
}
