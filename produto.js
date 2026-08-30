const API = "https://achados.onrender.com";

// Imagem padrão quando a URL estiver quebrada ou tiver sido removida.
const IMAGEM_PADRAO = "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <rect width="800" height="600" fill="#f3f4f6"/>
  <rect x="245" y="150" width="310" height="230" rx="24" fill="#ffffff" stroke="#d1d5db" stroke-width="5"/>
  <circle cx="335" cy="235" r="28" fill="#d1d5db"/>
  <path d="M280 335l75-75 55 55 45-45 65 65H280z" fill="#d1d5db"/>
  <text x="400" y="440" text-anchor="middle" font-family="Arial,sans-serif" font-size="30" font-weight="700" fill="#6b7280">Imagem indisponível</text>
</svg>`);

function esc(s = "") {
  return String(s).replace(/[&<>"']/g, m => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[m]));
}

function br(s = "") {
  return esc(s).replace(/\n/g, "<br>");
}

function imagemSegura(url, fallback = IMAGEM_PADRAO) {
  const valor = String(url || "").trim();
  return valor || fallback;
}

function configurarImagem(img, url) {
  img.onerror = function () {
    if (img.dataset.fallback === "1") return;
    img.dataset.fallback = "1";
    img.src = IMAGEM_PADRAO;
  };
  img.src = imagemSegura(url);
}

async function carregar() {
  const id = new URLSearchParams(location.search).get("id");
  const el = document.getElementById("produto");

  if (!id) {
    el.textContent = "Produto não informado.";
    return;
  }

  try {
    const r = await fetch(API + "/api/produtos/" + encodeURIComponent(id));
    const p = await r.json();
    if (!r.ok) throw new Error("Produto não encontrado");

    const imgs = [p.imagem, ...(Array.isArray(p.imagens) ? p.imagens : [])]
      .map(x => String(x || "").trim())
      .filter(Boolean);

    const imagens = imgs.length ? imgs : [IMAGEM_PADRAO];

    el.innerHTML = `
      <div class="product-box">
        <div>
          <img id="mainImg" class="main-img" alt="${esc(p.nome)}">
          <div class="thumbs" id="thumbs"></div>
        </div>
        <div>
          ${p.etiqueta ? `<span class="tag">${esc(p.etiqueta)}</span>` : ""}
          <h1>${esc(p.nome)}</h1>
          <div class="price">${esc(p.preco || "Ver preço na Amazon")}</div>
          <h2>Descrição</h2>
          <p>${br(p.descricao || "Sem descrição.")}</p>
          <h2>Especificações</h2>
          <p>${br(p.especificacoes || "Sem especificações.")}</p>
          <a class="buy" href="${esc(p.linkAmazon || "#")}" target="_blank" rel="noopener noreferrer">Ver na Amazon</a>
        </div>
      </div>`;

    const mainImg = document.getElementById("mainImg");
    configurarImagem(mainImg, imagens[0]);

    const thumbs = document.getElementById("thumbs");
    imagens.forEach((url, index) => {
      const img = document.createElement("img");
      img.alt = `Imagem ${index + 1} de ${esc(p.nome)}`;
      img.loading = "lazy";
      img.className = index === 0 ? "selected-thumb" : "";
      configurarImagem(img, url);
      img.onclick = () => {
        configurarImagem(mainImg, url);
        document.querySelectorAll(".thumbs img").forEach(t => t.classList.remove("selected-thumb"));
        img.classList.add("selected-thumb");
      };
      thumbs.appendChild(img);
    });
  } catch (e) {
    console.error(e);
    el.textContent = "Não foi possível carregar este produto.";
  }
}

carregar();
