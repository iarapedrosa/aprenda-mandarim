/** Lê as cores do tema atual (variáveis CSS) para usar no hanzi-writer. */
export function coresDoTema(): {
  traco: string;
  contorno: string;
  destaque: string;
  desenho: string;
  radical: string;
} {
  const estilo = getComputedStyle(document.documentElement);
  const ler = (nome: string, padrao: string) => estilo.getPropertyValue(nome).trim() || padrao;
  return {
    traco: ler('--cor-texto', '#1f1b16'),
    contorno: ler('--cor-borda', '#ddd7cc'),
    destaque: ler('--tom-4', '#1565c0'),
    desenho: ler('--cor-primaria', '#b3261e'),
    radical: ler('--cor-primaria', '#b3261e'),
  };
}
