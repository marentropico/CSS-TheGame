export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: "Qual seletor CSS é usado para selecionar um elemento pelo seu ID?",
    options: [
      ".meu-id",
      "#meu-id",
      "div.meu-id",
      "*meu-id"
    ],
    correctIndex: 1,
    explanation: "Usamos o símbolo de cerquilha (#) para seletores de ID (ex: #meu-id), enquanto o ponto (.) é para seletores de classe."
  },
  {
    id: 2,
    question: "Qual propriedade CSS controla o espaço interno entre o conteúdo e a borda de um elemento?",
    options: [
      "margin",
      "border",
      "padding",
      "spacing"
    ],
    correctIndex: 2,
    explanation: "O 'padding' define o espaçamento interno de um elemento, enquanto 'margin' define o espaçamento externo (afastamento de outros elementos)."
  },
  {
    id: 3,
    question: "Como você ativa o modelo de layout unidimensional Flexbox em um container?",
    options: [
      "display: block",
      "display: flex",
      "align: flexbox",
      "flex-direction: row"
    ],
    correctIndex: 1,
    explanation: "Ao definir 'display: flex' no elemento pai (container), todos os seus filhos diretos tornam-se flex-items."
  },
  {
    id: 4,
    question: "No Flexbox com flex-direction padrão (row), qual propriedade é usada para distribuir e alinhar os itens horizontalmente?",
    options: [
      "align-items",
      "justify-content",
      "grid-template-columns",
      "align-content"
    ],
    correctIndex: 1,
    explanation: "'justify-content' alinha itens ao longo do eixo principal (horizontal por padrão), e 'align-items' os alinha ao longo do eixo transversal (vertical)."
  },
  {
    id: 5,
    question: "Qual propriedade é usada para arredondar os cantos de um container de imagem ou cartão?",
    options: [
      "border-radius",
      "border-rounded",
      "box-shadow",
      "corner-style"
    ],
    correctIndex: 0,
    explanation: "A propriedade 'border-radius' aceita valores em px, % ou em para suavizar e arredondar os cantos dos elementos."
  },
  {
    id: 6,
    question: "O que o Box Model (Modelo de Caixa) do CSS representa?",
    options: [
      "Apenas as dimensões de largura (width) e altura (height)",
      "A estrutura de arquivos de estilo dentro do projeto",
      "As camadas de Conteúdo, Preenchimento (Padding), Borda (Border) e Margem (Margin)",
      "Um modelo 3D para renderização de fontes tipográficas"
    ],
    correctIndex: 2,
    explanation: "Cada elemento HTML é renderizado como uma caixa retangular composta por: Content (conteúdo), Padding, Border e Margin."
  },
  {
    id: 7,
    question: "Como você escreve a pseudo-classe para estilizar um botão apenas quando o usuário passa o mouse por cima dele?",
    options: [
      "button::active",
      "button:click",
      "button:hover",
      "button::focus"
    ],
    correctIndex: 2,
    explanation: "A pseudo-classe ':hover' detecta a presença do cursor do mouse pairando sobre o elemento."
  },
  {
    id: 8,
    question: "Qual propriedade do CSS Grid é usada para definir a quantidade e largura de duas colunas iguais?",
    options: [
      "grid-template-columns: 1fr 1fr",
      "grid-columns: 2",
      "display: flex-grid",
      "flex-wrap: wrap"
    ],
    correctIndex: 0,
    explanation: "'grid-template-columns: 1fr 1fr' (ou repeat(2, 1fr)) cria duas colunas que ocupam frações iguais do espaço disponível."
  },
  {
    id: 9,
    question: "Qual diretiva CSS é necessária para definir os quadros-chave (timeline) de uma animação customizada?",
    options: [
      "@transition",
      "@keyframes",
      "@animation-timeline",
      "@media"
    ],
    correctIndex: 1,
    explanation: "A regra '@keyframes' seguida de um nome define os estágios da animação (ex: de 0% a 100%) que depois são aplicados com 'animation'."
  },
  {
    id: 10,
    question: "Qual é a propriedade correta para mudar a cor do texto de um elemento no CSS?",
    options: [
      "text-color",
      "font-color",
      "color",
      "background-color"
    ],
    correctIndex: 2,
    explanation: "A propriedade 'color' é usada para mudar a cor do texto. Já 'background-color' muda a cor de fundo do elemento."
  }
];
