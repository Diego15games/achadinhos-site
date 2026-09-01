const CHAVE_CARRINHO = "achadinhos_carrinho";

let carrinho = [];

try {
  carrinho = JSON.parse(
    localStorage.getItem(CHAVE_CARRINHO) || "[]"
  );
} catch {
  carrinho = [];
}

function salvarCarrinho() {
  localStorage.setItem(
    CHAVE_CARRINHO,
    JSON.stringify(carrinho)
  );

  atualizarContador();
  renderCarrinho();

  if (typeof renderProdutos === "function") {
    renderProdutos();
  }
}

function carrinhoTemProduto(id) {
  return carrinho.some(p => String(p._id) === String(id));
}

function adicionarDoCard(event, id) {

  event.preventDefault();
  event.stopPropagation();

  const produto = todos.find(
    p => String(p._id) === String(id)
  );

  if (!produto) return;

  if (carrinhoTemProduto(id)) {
    carrinho = carrinho.filter(
      p => String(p._id) !== String(id)
    );
  } else {

    carrinho.push({
      _id: produto._id,
      nome: produto.nome,
      preco: produto.preco,
      imagem: produto.imagem,
      descricao: produto.descricao || "",
      especificacoes: produto.especificacoes || "",
      linkAmazon: produto.linkAmazon || "",
      selecionado: false
    });

  }

  salvarCarrinho();
}

function atualizarContador() {

  const contador =
    document.getElementById("contadorCarrinho");

  if (contador) {
    contador.textContent = carrinho.length;
  }
}

function abrirCarrinho() {

  document
    .getElementById("carrinho")
    .classList.add("open");

  document
    .getElementById("carrinhoOverlay")
    .classList.add("open");

  renderCarrinho();
}

function fecharCarrinho() {

  document
    .getElementById("carrinho")
    .classList.remove("open");

  document
    .getElementById("carrinhoOverlay")
    .classList.remove("open");
}

function numeroPreco(valor) {

  if (!valor) return 0;

  let texto = String(valor)
    .replace(/[R$\s]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");

  const numero = parseFloat(texto);

  return isNaN(numero) ? 0 : numero;
}

function formatarPreco(numero) {

  return numero.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function renderCarrinho() {

  const lista =
    document.getElementById("listaCarrinho");

  if (!lista) return;

  if (!carrinho.length) {

    lista.innerHTML = `
      <div style="
        padding:30px 20px;
        text-align:center;
        color:#6b7280;
      ">
        🛒<br><br>
        Nenhum produto guardado ainda.
      </div>
    `;

    atualizarResumo();
    return;
  }

  lista.innerHTML = carrinho.map(p => `

    <div class="cart-item">

      <input
        class="cart-check"
        type="checkbox"
        ${p.selecionado ? "checked" : ""}
        onchange="selecionarProduto('${p._id}', this.checked)"
      >

      <img
        src="${esc(p.imagem || '')}"
        onerror="erroImagem(this)"
        alt="${esc(p.nome)}"
      >

      <div class="cart-item-info">

        <div class="cart-item-name">
          ${esc(p.nome)}
        </div>

        <div class="cart-item-price">
          ${esc(p.preco || "Ver preço")}
        </div>

        <a
          class="cart-product-link"
          href="produto.html?id=${encodeURIComponent(p._id)}"
        >
          Ver produto
        </a>

      </div>

      <button
        class="remove-cart"
        onclick="removerProduto('${p._id}')"
        title="Remover"
      >
        🗑️
      </button>

    </div>

  `).join("");

  atualizarResumo();
}

function selecionarProduto(id, selecionado) {

  const produto = carrinho.find(
    p => String(p._id) === String(id)
  );

  if (!produto) return;

  produto.selecionado = selecionado;

  salvarCarrinho();
}

function removerProduto(id) {

  carrinho = carrinho.filter(
    p => String(p._id) !== String(id)
  );

  salvarCarrinho();
}

function atualizarResumo() {

  const selecionados =
    carrinho.filter(p => p.selecionado);

  const quantidade =
    document.getElementById("quantidadeSelecionada");

  const total =
    document.getElementById("totalCarrinho");

  const comprar =
    document.getElementById("comprarSelecionados");

  if (quantidade) {
    quantidade.textContent = selecionados.length;
  }

  const valorTotal = selecionados.reduce(
    (soma, p) => soma + numeroPreco(p.preco),
    0
  );

  if (total) {
    total.textContent = formatarPreco(valorTotal);
  }

  if (comprar) {
    comprar.disabled = selecionados.length === 0;
  }
}

function comprarSelecionados() {

  const selecionados =
    carrinho.filter(p => p.selecionado);

  if (!selecionados.length) {
    alert("Selecione pelo menos um produto.");
    return;
  }

  localStorage.setItem(
    "achadinhos_compra",
    JSON.stringify(selecionados)
  );

  window.location.href = "confirmar-compra.html";
}

document.addEventListener("DOMContentLoaded", () => {

  atualizarContador();
  renderCarrinho();

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

  document
    .getElementById("comprarSelecionados")
    ?.addEventListener(
      "click",
      comprarSelecionados
    );

});
