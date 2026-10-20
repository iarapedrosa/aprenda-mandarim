# 学中文 · Aprenda Mandarim

Site para aprender mandarim do zero e praticar todos os dias — feito para falantes de português brasileiro.

> 🚧 Em desenvolvimento. Este README será completado ao longo das etapas.

## Stack

- [Angular](https://angular.dev) 22 (standalone components, signals, rotas com lazy loading)
- PWA instalável com funcionamento offline (`@angular/pwa`)
- [hanzi-writer](https://hanziwriter.org) (ordem dos traços e escrita) e [pinyin-pro](https://github.com/zh-lx/pinyin-pro)
- Web Speech API (síntese e reconhecimento de voz em `zh-CN`)
- Site 100% estático, com deploy na [Vercel](https://vercel.com)

## Como rodar localmente

Requisitos: Node.js 22.22.3+ ou 24 (veja `.nvmrc`).

```bash
nvm use        # se você usa nvm
npm install
npm start      # http://localhost:4200
```

## Licença

[MIT](LICENSE)
