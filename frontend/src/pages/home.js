
// INICIAR A PÁGINA INICIAL
document.addEventListener("DOMContentLoaded", function () {

    // Mantém o botão sair escondido para visitantes
    const botaoSair = document.querySelector("#botao-sair");

    if (botaoSair) {
        botaoSair.hidden = true;
    }

    // Mantém o link de login visível
    const linkLogin = document.querySelector("#link-login");

    if (linkLogin) {
        linkLogin.hidden = false;
    }

    // Iniciar carrossel
    iniciarCarrossel();

    // Carregar produtos
    carregarDestaques();

});


// CARROSSEL
function iniciarCarrossel() {

    const slides = document.querySelectorAll(".slide");
    const anterior = document.querySelector("#slide-anterior");
    const proximo = document.querySelector("#slide-proximo");
    const indicador = document.querySelector("#slide-indicador");

    if (!slides.length) return;

    let atual = 0;
    let temporizador;

    function mostrarSlide(numero) {

        slides.forEach(function(slide, indice) {
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

    if (proximo) {
        proximo.addEventListener("click", function() {
            avancar();
            reiniciarTemporizador();
        });
    }

    if (anterior) {
        anterior.addEventListener("click", function() {
            voltar();
            reiniciarTemporizador();
        });
    }

    mostrarSlide(0);
    reiniciarTemporizador();
}


// PRODUTOS EM DESTAQUE
async function carregarDestaques() {
    const area = document.querySelector("#produtos-destaque");
    const mensagem = document.querySelector("#mensagem-home");

    if (!area) return;

    // Imagens armazenadas diretamente no frontend
    const imagensProdutos = {
        telescopio: "../images/telescopio.png",
        pendulo: "../imagens/pendulo.png",
        microscopio: "../imagens/microscopio.png",
        oculos: "../imagens/oculos-vr.png"
    };

    try {
        const produtos = await AstroShop.requisicaoAPI("/api/produtos");

        area.innerHTML = "";

        if (!produtos.length) {
            area.textContent = "Nenhum produto cadastrado.";
            return;
        }

        produtos.slice(0, 4).forEach(function(produto, indice) {
            const card = document.createElement("article");
            card.className = "card";

            const imagem = document.createElement("img");

            const nome = produto.nome.toLowerCase();

            if (nome.includes("telescopio") || nome.includes("telescópio")) {
                imagem.src = imagensProdutos.telescopio;
            } else if (nome.includes("pendulo") || nome.includes("pêndulo")) {
                imagem.src = imagensProdutos.pendulo;
            } else if (nome.includes("microscopio") || nome.includes("microscópio")) {
                imagem.src = imagensProdutos.microscopio;
            } else if (nome.includes("vr") || nome.includes("óculos")) {
                imagem.src = imagensProdutos.oculos;
            } else {
                imagem.src = imagensProdutos[
                    Object.keys(imagensProdutos)[indice % 4]
                ];
            }

            imagem.alt = produto.nome;
            imagem.loading = "lazy";

            imagem.onerror = function() {
                imagem.alt = "Imagem do produto indisponível";
            };

            const conteudo = document.createElement("div");
            conteudo.className = "card-info";

            const titulo = document.createElement("h3");
            titulo.textContent = produto.nome;

            const descricao = document.createElement("p");
            descricao.textContent = produto.descricao || "";

            const preco = document.createElement("strong");
            preco.className = "preco";
            preco.textContent = AstroShop.dinheiro(produto.preco);

            const botao = document.createElement("a");
            botao.className = "botao";
            botao.href = "./produtos.html";
            botao.textContent = "Ver produto";

            conteudo.appendChild(titulo);
            conteudo.appendChild(descricao);
            conteudo.appendChild(preco);
            conteudo.appendChild(botao);

            card.appendChild(imagem);
            card.appendChild(conteudo);

            area.appendChild(card);
        });

    } catch (erro) {
        area.textContent = "Não foi possível carregar os produtos.";

        if (mensagem) {
            mensagem.textContent =
                "Verifique se o servidor backend está funcionando.";
        }

        console.error("Erro ao carregar produtos:", erro);
    }
}
