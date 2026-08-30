const API = "https://achados.onrender.com";

let adminKey = localStorage.getItem("achadinhos_admin_key") || "";
let produtoEditando = null;

function esc(s = "") {
  return String(s).replace(/[&<>"']/g, m => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[m]));
}

function authHeaders(json = false) {
  const h = {
    "x-admin-key": adminKey
  };

  if (json) {
    h["Content-Type"] = "application/json";
  }

  return h;
}

/* LOGIN */

async function garantirLogin() {

  if (adminKey) {

    const r = await fetch(API + "/api/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        key: adminKey
      })
    });

    if (r.ok) {
      return true;
    }

    localStorage.removeItem("achadinhos_admin_key");
    adminKey = "";
  }

  const key = prompt("Digite a chave de administrador:");

  if (!key) {
    return false;
  }

  const r = await fetch(API + "/api/admin/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      key
    })
  });

  const d = await r.json();

  if (!r.ok) {
    alert(d.erro || "Chave incorreta.");
    return false;
  }

  adminKey = key;

  localStorage.setItem(
    "achadinhos_admin_key",
    key
  );

  return true;
}

/* PREVIEW DAS FOTOS */

document
  .getElementById("arquivosImagens")
  .addEventListener("change", function () {

    const preview =
      document.getElementById("previewImagens");

    preview.innerHTML = "";

    const arquivos = [...this.files];

    arquivos.forEach(file => {

      const url =
        URL.createObjectURL(file);

      const img =
        document.createElement("img");

      img.src = url;

      img.style.width = "100px";
      img.style.height = "80px";
      img.style.objectFit = "cover";
      img.style.borderRadius = "10px";
      img.style.border = "1px solid #ddd";

      preview.appendChild(img);

    });

  });

/* ENVIAR FOTOS */

async function enviarImagens() {

  const input =
    document.getElementById("arquivosImagens");

  if (!input.files.length) {
    return [];
  }

  const formData =
    new FormData();

  [...input.files].forEach(file => {

    formData.append(
      "imagens",
      file
    );

  });

  const r = await fetch(
    API + "/api/upload",
    {
      method: "POST",

      headers: {
        "x-admin-key": adminKey
      },

      body: formData
    }
  );

  const d = await r.json();

  if (!r.ok) {
    throw new Error(
      d.erro || "Erro ao enviar fotos."
    );
  }

  return d.urls.map(
    url => API + url
  );
}

/* CARREGAR DADOS */

async function carregar() {

  try {

    const [
      categoriasResponse,
      produtosResponse
    ] = await Promise.all([

      fetch(
        API + "/api/categorias"
      ),

      fetch(
        API + "/api/produtos"
      )

    ]);

    const categorias =
      await categoriasResponse.json();

    const produtos =
      await produtosResponse.json();

    /* CATEGORIAS */

    document.getElementById(
      "categoria"
    ).innerHTML =
      '<option value="">Sem categoria</option>' +

      categorias.map(c =>
        `<option value="${esc(c.nome)}">
          ${esc(c.nome)}
        </option>`
      ).join("");

    document.getElementById(
      "listaCategorias"
    ).innerHTML =

      categorias.map(c => `

        <div class="admin-item">

          <span>
            ${esc(c.nome)}
          </span>

          <button
            class="danger"
            onclick="delCat('${c._id}')"
          >
            Excluir
          </button>

        </div>

      `).join("");

    /* PRODUTOS */

    document.getElementById(
      "listaProdutos"
    ).innerHTML =

      produtos.map(p => `

        <div class="admin-item">

          <span>

            <b>
              ${esc(p.nome)}
            </b>

            <br>

            ${esc(p.preco || "")}

          </span>

          <span>

            <button
              onclick="editarProduto('${p._id}')"
            >
              Editar
            </button>

            <button
              class="danger"
              onclick="delProd('${p._id}')"
            >
              Excluir
            </button>

          </span>

        </div>

      `).join("");

  } catch (e) {

    console.error(e);

    alert(
      "Erro ao carregar dados."
    );

  }

}

/* CRIAR / EDITAR PRODUTO */

