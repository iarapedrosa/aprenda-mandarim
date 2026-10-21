import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NumeroChines, ano, digitoADigito, hora, numero, preco } from '../../../core/numeros/numeros';
import { CartaoSom } from '../../../shared/cartao-som/cartao-som';

interface Exemplo extends NumeroChines {
  rotulo: string;
}

interface Regra {
  titulo: string;
  texto: string;
  exemplos: Exemplo[];
}

const n = (valor: number): Exemplo => ({ ...numero(valor), rotulo: valor.toLocaleString('pt-BR') });
const com = (rotulo: string, x: NumeroChines): Exemplo => ({ ...x, rotulo });

@Component({
  selector: 'app-aprender-numeros',
  imports: [CartaoSom, RouterLink],
  template: `
    <h2>De 0 a 10</h2>
    <p>A base de tudo. Toque para ouvir e repita.</p>
    <div class="grade-numeros">
      @for (e of zeroADez; track e.rotulo) {
        <app-cartao-som [destaque]="e.rotulo" [hanzi]="e.hanzi" [pinyin]="e.pinyin" />
      }
    </div>

    @for (r of regras; track r.titulo; let idx = $index) {
      <section class="cartao regra">
        <h2><span class="numero-regra" aria-hidden="true">{{ idx + 1 }}</span> {{ r.titulo }}</h2>
        <p>{{ r.texto }}</p>
        <div class="grade-exemplos">
          @for (e of r.exemplos; track e.rotulo) {
            <app-cartao-som [destaque]="e.rotulo" [hanzi]="e.hanzi" [pinyin]="e.pinyin" />
          }
        </div>
      </section>
    }

    <p class="linha fim">
      <a class="botao botao-primario" routerLink="../praticar">Praticar números</a>
      <a class="botao" routerLink="../conversor">Converter qualquer número</a>
    </p>
  `,
  styles: `
    .grade-numeros {
      display: grid;
      gap: 8px;
      grid-template-columns: repeat(auto-fill, minmax(84px, 1fr));
      margin-bottom: 16px;
    }
    .regra h2 {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 1.15rem;
    }
    .numero-regra {
      flex: none;
      display: inline-grid;
      place-items: center;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: var(--cor-primaria);
      color: var(--cor-sobre-primaria);
      font-size: 0.95rem;
    }
    .grade-exemplos {
      display: grid;
      gap: 8px;
      grid-template-columns: repeat(auto-fill, minmax(min(100%, 150px), 1fr));
    }
    .fim {
      margin-top: 16px;
    }
  `,
})
export class AprenderNumerosPagina {
  protected readonly zeroADez = Array.from({ length: 11 }, (_, i) => n(i));

  protected readonly regras: Regra[] = [
    {
      titulo: 'De 11 a 19: 十 + unidade',
      texto: 'É só somar: dez-um, dez-dois… Bem mais simples que "onze" e "doze"!',
      exemplos: [n(11), n(12), n(15), n(19)],
    },
    {
      titulo: 'Dezenas: unidade + 十',
      texto: 'Vinte é "dois-dez" (二十), trinta e cinco é "três-dez-cinco" (三十五).',
      exemplos: [n(20), n(35), n(68), n(99)],
    },
    {
      titulo: 'Centenas (百) e o zero do meio (零)',
      texto:
        'Quando há um zero no meio, fala-se 零 (líng) uma vez só; zeros no fim não são falados. Dentro de números grandes, o 10 vira 一十: 110 = 一百一十.',
      exemplos: [n(100), n(105), n(110), n(350)],
    },
    {
      titulo: 'Milhares (千)',
      texto: 'Mesma lógica: 2026 = dois-mil, zero, vinte-seis.',
      exemplos: [n(1000), n(1005), n(2026), n(3500)],
    },
    {
      titulo: '万: o chinês conta de 10 mil em 10 mil',
      texto:
        'Esta é a maior pegadinha! 万 (wàn) = 10.000. Então 100.000 = 十万 ("dez dez-mils") e 1 milhão = 一百万 ("cem dez-mils"). Para converter, separe os números em grupos de 4 dígitos a partir da direita.',
      exemplos: [n(10000), n(25000), n(100000), n(1000000)],
    },
    {
      titulo: '两 (liǎng) ou 二 (èr)?',
      texto:
        'Para contar coisas usa-se 两: 两个人 (duas pessoas). No começo de 百, 千 e 万 também: 两百, 两千, 两万. Já em 12 (十二), 20 (二十) e "segundo" (第二) usa-se 二.',
      exemplos: [com('2 pessoas', { hanzi: '两个人', pinyin: 'liǎng ge rén' }), n(200), n(2000), n(12)],
    },
    {
      titulo: 'O tom de 一 muda',
      texto: 'Sozinho é yī, mas antes de 百 e 千 vira yì, e antes de 万 vira yí (sandhi tonal).',
      exemplos: [n(1), n(100), n(1000), n(10000)],
    },
    {
      titulo: 'Dinheiro: 块 e 毛',
      texto:
        'O yuan se chama 元 por escrito, mas na fala é 块 (kuài). 毛 (máo) = 10 centavos. No fim, o 毛 costuma ficar implícito: 十二块五 = 12,50.',
      exemplos: [com('2 yuans', preco(2)), com('12,50', preco(12.5)), com('0,50', preco(0.5)), com('99,90', preco(99.9))],
    },
    {
      titulo: 'Horas: 点, 分 e 半',
      texto: '点 (diǎn) = hora, 分 (fēn) = minuto, 半 (bàn) = meia. 2 horas é 两点.',
      exemplos: [com('8:00', hora(8, 0)), com('8:30', hora(8, 30)), com('2:15', hora(2, 15)), com('10:05', hora(10, 5))],
    },
    {
      titulo: 'Datas: ano, mês e dia',
      texto:
        'A ordem é do maior para o menor: ano (dígito a dígito) + 年, mês + 月, dia + 号 (na fala) ou 日 (na escrita).',
      exemplos: [
        com('2026', ano(2026)),
        com('outubro', { hanzi: '十月', pinyin: 'shí yuè' }),
        com('dia 20', { hanzi: '二十号', pinyin: 'èrshí hào' }),
        com('20/10/2026', {
          hanzi: ano(2026).hanzi + '十月二十号',
          pinyin: `${ano(2026).pinyin} shí yuè èrshí hào`,
        }),
      ],
    },
    {
      titulo: 'Telefones: dígito a dígito, com 幺',
      texto: 'Números de telefone, quartos e ônibus são lidos dígito a dígito, e o 1 vira 幺 (yāo) para não confundir com 七.',
      exemplos: [com('110 (polícia)', digitoADigito('110', true)), com('120 (ambulância)', digitoADigito('120', true)), com('138 1234 5678', digitoADigito('13812345678', true))],
    },
  ];
}
