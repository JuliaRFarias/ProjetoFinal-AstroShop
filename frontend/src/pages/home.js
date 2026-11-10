// Verifica se o usuário está conectado
if (AstroShop.exigirLogin()) {

    iniciarHome();

}

function iniciarHome() {

    // BOTÃO SAIR
    const botaoSair = document.querySelector("#botao-sair");

    if (botaoSair) {
        botaoSair.hidden = false;

        botaoSair.addEventListener("click", function() {
            AstroShop.sair();
        });
    }

    // ESCONDER LINK ENTRAR
    const linkLogin = document.querySelector("#link-login");

    if (linkLogin) {
        linkLogin.hidden = true;
    }

    // CARROSSEL
    iniciarCarrossel();

    // PRODUTOS EM DESTAQUE
    carregarDestaques();

}


// FUNÇÃO DO CARROSSEL
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


// CARREGAR PRODUTOS DA API
async function carregarDestaques() {

    const area = document.querySelector("#produtos-destaque");
    const mensagem = document.querySelector("#mensagem-home");

    if (!area) return;

    try {

        const produtos = await AstroShop.requisicaoAPI("/api/produtos");

        area.innerHTML = "";

        if (!produtos.length) {

            area.innerHTML = `
                <p class="texto-secundario">
                    Nenhum produto cadastrado.
                </p>
            `;

            return;
        }

        produtos.slice(0, 4).forEach(function(produto) {

            const card = document.createElement("article");

            card.className = "card";

            const imagem = document.createElement("img");
            imagem.src = produto.imagem || "";
            imagem.alt = produto.nome;
            imagem.loading = "lazy";

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

        area.innerHTML = `
            <p class="texto-secundario">
                Não foi possível carregar os produtos.
            </p>
        `;

        if (mensagem) {
            mensagem.textContent = erro.message;
        }

    }

}