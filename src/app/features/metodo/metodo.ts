import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface Referencia {
  autores: string;
  ano: string;
  titulo: string;
  revista: string;
}

interface Principio {
  titulo: string;
  pesquisa: string;
  noSite: string;
  link?: { rota: string; rotulo: string };
  refs: Referencia[];
}

const R = {
  roediger2006: { autores: 'Roediger, H. L., & Karpicke, J. D.', ano: '2006', titulo: 'Test-enhanced learning: Taking memory tests improves long-term retention', revista: 'Psychological Science, 17(3), 249–255' },
  karpicke2008: { autores: 'Karpicke, J. D., & Roediger, H. L.', ano: '2008', titulo: 'The critical importance of retrieval for learning', revista: 'Science, 319(5865), 966–968' },
  dunlosky2013: { autores: 'Dunlosky, J., Rawson, K. A., Marsh, E. J., Nathan, M. J., & Willingham, D. T.', ano: '2013', titulo: "Improving students' learning with effective learning techniques", revista: 'Psychological Science in the Public Interest, 14(1), 4–58' },
  cepeda2006: { autores: 'Cepeda, N. J., Pashler, H., Vul, E., Wixted, J. T., & Rohrer, D.', ano: '2006', titulo: 'Distributed practice in verbal recall tasks: A review and quantitative synthesis', revista: 'Psychological Bulletin, 132(3), 354–380' },
  cepeda2008: { autores: 'Cepeda, N. J., Vul, E., Rohrer, D., Wixted, J. T., & Pashler, H.', ano: '2008', titulo: 'Spacing effects in learning: A temporal ridgeline of optimal retention', revista: 'Psychological Science, 19(11), 1095–1102' },
  kornell2008: { autores: 'Kornell, N., & Bjork, R. A.', ano: '2008', titulo: 'Learning concepts and categories: Is spacing the "enemy of induction"?', revista: 'Psychological Science, 19(6), 585–592' },
  logan1991: { autores: 'Logan, J. S., Lively, S. E., & Pisoni, D. B.', ano: '1991', titulo: 'Training Japanese listeners to identify English /r/ and /l/: A first report', revista: 'Journal of the Acoustical Society of America, 89(2), 874–886' },
  wang1999: { autores: 'Wang, Y., Spence, M. M., Jongman, A., & Sereno, J. A.', ano: '1999', titulo: 'Training American listeners to perceive Mandarin tones', revista: 'Journal of the Acoustical Society of America, 106(6), 3649–3658' },
  wang2003: { autores: 'Wang, Y., Jongman, A., & Sereno, J. A.', ano: '2003', titulo: 'Acoustic and perceptual evaluation of Mandarin tone productions before and after perceptual training', revista: 'Journal of the Acoustical Society of America, 113(2), 1033–1043' },
  hao2012: { autores: 'Hao, Y.-C.', ano: '2012', titulo: 'Second language acquisition of Mandarin Chinese tones by tonal and non-tonal language speakers', revista: 'Journal of Phonetics, 40(2), 269–279' },
  baills2019: { autores: 'Baills, F., Suárez-González, N., González-Fuente, S., & Prieto, P.', ano: '2019', titulo: 'Observing and producing pitch gestures facilitates the learning of Mandarin Chinese tones and words', revista: 'Studies in Second Language Acquisition, 41(1), 33–58' },
  guan2011: { autores: 'Guan, C. Q., Liu, Y., Chan, D. H. L., Ye, F., & Perfetti, C. A.', ano: '2011', titulo: 'Writing strengthens orthography and alphabetic-coding strengthens phonology in learning to read Chinese', revista: 'Journal of Educational Psychology, 103(3), 509–522' },
  hu2000: { autores: 'Hu, M., & Nation, I. S. P.', ano: '2000', titulo: 'Unknown vocabulary density and reading comprehension', revista: 'Reading in a Foreign Language, 13(1), 403–430' },
  norris2000: { autores: 'Norris, J. M., & Ortega, L.', ano: '2000', titulo: 'Effectiveness of L2 instruction: A research synthesis and quantitative meta-analysis', revista: 'Language Learning, 50(3), 417–528' },
  lyster2010: { autores: 'Lyster, R., & Saito, K.', ano: '2010', titulo: 'Oral feedback in classroom SLA: A meta-analysis', revista: 'Studies in Second Language Acquisition, 32(2), 265–302' },
  hamada2016: { autores: 'Hamada, Y.', ano: '2016', titulo: 'Shadowing: Who benefits and how? Uncovering a booming EFL teaching technique for listening comprehension', revista: 'Language Teaching Research, 20(1), 35–52' },
  atkinson1975: { autores: 'Atkinson, R. C., & Raugh, M. R.', ano: '1975', titulo: 'An application of the mnemonic keyword method to the acquisition of a Russian vocabulary', revista: 'Journal of Experimental Psychology: Human Learning and Memory, 1(2), 126–133' },
  gollwitzer1999: { autores: 'Gollwitzer, P. M.', ano: '1999', titulo: 'Implementation intentions: Strong effects of simple plans', revista: 'American Psychologist, 54(7), 493–503' },
  lally2010: { autores: 'Lally, P., van Jaarsveld, C. H. M., Potts, H. W. W., & Wardle, J.', ano: '2010', titulo: 'How are habits formed: Modelling habit formation in the real world', revista: 'European Journal of Social Psychology, 40(6), 998–1009' },
  richland2009: { autores: 'Richland, L. E., Kornell, N., & Kao, L. S.', ano: '2009', titulo: 'The pretesting effect: Do unsuccessful retrieval attempts enhance learning?', revista: 'Journal of Experimental Psychology: Applied, 15(3), 243–257' },
  ye2022: { autores: 'Ye, J., Su, J., & Cao, Y.', ano: '2022', titulo: 'A stochastic shortest path algorithm for optimizing spaced repetition scheduling', revista: 'Proceedings of the 28th ACM SIGKDD Conference (KDD ’22)' },
} satisfies Record<string, Referencia>;

