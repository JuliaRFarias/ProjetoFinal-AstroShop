-- --------------------------------------------------------
-- Servidor:                     127.0.0.1
-- Versão do servidor:           12.3.2-MariaDB - MariaDB Server
-- OS do Servidor:               Win64
-- HeidiSQL Versão:              12.17.0.7270
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Copiando estrutura do banco de dados para projetofinal-astroshop
CREATE DATABASE IF NOT EXISTS `projetofinal-astroshop` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci */;
USE `projetofinal-astroshop`;

-- Copiando estrutura para tabela projetofinal-astroshop.cadastro
CREATE TABLE IF NOT EXISTS `cadastro` (
  `id_cadastro` int(11) NOT NULL AUTO_INCREMENT,
  `id_cliente` int(11) NOT NULL,
  `data_cadastro` datetime NOT NULL DEFAULT current_timestamp(),
  `status` enum('ativo','pendente','inativo') NOT NULL DEFAULT 'pendente',
  PRIMARY KEY (`id_cadastro`),
  UNIQUE KEY `id_cliente` (`id_cliente`),
  CONSTRAINT `1` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id_cliente`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Copiando dados para a tabela projetofinal-astroshop.cadastro: ~0 rows (aproximadamente)

-- Copiando estrutura para tabela projetofinal-astroshop.carrinho
CREATE TABLE IF NOT EXISTS `carrinho` (
  `id_carrinho` int(11) NOT NULL AUTO_INCREMENT,
  `id_cliente` int(11) NOT NULL,
  `data_criacao` datetime NOT NULL DEFAULT current_timestamp(),
  `status` enum('aberto','finalizado','abandonado') NOT NULL DEFAULT 'aberto',
  PRIMARY KEY (`id_carrinho`),
  KEY `id_cliente` (`id_cliente`),
  CONSTRAINT `1` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id_cliente`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Copiando dados para a tabela projetofinal-astroshop.carrinho: ~0 rows (aproximadamente)

-- Copiando estrutura para tabela projetofinal-astroshop.carrinho_de_compra
CREATE TABLE IF NOT EXISTS `carrinho_de_compra` (
  `id_item_carrinho` int(11) NOT NULL AUTO_INCREMENT,
  `id_carrinho` int(11) NOT NULL,
  `id_produto` int(11) NOT NULL,
  `quantidade` int(11) NOT NULL DEFAULT 1,
  `preco_unitario` decimal(10,2) NOT NULL,
  `data_adicao` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_item_carrinho`),
  UNIQUE KEY `uq_carrinho_produto` (`id_carrinho`,`id_produto`),
  KEY `id_produto` (`id_produto`),
  CONSTRAINT `1` FOREIGN KEY (`id_carrinho`) REFERENCES `carrinho` (`id_carrinho`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `2` FOREIGN KEY (`id_produto`) REFERENCES `produto` (`id_produto`) ON UPDATE CASCADE,
  CONSTRAINT `chk_carrinho_quantidade` CHECK (`quantidade` > 0),
  CONSTRAINT `chk_carrinho_preco` CHECK (`preco_unitario` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Copiando dados para a tabela projetofinal-astroshop.carrinho_de_compra: ~0 rows (aproximadamente)

-- Copiando estrutura para tabela projetofinal-astroshop.categoria
CREATE TABLE IF NOT EXISTS `categoria` (
  `id_categoria` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `descricao` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_categoria`),
  UNIQUE KEY `nome` (`nome`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Copiando dados para a tabela projetofinal-astroshop.categoria: ~0 rows (aproximadamente)
INSERT INTO `categoria` (`id_categoria`, `nome`, `descricao`) VALUES
	(1, 'Telescópios', 'Equipamentos para observação astronômica.'),
	(2, 'Pêndulos', 'Equipamentos para estudos de movimento e gravidade.'),
	(3, 'Gadgets de Física', 'Acessórios e equipamentos educacionais de física.'),
	(4, 'Óptica', 'Materiais para experimentos de óptica.'),
	(5, 'Instrumentos Científicos', 'Instrumentos utilizados em experiências científicas.');

-- Copiando estrutura para tabela projetofinal-astroshop.cliente
CREATE TABLE IF NOT EXISTS `cliente` (
  `id_cliente` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(120) NOT NULL,
  `cpf` char(11) DEFAULT NULL,
  `email` varchar(150) NOT NULL,
  `telefone` varchar(20) DEFAULT NULL,
  `endereco` varchar(255) DEFAULT NULL,
  `data_cadastro` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_cliente`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `cpf` (`cpf`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Copiando dados para a tabela projetofinal-astroshop.cliente: ~3 rows (aproximadamente)
INSERT INTO `cliente` (`id_cliente`, `nome`, `cpf`, `email`, `telefone`, `endereco`, `data_cadastro`) VALUES
	(9, 'Cliente Teste', NULL, 'teste4@astroshop.com', '11999999999', NULL, '2026-11-05 13:46:48'),
	(10, 'Cliente Teste', NULL, 'teste100@astroshop.com', '11999999999', NULL, '2026-11-05 13:54:01'),
	(11, 'Cliente Teste', NULL, 'teste150@astroshop.com', '11999999999', NULL, '2026-11-05 13:57:37');

-- Copiando estrutura para tabela projetofinal-astroshop.compra
CREATE TABLE IF NOT EXISTS `compra` (
  `id_compra` int(11) NOT NULL AUTO_INCREMENT,
  `id_cliente` int(11) NOT NULL,
  `data_compra` datetime NOT NULL DEFAULT current_timestamp(),
  `valor_total` decimal(12,2) NOT NULL DEFAULT 0.00,
  `status` enum('pendente','confirmada','cancelada') NOT NULL DEFAULT 'pendente',
  PRIMARY KEY (`id_compra`),
  KEY `id_cliente` (`id_cliente`),
  CONSTRAINT `1` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id_cliente`) ON UPDATE CASCADE,
  CONSTRAINT `chk_compra_total` CHECK (`valor_total` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Copiando dados para a tabela projetofinal-astroshop.compra: ~0 rows (aproximadamente)

-- Copiando estrutura para tabela projetofinal-astroshop.consulta
CREATE TABLE IF NOT EXISTS `consulta` (
  `id_consulta` int(11) NOT NULL AUTO_INCREMENT,
  `id_cliente` int(11) DEFAULT NULL,
  `termo_pesquisado` varchar(200) NOT NULL,
  `data_consulta` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_consulta`),
  KEY `id_cliente` (`id_cliente`),
  CONSTRAINT `1` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id_cliente`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Copiando dados para a tabela projetofinal-astroshop.consulta: ~0 rows (aproximadamente)

-- Copiando estrutura para tabela projetofinal-astroshop.item_compra
CREATE TABLE IF NOT EXISTS `item_compra` (
  `id_item_compra` int(11) NOT NULL AUTO_INCREMENT,
  `id_compra` int(11) NOT NULL,
  `id_produto` int(11) NOT NULL,
  `quantidade` int(11) NOT NULL,
  `preco_unitario` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id_item_compra`),
  UNIQUE KEY `uq_compra_produto` (`id_compra`,`id_produto`),
  KEY `id_produto` (`id_produto`),
  CONSTRAINT `1` FOREIGN KEY (`id_compra`) REFERENCES `compra` (`id_compra`) ON UPDATE CASCADE,
  CONSTRAINT `2` FOREIGN KEY (`id_produto`) REFERENCES `produto` (`id_produto`) ON UPDATE CASCADE,
  CONSTRAINT `chk_item_quantidade` CHECK (`quantidade` > 0),
  CONSTRAINT `chk_item_preco` CHECK (`preco_unitario` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Copiando dados para a tabela projetofinal-astroshop.item_compra: ~0 rows (aproximadamente)

-- Copiando estrutura para tabela projetofinal-astroshop.login
CREATE TABLE IF NOT EXISTS `login` (
  `id_login` int(11) NOT NULL AUTO_INCREMENT,
  `id_cliente` int(11) NOT NULL,
  `email_login` varchar(150) NOT NULL,
  `senha_hash` varchar(255) NOT NULL,
  `ativo` tinyint(1) NOT NULL DEFAULT 1,
  `ultimo_acesso` datetime DEFAULT NULL,
  `data_criacao` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_login`),
  UNIQUE KEY `id_cliente` (`id_cliente`),
  UNIQUE KEY `email_login` (`email_login`),
  CONSTRAINT `1` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id_cliente`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Copiando dados para a tabela projetofinal-astroshop.login: ~3 rows (aproximadamente)
INSERT INTO `login` (`id_login`, `id_cliente`, `email_login`, `senha_hash`, `ativo`, `ultimo_acesso`, `data_criacao`) VALUES
	(1, 9, 'teste4@astroshop.com', '$2b$12$T3p0OGXcjzQX4ZaoPbtKHOP4OTapb6tJm3eBMg7LTWEmlRd95CZgy', 1, NULL, '2026-11-05 13:46:48'),
	(2, 10, 'teste100@astroshop.com', '$2b$12$D9XSVrTEqgBTAT1YQ9FKqO5XPagfcM6AfRU0DyB7gvWkSkTyIcH5K', 1, NULL, '2026-11-05 13:54:01'),
	(3, 11, 'teste150@astroshop.com', 'AstroShop123', 1, NULL, '2026-11-05 13:57:37');

-- Copiando estrutura para tabela projetofinal-astroshop.nota_fiscal
CREATE TABLE IF NOT EXISTS `nota_fiscal` (
  `id_nota_fiscal` int(11) NOT NULL AUTO_INCREMENT,
  `id_venda` int(11) NOT NULL,
  `numero` varchar(50) NOT NULL,
  `data_emissao` datetime NOT NULL DEFAULT current_timestamp(),
  `valor_total` decimal(12,2) NOT NULL,
  `status` enum('simulada','emitida','cancelada') NOT NULL DEFAULT 'simulada',
  PRIMARY KEY (`id_nota_fiscal`),
  UNIQUE KEY `id_venda` (`id_venda`),
  UNIQUE KEY `numero` (`numero`),
  CONSTRAINT `1` FOREIGN KEY (`id_venda`) REFERENCES `venda` (`id_venda`) ON UPDATE CASCADE,
  CONSTRAINT `chk_nota_total` CHECK (`valor_total` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Copiando dados para a tabela projetofinal-astroshop.nota_fiscal: ~0 rows (aproximadamente)

-- Copiando estrutura para tabela projetofinal-astroshop.produto
CREATE TABLE IF NOT EXISTS `produto` (
  `id_produto` int(11) NOT NULL AUTO_INCREMENT,
  `id_categoria` int(11) NOT NULL,
  `nome` varchar(150) NOT NULL,
  `descricao` text DEFAULT NULL,
  `preco` decimal(10,2) NOT NULL,
  `estoque` int(11) NOT NULL DEFAULT 0,
  `ativo` tinyint(1) NOT NULL DEFAULT 1,
  `data_cadastro` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_produto`),
  KEY `id_categoria` (`id_categoria`),
  CONSTRAINT `1` FOREIGN KEY (`id_categoria`) REFERENCES `categoria` (`id_categoria`) ON UPDATE CASCADE,
  CONSTRAINT `chk_produto_preco` CHECK (`preco` >= 0),
  CONSTRAINT `chk_produto_estoque` CHECK (`estoque` >= 0)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Copiando dados para a tabela projetofinal-astroshop.produto: ~0 rows (aproximadamente)
INSERT INTO `produto` (`id_produto`, `id_categoria`, `nome`, `descricao`, `preco`, `estoque`, `ativo`, `data_cadastro`) VALUES
	(1, 1, 'Telescópio Refrator 70mm', 'Telescópio para observação da Lua e de objetos celestes brilhantes.', 899.90, 15, 1, '2026-11-10 15:38:42'),
	(2, 1, 'Telescópio Refletor 130mm', 'Equipamento refletor para observações astronômicas.', 1499.90, 8, 1, '2026-11-10 15:38:42'),
	(3, 2, 'Pêndulo Simples Didático', 'Conjunto para demonstração de movimento periódico.', 129.90, 30, 1, '2026-11-10 15:38:42'),
	(4, 4, 'Kit de Óptica', 'Kit educacional para experimentos de reflexão e refração.', 219.90, 20, 1, '2026-11-10 15:38:42'),
	(5, 3, 'Cronômetro Digital', 'Cronômetro para experimentos de física clássica.', 79.90, 40, 1, '2026-11-10 15:38:42');

-- Copiando estrutura para tabela projetofinal-astroshop.venda
CREATE TABLE IF NOT EXISTS `venda` (
  `id_venda` int(11) NOT NULL AUTO_INCREMENT,
  `id_compra` int(11) NOT NULL,
  `data_venda` datetime NOT NULL DEFAULT current_timestamp(),
  `valor_total` decimal(12,2) NOT NULL,
  `status` enum('registrada','cancelada') NOT NULL DEFAULT 'registrada',
  PRIMARY KEY (`id_venda`),
  UNIQUE KEY `id_compra` (`id_compra`),
  CONSTRAINT `1` FOREIGN KEY (`id_compra`) REFERENCES `compra` (`id_compra`) ON UPDATE CASCADE,
  CONSTRAINT `chk_venda_total` CHECK (`valor_total` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Copiando dados para a tabela projetofinal-astroshop.venda: ~0 rows (aproximadamente)

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
