/* const express = require('express');
const cors = require('cors');
const { Worker, Queue } = require('bullmq');
const Redis = require('ioredis');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const redisOptions = {
    maxRetriesPerRequest: null,
};

const connection = new Redis(process.env.REDIS_URL || 'redis://redis:6379', redisOptions);

const outboundingQueue = new Queue('outbounding', { connection });

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', worker: 'running' });
});

app.post('/jobs', async (req, res) => {
    const { data } = req.body;
    const job = await outboundingQueue.add('task', data);
    res.status(201).json({ jobId: job.id });
});

const worker = new Worker('outbounding', async job => {
    console.log(`Processing job ${job.id} with data`, job.data);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { status: 'completed', result: 'Success' };
}, { connection });

worker.on('completed', job => {
    console.log(`${job.id} has completed!`);
});

worker.on('failed', (job, err) => {
    console.log(`${job.id} has failed with ${err.message}`);
});

app.listen(port, () => {
    console.log(`Backend listening on port ${port}`);
    console.log(`BullMQ worker registered for "outbounding" queue`);
});
 */

