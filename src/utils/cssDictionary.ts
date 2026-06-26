export interface CSSPropertyDoc {
  description: string;
  syntax: string;
  expectedValues: string[];
  examples: string[];
}

export const cssDictionary: { [key: string]: CSSPropertyDoc } = {
  "display": {
    description: "Define o modelo de exibição e layout do elemento (ex: Flexbox, Grid, bloco ou em linha).",
    syntax: "display: flex | grid | block | inline-block | none;",
    expectedValues: [
      "flex: ativa o modelo flexível de 1 dimensão (linhas ou colunas).",
      "grid: ativa o modelo de grelha bidimensional (linhas e colunas).",
      "block: elemento de bloco (ocupa largura total e começa em nova linha).",
      "inline-block: elemento em linha que aceita largura e altura.",
      "none: oculta o elemento completamente."
    ],
    examples: [
      "display: flex;",
      "display: grid;",
      "display: block;"
    ]
  },
  "grid-template-columns": {
    description: "Especifica o número e a largura das colunas em um layout de CSS Grid.",
    syntax: "grid-template-columns: repeat(qnt, tamanho) | valor1 valor2 ...;",
    expectedValues: [
      "repeat(quantidade, tamanho): cria múltiplas colunas iguais. Ex: repeat(2, 1fr) cria 2 colunas de 1 fração cada.",
      "fr: frações do espaço disponível (ex: 1fr 1fr cria duas colunas iguais).",
      "px, rem, %: tamanhos estáticos ou dinâmicos específicos."
    ],
    examples: [
      "grid-template-columns: repeat(2, 1fr);",
      "grid-template-columns: 1fr 1fr;",
      "grid-template-columns: 200px 1fr;"
    ]
  },
  "grid-template-rows": {
    description: "Define a quantidade e a altura das linhas em um layout de CSS Grid.",
    syntax: "grid-template-rows: repeat(qnt, tamanho) | valor1 valor2 ...;",
    expectedValues: [
      "repeat(quantidade, tamanho): cria múltiplas linhas estruturadas.",
      "fr: frações da altura livre.",
      "auto: ajusta a altura com base no conteúdo interno."
    ],
    examples: [
      "grid-template-rows: repeat(3, 100px);",
      "grid-template-rows: 1fr auto;"
    ]
  },
  "gap": {
    description: "Define os espaçamentos (sarjetas) entre as linhas e colunas de elementos Flexbox ou Grid.",
    syntax: "gap: tamanho | linha coluna;",
    expectedValues: [
      "px (ex: 16px): espaçamento em pixels.",
      "rem, em: espaçamentos proporcionais à fonte.",
      "um ou dois valores: se passar um valor, aplica a linhas e colunas. Se passar dois, ex: '10px 20px', o primeiro é para linhas e o segundo para colunas."
    ],
    examples: [
      "gap: 16px;",
      "gap: 1rem;",
      "gap: 20px 10px;"
    ]
  },
  "justify-content": {
    description: "Distribui o espaço livre e alinha os itens de um container Flexbox ou Grid ao longo de seu eixo principal (horizontal por padrão).",
    syntax: "justify-content: center | space-between | space-around | flex-start | flex-end;",
    expectedValues: [
      "center: centraliza os itens horizontalmente.",
      "space-between: distribui os itens uniformemente, com o primeiro colado no início e o último no fim.",
      "space-around: distribui os itens com espaço igual ao redor de cada um.",
      "space-evenly: distribui espaço de forma que o espaço entre dois itens seja exatamente igual.",
      "flex-start / flex-end: alinha os itens ao início ou fim do container."
    ],
    examples: [
      "justify-content: center;",
      "justify-content: space-between;",
      "justify-content: flex-end;"
    ]
  },
  "align-items": {
    description: "Alinha os itens de um container Flexbox ou Grid no eixo transversal/vertical (perpendicular ao justify-content).",
    syntax: "align-items: center | stretch | flex-start | flex-end | baseline;",
    expectedValues: [
      "center: centraliza os elementos verticalmente.",
      "stretch (padrão): estica os elementos para preencherem toda a altura do container.",
      "flex-start: alinha os elementos no topo.",
      "flex-end: alinha os elementos na base."
    ],
    examples: [
      "align-items: center;",
      "align-items: stretch;",
      "align-items: flex-start;"
    ]
  },
  "background-color": {
    description: "Define a cor de fundo de um elemento.",
    syntax: "background-color: cor;",
    expectedValues: [
      "HEX (ex: #3b82f6): representação hexadecimal de cor.",
      "RGB/RGBA (ex: rgba(0,0,0,0.5)): formato funcional que permite transparência (alfa).",
      "Nomes de cores padrão (ex: white, transparent, red)."
    ],
    examples: [
      "background-color: #3b82f6;",
      "background-color: rgba(59, 130, 246, 0.2);",
      "background-color: transparent;"
    ]
  },
  "color": {
    description: "Define a cor de primeiro plano do elemento (cor do texto e dos ícones).",
    syntax: "color: cor;",
    expectedValues: [
      "HEX: códigos de cores como #ffffff.",
      "RGB/RGBA: cores com suporte opcional a opacidade.",
      "Nomes: white, black, red, inherit."
    ],
    examples: [
      "color: #ffffff;",
      "color: rgba(255, 255, 255, 0.9);"
    ]
  },
  "padding": {
    description: "Define a folga interna (espaçamento) entre o conteúdo do elemento e suas bordas.",
    syntax: "padding: tamanho | top/bottom left/right | top right bottom left;",
    expectedValues: [
      "px (ex: 16px): tamanho fixo em pixels.",
      "rem, em: tamanho flexível relativo à tipografia.",
      "Um a quatro valores: '16px' (todos), '10px 20px' (vertical horizontal), '5px 10px 15px 20px' (topo direita base esquerda, sentido horário)."
    ],
    examples: [
      "padding: 16px;",
      "padding: 12px 24px;",
      "padding-top: 15px;"
    ]
  },
  "margin": {
    description: "Define o espaço vazio do lado de fora das bordas do elemento (espaçamento externo).",
    syntax: "margin: tamanho | auto | top/bottom left/right;",
    expectedValues: [
      "px, rem: valores de espaçamento externo.",
      "auto: usado para centralizar elementos de bloco horizontalmente quando possuem largura fixa (ex: 'margin: 0 auto;')."
    ],
    examples: [
      "margin: 20px;",
      "margin: 0 auto;",
      "margin-top: 15px;"
    ]
  },
  "border": {
    description: "Define a borda de um elemento. É uma propriedade abreviada que define largura, estilo e cor simultaneamente.",
    syntax: "border: largura estilo cor;",
    expectedValues: [
      "largura: em px (ex: 2px) ou rem.",
      "estilos aceitos: solid (sólida), dashed (tracejada), dotted (pontilhada), double.",
      "cor: cor da borda, ex: #ef4444."
    ],
    examples: [
      "border: 2px solid #ef4444;",
      "border: 1px dashed #cbd5e1;"
    ]
  },
  "border-radius": {
    description: "Arredonda os cantos das bordas de um elemento.",
    syntax: "border-radius: tamanho | top-left top-right bottom-right bottom-left;",
    expectedValues: [
      "px (ex: 8px, 12px): raio em pixels.",
      "% (ex: 50%): ideal para transformar elementos quadrados em círculos perfeitos."
    ],
    examples: [
      "border-radius: 12px;",
      "border-radius: 50%;"
    ]
  },
  "box-shadow": {
    description: "Aplica uma ou mais sombras ao redor de um elemento, proporcionando profundidade e elevação visual.",
    syntax: "box-shadow: horizontal vertical desfoque cor;",
    expectedValues: [
      "horizontal / vertical: deslocamento da sombra (ex: 0px 4px).",
      "desfoque (blur): quão borrada a sombra é (ex: 10px).",
      "cor: preferencialmente RGBA com canal alfa para sombras suaves (ex: rgba(0,0,0,0.1))."
    ],
    examples: [
      "box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);",
      "box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);"
    ]
  },
  "font-size": {
    description: "Define o tamanho da letra do texto.",
    syntax: "font-size: tamanho;",
    expectedValues: [
      "px (ex: 32px): pixels para controle exato.",
      "rem, em: dinâmico, baseado no tamanho raiz (ex: 1.5rem).",
      "keywords: small, medium, large, x-large."
    ],
    examples: [
      "font-size: 32px;",
      "font-size: 1.25rem;"
    ]
  },
  "font-weight": {
    description: "Define o peso ou espessura dos caracteres da fonte.",
    syntax: "font-weight: normal | bold | número;",
    expectedValues: [
      "normal: peso padrão (equivalente a 400).",
      "bold: negrito tradicional (equivalente a 700).",
      "valores numéricos: 100 (muito fino) a 900 (muito grosso), em incrementos de 100."
    ],
    examples: [
      "font-weight: bold;",
      "font-weight: 600;",
      "font-weight: 300;"
    ]
  },
  "text-align": {
    description: "Define o alinhamento horizontal do texto dentro de sua caixa.",
    syntax: "text-align: left | center | right | justify;",
    expectedValues: [
      "left: alinha à esquerda (padrão).",
      "center: centraliza o texto.",
      "right: alinha à direita.",
      "justify: estica as linhas para terem larguras iguais, preenchendo as margens."
    ],
    examples: [
      "text-align: center;",
      "text-align: justify;"
    ]
  },
  "cursor": {
    description: "Define o estilo do ponteiro do mouse ao pairar sobre o elemento.",
    syntax: "cursor: ponteiro;",
    expectedValues: [
      "pointer: exibe o ícone de 'mãozinha', indicando que o elemento é clicável (links, botões).",
      "default: seta padrão.",
      "not-allowed: círculo vermelho cortado, indicando elemento bloqueado."
    ],
    examples: [
      "cursor: pointer;",
      "cursor: not-allowed;"
    ]
  },
  "transition": {
    description: "Permite animar suavemente a alteração de propriedades CSS ao longo do tempo (suaviza hovers).",
    syntax: "transition: propriedade duração curva;",
    expectedValues: [
      "propriedade: all (todas), transform, background-color, etc.",
      "duração: em segundos (ex: 0.3s) ou milissegundos (ex: 300ms).",
      "curva de velocidade: ease (suave nas pontas), linear (velocidade constante), ease-in-out."
    ],
    examples: [
      "transition: all 0.3s ease;",
      "transition: background-color 0.2s;"
    ]
  },
  "transform": {
    description: "Aplica transformações geométricas ao elemento, permitindo girar, redimensionar ou mover de posição.",
    syntax: "transform: scale() | rotate() | translate();",
    expectedValues: [
      "scale(fator): altera o tamanho. Ex: scale(1.05) aumenta em 5%.",
      "rotate(graus): gira o elemento. Ex: rotate(45deg) gira 45 graus.",
      "translate(x, y): move o elemento nas coordenadas horizontal/vertical."
    ],
    examples: [
      "transform: scale(1.05);",
      "transform: rotate(15deg);",
      "transform: translate(10px, 20px);"
    ]
  },
  "animation": {
    description: "Associa uma animação definida por @keyframes ao elemento, controlando sua execução.",
    syntax: "animation: nome duração iterações curva;",
    expectedValues: [
      "nome: o identificador da regra @keyframes correspondente.",
      "duração: tempo da animação (ex: 2s).",
      "iterações: número de vezes (ex: 1, 2) ou 'infinite' para rodar para sempre."
    ],
    examples: [
      "animation: pulse 2s infinite ease-in-out;",
      "animation: slideIn 0.5s forwards;"
    ]
  },
  "flex-direction": {
    description: "Define a direção do eixo principal onde os itens flexíveis serão empilhados.",
    syntax: "flex-direction: row | column | row-reverse | column-reverse;",
    expectedValues: [
      "row (padrão): distribui horizontalmente da esquerda para a direita.",
      "column: distribui verticalmente de cima para baixo.",
      "row-reverse / column-reverse: inverte a ordem de distribuição."
    ],
    examples: [
      "flex-direction: column;",
      "flex-direction: row;"
    ]
  },
  "aspect-ratio": {
    description: "Define uma proporção física preferencial para o elemento (razão entre largura e altura).",
    syntax: "aspect-ratio: largura / altura | valor;",
    expectedValues: [
      "16 / 9: proporção de vídeo widescreen padrão.",
      "1 / 1: quadrado perfeito.",
      "4 / 3: formato de tela clássica."
    ],
    examples: [
      "aspect-ratio: 16 / 9;",
      "aspect-ratio: 1 / 1;"
    ]
  },
  "object-fit": {
    description: "Controla como o conteúdo de tags de mídia (como <img> ou <video>) se encaixa em sua caixa quando tem proporções diferentes.",
    syntax: "object-fit: cover | contain | fill | none;",
    expectedValues: [
      "cover: preenche todo o container recortando as sobras se necessário (mantém proporção).",
      "contain: mostra a imagem completa sem cortes, adicionando barras pretas/vazias nas laterais (mantém proporção).",
      "fill (padrão): estica a imagem para preencher toda a largura e altura, distorcendo-a."
    ],
    examples: [
      "object-fit: cover;",
      "object-fit: contain;"
    ]
  },
  "filter": {
    description: "Aplica efeitos de pós-processamento gráfico ao elemento (ex: desfoque, brilho ou preto e branco).",
    syntax: "filter: blur() | brightness() | grayscale() ...;",
    expectedValues: [
      "blur(pixels): adiciona desfoque gaussiano (ex: blur(2px)).",
      "brightness(fator): ajusta o brilho (ex: brightness(1.2) aumenta em 20%).",
      "grayscale(porcentagem): deixa em tons de cinza (ex: grayscale(100%))."
    ],
    examples: [
      "filter: blur(2px);",
      "filter: blur(0px) brightness(1.2);",
      "filter: grayscale(100%);"
    ]
  },
  "--primary-color": {
    description: "Variável CSS personalizada (Custom Property) para cor primária. Facilita mudanças globais.",
    syntax: "declaração: --primary-color: #f43f5e; | leitura: var(--primary-color);",
    expectedValues: [
      "Armazena qualquer tom de cor válido."
    ],
    examples: [
      "--primary-color: #f43f5e;",
      "background-color: var(--primary-color);"
    ]
  },
  "--radius": {
    description: "Variável CSS personalizada para armazenar o raio dos cantos arredondados, mantendo consistência no layout.",
    syntax: "declaração: --radius: 20px; | leitura: var(--radius);",
    expectedValues: [
      "Armazena qualquer valor de dimensão válido."
    ],
    examples: [
      "--radius: 20px;",
      "border-radius: var(--radius);"
    ]
  }
};
