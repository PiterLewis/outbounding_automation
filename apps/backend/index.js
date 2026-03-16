import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import chatRoutes from './src/routes/routes.js';
import './src/workers/outboundWorker.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/events-automation';
mongoose.connect(mongoURI)
    .then(() => console.log('Conectado a MongoDB con éxito'))
    .catch(err => console.error('Error al conectar a MongoDB:', err));

app.use('/api', chatRoutes);

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', architecture: 'Agentic Workflow Active' });
});

app.listen(port, () => {
    console.log(`Backend Express escuchando en el puerto ${port}`);
    console.log(`Worker de LangChain (Cerebro) inicializado y esperando tareas...`);
});