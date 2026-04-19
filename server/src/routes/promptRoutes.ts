import { Router } from 'express';
import { tailorService, PromptTemplates, PromptDescriptions, type PromptType, type PromptVars } from '../services/tailorService.js';

const router = Router();

router.get('/templates', (_, res) => {
  const templates = (Object.keys(PromptTemplates) as PromptType[]).map(key => ({
    name: key,
    description: PromptDescriptions[key]
  }));
  
  res.json({ success: true, data: templates });
});

router.post('/run', async (req, res) => {
  try {
    const { promptType, vars, keywords } = req.body as { promptType: PromptType; vars: PromptVars; keywords?: string[] };
    
    if (!promptType || !vars) {
      return res.status(400).json({
        success: false,
        error: 'promptType and vars are required'
      });
    }

    if (!PromptTemplates[promptType]) {
      return res.status(400).json({
        success: false,
        error: 'Invalid promptType'
      });
    }

    const result = await tailorService.runPrompt(promptType, vars, keywords || []);
    
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
});

export default router;