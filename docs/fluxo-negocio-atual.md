# Fluxo de Negocio Atual do ScoutPro

Este documento descreve, em linguagem de negocio, o que ja pode ser operado hoje no ScoutPro e como esse fluxo acontece do inicio ao fim.

## O que existe hoje

No estado atual, o ScoutPro ja permite:

- preparar o ambiente da aplicacao;
- iniciar o sistema com banco e API;
- criar automaticamente um usuario administrador no primeiro uso;
- autenticar um usuario para receber acesso ao sistema;
- identificar quem esta autenticado;
- cadastrar novos usuarios a partir de um administrador.

Em termos de negocio, isso significa que a base de acesso da plataforma ja esta pronta para controlar quem entra no sistema antes da evolucao dos demais modulos funcionais.

## Visao ponta a ponta

O fluxo atual acontece nesta sequencia:

1. a equipe prepara as variaveis do ambiente;
2. define a chave de seguranca usada para assinar os acessos da plataforma;
3. sobe o banco e a API;
4. o sistema cria um administrador inicial, caso ainda nao exista;
5. esse administrador faz login;
6. o sistema devolve um token de acesso;
7. esse token passa a acompanhar as chamadas protegidas;
8. com esse acesso, o administrador pode cadastrar outros usuarios.

## Etapa 1: preparar a chave de seguranca

Antes de subir a aplicacao, e preciso gerar o valor de `JWT_SECRET`.

Essa chave funciona como a assinatura interna dos tokens de acesso. Sem ela, a aplicacao nao consegue emitir nem validar autenticacao com seguranca.

Exemplo para gerar a chave em PowerShell:

```powershell
[Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 } | ForEach-Object { [byte]$_ }))
```

Depois, esse valor deve ser colocado no `.env`:

```env
JWT_SECRET=cole-aqui-a-chave-gerada
```

## Etapa 2: subir a aplicacao

Com as variaveis configuradas, a operacao local pode ser iniciada com:

```bash
docker compose up -d --build
```

Quando a aplicacao sobe:

- o banco PostgreSQL fica disponivel;
- o Flyway aplica as migrations necessarias;
- a API inicia com a configuracao de seguranca;
- se ainda nao houver administrador, ele e criado automaticamente.

## Etapa 3: administrador inicial

O administrador inicial e criado com base nas variaveis de ambiente:

- `APP_ADMIN_USERNAME`
- `APP_ADMIN_PASSWORD`
- `APP_ADMIN_NOME`
- `APP_ADMIN_CPF`
- `APP_ADMIN_EMAIL`
- `APP_ADMIN_TELEFONE`

Se nada for alterado, o projeto usa os valores padrao definidos na configuracao local.

Em linguagem de negocio, esse usuario representa o primeiro responsavel por habilitar os demais acessos dentro da plataforma.

## Etapa 4: gerar o token de acesso

Para entrar no sistema, o usuario administrador precisa fazer login.

Chamada:

```bash
curl -X POST http://localhost:8080/api/v1/auth/login -H "Content-Type: application/json" -d "{\"username\":\"admin\",\"password\":\"admin123\"}"
```

Exemplo de resposta:

```json
{
  "accessToken": "jwt-aqui",
  "tokenType": "Bearer",
  "expiresIn": 3600
}
```

Interpretacao de negocio:

- `accessToken`: credencial temporaria para operar o sistema;
- `tokenType`: tipo de autenticacao esperado nas proximas chamadas;
- `expiresIn`: tempo de validade do acesso.

## Etapa 5: usar o token nas chamadas protegidas

Depois do login, o token deve acompanhar as chamadas em:

```text
Authorization: Bearer <token>
```

Exemplo para verificar quem esta autenticado:

```bash
curl http://localhost:8080/api/v1/auth/me -H "Authorization: Bearer jwt-aqui"
```

Esse passo confirma se o acesso recebido continua valido e qual usuario esta usando o sistema.

## Etapa 6: cadastrar novos usuarios

Com um token valido de administrador, ja e possivel cadastrar novos usuarios.

Chamada:

```bash
curl -X POST http://localhost:8080/api/v1/usuarios -H "Content-Type: application/json" -H "Authorization: Bearer jwt-aqui" -d "{\"username\":\"operador1\",\"nomeUsuario\":\"Operador 1\",\"cpf\":\"12345678901\",\"email\":\"operador1@scoutpro.local\",\"telefone\":\"85999999999\",\"senha\":\"senha123\"}"
```

Significado de negocio dos campos:

- `username`: identificador de login;
- `nomeUsuario`: nome exibido para a pessoa usuaria;
- `cpf`: identificador unico da pessoa;
- `email`: contato unico;
- `telefone`: contato adicional;
- `senha`: credencial inicial de acesso.

## O que esse fluxo entrega hoje

Hoje o ScoutPro entrega um fluxo completo de controle de acesso inicial:

- a plataforma sobe com banco e API consistentes;
- existe um administrador de partida;
- esse administrador consegue entrar no sistema;
- o sistema emite um token de acesso;
- o token protege as operacoes restritas;
- o administrador consegue habilitar novos usuarios.

## Endpoints atuais

- `POST /api/v1/auth/login`: autentica e devolve token.
- `GET /api/v1/auth/me`: confirma o usuario autenticado.
- `POST /api/v1/usuarios`: cadastra novo usuario, exigindo token de administrador.
- `GET /actuator/health`: verifica saude da API.
- `GET /swagger-ui/index.html`: interface de documentacao.
- `GET /v3/api-docs`: contrato OpenAPI da API.

## Resumo executivo

O produto ainda esta no inicio da camada funcional, mas o alicerce operacional de acesso ja existe. Na pratica, o time ja consegue subir o ambiente, estabelecer a seguranca da aplicacao, autenticar o administrador inicial e controlar o cadastro de novos usuarios com rastreabilidade e protecao por token.
