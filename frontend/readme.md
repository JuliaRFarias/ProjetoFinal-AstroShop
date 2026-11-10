
# AstroShop

E-commerce acadêmico de telescópios, pêndulos e instrumentos
de física clássica.

## Tecnologias

- HTML, CSS e JavaScript
- Node.js e Express
- MariaDB
- Arquitetura MVC
- API REST

## Estrutura

- backend/: servidor, controllers, models e rotas.
- frontend/: páginas, formulários e estilos.
- database/: scripts SQL.

## 1. Configurar o banco de dados

1. Inicie o MariaDB.
2. Execute database/schema.sql.
3. Execute database/inserts.sql.
4. Configure as credenciais do banco no backend/.env.

## 2. Configurar o back-end

Abra o terminal na pasta backend e execute:

```bash
npm install
npm install bcryptjs jsonwebtoken
npm run dev
```

O servidor deverá iniciar em http://localhost:3000.

## 3. Abrir o front-end

Abra a pasta frontend no VS Code.

Execute o arquivo frontend/index.html com a extensão Live Server.

A origem do Live Server deve corresponder à configuração
FRONTEND_URL no arquivo backend/.env.

## 4. Testar a aplicação

1. Consulte o catálogo de produtos.
2. Cadastre um cliente.
3. Verifique a conta conforme o procedimento de desenvolvimento.
4. Faça login.
5. Adicione produtos ao carrinho.
6. Altere quantidades e confira os totais.
7. Finalize uma compra.
8. Consulte o histórico de compras.

## Observações

O projeto é acadêmico. A finalização de compra usada na
demonstração não substitui um gateway de pagamento real.
A consulta de nota fiscal depende de um registro previamente
criado no banco de dados.
