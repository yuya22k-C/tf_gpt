import cors from 'cors';
import express, { type Request, type Response } from 'express';

type Flower = {
  id: number;
  name: string;
  color: string;
  season: string;
};

const app = express();
const port = Number(process.env.PORT ?? 3001);
const allowedOrigin = process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173';

app.use(
  cors({
    origin: allowedOrigin
  })
);
app.use(express.json());

let flowers: Flower[] = [
  { id: 1, name: 'Rose', color: 'Red', season: 'Spring' },
  { id: 2, name: 'Tulip', color: 'Yellow', season: 'Spring' },
  { id: 3, name: 'Sunflower', color: 'Yellow', season: 'Summer' }
];

app.get('/api/flowers', (_req: Request, res: Response) => {
  res.json(flowers);
});

app.get('/api/flowers/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const flower = flowers.find((item) => item.id === id);

  if (!flower) {
    return res.status(404).json({ message: 'Flower not found' });
  }

  return res.json(flower);
});

app.post('/api/flowers', (req: Request, res: Response) => {
  const { name, color, season } = req.body as Partial<Flower>;

  if (!name || !color || !season) {
    return res.status(400).json({ message: 'name, color, season are required' });
  }

  const newFlower: Flower = {
    id: flowers.length > 0 ? Math.max(...flowers.map((item) => item.id)) + 1 : 1,
    name,
    color,
    season
  };

  flowers.push(newFlower);
  return res.status(201).json(newFlower);
});

app.put('/api/flowers/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { name, color, season } = req.body as Partial<Flower>;
  const index = flowers.findIndex((item) => item.id === id);

  if (index < 0) {
    return res.status(404).json({ message: 'Flower not found' });
  }

  if (!name || !color || !season) {
    return res.status(400).json({ message: 'name, color, season are required' });
  }

  const updated: Flower = { id, name, color, season };
  flowers[index] = updated;

  return res.json(updated);
});

app.delete('/api/flowers/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const beforeLength = flowers.length;

  flowers = flowers.filter((item) => item.id !== id);

  if (flowers.length === beforeLength) {
    return res.status(404).json({ message: 'Flower not found' });
  }

  return res.status(204).send();
});

app.listen(port, () => {
  console.log(`Backend server is running on http://localhost:${port}`);
  console.log(`CORS allowed origin: ${allowedOrigin}`);
});
