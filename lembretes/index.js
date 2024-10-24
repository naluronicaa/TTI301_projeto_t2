const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios'); 

const app = express();
app.use(bodyParser.json());

let contador = 0; 
const lembretes = {}; 

app.put("/lembretes", async (req, res) => {
    contador++;
    const { texto } = req.body;
    
    lembretes[contador] = {
        id: contador,
        texto,
    };

    await axios.post("http://barramento-de-eventos-service:10000/eventos", {
      tipo: "LembreteCriado",
      dados: {
          id: contador,
          texto,
      },
  });

    res.status(201).send(lembretes[contador]);
});

app.post("/eventos", (req, res) => {
  console.log(req.body);
  res.status(200).send({ msg: "ok" });
});

app.listen(4000, () => {
    console.log('Lembretes. Porta 4000');
});
