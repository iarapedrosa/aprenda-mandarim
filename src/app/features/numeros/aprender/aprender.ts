import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NumeroChines, ano, digitoADigito, hora, numero, preco } from '../../../core/numeros/numeros';
import { CartaoSom } from '../../../shared/cartao-som/cartao-som';
import { IdiomaService } from '../../../core/i18n/idioma.service';

interface Exemplo extends NumeroChines {
  rotulo: string;
  rotuloEn?: string;
}

interface Regra {
  titulo: string;
  texto: string;
  tituloEn: string;
  textoEn: string;
  exemplos: Exemplo[];
}

const n = (valor: number): Exemplo => ({
  ...numero(valor),
  rotulo: valor.toLocaleString('pt-BR'),
  rotuloEn: valor.toLocaleString('en-US'),
});
const com = (rotulo: string, x: NumeroChines, rotuloEn?: string): Exemplo => ({ ...x, rotulo, rotuloEn });

@Component({
  selector: 'app-aprender-numeros',
  imports: [CartaoSom, RouterLink],
  template: `
    <h2>{{ i.t('De 0 a 10', 'From 0 to 10') }}</h2>
    <p>{{ i.t('A base de tudo. Toque para ouvir e repita.', 'The foundation of everything. Tap to listen and repeat.') }}</p>
    <div class="grade-numeros">
      @for (e of zeroADez; track e.rotulo) {
        <app-cartao-som [destaque]="i.tr(e, 'rotulo')" [hanzi]="e.hanzi" [pinyin]="e.pinyin" />
      }
    </div>

    @for (r of regras; track r.titulo; let idx = $index) {
      <section class="cartao regra">
        <h2><span class="numero-regra" aria-hidden="true">{{ idx + 1 }}</span> {{ i.tr(r, 'titulo') }}</h2>
        <p>{{ i.tr(r, 'texto') }}</p>
        <div class="grade-exemplos">
          @for (e of r.exemplos; track e.rotulo) {
            <app-cartao-som [destaque]="i.tr(e, 'rotulo')" [hanzi]="e.hanzi" [pinyin]="e.pinyin" />
          }
        </div>
      </section>
    }

    <p class="linha fim">
      <a class="botao botao-primario" routerLink="../praticar">{{ i.t('Praticar números', 'Practice numbers') }}</a>
      <a class="botao" routerLink="../conversor">{{ i.t('Converter qualquer número', 'Convert any number') }}</a>
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
  protected readonly i = inject(IdiomaService);
  protected readonly zeroADez = Array.from({ length: 11 }, (_, k) => n(k));

  protected readonly regras: Regra[] = [
    {
      titulo: 'De 11 a 19: 十 + unidade',
      texto: 'É só somar: dez-um, dez-dois… Bem mais simples que "onze" e "doze"!',
      tituloEn: '11 to 19: 十 + unit',
      textoEn: 'Just add: ten-one, ten-two… Much simpler than "eleven" and "twelve"!',
      exemplos: [n(11), n(12), n(15), n(19)],
    },
    {
      titulo: 'Dezenas: unidade + 十',
      texto: 'Vinte é "dois-dez" (二十), trinta e cinco é "três-dez-cinco" (三十五).',
      tituloEn: 'Tens: unit + 十',
      textoEn: 'Twenty is "two-ten" (二十), thirty-five is "three-ten-five" (三十五).',
      exemplos: [n(20), n(35), n(68), n(99)],
    },
    {
      titulo: 'Centenas (百) e o zero do meio (零)',
      texto:
        'Quando há um zero no meio, fala-se 零 (líng) uma vez só; zeros no fim não são falados. Dentro de números grandes, o 10 vira 一十: 110 = 一百一十.',
      tituloEn: 'Hundreds (百) and the middle zero (零)',
      textoEn:
        'When there is a zero in the middle, you say 零 (líng) just once; zeros at the end are not spoken. Inside big numbers, 10 becomes 一十: 110 = 一百一十.',
      exemplos: [n(100), n(105), n(110), n(350)],
    },
    {
      titulo: 'Milhares (千)',
      texto: 'Mesma lógica: 2026 = dois-mil, zero, vinte-seis.',
      tituloEn: 'Thousands (千)',
      textoEn: 'Same logic: 2026 = two-thousand, zero, twenty-six.',
      exemplos: [n(1000), n(1005), n(2026), n(3500)],
    },
    {
      titulo: '万: o chinês conta de 10 mil em 10 mil',
      texto:
        'Esta é a maior pegadinha! 万 (wàn) = 10.000. Então 100.000 = 十万 ("dez dez-mils") e 1 milhão = 一百万 ("cem dez-mils"). Para converter, separe os números em grupos de 4 dígitos a partir da direita.',
      tituloEn: '万: Chinese counts in ten-thousands',
      textoEn:
        'This is the biggest trap! 万 (wàn) = 10,000. So 100,000 = 十万 ("ten ten-thousands") and 1 million = 一百万 ("a hundred ten-thousands"). To convert, split the number into groups of 4 digits from the right.',
      exemplos: [n(10000), n(25000), n(100000), n(1000000)],
    },
    {
      titulo: '两 (liǎng) ou 二 (èr)?',
      texto:
        'Para contar coisas usa-se 两: 两个人 (duas pessoas). No começo de 百, 千 e 万 também: 两百, 两千, 两万. Já em 12 (十二), 20 (二十) e "segundo" (第二) usa-se 二.',
      tituloEn: '两 (liǎng) or 二 (èr)?',
      textoEn:
        'To count things you use 两: 两个人 (two people). Also at the start of 百, 千 and 万: 两百, 两千, 两万. But in 12 (十二), 20 (二十) and "second" (第二) you use 二.',
      exemplos: [com('2 pessoas', { hanzi: '两个人', pinyin: 'liǎng ge rén' }, '2 people'), n(200), n(2000), n(12)],
    },
    {
      titulo: 'O tom de 一 muda',
      texto: 'Sozinho é yī, mas antes de 百 e 千 vira yì, e antes de 万 vira yí (sandhi tonal).',
      tituloEn: 'The tone of 一 changes',
      textoEn: 'On its own it is yī, but before 百 and 千 it becomes yì, and before 万 it becomes yí (tone sandhi).',
      exemplos: [n(1), n(100), n(1000), n(10000)],
    },
    {
      titulo: 'Dinheiro: 块 e 毛',
      texto:
        'O yuan se chama 元 por escrito, mas na fala é 块 (kuài). 毛 (máo) = 10 centavos. No fim, o 毛 costuma ficar implícito: 十二块五 = 12,50.',
      tituloEn: 'Money: 块 and 毛',
      textoEn:
        'The yuan is written 元, but in speech it is 块 (kuài). 毛 (máo) = 10 cents. At the end, 毛 is usually left out: 十二块五 = 12.50.',
      exemplos: [
        com('2 yuans', preco(2), '2 yuan'),
        com('12,50', preco(12.5), '12.50'),
        com('0,50', preco(0.5), '0.50'),
        com('99,90', preco(99.9), '99.90'),
      ],
    },
    {
      titulo: 'Horas: 点, 分 e 半',
      texto: '点 (diǎn) = hora, 分 (fēn) = minuto, 半 (bàn) = meia. 2 horas é 两点.',
      tituloEn: 'Time: 点, 分 and 半',
      textoEn: '点 (diǎn) = o’clock, 分 (fēn) = minute, 半 (bàn) = half. 2 o’clock is 两点.',
      exemplos: [com('8:00', hora(8, 0)), com('8:30', hora(8, 30)), com('2:15', hora(2, 15)), com('10:05', hora(10, 5))],
    },
    {
      titulo: 'Datas: ano, mês e dia',
      texto:
        'A ordem é do maior para o menor: ano (dígito a dígito) + 年, mês + 月, dia + 号 (na fala) ou 日 (na escrita).',
      tituloEn: 'Dates: year, month and day',
      textoEn:
        'The order goes from biggest to smallest: year (digit by digit) + 年, month + 月, day + 号 (spoken) or 日 (written).',
      exemplos: [
        com('2026', ano(2026)),
        com('outubro', { hanzi: '十月', pinyin: 'shí yuè' }, 'October'),
        com('dia 20', { hanzi: '二十号', pinyin: 'èrshí hào' }, 'the 20th'),
        com(
          '20/10/2026',
          {
            hanzi: ano(2026).hanzi + '十月二十号',
            pinyin: `${ano(2026).pinyin} shí yuè èrshí hào`,
          },
          'Oct 20, 2026',
        ),
      ],
    },
    {
      titulo: 'Telefones: dígito a dígito, com 幺',
      texto: 'Números de telefone, quartos e ônibus são lidos dígito a dígito, e o 1 vira 幺 (yāo) para não confundir com 七.',
      tituloEn: 'Phone numbers: digit by digit, with 幺',
      textoEn: 'Phone, room and bus numbers are read digit by digit, and 1 becomes 幺 (yāo) so it isn’t confused with 七.',
      exemplos: [
        com('110 (polícia)', digitoADigito('110', true), '110 (police)'),
        com('120 (ambulância)', digitoADigito('120', true), '120 (ambulance)'),
        com('138 1234 5678', digitoADigito('13812345678', true)),
      ],
    },
  ];
}
