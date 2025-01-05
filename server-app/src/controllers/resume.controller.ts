import { Request, Response } from 'express';

const getExample = (req: Request, res: Response): void => {
  res.json({ message: 'This is an example response from the controller.' });
};

export default { getExample };