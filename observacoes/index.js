const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

const observacoesPorLembreteId = {};

// Funções para processar eventos recebidos
const funcoes = {
  ObservacaoClassificada: (observacao) => {
    const observacoes = observacoesPorLembreteId[observacao.lembreteId];
    const obsParaAtualizar = observacoes.find(o => o.id === observacao.id);
    obsParaAtualizar.status = observacao.status;

    // Envia evento de "ObservacaoAtualizada" para o barramento de eventos
    axios.post('http://barramento-de-eventos-service:10000/eventos', {
      tipo: "ObservacaoAtualizada",
      dados: {
        id: observacao.id,
        texto: observacao.texto,
        lembreteId: observacao.lembreteId,
        status: observacao.status
      }
    }).catch(err => {
      console.error("Erro ao enviar evento ObservacaoAtualizada:", err);
    });
  }
};

// Criação de uma observação para um lembrete específico
app.post('/lembretes/:idLembrete/observacoes', async function(req, res) {
  const idObservacao = uuidv4();
  const { texto } = req.body;

  const observacoesDoLembrete = observacoesPorLembreteId[req.params.idLembrete] || [];

  observacoesDoLembrete.push({
    id: idObservacao,
    texto,
    status: 'aguardando'
  });

  // Indexar a base de dados de observações para o lembrete específico
  observacoesPorLembreteId[req.params.idLembrete] = observacoesDoLembrete;

  // Envia evento de "ObservacaoCriada" para o barramento de eventos
  await axios.post('http://barramento-de-eventos-service:10000/eventos', {
    tipo: 'ObservacaoCriada',
    dados: {
      id: idObservacao,
      texto,
      lembreteId: req.params.idLembrete,
      status: 'aguardando'
    }
  }).catch(err => {
    console.error("Erro ao enviar evento ObservacaoCriada:", err);
  });

  res.status(201).json(observacoesDoLembrete);
});

// Rota para processar eventos recebidos
app.post('/eventos', (req, res) => {
  try {
    const evento = req.body;
    console.log("Evento recebido:", evento);

    // Chama a função correspondente ao tipo de evento
    if (funcoes[evento.tipo]) {
      funcoes[evento.tipo](evento.dados);
    }
  } catch (err) {
    console.error("Erro ao processar evento:", err);
  }
  res.json({ msg: 'ok' });
});

// Inicializando o servidor de observações na porta 5000
app.listen(5000, () => {
  console.log('Observações. Porta 5000.');
});