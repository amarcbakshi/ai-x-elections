// /api/news.js — proxy Google News RSS to avoid CORS + parse XML to JSON
const https = require('https');
const http  = require('http');

function fetch(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.setTimeout(8000, () => { req.destroy(); reject(new Error('timeout')); });
  });
}

function parseRSS(xml) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let m;
  while ((m = itemRegex.exec(xml)) !== null) {
    const block = m[1];
    const get = (tag) => {
      const r = new RegExp(`<${tag}[^>]*>(?:<![CDATA[)?([\\s\\S]*?)(?:]]>)?<\\/${tag}>`, 'i');
      const x = r.exec(block);
      return x ? x[1].replace(/<[^>]+>/g, '').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&#39;/g,"'").replace(/&quot;/g,'"').trim() : '';
    };
    const title = get('title');
    const link  = get('link') || block.match(/<link>([^<]+)/)?.[1] || '';
    const pubDate = get('pubDate');
    const source  = get('source') || '';
    const desc    = get('description').replace(/<[^>]+>/g,'').slice(0,200);
    if (title) items.push({ title, link, pubDate, source, desc });
  }
  return items;
}

function extractDomain(link) {
  try { return new URL(link).hostname.replace(/^www\./, ''); } catch { return 'unknown'; }
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const q = req.query.q || 'election';
  const state = req.query.state || '';
  const query = state ? `${q} ${state} election` : `${q} election`;
  const encoded = encodeURIComponent(query);
  const url = `https://news.google.com/rss/search?q=${encoded}&hl=en-US&gl=US&ceid=US:en`;

  try {
    const { body } = await fetch(url);
    const items = parseRSS(body).slice(0, 30);

    // Source breakdown
    const sources = {};
    items.forEach(it => {
      const domain = it.source || extractDomain(it.link);
      sources[domain] = (sources[domain] || 0) + 1;
    });
    const topSources = Object.entries(sources)
      .sort((a,b) => b[1]-a[1])
      .slice(0, 8)
      .map(([name, count]) => ({ name, count }));

    // Timeline: count per day over last 7 days
    const timeline = {};
    const now = Date.now();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now - i * 86400000);
      timeline[d.toISOString().slice(0,10)] = 0;
    }
    items.forEach(it => {
      const d = new Date(it.pubDate);
      if (!isNaN(d)) {
        const key = d.toISOString().slice(0,10);
        if (key in timeline) timeline[key]++;
      }
    });
    const timelineArr = Object.entries(timeline).map(([date, count]) => ({ date, count }));

    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    res.json({ items, topSources, timeline: timelineArr, total: items.length, query });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
