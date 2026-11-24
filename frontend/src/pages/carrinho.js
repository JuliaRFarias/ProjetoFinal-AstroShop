
const areaCarrinho = document.querySelector("#itens-carrinho");
const totalCarrinho = document.querySelector("#total-carrinho");
const mensagemCarrinho = document.querySelector("#mensagem-carrinho");
const botaoFinalizar = document.querySelector("#finalizar-compra");
const botaoLimpar = document.querySelector("#limpar-carrinho");

const modalPagamento = document.querySelector("#modal-pagamento");
const formularioPagamento = document.querySelector("#form-pagamento");
const botaoConfirmar = document.querySelector("#confirmar-pagamento");
const botaoCancelar = document.querySelector("#cancelar-pagamento");
const mensagemPagamento = document.querySelector("#mensagem-pagamento");

let itensCarrinho = [];
let finalizandoCompra = false;

function informar(texto, tipo = "") {
    mensagemCarrinho.textContent = texto;
    mensagemCarrinho.className = `mensagem ${tipo}`;
}

function abrirPagamento() {
    if (!itensCarrinho.length || finalizandoCompra) {
        return;
    }

    mensagemPagamento.textContent = "";
    modalPagamento.hidden = false;
}

function fecharPagamento() {
    if (finalizandoCompra) return;

    modalPagamento.hidden = true;
}

// CARREGAR CARRINHO
async function carregarCarrinho() {
    try {
        const dados = await AstroShop.requisicaoAPI("/api/carrinho");

        itensCarrinho = Array.isArray(dados)
            ? dados
            : dados.itens || dados.carrinho || [];

        renderizarCarrinho();

    } catch (erro) {
        console.error("Erro ao carregar carrinho:", erro);

        informar(
            erro.message || "Erro ao carregar carrinho.",
            "erro"
        );

        areaCarrinho.innerHTML = `
            <div class="vazio">
                <p>Não foi possível carregar o carrinho.</p>
                <a class="botao" href="../formularios/login.html">
                    Fazer login
                </a>
            </div>
        `;

        totalCarrinho.textContent = AstroShop.formatarPreco(0);
        botaoFinalizar.disabled = true;
        botaoLimpar.disabled = true;
    }
}

// RENDERIZAR CARRINHO
function renderizarCarrinho() {
    areaCarrinho.innerHTML = "";

    if (!itensCarrinho.length) {
        areaCarrinho.innerHTML = `
            <div class="vazio">
                <p>Seu carrinho está vazio.</p>
                <a class="botao" href="produtos.html">
                    Explorar produtos
                </a>
            </div>
        `;

        totalCarrinho.textContent = AstroShop.formatarPreco(0);
        botaoFinalizar.disabled = true;
        botaoLimpar.disabled = true;

        return;
    }

    botaoFinalizar.disabled = finalizandoCompra;
    botaoLimpar.disabled = finalizandoCompra;

    let total = 0;

    itensCarrinho.forEach(item => {
        const preco = Number(
            item.preco ?? item.preco_unitario ?? 0
        );

        const quantidade = Number(item.quantidade || 1);
        const estoque = Number(item.estoque || 1);
        const idProduto = Number(item.id_produto);

        const subtotal = preco * quantidade;
        total += subtotal;

        const elemento = document.createElement("article");
        elemento.className = "item-carrinho";

        const nome = document.createElement("h3");
        nome.textContent = item.nome || item.nome_produto || "Produto";

        const precoTexto = document.createElement("p");
        precoTexto.textContent =
            `${AstroShop.formatarPreco(preco)} por unidade`;

        const subtotalTexto = document.createElement("p");
        subtotalTexto.textContent =
            `Subtotal: ${AstroShop.formatarPreco(subtotal)}`;

        const controles = document.createElement("div");
        controles.className = "controles-quantidade";

        const label = document.createElement("label");
        label.textContent = "Quantidade";

        const campo = document.createElement("input");
        campo.type = "number";
        campo.min = "1";
        campo.max = String(estoque);
        campo.value = String(quantidade);
        campo.dataset.quantidade = String(idProduto);

        const remover = document.createElement("button");
        remover.className = "botao botao-secundario";
        remover.type = "button";
        remover.dataset.remover = String(idProduto);
        remover.textContent = "Remover";

        controles.append(label, campo, remover);

        elemento.append(
            nome,
            precoTexto,
            subtotalTexto,
            controles
        );

        areaCarrinho.appendChild(elemento);
    });

    totalCarrinho.textContent = AstroShop.formatarPreco(total);
}

