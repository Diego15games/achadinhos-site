const CHAVE_CARRINHO = "achadinhos_carrinho";

let carrinho = carregarCarrinho();

function carregarCarrinho() {

  try {

    const salvo =
      localStorage.getItem(CHAVE_CARRINHO);

    return salvo
      ? JSON.parse(salvo)
      : [];

  } catch {

    return [];

  }

}

function salvarCarrinho() {

  localStorage.setItem(
    CHAVE_CARRINHO,
    JSON.stringify(carrinho)
  );

}

function carrinhoTemProduto(id) {

  return carrinho.some(
    p => String(p.id) === String(id)
  );

}

function adicionarDoCard(event, id) {

  event.preventDefault();
  event.stopPropagation();

  const produto =
    todos.find(
      p => String(p._id) === String(id)
    );

  if (!produto) {
    return;
  }

  adicionarProduto(produto);

}

function adicionarProduto(produto) {

  if (carrinhoTemProduto(produto._id)) {

    abrirCarrinho();

    return;

  }

  carrinho.push({

    id: String(produto._id),

    nome: produto.nome,

    preco: produto.preco || "R$ 0,00",

    imagem: produto.imagem || "",

    linkAmazon: produto.linkAmazon || "",

    selecionado: true

  });

  salvarCarrinho();

  atualizarCarrinho();

  if (typeof renderProdutos === "function") {
    renderProdutos();
  }

  abrirCarrinho();

}

function removerProduto(id) {

  carrinho =
    carrinho.filter(
      p => String(p.id) !== String(id)
    );

  salvarCarrinho();

  atualizarCarrinho();

  if (typeof renderProdutos === "function") {
    renderProdutos();
  }

}

function selecionarProduto(id, selecionado) {

  const produto =
    carrinho.find(
      p => String(p.id) === String(id)
    );

  if (!produto) {
    return;
  }

  produto.selecionado = selecionado;

  salvarCarrinho();

  atualizarCarrinho();

}

function transformarPreco(valor) {

  if (!valor) {
    return 0;
  }

  let texto =
    String(valor)
      .replace(/[^\d,.-]/g, "")
      .trim();

  if (texto.includes(",") && texto.includes(".")) {

    texto =
      texto.replace(/\./g, "")
           .replace(",", ".");

  } else if (texto.includes(",")) {

    texto =
      texto.replace(",", ".");

  }

  const numero =
    parseFloat(texto);

  return Number.isFinite(numero)
    ? numero
    : 0;

}

function dinheiro(valor) {

  return valor.toLocaleString(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL"
    }
  );

}

function atualizarCarrinho() {

  const lista =
    document.getElementById(
      "listaCarrinho"
    );

  if (!lista) {
    return;
  }

  const contador =
    document.getElementById(
      "contadorCarrinho"
    );

  const quantidadeSelecionada =
    document.getElementById(
      "quantidadeSelecionada"
    );

  const total =
    document.getElementById(
      "totalCarrinho"
    );

  if (contador) {
    contador.textContent =
      carrinho.length;
  }

  const selecionados =
    carrinho.filter(
      p => p.selecionado
    );

  if (quantidadeSelecionada) {

    quantidadeSelecionada.textContent =
      selecionados.length;

  }

  let valorTotal = 0;

  selecionados.forEach(p => {

    valorTotal +=
      transformarPreco(p.preco);

  });

  if (total) {

    total.textContent =
      dinheiro(valorTotal);

  }

  if (!carrinho.length) {

    lista.innerHTML = `

      <div class="cart-empty">

        <div>🛒</div>

        <h3>Seu carrinho está vazio</h3>

        <p>
          Adicione produtos que você quer guardar.
        </p>

      </div>

    `;

    return;

  }

  lista.innerHTML =

    carrinho.map(p => `

      <div class="cart-item">

        <input
          type="checkbox"
          class="cart-checkbox"
          ${p.selecionado ? "checked" : ""}
          onchange="
            selecionarProduto(
              '${p.id}',
              this.checked
            )
          "
        >

        <img
          src="${escCarrinho(p.imagem)}"
          alt="${escCarrinho(p.nome)}"
          onerror="this.style.display='none'"
        >

        <div class="cart-item-info">

          <strong>
            ${escCarrinho(p.nome)}
          </strong>

          <span>
            ${escCarrinho(p.preco)}
          </span>

          <a
            href="produto.html?id=${encodeURIComponent(p.id)}"
          >
            Ver produto
          </a>

        </div>

        <button
          class="remove-cart"
          onclick="
            removerProduto('${p.id}')
          "
        >
          🗑️
        </button>

      </div>

    `).join("");

}

function escCarrinho(valor = "") {

  return String(valor).replace(
    /[&<>"']/g,
    m => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[m])
  );

}

function abrirCarrinho() {

  document
    .getElementById("carrinho")
    .classList.add("open");

  document
    .getElementById("carrinhoOverlay")
    .classList.add("show");

}

function fecharCarrinho() {

  document
    .getElementById("carrinho")
    .classList.remove("open");

  document
    .getElementById("carrinhoOverlay")
    .classList.remove("show");

}

document.addEventListener(
  "DOMContentLoaded",
  () => {

    document
      .getElementById("abrirCarrinho")
      ?.addEventListener(
        "click",
        abrirCarrinho
      );

    document
      .getElementById("fecharCarrinho")
      ?.addEventListener(
        "click",
        fecharCarrinho
      );

    document
      .getElementById("carrinhoOverlay")
      ?.addEventListener(
        "click",
        fecharCarrinho
      );

    atualizarCarrinho();

  }
);
