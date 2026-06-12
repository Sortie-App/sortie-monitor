const https = require('https');

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; sortie-monitor/1.0)' }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data, headers: res.headers }));
    });
    req.on('error', reject);
    req.setTimeout(10000, () => { req.destroy(); reject(new Error('timeout')); });
  });
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  const { sub, type = 'rss', limit = 8 } = req.query;
  if (!sub) return res.status(400).json({ error: 'Missing sub' });
  const url = type === 'json'
    ? `https://www.reddit.com/r/${sub}/new.json?limit=${limit}&raw_json=1`
    : `https://www.reddit.com/r/${sub}/new/.rss?limit=${limit}`;
  try {
    const response = await httpsGet(url);
    res.setHeader('Content-Type', response.headers['content-type'] || 'text/plain');
    res.status(response.status).send(response.body);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
