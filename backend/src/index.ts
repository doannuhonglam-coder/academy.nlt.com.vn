import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { academyRouter } from './modules/academy';

const app = express();
const PORT = process.env.PORT ?? 8080;

app.use(cors());
app.use(express.json());

// Academy module — routes prefixed /api/v1/academy
app.use('/api/v1/academy', academyRouter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', module: 'academy-nlt' });
});

app.listen(PORT, () => {
  console.log(`[academy-nlt] Server running on http://localhost:${PORT}`);
});

export default app;
