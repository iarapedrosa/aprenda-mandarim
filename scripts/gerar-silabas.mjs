#!/usr/bin/env node
/**
 * Gera public/data/pinyin/silabas.json: para cada sílaba do mandarim e cada tom (1–4),
 * um caractere comum com essa pronúncia. O site usa esse caractere para "tocar" a sílaba
 * com a síntese de voz (a voz chinesa lê caracteres, não pinyin).
 *
 * Critérios (em ordem):
 *   1. caractere da lista de comuns (scripts/dados/caracteres-comuns.txt) com UMA só leitura;
 *   2. caractere comum polifônico cuja leitura padrão é a desejada;
 *   3. qualquer caractere do hanzi-writer-data com uma só leitura (marcado como "raro").
 *
 * Uso: node scripts/gerar-silabas.mjs   (só precisa rodar de novo se a lista mudar)
 */
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pinyin } from 'pinyin-pro';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const pastaTracos = dirname(require.resolve('hanzi-writer-data/package.json'));

const comuns = [...readFileSync(join(raiz, 'scripts/dados/caracteres-comuns.txt'), 'utf8').trim()];
const todos = readdirSync(pastaTracos)
  .filter((n) => n.endsWith('.json') && n !== 'package.json')
  .map((n) => n.replace('.json', ''))
  .filter((c) => /^[一-鿿]$/u.test(c));

/** 'lü4' → { silaba: 'lü', tom: 4 } */
function separar(leituraNum) {
  const m = /^([a-zü]+)([1-5])?$/.exec(leituraNum.replace('v', 'ü'));
  if (!m) return null;
  return { silaba: m[1], tom: Number(m[2] ?? 5) };
}

function leituras(c) {
  return pinyin(c, { multiple: true, type: 'array', toneType: 'num', v: false })
    .map(separar)
    .filter(Boolean);
}

function leituraPadrao(c) {
  return separar(pinyin(c, { type: 'array', toneType: 'num', toneSandhi: false })[0]);
}

const mapa = {}; // silaba -> tom -> { c, raro }
const definir = (silaba, tom, c, raro) => {
  if (tom < 1 || tom > 4) return;
  mapa[silaba] ??= {};
  if (!mapa[silaba][tom]) mapa[silaba][tom] = raro ? { c, raro: true } : { c };
};

// Passo 1: comuns com leitura única
for (const c of comuns) {
  const l = leituras(c);
  if (l.length === 1) definir(l[0].silaba, l[0].tom, c, false);
}
// Passo 2: comuns polifônicos, pela leitura padrão
for (const c of comuns) {
  const l = leituraPadrao(c);
  if (l) definir(l.silaba, l.tom, c, false);
}
// Passo 3: demais caracteres com leitura única
for (const c of todos) {
  const l = leituras(c);
  if (l.length === 1) definir(l[0].silaba, l[0].tom, c, true);
}

const ordenado = Object.fromEntries(
  Object.keys(mapa)
    .sort()
    .map((s) => [
      s,
      Object.fromEntries(
        Object.entries(mapa[s])
          .sort(([a], [b]) => Number(a) - Number(b))
          .map(([tom, v]) => [tom, v.raro ? `${v.c}*` : v.c]),
      ),
    ]),
);

mkdirSync(join(raiz, 'public/data/pinyin'), { recursive: true });
writeFileSync(join(raiz, 'public/data/pinyin/silabas.json'), JSON.stringify(ordenado) + '\n');
const total = Object.values(ordenado).reduce((n, t) => n + Object.keys(t).length, 0);
console.log(`[gerar-silabas] ${Object.keys(ordenado).length} sílabas, ${total} combinações sílaba+tom`);
