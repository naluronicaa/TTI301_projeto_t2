const express = require("express");
const axios = require("axios");
const app = express();

app.use(express.json());

const palavraChave = "importante";

const funcoes = {
  ObservacaoCriada: (observacao) => {
    observacao.status = observacao.texto.includes(palavraChave) ? "importante" : "comum";
    axios.post("http://barramento-de-eventos-service:10000/eventos", {
      tipo: "ObservacaoClassificada",
      dados: observacao,
    }).catch((err) => {
      console.log("Erro ao emitir evento de observação classificada:", err.message);
    });
  },
};

app.post("/eventos", (req, res) => {
    try{
        funcoes[req.body.tipo](req.body.dados);
      } catch (err) {}
    res.status(200).send({ msg: "ok" });
});

app.listen(7000, () => console.log("Classificação. Porta 7000"));
