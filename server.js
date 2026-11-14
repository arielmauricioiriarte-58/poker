const express = require('express');
const path = require('path');
const app = express();
app.disable('x-powered-by');

// Cabeceras de seguridad + método solo GET/HEAD (auditoría S-01, S-03, S-06, S-07, S-08)
app.use((req, res, next) => {
  const h = {
    'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self'; font-src 'self'; img-src 'self' data:; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'no-referrer',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-origin',
  };
  if (req.secure || req.headers['x-forwarded-proto'] === 'https') h['Strict-Transport-Security'] = 'max-age=31536000';
  for (const k in h) res.set(k, h[k]);
  if (req.method === 'GET' || req.method === 'HEAD') return next();
  res.set('Allow', 'GET, HEAD');
  return res.status(405).send('Method Not Allowed');
});

// Cache: no-cache para HTML/JS/CSS, 7d para SVG
app.use((req, res, next) => {
  if (req.path === '/' || req.path === '/index.html') res.set('Cache-Control', 'no-cache');
  else if (req.path.startsWith('/css/') || req.path.startsWith('/js/')) res.set('Cache-Control', 'no-cache');
  else if (req.path.startsWith('/assets/')) res.set('Cache-Control', 'public, max-age=604800');
  next();
});

// Solo servir el app estático esperado: / , /index.html, /css/, /js/, /assets/
app.use((req, res, next) => {
  const u = req.path.replace(/\/+$/, '') || '/';
  const ok = u === '/' || u === '/index.html' || u.startsWith('/css/') || u.startsWith('/js/') || u.startsWith('/assets/');
  if (!ok) return res.status(404).send('Not Found');
  next();
});

app.use(express.static(__dirname, { dotfiles: 'ignore', extensions: ['html'] }));
app.use((req, res) => res.status(404).send('Not Found'));
app.use((err, req, res, next) => { res.status(500).send('Internal Error'); });

app.listen(process.env.PORT || 3000, () => console.log('Póker escuchando'));
