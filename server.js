import express from 'express';
import {fileURLToPath} from 'node:url';
import {dirname} from 'node:path';
const app = express(), __dirname = dirname(fileURLToPath(import.meta.url));
app.use(express.static(__dirname, { dotfiles: 'ignore', extensions: ['html'] }));
app.listen(process.env.PORT || 3000, () => console.log('Póker escuchando'));
