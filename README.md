# Doação de Sangue

Sistema simples para inscrição de funcionários na campanha de doação de sangue da empresa. Não usa banco de dados — tudo é gravado em arquivos JSON na pasta `data/`.

## Páginas

- **Formulário** (`/index.html`): onde as pessoas se inscrevem. Pede nome, idade, sexo, se tem algum problema de saúde e o dia em que vão participar (escolhido em uma lista).
- **Inscritos** (`/respostas.html`): onde você cadastra os dias do evento (os que aparecem no formulário) e vê/remove as inscrições recebidas.

## Como rodar

Pré-requisito: [Node.js](https://nodejs.org/) instalado.

```bash
npm install
npm start
```

Depois acesse:

- Formulário: http://localhost:3000
- Inscritos: http://localhost:3000/respostas.html

## Como usar

1. Abra `respostas.html` e cadastre o(s) dia(s) do evento (data + descrição opcional, ex: "Unidade Centro").
2. Compartilhe o link do formulário (`index.html`) com os funcionários.
3. Acompanhe as inscrições em `respostas.html`.

## Dados

- `data/eventos.json` — dias cadastrados do evento.
- `data/inscricoes.json` — inscrições recebidas.

Esses arquivos são a "base de dados" do sistema. Fazer backup deles é o suficiente para preservar os dados.

Eles são criados automaticamente (vazios) na primeira vez que o servidor roda e **não são versionados no git** (estão no `.gitignore`), já que contêm nome e informação de saúde dos participantes.
