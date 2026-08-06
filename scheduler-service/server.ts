import express, { Request, Response } from 'express';
import { connetRabbitMQ } from './src/config/rabbitmq';
import { initSchedulerJobs } from './src/cron/cron.manager';

const app = express();
const PORT = process.env.PORT || 4000;

async function startServer() {
  await connetRabbitMQ();
  initSchedulerJobs();

  app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'UP' });
  });

  app.listen(PORT, () => console.log(`Scheduler Service rodando na porta ${PORT}`));
}

startServer();
