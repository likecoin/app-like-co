import express, { Request, Response, NextFunction } from 'express';
import arweave from './arweave/router';
import numbersProtocol from './numbers-protocol/router';
import crawler from './crawler/router';
import nft from './nft/router';

const app = express();
app.use(express.json());

app.use('/arweave', arweave);
app.use('/numbers-protocol', numbersProtocol);
app.use('/crawler', crawler);
app.use('/nft', nft);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  // eslint-disable-next-line no-console
  console.error(err);
  res.set('Content-Type', 'text/plain');
  if (err.message?.includes('invalid address')) {
    return res.status(400).send('Invalid address');
  }
  return res.status(500).send('Internal server error');
});

export default app;
