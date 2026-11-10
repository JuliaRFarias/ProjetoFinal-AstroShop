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

        localStorage.setItem("astroshop_token", dados.token);

        localStorage.setItem(
            "astroshop_usuario",
            JSON.stringify(dados.usuario)
        );

        window.location.href = "../pages/home.html";

    } catch (erro) {

        mensagem.textContent = erro.message;
        mensagem.className = "msg erro";

        botao.disabled = false;
    }

});