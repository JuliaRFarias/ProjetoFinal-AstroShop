
const formularioCadastro = document.querySelector("#form-cadastro");
const mensagemCadastro = document.querySelector("#mensagem-cadastro");

formularioCadastro.addEventListener("submit", async (event) => {
  event.preventDefault();

  const nome = document.querySelector("#nome").value.trim();
  const email = document.querySelector("#email").value.trim();
  const telefone = document.querySelector("#telefone").value.trim();
  const senha = document.querySelector("#senha").value;
  const confirmarSenha = document.querySelector("#confirmar-senha").value;

  mensagemCadastro.textContent = "";

  if (!nome || !email || !senha) {
    mensagemCadastro.textContent = "Preencha todos os campos obrigatórios.";
    mensagemCadastro.className = "mensagem erro";
    return;
  }

  if (senha.length < 8) {
    mensagemCadastro.textContent =
      "A senha deve ter pelo menos 8 caracteres.";
    mensagemCadastro.className = "mensagem erro";
    return;
  }

  if (senha !== confirmarSenha) {
    mensagemCadastro.textContent = "As senhas não coincidem.";
    mensagemCadastro.className = "mensagem erro";
    return;
  }

  if (
    typeof AstroShop === "undefined" ||
    typeof AstroShop.requisicaoAPI !== "function"
  ) {
    mensagemCadastro.textContent =
      "Erro de configuração. Não foi possível conectar à API.";
    mensagemCadastro.className = "mensagem erro";
    return;
  }

  const botao = formularioCadastro.querySelector("button[type='submit']");

  try {
    botao.disabled = true;
    botao.textContent = "Cadastrando...";

    const dados = await AstroShop.requisicaoAPI("/api/auth/cadastro", {
      method: "POST",
      body: JSON.stringify({
        nome,
        email,
        telefone,
        senha
      })
    });

    mensagemCadastro.textContent =
      dados.mensagem || "Cadastro realizado com sucesso! Faça login.";

    mensagemCadastro.className = "mensagem sucesso";

    formularioCadastro.reset();

  } catch (erro) {
    mensagemCadastro.textContent =
      erro.message || "Não foi possível realizar o cadastro.";

    mensagemCadastro.className = "mensagem erro";

  } finally {
    botao.disabled = false;
    botao.textContent = "Criar conta";
  }
});

