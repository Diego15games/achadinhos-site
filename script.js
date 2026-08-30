const API = "https://achados.onrender.com";

const IMAGEM_PADRAO =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600">
<rect width="800" height="600" fill="#f3f4f6"/>
<rect x="245" y="150" width="310" height="230" rx="24"
fill="#fff" stroke="#d1d5db" stroke-width="5"/>
<circle cx="335" cy="235" r="28" fill="#d1d5db"/>
<path d="M280 335l75-75 55 55 45-45 65 65H280z"
fill="#d1d5db"/>
<text x="400" y="440"
text-anchor="middle"
font-family="Arial,sans-serif"
font-size="30"
font-weight="700"
fill="#6b7280">
Imagem indisponível
</text>
</svg>`);

let todos = [];
let categoriaAtual = "";

function esc(s = "") {
  return String(s).replace(/[&<>"']/g, m => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[m]));
}

function imagemValida(url) {
  return String(url || "").trim() || IMAGEM_PADRAO;
}

function erroImagem(img) {

  if (img.dataset.fallback === "1") {
    return;
  }

  img.dataset.fallback = "1";
  img.src = IMAGEM_PADRAO;
}

async function carregar() {

  try {

    const [a, b] = await Promise.all([

      fetch(API + "/api/categorias"),

      fetch(API + "/api/produtos")

    ]);

    const cats = await a.json();

    todos = await b.json();

    renderCats(cats);

    renderProdutos();

  } catch (e) {

    console.error(e);

    document.getElementById("status").textContent =
      "Não foi possível carregar os produtos.";

  }
}

function renderCats(cats) {

  document.getElementById("categorias").innerHTML =

    '<button class="cat active" onclick="filtrar(\'\')">' +
    'Todos</button>' +

    cats.map(c =>

      `<button class="cat"
        onclick='filtrar(${JSON.stringify(c.nome)})'>
        ${esc(c.nome)}
      </button>`

    ).join("");

}

function filtrar(c) {

  categoriaAtual = c;

  renderProdutos();

}

function renderProdutos() {

  const lista = categoriaAtual

    ? todos.filter(
        p => p.categoria === categoriaAtual
      )

    : todos;

  document.getElementById("status").textContent =

    lista.length

      ? lista.length + " produto(s)"

      : "Nenhum produto cadastrado.";

  document.getElementById("produtos").innerHTML =

    lista.map(p => {

      const salvo =
        carrinhoTemProduto(p._id);

      return `

      <div class="product-card">

        <a
          class="card"
          href="produto.html?id=${encodeURIComponent(p._id)}"
        >

          <img
            src="${esc(imagemValida(p.imagem))}"
            alt="${esc(p.nome)}"
            onerror="erroImagem(this)"
            loading="lazy"
          >

          <div class="card-body">

            ${
              p.etiqueta
                ? `<span class="tag">
                    ${esc(p.etiqueta)}
                   </span>`
                : ""
            }

            <h3>${esc(p.nome)}</h3>

            <div class="price">
              ${esc(p.preco || "Ver preço")}
            </div>

          </div>

        </a>

        <button
          class="add-cart ${
            salvo ? "added" : ""
          }"
          onclick="adicionarDoCard(event, '${p._id}')"
        >

          ${
            salvo
              ? "✓ Guardado no carrinho"
              : "🛒 Guardar produto"
          }

        </button>

      </div>

      `;

    }).join("");

}

carregar();
