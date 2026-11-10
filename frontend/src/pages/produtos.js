
const areaProdutos = document.querySelector("#lista-produtos");
const campoBusca = document.querySelector("#busca");
const mensagem = document.querySelector("#mensagem-produtos");

let produtos = [];

async function carregarProdutos() {
  try {
    produtos = await AstroShop.requisicaoAPI("/api/produtos");
    renderizarProdutos();
  } catch (erro) {
    mensagem.textContent = erro.message;
    mensagem.className = "mensagem erro";
    areaProdutos.innerHTML = "";
  }
}

function renderizarProdutos() {
  const termo = campoBusca.value.trim().toLowerCase();

  const filtrados = produtos.filter(produto =>
    `${produto.nome} ${produto.categoria} ${produto.descricao || ""}`
      .toLowerCase()
      .includes(termo)
  );

  areaProdutos.innerHTML = "";

  if (!filtrados.length) {
    areaProdutos.innerHTML =
      '<p class="vazio">Nenhum produto encontrado.</p>';
    return;
  }

  filtrados.forEach(produto => {
    const card = document.createElement("article");
    card.className = "produto-card";

    card.innerHTML = `
      <div class="produto-conteudo">
        <p class="texto-secundario">${AstroShop.escaparHTML(produto.categoria)}</p>
        <h2>${AstroShop.escaparHTML(produto.nome)}</h2>
        <p>${AstroShop.escaparHTML(produto.descricao || "Sem descrição.")}</p>
        <p class="texto-secundario">
          ${Number(produto.estoque) > 0
            ? `Estoque: ${Number(produto.estoque)}`
            : "Indisponível"}
        </p>
        <span class="preco">${AstroShop.formatarPreco(produto.preco)}</span>
        <button class="botao" type="button"
          data-adicionar="${Number(produto.id_produto)}"
          ${Number(produto.estoque) <= 0 ? "disabled" : ""}>
          Adicionar ao carrinho
        </button>
      </div>
    `;

    areaProdutos.appendChild(card);
  });
}

campoBusca.addEventListener("input", renderizarProdutos);

areaProdutos.addEventListener("click", async event => {
  const botao = event.target.closest("[data-adicionar]");
  if (!botao) return;

  if (!AstroShop.obterToken()) {
    window.location.href = "../formularios/login.html";
    return;
  }

  botao.disabled = true;

  try {
    await AstroShop.requisicaoAPI("/api/carrinho/itens", {
      method: "POST",
      body: JSON.stringify({
        id_produto: Number(botao.dataset.adicionar),
        quantidade: 1
      })
    });

    mensagem.textContent = "Produto adicionado ao carrinho!";
    mensagem.className = "mensagem sucesso";
  } catch (erro) {
    mensagem.textContent = erro.message;
    mensagem.className = "mensagem erro";
  } finally {
    botao.disabled = false;
  }
});

carregarProdutos();
