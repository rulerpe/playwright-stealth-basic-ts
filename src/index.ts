import { chromium } from 'playwright-extra';
import stealthPlugin from 'puppeteer-extra-plugin-stealth';
import express from 'express';

// 1. Tell playwright-extra to use the stealth plugin
chromium.use(stealthPlugin());

const app = express();
app.use(express.json());

// 2. The endpoint n8n will call
app.post('/scrape', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'Please provide a URL' });
  }

  console.log(`n8n requested scrape for: ${url}`);
  
  // Use chromium (which now has stealth enabled)
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'] 
  });

  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    await page.goto(url, { waitUntil: 'networkidle' });
    
    const title = await page.title();
    const content = await page.content();

    await browser.close();
    res.json({ title, content });
  } catch (error: any) {
    if (browser) await browser.close();
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Playwright Stealth service listening on port ${PORT}`);
});
