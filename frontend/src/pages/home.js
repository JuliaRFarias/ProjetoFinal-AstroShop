
// ==========================================
// INICIAR A PÁGINA INICIAL
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    const botaoSair = document.querySelector("#botao-sair");
    const linkLogin = document.querySelector("#link-login");

    if (botaoSair) botaoSair.hidden = true;
    if (linkLogin) linkLogin.hidden = false;

    iniciarCarrossel();
    carregarDestaques();
});


// ==========================================
// CARROSSEL
// ==========================================

function iniciarCarrossel() {
    const slides = document.querySelectorAll(".slide");
    const anterior = document.querySelector("#slide-anterior");
    const proximo = document.querySelector("#slide-proximo");
    const indicador = document.querySelector("#slide-indicador");

    if (!slides.length) return;

    let atual = 0;
    let temporizador;

    function mostrarSlide(numero) {
        slides.forEach((slide, indice) => {
            slide.classList.toggle("ativo", indice === numero);
        });

        atual = numero;

        if (indicador) {
            indicador.textContent = `${atual + 1} / ${slides.length}`;
        }
    }

    function avancar() {
        mostrarSlide((atual + 1) % slides.length);
    }

    function voltar() {
        mostrarSlide((atual - 1 + slides.length) % slides.length);
    }

    function reiniciarTemporizador() {
        clearInterval(temporizador);
        temporizador = setInterval(avancar, 5000);
    }

    proximo?.addEventListener("click", () => {
        avancar();
        reiniciarTemporizador();
    });

    anterior?.addEventListener("click", () => {
        voltar();
        reiniciarTemporizador();
    });

    mostrarSlide(0);
    reiniciarTemporizador();
}


// ==========================================
// IMAGENS DOS PRODUTOS
// ==========================================

const imagensProdutos = {
    refrator: "../imagenss/reflator.png",
    refletor: "../imagens/telescopio.png",
    pendulo: "../imagens/pendulo.png",
    optica: "../imagenss/kitdeoptica.png",
    cronometro: "../imagenss/cronometrodigital.png",
    padrao: "../imagens/sem-imagem.png"
};


// ==========================================
// IDENTIFICAR IMAGEM
// ==========================================

