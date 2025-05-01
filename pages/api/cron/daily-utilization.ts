import { NextApiRequest, NextApiResponse } from 'next';
import { updateDailyUtilization } from '../../../lib/daily-utilization';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Verify the request is from a legitimate cron job
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET_KEY}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    await updateDailyUtilization();
    res.status(200).json({ message: 'Daily utilization updated successfully' });
  } catch (error) {
    console.error('Error in daily utilization cron job:', error);
    res.status(500).json({ error: 'Failed to update daily utilization' });
  }
} 