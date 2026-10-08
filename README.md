# DL Cuidado e Acolhimento — Home Care para idosos

Site institucional de uma página sobre **Home Care para idosos**, com a
enfermeira Daniela Lina. HTML, CSS e JavaScript puros — sem framework, sem
build e sem nenhuma dependência externa (fontes e bibliotecas de animação
estão todas na pasta).

## Como publicar no GitHub Pages

1. Crie um repositório e suba **o conteúdo desta pasta** (arraste os arquivos
   e as pastas para a área de upload do GitHub).
2. Vá em **Settings → Pages**.
3. Em **Source**, escolha **Deploy from a branch**.
4. Em **Branch**, escolha **main** e a pasta **/ (root)**. Salve.
5. Espere 1 ou 2 minutos. O site fica em:

   `https://SEU-USUARIO.github.io/NOME-DO-REPOSITORIO/`

O arquivo `.nojekyll` já está aqui: ele faz o GitHub servir os arquivos como
estão, sem processamento extra.

## Estrutura

```
index.html      a página inteira
css/            estilos e fontes
fonts/          Fraunces e Manrope (arquivos locais)
js/             animações, menu, galeria, dúvidas e formulário
js/vendor/      GSAP, ScrollTrigger, SplitText e Lenis (locais)
img/            logotipo, fotos e ícones
```

## Formulário

Ele **não salva nada**: a pessoa preenche e o site abre o WhatsApp dela com a
mensagem já escrita. Não existe servidor, integração nem banco de dados — por
isso não há o que configurar.

O WhatsApp de destino está em `js/main.js` e nos links do `index.html`:
procure por `5511961147268` para trocar.

## Antes de divulgar

Confira o `LEIA-ME.md`. Ele lista o que foi escrito de forma genérica
(coren, valores, horários, endereço, cobertura) e precisa ser preenchido com
os dados reais da Daniela.
