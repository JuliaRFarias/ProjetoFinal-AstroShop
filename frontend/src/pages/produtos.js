
const areaProdutos = document.querySelector("#lista-produtos");
const campoBusca = document.querySelector("#busca");
const mensagem = document.querySelector("#mensagem-produtos");

let produtos = [];

// FORMATAR PREÇO
function formatarPreco(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

// CARREGAR PRODUTOS
async function carregarProdutos() {
    try {
        mensagem.textContent = "Carregando produtos...";

        const dados = await AstroShop.requisicaoAPI("/api/produtos");

        produtos = Array.isArray(dados)
            ? dados
            : dados.produtos || dados.dados || [];

        mensagem.textContent = "";
        renderizarProdutos();

    } catch (erro) {
        mensagem.textContent = erro.message;
        mensagem.className = "mensagem erro";
        areaProdutos.innerHTML = "";
        console.error("Erro ao carregar produtos:", erro);
    }
}

// OBTER IMAGEM DO PRODUTO
function obterImagem(produto) {
    return produto.imagem_url ||
           produto.imagem ||
           produto.foto ||
           "https://placehold.co/600x400/102A56/FFFFFF?text=AstroShop";
}

// MOSTRAR PRODUTOS
function renderizarProdutos() {
    const termo = campoBusca.value.trim().toLowerCase();

    const filtrados = produtos.filter(produto =>
        `${produto.nome || ""} ${produto.categoria || ""} ${produto.descricao || ""}`
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

        const imagem = document.createElement("img");
        imagem.className = "imagem-produto";
        imagem.src = obterImagem(produto);
        imagem.alt = produto.nome || "Produto AstroShop";
        imagem.loading = "lazy";

        imagem.onerror = () => {
            imagem.onerror = null;
            imagem.src =
                "https://placehold.co/600x400/102A56/FFFFFF?text=Imagem+indisponivel";
        };

        const conteudo = document.createElement("div");
        conteudo.className = "produto-conteudo";

        const categoria = document.createElement("p");
        categoria.className = "texto-secundario";
        categoria.textContent = produto.categoria || "AstroShop";

        const nome = document.createElement("h2");
        nome.textContent = produto.nome || "Produto";

        const descricao = document.createElement("p");
        descricao.textContent = produto.descricao || "Sem descrição.";

        const estoque = document.createElement("p");
        estoque.className = "texto-secundario";
        estoque.textContent = Number(produto.estoque) > 0
            ? `Estoque: ${produto.estoque}`
            : "Indisponível";

        const preco = document.createElement("span");
        preco.className = "preco";
        preco.textContent = formatarPreco(produto.preco);

        const botao = document.createElement("button");
        botao.className = "botao";
        botao.type = "button";
        botao.dataset.adicionar = produto.id_produto;
        botao.textContent = "Adicionar ao carrinho";
        botao.disabled = Number(produto.estoque) <= 0;

        conteudo.append(
            categoria,
            nome,
            descricao,
            estoque,
            preco,
            botao
        );

        card.append(imagem, conteudo);
        areaProdutos.appendChild(card);
    });
}

// BUSCAR PRODUTOS
campoBusca.addEventListener("input", renderizarProdutos);

// ADICIONAR AO CARRINHO
areaProdutos.addEventListener("click", async evento => {
    const botao = evento.target.closest("[data-adicionar]");

    if (!botao) return;

    const idProduto = Number(botao.dataset.adicionar);

    botao.disabled = true;
    botao.textContent = "Adicionando...";

    try {
        await AstroShop.requisicaoAPI("/api/carrinho/itens", {
            method: "POST",
            body: JSON.stringify({
                id_produto: idProduto,
                quantidade: 1
            })
        });

        mensagem.textContent = "Produto adicionado ao carrinho!";
        mensagem.className = "mensagem sucesso";
        botao.textContent = "Adicionado!";

    } catch (erro) {
        mensagem.textContent = erro.message;
        mensagem.className = "mensagem erro";
        botao.textContent = "Adicionar ao carrinho";

        console.error("Erro ao adicionar ao carrinho:", erro);

    } finally {
        botao.disabled = false;
    }
});

// INICIAR
carregarProdutos();
