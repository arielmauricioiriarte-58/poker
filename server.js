// Servidor estático mínimo (Express) para hostings Node.js como Hostinger.
import express from 'express';
import {fileURLToPath} from 'node:url';
import {dirname} from 'node:path';
const app = express(), root = dirname(fileURLToPath(import.meta.url));
app.use(express.static(root, {dotfiles: 'ignore', extensions: ['html']}));
const port = process.env.PORT || 3000;
app.listen(port, () => console.log('Póker escuchando en puerto ' + port));
