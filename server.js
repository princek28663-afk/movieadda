import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
app.use(cors());

// सभी ज़रूरी headers जो एक असली ब्राउज़र भेजता है
const browserHeaders = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Referer': 'https://vidsrc.net/',
    'Origin': 'https://vidsrc.net',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1'
};

app.get('/:tmdbId', async (req, res) => {
    const tmdbId = req.params.tmdbId;
    
    // अलग-अलग सोर्स की लिस्ट (Fallback Chain)
    const sources = [
        { url: `https://vidsrc.net/embed/movie?tmdb=${tmdbId}`, referer: 'https://vidsrc.net/' },
        { url: `https://vidsrc.xyz/embed/movie?tmdb=${tmdbId}`, referer: 'https://vidsrc.xyz/' },
        { url: `https://vidsrc.to/embed/movie/${tmdbId}`, referer: 'https://vidsrc.to/' }
    ];

    let streamUrl = null;
    let usedSource = null;

    // एक-एक करके सभी सोर्स ट्राई करें
    for (const source of sources) {
        try {
            console.log(`Trying: ${source.url}`);
            const response = await axios.get(source.url, {
                headers: { ...browserHeaders, 'Referer': source.referer },
                timeout: 15000 // 15 सेकंड का टाइमआउट
            });

            const html = response.data;
            const match = html.match(/https?:\/\/[^\'"\s]+\.m3u8[^\'"\s]*/i);
            
            if (match) {
                streamUrl = match[0];
                usedSource = source.url;
                console.log(`✅ Success from: ${source.url}`);
                break; // लिंक मिल गया, लूप से बाहर निकलें
            }
        } catch (error) {
            console.log(`❌ Failed: ${source.url} - ${error.message}`);
            // अगर यह सोर्स फेल हो, तो अगला ट्राई करें
        }
    }

    // रिस्पॉन्स भेजें
    if (streamUrl) {
        res.json([{
            name: 'VidSrc',
            mediaId: tmdbId,
            stream: streamUrl,
            iframeUrl: null,
            referer: 'https://cloudnestra.com/'
        }]);
    } else {
        // अगर कोई भी सोर्स काम न करे, तो iframe का रास्ता दें
        res.json([{
            name: 'VidSrc',
            mediaId: tmdbId,
            stream: null,
            iframeUrl: `https://vidsrc.net/embed/movie?tmdb=${tmdbId}`,
            referer: 'https://cloudnestra.com/',
            note: 'सीधा लिंक नहीं मिला, iframe इस्तेमाल करें'
        }]);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
