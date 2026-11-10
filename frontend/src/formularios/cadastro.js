const formularioCadastro = document.querySelector("#form-cadastro");
const mensagemCadastro = document.querySelector("#mensagem-cadastro");

formularioCadastro.addEventListener("submit", async event => {
  event.preventDefault();

  const nome = document.querySelector("#nome").value.trim();
  const email = document.querySelector("#email").value.trim();
  const telefone = document.querySelector("#telefone").value.trim();
  const senha = document.querySelector("#senha").value;
  const confirmarSenha = document.querySelector("#confirmar-senha").value;

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

  try {
    const dados = await AstroShop.requisicaoAPI("/api/auth/cadastro", {
      method: "POST",
      body: JSON.stringify({ nome, email, telefone, senha })
    });

    mensagemCadastro.textContent =
      dados.mensagem || "Cadastro realizado. Faça login após a verificação da conta.";

    mensagemCadastro.className = "mensagem sucesso";
    formularioCadastro.reset();
  } catch (erro) {
    mensagemCadastro.textContent = erro.message;
    mensagemCadastro.className = "mensagem erro";
  }
});
