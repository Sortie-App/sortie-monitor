const https = require('https');

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; sortie-monitor/1.0)' }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.setTimeout(10000, () => { req.destroy(); reject(new Error('timeout')); });
  });
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { path } = req.query;
  if (!path) return res.status(400).json({ error: 'Missing path' });

  try {
    const response = await httpsGet(`https://www.reddit.com${path}.json?limit=5`);
    res.setHeader('Content-Type', 'application/json');
    res.status(response.status).send(response.body);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

