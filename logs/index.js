const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(bodyParser.json());

const logs = [];

// Endpoint para registrar eventos de logs
app.post('/eventos', (req, res) => {
    const evento = req.body;

    const novoLog = {
        id: uuidv4(),
        tipo_evento: evento.tipo,
        data_hora: new Date().toLocaleString(),
    };

    logs.push(novoLog);
    console.log(`Evento registrado: ${JSON.stringify(novoLog)}`);

    res.status(200).send({ msg: 'Log registrado com sucesso!' });
});

// Endpoint para obter todos os logs
app.get('/logs', (req, res) => {
    res.status(200).send(logs);
});

app.listen(8000, () => {
    console.log('Logs. Porta 8000');
});
