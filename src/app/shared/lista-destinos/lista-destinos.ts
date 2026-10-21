import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Destino } from '../../core/navegacao';

/** Grade de cartões grandes que levam às seções (páginas "Aprender" e "Praticar"). */
@Component({
  selector: 'app-lista-destinos',
  imports: [RouterLink],
  template: `
    <ul class="destinos">
      @for (d of destinos(); track d.rota) {
        <li>
          <a class="cartao destino" [routerLink]="d.rota">
            <span class="icone" lang="zh-CN" aria-hidden="true">{{ d.icone }}</span>
            <span class="textos">
              <strong>{{ d.nome }}</strong>
              <span class="suave pequeno">{{ d.descricao }}</span>
            </span>
            <span class="seta" aria-hidden="true">›</span>
          </a>
        </li>
      }
    </ul>
  `,
  styles: `
    .destinos {
      list-style: none;
      margin: 0;
      padding: 0;
      display: grid;
      gap: 10px;
      grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr));
    }
    .destino {
      display: flex;
      align-items: center;
      gap: 14px;
      height: 100%;
      padding: 14px;
      color: var(--cor-texto);
      text-decoration: none;
      transition: border-color 0.15s, transform 0.05s;
    }
    .destino:hover {
      border-color: var(--cor-primaria);
    }
    .destino:active {
      transform: scale(0.99);
    }
    .icone {
      flex: none;
      display: grid;
      place-items: center;
      width: 52px;
      height: 52px;
      border-radius: 14px;
      background: var(--cor-primaria-suave);
      color: var(--cor-primaria);
      font-family: var(--fonte-hanzi);
      font-size: 1.8rem;
    }
    .textos {
      display: flex;
      flex-direction: column;
      gap: 2px;
      flex: 1;
      min-width: 0;
    }
    .seta {
      font-size: 1.6rem;
      color: var(--cor-texto-suave);
    }
  `,
})
export class ListaDestinos {
  readonly destinos = input.required<Destino[]>();
}
