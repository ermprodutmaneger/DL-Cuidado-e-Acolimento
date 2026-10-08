# DL Cuidado e Acolhimento — site one-page

Site institucional de uma página sobre **Home Care para idosos**, com a enfermeira Daniela Lina.
HTML + CSS + JavaScript puros, sem framework e sem build. Tudo roda local, sem CDN.

---

## 1. Como ver o site

Abra o arquivo `index.html` no navegador — ou, melhor, sirva a pasta por um servidor local:

```bash
python3 -m http.server 3000
# depois abra http://localhost:3000
```

> Servir por HTTP é recomendado: abre o site com as fontes e as imagens no caminho correto e
> deixa o Instagram/WhatsApp lerem as meta tags OG.

---

## 2. Estrutura de arquivos

```
index.html              ← todo o conteúdo do site (textos, seções, links)
css/fonts.css           ← @font-face das fontes locais
css/style.css           ← tokens de cor, tipografia e todo o layout
js/main.js              ← animações (GSAP), scroll suave (Lenis), menu, cursor
js/vendor/              ← gsap.min.js · ScrollTrigger.min.js · SplitText.min.js · lenis.min.js
fonts/                  ← Fraunces e Manrope em .woff2 (variáveis, self-hosted)
img/
  logo.png · logo.webp              ← logo enviada, sem alteração (só recorte do transparente)
  hero.jpg · hero.webp              ← foto horizontal do hero
  galeria.jpg · galeria.webp        ← retrato da galeria "Home Care"
  sobre.jpg · sobre.webp            ← retrato de fundo branco (Sobre Daniela)
  og.jpg                            ← imagem 1200×630 de compartilhamento (logo + foto)
  favicon.svg · favicon-180.png · favicon-32.png
uploads/                ← os arquivos originais que você enviou (guardados como fonte)
LEIA-ME.md              ← este arquivo
```

---

## 3. Onde trocar o que você vai querer trocar

### 3.1 Número do COREN (removido — como recolocar)

O campo do COREN-SP **não está no site**. Para exibi-lo, cole este bloco em
`index.html`, logo depois da lista de chips da seção **Sobre Daniela**:

```html
<p class="coren" data-reveal>
  COREN-SP: <span>123456</span>
</p>
```

…e este CSS em `css/style.css` (pode ir depois da regra `.sobre__chips`):

```css
.coren {
  margin-top: 8px;
  padding: 20px 22px;
  border-radius: var(--r-1);
  border: 1px dashed rgba(25, 63, 50, .28);
  background: rgba(166, 181, 138, .14);
  font-size: 14px;
  font-weight: 700;
  color: var(--fg);
  letter-spacing: .01em;
}
.coren span { color: var(--fg-2s); font-weight: 500; }
```

Sem o campo, o site segue correto e sem inventar dado nenhum.

### 3.2 Links e número de WhatsApp

O número aparece em 6 lugares, todos em `index.html`:

| Onde | Link |
|---|---|
| Nav (botão do topo) | `https://wa.me/5511961147268` |
| Hero — "Conversar com Daniela" | `https://wa.me/5511961147268` |
| Galeria — card 01 | `...?text=Olá, Daniela! Gostaria de conversar sobre o Home Care` |
| Galeria — card 02 | `...?text=Olá, Daniela! Gostaria de conversar sobre o Home Care` |
| Galeria — card 05 | `https://wa.me/5511961147268` |
| Contato + botão flutuante + rodapé do menu | `https://wa.me/5511961147268` |

Para trocar o número, use localizar-e-substituir por `5511961147268` → o número novo.
Isso alcança todos os lugares, **inclusive o pré-formulário** (`WA_NUMBER` no
`js/main.js` — ver item 3.6).
O link com texto pronto usa a frase URL-codificada
(`Ol%C3%A1%2C%20Daniela%21%20Gostaria%20de%20conversar%20sobre%20o%20Home%20Care`);
se quiser mudar a frase, codifique os acentos e espaços (ou me peça que eu troco).

### 3.3 Textos

Todos os textos estão direto no `index.html`, em ordem de leitura, dentro de cada
`<section>`. Os títulos com uma palavra em itálico colorido usam:

```html
<h2 data-split-lines>Quem <em class="grad">cuida.</em></h2>
```

- `data-split-lines` = o título é dividido em linhas e animado (não remova).
- `class="grad"` = a palavra recebe o itálico com gradiente. Pode mover para outra palavra.

O manifesto (parágrafo cujas palavras acendem) é o `<p class="lead" data-manifesto>`.
Os elementos com `data-reveal` apenas aparecem ao rolar.

### 3.4 Fotos e logo

Os arquivos originais enviados estão em `uploads/` e as versões usadas em `img/`.

Para trocar uma foto, substitua **os dois formatos** (`.webp` e `.jpg`) mantendo o mesmo
nome, ou gere novos com:

```bash
# WebP (moderno) + JPG (fallback)
cwebp -q 84 foto.jpg -o img/sobre.webp
```

Medidas usadas:

