/**
 * Separa uma frase em palavras usando o vocabulário conhecido (maior palavra primeiro).
 * Pontuação é descartada; caracteres fora do dicionário viram palavras de um caractere.
 * Ex.: "我喜欢喝茶。" → ["我", "喜欢", "喝", "茶"]
 */
export function segmentarFrase(frase: string, dicionario: ReadonlySet<string>, maximo = 4): string[] {
  const pedacos: string[] = [];
  const blocos = frase.split(/[^\p{Script=Han}]+/u).filter(Boolean);
  for (const bloco of blocos) {
    const cs = [...bloco];
    let i = 0;
    while (i < cs.length) {
      let tamanho = Math.min(maximo, cs.length - i);
      while (tamanho > 1 && !dicionario.has(cs.slice(i, i + tamanho).join(''))) tamanho--;
      pedacos.push(cs.slice(i, i + tamanho).join(''));
      i += tamanho;
    }
  }
  return pedacos;
}

/** Junta só os caracteres (para comparar a resposta montada com a frase original). */
export function soCaracteres(texto: string): string {
  return [...texto].filter((c) => /\p{Script=Han}/u.test(c)).join('');
}
