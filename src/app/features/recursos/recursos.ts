import { Component, inject } from '@angular/core';
import { BotaoAudio } from '../../shared/botao-audio/botao-audio';
import { PinyinColorido } from '../../shared/pinyin-colorido/pinyin-colorido';
import { IdiomaService } from '../../core/i18n/idioma.service';

interface Recurso {
  nome: string;
  nomeEn?: string;
  url: string;
  tipo: string;
  descricao: string;
  tipoEn: string;
  descricaoEn: string;
}

interface Fase {
  titulo: string;
  quando: string;
  foco: string;
  tituloEn: string;
  quandoEn: string;
  focoEn: string;
  recursos: Recurso[];
}

@Component({
  selector: 'app-recursos',
  imports: [BotaoAudio, PinyinColorido],
  template: `
    <section class="pagina">
      <header>
        <h1>{{ i.t('Recursos para estudar', 'Study resources') }}</h1>
        <p class="subtitulo">
          @if (i.ingles()) {
            This site covers the basics: tones, vocabulary, review and habit. But we learn a language through
            <strong>lots of input</strong> (listening to and reading things we almost understand) and <strong>by talking</strong>.
            Here is a roadmap of what to use outside this site, phase by phase.
          } @else {
            O site cuida da base: tons, vocabulário, revisão e hábito. Mas a gente aprende uma língua com
            <strong>muito input</strong> (ouvir e ler coisas que quase entendemos) e <strong>conversando</strong>. Aqui
            vai um roteiro do que usar fora daqui, fase por fase.
          }
        </p>
      </header>

      <section class="cartao rotina">
        <h2>{{ i.t('Uma rotina que funciona', 'A routine that works') }}</h2>
        <ul>
          <li><strong>15–20 min</strong> {{ i.t('de Treino de hoje (todo dia, mesmo nos dias corridos).', 'of Today’s training (every day, even on busy days).') }}</li>
          <li><strong>15–30 min</strong> {{ i.t('de input: ouvir ou ler algo no seu nível (no ônibus, lavando louça…).', 'of input: listen to or read something at your level (on the bus, doing the dishes…).') }}</li>
          <li><strong>{{ i.t('1–2× por semana', '1–2× a week') }}</strong>{{ i.t(', depois dos primeiros meses: 30 min de conversa.', ', after the first months: 30 min of conversation.') }}</li>
        </ul>
        <p class="suave pequeno">
          {{ i.t('Expectativa realista: com essa rotina, em uns 6 meses você entende frases simples do dia a dia e se apresenta com tranquilidade. O mandarim é uma maratona — o segredo é não parar.', 'Realistic expectation: with this routine, in about 6 months you understand simple everyday sentences and can introduce yourself comfortably. Mandarin is a marathon — the secret is not stopping.') }}
        </p>
      </section>

      @for (f of fases; track f.titulo) {
        <section class="cartao fase">
          <h2>{{ i.tr(f, 'titulo') }}</h2>
          <p class="quando">{{ i.tr(f, 'quando') }}</p>
          <p>{{ i.tr(f, 'foco') }}</p>
          <ul class="recursos">
            @for (r of f.recursos; track r.nome) {
              <li>
                <a [href]="r.url" target="_blank" rel="noopener noreferrer">{{ i.tr(r, 'nome') }}</a>
                <span class="etiqueta">{{ i.tr(r, 'tipo') }}</span>
                <p class="suave pequeno">{{ i.tr(r, 'descricao') }}</p>
              </li>
            }
          </ul>
        </section>
      }

      <section class="cartao conversa">
        <h2>{{ i.t('Quando e como começar a conversar', 'When and how to start talking') }}</h2>
        @if (i.ingles()) {
          <ul>
            <li>
              <strong>When:</strong> after about 2–3 months (around 150 words and the first grammar lessons). Before
              that, focus on listening — but don’t wait to "be ready": talking early unlocks a lot.
            </li>
            <li>
              <strong>With whom:</strong> a private tutor for corrections (italki, Preply) and free exchanges with
              native speakers learning English (HelloTalk, Tandem).
            </li>
            <li>
              <strong>How:</strong> short 30-minute lessons with a prepared topic (introducing yourself, family, food).
              Explicitly ask them to correct your <strong>tones</strong> — out of politeness, many people won’t.
            </li>
            <li>
              <strong>Record:</strong> with permission, record the lesson and turn new sentences into cards here on the site.
            </li>
          </ul>
        } @else {
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
        }
        <h3>{{ i.t('Frases para usar na aula', 'Phrases to use in class') }}</h3>
        <ul class="frases">
          @for (f of frasesAula; track f.hanzi) {
            <li>
              <app-botao-audio [texto]="f.hanzi" [rotulo]="f.pinyin" [compacto]="true" />
              <span lang="zh-CN" class="hanzi">{{ f.hanzi }}</span>
              <app-pinyin [texto]="f.pinyin" />
              <span class="suave">{{ i.tr(f, 'traducao') }}</span>
            </li>
          }
        </ul>
      </section>

      <p class="suave pequeno nota">
        {{ i.t('Os links levam a sites de terceiros; alguns têm partes pagas. Nenhum tem relação com este site. Achou um recurso ótimo? Conte para a autora pelo email no rodapé!', 'Links go to third-party sites; some have paid parts. None is affiliated with this site. Found a great resource? Tell the author via the email in the footer!') }}
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
  protected readonly i = inject(IdiomaService);
  protected readonly fases: Fase[] = [
    {
      titulo: 'Fase 1 · Pinyin, tons e HSK 1',
      quando: 'Primeiros 2 meses',
      tituloEn: 'Phase 1 · Pinyin, tones and HSK 1',
      quandoEn: 'First 2 months',
      focoEn:
        'Listen a lot, even understanding little, to get your ear used to tones. Keep a dictionary at hand and install the Chinese keyboard on your phone.',
      foco:
        'Ouvir muito, mesmo entendendo pouco, para acostumar o ouvido com os tons. Dicionário sempre à mão e o teclado chinês instalado no celular.',
      recursos: [
        { nome: 'Pleco', url: 'https://www.pleco.com', tipo: 'dicionário · app', tipoEn: 'dictionary · app', descricao: 'O dicionário de chinês mais usado por estudantes. Grátis, com áudio e ordem dos traços.', descricaoEn: 'The Chinese dictionary most used by learners. Free, with audio and stroke order.' },
        { nome: 'Du Chinese', url: 'https://www.duchinese.net', tipo: 'leitura · app', tipoEn: 'reading · app', descricao: 'Textos curtos graduados por nível, com áudio de nativos e pinyin que aparece/some.', descricaoEn: 'Short texts graded by level, with native audio and pinyin you can toggle.' },
        { nome: 'Mandarin Corner', url: 'https://www.youtube.com/results?search_query=Mandarin+Corner', tipo: 'vídeo · YouTube', tipoEn: 'video · YouTube', descricao: 'Vídeos com legendas em chinês, pinyin e inglês; há séries para iniciantes.', descricaoEn: 'Videos with Chinese, pinyin and English subtitles; there are beginner series.' },
        { nome: 'HSK Standard Course 1', url: 'https://www.google.com/search?q=HSK+Standard+Course+1', tipo: 'livro', tipoEn: 'book', descricao: 'Livro-texto oficial do HSK, que segue o mesmo vocabulário deste site.', descricaoEn: 'The official HSK textbook, following the same vocabulary as this site.' },
      ],
    },
    {
      titulo: 'Fase 2 · HSK 2 e primeiras leituras',
      quando: 'Do 3º ao 6º mês',
      tituloEn: 'Phase 2 · HSK 2 and first readings',
      quandoEn: 'Months 3 to 6',
      focoEn:
        'Start reading whole stories at your level (graded readers) and start talking. Reread and relisten to the same material several times — repetition is great.',
      foco:
        'Começar a ler histórias inteiras no seu nível (livros graduados) e a conversar. Releia e reouça o mesmo material várias vezes — repetição é ótima.',
      recursos: [
        { nome: 'Mandarin Companion', url: 'https://mandarincompanion.com', tipo: 'livros graduados', tipoEn: 'graded readers', descricao: 'Livros com vocabulário controlado (nível "Breakthrough" ≈ 150 caracteres).', descricaoEn: 'Books with controlled vocabulary ("Breakthrough" level ≈ 150 characters).' },
        { nome: 'Chinese Breeze', url: 'https://www.google.com/search?q=Chinese+Breeze+graded+reader', tipo: 'livros graduados', tipoEn: 'graded readers', descricao: 'Coleção de leituras graduadas da Peking University Press, a partir de 300 palavras.', descricaoEn: 'Graded reader series from Peking University Press, starting at 300 words.' },
        { nome: 'italki', url: 'https://www.italki.com', tipo: 'aulas · conversa', tipoEn: 'lessons · conversation', descricao: 'Professores e tutores nativos para aulas de 30 min por vídeo.', descricaoEn: 'Native teachers and tutors for 30-minute video lessons.' },
        { nome: 'HelloTalk', url: 'https://www.hellotalk.com', tipo: 'intercâmbio · app', tipoEn: 'exchange · app', descricao: 'Converse por texto e áudio com chineses que aprendem português.', descricaoEn: 'Chat by text and voice with Chinese speakers learning English.' },
      ],
    },
    {
      titulo: 'Fase 3 · HSK 3 em diante',
      quando: 'A partir do 6º mês',
      tituloEn: 'Phase 3 · HSK 3 and beyond',
      quandoEn: 'From month 6 on',
      focoEn:
        'Increase the volume: shows and videos with Chinese subtitles, slow podcasts and a weekly conversation. Keep adding vocabulary (HSK 3) here on the site.',
      foco:
        'Aumentar o volume: séries e vídeos com legenda em chinês, podcasts lentos e conversa semanal. Siga adicionando vocabulário (HSK 3) aqui no site.',
      recursos: [
        { nome: 'Tandem', url: 'https://www.tandem.net', tipo: 'intercâmbio · app', tipoEn: 'exchange · app', descricao: 'Parceiros de conversa nativos, por texto, áudio e vídeo.', descricaoEn: 'Native conversation partners, by text, audio and video.' },
        { nome: 'Anki', url: 'https://apps.ankiweb.net', tipo: 'revisão · app', tipoEn: 'review · app', descricao: 'Para criar seus próprios cartões com frases de aulas e séries (exporte os baralhos daqui em Cartões).', descricaoEn: 'To make your own cards with sentences from lessons and shows (export decks from here under Flashcards).' },
        { nome: 'Séries com legenda em chinês', nomeEn: 'Shows with Chinese subtitles', url: 'https://www.youtube.com/results?search_query=中文字幕+电视剧', tipo: 'vídeo', tipoEn: 'video', descricao: 'Comece por séries leves do dia a dia; ative a legenda em chinês e use o Pleco.', descricaoEn: 'Start with light slice-of-life shows; turn on Chinese subtitles and use Pleco.' },
      ],
    },
  ];

  protected readonly frasesAula = [
    { hanzi: '请再说一遍。', pinyin: 'Qǐng zài shuō yí biàn.', traducao: 'Repita, por favor.', traducaoEn: 'Please say it again.' },
    { hanzi: '请说慢一点儿。', pinyin: 'Qǐng shuō màn yìdiǎnr.', traducao: 'Fale mais devagar, por favor.', traducaoEn: 'Please speak a little slower.' },
    { hanzi: '这个用中文怎么说？', pinyin: 'Zhège yòng Zhōngwén zěnme shuō?', traducao: 'Como se diz isto em chinês?', traducaoEn: 'How do you say this in Chinese?' },
    { hanzi: '我的声调对吗？', pinyin: 'Wǒ de shēngdiào duì ma?', traducao: 'Meu tom está certo?', traducaoEn: 'Is my tone right?' },
    { hanzi: '请帮我改一下。', pinyin: 'Qǐng bāng wǒ gǎi yíxià.', traducao: 'Por favor, me corrija.', traducaoEn: 'Please correct me.' },
  ];
}
