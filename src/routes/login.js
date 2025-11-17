import express from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

const AUTH_USER = process.env.AUTH_USER;
const AUTH_PASS = process.env.AUTH_PASS;
const SECRET = process.env.JWT_SECRET;


router.post("/", (req, res) => {
    const { usuario, senha } = req.body;

    if (usuario === AUTH_USER && senha === AUTH_PASS) {
        const token = jwt.sign({ usuario }, SECRET, { expiresIn: "8h" });

        return res.json({
            sucesso: true,
            token
        });
    }

    return res.status(401).json({
        sucesso: false,
        mensagem: "Usuário ou senha inválidos"
    });
});

export default router;
