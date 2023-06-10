# Daily Diet Api

## FEATURES

-[x] Deve ser possível criar um usuário -[x] Deve ser possível registrar uma refeição feita, com as seguintes informações:

- Nome
- Descrição
- Data e Hora
- Está dentro ou não da dieta

-[x] O usuário só pode visualizar, editar e apagar as refeições o qual ele criou

- Deve ser possível recuperar as métricas de um usuário
  - [x] Quantidade total de refeições registradas
  - [x] Quantidade total de refeições dentro da dieta
  - [x] Quantidade total de refeições fora da dieta
  - [x] Melhor sequência de refeições dentro da dieta

## Instalação

- Clone o repositório.
- Instale as dependências necessárias usando npm install.
- Execute as migrates para criar o banco de dados usando npm run knex -- migrate:lastest.
- Execute a aplicação usando npm run dev.

## Endpoints da API

Os seguintes endpoints estão disponíveis:

##### User

- POST /users: Cria um novo usuário.
- GET /users: Recupera os detalhes de um usuário específico.
- PUT /users: Atualiza os detalhes de um usuário específica.

- GET /users/avatar/:avatarUrl : Recupera a imagem do usuário

#### Authentication

- POST /auth: Cria um token de autenticação para um usuário cadastrado.

#### Meals

- POST /meals: Registra uma nova refeição.
- GET /meals: Recupera os detalhes de todas as refeições.
- GET /meals/:id: Recupera os detalhes de uma refeição específica.
- PUT /meals/:id: Atualiza os detalhes de uma refeição específica.
- DELETE /meals/:id: Exclui uma refeição específica.

#### Statistic

- GET /statistic: Recupera as métricas de um usuário específico.

#### Tecnologias Utilizadas

- NodeJs
- Fastify
- Knex
- FastifyMulter
- FastifyJwt
- Zod
- SQLite

# Contribuidores

- Eduardo N Gomes
