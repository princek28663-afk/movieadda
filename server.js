import express from 'express';
import cors from 'cors';
import { chromium } from 'playwright';

const app = express();
app.use(cors());

app.get('/:tmdbId', async (req, res) => {
    const tmdbId = req.params.tmdbId.replace(/[^0-9]/g, '');
    let streamUrl = null;
    
    try {
        const browser = await chromium.launch({ 
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        
        // नेटवर्क रिक्वेस्ट पकड़ें
        page.on('request', request => {
            const url = request.url();
            if (url.includes('.m3u8') && !streamUrl) {
                streamUrl = url;
                console.log('✅ Found:', url);
            }
        });
        
        await page.goto(`https://embed.reelsdownload.online/player/${tmdbId}`, {
            waitUntil: 'networkidle',
            timeout: 30000
        });
        
        await page.waitForTimeout(12000);
        await browser.close();
        
        if (streamUrl) {
            res.json([{
                success: true,
                stream: streamUrl,
                referer: 'https://embed.reelsdownload.online/'
            }]);
        } else {
            res.json([{ success: false, error: 'Stream not found' }]);
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server on ${PORT}`));
