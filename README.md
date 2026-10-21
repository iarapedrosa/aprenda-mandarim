# 学中文 · Aprenda Mandarim

Site para aprender mandarim **do zero** e **praticar todos os dias**, feito para quem fala português do Brasil.
Toda a interface, as explicações e as traduções estão em português.

- 🗓️ **Treino de hoje**: sessão diária de ~15–20 minutos que mistura todos os módulos, com repetição espaçada (SM-2).
- 🔊 **Pinyin e tons**: tabela de iniciais e finais com áudio, curvas dos tons, armadilhas para brasileiros, treino de tons, pares mínimos e sandhi.
- 字 **Caracteres**: vocabulário do HSK 1 e HSK 2 (300 palavras) com exemplos, radicais e ordem dos traços.
- ✍️ **Escrita**: desenhe com o dedo ou o mouse e receba correção traço a traço, em 3 níveis.
- 📖 **Leitura**: diálogos do dia a dia e historinhas com pinyin/tradução que você mostra ou esconde, palavras clicáveis e perguntas de compreensão.
- 👂 **Escuta**: ditado de palavras e frases (pinyin com números ou acentos, ou escolha dos caracteres).
- 🗣️ **Fala**: shadowing e trava-línguas com reconhecimento de voz.
- 🔢 **Números**: regras explicadas (十, 百, 千, 万, 零, 两 × 二), conversor (digite um número e ouça em chinês) e prática de números, preços, horas, anos e telefones.
- 📐 **Gramática**: 12 mini-lições (ordem da frase, 的, classificadores, 了, 比…) que entram no treino aos poucos, e o exercício **Monte a frase**.
- 🧭 **Recursos**: o que usar fora do site em cada fase (livros graduados, apps, vídeos) e quando começar a conversar.
- 🃏 **Cartões (estilo Anki)**: flashcards com Errei/Difícil/Bom/Fácil e prévia do próximo intervalo, mais exportação dos baralhos para o app do Anki.
- 💬 **Frase do dia** e **palavra do dia** na página inicial.
- 📱 PWA instalável, funciona offline, tema claro/escuro, progresso salvo no navegador com backup em JSON.

## Sumário

