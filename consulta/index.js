const express = require("express");
const axios = require("axios");
const app = express();
app.use(express.json());

const baseConsulta = {};

const funcoes = {
    LembreteCriado: (lembrete) => {
      baseConsulta[lembrete.id] = lembrete
    },
    ObservacaoCriada: (observacao) => {
      const observacoes = baseConsulta[observacao.lembreteId]['observacoes'] || []
      observacoes.push(observacao)
      baseConsulta[observacao.lembreteId]['observacoes'] = observacoes
    },
    ObservacaoAtualizada: (observacao) => {
      const observacoes = baseConsulta[observacao.lembreteId]["observacoes"]
      const indice = observacoes.findIndex((o) => o.id === observacao.id)
      observacoes[indice] = observacao
  
    }
}

app.post("/eventos", (req, res) => {
    const funcao = funcoes[req.body.tipo];
    
    if (funcao) {
        try {
            funcao(req.body.dados);
        } catch (err) {
            console.log("Erro ao processar o evento:", req.body.tipo, err);
        }
    } else {
        console.log("Evento desconhecido:", req.body.tipo);
    }

    res.status(200).send({ msg: "ok" });
});

app.get("/lembretes", (req, res) => {
    res.send(baseConsulta);
});

app.listen(6000, async () => {
    console.log("Consultas. Porta 6000");
    try {
        const resp = await axios.get("http://barramento-de-eventos-service:10000/eventos");
        resp.data.forEach((evento) => {
            try {
                const funcao = funcoes[evento.tipo];
                if (funcao) {
                    funcao(evento.dados);
                }
            } catch (err) {
                console.log("Erro ao processar evento:", evento.tipo, err);
            }
        });
    } catch (err) {
        console.log("Erro ao buscar eventos:", err);
    }
});