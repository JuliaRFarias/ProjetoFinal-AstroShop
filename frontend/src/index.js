const API_URL = "http://localhost:3000";

const AstroShop = {

    token() {
        return localStorage.getItem("astroshop_token");
    },

    async requisicaoAPI(url, opcoes = {}) {

        const headers = {
            "Content-Type": "application/json",
            ...(opcoes.headers || {})
        };

        const token = this.token();

        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        const resposta = await fetch(API_URL + url, {
            ...opcoes,
            headers
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
    },

    exigirLogin() {

        if (!this.token()) {
            window.location.replace("../formularios/login.html");
            return false;
        }

        return true;
    },

    sair() {

        localStorage.removeItem("astroshop_token");
        localStorage.removeItem("astroshop_usuario");

        window.location.replace("../formularios/login.html");
    },

    dinheiro(valor) {

        return Number(valor).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    }

};

window.AstroShop = AstroShop;