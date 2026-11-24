
const API_URL = "http://127.0.0.1:3000";

const AstroShop = {
    async requisicaoAPI(url, opcoes = {}) {
        const headers = {
            "Content-Type": "application/json",
            ...(opcoes.headers || {})
        };

        const resposta = await fetch(API_URL + url, {
            ...opcoes,
            headers,
            credentials: "include"
        });

        const tipo = resposta.headers.get("content-type") || "";

        const dados = tipo.includes("application/json")
            ? await resposta.json()
            : {};

        if (!resposta.ok) {
            throw new Error(
                dados.mensagem || `Erro HTTP ${resposta.status}`
            );
        }

        return dados;
    }
};

const formulario = document.querySelector("#form-login");
const mensagem = document.querySelector("#mensagem");

formulario.addEventListener("submit", async function(evento) {
    evento.preventDefault();

    const botao = formulario.querySelector("button");

    if (botao.disabled) return;

    botao.disabled = true;
    mensagem.textContent = "Verificando login...";

    try {
        const dados = await AstroShop.requisicaoAPI(
            "/api/auth/login",
            {
                method: "POST",
                body: JSON.stringify({
                    email: document.querySelector("#email").value.trim(),
                    senha: document.querySelector("#senha").value
                })
            }
        );

        localStorage.setItem(
            "astroshop_usuario",
            JSON.stringify(dados.usuario)
        );

        mensagem.textContent = "Login realizado com sucesso!";

        window.location.href = "../pages/home.html";

    } catch (erro) {
        mensagem.textContent = erro.message;
        console.error("Erro no login:", erro);
        botao.disabled = false;
    }
});