| Arquivo | Proporção | Observação |
|---|---|---|
| `hero` | 3:2 (horizontal) | usada inteira, sem corte |
| `galeria` | 2:3 (retrato) | corte horizontal — a altura inteira aparece |
| `sobre` | 2:3 (retrato) | corte horizontal — a altura inteira aparece |

**Importante sobre os retratos:** as fotos têm a cabeça próxima ao topo do enquadramento.
O parallax interno foi calibrado para que o rosto nunca seja cortado (o `.frame__inner`
tem 110% da altura da moldura e desliza apenas 5% — veja o item 5.4). Se trocar a foto por
uma com o rosto mais baixo, dá para aumentar esse valor em `js/main.js`.

### 3.5 Logo

Usada exatamente como enviada (sem recolorir, sem esticar). Só foi removido o espaço
transparente em volta. Aparece em 4 lugares: abertura, nav, menu mobile e rodapé.

No **menu mobile** (fundo verde profundo) ela fica sobre uma pílula off-white — assim a
logo continua legível sem precisar alterar as cores dela.

---

## 3.6 Pré-formulário do WhatsApp

Fica no fim da seção **Contato**. A pessoa escreve **nome**, **necessidade** e, se quiser,
**um pouco sobre a história clínica**; ao enviar, o WhatsApp abre com a mensagem já
escrita. **Nenhum dado é salvo ou enviado para servidor nenhum** — o formulário só monta
o link `wa.me` e abre uma nova aba.

Mensagem que chega para a Daniela:

```
Olá, Daniela! Tudo bem?

Meu nome é [nome].

*Qual é a necessidade:*
[necessidade]

*Um pouco sobre a história clínica:*
[história]          ← só aparece se a pessoa preencher

Podemos conversar?
```

### Onde mexer

| O que | Onde |
|---|---|
| Texto da mensagem | `js/main.js`, função `initPreForm`, variável `msg` |
| Número do WhatsApp | `js/main.js`, `var WA_NUMBER = '5511961147268'` |
| Rótulos e textos dos campos | `index.html`, bloco `<form class="preform">` |
| Visual (cores, bordas, cantos) | `css/style.css`, bloco "Pré-formulário" |

### Campos

| Campo | Obrigatório | Limite |
|---|---|---|
| Seu nome | sim (mín. 2 letras) | 60 caracteres |
| Qual é a necessidade? | sim (mín. 5 letras) | 300 caracteres |
| Um pouco sobre a história clínica | **opcional** | 500 caracteres |

Os limites existem para a mensagem nunca estourar o tamanho que o `wa.me` aceita
(há também uma trava de segurança no código, se o link passar de 2.000 caracteres).

Se a validação falhar, aparece a mensagem em vermelho e o foco vai para o campo.
Se o navegador bloquear o popup, aparece um link "Se o WhatsApp não abriu, toque aqui".

> **Por que a história clínica é opcional:** é um dado sensível (LGPD). O texto do campo
> diz isso à pessoa. Se você preferir torná-la obrigatória, acrescente `required` no
> `<textarea id="pf-historia">` e inclua o campo na validação em `initPreForm`.

---

## 4. Cores, tipografia e ajustes de acessibilidade

Os tokens da identidade estão no começo de `css/style.css`:

```css
--bg:#FAF9F6  --fg:#193F32  --sage:#A6B58A  --terra:#D98B71  --card:#FFFFFF
```

Além deles, existem **quatro variantes derivadas criadas só para cumprir contraste AA**
(texto legível). Se você preferir a cor original mesmo assim, é uma linha cada:

| Variável | Por que existe | Como voltar ao original |
|---|---|---|
| `--grad-ink` | gradiente escurecido para **texto** em gradiente (o `--grad` puro fica claro demais sobre o fundo off-white) | troque por `var(--grad)` |
| `--grad-btn` | gradiente escurecido para o **fundo do botão** com texto branco | troque por `var(--grad)` |
| `--terra-ink` | terracota escurecido para os rótulos de 11px | troque por `var(--terra)` |
| `--fg-2s` | verde profundo a 80% para texto secundário pequeno | troque por `var(--fg-2)` |

`--fg-3` (45%) ficou definido mas **só é usado em detalhes decorativos**, nunca em texto.

Tipografia: **Fraunces** variável nos títulos (`opsz 144`, `SOFT 40`, peso 500) e
**Manrope** no corpo. Ambas em `fonts/` e declaradas em `css/fonts.css`. Os arquivos de
fonte são pré-carregados no `<head>` do `index.html`.

---

## 5. Movimento — onde calibrar

Tudo está em `js/main.js`, em funções separadas e nomeadas.

### 5.1 Abertura (`runIntro`)

- Aparece **só na primeira visita** (guardado em `sessionStorage('dl-intro')`).
- Duração: logo 0,9 s + saída 0,95 s, **com teto de 2 s**. Sai assim que `window.load` e
  `document.fonts.ready` resolvem.
- Sem contador e sem porcentagem — só a logo e uma linha sálvia.
- Para desativar de vez: apague a classe `intro-on` da lógica do `<head>`.

### 5.2 Scroll suave (`initLenis`)

`lerp: 0.085`, `wheelMultiplier: 0.95`. Para desligar, comente a chamada `initLenis()`.

