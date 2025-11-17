import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

router.get("/:codigo", async (req, res) => {
    const codigo = req.params.codigo.trim();
    // ⚠️ Certifique-se de que sua API_KEY da Wonca está configurada no .env
    const apiKey = process.env.API_KEY; 
    const woncaApiUrl = "https://api-labs.wonca.com.br/wonca.labs.v1.LabsService/Track";

    if (!apiKey) {
        return res.status(500).json({
            codigo,
            erro: true,
            mensagem: "Erro de configuração do servidor (API_KEY Wonca ausente).",
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

        // 1. VERIFICAÇÃO DE STATUS HTTP
        if (response.status !== 200) {
            // Se o status não for 200, geralmente é um erro de autenticação ou rate limit
            return res.status(response.status).json({
                codigo,
                erro: true,
                mensagem: data.message || `Erro HTTP da Wonca: ${response.status}`,
                detalhes: data
            });
        }
        
        // 2. EXTRAÇÃO E PARSE DOS DADOS REAIS
        let rastreioDetalhado = null;

        // O resultado real está na string JSON aninhada em data.json (ou results[0].json)
        // Tentamos usar data.json que parece ser o consolidado
        if (data && data.json) {
            try {
                rastreioDetalhado = JSON.parse(data.json);
            } catch (e) {
                // Falha ao parsear, talvez a API Wonca mudou o formato ou deu erro
                console.error("Erro ao fazer JSON.parse do rastreio Wonca:", e);
                return res.status(500).json({
                    codigo,
                    erro: true,
                    mensagem: "Erro no servidor ao processar resposta da Wonca.",
                });
            }
        }

        // 3. VERIFICAÇÃO FINAL DOS DADOS
        if (!rastreioDetalhado || !rastreioDetalhado.codObjeto) {
            // Se não encontramos os dados de rastreio detalhados (ex: código não encontrado)
            return res.status(404).json({
                codigo,
                erro: true,
                mensagem: "Código de rastreio não encontrado ou sem eventos.",
                detalhes: data // Envia a resposta bruta para detalhes
            });
        }

        // 4. RESPOSTA DE SUCESSO PARA O FRONT-END
        return res.json({
            codigo,
            erro: false,
            mensagem: "Consulta realizada com sucesso",
            // Retorna o objeto de rastreio REAL, não a string JSON bruta
            rastreio: rastreioDetalhado 
        });

    } catch (err) {
        // Erro de rede (ex: Wonca API fora do ar)
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