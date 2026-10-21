import { Component } from '@angular/core';
import { BotaoAudio } from '../../shared/botao-audio/botao-audio';
import { PinyinColorido } from '../../shared/pinyin-colorido/pinyin-colorido';

interface Recurso {
  nome: string;
  url: string;
  tipo: string;
  descricao: string;
}

interface Fase {
  titulo: string;
  quando: string;
  foco: string;
  recursos: Recurso[];
}

@Component({
  selector: 'app-recursos',
  imports: [BotaoAudio, PinyinColorido],
  template: `
    <section class="pagina">
      <header>
        <h1>Recursos para estudar</h1>
        <p class="subtitulo">
          O site cuida da base: tons, vocabulário, revisão e hábito. Mas a gente aprende uma língua com
          <strong>muito input</strong> (ouvir e ler coisas que quase entendemos) e <strong>conversando</strong>. Aqui
          vai um roteiro do que usar fora daqui, fase por fase.
        </p>
      </header>

      <section class="cartao rotina">
        <h2>Uma rotina que funciona</h2>
        <ul>
          <li><strong>15–20 min</strong> de Treino de hoje (todo dia, mesmo nos dias corridos).</li>
          <li><strong>15–30 min</strong> de input: ouvir ou ler algo no seu nível (no ônibus, lavando louça…).</li>
          <li><strong>1–2× por semana</strong>, depois dos primeiros meses: 30 min de conversa.</li>
        </ul>
        <p class="suave pequeno">
          Expectativa realista: com essa rotina, em uns 6 meses você entende frases simples do dia a dia e se apresenta
          com tranquilidade. O mandarim é uma maratona — o segredo é não parar.
        </p>
      </section>

      @for (f of fases; track f.titulo) {
        <section class="cartao fase">
          <h2>{{ f.titulo }}</h2>
          <p class="quando">{{ f.quando }}</p>
          <p>{{ f.foco }}</p>
          <ul class="recursos">
            @for (r of f.recursos; track r.nome) {
              <li>
                <a [href]="r.url" target="_blank" rel="noopener noreferrer">{{ r.nome }}</a>
                <span class="etiqueta">{{ r.tipo }}</span>
                <p class="suave pequeno">{{ r.descricao }}</p>
              </li>
            }
          </ul>
        </section>
      }

      <section class="cartao conversa">
        <h2>Quando e como começar a conversar</h2>
        <ul>
          <li>
            <strong>Quando:</strong> depois de uns 2–3 meses (umas 150 palavras e as primeiras lições de gramática). Antes
            disso, foque em ouvir — mas não espere "estar pronta": conversar cedo destrava muito.
          </li>
          <li>
            <strong>Com quem:</strong> um(a) professor(a) particular para correção (italki, Preply) e intercâmbio
            gratuito com nativos que aprendem português (HelloTalk, Tandem).
          </li>
          <li>
            <strong>Como:</strong> aulas curtas de 30 min, com um tema preparado (apresentar-se, família, comida). Peça
            explicitamente que corrijam os seus <strong>tons</strong> — por educação, muita gente não corrige.
          </li>
          <li>
            <strong>Grave:</strong> com permissão, grave a aula e transforme as frases novas em cartões aqui no site.
          </li>
        </ul>
        <h3>Frases para usar na aula</h3>
        <ul class="frases">
          @for (f of frasesAula; track f.hanzi) {
            <li>
              <app-botao-audio [texto]="f.hanzi" [rotulo]="f.pinyin" [compacto]="true" />
              <span lang="zh-CN" class="hanzi">{{ f.hanzi }}</span>
              <app-pinyin [texto]="f.pinyin" />
              <span class="suave">{{ f.traducao }}</span>
            </li>
          }
        </ul>
      </section>

      <p class="suave pequeno nota">
        Os links levam a sites de terceiros; alguns têm partes pagas. Nenhum tem relação com este site. Achou um recurso
        ótimo? Conte para a autora pelo email no rodapé!
      </p>
    </section>
  `,
  styles: `
    h2 {
      margin-bottom: 4px;
    }
    .rotina ul,
    .conversa ul {
      padding-left: 20px;
    }
    .rotina li,
    .conversa li {
      margin-bottom: 6px;
    }
    .quando {
      font-weight: 700;
      color: var(--cor-primaria);
      margin-bottom: 6px;
    }
    .recursos {
      list-style: none;
      padding: 0;
      margin: 0;
      display: grid;
      gap: 10px;
      grid-template-columns: repeat(auto-fill, minmax(min(100%, 260px), 1fr));
    }
    .recursos li {
      padding: 10px 12px;
      border-radius: var(--raio-p);
      background: var(--cor-superficie-2);
    }
    .recursos a {
      font-weight: 700;
      margin-right: 6px;
    }
    .recursos p {
      margin: 4px 0 0;
    }
    .frases {
      list-style: none;
      padding: 0 !important;
      display: grid;
      gap: 8px;
    }
    .frases li {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
    }
    .frases .hanzi {
      font-size: 1.2rem;
    }
    .nota {
      margin-top: 16px;
    }
  `,
})
export class RecursosPagina {
  protected readonly fases: Fase[] = [
    {
      titulo: 'Fase 1 · Pinyin, tons e HSK 1',
      quando: 'Primeiros 2 meses',
      foco:
        'Ouvir muito, mesmo entendendo pouco, para acostumar o ouvido com os tons. Dicionário sempre à mão e o teclado chinês instalado no celular.',
      recursos: [
        { nome: 'Pleco', url: 'https://www.pleco.com', tipo: 'dicionário · app', descricao: 'O dicionário de chinês mais usado por estudantes. Grátis, com áudio e ordem dos traços.' },
        { nome: 'Du Chinese', url: 'https://www.duchinese.net', tipo: 'leitura · app', descricao: 'Textos curtos graduados por nível, com áudio de nativos e pinyin que aparece/some.' },
        { nome: 'Mandarin Corner', url: 'https://www.youtube.com/results?search_query=Mandarin+Corner', tipo: 'vídeo · YouTube', descricao: 'Vídeos com legendas em chinês, pinyin e inglês; há séries para iniciantes.' },
        { nome: 'HSK Standard Course 1', url: 'https://www.google.com/search?q=HSK+Standard+Course+1', tipo: 'livro', descricao: 'Livro-texto oficial do HSK, que segue o mesmo vocabulário deste site.' },
      ],
    },
    {
      titulo: 'Fase 2 · HSK 2 e primeiras leituras',
      quando: 'Do 3º ao 6º mês',
      foco:
        'Começar a ler histórias inteiras no seu nível (livros graduados) e a conversar. Releia e reouça o mesmo material várias vezes — repetição é ótima.',
      recursos: [
        { nome: 'Mandarin Companion', url: 'https://mandarincompanion.com', tipo: 'livros graduados', descricao: 'Livros com vocabulário controlado (nível "Breakthrough" ≈ 150 caracteres).' },
        { nome: 'Chinese Breeze', url: 'https://www.google.com/search?q=Chinese+Breeze+graded+reader', tipo: 'livros graduados', descricao: 'Coleção de leituras graduadas da Peking University Press, a partir de 300 palavras.' },
        { nome: 'italki', url: 'https://www.italki.com', tipo: 'aulas · conversa', descricao: 'Professores e tutores nativos para aulas de 30 min por vídeo.' },
        { nome: 'HelloTalk', url: 'https://www.hellotalk.com', tipo: 'intercâmbio · app', descricao: 'Converse por texto e áudio com chineses que aprendem português.' },
      ],
    },
    {
      titulo: 'Fase 3 · HSK 3 em diante',
      quando: 'A partir do 6º mês',
      foco:
        'Aumentar o volume: séries e vídeos com legenda em chinês, podcasts lentos e conversa semanal. Siga adicionando vocabulário (HSK 3) aqui no site.',
      recursos: [
        { nome: 'Tandem', url: 'https://www.tandem.net', tipo: 'intercâmbio · app', descricao: 'Parceiros de conversa nativos, por texto, áudio e vídeo.' },
        { nome: 'Anki', url: 'https://apps.ankiweb.net', tipo: 'revisão · app', descricao: 'Para criar seus próprios cartões com frases de aulas e séries (exporte os baralhos daqui em Cartões).' },
        { nome: 'Séries com legenda em chinês', url: 'https://www.youtube.com/results?search_query=中文字幕+电视剧', tipo: 'vídeo', descricao: 'Comece por séries leves do dia a dia; ative a legenda em chinês e use o Pleco.' },
      ],
    },
  ];

  protected readonly frasesAula = [
    { hanzi: '请再说一遍。', pinyin: 'Qǐng zài shuō yí biàn.', traducao: 'Repita, por favor.' },
    { hanzi: '请说慢一点儿。', pinyin: 'Qǐng shuō màn yìdiǎnr.', traducao: 'Fale mais devagar, por favor.' },
    { hanzi: '这个用中文怎么说？', pinyin: 'Zhège yòng Zhōngwén zěnme shuō?', traducao: 'Como se diz isto em chinês?' },
    { hanzi: '我的声调对吗？', pinyin: 'Wǒ de shēngdiào duì ma?', traducao: 'Meu tom está certo?' },
    { hanzi: '请帮我改一下。', pinyin: 'Qǐng bāng wǒ gǎi yíxià.', traducao: 'Por favor, me corrija.' },
  ];
}
