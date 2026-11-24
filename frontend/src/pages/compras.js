
const listaCompras = document.querySelector("#lista-compras");
const mensagemCompras = document.querySelector("#mensagem-compras");

function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function formatarData(data) {
    if (!data) return "Data não informada";

    const dataConvertida = new Date(data);

    if (Number.isNaN(dataConvertida.getTime())) {
        return "Data não informada";
    }

    return dataConvertida.toLocaleDateString("pt-BR");
}

function normalizarStatus(status) {
    const statusNormalizado = String(status || "pendente")
        .toLowerCase();

    const nomes = {
        confirmada: "Confirmada",
        pendente: "Pendente",
        cancelada: "Cancelada"
    };

    return {
        texto: nomes[statusNormalizado] || status,
        classe: statusNormalizado
    };
}

function mostrarMensagem(texto, tipo = "") {
    mensagemCompras.textContent = texto;
    mensagemCompras.className = tipo
        ? `mensagem ${tipo}`
        : "mensagem";
}

function criarElemento(tag, classe, texto) {
    const elemento = document.createElement(tag);

    if (classe) elemento.className = classe;
    if (texto !== undefined) elemento.textContent = texto;

    return elemento;
}

async function carregarCompras() {
    listaCompras.innerHTML = "";
    mostrarMensagem("");

    try {
        const resposta = await AstroShop.requisicaoAPI(
            "/api/compras",
            { method: "GET" }
        );

        const compras = Array.isArray(resposta)
            ? resposta
            : resposta.compras || resposta.dados || [];

        if (!Array.isArray(compras) || compras.length === 0) {
            const vazio = criarElemento(
                "div",
                "estado-compras vazio-compras"
            );

            vazio.appendChild(
                criarElemento("h2", "", "Você ainda não realizou compras")
            );

            vazio.appendChild(
                criarElemento(
                    "p",
                    "",
                    "Quando finalizar um pedido, ele aparecerá aqui."
                )
            );

            const link = criarElemento("a", "botao", "Ver produtos");
            link.href = "produtos.html";

            vazio.appendChild(link);
            listaCompras.appendChild(vazio);

            return;
        }

        compras.forEach(compra => {
            listaCompras.appendChild(criarCardCompra(compra));
        });

    } catch (erro) {
        console.error("Erro ao carregar compras:", erro);

        listaCompras.innerHTML = "";

        const erroElemento = criarElemento(
            "div",
            "estado-compras vazio-compras"
        );

        erroElemento.appendChild(
            criarElemento("h2", "", "Não foi possível carregar suas compras")
        );

        erroElemento.appendChild(
            criarElemento(
                "p",
                "",
                erro.message || "Verifique sua conexão e tente novamente."
            )
        );

        const tentarNovamente = criarElemento(
            "button",
            "botao",
            "Tentar novamente"
        );

        tentarNovamente.type = "button";
        tentarNovamente.addEventListener("click", carregarCompras);

        erroElemento.appendChild(tentarNovamente);
        listaCompras.appendChild(erroElemento);
    }
}

function criarCardCompra(compra) {
    const card = criarElemento("article", "compra-card");

    const topo = criarElemento("div", "compra-topo");

    const identificacao = criarElemento("div", "compra-identificacao");

    identificacao.appendChild(
        criarElemento(
            "h2",
            "compra-numero",
            `Pedido #${compra.id_compra}`
        )
    );

    identificacao.appendChild(
        criarElemento(
            "p",
            "compra-data",
            `Realizado em ${formatarData(compra.data_compra)}`
        )
    );

    const status = normalizarStatus(compra.status);

    const etiquetaStatus = criarElemento(
        "span",
        `status-compra status-${status.classe}`,
        status.texto
    );

    topo.appendChild(identificacao);
    topo.appendChild(etiquetaStatus);

    const rodape = criarElemento("div", "compra-rodape");

    const total = criarElemento("div", "compra-total");

    total.appendChild(
        criarElemento("span", "", "Valor total")
    );

    total.appendChild(
        criarElemento(
            "strong",
            "",
            formatarMoeda(compra.valor_total)
        )
    );

    const botaoDetalhes = criarElemento(
        "button",
        "botao botao-detalhes",
        "Ver produtos"
    );

    botaoDetalhes.type = "button";

    const areaDetalhes = criarElemento(
        "div",
        "detalhes-compra"
    );

    areaDetalhes.hidden = true;

    botaoDetalhes.addEventListener("click", async () => {
        if (!areaDetalhes.hidden) {
            areaDetalhes.hidden = true;
            botaoDetalhes.textContent = "Ver produtos";
            return;
        }

        areaDetalhes.hidden = false;
        botaoDetalhes.textContent = "Ocultar produtos";

        if (areaDetalhes.dataset.carregado === "true") {
            return;
        }

        areaDetalhes.textContent = "Carregando produtos...";

        try {
            const resposta = await AstroShop.requisicaoAPI(
                `/api/compras/${compra.id_compra}`,
                { method: "GET" }
            );

            const dadosCompra = resposta.compra || resposta;
            const itens = dadosCompra.itens || [];

            areaDetalhes.innerHTML = "";

            if (itens.length === 0) {
                areaDetalhes.textContent =
                    "Não foram encontrados produtos neste pedido.";
                return;
            }

            const titulo = criarElemento(
                "h3",
                "",
                "Produtos deste pedido"
            );

            areaDetalhes.appendChild(titulo);

            itens.forEach(item => {
                const linha = criarElemento("div", "item-compra");

                const nomeProduto =
                    item.produto ||
                    item.nome_produto ||
                    item.nome ||
                    "Produto";

                const quantidade = Number(item.quantidade || 0);

                const preco = Number(
                    item.subtotal ??
                    (Number(item.preco_unitario || 0) * quantidade)
                );

                linha.appendChild(
                    criarElemento(
                        "span",
                        "",
                        `${nomeProduto} — ${quantidade} unidade(s)`
                    )
                );

                linha.appendChild(
                    criarElemento("strong", "", formatarMoeda(preco))
                );

                areaDetalhes.appendChild(linha);
            });

            areaDetalhes.dataset.carregado = "true";

        } catch (erro) {
            console.error("Erro ao carregar detalhes:", erro);

            areaDetalhes.textContent =
                erro.message || "Não foi possível carregar os produtos.";
        }
    });

    rodape.appendChild(total);
    rodape.appendChild(botaoDetalhes);

    card.appendChild(topo);
    card.appendChild(rodape);
    card.appendChild(areaDetalhes);

    return card;
}

document.addEventListener("DOMContentLoaded", carregarCompras);
