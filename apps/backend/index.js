import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import chatRoutes from './src/routes/routes.js';

import './src/workers/outboundWorker.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use('/api', chatRoutes);

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', architecture: 'Agentic Workflow Active' });
});

app.listen(port, () => {
    console.log(`Backend Express escuchando en el puerto ${port}`);
    console.log(`Worker de LangChain (Cerebro) inicializado y esperando tareas...`);
});