function identificarImagem(nome) {
    const nomeProduto = String(nome || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

    // Telescópio refletor
    if (
        nomeProduto.includes("telescopio") &&
        nomeProduto.includes("refletor")
    ) {
        return imagensProdutos.refletor;
    }

    // Telescópio refrator
    if (
        nomeProduto.includes("telescopio") &&
        nomeProduto.includes("refrator")
    ) {
        return imagensProdutos.refrator;
    }

    if (nomeProduto.includes("telescopio")) {
        return imagensProdutos.telescopio;
    }

    if (nomeProduto.includes("pendulo")) {
        return imagensProdutos.pendulo;
    }

    if (nomeProduto.includes("optica") || nomeProduto.includes("otica")) {
        return imagensProdutos.optica;
    }

    if (nomeProduto.includes("cronometro")) {
        return imagensProdutos.cronometro;
    }

    return imagensProdutos.padrao;
}


// ==========================================
// FORMATAR PREÇO
// ==========================================

function formatarPreco(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}


// ==========================================
// CARREGAR PRODUTOS EM DESTAQUE
// ==========================================

async function carregarDestaques() {
    const area = document.querySelector("#produtos-destaque");
    const mensagem = document.querySelector("#mensagem-home");

    if (!area) return;

    area.innerHTML = "<p>Carregando produtos...</p>";

    try {
        if (typeof AstroShop === "undefined") {
            throw new Error("O arquivo da API não foi carregado.");
        }

        const resposta = await AstroShop.requisicaoAPI("/api/produtos");

        const produtos = Array.isArray(resposta)
            ? resposta
            : resposta?.produtos || resposta?.dados || [];

        area.innerHTML = "";

        if (!produtos.length) {
            area.innerHTML = "<p>Nenhum produto cadastrado.</p>";
            return;
        }

        const termos = [
            "telescopio",
            "pendulo",
            "optica",
            "cronometro"
        ];

        const destaques = [];

        termos.forEach(termo => {
            const encontrados = produtos.filter(produto =>
                String(produto.nome || "")
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .toLowerCase()
                    .includes(termo)
            );

            destaques.push(...encontrados);
        });

        if (!destaques.length) {
            area.innerHTML = "<p>Nenhum produto em destaque encontrado.</p>";
            return;
        }

        // ==================================
        // CRIAR CARDS DOS PRODUTOS
        // ==================================

        destaques.forEach(produto => {
            const card = document.createElement("article");
            card.className = "card";

            const imagem = document.createElement("img");
            imagem.src = identificarImagem(produto.nome);
            imagem.alt = produto.nome || "Produto AstroShop";
            imagem.loading = "lazy";

            imagem.onerror = () => {
                imagem.onerror = null;
                imagem.src = imagensProdutos.padrao;
            };

            const conteudo = document.createElement("div");
            conteudo.className = "card-info";

            const categoria = document.createElement("p");
            categoria.className = "texto-secundario";
            categoria.textContent = produto.categoria || "AstroShop";

            const titulo = document.createElement("h3");
            titulo.textContent = produto.nome || "Produto";

            const descricao = document.createElement("p");
            descricao.textContent = produto.descricao || "Sem descrição.";

            const preco = document.createElement("strong");
            preco.className = "preco";
            preco.textContent = formatarPreco(produto.preco);

            const estoque = document.createElement("p");
            estoque.className = "texto-secundario";
            estoque.textContent = Number(produto.estoque) > 0
                ? `Estoque: ${produto.estoque}`
                : "Indisponível";

            // BOTÃO ADICIONAR AO CARRINHO

            const botao = document.createElement("button");

            botao.className = "botao";
            botao.type = "button";
            botao.dataset.adicionar = produto.id_produto;
            botao.textContent = "Adicionar ao carrinho";
            botao.disabled = Number(produto.estoque) <= 0;

            conteudo.append(
                categoria,
                titulo,
                descricao,
                preco,
                estoque,
                botao
            );

            card.append(imagem, conteudo);
            area.appendChild(card);
        });

        if (mensagem) {
            mensagem.textContent = "";
            mensagem.className = "mensagem";
        }

    } catch (erro) {
        console.error("Erro ao carregar produtos:", erro);

        area.innerHTML = "";

        if (mensagem) {
            mensagem.textContent = erro.message;
            mensagem.className = "mensagem erro";
        }
    }
}


// ==========================================
// ADICIONAR AO CARRINHO
// ==========================================

document.addEventListener("click", async evento => {
    const botao = evento.target.closest("[data-adicionar]");

    if (!botao) return;

    const idProduto = Number(botao.dataset.adicionar);

    if (!idProduto) return;

    const mensagem = document.querySelector("#mensagem-home");

    botao.disabled = true;
    botao.textContent = "Adicionando...";

    try {
        const resposta = await AstroShop.requisicaoAPI(
            "/api/carrinho/itens",
            {
                method: "POST",
                body: JSON.stringify({
                    id_produto: idProduto,
                    quantidade: 1
                })
            }
        );

        botao.textContent = "Adicionado!";

        if (mensagem) {
            mensagem.textContent =
                resposta?.mensagem || "Produto adicionado ao carrinho!";
            mensagem.className = "mensagem sucesso";
        }

    } catch (erro) {
        console.error("Erro ao adicionar ao carrinho:", erro);

        botao.textContent = "Tentar novamente";

        if (mensagem) {
            mensagem.textContent = erro.message;
            mensagem.className = "mensagem erro";
        }

    } finally {
        botao.disabled = false;
    }
});
