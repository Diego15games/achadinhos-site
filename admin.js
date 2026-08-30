const API = "https://achados.onrender.com";

let adminKey = localStorage.getItem("achadinhos_admin_key") || "";
let produtoEditando = null;

function esc(s = "") {
  return String(s).replace(/[&<>"']/g, m => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[m]));
}

function authHeaders(json = false) {
  const h = { "x-admin-key": adminKey };
  if (json) h["Content-Type"] = "application/json";
  return h;
}

async function garantirLogin() {
  if (adminKey) {
    const r = await fetch(API + "/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: adminKey })
    });
    if (r.ok) return true;
    localStorage.removeItem("achadinhos_admin_key");
    adminKey = "";
  }

  const key = prompt("Digite a chave de administrador:");
  if (!key) return false;

  const r = await fetch(API + "/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key })
  });
  const d = await r.json();

  if (!r.ok) {
    alert(d.erro || "Chave incorreta.");
    return false;
  }

  adminKey = key;
  localStorage.setItem("achadinhos_admin_key", key);
  return true;
}

function criarAreaUpload() {
  if (document.getElementById("arquivosImagens")) return;

  const imagem = document.getElementById("imagem");
  if (!imagem) return;

  const box = document.createElement("div");
  box.style.cssText = "margin:10px 0;padding:12px;border:1px dashed #bbb;border-radius:10px";

  box.innerHTML = `
    <label><b>📷 Ou envie as fotos pelo celular/computador</b></label><br>
    <small>Até 10 imagens, máximo 5 MB cada.</small><br><br>
    <input id="arquivosImagens" type="file" accept="image/*" multiple>
    <div id="previewImagens" style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px"></div>
  `;

  imagem.parentNode.insertBefore(box, imagem);

  document.getElementById("arquivosImagens").addEventListener("change", mostrarPreviews);
}

function mostrarPreviews() {
  const area = document.getElementById("previewImagens");
  area.innerHTML = "";

  [...this.files].forEach(file => {
    const url = URL.createObjectURL(file);
    const img = document.createElement("img");
    img.src = url;
    img.style.cssText = "width:90px;height:70px;object-fit:cover;border-radius:8px";
    area.appendChild(img);
  });
}

async function enviarImagens() {
  const input = document.getElementById("arquivosImagens");
  if (!input || !input.files.length) return [];

  const fd = new FormData();
  [...input.files].forEach(file => fd.append("imagens", file));

  const r = await fetch(API + "/api/upload", {
    method: "POST",
    headers: { "x-admin-key": adminKey },
    body: fd
  });

  const d = await r.json();
  if (!r.ok) throw new Error(d.erro || "Erro ao enviar imagens.");

  return d.urls.map(u => API + u);
}

async function carregar() {
  try {
    const [a, b] = await Promise.all([
      fetch(API + "/api/categorias"),
      fetch(API + "/api/produtos")
    ]);

    const c = await a.json();
    const p = await b.json();

    document.getElementById("categoria").innerHTML =
      '<option value="">Sem categoria</option>' +
      c.map(x => `<option value="${esc(x.nome)}">${esc(x.nome)}</option>`).join("");

    document.getElementById("listaCategorias").innerHTML =
      c.map(x => `<div class="admin-item">
        <span>${esc(x.nome)}</span>
        <button class="danger" onclick="delCat('${x._id}')">Excluir</button>
      </div>`).join("");

    document.getElementById("listaProdutos").innerHTML =
      p.map(x => `<div class="admin-item">
        <span><b>${esc(x.nome)}</b><br>${esc(x.preco || "")}</span>
        <span>
          <button onclick="editarProduto('${x._id}')">Editar</button>
          <button class="danger" onclick="delProd('${x._id}')">Excluir</button>
        </span>
      </div>`).join("");
  } catch (e) {
    console.error(e);
    alert("Erro ao carregar dados.");
  }
}

