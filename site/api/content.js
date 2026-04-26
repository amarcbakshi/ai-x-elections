// Vercel serverless function — proxies Airtable to keep PAT server-side
const BASE_ID       = 'appiZRyyiWDKl7YnP';
const ARTICLES_TBL  = 'tblnraTb6k0ZXobtP';
const TOOLKIT_TBL   = 'tblXhVSPVZfEVIqWy';

async function airtableFetch(table, formula) {
  const params = new URLSearchParams({
    'sort[0][field]':     'Sort Order',
    'sort[0][direction]': 'asc',
  });
  if (formula) params.set('filterByFormula', formula);
  const res = await fetch(
    `https://api.airtable.com/v0/${BASE_ID}/${table}?${params}`,
    { headers: { Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}` } }
  );
  if (!res.ok) throw new Error(`Airtable ${table}: HTTP ${res.status}`);
  return (await res.json()).records;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  try {
    const [artRecs, toolRecs] = await Promise.all([
      airtableFetch(ARTICLES_TBL, "{Status}='Published'"),
      airtableFetch(TOOLKIT_TBL,  "{Status}='Active'"),
    ]);

    const articles = artRecs.map(r => ({
      id:        r.id,
      title:     r.fields['Title']          || '',
      section:   r.fields['Section']        || '',
      kicker:    r.fields['Kicker']         || '',
      type:      (r.fields['Type'] || 'col').toLowerCase(),
      deck:      r.fields['Deck']           || '',
      body:      r.fields['Body']           || '',
      sortOrder: Number(r.fields['Sort Order']) || 999,
      date:      r.fields['Published Date'] || '',
    }));

    const toolkit = toolRecs.map(r => ({
      id:          r.id,
      title:       r.fields['Title']          || '',
      number:      String(r.fields['Number']  || ''),
      description: r.fields['Description']    || '',
      tag:         r.fields['Tag']            || '',
    }));

    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json({ articles, toolkit });
  } catch (err) {
    console.error('content handler error', err);
    res.status(500).json({ error: 'content unavailable' });
  }
};
