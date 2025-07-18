// app.js - Fichier de démarrage pour l'application Next.js en production
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

// Détermine si l'application est en mode développement ou production
const dev = process.env.NODE_ENV !== 'production';

// Initialise l'application Next.js
const app = next({ dev });
const handle = app.getRequestHandler();

// Port sur lequel le serveur écoutera
const port = process.env.PORT || 3000;

// Prépare l'application Next.js
app.prepare().then(() => {
  // Crée un serveur HTTP qui redirige les requêtes vers Next.js
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`> Serveur prêt sur http://localhost:${port}`);
  });
});