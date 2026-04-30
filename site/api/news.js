// /api/news.js
// mode=scan  → RSS2JSON proxy of Google News (local jurisdiction monitoring)
// mode=feed  → The Guardian open API (curated election journalism)
const https = require('https');

function get(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.setTimeout(10000, () => { req.destroy(); reject(new Error('timeout')); });
  });
}

// ── SCAN MODE: RSS2JSON → Google News RSS ──
async function scanMode(q, state) {
  const query  = state ? `${q} "${state}"` : q;
  const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;
  const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;
  const body   = await get(apiUrl);
  const parsed = JSON.parse(body);
  if (parsed.status !== 'ok') throw new Error(parsed.message || 'rss2json error');

  const raw = parsed.items || [];
  const items = raw.map(it => ({
    title:   it.title,
    link:    it.link,
    source:  it.author || extractDomain(it.link),
    pubDate: it.pubDate,
    desc:    (it.description || '').replace(/<[^>]+>/g,'').slice(0,200),
  }));
  return buildResponse(items, query);
}

// ── FEED MODE: The Guardian open API ──
async function feedMode(q, state) {
  const query  = state ? `${q} ${state}` : q;
  const apiUrl = `https://content.guardianapis.com/search?q=${encodeURIComponent(query)}&api-key=test&show-fields=trailText&page-size=30&order-by=newest&tag=us-news/us-elections,us-news/us-politics,technology/hacking&use-date=published`;
  const body   = await get(apiUrl);
  const parsed = JSON.parse(body);
  const results = parsed.response?.results || [];
  const items = results.map(it => ({
    title:   it.webTitle,
    link:    it.webUrl,
    source:  'The Guardian',
    pubDate: it.webPublicationDate,
    desc:    (it.fields?.trailText || '').replace(/<[^>]+>/g,'').slice(0,200),
  }));
  return buildResponse(items, query);
}

function buildResponse(items, query) {
  // Source breakdown
  const srcMap = {};
  items.forEach(it => { const s = it.source || 'unknown'; srcMap[s] = (srcMap[s]||0)+1; });
  const topSources = Object.entries(srcMap).sort((a,b)=>b[1]-a[1]).slice(0,8)
    .map(([name,count])=>({name,count}));

  // 7-day timeline
  const timeline = {};
  const now = Date.now();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now - i*86400000);
    timeline[d.toISOString().slice(0,10)] = 0;
  }
  items.forEach(it => {
    if (it.pubDate) {
      const key = new Date(it.pubDate).toISOString().slice(0,10);
      if (key in timeline) timeline[key]++;
    }
  });

  return {
    items,
    topSources,
    timeline: Object.entries(timeline).map(([date,count])=>({date,count})),
    total: items.length,
    query,
  };
}

function extractDomain(link) {
  try { return new URL(link).hostname.replace(/^www\./,''); } catch { return 'unknown'; }
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const mode  = req.query.mode || 'scan';
  const q     = (req.query.q || 'election').trim();
  const state = (req.query.state || '').trim();

  try {
    const data = mode === 'feed' ? await feedMode(q, state) : await scanMode(q, state);
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message, items:[], topSources:[], timeline:[], total:0 });
  }
};