### 5.3 Galeria horizontal (`initGallery`)

- **≥ 900 px**: seção pinada, track desliza na horizontal, barra de progresso embaixo,
  leve inclinação (skew) conforme a velocidade do scroll.
- **< 900 px**: sem pin — rolagem horizontal nativa com `scroll-snap`.

### 5.4 Parallax interno das fotos (`initImages`)

Em vez de escalar a imagem (que cortaria o topo da cabeça), a foto fica dentro de um
wrapper `.frame__inner` com **110% da altura** da moldura e desliza **5%** por dentro dela.
Resultado: o movimento existe, mas o rosto nunca é cortado e nunca aparece nenhum vão.

```js
gsap.fromTo(inner, { yPercent: 0 }, { yPercent: -5, ... })
```

### 5.5 Marquee (`initMarquee`)

Velocidade base de 72 px/s (≈1,2 px/frame) + velocidade do scroll com decaimento de 0,92.

### 5.6 Outras peças

`initCursor` (ponto + anel, só em telas com mouse ≥ 900 px) · `initMagnets` (botões
imantados, 35% da distância do mouse) · `initNav` (nav sobe ao rolar para baixo, volta ao
subir) · `initWA` (botão flutuante) · `initSplitLines` e `initReveals` (entradas).

---

## 6. `prefers-reduced-motion`

Se o sistema do visitante pedir menos movimento, o site automaticamente: **não** mostra a
abertura, **não** usa scroll suave, **não** mostra o cursor custom, deixa o marquee parado,
zera os deslocamentos e mostra todo o conteúdo visível de imediato.

---

## 8. Antes de publicar

- [ ] *(opcional)* Exibir o **COREN-SP** na seção Sobre (item 3.1).
- [ ] Em `index.html`, descomentar e preencher o `<link rel="canonical">` (já deixei
      um modelo comentado com a URL do GitHub Pages).
- [ ] Trocar as URLs relativas por absolutas nas meta tags OG e no JSON-LD:
      `og:image`, `twitter:image` e `"image"` do JSON-LD → `https://seudominio.com.br/img/og.jpg`.
- [ ] O JSON-LD tem **só** os dados fornecidos (nome, descrição e telefone). Se quiser,
      acrescente `address`, `openingHours` ou `areaServed` — mas só com dados reais.
- [ ] Hospedar em HTTPS e testar num celular de verdade.

---

## 7. Publicando

### 7.1 No GitHub Pages (recomendado)

1. Crie um repositório: **https://github.com/new**
2. Suba **todo o conteúdo desta pasta** (arquivos + pastas `css`, `js`,
   `fonts`, `img`) pela tela de upload do repositório.
3. **Settings → Pages** → *Deploy from a branch* → `main` → **/ (root)** → Save.
4. Endereço final: `https://SEU-USUARIO.github.io/NOME-DO-REPOSITORIO/`

O `.nojekyll` já está na pasta — pode subir junto, sem mexer.

**Pelo iPhone:** use a pasta `home-care-unico/` (fora desta), que tem o site
inteiro em um só `index.html` + o `og.jpg`. O iPhone não deixa subir pastas
inteiras, então esse é o caminho que funciona pelo celular.

### 7.2 No Netlify

1. Abra **https://app.netlify.com/drop**
2. Arraste **somente** o arquivo `home-care-unico/index.html`
3. Pronto — o Netlify gera um endereço na hora.

> Existe um arquivo único porque, ao publicar pelo iPhone/Safari, o Netlify
> às vezes recusa o ZIP com vários arquivos ("This doesn't appear to be a
> valid zip archive"), mesmo o ZIP estando íntegro.

## 9. Regras de conteúdo — o que **não** fazer

O site foi escrito dentro destas regras. Ao editar textos, mantenha-as:

1. **Nada inventado**: sem avaliações, depoimentos, números de atendimentos, equipe,
   tempo de experiência, títulos, especializações, cursos, certificados, registro,
   preços, horários, endereço, área de cobertura, disponibilidade, Instagram ou outros
   contatos.
2. **Só Home Care para idosos.** Não citar terapias, consultório, atendimento online nem
   qualquer outra frente de atuação — em lugar nenhum do site.
3. **Sem promessas** de cura, recuperação ou resultado. O cuidado domiciliar não substitui
   médicos, equipe de saúde ou outros acompanhamentos — e o site não sugere isso.
4. **As fotos são as enviadas**, sem montagem e sem texto sobreposto falso.
5. Sempre que faltar informação, o texto convida a pessoa a **falar diretamente com a
   Daniela** — é assim em todo o site.

---

## 9. Suporte

- **GSAP 3.13** (gsap, ScrollTrigger, SplitText) e **Lenis 1.3.11** estão em `js/vendor/`
  e são carregados localmente — nada vem da internet.
- Se algum dia um arquivo de `js/vendor/` faltar, o site **não quebra**: entra a classe
  `no-anim` e todo o conteúdo fica visível, sem animação.
- Testado em 390 px, 768 px e 1440 px: zero overflow horizontal e console limpo.
