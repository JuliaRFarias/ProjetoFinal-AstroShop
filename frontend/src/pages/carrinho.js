
const areaCarrinho = document.querySelector("#itens-carrinho");
const totalCarrinho = document.querySelector("#total-carrinho");
const mensagemCarrinho = document.querySelector("#mensagem-carrinho");
const botaoFinalizar = document.querySelector("#finalizar-compra");
const botaoLimpar = document.querySelector("#limpar-carrinho");

let itensCarrinho = [];

function informar(texto, tipo = "") {
  mensagemCarrinho.textContent = texto;
  mensagemCarrinho.className = `mensagem ${tipo}`;
}

async function carregarCarrinho() {
  if (!AstroShop.obterToken()) {
    areaCarrinho.innerHTML = `
      <div class="vazio">
        <p>Entre na sua conta para consultar o carrinho.</p>
        <a class="botao" href="../formularios/login.html">Fazer login</a>
      </div>
    `;
    totalCarrinho.textContent = AstroShop.formatarPreco(0);
    botaoFinalizar.disabled = true;
    botaoLimpar.disabled = true;
    return;
  }

  try {
    const dados = await AstroShop.requisicaoAPI("/api/carrinho");
    itensCarrinho = dados.itens;
    renderizarCarrinho();
  } catch (erro) {
    informar(erro.message, "erro");
  }
}

function renderizarCarrinho() {
  areaCarrinho.innerHTML = "";

  if (!itensCarrinho.length) {
    areaCarrinho.innerHTML =
      '<div class="vazio">Seu carrinho está vazio. Explore nosso catálogo!</div>';

    totalCarrinho.textContent = AstroShop.formatarPreco(0);
    botaoFinalizar.disabled = true;
    botaoLimpar.disabled = true;
    return;
  }

  botaoFinalizar.disabled = false;
  botaoLimpar.disabled = false;

  let total = 0;

  itensCarrinho.forEach(item => {
    const preco = Number(item.preco);
    const quantidade = Number(item.quantidade);
    const subtotal = preco * quantidade;

    total += subtotal;

    const elemento = document.createElement("article");
    elemento.className = "item-carrinho";

    elemento.innerHTML = `
      <div>
        <h3>${AstroShop.escaparHTML(item.nome)}</h3>
        <p class="texto-secundario">
          ${AstroShop.formatarPreco(preco)} por unidade
        </p>
        <p>Subtotal: <strong>${AstroShop.formatarPreco(subtotal)}</strong></p>
      </div>
      <div class="controles-quantidade">
        <label for="quantidade-${Number(item.id_produto)}">Qtd.</label>
        <input id="quantidade-${Number(item.id_produto)}"
          type="number" min="1" max="${Number(item.estoque)}"
          value="${quantidade}"
          data-quantidade="${Number(item.id_produto)}">
        <button class="botao botao-secundario"
          data-remover="${Number(item.id_produto)}" type="button">
          Remover
        </button>
      </div>
    `;

    areaCarrinho.appendChild(elemento);
  });

  totalCarrinho.textContent = AstroShop.formatarPreco(total);
}

areaCarrinho.addEventListener("change", async event => {
  const campo = event.target.closest("[data-quantidade]");
  if (!campo) return;

  const idProduto = Number(campo.dataset.quantidade);
  const quantidade = Number(campo.value);

  if (!Number.isInteger(quantidade) || quantidade < 1) {
    informar("Informe uma quantidade válida.", "erro");
    await carregarCarrinho();
    return;
  }

  try {
    await AstroShop.requisicaoAPI(
      `/api/carrinho/itens/${idProduto}`,
      {
        method: "PUT",
        body: JSON.stringify({ quantidade })
      }
    );

    informar("Quantidade atualizada.", "sucesso");
    await carregarCarrinho();
  } catch (erro) {
    informar(erro.message, "erro");
    await carregarCarrinho();
  }
});

areaCarrinho.addEventListener("click", async event => {
  const botao = event.target.closest("[data-remover]");
  if (!botao) return;

  try {
    await AstroShop.requisicaoAPI(
      `/api/carrinho/itens/${Number(botao.dataset.remover)}`,
      { method: "DELETE" }
    );

    informar("Produto removido do carrinho.", "sucesso");
    await carregarCarrinho();
  } catch (erro) {
    informar(erro.message, "erro");
  }
});

botaoLimpar.addEventListener("click", async () => {
  if (!confirm("Deseja remover todos os itens do carrinho?")) return;

  try {
    await AstroShop.requisicaoAPI("/api/carrinho", {
      method: "DELETE"
    });

    informar("Carrinho esvaziado.", "sucesso");
    await carregarCarrinho();
  } catch (erro) {
    informar(erro.message, "erro");
  }
});

botaoFinalizar.addEventListener("click", async () => {
  if (!itensCarrinho.length) return;

  botaoFinalizar.disabled = true;

  try {
    const compra = await AstroShop.requisicaoAPI("/api/compras", {
      method: "POST"
    });

    informar(
      `Compra ${compra.id_compra} registrada. Total: ${
        AstroShop.formatarPreco(compra.valor_total)
      }`,
      "sucesso"
    );

    await carregarCarrinho();
  } catch (erro) {
    informar(erro.message, "erro");
  } finally {
    botaoFinalizar.disabled = false;
  }
});

carregarCarrinho();
