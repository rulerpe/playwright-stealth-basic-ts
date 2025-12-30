import { playwright } from 'playwright-extra';
import stealth from 'puppeteer-extra-plugin-stealth';
import express from 'express';

// 1. Setup Playwright with Stealth
playwright.chromium.use(stealth());

const app = express();
app.use(express.json());

// 2. Define the endpoint n8n will talk to
app.post('/scrape', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'Please provide a URL' });
  }

  console.log(`n8n requested scrape for: ${url}`);
  const browser = await playwright.chromium.launch({ headless: true });
  
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Navigate to the site
    await page.goto(url, { waitUntil: 'networkidle' });
    
    // Get basic data (you can customize what you extract here)
    const title = await page.title();
    const content = await page.content(); // Full HTML

    await browser.close();
    res.json({ title, content });
  } catch (error: any) {
    if (browser) await browser.close();
    res.status(500).json({ error: error.message });
  }
});

// 3. Start the server on the port Railway provides
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Playwright service is online at port ${PORT}`);
});
