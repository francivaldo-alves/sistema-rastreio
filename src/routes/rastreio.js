import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

router.get("/:codigo", async (req, res) => {
    const codigo = req.params.codigo.trim();
    const apiKey = process.env.API_KEY; 
    const woncaApiUrl = "https://api-labs.wonca.com.br/wonca.labs.v1.LabsService/Track";

    if (!apiKey) {
        return res.status(500).json({
            codigo,
            erro: true,
            mensagem: "Erro de configuração do servidor (API_KEY Wonca ausente)."
        });
    }

    try {
        const response = await fetch(woncaApiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Apikey " + apiKey
            },
            body: JSON.stringify({ code: codigo })
        });

        const data = await response.json();

        // Caso a API retorne erro HTTP
        if (response.status !== 200) {
            return res.status(response.status).json({
                codigo,
                erro: true,
                mensagem: data.message || `Erro HTTP da Wonca: ${response.status}`,
                detalhes: data
            });
        }
        
        let rastreioDetalhado = null;

        // A API Wonca devolve o rastreio dentro da propriedade "json" como string
        if (data && data.json) {
            try {
                rastreioDetalhado = JSON.parse(data.json);
            } catch (e) {
                console.error("Erro ao fazer JSON.parse do rastreio Wonca:", e);
                return res.status(500).json({
                    codigo,
                    erro: true,
                    mensagem: "Erro no servidor ao processar resposta da Wonca."
                });
            }
        }

        // Caso não haja dados de rastreio
        if (!rastreioDetalhado || !rastreioDetalhado.codObjeto) {
            return res.status(404).json({
                codigo,
                erro: true,
                mensagem: "Código de rastreio não encontrado ou sem eventos.",
                detalhes: data
            });
        }

        // Sucesso
        return res.json({
            codigo,
            erro: false,
            mensagem: "Consulta realizada com sucesso",
            rastreio: rastreioDetalhado
        });

    } catch (err) {
        console.error(`Erro de rede ao consultar Wonca para ${codigo}:`, err.message);
        return res.status(500).json({
            codigo,
            erro: true,
            mensagem: "Erro interno: Falha de conexão com a API Wonca.",
            detalhes: err.message
        });
    }
});

export default router;
