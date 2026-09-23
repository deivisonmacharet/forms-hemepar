const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

const DATA_DIR = path.join(__dirname, 'data');
const EVENTOS_FILE = path.join(DATA_DIR, 'eventos.json');
const INSCRICOES_FILE = path.join(DATA_DIR, 'inscricoes.json');

function garantirArquivosDeDados() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  for (const file of [EVENTOS_FILE, INSCRICOES_FILE]) {
    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, '[]\n', 'utf-8');
    }
  }
}
garantirArquivosDeDados();

function readJson(file) {
  const raw = fs.readFileSync(file, 'utf-8');
  return raw.trim() ? JSON.parse(raw) : [];
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
}

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ----- Eventos -----

app.get('/api/eventos', (req, res) => {
  const eventos = readJson(EVENTOS_FILE);
  eventos.sort((a, b) => a.data.localeCompare(b.data));
  res.json(eventos);
});

app.post('/api/eventos', (req, res) => {
  const { data, descricao } = req.body;

  if (!data) {
    return res.status(400).json({ erro: 'Informe a data do evento.' });
  }

  const eventos = readJson(EVENTOS_FILE);
  const novoEvento = {
    id: crypto.randomUUID(),
    data,
    descricao: (descricao || '').trim(),
    criadoEm: new Date().toISOString(),
  };
  eventos.push(novoEvento);
  writeJson(EVENTOS_FILE, eventos);
  res.status(201).json(novoEvento);
});

app.delete('/api/eventos/:id', (req, res) => {
  const eventos = readJson(EVENTOS_FILE);
  const restantes = eventos.filter((e) => e.id !== req.params.id);

  if (restantes.length === eventos.length) {
    return res.status(404).json({ erro: 'Evento nao encontrado.' });
  }

  writeJson(EVENTOS_FILE, restantes);
  res.status(204).end();
});

// ----- Inscricoes -----

app.get('/api/inscricoes', (req, res) => {
  const inscricoes = readJson(INSCRICOES_FILE);
  const eventos = readJson(EVENTOS_FILE);
  const eventosPorId = Object.fromEntries(eventos.map((e) => [e.id, e]));

  const resultado = inscricoes
    .slice()
    .sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm))
    .map((i) => ({
      ...i,
      evento: eventosPorId[i.eventoId] || null,
    }));

  res.json(resultado);
});

app.post('/api/inscricoes', (req, res) => {
  const { nome, idade, sexo, problemaSaude, detalhesSaude, eventoId } = req.body;

  if (!nome || !nome.trim()) {
    return res.status(400).json({ erro: 'Informe o nome.' });
  }
  const idadeNum = Number(idade);
  if (!idade || Number.isNaN(idadeNum) || idadeNum <= 0) {
    return res.status(400).json({ erro: 'Informe uma idade valida.' });
  }
  if (!sexo) {
    return res.status(400).json({ erro: 'Informe o sexo.' });
  }
  if (!['sim', 'nao'].includes(problemaSaude)) {
    return res.status(400).json({ erro: 'Informe se possui problema de saude.' });
  }
  if (!eventoId) {
    return res.status(400).json({ erro: 'Selecione o dia do evento.' });
  }

  const eventos = readJson(EVENTOS_FILE);
  const eventoExiste = eventos.some((e) => e.id === eventoId);
  if (!eventoExiste) {
    return res.status(400).json({ erro: 'Evento selecionado nao existe.' });
  }

  const inscricoes = readJson(INSCRICOES_FILE);
  const novaInscricao = {
    id: crypto.randomUUID(),
    nome: nome.trim(),
    idade: idadeNum,
    sexo,
    problemaSaude,
    detalhesSaude: (detalhesSaude || '').trim(),
    eventoId,
    criadoEm: new Date().toISOString(),
  };
  inscricoes.push(novaInscricao);
  writeJson(INSCRICOES_FILE, inscricoes);
  res.status(201).json(novaInscricao);
});

app.delete('/api/inscricoes/:id', (req, res) => {
  const inscricoes = readJson(INSCRICOES_FILE);
  const restantes = inscricoes.filter((i) => i.id !== req.params.id);

  if (restantes.length === inscricoes.length) {
    return res.status(404).json({ erro: 'Inscricao nao encontrada.' });
  }

  writeJson(INSCRICOES_FILE, restantes);
  res.status(204).end();
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
