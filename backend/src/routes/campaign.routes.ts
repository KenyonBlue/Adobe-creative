import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { CampaignBrief, CampaignRun } from '../models/campaign-brief.model';
import { pipelineService } from '../services/pipeline.service';
import { ValidationError } from '../utils/validators';

const router = Router();

const runs = new Map<string, CampaignRun>();

router.post('/', async (req: Request, res: Response) => {
  try {
    const brief = req.body as CampaignBrief;
    const runId = uuidv4();

    const run: CampaignRun = {
      id: runId,
      status: 'running',
      brief,
      startedAt: new Date().toISOString(),
    };
    runs.set(runId, run);

    const report = await pipelineService.run(brief);

    run.status = 'completed';
    run.completedAt = new Date().toISOString();
    run.report = report;
    runs.set(runId, run);

    res.status(201).json({ id: runId, status: 'completed', report });
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({ error: error.message });
      return;
    }
    console.error('Pipeline error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Pipeline execution failed',
    });
  }
});

router.get('/:id', (req: Request, res: Response) => {
  const id = req.params.id as string;
  const run = runs.get(id);
  if (!run) {
    res.status(404).json({ error: 'Campaign run not found' });
    return;
  }
  res.json(run);
});

router.get('/', (_req: Request, res: Response) => {
  res.json(Array.from(runs.values()));
});

export default router;
