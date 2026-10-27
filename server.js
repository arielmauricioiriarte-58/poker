const express = require('express');
const app = express();
app.use(express.static(__dirname, { dotfiles: 'ignore', extensions: ['html'] }));
app.listen(process.env.PORT || 3000, () => console.log('Póker escuchando'));