document.getElementById(
  "produtoForm"
).onsubmit = async function (e) {

  e.preventDefault();

  try {

    const fotos =
      await enviarImagens();

    /* NOVO PRODUTO */

    if (!produtoEditando && !fotos.length) {

      alert(
        "Selecione pelo menos uma foto do produto."
      );

      return;
    }

    let imagens = fotos;

    /* EDITANDO SEM TROCAR FOTO */

    if (
      produtoEditando &&
      !fotos.length
    ) {

      const resposta =
        await fetch(
          API +
          "/api/produtos/" +
          produtoEditando
        );

      const produto =
        await resposta.json();

      imagens = [
        produto.imagem,
        ...(Array.isArray(produto.imagens)
          ? produto.imagens
          : [])
      ];

    }

    const body = {

      nome:
        document.getElementById(
          "nome"
        ).value.trim(),

      categoria:
        document.getElementById(
          "categoria"
        ).value,

      preco:
        document.getElementById(
          "preco"
        ).value.trim(),

      imagem:
        imagens[0],

      imagens:
        imagens.slice(1),

      descricao:
        document.getElementById(
          "descricao"
        ).value,

      especificacoes:
        document.getElementById(
          "especificacoes"
        ).value,

      linkAmazon:
        document.getElementById(
          "linkAmazon"
        ).value.trim(),

      etiqueta:
        document.getElementById(
          "etiqueta"
        ).value.trim()

    };

    let r;

    /* EDITAR */

    if (produtoEditando) {

      r = await fetch(
        API +
        "/api/produtos/" +
        produtoEditando,

        {
          method: "PUT",

          headers:
            authHeaders(true),

          body:
            JSON.stringify(body)
        }
      );

    }

    /* NOVO */

    else {

      r = await fetch(
        API + "/api/produtos",

        {
          method: "POST",

          headers:
            authHeaders(true),

          body:
            JSON.stringify(body)
        }
      );

    }

    const d =
      await r.json();

    if (!r.ok) {

      alert(
        d.erro ||
        "Erro ao salvar produto."
      );

      return;
    }

    alert(
      produtoEditando
        ? "Produto atualizado!"
        : "Produto adicionado!"
    );

    this.reset();

    document.getElementById(
      "previewImagens"
    ).innerHTML = "";

    produtoEditando = null;

    this.querySelector(
      'button[type="submit"]'
    ).textContent =
      "Adicionar produto";

    carregar();

  } catch (erro) {

    console.error(erro);

    alert(
      erro.message ||
      "Erro ao salvar produto."
    );

  }

};

/* EDITAR */

async function editarProduto(id) {

  try {

    const r =
      await fetch(
        API +
        "/api/produtos/" +
        id
      );

    const p =
      await r.json();

    if (!r.ok) {
      alert(p.erro);
      return;
    }

    produtoEditando = id;

    document.getElementById(
      "nome"
    ).value = p.nome || "";

    document.getElementById(
      "categoria"
    ).value =
      p.categoria || "";

    document.getElementById(
      "preco"
    ).value =
      p.preco || "";

    document.getElementById(
      "descricao"
    ).value =
      p.descricao || "";

    document.getElementById(
      "especificacoes"
    ).value =
      p.especificacoes || "";

    document.getElementById(
      "linkAmazon"
    ).value =
      p.linkAmazon || "";

    document.getElementById(
      "etiqueta"
    ).value =
      p.etiqueta || "";

    document.querySelector(
      "#produtoForm button[type='submit']"
    ).textContent =
      "Salvar alterações";

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

  } catch {

    alert(
      "Erro ao carregar produto."
    );

  }

}

/* EXCLUIR CATEGORIA */

async function delCat(id) {

  if (!confirm(
    "Excluir categoria?"
  )) {
    return;
  }

  const r =
    await fetch(
      API +
      "/api/categorias/" +
      id,

      {
        method: "DELETE",
        headers: authHeaders()
      }
    );

  const d =
    await r.json();

  if (!r.ok) {
    alert(d.erro);
    return;
  }

  carregar();
}

/* EXCLUIR PRODUTO */

async function delProd(id) {

  if (!confirm(
    "Excluir produto?"
  )) {
    return;
  }

  const r =
    await fetch(
      API +
      "/api/produtos/" +
      id,

      {
        method: "DELETE",
        headers: authHeaders()
      }
    );

  const d =
    await r.json();

  if (!r.ok) {
    alert(d.erro);
    return;
  }

  carregar();
}

window.editarProduto =
  editarProduto;

window.delCat =
  delCat;

window.delProd =
  delProd;

/* INICIAR */

(async function () {

  const ok =
    await garantirLogin();

  if (!ok) {

    document.body.innerHTML =
      `
      <h2 style="
        font-family:Arial;
        text-align:center;
        margin:50px
      ">
        Acesso negado.
      </h2>
      `;

    return;
  }

  await carregar();

})();
