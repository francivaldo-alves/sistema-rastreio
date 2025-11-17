import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";

import loginRouter from "./routes/login.js";
import rastreioRouter from "./routes/rastreio.js";

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- MIDDLEWARES ---
app.use(cors());
app.use(express.json());

// --- ARQUIVOS ESTÁTICOS ---
app.use(express.static(path.join(__dirname, '../public')));
app.use('/src', express.static(path.join(__dirname, '../src')));

// --- ROTAS ---
app.use('/login', loginRouter);
app.use('/rastreio', rastreioRouter);

// --- REDIRECIONAMENTO RAIZ ---
app.get('/', (req, res) => {
    res.redirect('/login.html');
});

// --- INÍCIO DO SERVIDOR ---
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));
