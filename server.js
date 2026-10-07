import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());

app.get('/:tmdbId', async (req, res) => {
    try {
        const tmdbId = req.params.tmdbId;
        const embedUrl = `https://vidsrc.net/embed/movie?tmdb=${tmdbId}`;

        const response = await fetch(embedUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': 'https://vidsrc.net/'
            }
        });
        const html = await response.text();

        let streamUrl = null;
        const match = html.match(/https?:\/\/[^\'"\s]+\.m3u8[^\'"\s]*/i);
        if (match) streamUrl = match[0];

        res.json([{
            name: 'VidSrc',
            mediaId: tmdbId,
            stream: streamUrl,
            iframeUrl: streamUrl ? null : embedUrl,
            referer: 'https://cloudnestra.com/'
        }]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