@Component({
  selector: 'app-metodo',
  imports: [RouterLink],
  template: `
    <section class="pagina">
      <header>
        <h1>O método e a ciência</h1>
        <p class="subtitulo">
          Cada parte do site segue algum resultado da pesquisa sobre memória e aprendizagem de línguas, publicado em
          revistas científicas revisadas por pares. Aqui está o porquê de cada coisa.
        </p>
      </header>

      @for (p of principios; track p.titulo; let idx = $index) {
        <article class="cartao principio">
          <h2><span class="numero" aria-hidden="true">{{ idx + 1 }}</span> {{ p.titulo }}</h2>
          <p><strong>O que a pesquisa mostra:</strong> {{ p.pesquisa }}</p>
          <p><strong>Como o site usa:</strong> {{ p.noSite }}</p>
          @if (p.link) {
            <p><a [routerLink]="p.link.rota">{{ p.link.rotulo }} →</a></p>
          }
          <ul class="refs">
            @for (r of p.refs; track r.titulo) {
              <li>
                {{ r.autores }} ({{ r.ano }}).
                <a [href]="busca(r)" target="_blank" rel="noopener noreferrer">{{ r.titulo }}</a>.
                <em>{{ r.revista }}</em>.
              </li>
            }
          </ul>
        </article>
      }

      <article class="cartao">
        <h2>E para quem fala português?</h2>
        <p>
          Com honestidade: há <strong>pouca pesquisa em revistas de alto impacto</strong> sobre brasileiros aprendendo
          mandarim — a maioria dos estudos é com falantes de inglês, japonês ou coreano. Por isso, as dicas específicas
          para brasileiros (o sopro de p/t/k, "ti" que não vira "tchi", o x, o r, o ü, o "ao" que não é "ão") vêm de dois
          caminhos:
        </p>
        <ul>
          <li>
            <strong>Fonologia contrastiva:</strong> comparar os sons do português e do mandarim para prever onde a
            língua materna atrapalha — por exemplo, em português b/p diferem pela vibração da garganta; em mandarim, b/p
            diferem pelo sopro.
          </li>
          <li>
            <strong>Modelos de aprendizagem de sons de L2</strong> (o <em>Speech Learning Model</em>, de James Flege, e o
            <em>PAM-L2</em>, de Best &amp; Tyler): sons "parecidos" com os da língua materna são mais difíceis de
            aprender do que sons totalmente novos, porque o cérebro os encaixa na categoria antiga.
          </li>
        </ul>
        <p>Por isso a seção <a routerLink="/pinyin/armadilhas">Armadilhas para brasileiros</a> foca nos sons parecidos.</p>
      </article>

      <article class="cartao">
        <h2>O que ainda vamos melhorar</h2>
        <ul>
          <li>
            <strong>Tentar antes de aprender:</strong> tentar adivinhar o significado antes de ver a resposta, mesmo
            errando, melhora a retenção (Richland, Kornell &amp; Kao, 2009, <em>J. Exp. Psych.: Applied</em>).
          </li>
          <li>
            <strong>Agendamento mais preciso:</strong> o algoritmo FSRS, treinado em milhões de revisões, prevê o
            esquecimento melhor que o SM-2 (Ye, Su &amp; Cao, 2022, <em>KDD</em>).
          </li>
          <li><strong>Feedback visual da entonação</strong> ao falar, para comparar a sua curva de tom com a do modelo.</li>
        </ul>
      </article>

      <p class="suave pequeno">
        Os links abrem a busca do artigo no Google Acadêmico. Achou um erro ou conhece um estudo relevante? Escreva para
        o email do rodapé.
      </p>
    </section>
  `,
  styles: `
    .principio h2 {
      display: flex;
      gap: 10px;
      align-items: center;
      font-size: 1.15rem;
    }
    .numero {
      flex: none;
      display: inline-grid;
      place-items: center;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: var(--cor-primaria);
      color: var(--cor-sobre-primaria);
      font-size: 0.9rem;
    }
    .refs {
      margin: 8px 0 0;
      padding: 10px 12px 10px 28px;
      border-radius: var(--raio-p);
      background: var(--cor-superficie-2);
      font-size: 0.85rem;
      color: var(--cor-texto-suave);
    }
    .refs li + li {
      margin-top: 4px;
    }
  `,
})
export class MetodoPagina {
  protected readonly principios: Principio[] = [
    {
      titulo: 'Lembrar ativamente, e não só reler',
      pesquisa:
        'Tentar lembrar a resposta (fazer um teste) fixa muito mais do que reler o mesmo conteúdo. Em estudos clássicos, quem praticou recordação lembrou bem mais uma semana depois do que quem só releu.',
      noSite: 'Todo exercício pede a resposta antes de mostrá-la: escolher o significado, ouvir e reconhecer, digitar o pinyin, escrever o caractere, virar o cartão.',
      link: { rota: '/cartoes', rotulo: 'Ver os cartões' },
      refs: [R.roediger2006, R.karpicke2008, R.dunlosky2013],
    },
    {
      titulo: 'Espaçar as revisões no tempo',
      pesquisa:
        'Revisar em intervalos crescentes rende muito mais memória de longo prazo do que estudar tudo de uma vez. O melhor intervalo cresce conforme você quer lembrar por mais tempo.',
      noSite:
        'O algoritmo SM-2 marca cada palavra para o dia certo (1 dia, 6 dias, ~2 semanas…). As metas evitam acúmulo e o treino diário curto mantém a constância.',
      link: { rota: '/progresso', rotulo: 'Ver a previsão de revisões' },
      refs: [R.cepeda2006, R.cepeda2008, R.dunlosky2013],
    },
    {
      titulo: 'Misturar tipos de exercício',
      pesquisa: 'Intercalar itens e tipos de tarefa (em vez de treinar um bloco de cada vez) ajuda a perceber diferenças e a generalizar.',
      noSite: 'O Treino de hoje mistura tons, palavras, escrita, escuta, frases, números e gramática na mesma sessão.',
      link: { rota: '/', rotulo: 'Ir para o Treino de hoje' },
      refs: [R.kornell2008, R.dunlosky2013],
    },
    {
      titulo: 'Treinar a percepção dos tons com muitas vozes',
      pesquisa:
        'O treino de percepção com alta variabilidade (várias vozes e palavras) melhorou a identificação de sons novos e se generalizou para vozes novas. Com tons do mandarim, americanos treinados melhoraram a identificação — e também a própria pronúncia, sem treino de fala.',
      noSite:
        'Treino de tons, pares mínimos, as 20 combinações de dois tons e aquecimento diário; o áudio alterna entre as vozes de mandarim do aparelho.',
      link: { rota: '/pinyin/treino', rotulo: 'Treinar os tons' },
      refs: [R.logan1991, R.wang1999, R.wang2003],
    },
    {
      titulo: 'Focar na confusão 2º × 3º tom',
      pesquisa:
        'Para quem vem de língua não tonal, a confusão entre 2º e 3º tons (as duas curvas sobem) é a mais comum e pode durar até níveis avançados.',
      noSite: 'O site registra os tons que você confunde e passa a sortear mais esses tons; em Progresso você vê os seus pares mais difíceis.',
      link: { rota: '/progresso', rotulo: 'Ver meus tons mais confundidos' },
      refs: [R.hao2012],
    },
    {
      titulo: 'Usar as mãos para os tons',
      pesquisa:
        'Num experimento com 106 iniciantes, ver e fazer gestos que desenham a curva do tom melhorou a identificação dos tons e o aprendizado das palavras.',
      noSite: 'Depois de cada exercício de tom aparece a curva certa com a sugestão de desenhá-la no ar; a página dos tons ensina os gestos.',
      link: { rota: '/pinyin/tons', rotulo: 'Ver os gestos' },
      refs: [R.baills2019],
    },
    {
      titulo: 'Escrever à mão para os caracteres, digitar pinyin para o som',
      pesquisa:
        'Escrever caracteres à mão fortaleceu o reconhecimento e a ligação caractere-significado; digitar pinyin fortaleceu a ligação caractere-som. Os autores recomendam combinar os dois.',
      noSite: 'A escrita à mão entra de forma leve no treino e o exercício "Teclado chinês" treina o pinyin → caractere (como no celular).',
      link: { rota: '/escrita', rotulo: 'Praticar escrita e teclado' },
      refs: [R.guan2011],
    },
    {
      titulo: 'Ler textos em que você conhece quase tudo',
      pesquisa: 'Para entender bem um texto sem ajuda, é preciso conhecer cerca de 98% das palavras.',
      noSite: 'Textos graduados com pinyin e tradução opcionais; a Leitura mostra quantos % das palavras de cada texto você já estudou.',
      link: { rota: '/leitura', rotulo: 'Ir para a Leitura' },
      refs: [R.hu2000],
    },
    {
      titulo: 'Gramática explicada + prática',
      pesquisa: 'Uma meta-análise de dezenas de estudos mostrou que o ensino explícito (explicar a regra e praticar) é eficaz e seus efeitos duram.',
      noSite: 'Mini-lições curtas com estrutura, comparação com o português e exercícios, que entram aos poucos no treino; e o exercício "Monte a frase".',
      link: { rota: '/gramatica', rotulo: 'Ver a gramática' },
      refs: [R.norris2000],
    },
    {
      titulo: 'Correção imediata',
      pesquisa: 'Uma meta-análise sobre correção oral em sala de aula encontrou efeitos positivos e duradouros do feedback corretivo.',
      noSite: 'Cada resposta é corrigida na hora: sílaba por sílaba no ditado, traço a traço na escrita, caractere a caractere na fala.',
      refs: [R.lyster2010],
    },
    {
      titulo: 'Shadowing: ouvir e repetir em seguida',
      pesquisa: 'Repetir o áudio logo depois de ouvir (shadowing) ajudou especialmente aprendizes iniciantes a melhorar a compreensão oral.',
      noSite: 'O módulo Fala tem shadowing com frases do dia, exemplos e diálogos, e trava-línguas para sons difíceis.',
      link: { rota: '/fala', rotulo: 'Praticar a fala' },
      refs: [R.hamada2016],
    },
    {
      titulo: 'Mnemônicos: ligar o novo ao que você já sabe',
      pesquisa: 'Associar uma palavra nova a uma imagem ou a uma palavra conhecida de som parecido (método da palavra-chave) melhorou muito a memorização de vocabulário.',
      noSite: 'Cada palavra pode ter a sua "dica para lembrar" (💡), que aparece no treino e nos cartões; os radicais dão pistas de significado.',
      link: { rota: '/caracteres/radicais', rotulo: 'Ver os radicais' },
      refs: [R.atkinson1975],
    },
    {
      titulo: 'Hábito: plano concreto e paciência',
      pesquisa:
        'Decidir de antemão quando e onde fazer algo ("intenção de implementação") aumenta muito a chance de cumprir. E um hábito leva tempo para ficar automático: num estudo, a mediana foi de 66 dias, com grande variação entre pessoas.',
      noSite: 'O "Meu plano" na página inicial, a sequência de dias e um treino curto o bastante para caber em qualquer dia.',
      link: { rota: '/', rotulo: 'Definir meu plano' },
      refs: [R.gollwitzer1999, R.lally2010],
    },
  ];

  protected busca(r: Referencia): string {
    return `https://scholar.google.com/scholar?q=${encodeURIComponent(`"${r.titulo}"`)}`;
  }

}
