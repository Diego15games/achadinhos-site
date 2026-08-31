const CHAVE="achadinhos_carrinho";
const lista=document.getElementById("listaCarrinho");
let carrinho=carregar();
function carregar(){try{return JSON.parse(localStorage.getItem(CHAVE))||[]}catch{return[]}}
function salvar(){localStorage.setItem(CHAVE,JSON.stringify(carrinho))}
function esc(v=""){return String(v).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function preco(v){if(!v)return 0;let s=String(v).replace(/[^\d,.-]/g,"");if(s.includes(",")&&s.includes("."))s=s.replace(/\./g,"").replace(",",".");else s=s.replace(",",".");const n=parseFloat(s);return Number.isFinite(n)?n:0}
function dinheiro(n){return n.toLocaleString("pt-BR",{style:"currency",currency:"BRL"})}
function render(){
const selecionados=carrinho.filter(p=>p.selecionado);
const total=selecionados.reduce((s,p)=>s+preco(p.preco),0);
document.getElementById("quantidadeSelecionada").textContent=selecionados.length;
document.getElementById("totalCarrinho").textContent=dinheiro(total);
if(!carrinho.length){lista.innerHTML='<div class="empty-cart"><div>🛒</div><h2>Seu carrinho está vazio</h2><p>Volte para a loja e guarde os produtos que quiser.</p><a class="back-button" href="index.html">Ver produtos</a></div>';return}
lista.innerHTML=carrinho.map((p,i)=>`<article class="saved-product">
<input class="select-product" type="checkbox" ${p.selecionado?"checked":""} onchange="selecionar(${i},this.checked)">
<img src="${esc(p.imagem||"")}" alt="${esc(p.nome)}" onerror="this.style.display='none'">
<div class="saved-info"><h2>${esc(p.nome)}</h2><p class="saved-price">${esc(p.preco||"Ver preço na Amazon")}</p>
<div class="saved-actions"><a class="view-product" href="produto.html?id=${encodeURIComponent(p.id)}">Ver produto</a><button class="remove-product" onclick="remover(${i})">Remover</button></div></div>
</article>`).join("")}
function selecionar(i,v){carrinho[i].selecionado=v;salvar();render()}
function remover(i){carrinho.splice(i,1);salvar();render()}
document.getElementById("comprarSelecionados").addEventListener("click",()=>{const p=carrinho.filter(x=>x.selecionado);if(!p.length){alert("Selecione pelo menos um produto.");return}localStorage.setItem("achadinhos_compra",JSON.stringify(p));location.href="confirmar-compra.html"});
render();