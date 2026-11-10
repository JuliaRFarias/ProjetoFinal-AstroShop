CREATE DATABASE IF NOT EXISTS projeto_integrador
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE projeto_integrador;


CREATE TABLE IF NOT EXISTS cliente (
    id_cliente INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(120) NOT NULL,
    email VARCHAR(160) NOT NULL UNIQUE,
    telefone VARCHAR(25),
    ativo BOOLEAN DEFAULT TRUE,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS cadastro (
    id_cadastro INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT NOT NULL UNIQUE,
    cpf VARCHAR(14) UNIQUE,
    cep VARCHAR(10),
    rua VARCHAR(150),
    numero VARCHAR(15),
    complemento VARCHAR(100),
    bairro VARCHAR(100),
    cidade VARCHAR(100),
    estado VARCHAR(2),

    CONSTRAINT fk_cadastro_cliente
    FOREIGN KEY (id_cliente)
    REFERENCES cliente(id_cliente)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS login (
    id_login INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    tipo ENUM('CLIENTE', 'ADMIN') DEFAULT 'CLIENTE',
    ultimo_acesso DATETIME,
    tentativas INT DEFAULT 0,
    bloqueado BOOLEAN DEFAULT FALSE,

    CONSTRAINT fk_login_cliente
    FOREIGN KEY (id_cliente)
    REFERENCES cliente(id_cliente)
    ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS categoria (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    descricao TEXT,
    ativo BOOLEAN DEFAULT TRUE
);


CREATE TABLE IF NOT EXISTS produto (
    id_produto INT AUTO_INCREMENT PRIMARY KEY,
    id_categoria INT NOT NULL,
    nome VARCHAR(150) NOT NULL,
    descricao TEXT,
    preco DECIMAL(10,2) NOT NULL,
    estoque INT NOT NULL DEFAULT 0,
    imagem VARCHAR(500),
    marca VARCHAR(100),
    modelo VARCHAR(100),
    peso DECIMAL(8,2),
    ativo BOOLEAN DEFAULT TRUE,
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_produto_categoria
    FOREIGN KEY (id_categoria)
    REFERENCES categoria(id_categoria),

    CONSTRAINT chk_produto_preco
    CHECK (preco >= 0),

    CONSTRAINT chk_produto_estoque
    CHECK (estoque >= 0)
);


CREATE TABLE IF NOT EXISTS consulta (
    id_consulta INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT,
    id_produto INT,
    assunto VARCHAR(150) NOT NULL,
    mensagem TEXT NOT NULL,
    resposta TEXT,
    status ENUM('ABERTA', 'EM_ANALISE', 'RESPONDIDA', 'ENCERRADA')
        DEFAULT 'ABERTA',
    data_consulta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_resposta DATETIME,

    CONSTRAINT fk_consulta_cliente
    FOREIGN KEY (id_cliente)
    REFERENCES cliente(id_cliente),

    CONSTRAINT fk_consulta_produto
    FOREIGN KEY (id_produto)
    REFERENCES produto(id_produto)
);

CREATE TABLE IF NOT EXISTS carrinho_de_compra (
    id_carrinho INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT NOT NULL UNIQUE,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_carrinho_cliente
    FOREIGN KEY (id_cliente)
    REFERENCES cliente(id_cliente)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS item_carrinho (
    id_item INT AUTO_INCREMENT PRIMARY KEY,
    id_carrinho INT NOT NULL,
    id_produto INT NOT NULL,
    quantidade INT NOT NULL DEFAULT 1,
    data_adicao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_item_carrinho
    FOREIGN KEY (id_carrinho)
    REFERENCES carrinho_de_compra(id_carrinho)
    ON DELETE CASCADE,

    CONSTRAINT fk_item_produto
    FOREIGN KEY (id_produto)
    REFERENCES produto(id_produto),

    CONSTRAINT uq_carrinho_produto
    UNIQUE (id_carrinho, id_produto),

    CONSTRAINT chk_quantidade_carrinho
    CHECK (quantidade > 0)
);

CREATE TABLE IF NOT EXISTS compra (
    id_compra INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT NOT NULL,
    valor_total DECIMAL(10,2) NOT NULL,
    status ENUM(
        'PENDENTE',
        'CONFIRMADA',
        'EM_PROCESSAMENTO',
        'ENVIADA',
        'ENTREGUE',
        'CANCELADA'
    ) DEFAULT 'PENDENTE',
    forma_pagamento VARCHAR(50),
    observacao TEXT,
    data_compra TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_compra_cliente
    FOREIGN KEY (id_cliente)
    REFERENCES cliente(id_cliente),

    CONSTRAINT chk_valor_compra
    CHECK (valor_total >= 0)
);


CREATE TABLE IF NOT EXISTS item_compra (
    id_item_compra INT AUTO_INCREMENT PRIMARY KEY,
    id_compra INT NOT NULL,
    id_produto INT NOT NULL,
    quantidade INT NOT NULL,
    preco_unitario DECIMAL(10,2) NOT NULL,

    CONSTRAINT fk_itemcompra_compra
    FOREIGN KEY (id_compra)
    REFERENCES compra(id_compra),

    CONSTRAINT fk_itemcompra_produto
    FOREIGN KEY (id_produto)
    REFERENCES produto(id_produto),

    CONSTRAINT chk_itemcompra_quantidade
    CHECK (quantidade > 0),

    CONSTRAINT chk_itemcompra_preco
    CHECK (preco_unitario >= 0)
);

CREATE TABLE IF NOT EXISTS venda (
    id_venda INT AUTO_INCREMENT PRIMARY KEY,
    id_compra INT NOT NULL UNIQUE,
    codigo_venda VARCHAR(50) NOT NULL UNIQUE,
    valor_total DECIMAL(10,2) NOT NULL,
    status ENUM('REGISTRADA', 'CANCELADA')
        DEFAULT 'REGISTRADA',
    data_venda TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_venda_compra
    FOREIGN KEY (id_compra)
    REFERENCES compra(id_compra)
);

CREATE TABLE IF NOT EXISTS nota_fiscal (
    id_nota INT AUTO_INCREMENT PRIMARY KEY,
    id_compra INT NOT NULL UNIQUE,
    id_cliente INT NOT NULL,
    numero VARCHAR(50) NOT NULL UNIQUE,
    valor DECIMAL(10,2) NOT NULL,
    observacao VARCHAR(255),
    data_emissao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_nota_compra
    FOREIGN KEY (id_compra)
    REFERENCES compra(id_compra),

    CONSTRAINT fk_nota_cliente
    FOREIGN KEY (id_cliente)
    REFERENCES cliente(id_cliente)
);

CREATE INDEX idx_cliente_email
ON cliente(email);

CREATE INDEX idx_produto_nome
ON produto(nome);

CREATE INDEX idx_produto_categoria
ON produto(id_categoria);

CREATE INDEX idx_compra_cliente
ON compra(id_cliente);

CREATE INDEX idx_compra_data
ON compra(data_compra);

CREATE INDEX idx_consulta_status
ON consulta(status);

CREATE INDEX idx_venda_codigo
ON venda(codigo_venda);

CREATE OR REPLACE VIEW vw_produtos AS
SELECT
    p.id_produto,
    p.nome,
    p.descricao,
    p.preco,
    p.estoque,
    p.imagem,
    p.marca,
    p.modelo,
    c.nome AS categoria
FROM produto p
INNER JOIN categoria c
    ON p.id_categoria = c.id_categoria
WHERE p.ativo = TRUE;

CREATE OR REPLACE VIEW vw_compras AS
SELECT
    co.id_compra,
    cl.nome AS cliente,
    cl.email,
    co.valor_total,
    co.status,
    co.data_compra
FROM compra co
INNER JOIN cliente cl
    ON co.id_cliente = cl.id_cliente;