- [Como usar o site](#como-usar-o-site)
- [Como rodar localmente](#como-rodar-localmente)
- [Deploy na Vercel](#deploy-na-vercel)
- [Como adicionar vocabulário (HSK 3+) e outros conteúdos](#como-adicionar-vocabulário-hsk-3-e-outros-conteúdos)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Como funciona a repetição espaçada](#como-funciona-a-repetição-espaçada)
- [Limitações conhecidas](#limitações-conhecidas)
- [Créditos e licenças](#créditos-e-licenças)

---

## Como usar o site

### A jornada

O treino diário apresenta o conteúdo aos poucos:

1. **Pinyin e tons**: 7 lições curtas (tons, iniciais, finais e sandhi). São no máximo 2 por dia.
2. **Palavras e caracteres**: liberadas **no dia seguinte** às 2 primeiras lições de pinyin. Cada palavra nova é apresentada (áudio, traços, exemplo) e depois entra na revisão espaçada. Os caracteres das palavras aprendidas ganham prática de escrita a partir do dia seguinte.
3. **Frases**: depois de **30 palavras estudadas**, o treino passa a incluir ditado, leitura e fala com frases.

Já sabe pinyin? Na página inicial, use **"Já sei pinyin — pular para o vocabulário"**.

### O treino de hoje

Toque em **Começar treino** na página inicial. A sessão segue esta ordem:

1. aquecimento de tons;
2. lições de pinyin pendentes;
3. revisões do dia (palavras, caracteres e frases);
4. palavras novas;
5. escrita de caracteres;
6. exercícios com frases.

O treino também traz:

- um **par de tons** no aquecimento (palavras de 2 sílabas, como 老师 = 3º + 1º);
- dois números para ouvir e reconhecer, com faixa que aumenta conforme você aprende;
- uma **lição de gramática** por dia, quando o vocabulário já permite;
- **Monte a frase** com exemplos de palavras que você já estudou;
- o exercício **Teclado chinês** (pinyin sem tons → escolher o caractere, inclusive homófonos). O que você errar volta no fim da sessão como reforço. Teclado no computador: `1`–`4` respondem, `Enter` continua e `R` repete o áudio.

**Meta diária**: em **Progresso › Meta diária** você escolhe quantas palavras novas e quantas revisões quer por dia (padrão: 6 e 20) e quanto de **escrita à mão** entra no treino (leve, normal ou desligada).

- **Acúmulo de revisões**: se as revisões atrasarem, o limite do dia sobe (até o dobro da meta) e entram menos palavras novas até normalizar. Regra prática: cada palavra nova por dia vira ~10 revisões diárias.
- **Vozes**: se o aparelho tiver mais de uma voz de mandarim, o site alterna entre elas (ouvir vozes diferentes ajuda a perceber os tons).

### Cartões (estilo Anki)

Abra **Cartões** no menu (no celular, em **Praticar › Cartões**). Você revisa como no Anki:

- **Revisar agora** traz os cartões vencidos de todos os baralhos (HSK 1, HSK 2 e Frases do dia).
- **Estudar** em um baralho junta as revisões dele com cartões novos (você escolhe quantos por sessão).
- A frente pode mostrar os **caracteres**, o **português** ou **só o áudio**. Vire com o espaço e avalie com `1`–`4` (Errei, Difícil, Bom, Fácil). Cada botão mostra quando o cartão volta.
- Os cartões são **os mesmos do Treino de hoje**: o que você revisar aqui conta lá também.
- **Exportar p/ Anki** gera um `.txt` que o Anki importa direto (Arquivo › Importar, tipo de nota "Básico"). O progresso no app do Anki fica separado do site.

### Números

Abra **Números** no menu (no celular, em **Praticar › Números**):

- **Aprender**: regras com áudio — 11–19, dezenas, 百, 千, 万 (o chinês conta de 10 mil em 10 mil!), 零 no meio, 两 × 二, sandhi de 一, dinheiro (块/毛), horas (点/分/半), datas e telefones (1 = 幺).
- **Conversor**: digite um número, preço, hora, telefone ou ano para ver os caracteres e o pinyin e ouvir.
- **Praticar**: ouvir e digitar o número, ler os caracteres e digitar, ou ver os algarismos e escolher o pinyin.

### Dicas

- **Áudio**: o site usa a voz em chinês do seu aparelho. Se não houver nenhuma, o site mostra como instalar (iPhone: Ajustes › Acessibilidade › Conteúdo Falado › Vozes › Chinês; Android: Conversão de texto em voz › Google › Chinês). Use o botão **Lenta/Normal** para mudar a velocidade.
- **Digitando pinyin**: use números (`ni3 hao3`) ou acentos (`nǐ hǎo`); `v` vale como `ü` (`lv4` = lǜ) e `5` (ou nada) indica o tom neutro. Espaços são opcionais.
- **Fala**: o reconhecimento de voz funciona no Chrome, no Edge e no Safari do iPhone. A checagem é **aproximada**: ela compara as palavras transcritas, mas **não avalia os tons com precisão**.
- **Instalar no celular**: no Chrome (Android), abra o menu e escolha "Instalar app"; no Safari (iPhone), toque em Compartilhar › "Adicionar à Tela de Início". O app funciona offline.
- **Backup**: o progresso fica só no navegador. Em **Progresso › Backup**, exporte um JSON de vez em quando. Ele também serve para levar o progresso para outro aparelho, com **Importar**.

---

## Como rodar localmente

Requisitos: **Node.js 24** (ou 22.22.3+) e npm. O projeto tem `.nvmrc`.

```bash
git clone https://github.com/iarapedrosa/aprenda-mandarim.git
cd aprenda-mandarim
nvm use            # se você usa nvm (instale com: nvm install 24)
npm install
npm start          # http://localhost:4200
```

Outros comandos:

| Comando | O que faz |
|---|---|
| `npm start` | servidor de desenvolvimento (gera os dados de traços antes) |
| `npm test` | testes unitários (Vitest, o test runner padrão do Angular CLI) |
| `npm run build` | build de produção em `dist/aprenda-mandarim/browser` |
| `npm run dados:validar` | confere o pinyin de todo o conteúdo em `public/data` |
| `npm run dados:tracos` | copia os dados de traço dos caracteres usados para `public/hanzi` |

> O service worker (modo offline) só funciona no build de produção. Para testá-lo localmente:
> `npm run build && npx http-server dist/aprenda-mandarim/browser -p 8080`.

---

## Deploy na Vercel

O projeto já está pronto para a Vercel. O `vercel.json` na raiz define:

- `outputDirectory`: `dist/aprenda-mandarim/browser` (caminho confirmado no build);
- **rewrite** de todas as rotas para `/index.html` (recarregar `/leitura/d01` funciona, sem `#` na URL);
- `ngsw-worker.js`, `ngsw.json` e os demais arquivos do service worker **sem cache**, para as atualizações chegarem;
- comando de instalação (`npm ci`) e de build (`npm run build`).

### Passo a passo

1. Acesse [vercel.com](https://vercel.com) e entre com a sua conta do GitHub.
2. Clique em **Add New… › Project**.
3. Em **Import Git Repository**, escolha `iarapedrosa/aprenda-mandarim` e clique em **Import**. Se o repositório não aparecer, clique em **Adjust GitHub App Permissions** e libere o acesso a ele.
4. Na tela **Configure Project**:
   - **Framework Preset**: `Angular`
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist/aprenda-mandarim/browser`
   - **Install Command**: `npm ci`

   Como o `vercel.json` já define esses valores, a Vercel deve preenchê-los sozinha.
5. Clique em **Deploy**. Em 1 a 2 minutos o site estará no ar em `https://aprenda-mandarim-xxxx.vercel.app`.
6. A versão do Node vem de `"engines": { "node": "24.x" }` no `package.json`. Se precisar, confira em **Settings › Build and Deployment › Node.js Version**.

A partir daí:

- **todo push na `main`** gera um deploy de produção;
- **cada branch e cada pull request** ganham um deploy de *preview* com URL própria (comentada no PR).

Para usar um domínio próprio, vá em **Settings › Domains**.

---

## Como adicionar vocabulário (HSK 3+) e outros conteúdos

Todo o conteúdo fica em `public/data` e é carregado como JSON. Não é preciso mexer no código.

### Vocabulário

1. Crie `public/data/vocabulario/hsk3.json` com uma lista de palavras neste formato:

   ```json
   [
     {
       "id": "旅行",
       "hanzi": "旅行",
       "pinyin": "lǚxíng",
       "traducao": "viajar; viagem",
       "classe": "verbo",
       "nivel": 3,
       "exemplo": {
         "hanzi": "我喜欢去中国旅行。",
         "pinyin": "Wǒ xǐhuan qù Zhōngguó lǚxíng.",
         "traducao": "Eu gosto de viajar pela China."
       }
     }
   ]
   ```

   - `id` precisa ser único em todos os níveis. Use os próprios caracteres; se houver duas palavras iguais com sentidos diferentes, acrescente um sufixo, como `"得-dei"`.
   - Escreva o pinyin com acentos. Palavras de várias sílabas vão juntas (`lǚxíng`) e usam apóstrofo quando a sílaba seguinte começa com a/o/e (`nǚ'ér`). O tom neutro fica sem acento (`xièxie`).
   - Para 一 e 不, siga o costume dos livros e escreva o tom já mudado: `yìqǐ`, `bú kèqi`.
   - O `exemplo` é opcional, mas recomendado: ele aparece na página da palavra, no treino e no ditado.

2. Registre o arquivo em `public/data/vocabulario/index.json`:

   ```json
   { "id": "hsk3", "nome": "HSK 3", "arquivo": "hsk3.json", "descricao": "..." }
   ```

3. Rode `npm run dados:validar`. O script confere se o número de sílabas bate com o de caracteres e compara letras e tons com o `pinyin-pro`. Algumas leituras ele erra (ex.: 有空 *yǒu kòng*); depois de revisar, registre a exceção na lista `REVISADOS` do script.

4. Pronto. As palavras novas entram no fim da fila do treino diário (na ordem do arquivo), e os **dados de traço** dos caracteres novos são gerados automaticamente no `npm start` e no `npm run build`.

### Outros conteúdos

| Arquivo | Conteúdo |
|---|---|
| `public/data/frases-do-dia.json` | frases do dia (`id`, `hanzi`, `pinyin`, `traducao`, `nota`), uma por dia, em ciclo |
| `public/data/leitura/dialogos.json` e `historias.json` | textos de leitura: linhas com palavras (`tokens`), tradução e perguntas (a opção correta é a de índice `correta`; o site embaralha) |
| `public/data/fala/trava-linguas.json` | trava-línguas |
| `public/data/radicais.json` | radicais com significado, dica e exemplos |
| `public/data/gramatica.json` | mini-lições de gramática (`minPalavras` define quando entram no treino) |
| `public/data/pinyin/silabas.json` | caractere usado para "tocar" cada sílaba e tom (gerado por `node scripts/gerar-silabas.mjs`) |

Depois de editar, rode `npm run dados:validar`.

---

## Estrutura do projeto

```
├── public/
│   ├── data/                 # conteúdo em JSON (vocabulário, textos, frases…)
│   ├── hanzi/                # dados de traço (gerado; não vai para o git)
│   ├── icons/ · manifest.webmanifest
├── scripts/
│   ├── gerar-tracos.mjs      # copia os traços do hanzi-writer-data para public/hanzi
│   ├── gerar-silabas.mjs     # gera o mapa sílaba+tom → caractere
│   └── validar-vocabulario.mjs
├── src/app/
│   ├── core/                 # services e lógica pura (sem interface)
│   │   ├── armazenamento/    # localStorage tipado
│   │   ├── dados/            # vocabulário, frases, leitura
│   │   ├── numeros/          # números, preços, horas e datas em caracteres + pinyin
│   │   ├── pinyin/           # conversão de tons, segmentação e correção de pinyin
│   │   ├── progresso/        # progresso, streak, estatísticas, backup
│   │   ├── srs/              # algoritmo SM-2
│   │   ├── tema/             # tema claro/escuro
│   │   └── voz/              # síntese e reconhecimento de voz, comparação da fala
│   ├── shared/               # componentes reutilizáveis (áudio, pinyin colorido, hanzi-writer…)
│   └── features/             # um módulo por área, com rotas carregadas sob demanda
│       ├── treino/           # Treino de hoje + gerador da sessão + exercícios
│       ├── pinyin/ · caracteres/ · escrita/ · leitura/ · escuta/ · fala/
│       ├── cartoes/          # flashcards estilo Anki + exportação para o Anki
│       ├── gramatica/        # mini-lições de gramática e "Monte a frase"
│       ├── recursos/         # recursos externos por fase e dicas de conversa
│       ├── numeros/          # aprender, conversor e prática de números
│       ├── praticar/         # atalhos (celular)
│       └── progresso/        # estatísticas, calendário, metas, backup
├── ngsw-config.json          # cache offline do service worker
└── vercel.json
```

Tecnologias:

- **Angular 22**: componentes standalone, signals, zoneless e rotas com lazy loading por módulo.
- **PWA**: `@angular/service-worker`.
- **[hanzi-writer](https://hanziwriter.org)**: ordem dos traços e quiz de escrita.
- **[pinyin-pro](https://github.com/zh-lx/pinyin-pro)**: pinyin na comparação da fala e na validação dos dados.
- **Web Speech API**: `speechSynthesis` (zh-CN) para pronúncia e `SpeechRecognition` (zh-CN) para a fala.

Os testes unitários (Vitest) cobrem:

- o algoritmo SM-2;
- a validação de pinyin;
- streak, metas e backup;
- o gerador do treino diário;
- a comparação da fala;
- a conversão de números;
- a exportação para o Anki.

---

## Como funciona a repetição espaçada

O site usa o **SM-2** (o algoritmo clássico do SuperMemo, base do Anki). Cada palavra, caractere e frase vira um cartão.

- Cada revisão recebe uma nota de 0 a 5:
  - nos exercícios automáticos, acerto = 4 e erro = 1;
  - na escrita, a nota depende dos erros de traço e do uso de dica.
- Nota ≥ 3: o intervalo cresce de **1 dia → 6 dias → intervalo × facilidade**.
- Nota < 3: o cartão volta no dia seguinte e reaparece no fim da sessão como reforço.
- A **facilidade** começa em 2,5 e se ajusta a cada resposta (mínimo de 1,3).
- O tipo de exercício muda com a maturidade:
  - palavras novas são reconhecidas pelo significado;
  - as já consolidadas pedem o caractere, os tons ou o pinyin digitado;
  - na escrita, os níveis passam de "com contorno" para "sem contorno" e depois "de memória".

---

## Limitações conhecidas

- **Voz**: a qualidade depende das vozes instaladas no aparelho. A voz lê caracteres, não pinyin; por isso cada sílaba é tocada por um caractere com aquele som (ex.: mǎ → 马).
- **Reconhecimento de fala**:
  - não funciona no Firefox;
  - no Chrome, depende de internet;
  - não avalia tons com precisão: a nota é uma checagem aproximada.
- **Progresso local**: fica no `localStorage` do navegador. Limpar os dados do site apaga o progresso, então exporte backups.
- **Vocabulário**: segue as listas do HSK 2.0 (HSK 1 e HSK 2, 150 palavras cada). As traduções foram revisadas, mas se encontrar algum erro, abra uma *issue*.

## Autoria e contato

Feito por **Iara Pedrosa**. Dúvidas, sugestões ou erros nas traduções: **iaraferreirahg@gmail.com** — ou abra uma *issue* aqui no GitHub.

## Créditos e licenças

- Dados de traços: [hanzi-writer-data](https://github.com/chanind/hanzi-writer-data), derivados do projeto [Make Me a Hanzi](https://github.com/skishore/makemeahanzi), sob a Arphic Public License.
- [hanzi-writer](https://github.com/chanind/hanzi-writer) (MIT) e [pinyin-pro](https://github.com/zh-lx/pinyin-pro) (MIT).
- Fontes: [Noto Sans SC](https://fonts.google.com/noto/specimen/Noto+Sans+SC) e [Inter](https://fonts.google.com/specimen/Inter) (SIL Open Font License).

Código sob a licença [MIT](LICENSE).
