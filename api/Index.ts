
import { VercelRequest, VercelResponse } from '@vercel/node';
import tmdbScrape from 'vidsrc.ts';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        // URL से TMDB ID निकालें
        const { id } = req.query;
        const tmdbId = id || req.url?.replace('/', '');

        if (!tmdbId) {
            return res.status(400).json({ error: 'TMDB ID डालें, जैसे: /1505305' });
        }

        // vidsrc से स्ट्रीम निकालें
        const data = await tmdbScrape(tmdbId.toString(), 'movie');
        res.status(200).json(data);

    } catch (error: any) {
        // असली एरर को JSON में भेजें
        console.error('Scraper Error:', error.message);
        res.status(500).json({ 
            success: false,
            error: 'स्ट्रीम लिंक नहीं मिल पाया', 
            details: error.message 
        });
    }
}
