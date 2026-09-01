const IMAGEM_PADRAO_CONFIRMAR =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600">
<rect width="800" height="600" fill="#f3f4f6"/>
<text x="400" y="310"
text-anchor="middle"
font-family="Arial"
font-size="32"
font-weight="700"
fill="#6b7280">
Imagem indisponível
</text>
</svg>`);

function escConfirmar(s = "") {

  return String(s).replace(
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

function erroImagemConfirmar(img) {

  img.src = IMAGEM_PADRAO_CONFIRMAR;

}

function carregarSelecionados() {

  let produtos = [];

  try {

    produtos = JSON.parse(
      localStorage.getItem("achadinhos_compra") || "[]"
    );

  } catch {

    produtos = [];

  }

  const container =
    document.getElementById("produtosSelecionados");

  if (!produtos.length) {

    container.innerHTML = `
      <div class="confirm-product">
        <div>
          <h2>Nenhum produto selecionado.</h2>
          <p>
            Volte para o carrinho e selecione os produtos.
          </p>
        </div>
      </div>
    `;

    return;
  }

  container.innerHTML = produtos.map(p => `

    <article class="confirm-product">

      <img
        src="${escConfirmar(p.imagem)}"
        alt="${escConfirmar(p.nome)}"
        onerror="erroImagemConfirmar(this)"
      >

      <div>

        <h2>
          ${escConfirmar(p.nome)}
        </h2>

        <div class="confirm-price">
          ${escConfirmar(p.preco || "Ver preço na Amazon")}
        </div>

        <p class="confirm-description">
          ${escConfirmar(
            p.descricao || "Sem descrição."
          )}
        </p>

        <p>
          <strong>Especificações:</strong><br>
          ${escConfirmar(
            p.especificacoes || "Não informado."
          )}
        </p>

        ${
          p.linkAmazon
            ? `
              <a
                class="amazon-link"
                href="${escConfirmar(p.linkAmazon)}"
                target="_blank"
                rel="noopener noreferrer"
              >
                🛒 Ver produto na Amazon
              </a>
            `
            : ""
        }

      </div>

    </article>

  `).join("");

  container.innerHTML += `

    <div class="price-warning">

      ⚠️ <strong>Atenção:</strong>
      os preços exibidos são apenas preços principais e podem mudar.
      O valor final na Amazon pode ser diferente devido a descontos,
      cupons, frete, promoções, impostos ou outras condições.

    </div>

  `;

}

carregarSelecionados();
