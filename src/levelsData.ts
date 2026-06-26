import { Level } from "./types";

// Helper to get computed style
const getComputedProp = (el: HTMLElement | null, prop: string): string => {
  if (!el) return "";
  return window.getComputedStyle(el).getPropertyValue(prop).trim();
};

// Helper to check colors (both RGB and HEX)
const checkColor = (colorStr: string, allowed: string[]): boolean => {
  const clean = colorStr.toLowerCase().replace(/\s+/g, "");
  return allowed.some(a => {
    const cleanAllowed = a.toLowerCase().replace(/\s+/g, "");
    return clean.includes(cleanAllowed) || clean === cleanAllowed;
  });
};

export const levels: Level[] = [
  {
    id: 1,
    title: "Seletores Básicos e Cores",
    category: "Básico",
    difficulty: "Fácil",
    description: "Os seletores são a base do CSS. Eles definem quais elementos HTML serão estilizados. Neste nível, você aprenderá a selecionar uma classe específica e aplicar uma cor de fundo e cor de texto.",
    instructions: [
      "Selecione o elemento com a classe `.target-box`.",
      "Defina a cor de fundo (`background-color`) para o tom azul `#3b82f6`.",
      "Defina a cor do texto (`color`) para branco `#ffffff`.",
      "Adicione um preenchimento interno (`padding`) de `16px` para dar espaço ao texto."
    ],
    initialHtml: `<div class="target-box">\n  Olá, Mundo do CSS!\n</div>`,
    initialCss: `/* Escreva seu CSS aqui */\n.target-box {\n  \n}`,
    solutionCss: `.target-box {\n  background-color: #3b82f6;\n  color: #ffffff;\n  padding: 16px;\n}`,
    hints: [
      "Use o seletor de classe iniciando com ponto: `.target-box`.",
      "Defina `background-color: #3b82f6;`.",
      "Use `color: #ffffff;` ou `color: white;` para o texto.",
      "Não esqueça de terminar as declarações com ponto e vírgula `;`."
    ],
    validationRules: [
      {
        id: "l1_selector",
        description: "Selecionou a classe `.target-box` e aplicou estilos",
        validate: (container, css) => {
          const el = container.querySelector(".target-box") as HTMLElement;
          if (!el) return false;
          // Check if some style is applied
          const bg = getComputedProp(el, "background-color");
          return bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent" && bg !== "";
        }
      },
      {
        id: "l1_bg",
        description: "Definiu a cor de fundo para #3b82f6 (azul)",
        validate: (container, css) => {
          const el = container.querySelector(".target-box") as HTMLElement;
          const bg = getComputedProp(el, "background-color");
          // #3b82f6 is rgb(59, 130, 246)
          return checkColor(bg, ["rgb(59,130,246)", "#3b82f6"]);
        }
      },
      {
        id: "l1_color",
        description: "Definiu a cor do texto para branco (#ffffff)",
        validate: (container, css) => {
          const el = container.querySelector(".target-box") as HTMLElement;
          const col = getComputedProp(el, "color");
          // #ffffff is rgb(255, 255, 255)
          return checkColor(col, ["rgb(255,255,255)", "#ffffff", "white"]);
        }
      },
      {
        id: "l1_padding",
        description: "Adicionou padding de 16px",
        validate: (container, css) => {
          const el = container.querySelector(".target-box") as HTMLElement;
          const pad = getComputedProp(el, "padding-top"); // or padding
          return pad === "16px";
        }
      }
    ]
  },
  {
    id: 2,
    title: "O Modelo de Caixa (Box Model)",
    category: "Básico",
    difficulty: "Fácil",
    description: "Cada elemento HTML é representado como uma caixa retangular. O Box Model é composto por: Conteúdo (Content), Espaçamento Interno (Padding), Borda (Border) e Margem Externa (Margin). Vamos ajustar esses espaçamentos para organizar os elementos.",
    instructions: [
      "Selecione a classe `.inner-box`.",
      "Adicione um preenchimento interno (`padding`) de `20px` em todas as direções.",
      "Defina uma borda sólida vermelha com `border: 2px solid #ef4444`.",
      "Adicione uma margem superior (`margin-top`) de `15px` para afastar a caixa da borda superior."
    ],
    initialHtml: `<div class="outer-box">\n  <div class="inner-box">Sou a caixa interna</div>\n</div>`,
    initialCss: `.outer-box {\n  border: 2px dashed #94a3b8;\n  padding: 10px;\n}\n\n.inner-box {\n  background-color: #f1f5f9;\n  color: #334155;\n}`,
    solutionCss: `.inner-box {\n  background-color: #f1f5f9;\n  color: #334155;\n  padding: 20px;\n  border: 2px solid #ef4444;\n  margin-top: 15px;\n}`,
    hints: [
      "A regra `.inner-box` já existe. Adicione as propriedades dentro dela.",
      "A borda é definida com `border: 2px solid #ef4444;`.",
      "Use `margin-top: 15px;` para aplicar a margem apenas no topo."
    ],
    validationRules: [
      {
        id: "l2_padding",
        description: "Padding de 20px na caixa interna",
        validate: (container, css) => {
          const el = container.querySelector(".inner-box") as HTMLElement;
          return getComputedProp(el, "padding-top") === "20px" && getComputedProp(el, "padding-left") === "20px";
        }
      },
      {
        id: "l2_border",
        description: "Borda sólida vermelha de 2px (#ef4444)",
        validate: (container, css) => {
          const el = container.querySelector(".inner-box") as HTMLElement;
          const bW = parseFloat(getComputedProp(el, "border-top-width")) || 0;
          const bS = getComputedProp(el, "border-top-style");
          const bC = getComputedProp(el, "border-top-color");
          
          // Highly resilient check allowing for sub-pixel high-DPI scaling, browser zooms, and CSS parsing fallbacks.
          const computedPass = (bW >= 1.5 && bW <= 2.8) && bS === "solid" && (checkColor(bC, ["rgb(239,68,68)", "#ef4444"]) || bC.includes("239") || bC.includes("ef4444"));
          const cleanCss = css.replace(/\s+/g, "").toLowerCase();
          const cssPass = cleanCss.includes("border:") && (cleanCss.includes("2px") || cleanCss.includes("solid") || cleanCss.includes("ef4444"));
          
          return computedPass || cssPass;
        }
      },
      {
        id: "l2_margin",
        description: "Margem superior de 15px",
        validate: (container, css) => {
          const el = container.querySelector(".inner-box") as HTMLElement;
          return getComputedProp(el, "margin-top") === "15px";
        }
      }
    ]
  },
  {
    id: 3,
    title: "Tipografia e Alinhamento",
    category: "Básico",
    difficulty: "Fácil",
    description: "Estilizar fontes e alinhar textos é essencial para legibilidade e hierarquia visual. Você aprenderá a alterar o tamanho da fonte, peso, estilo e alinhamento de um título.",
    instructions: [
      "Selecione o elemento com a classe `.title`.",
      "Aumente o tamanho da fonte (`font-size`) para `32px`.",
      "Alinhe o texto ao centro usando `text-align: center`.",
      "Deixe a fonte em negrito usando `font-weight: bold` (ou `700`).",
      "Defina a cor do texto para `#1e293b`."
    ],
    initialHtml: `<h1 class="title">Estilo de Texto</h1>`,
    initialCss: `.title {\n  \n}`,
    solutionCss: `.title {\n  font-size: 32px;\n  text-align: center;\n  font-weight: bold;\n  color: #1e293b;\n}`,
    hints: [
      "Use `font-size: 32px;`.",
      "Para centralizar o texto, use `text-align: center;`.",
      "O peso da fonte pode ser `font-weight: bold;` ou `font-weight: 700;`."
    ],
    validationRules: [
      {
        id: "l3_size",
        description: "Tamanho da fonte definido para 32px",
        validate: (container, css) => {
          const el = container.querySelector(".title") as HTMLElement;
          return getComputedProp(el, "font-size") === "32px";
        }
      },
      {
        id: "l3_align",
        description: "Texto centralizado",
        validate: (container, css) => {
          const el = container.querySelector(".title") as HTMLElement;
          return getComputedProp(el, "text-align") === "center";
        }
      },
      {
        id: "l3_weight",
        description: "Peso da fonte em negrito (bold ou 700)",
        validate: (container, css) => {
          const el = container.querySelector(".title") as HTMLElement;
          const weight = getComputedProp(el, "font-weight");
          return weight === "bold" || weight === "700" || weight === "800";
        }
      },
      {
        id: "l3_color",
        description: "Cor do texto definida para #1e293b",
        validate: (container, css) => {
          const el = container.querySelector(".title") as HTMLElement;
          const col = getComputedProp(el, "color");
          return checkColor(col, ["rgb(30,41,59)", "#1e293b"]);
        }
      }
    ]
  },
  {
    id: 4,
    title: "Cantos Arredondados e Sombras",
    category: "Intermediário",
    difficulty: "Médio",
    description: "Para dar um aspecto moderno e tridimensional aos cartões e botões, usamos cantos arredondados (`border-radius`) e sombras (`box-shadow`).",
    instructions: [
      "Selecione a classe `.card`.",
      "Arredonde os cantos da caixa definindo `border-radius: 12px`.",
      "Adicione uma sombra suave com `box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1)`.",
      "Adicione uma borda sutil de `1px solid #e2e8f0` para destacar o cartão."
    ],
    initialHtml: `<div class="card">\n  <h3>Meu Cartão</h3>\n  <p>Passei a parecer um componente moderno e elegante.</p>\n</div>`,
    initialCss: `.card {\n  background-color: #ffffff;\n  padding: 24px;\n  color: #334155;\n}`,
    solutionCss: `.card {\n  background-color: #ffffff;\n  padding: 24px;\n  color: #334155;\n  border-radius: 12px;\n  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);\n  border: 1px solid #e2e8f0;\n}`,
    hints: [
      "Use `border-radius: 12px;` para os cantos.",
      "A sombra é definida usando `box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);`."
    ],
    validationRules: [
      {
        id: "l4_radius",
        description: "Arredondou os cantos com border-radius: 12px",
        validate: (container, css) => {
          const el = container.querySelector(".card") as HTMLElement;
          return getComputedProp(el, "border-radius") === "12px" || getComputedProp(el, "border-top-left-radius") === "12px";
        }
      },
      {
        id: "l4_shadow",
        description: "Adicionou uma sombra com box-shadow",
        validate: (container, css) => {
          const el = container.querySelector(".card") as HTMLElement;
          const shadow = getComputedProp(el, "box-shadow");
          return shadow !== "none" && shadow !== "" && shadow.includes("rgba");
        }
      },
      {
        id: "l4_border",
        description: "Borda sutil de 1px solid #e2e8f0",
        validate: (container, css) => {
          const el = container.querySelector(".card") as HTMLElement;
          const bW = parseFloat(getComputedProp(el, "border-top-width")) || 0;
          const bS = getComputedProp(el, "border-top-style");
          
          // Resilient high-DPI boundary checks (e.g., 0.5px to 1.8px) plus robust static syntax matching.
          const computedPass = (bW >= 0.5 && bW <= 1.8) && bS === "solid";
          const cleanCss = css.replace(/\s+/g, "").toLowerCase();
          const cssPass = cleanCss.includes("border:") && (cleanCss.includes("1px") || cleanCss.includes("solid") || cleanCss.includes("e2e8f0"));
          
          return computedPass || cssPass;
        }
      }
    ]
  },
  {
    id: 5,
    title: "Flexbox - Alinhamento Horizontal",
    category: "Intermediário",
    difficulty: "Médio",
    description: "O Flexbox (Flexible Box Layout) revolucionou a forma como criamos layouts na web. Ele permite alinhar e distribuir espaço entre itens de forma muito fácil. Vamos dispor três itens de lado e espaçá-los uniformemente.",
    instructions: [
      "Selecione o container `.flex-container`.",
      "Ative o modelo flexbox definindo `display: flex`.",
      "Distribua os itens de forma que fiquem alinhados horizontalmente com espaço igual entre eles usando `justify-content: space-between`.",
      "Deixe os itens alinhados ao centro verticalmente com `align-items: center`."
    ],
    initialHtml: `<div class="flex-container">\n  <div class="item">Início</div>\n  <div class="item">Meio</div>\n  <div class="item">Fim</div>\n</div>`,
    initialCss: `.flex-container {\n  background-color: #f8fafc;\n  border: 2px dashed #cbd5e1;\n  padding: 15px;\n  height: 100px;\n}\n\n.item {\n  background-color: #4f46e5;\n  color: white;\n  padding: 10px 20px;\n  border-radius: 6px;\n}`,
    solutionCss: `.flex-container {\n  background-color: #f8fafc;\n  border: 2px dashed #cbd5e1;\n  padding: 15px;\n  height: 100px;\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n}\n\n.item {\n  background-color: #4f46e5;\n  color: white;\n  padding: 10px 20px;\n  border-radius: 6px;\n}`,
    hints: [
      "Use `display: flex;` para ativar o Flexbox no container.",
      "Para distribuir espaço entre os elementos, use `justify-content: space-between;`.",
      "Para o alinhamento vertical dentro do container, use `align-items: center;`."
    ],
    validationRules: [
      {
        id: "l5_flex",
        description: "Definiu display: flex no container",
        validate: (container, css) => {
          const el = container.querySelector(".flex-container") as HTMLElement;
          return getComputedProp(el, "display") === "flex";
        }
      },
      {
        id: "l5_justify",
        description: "Definiu justify-content: space-between",
        validate: (container, css) => {
          const el = container.querySelector(".flex-container") as HTMLElement;
          return getComputedProp(el, "justify-content") === "space-between" || getComputedProp(el, "justify-content").includes("between");
        }
      },
      {
        id: "l5_align",
        description: "Definiu align-items: center",
        validate: (container, css) => {
          const el = container.querySelector(".flex-container") as HTMLElement;
          return getComputedProp(el, "align-items") === "center";
        }
      }
    ]
  },
  {
    id: 6,
    title: "Flexbox - Centralização Perfeita",
    category: "Intermediário",
    difficulty: "Médio",
    description: "Antes do Flexbox, centralizar um elemento verticalmente e horizontalmente era um grande pesadelo. Com Flexbox, isso é resolvido com apenas 3 linhas de código! Vamos centralizar a bola mágica no meio do container.",
    instructions: [
      "Selecione o container `.center-container`.",
      "Defina `display: flex` para torná-lo um container Flexbox.",
      "Centralize o item horizontalmente com `justify-content: center`.",
      "Centralize o item verticalmente com `align-items: center`."
    ],
    initialHtml: `<div class="center-container">\n  <div class="magic-ball">🔮</div>\n</div>`,
    initialCss: `.center-container {\n  background-color: #0f172a;\n  height: 180px;\n  border-radius: 8px;\n}\n\n.magic-ball {\n  font-size: 40px;\n  background: #334155;\n  padding: 15px;\n  border-radius: 50%;\n  width: 80px;\n  height: 80px;\n  text-align: center;\n  line-height: 50px;\n}`,
    solutionCss: `.center-container {\n  background-color: #0f172a;\n  height: 180px;\n  border-radius: 8px;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}`,
    hints: [
      "Aplique `display: flex;` na classe `.center-container`.",
      "Aplique `justify-content: center;` e `align-items: center;` na mesma classe."
    ],
    validationRules: [
      {
        id: "l6_flex",
        description: "Definiu display: flex na classe .center-container",
        validate: (container, css) => {
          const el = container.querySelector(".center-container") as HTMLElement;
          return getComputedProp(el, "display") === "flex";
        }
      },
      {
        id: "l6_justify",
        description: "Centralizou horizontalmente (justify-content: center)",
        validate: (container, css) => {
          const el = container.querySelector(".center-container") as HTMLElement;
          return getComputedProp(el, "justify-content") === "center";
        }
      },
      {
        id: "l6_align",
        description: "Centralizou verticalmente (align-items: center)",
        validate: (container, css) => {
          const el = container.querySelector(".center-container") as HTMLElement;
          return getComputedProp(el, "align-items") === "center";
        }
      }
    ]
  },
  {
    id: 7,
    title: "CSS Grid - Criando uma Grelha",
    category: "Avançado",
    difficulty: "Difícil",
    description: "Enquanto o Flexbox é ideal para layouts unidimensionais (linhas OU colunas), o CSS Grid é perfeito para layouts bidimensionais (linhas E colunas simultaneamente). Vamos criar uma galeria de fotos com 2 colunas perfeitamente espaçadas.",
    instructions: [
      "Selecione o container `.grid-container`.",
      "Defina `display: grid` para ativar o CSS Grid.",
      "Configure duas colunas iguais usando `grid-template-columns: repeat(2, 1fr)` ou `grid-template-columns: 1fr 1fr`.",
      "Adicione um espaçamento de `16px` entre as células usando `gap: 16px`."
    ],
    initialHtml: `<div class="grid-container">\n  <div class="grid-card">Galeria 1</div>\n  <div class="grid-card">Galeria 2</div>\n  <div class="grid-card">Galeria 3</div>\n  <div class="grid-card">Galeria 4</div>\n</div>`,
    initialCss: `.grid-container {\n  \n}\n\n.grid-card {\n  background-color: #ec4899;\n  color: white;\n  padding: 30px 10px;\n  text-align: center;\n  border-radius: 8px;\n  font-weight: bold;\n}`,
    solutionCss: `.grid-container {\n  display: grid;\n  grid-template-columns: repeat(2, 1fr);\n  gap: 16px;\n}`,
    hints: [
      "Use `display: grid;` no container.",
      "A propriedade para colunas é `grid-template-columns: repeat(2, 1fr);`.",
      "Crie o espaçamento com `gap: 16px;`."
    ],
    validationRules: [
      {
        id: "l7_grid",
        description: "Ativou display: grid na classe .grid-container",
        validate: (container, css) => {
          const el = container.querySelector(".grid-container") as HTMLElement;
          return getComputedProp(el, "display") === "grid";
        }
      },
      {
        id: "l7_cols",
        description: "Definiu duas colunas com grid-template-columns",
        validate: (container, css) => {
          const el = container.querySelector(".grid-container") as HTMLElement;
          const cols = getComputedProp(el, "grid-template-columns");
          // On computed style, repeat(2, 1fr) evaluates to pixel sizes like '200px 200px'
          // We can check if it split into two tracks or check the CSS string.
          const splitCols = cols.split(" ").filter(Boolean);
          return splitCols.length === 2 || css.includes("grid-template-columns");
        }
      },
      {
        id: "l7_gap",
        description: "Adicionou um espaçamento de gap: 16px",
        validate: (container, css) => {
          const el = container.querySelector(".grid-container") as HTMLElement;
          return getComputedProp(el, "gap") === "16px" || getComputedProp(el, "grid-row-gap") === "16px";
        }
      }
    ]
  },
  {
    id: 8,
    title: "Pseudo-classes: Efeito de Hover",
    category: "Intermediário",
    difficulty: "Médio",
    description: "Pseudo-classes são palavras-chave adicionadas a seletores que especificam um estado especial do elemento. A pseudo-classe `:hover` é acionada quando o cursor do mouse passa por cima do elemento. Vamos dar interatividade a um botão.",
    instructions: [
      "Crie uma nova regra de CSS para o botão quando estiver sob hover: `.btn:hover`.",
      "Dentro dessa regra `:hover`, mude a cor de fundo (`background-color`) para o verde `#10b981`.",
      "Mude também o cursor para `cursor: pointer` na regra `.btn:hover` ou na classe base `.btn` para indicar que é clicável.",
      "No botão base `.btn`, defina a cor inicial do texto para branco `#ffffff`."
    ],
    initialHtml: `<div style="text-align: center;">\n  <button class="btn">Me toque</button>\n</div>`,
    initialCss: `.btn {\n  background-color: #3b82f6;\n  border: none;\n  padding: 12px 24px;\n  font-size: 16px;\n  border-radius: 8px;\n  font-weight: 600;\n  transition: background-color 0.2s;\n}`,
    solutionCss: `.btn {\n  background-color: #3b82f6;\n  border: none;\n  padding: 12px 24px;\n  font-size: 16px;\n  border-radius: 8px;\n  font-weight: 600;\n  transition: background-color 0.2s;\n  color: #ffffff;\n  cursor: pointer;\n}\n\n.btn:hover {\n  background-color: #10b981;\n}`,
    hints: [
      "Escreva uma nova regra: `.btn:hover { background-color: #10b981; }`.",
      "Adicione `cursor: pointer;` na classe `.btn` ou no `.btn:hover`."
    ],
    validationRules: [
      {
        id: "l8_color_white",
        description: "Definiu a cor do texto do botão para branco (#ffffff)",
        validate: (container, css) => {
          const el = container.querySelector(".btn") as HTMLElement;
          return checkColor(getComputedProp(el, "color"), ["rgb(255,255,255)", "#ffffff", "white"]);
        }
      },
      {
        id: "l8_hover_rule",
        description: "Contém a regra CSS '.btn:hover' com background-color verde",
        validate: (container, css) => {
          const cleanCss = css.replace(/\s+/g, "");
          return cleanCss.includes(".btn:hover") && (cleanCss.includes("background-color:#10b981") || cleanCss.includes("background:#10b981") || cleanCss.includes("rgb(16,185,129)"));
        }
      },
      {
        id: "l8_cursor",
        description: "Definiu cursor: pointer para indicar interatividade",
        validate: (container, css) => {
          const el = container.querySelector(".btn") as HTMLElement;
          // In the browser, cursor is pointer if hovered, or we can check the CSS code
          return getComputedProp(el, "cursor") === "pointer" || css.includes("cursor: pointer") || css.includes("cursor:pointer");
        }
      }
    ]
  },
  {
    id: 9,
    title: "Transições de Estado",
    category: "Intermediário",
    difficulty: "Médio",
    description: "Alterações abruptas de estado podem quebrar a sensação de fluidez na interface. Usamos a propriedade `transition` para interpolar suavemente propriedades CSS (como cor, tamanho e escala) ao longo do tempo.",
    instructions: [
      "Adicione na classe `.smooth-card` a transição de transform e background-color: `transition: all 0.3s ease`.",
      "Crie uma regra de hover `.smooth-card:hover`.",
      "Dentro da regra de hover, aumente o tamanho do cartão levemente usando `transform: scale(1.05)`.",
      "No hover, altere também o fundo para `#1e293b` e a cor do texto para `#ffffff`."
    ],
    initialHtml: `<div class="smooth-card">\n  <div class="icon">✨</div>\n  <h4>Passe o Mouse Aqui</h4>\n  <p>Sinta a transição suave acontecendo.</p>\n</div>`,
    initialCss: `.smooth-card {\n  background-color: #f1f5f9;\n  color: #334155;\n  padding: 24px;\n  border-radius: 12px;\n  text-align: center;\n  border: 1px solid #cbd5e1;\n  cursor: pointer;\n}\n\n.icon {\n  font-size: 32px;\n  margin-bottom: 8px;\n}`,
    solutionCss: `.smooth-card {\n  background-color: #f1f5f9;\n  color: #334155;\n  padding: 24px;\n  border-radius: 12px;\n  text-align: center;\n  border: 1px solid #cbd5e1;\n  cursor: pointer;\n  transition: all 0.3s ease;\n}\n\n.smooth-card:hover {\n  transform: scale(1.05);\n  background-color: #1e293b;\n  color: #ffffff;\n}`,
    hints: [
      "Use `transition: all 0.3s ease;` na regra `.smooth-card`.",
      "Para a animação de escala no hover, use `.smooth-card:hover { transform: scale(1.05); background-color: #1e293b; color: #ffffff; }`."
    ],
    validationRules: [
      {
        id: "l9_transition",
        description: "Adicionou transição suave (transition)",
        validate: (container, css) => {
          const el = container.querySelector(".smooth-card") as HTMLElement;
          const trans = getComputedProp(el, "transition-property");
          return trans !== "none" && trans !== "" && css.includes("transition");
        }
      },
      {
        id: "l9_hover_css",
        description: "Contém a regra de hover '.smooth-card:hover'",
        validate: (container, css) => {
          const cleanCss = css.replace(/\s+/g, "");
          return cleanCss.includes(".smooth-card:hover");
        }
      },
      {
        id: "l9_hover_transform",
        description: "Define escala (transform: scale) e alteração de cores no hover",
        validate: (container, css) => {
          const cleanCss = css.replace(/\s+/g, "");
          return cleanCss.includes("scale(") && (cleanCss.includes("#1e293b") || cleanCss.includes("rgb(30,41,59)")) && (cleanCss.includes("#ffffff") || cleanCss.includes("white"));
        }
      }
    ]
  },
  {
    id: 10,
    title: "Animações com Keyframes",
    category: "Avançado",
    difficulty: "Difícil",
    description: "Para animações complexas que ocorrem de forma contínua ou possuem múltiplos estados intermediários, usamos `@keyframes`. Você cria a linha do tempo da animação e depois a associa a um elemento usando a propriedade `animation`.",
    instructions: [
      "Crie uma animação com nome `pulse` usando a regra `@keyframes pulse { ... }`.",
      "Na linha do tempo do seu keyframe, defina: em `0%` e `100%`, `transform: scale(1); opacity: 0.8;`. Em `50%`, `transform: scale(1.2); opacity: 1;`.",
      "Selecione a classe `.pulse-ball` e aplique a animação usando: `animation: pulse 2s infinite ease-in-out`."
    ],
    initialHtml: `<div style="text-align: center; padding: 20px;">\n  <div class="pulse-ball"></div>\n  <p style="margin-top: 15px; color: #64748b; font-size: 14px;">A bola mágica deve pulsar continuamente</p>\n</div>`,
    initialCss: `.pulse-ball {\n  width: 60px;\n  height: 60px;\n  background-color: #a855f7;\n  border-radius: 50%;\n  margin: 0 auto;\n  box-shadow: 0 0 15px rgba(168, 85, 247, 0.5);\n}`,
    solutionCss: `.pulse-ball {\n  width: 60px;\n  height: 60px;\n  background-color: #a855f7;\n  border-radius: 50%;\n  margin: 0 auto;\n  box-shadow: 0 0 15px rgba(168, 85, 247, 0.5);\n  animation: pulse 2s infinite ease-in-out;\n}\n\n@keyframes pulse {\n  0%, 100% {\n    transform: scale(1);\n    opacity: 0.8;\n  }\n  50% {\n    transform: scale(1.2);\n    opacity: 1;\n  }\n}`,
    hints: [
      "Insira a declaração `@keyframes pulse { ... }` em qualquer parte do editor.",
      "Defina os pontos da animação: `0%, 100% { transform: scale(1); opacity: 0.8; }` e `50% { transform: scale(1.2); opacity: 1; }`.",
      "Associe no `.pulse-ball` com `animation: pulse 2s infinite ease-in-out;`."
    ],
    validationRules: [
      {
        id: "l10_keyframes",
        description: "Definiu a diretiva de animação @keyframes pulse",
        validate: (container, css) => {
          const cleanCss = css.replace(/\s+/g, "");
          return cleanCss.includes("@keyframespulse");
        }
      },
      {
        id: "l10_animation_prop",
        description: "Aplicou a propriedade animation: pulse ... no .pulse-ball",
        validate: (container, css) => {
          const el = container.querySelector(".pulse-ball") as HTMLElement;
          const anim = getComputedProp(el, "animation-name");
          return anim.includes("pulse") || css.replace(/\s+/g, "").includes("animation:pulse") || css.includes("animation-name: pulse");
        }
      },
      {
        id: "l10_animation_infinite",
        description: "Configurou a animação para repetir infinitamente (infinite)",
        validate: (container, css) => {
          const el = container.querySelector(".pulse-ball") as HTMLElement;
          const count = getComputedProp(el, "animation-iteration-count");
          return count === "infinite" || css.includes("infinite");
        }
      }
    ]
  },
  {
    id: 11,
    title: "Curvas de Velocidade e Delays",
    category: "Intermediário",
    difficulty: "Médio",
    description: "Ajustando curvas de velocidade (transition-timing-function) e atrasos (transition-delay), você cria sensações físicas ricas nas interações, como efeitos elásticos e sequências coreografadas.",
    instructions: [
      "Na classe `.delay-box`, configure uma transição para a propriedade `transform` com duração de `0.6s` e a curva cúbica `cubic-bezier(0.68, -0.6, 0.32, 1.6)`.",
      "Adicione na classe `.delay-box` um atraso de transição de `0.2s` usando a propriedade `transition-delay`.",
      "Crie a regra de hover para o container que move o elemento filho: `.delay-container:hover .delay-box`.",
      "Dentro desta regra de hover, mova o elemento `100px` para a direita e rotacione `180deg` usando `transform: translateX(100px) rotate(180deg)`."
    ],
    initialHtml: `<div class="delay-container">\n  <div class="delay-box">🚀</div>\n  <p class="delay-text">Passe o mouse para testar a curva elástica com delay!</p>\n</div>`,
    initialCss: `.delay-container {\n  text-align: center;\n  padding: 20px;\n  background-color: #0f172a;\n  border-radius: 12px;\n  border: 1px solid #1e293b;\n  cursor: pointer;\n}\n\n.delay-box {\n  width: 60px;\n  height: 60px;\n  background-color: #f43f5e;\n  border-radius: 12px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  font-size: 28px;\n  margin: 10px auto;\n}\n\n.delay-text {\n  font-size: 13px;\n  color: #94a3b8;\n  margin-top: 10px;\n}`,
    solutionCss: `.delay-container {\n  text-align: center;\n  padding: 20px;\n  background-color: #0f172a;\n  border-radius: 12px;\n  border: 1px solid #1e293b;\n  cursor: pointer;\n}\n\n.delay-box {\n  width: 60px;\n  height: 60px;\n  background-color: #f43f5e;\n  border-radius: 12px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  font-size: 28px;\n  margin: 10px auto;\n  transition: transform 0.6s cubic-bezier(0.68, -0.6, 0.32, 1.6);\n  transition-delay: 0.2s;\n}\n\n.delay-container:hover .delay-box {\n  transform: translateX(100px) rotate(180deg);\n}\n\n.delay-text {\n  font-size: 13px;\n  color: #94a3b8;\n  margin-top: 10px;\n}`,
    hints: [
      "Configure a transição na classe `.delay-box` usando `transition: transform 0.6s cubic-bezier(0.68, -0.6, 0.32, 1.6);`.",
      "Adicione o atraso usando `transition-delay: 0.2s;`.",
      "No hover, use `transform: translateX(100px) rotate(180deg);` sob o seletor `.delay-container:hover .delay-box`."
    ],
    validationRules: [
      {
        id: "l11_transition_bezier",
        description: "Configurou a transição de transform com 0.6s e cubic-bezier na .delay-box",
        validate: (container, css) => {
          const el = container.querySelector(".delay-box") as HTMLElement;
          if (!el) return false;
          const cleanCss = css.replace(/\s+/g, "").toLowerCase();
          return cleanCss.includes("cubic-bezier(0.68,-0.6,0.32,1.6)") && (cleanCss.includes("transition:transform0.6s") || cleanCss.includes("transition:all0.6s") || cleanCss.includes("transition-property:transform") || cleanCss.includes("transition:0.6s"));
        }
      },
      {
        id: "l11_delay",
        description: "Adicionou transition-delay: 0.2s na .delay-box",
        validate: (container, css) => {
          const cleanCss = css.replace(/\s+/g, "").toLowerCase();
          return cleanCss.includes("transition-delay:0.2s") || cleanCss.includes("transition-delay:0.2");
        }
      },
      {
        id: "l11_hover_transform",
        description: "Moveu e rotacionou a caixa no hover (.delay-container:hover .delay-box)",
        validate: (container, css) => {
          const cleanCss = css.replace(/\s+/g, "").toLowerCase();
          return cleanCss.includes(".delay-container:hover.delay-box") && cleanCss.includes("translatex(100px)") && cleanCss.includes("rotate(180deg)");
        }
      }
    ]
  },
  {
    id: 12,
    title: "Animações Multietapas (Linha do Tempo)",
    category: "Avançado",
    difficulty: "Difícil",
    description: "Mapeando porcentagens intermediárias (como 25%, 50%, 75%) na regra de @keyframes, você pode criar trajetórias espaciais detalhadas e rotas complexas para dar movimento real aos elementos.",
    instructions: [
      "Crie a animação usando `@keyframes square-walk { ... }`.",
      "Configure a linha do tempo: `0%` e `100%`: `transform: translate(0, 0) rotate(0deg);`. `25%`: `transform: translate(60px, 0) rotate(90deg);`. `50%`: `transform: translate(60px, 60px) rotate(180deg);`. `75%`: `transform: translate(0, 60px) rotate(270deg);`.",
      "Adicione na classe `.walker` a propriedade `animation: square-walk 4s infinite linear`."
    ],
    initialHtml: `<div class="walk-container">\n  <div class="walker-track">\n    <div class="walker">🤖</div>\n  </div>\n  <p class="walk-text">Faça o robô caminhar na órbita quadrada tracejada!</p>\n</div>`,
    initialCss: `.walk-container {\n  text-align: center;\n  padding: 15px;\n}\n\n.walker-track {\n  width: 160px;\n  height: 160px;\n  border: 2px dashed #475569;\n  border-radius: 8px;\n  margin: 10px auto;\n  position: relative;\n  padding: 10px;\n}\n\n.walker {\n  width: 40px;\n  height: 40px;\n  background-color: #3b82f6;\n  border-radius: 8px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  font-size: 20px;\n  position: absolute;\n  top: 10px;\n  left: 10px;\n}\n\n.walk-text {\n  font-size: 13px;\n  color: #64748b;\n  margin-top: 10px;\n}`,
    solutionCss: `.walk-container {\n  text-align: center;\n  padding: 15px;\n}\n\n.walker-track {\n  width: 160px;\n  height: 160px;\n  border: 2px dashed #475569;\n  border-radius: 8px;\n  margin: 10px auto;\n  position: relative;\n  padding: 10px;\n}\n\n.walker {\n  width: 40px;\n  height: 40px;\n  background-color: #3b82f6;\n  border-radius: 8px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  font-size: 20px;\n  position: absolute;\n  top: 10px;\n  left: 10px;\n  animation: square-walk 4s infinite linear;\n}\n\n.walk-text {\n  font-size: 13px;\n  color: #64748b;\n  margin-top: 10px;\n}\n\n@keyframes square-walk {\n  0%, 100% {\n    transform: translate(0, 0) rotate(0deg);\n  }\n  25% {\n    transform: translate(60px, 0) rotate(90deg);\n  }\n  50% {\n    transform: translate(60px, 60px) rotate(180deg);\n  }\n  75% {\n    transform: translate(0, 60px) rotate(270deg);\n  }\n}`,
    hints: [
      "Use `@keyframes square-walk` para declarar a animação de cinco estados.",
      "Certifique-se de configurar `transform: translate(0, 0) rotate(0deg)` em `0%` e `100%` para fechar o ciclo.",
      "Aplique a animação ao `.walker` com `animation: square-walk 4s infinite linear;`."
    ],
    validationRules: [
      {
        id: "l12_keyframes_walk",
        description: "Definiu o keyframe de animação @keyframes square-walk",
        validate: (container, css) => {
          const cleanCss = css.replace(/\s+/g, "").toLowerCase();
          return cleanCss.includes("@keyframessquare-walk");
        }
      },
      {
        id: "l12_animation_walk_prop",
        description: "Associou a animação no .walker com duração e repetição infinitas",
        validate: (container, css) => {
          const el = container.querySelector(".walker") as HTMLElement;
          if (!el) return false;
          const cleanCss = css.replace(/\s+/g, "").toLowerCase();
          return cleanCss.includes("animation:square-walk") || cleanCss.includes("animation-name:square-walk") || cleanCss.includes("slide-in1sease-out");
        }
      },
      {
        id: "l12_walk_steps",
        description: "Configurou os passos intermediários de 25%, 50% e 75% na animação",
        validate: (container, css) => {
          const cleanCss = css.replace(/\s+/g, "").toLowerCase();
          return cleanCss.includes("25%{") && cleanCss.includes("50%{") && cleanCss.includes("75%{");
        }
      }
    ]
  },
  {
    id: 13,
    title: "Persistência com Fill Mode",
    category: "Intermediário",
    difficulty: "Médio",
    description: "Por padrão, após a execução de uma animação CSS, o elemento reverte imediatamente aos estilos originais. Usando `animation-fill-mode: forwards`, você faz com que o elemento retenha permanentemente o estado visual final de 100%.",
    instructions: [
      "Crie a animação de entrada com nome `slide-in` usando `@keyframes slide-in { ... }`.",
      "Configure a animação: no estado `0%`, use `transform: translateY(30px); opacity: 0;`. No estado `100%`, use `transform: translateY(0); opacity: 1;`.",
      "Adicione na classe `.fade-card` a propriedade de animação para rodar a animação por `1s` de forma suave com persistência final: `animation: slide-in 1s ease-out forwards`."
    ],
    initialHtml: `<div class="fade-container">\n  <div class="fade-card">\n    <h3>🎉 Desbloqueado!</h3>\n    <p>Este cartão deslizou suavemente e fixou no lugar certo.</p>\n  </div>\n</div>`,
    initialCss: `.fade-container {\n  text-align: center;\n  padding: 15px;\n}\n\n.fade-card {\n  background: linear-gradient(135deg, #6366f1, #a855f7);\n  color: white;\n  padding: 20px;\n  border-radius: 12px;\n  max-width: 250px;\n  margin: 10px auto;\n  opacity: 0;\n}`,
    solutionCss: `.fade-container {\n  text-align: center;\n  padding: 15px;\n}\n\n.fade-card {\n  background: linear-gradient(135deg, #6366f1, #a855f7);\n  color: white;\n  padding: 20px;\n  border-radius: 12px;\n  max-width: 250px;\n  margin: 10px auto;\n  opacity: 0;\n  animation: slide-in 1s ease-out forwards;\n}\n\n@keyframes slide-in {\n  0% {\n    transform: translateY(30px);\n    opacity: 0;\n  }\n  100% {\n    transform: translateY(0);\n    opacity: 1;\n  }\n}`,
    hints: [
      "No `@keyframes slide-in`, em `0%` use `transform: translateY(30px); opacity: 0;` e em `100%` use `transform: translateY(0); opacity: 1;`.",
      "Para fazer o elemento manter o visual final, use a palavra-chave `forwards` na propriedade de animação: `animation: slide-in 1s ease-out forwards;`."
    ],
    validationRules: [
      {
        id: "l13_keyframes_slide",
        description: "Definiu o keyframe de animação @keyframes slide-in",
        validate: (container, css) => {
          const cleanCss = css.replace(/\s+/g, "").toLowerCase();
          return cleanCss.includes("@keyframesslide-in");
        }
      },
      {
        id: "l13_animation_slide_prop",
        description: "Associou a animação no .fade-card durando 1s com suavização ease-out",
        validate: (container, css) => {
          const el = container.querySelector(".fade-card") as HTMLElement;
          if (!el) return false;
          const cleanCss = css.replace(/\s+/g, "").toLowerCase();
          return cleanCss.includes("animation:slide-in") || cleanCss.includes("animation-name:slide-in") || cleanCss.includes("slide-in1sease-out");
        }
      },
      {
        id: "l13_forwards",
        description: "Configurou a persistência dos estados finais com a propriedade forwards",
        validate: (container, css) => {
          const cleanCss = css.replace(/\s+/g, "").toLowerCase();
          return cleanCss.includes("forwards");
        }
      }
    ]
  },
  {
    id: 14,
    title: "Variáveis CSS (Custom Properties)",
    category: "Avançado",
    difficulty: "Difícil",
    description: "As variáveis CSS (Custom Properties) permitem que você armazene valores de estilo repetitivos em um único lugar e os reutilize em todo o seu stylesheet, facilitando temas e manutenção rápida.",
    instructions: [
      "Defina uma variável CSS chamada `--primary-color` com o valor `#f43f5e` (tom rosa) no seletor da classe `.variable-box`.",
      "Defina outra variável chamada `--radius` com o valor `20px` na mesma classe.",
      "Aplique a variável `--primary-color` como a cor de fundo (`background-color`) da caixa usando `var(--primary-color)`.",
      "Aplique a variável `--radius` como o arredondamento dos cantos (`border-radius`) da caixa usando `var(--radius)`."
    ],
    initialHtml: `<div class="variable-box">\n  Variáveis Dinâmicas!\n</div>`,
    initialCss: `.variable-box {\n  color: white;\n  padding: 24px;\n  text-align: center;\n  font-weight: bold;\n}`,
    solutionCss: `.variable-box {\n  --primary-color: #f43f5e;\n  --radius: 20px;\n  color: white;\n  padding: 24px;\n  text-align: center;\n  font-weight: bold;\n  background-color: var(--primary-color);\n  border-radius: var(--radius);\n}`,
    hints: [
      "Declare variáveis iniciando com dois traços, ex: `--nome-da-variavel: valor;`.",
      "Use `background-color: var(--primary-color);` para ler a variável de cor.",
      "Use `border-radius: var(--radius);` para ler a variável de arredondamento."
    ],
    validationRules: [
      {
        id: "l14_var_color",
        description: "Declarou a variável --primary-color com o valor #f43f5e",
        validate: (container, css) => {
          const el = container.querySelector(".variable-box") as HTMLElement;
          if (!el) return false;
          const cleanCss = css.replace(/\s+/g, "").toLowerCase();
          return cleanCss.includes("--primary-color:#f43f5e") || cleanCss.includes("--primary-color:rgb") || css.includes("--primary-color");
        }
      },
      {
        id: "l14_var_radius",
        description: "Declarou a variável --radius com o valor 20px",
        validate: (container, css) => {
          const el = container.querySelector(".variable-box") as HTMLElement;
          if (!el) return false;
          const cleanCss = css.replace(/\s+/g, "").toLowerCase();
          return cleanCss.includes("--radius:20px") || css.includes("--radius");
        }
      },
      {
        id: "l14_bg_var",
        description: "Definiu background-color usando var(--primary-color)",
        validate: (container, css) => {
          const el = container.querySelector(".variable-box") as HTMLElement;
          if (!el) return false;
          const bg = getComputedProp(el, "background-color");
          const hasBg = bg !== "" && bg !== "transparent" && bg !== "rgba(0, 0, 0, 0)";
          return hasBg && (css.includes("var(--primary-color)") || css.replace(/\s+/g, "").includes("var(--primarycolor)"));
        }
      },
      {
        id: "l14_radius_var",
        description: "Definiu border-radius usando var(--radius)",
        validate: (container, css) => {
          const el = container.querySelector(".variable-box") as HTMLElement;
          if (!el) return false;
          const rad = getComputedProp(el, "border-radius") || getComputedProp(el, "border-top-left-radius");
          return (rad === "20px" || rad.includes("20")) && (css.includes("var(--radius)") || css.replace(/\s+/g, "").includes("var(--radius)"));
        }
      }
    ]
  },
  {
    id: 15,
    title: "Filtros Visuais (CSS Filters)",
    category: "Intermediário",
    difficulty: "Médio",
    description: "A propriedade `filter` do CSS permite aplicar efeitos visuais de pós-processamento como desfoque (blur), ajuste de brilho (brightness), contraste, saturação e tons de cinza a elementos ou imagens antes de renderizá-los.",
    instructions: [
      "Selecione a imagem com a classe `.avatar-img`.",
      "Adicione um efeito inicial de desfoque de `2px` usando `filter: blur(2px)`.",
      "Crie uma nova regra para hover: `.avatar-img:hover`.",
      "No hover, remova o desfoque definindo `filter: blur(0px)` ou `filter: none` e adicione simultaneamente um brilho de `1.2` com `brightness(1.2)` (Ex: `filter: blur(0px) brightness(1.2)`)."
    ],
    initialHtml: `<div class="avatar-container">\n  <img class="avatar-img" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop" alt="Avatar" referrerpolicy="no-referrer" />\n  <p style="margin-top: 10px; font-size: 13px; color: #64748b;">Passe o mouse na foto para focar</p>\n</div>`,
    initialCss: `.avatar-container {\n  text-align: center;\n  padding: 15px;\n}\n\n.avatar-img {\n  width: 120px;\n  height: 120px;\n  border-radius: 50%;\n  transition: filter 0.3s ease;\n  border: 4px solid #6366f1;\n}`,
    solutionCss: `.avatar-container {\n  text-align: center;\n  padding: 15px;\n}\n\n.avatar-img {\n  width: 120px;\n  height: 120px;\n  border-radius: 50%;\n  transition: filter 0.3s ease;\n  border: 4px solid #6366f1;\n  filter: blur(2px);\n}\n\n.avatar-img:hover {\n  filter: blur(0px) brightness(1.2);\n}`,
    hints: [
      "Aplique `filter: blur(2px);` na classe base `.avatar-img`.",
      "A regra de hover é escrita como `.avatar-img:hover { ... }`.",
      "No hover, use `filter: blur(0px) brightness(1.2);` para encadear os dois filtros."
    ],
    validationRules: [
      {
        id: "l15_initial_blur",
        description: "Definiu o filtro inicial de desfoque de 2px no .avatar-img",
        validate: (container, css) => {
          const el = container.querySelector(".avatar-img") as HTMLElement;
          if (!el) return false;
          const filter = getComputedProp(el, "filter");
          return filter.includes("blur") || css.replace(/\s+/g, "").includes("filter:blur(2px)");
        }
      },
      {
        id: "l15_hover_rule",
        description: "Criou a regra de hover '.avatar-img:hover'",
        validate: (container, css) => {
          return css.replace(/\s+/g, "").includes(".avatar-img:hover");
        }
      },
      {
        id: "l15_hover_filters",
        description: "Removeu o desfoque e adicionou brilho brightness(1.2) no hover",
        validate: (container, css) => {
          const clean = css.replace(/\s+/g, "").toLowerCase();
          return clean.includes(".avatar-img:hover") && (clean.includes("brightness(1.2)") || clean.includes("brightness"));
        }
      }
    ]
  },
  {
    id: 16,
    title: "Object Fit & Aspect Ratio",
    category: "Básico",
    difficulty: "Fácil",
    description: "Controlar a proporção física de imagens e vídeos em layouts fluidos e responsivos é essencial. A propriedade `aspect-ratio` define a proporção (como 16/9), e `object-fit: cover` garante que a imagem preencha o container de forma inteligente sem ficar esticada ou achatada.",
    instructions: [
      "Selecione a classe `.responsive-banner`.",
      "Defina a largura do banner para `100%` com `width: 100%`.",
      "Fixe a proporção física da imagem para o formato widescreen de 16 por 9 com `aspect-ratio: 16 / 9`.",
      "Ajuste o encaixe da imagem para que ela cubra todo o container proporcionalmente usando `object-fit: cover`."
    ],
    initialHtml: `<div class="banner-container">\n  <img class="responsive-banner" src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&h=300&fit=crop" alt="Praia" referrerpolicy="no-referrer" />\n</div>`,
    initialCss: `.banner-container {\n  max-width: 400px;\n  margin: 0 auto;\n  border: 4px solid #4f46e5;\n  border-radius: 12px;\n  overflow: hidden;\n}\n\n.responsive-banner {\n  \n}`,
    solutionCss: `.responsive-banner {\n  width: 100%;\n  aspect-ratio: 16 / 9;\n  object-fit: cover;\n}`,
    hints: [
      "Use `width: 100%;` para ocupar toda a largura do container.",
      "Proporção de 16:9 é configurada com `aspect-ratio: 16 / 9;`.",
      "Resolva distorções usando `object-fit: cover;`."
    ],
    validationRules: [
      {
        id: "l16_width",
        description: "Definiu a largura do banner para width: 100%",
        validate: (container, css) => {
          const el = container.querySelector(".responsive-banner") as HTMLElement;
          if (!el) return false;
          return getComputedProp(el, "width") === "100%" || css.includes("width: 100%") || css.includes("width:100%");
        }
      },
      {
        id: "l16_aspect",
        description: "Definiu a proporção com aspect-ratio: 16 / 9",
        validate: (container, css) => {
          const el = container.querySelector(".responsive-banner") as HTMLElement;
          if (!el) return false;
          const ar = getComputedProp(el, "aspect-ratio");
          return ar === "1.77778" || ar === "16 / 9" || ar === "16/9" || css.includes("aspect-ratio");
        }
      },
      {
        id: "l16_object_fit",
        description: "Garantiu o encaixe proporcional inteligente com object-fit: cover",
        validate: (container, css) => {
          const el = container.querySelector(".responsive-banner") as HTMLElement;
          if (!el) return false;
          return getComputedProp(el, "object-fit") === "cover" || css.includes("object-fit: cover") || css.includes("object-fit:cover");
        }
      }
    ]
  }
];

export const achievementsData = [
  {
    id: "first_steps",
    title: "Primeiros Passos",
    description: "Conclua o primeiro nível de Seletores Básicos e Cores.",
    icon: "🚀"
  },
  {
    id: "box_master",
    title: "Mestre das Caixas",
    description: "Aprenda e domine o Box Model (Nível 2).",
    icon: "📦"
  },
  {
    id: "flex_ninja",
    title: "Ninja do Flexbox",
    description: "Complete todos os desafios de Flexbox (Níveis 5 e 6).",
    icon: "🧘"
  },
  {
    id: "grid_architect",
    title: "Arquiteto de Grelhas",
    description: "Domine o posicionamento bidimensional com CSS Grid (Nível 7).",
    icon: "📐"
  },
  {
    id: "animator",
    title: "Mestre das Animações",
    description: "Traga vida aos elementos completando os níveis de Transições e Keyframes (Níveis 9, 10, 11, 12 e 13).",
    icon: "🎬"
  },
  {
    id: "css_expert",
    title: "Especialista em CSS",
    description: "Complete todos os 16 níveis do tutorial com louvor!",
    icon: "👑"
  }
];
