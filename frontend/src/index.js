
const API_URL = "http://127.0.0.1:3000";

const AstroShop = {

    // COMUNICAÇÃO COM O BACKEND
    async requisicaoAPI(url, opcoes = {}) {
        const headers = {
            ...(opcoes.headers || {})
        };

        if (opcoes.body && typeof opcoes.body === "string") {
            headers["Content-Type"] = "application/json";
        }

        // Utilizar sessão, sem enviar token JWT antigo.
        delete headers.Authorization;
        delete headers.authorization;

        const resposta = await fetch(`${API_URL}${url}`, {
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
                dados.mensagem ||
                dados.erro ||
                `Erro HTTP ${resposta.status}`
            );
        }

        return dados;
    },

    // VERIFICAR LOGIN
    async exigirLogin() {
        try {
            await this.requisicaoAPI("/api/auth/me");
            return true;

        } catch (erro) {
            localStorage.removeItem("astroshop_usuario");

            window.location.replace(
                "../formularios/login.html"
            );

            return false;
        }
    },

    // SAIR DA CONTA
    async sair() {
        try {
            await this.requisicaoAPI("/api/auth/logout", {
                method: "POST"
            });

        } catch (erro) {
            console.error(
                "Erro ao encerrar sessão:",
                erro.message
            );
        }

        localStorage.removeItem("astroshop_usuario");

        window.location.replace(
            "../formularios/login.html"
        );
    },

    // FORMATAR DINHEIRO
    dinheiro(valor) {
        return Number(valor || 0).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    },

    formatarPreco(valor) {
        return Number(valor || 0).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    },

    // ESCAPAR HTML
    escaparHTML(texto) {
        return String(texto ?? "").replace(/[&<>"']/g, caractere => {
            const entidades = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"
            };

            return entidades[caractere];
        });
    }
};

// DISPONIBILIZAR PARA TODAS AS PÁGINAS
window.AstroShop = AstroShop;