// ATUALIZAR QUANTIDADE
areaCarrinho.addEventListener("change", async evento => {
    const campo = evento.target.closest("[data-quantidade]");

    if (!campo || finalizandoCompra) return;

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

        informar("Quantidade atualizada!", "sucesso");
        await carregarCarrinho();

    } catch (erro) {
        informar(erro.message, "erro");
        await carregarCarrinho();
    }
});

// REMOVER PRODUTO
areaCarrinho.addEventListener("click", async evento => {
    const botao = evento.target.closest("[data-remover]");

    if (!botao || finalizandoCompra) return;

    const idProduto = Number(botao.dataset.remover);

    try {
        await AstroShop.requisicaoAPI(
            `/api/carrinho/itens/${idProduto}`,
            { method: "DELETE" }
        );

        informar("Produto removido do carrinho!", "sucesso");
        await carregarCarrinho();

    } catch (erro) {
        informar(erro.message, "erro");
    }
});

// LIMPAR CARRINHO
botaoLimpar.addEventListener("click", async () => {
    if (finalizandoCompra) return;

    if (!confirm("Deseja remover todos os itens do carrinho?")) {
        return;
    }

    try {
        await AstroShop.requisicaoAPI("/api/carrinho", {
            method: "DELETE"
        });

        informar("Carrinho esvaziado!", "sucesso");
        await carregarCarrinho();

    } catch (erro) {
        informar(erro.message, "erro");
    }
});

// ABRIR JANELA DE PAGAMENTO
botaoFinalizar.addEventListener("click", abrirPagamento);

// CANCELAR E VOLTAR AO CARRINHO
botaoCancelar.addEventListener("click", fecharPagamento);

// CONFIRMAR PAGAMENTO E FINALIZAR COMPRA
formularioPagamento.addEventListener("submit", async evento => {
    evento.preventDefault();

    if (finalizandoCompra || !itensCarrinho.length) {
        return;
    }

    const metodoPagamento = formularioPagamento.querySelector(
        'input[name="metodo_pagamento"]:checked'
    )?.value;

    if (!metodoPagamento) {
        mensagemPagamento.textContent =
            "Selecione uma forma de pagamento.";
        return;
    }

    finalizandoCompra = true;

    botaoConfirmar.disabled = true;
    botaoCancelar.disabled = true;
    botaoFinalizar.disabled = true;
    botaoLimpar.disabled = true;

    botaoConfirmar.textContent = "Processando...";

    try {
        const resposta = await AstroShop.requisicaoAPI(
            "/api/compras",
            {
                method: "POST",
                body: JSON.stringify({
                    metodo_pagamento: metodoPagamento
                })
            }
        );

        modalPagamento.hidden = true;

        await carregarCarrinho();

        informar(
            `Compra ${resposta.id_compra} registrada com sucesso! Forma de pagamento: ${metodoPagamento.toUpperCase()}.`,
            "sucesso"
        );

    } catch (erro) {
        console.error("Erro ao finalizar compra:", erro);

        mensagemPagamento.textContent =
            erro.message || "Não foi possível finalizar a compra.";

    } finally {
        finalizandoCompra = false;

        botaoConfirmar.disabled = false;
        botaoCancelar.disabled = false;
        botaoConfirmar.textContent = "Confirmar compra";

        botaoFinalizar.disabled = itensCarrinho.length === 0;
        botaoLimpar.disabled = itensCarrinho.length === 0;
    }
});

// INICIAR
carregarCarrinho();
