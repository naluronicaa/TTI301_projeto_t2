const express = require('express');
const bodyParser = require('body-parser');

const axios = require('axios');
const eventos = []

const app = express();
app.use(bodyParser.json());

app.post('/eventos', (req, res) => {
  const evento = req.body;
  eventos.push(evento)
  // Envia o evento para o microsserviço de lembretes
  axios.post('http://lembretes-service:4000/eventos', evento);

  // Envia o evento para o microsserviço de observações
  axios.post('http://observacoes-service:5000/eventos', evento);

  // Envia o evento para o microsserviço de consulta
  axios.post("http://consulta-service:6000/eventos", evento);

  // Envia o evento para o microsserviço de classificação
  axios.post("http://classificacao-service:7000/eventos", evento); 

  res.status(200).send({ msg: "Evento propagado com sucesso!" });
});

app.get('/eventos', (req, res) => {
  res.send(eventos)
})

app.listen(10000, () => {
  console.log('Barramento de eventos. Porta 10000');
});