document.getElementById("categoriaForm").onsubmit = async e => {
  e.preventDefault();

  const nome = document.getElementById("categoriaNome").value.trim();

  const r = await fetch(API + "/api/categorias", {
    method: "POST",
    headers: authHeaders(true),
    body: JSON.stringify({ nome })
  });

  const d = await r.json();
  if (!r.ok) return alert(d.erro);

  e.target.reset();
  carregar();
};

document.getElementById("produtoForm").onsubmit = async e => {
  e.preventDefault();

  try {
    const novasImagens = await enviarImagens();
    let principal = novasImagens[0] || "";
    const todas = novasImagens.slice(1);

    if (!principal) {
      return alert("Escolha pelo menos uma foto ou coloque a URL da imagem principal.");
    }

    const body = {
      nome: document.getElementById("nome").value.trim(),
      categoria: document.getElementById("categoria").value,
      preco: document.getElementById("preco").value.trim(),
      imagem: principal,
      imagens: todas,
      descricao: document.getElementById("descricao").value,
      especificacoes: document.getElementById("especificacoes").value,
      linkAmazon: document.getElementById("linkAmazon").value.trim(),
      etiqueta: document.getElementById("etiqueta").value.trim()
    };

    let r;

    if (produtoEditando) {
      r = await fetch(API + "/api/produtos/" + produtoEditando, {
        method: "PUT",
        headers: authHeaders(true),
        body: JSON.stringify(body)
      });
    } else {
      r = await fetch(API + "/api/produtos", {
        method: "POST",
        headers: authHeaders(true),
        body: JSON.stringify(body)
      });
    }

    const d = await r.json();
    if (!r.ok) return alert(d.erro);

    e.target.reset();
    produtoEditando = null;

    const btn = e.target.querySelector('button[type="submit"], button');
    if (btn) btn.textContent = "Adicionar produto";

    const resultado = document.getElementById("resultado");
    if (resultado) resultado.textContent = "Produto salvo com sucesso!";

    const preview = document.getElementById("previewImagens");
    if (preview) preview.innerHTML = "";

    carregar();
  } catch (err) {
    console.error(err);
    alert(err.message || "Erro ao salvar produto.");
  }
};

async function editarProduto(id) {
  try {
    const r = await fetch(API + "/api/produtos/" + id);
    const p = await r.json();

    if (!r.ok) return alert(p.erro);

    produtoEditando = id;

    document.getElementById("nome").value = p.nome || "";
    document.getElementById("categoria").value = p.categoria || "";
    document.getElementById("preco").value = p.preco || "";
    document.getElementById("imagem").value = p.imagem || "";
    document.getElementById("imagens").value =
      Array.isArray(p.imagens) ? p.imagens.join(", ") : "";
    document.getElementById("descricao").value = p.descricao || "";
    document.getElementById("especificacoes").value = p.especificacoes || "";
    document.getElementById("linkAmazon").value = p.linkAmazon || "";
    document.getElementById("etiqueta").value = p.etiqueta || "";

    const btn = document.querySelector("#produtoForm button[type='submit']");
    if (btn) btn.textContent = "Salvar alterações";

    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (e) {
    alert("Erro ao carregar produto.");
  }
}

async function delCat(id) {
  if (!confirm("Excluir categoria?")) return;

  const r = await fetch(API + "/api/categorias/" + id, {
    method: "DELETE",
    headers: authHeaders()
  });

  const d = await r.json();
  if (!r.ok) return alert(d.erro);

  carregar();
}

async function delProd(id) {
  if (!confirm("Excluir produto?")) return;

  const r = await fetch(API + "/api/produtos/" + id, {
    method: "DELETE",
    headers: authHeaders()
  });

  const d = await r.json();
  if (!r.ok) return alert(d.erro);

  carregar();
}

window.editarProduto = editarProduto;
window.delCat = delCat;
window.delProd = delProd;

(async () => {
  const ok = await garantirLogin();
  if (!ok) {
    document.body.innerHTML = "<h2 style='font-family:Arial;text-align:center;margin:50px'>Acesso negado.</h2>";
    return;
  }

  criarAreaUpload();
  await carregar();
})();
