// Vercel serverless function — proxies Airtable to keep PAT server-side
const BASE_ID       = 'appiZRyyiWDKl7YnP';
const ARTICLES_TBL  = 'tblnraTb6k0ZXobtP';
const TOOLKIT_TBL   = 'tblXhVSPVZfEVIqWy';

// Normalise Airtable Type values to internal slugs
function normaliseType(raw) {
  const t = (raw || '').toLowerCase().trim();
  if (t === 'lead')          return 'lead';
  if (t === 'column')        return 'col';
  if (t === 'third')         return 'third';
  if (t === 'field report')  return 'col';   // render like a column article
  return 'col';
}

async function airtableFetch(table, params) {
  const url = new URL(`https://api.airtable.com/v0/${BASE_ID}/${table}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}` },
  });
  if (!res.ok) throw new Error(`Airtable ${table}: HTTP ${res.status}`);
  return (await res.json()).records || [];
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  try {
    const [artRecs, toolRecs] = await Promise.all([
      airtableFetch(ARTICLES_TBL, {
        filterByFormula:     "{Status}='Published'",
        'sort[0][field]':    'Sort Order',
        'sort[0][direction]':'asc',
      }),
      airtableFetch(TOOLKIT_TBL, {
        filterByFormula:     "{Status}='Published'",
        'sort[0][field]':    'Number',
        'sort[0][direction]':'asc',
      }),
    ]);

    const articles = artRecs.map(r => ({
      id:        r.id,
      title:     r.fields['Title']          || '',
      section:   r.fields['Section']        || '',
      kicker:    r.fields['Kicker']         || '',
      type:      normaliseType(r.fields['Type']),
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
