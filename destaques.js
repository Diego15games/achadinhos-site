const API_DESTAQUES = "https://achados.onrender.com";

let produtosDestaque = [];
let destaqueAtual = 0;
let intervaloDestaque = null;

let inicioToqueX = 0;
let fimToqueX = 0;

function escDestaque(s = "") {
  return String(s).replace(/[&<>"']/g, m => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[m]));
}

function imagemDestaque(url) {

  if (String(url || "").trim()) {
    return url;
  }

  return "data:image/svg+xml;charset=UTF-8," +
    encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg"
           width="800"
           height="600">

        <rect
          width="800"
          height="600"
          fill="#f3f4f6"
        />

        <text
          x="400"
          y="310"
          text-anchor="middle"
          font-family="Arial"
          font-size="30"
          font-weight="700"
          fill="#6b7280">

          Imagem indisponível

        </text>

      </svg>
    `);
}

async function carregarDestaques() {

  const secao =
    document.querySelector(".destaques-section");

  const container =
    document.getElementById("destaques");

  if (!secao || !container) {
    return;
  }

  try {

    const resposta =
      await fetch(
        API_DESTAQUES + "/api/produtos"
      );

    if (!resposta.ok) {
      throw new Error(
        "Erro ao carregar destaques"
      );
    }

    const produtos =
      await resposta.json();

    produtosDestaque =
      produtos.filter(
        p => p.destaque === true
      );

    if (!produtosDestaque.length) {

      secao.style.display = "none";

      return;
    }

    secao.style.display = "";

    destaqueAtual = 0;

    mostrarDestaque();

    iniciarAutomatico();

    configurarToque();

  } catch (erro) {

    console.error(
      "Erro nos destaques:",
      erro
    );

    secao.style.display = "none";
  }
}

function mostrarDestaque() {

  const container =
    document.getElementById("destaques");

  if (!container ||
      !produtosDestaque.length) {
    return;
  }

  const p =
    produtosDestaque[destaqueAtual];

  const salvo =
    typeof carrinhoTemProduto === "function"
      ? carrinhoTemProduto(p._id)
      : false;

  container.innerHTML = `

    <article
      class="destaque-card"
      data-id="${escDestaque(p._id)}"
    >

      <div class="destaque-imagem-area">

        <img
          src="${escDestaque(
            imagemDestaque(p.imagem)
          )}"
          alt="${escDestaque(p.nome)}"
          onerror="this.style.display='none'"
        >

      </div>

      <div class="destaque-info">

        <span class="destaque-badge">
          ⭐ DESTAQUE
        </span>

        ${
          p.etiqueta
            ? `
              <span class="destaque-etiqueta">
                ${escDestaque(p.etiqueta)}
              </span>
            `
            : ""
        }

        <h2>
          ${escDestaque(p.nome)}
        </h2>

        <p class="destaque-descricao">
          ${escDestaque(
            p.descricao ||
            "Confira todos os detalhes deste produto."
          )}
        </p>

        <strong class="destaque-preco">
          ${escDestaque(
            p.preco || "Ver preço"
          )}
        </strong>

        <div class="destaque-acoes">

          <a
            class="destaque-ver"
            href="produto.html?id=${encodeURIComponent(p._id)}"
          >
            Ver produto
          </a>

          <button
            type="button"
            class="destaque-carrinho ${
              salvo ? "added" : ""
            }"
            onclick="adicionarDestaqueCarrinho(event, '${p._id}')"
          >
            ${
              salvo
                ? "✓ Guardado"
                : "🛒 Adicionar"
            }
          </button>

        </div>

      </div>

    </article>

    ${
      produtosDestaque.length > 1
        ? `
          <div class="destaque-indicadores">

            ${produtosDestaque.map(
              (_, i) => `
                <button
                  type="button"
                  class="destaque-ponto ${
                    i === destaqueAtual
                      ? "active"
                      : ""
                  }"
                  onclick="irParaDestaque(${i})"
                  aria-label="Ir para destaque ${i + 1}"
                ></button>
              `
            ).join("")}

          </div>
        `
        : ""
    }

    ${
      produtosDestaque.length > 1
        ? `
          <button
            type="button"
            class="destaque-seta destaque-esquerda"
            onclick="destaqueAnterior()"
            aria-label="Destaque anterior"
          >
            ‹
          </button>

          <button
            type="button"
            class="destaque-seta destaque-direita"
            onclick="destaqueProximo()"
            aria-label="Próximo destaque"
          >
            ›
          </button>
        `
        : ""
    }

  `;
}

function destaqueProximo() {

  if (produtosDestaque.length <= 1) {
    return;
  }

  destaqueAtual++;

  if (
    destaqueAtual >=
    produtosDestaque.length
  ) {
    destaqueAtual = 0;
  }

  mostrarDestaque();
}

function destaqueAnterior() {

  if (produtosDestaque.length <= 1) {
    return;
  }

  destaqueAtual--;

  if (destaqueAtual < 0) {
    destaqueAtual =
      produtosDestaque.length - 1;
  }

  mostrarDestaque();
}

function irParaDestaque(indice) {

  if (
    indice < 0 ||
    indice >= produtosDestaque.length
  ) {
    return;
  }

  destaqueAtual = indice;

  mostrarDestaque();

  reiniciarAutomatico();
}

function iniciarAutomatico() {

  pararAutomatico();

  if (produtosDestaque.length <= 1) {
    return;
  }

  intervaloDestaque =
    setInterval(
      destaqueProximo,
      5000
    );
}

function pararAutomatico() {

  if (intervaloDestaque) {

    clearInterval(
      intervaloDestaque
    );

    intervaloDestaque = null;
  }
}

function reiniciarAutomatico() {

  iniciarAutomatico();
}

/* DESLIZAR NO CELULAR */

function configurarToque() {

  const container =
    document.getElementById("destaques");

  if (!container) {
    return;
  }

  container.addEventListener(
    "touchstart",
    function (e) {

      inicioToqueX =
        e.changedTouches[0].screenX;

      pararAutomatico();

    },
    { passive: true }
  );

  container.addEventListener(
    "touchend",
    function (e) {

      fimToqueX =
        e.changedTouches[0].screenX;

      const distancia =
        fimToqueX - inicioToqueX;

      if (Math.abs(distancia) > 50) {

        if (distancia < 0) {
          destaqueProximo();
        } else {
          destaqueAnterior();
        }

      }

      iniciarAutomatico();

    },
    { passive: true }
  );
}

/* BOTÃO DO CARRINHO */

function adicionarDestaqueCarrinho(
  event,
  id
) {

  if (
    typeof adicionarDoCard ===
    "function"
  ) {

    adicionarDoCard(
      event,
      id
    );

    setTimeout(
      mostrarDestaque,
      50
    );

  }

}

window.destaqueProximo =
  destaqueProximo;

window.destaqueAnterior =
  destaqueAnterior;

window.irParaDestaque =
  irParaDestaque;

window.adicionarDestaqueCarrinho =
  adicionarDestaqueCarrinho;

carregarDestaques();
