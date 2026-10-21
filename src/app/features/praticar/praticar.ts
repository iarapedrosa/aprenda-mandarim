import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-praticar',
  imports: [RouterLink],
  template: `
    <section class="pagina">
      <header>
        <h1>Praticar</h1>
        <p class="subtitulo">Escolha uma habilidade para treinar livremente.</p>
      </header>
      <ul class="modulos">
        @for (m of modulos; track m.rota) {
          <li>
            <a class="cartao modulo" [routerLink]="m.rota">
              <span class="icone" lang="zh-CN" aria-hidden="true">{{ m.icone }}</span>
              <span>
                <strong>{{ m.nome }}</strong>
                <span class="suave pequeno descricao">{{ m.descricao }}</span>
              </span>
            </a>
          </li>
        }
      </ul>
    </section>
  `,
  styles: `
    .modulos {
      list-style: none;
      margin: 0;
      padding: 0;
      display: grid;
      gap: 12px;
      grid-template-columns: repeat(auto-fill, minmax(min(100%, 280px), 1fr));
    }
    .modulo {
      display: flex;
      align-items: center;
      gap: 16px;
      color: var(--cor-texto);
      text-decoration: none;
      height: 100%;
    }
    .modulo:hover {
      border-color: var(--cor-primaria);
    }
    .icone {
      font-family: var(--fonte-hanzi);
      font-size: 2.2rem;
      color: var(--cor-primaria);
      background: var(--cor-primaria-suave);
      border-radius: 14px;
      width: 60px;
      height: 60px;
      display: grid;
      place-items: center;
      flex: none;
    }
    .descricao {
      display: block;
    }
  `,
})
export class PraticarPagina {
  protected readonly modulos = [
    { rota: '/cartoes', icone: '卡', nome: 'Cartões (estilo Anki)', descricao: 'Flashcards com repetição espaçada e exportação para o Anki.' },
    { rota: '/gramatica', icone: '语', nome: 'Gramática', descricao: 'Mini-lições: ordem da frase, 的, 了, classificadores…' },
    { rota: '/numeros', icone: '数', nome: 'Números', descricao: 'Contar, preços, horas, datas e telefones com áudio.' },
    { rota: '/escrita', icone: '写', nome: 'Escrita', descricao: 'Desenhe os caracteres traço a traço.' },
    { rota: '/leitura', icone: '读', nome: 'Leitura', descricao: 'Diálogos e historinhas com pinyin e tradução.' },
    { rota: '/escuta', icone: '听', nome: 'Escuta', descricao: 'Ditado: ouça e escreva em pinyin.' },
    { rota: '/fala', icone: '说', nome: 'Fala', descricao: 'Shadowing e trava-línguas com reconhecimento de voz.' },
    { rota: '/pinyin/treino', icone: '声', nome: 'Treino de tons', descricao: 'Identifique os tons e pares mínimos.' },
    { rota: '/caracteres/radicais', icone: '部', nome: 'Radicais', descricao: 'As peças que formam os caracteres.' },
    { rota: '/recursos', icone: '书', nome: 'Recursos para estudar', descricao: 'Livros, apps, vídeos e conversa — o que usar fora do site.' },
  ];
}
