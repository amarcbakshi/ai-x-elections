// /api/news.js — GDELT Project API proxy for election news monitoring
const https = require('https');

function fetch(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.setTimeout(10000, () => { req.destroy(); reject(new Error('timeout')); });
  });
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const q      = (req.query.q || 'election').trim();
  const state  = (req.query.state || '').trim();

  // Build GDELT query — restrict to English US sources
  const baseQuery = state
    ? `${q} "${state}" sourcelang:english sourcecountry:unitedstates`
    : `${q} sourcelang:english sourcecountry:unitedstates`;

  const encoded = encodeURIComponent(baseQuery);
  const url = `https://api.gdeltproject.org/api/v2/doc/doc?query=${encoded}&mode=artlist&maxrecords=30&format=json&sort=DateDesc&TIMESPAN=7d`;

  try {
    const { body } = await fetch(url);
    const parsed = JSON.parse(body);
    const raw = (parsed.articles || []).filter(a => a.language === 'English');

    const items = raw.map(a => ({
      title:   a.title,
      link:    a.url,
      source:  a.domain,
      pubDate: a.seendate ? parseGdeltDate(a.seendate) : '',
      desc:    '',
      image:   a.socialimage || '',
    }));

    // Source breakdown
    const sourceCounts = {};
    items.forEach(it => { sourceCounts[it.source] = (sourceCounts[it.source] || 0) + 1; });
    const topSources = Object.entries(sourceCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count]) => ({ name, count }));

    // Timeline — count per day for last 7 days
    const timeline = {};
    const now = Date.now();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now - i * 86400000);
      timeline[d.toISOString().slice(0, 10)] = 0;
    }
    items.forEach(it => {
      if (it.pubDate) {
        const key = new Date(it.pubDate).toISOString().slice(0, 10);
        if (key in timeline) timeline[key]++;
      }
    });
    const timelineArr = Object.entries(timeline).map(([date, count]) => ({ date, count }));

    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    res.json({ items, topSources, timeline: timelineArr, total: items.length, query: baseQuery });

  } catch (err) {
    res.status(500).json({ error: err.message, items: [], topSources: [], timeline: [], total: 0 });
  }
};

// GDELT date format: "20260330T171500Z" → ISO string
function parseGdeltDate(s) {
  try {
    // "20260330T171500Z"
    const y = s.slice(0,4), mo = s.slice(4,6), d = s.slice(6,8);
    const h = s.slice(9,11), mi = s.slice(11,13);
    return `${y}-${mo}-${d}T${h}:${mi}:00Z`;
  } catch { return ''; }
}
