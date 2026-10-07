import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        // URL से TMDB ID निकालें
        const { id } = req.query;
        const tmdbId = id || req.url?.replace('/', '').split('?')[0];

        if (!tmdbId) {
            return res.status(400).json({ error: 'TMDB ID डालें, जैसे: /1505305' });
        }

        // vidsrc.net का embed URL बनाएँ
        const embedUrl = `https://vidsrc.net/embed/movie?tmdb=${tmdbId}`;

        // vidsrc.net का HTML लोड करें
        const response = await fetch(embedUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': 'https://vidsrc.net/'
            }
        });

        const html = await response.text();

        // HTML से .m3u8 लिंक निकालें
        let streamUrl = null;
        const m3u8Match = html.match(/https?:\/\/[^\'"\s]+\.m3u8[^\'"\s]*/i);
        if (m3u8Match) {
            streamUrl = m3u8Match[0];
        }

        if (!streamUrl) {
            // अगर सीधा लिंक न मिले तो iframe URL दें
            return res.status(200).json([{
                name: 'VidSrc',
                mediaId: tmdbId,
                stream: null,
                iframeUrl: embedUrl,
                referer: 'https://cloudnestra.com/'
            }]);
        }

        // सफल रिस्पॉन्स
        res.status(200).json([{
            name: 'VidSrc',
            mediaId: tmdbId,
            stream: streamUrl,
            referer: 'https://cloudnestra.com/'
        }]);

    } catch (error: any) {
        console.error('Scraper Error:', error.message);
        res.status(500).json({
            success: false,
            error: 'स्ट्रीम लिंक नहीं मिल पाया',
            details: error.message
        });
    }
}
