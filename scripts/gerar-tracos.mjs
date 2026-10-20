#!/usr/bin/env node
/**
 * Gera os dados de traços (ordem e forma) usados pelo hanzi-writer, para funcionar offline.
 *
 * Lê todos os JSON em public/data/, junta os caracteres chineses encontrados e copia
 * os arquivos correspondentes do pacote `hanzi-writer-data` para public/hanzi/<codigo>.json
 * (ex.: 你 → public/hanzi/4f60.json).
 *
 * Roda automaticamente antes de `npm start` e `npm run build`.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, copyFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const pastaDados = join(raiz, 'public', 'data');
const pastaSaida = join(raiz, 'public', 'hanzi');
const require = createRequire(import.meta.url);
const pastaOrigem = dirname(require.resolve('hanzi-writer-data/package.json'));

// Ideogramas CJK (bloco principal + extensão A) e radicais/componentes (⺀-⻳, ㇀-㇣)
const REGEX_HANZI = /[㐀-䶿一-鿿⺀-⻳]/gu;

function listarJson(pasta) {
  if (!existsSync(pasta)) return [];
  return readdirSync(pasta).flatMap((nome) => {
    const caminho = join(pasta, nome);
    if (statSync(caminho).isDirectory()) return listarJson(caminho);
    return nome.endsWith('.json') ? [caminho] : [];
  });
}

const caracteres = new Set();
for (const arquivo of listarJson(pastaDados)) {
  for (const c of readFileSync(arquivo, 'utf8').match(REGEX_HANZI) ?? []) caracteres.add(c);
}

rmSync(pastaSaida, { recursive: true, force: true });
mkdirSync(pastaSaida, { recursive: true });

const faltando = [];
for (const c of caracteres) {
  const origem = join(pastaOrigem, `${c}.json`);
  if (!existsSync(origem)) {
    faltando.push(c);
    continue;
  }
  copyFileSync(origem, join(pastaSaida, `${c.codePointAt(0).toString(16)}.json`));
}

console.log(
  `[gerar-tracos] ${caracteres.size - faltando.length} caracteres copiados para public/hanzi/` +
    (faltando.length ? ` (sem dados de traço: ${faltando.join(' ')})` : ''),
);
