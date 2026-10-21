#!/usr/bin/env node
/**
 * Confere o vocabulário de public/data/vocabulario/*.json:
 *   - campos obrigatórios e ids repetidos;
 *   - número de sílabas do pinyin = número de caracteres;
 *   - letras e tons de cada sílaba comparados com o pinyin-pro (palavra e frase de exemplo).
 *
 * Diferenças de tom neutro e de sandhi (一, 不) são aceitas. O resto é listado para revisão
 * humana — o pinyin-pro também erra em caracteres com mais de uma leitura.
 *
 * Uso: npm run dados:validar
 */
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pinyin } from 'pinyin-pro';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const pasta = join(raiz, 'public/data/vocabulario');
const fonteSilabas = readFileSync(join(raiz, 'src/app/core/pinyin/silabas-validas.ts'), 'utf8');
const SILABAS = new Set(/`([^`]+)`/.exec(fonteSilabas)[1].split(/\s+/).filter(Boolean));

const MARCAS = {};
for (const [v, ms] of Object.entries({ a: 'āáǎà', e: 'ēéěè', i: 'īíǐì', o: 'ōóǒò', u: 'ūúǔù', ü: 'ǖǘǚǜ' })) {
  [...ms].forEach((m, i) => (MARCAS[m] = [v, i + 1]));
}

/** "Nǐ hǎo!" → [{letras:'ni', tom:3}, {letras:'hao', tom:3}] */
function silabas(texto) {
  const resultado = [];
  for (const palavra of texto.normalize('NFC').toLowerCase().split(/[^a-züāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ']+/)) {
    for (const parte of palavra.split("'").filter(Boolean)) {
      let letras = '';
      const tons = [];
      for (const c of parte) {
        if (MARCAS[c]) {
          tons[letras.length] = MARCAS[c][1];
          letras += MARCAS[c][0];
        } else letras += c;
      }
      const ok = (s) => SILABAS.has(s) || (s.length > 1 && s.endsWith('r') && SILABAS.has(s.slice(0, -1)));
      const cortar = (i) => {
        if (i === letras.length) return [];
        for (let f = Math.min(letras.length, i + 7); f > i; f--) {
          if (!ok(letras.slice(i, f))) continue;
          // sem apóstrofo, sílaba no meio da palavra não começa com a/o/e
          if (i > 0 && /[aoe]/.test(letras[i])) continue;
          const resto = cortar(f);
          if (resto) return [f, ...resto];
        }
        return null;
      };
      const cortes = cortar(0);
      if (!cortes) {
        resultado.push({ letras, tom: 0, invalida: true });
        continue;
      }
      let ini = 0;
      for (const fim of cortes) {
        const tom = tons.slice(ini, fim).find(Boolean) ?? 5;
        resultado.push({ letras: letras.slice(ini, fim), tom });
        ini = fim;
      }
    }
  }
  return resultado;
}

/** Caracteres alinhados às sílabas (o 儿 de erhua se junta à sílaba anterior). */
function caracteres(hanzi, sils) {
  const cs = [...hanzi].filter((c) => /\p{Script=Han}/u.test(c));
  const alinhados = [];
  let i = 0;
  for (const s of sils) {
    const erhua = s.letras !== 'er' && s.letras.endsWith('r') && cs[i + 1] === '儿';
    alinhados.push(cs[i]);
    i += erhua ? 2 : 1;
  }
  return i === cs.length ? alinhados : null;
}

function leituras(c) {
  return pinyin(c, { multiple: true, type: 'array', toneType: 'num', v: true }).map((l) => {
    const m = /^([a-zü]+?)([0-5])?$/.exec(l.replace(/v/g, 'ü'));
    return { letras: m[1], tom: Number(m[2] ?? 5) || 5 };
  });
}

function conferir(rotulo, hanzi, texto, problemas, contextual) {
  const sils = silabas(texto);
  if (sils.some((s) => s.invalida)) {
    problemas.push(`${rotulo}: pinyin com sílaba inválida: "${texto}"`);
    return;
  }
  const cs = caracteres(hanzi, sils);
  if (!cs) {
    problemas.push(`${rotulo}: ${sils.length} sílabas para os caracteres de "${hanzi}" ("${texto}")`);
    return;
  }
  // leitura em contexto (frase inteira), útil para caracteres com várias leituras
  const contexto = contextual
    ? pinyin([...hanzi].filter((c) => /\p{Script=Han}/u.test(c)).join(''), {
        type: 'array',
        toneType: 'num',
        v: true,
        toneSandhi: true,
      })
    : null;
  let iCaractere = 0;
  sils.forEach((s, i) => {
    const c = cs[i];
    const erhua = s.letras !== 'er' && s.letras.endsWith('r') && hanzi.includes('儿');
    const base = erhua ? s.letras.slice(0, -1) : s.letras;
    const posicao = iCaractere;
    iCaractere += erhua ? 2 : 1;
    const possiveis = leituras(c);
    const mesmaLetra = possiveis.filter((p) => p.letras === base);
    if (!mesmaLetra.length) {
      problemas.push(`${rotulo}: ${c} escrito "${s.letras}", pinyin-pro sugere ${possiveis.map((p) => p.letras + p.tom).join('/')}`);
    } else if (s.tom !== 5 && !mesmaLetra.some((p) => p.tom === s.tom)) {
      const sandhi = (c === '一' && [1, 2, 4].includes(s.tom)) || (c === '不' && [2, 4].includes(s.tom));
      if (!sandhi) {
        problemas.push(`${rotulo}: ${c} com tom ${s.tom} ("${s.letras}"), pinyin-pro: ${mesmaLetra.map((p) => p.tom).join('/')}`);
      }
    } else if (contexto && s.tom !== 5) {
      const ctx = contexto[posicao]?.replace(/v/g, 'ü');
      const m = ctx && /^([a-zü]+?)([0-5])?$/.exec(ctx);
      if (m && m[1] === base && (Number(m[2] ?? 5) || 5) !== s.tom && !['一', '不'].includes(c)) {
        problemas.push(`${rotulo}: ${c} em "${hanzi}" — escrito ${s.letras}${s.tom}, em contexto pinyin-pro lê ${ctx}`);
      }
    }
  });
}

const problemas = [];
const ids = new Map();
const arquivos = readdirSync(pasta).filter((n) => n.endsWith('.json') && n !== 'index.json');
let total = 0;
for (const arquivo of arquivos) {
  const itens = JSON.parse(readFileSync(join(pasta, arquivo), 'utf8'));
  for (const item of itens) {
    total++;
    const rotulo = `${arquivo} ${item.hanzi}`;
    for (const campo of ['id', 'hanzi', 'pinyin', 'traducao', 'classe']) {
      if (!item[campo]) problemas.push(`${rotulo}: falta o campo "${campo}"`);
    }
    if (ids.has(item.id)) problemas.push(`${rotulo}: id repetido (também em ${ids.get(item.id)})`);
    ids.set(item.id, arquivo);
    conferir(rotulo, item.hanzi, item.pinyin, problemas, false);
    if (item.exemplo) {
      for (const campo of ['hanzi', 'pinyin', 'traducao']) {
        if (!item.exemplo[campo]) problemas.push(`${rotulo}: exemplo sem "${campo}"`);
      }
      conferir(`${rotulo} (exemplo)`, item.exemplo.hanzi, item.exemplo.pinyin, problemas, true);
    }
  }
}

console.log(`[validar-vocabulario] ${total} palavras em ${arquivos.length} arquivo(s).`);
if (problemas.length) {
  console.log(`${problemas.length} ponto(s) para revisar:\n- ` + problemas.join('\n- '));
  process.exitCode = 1;
} else {
  console.log('Nenhum problema encontrado.');
}
