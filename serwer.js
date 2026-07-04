const path = require('path');
const express = require('express');
const apiRouter = require('./src/routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

// Statyczne pliki front-endu (public/) oraz surowe dane JSON (data/) dla debugowania
app.use(express.static(path.join(__dirname, 'public')));
app.use('/data', express.static(path.join(__dirname, 'data')));

// Grafiki (data/sprites/*) dostępne pod /sprites/..., zgodnie ze ścieżkami wpisywanymi w data/*.json
app.use('/sprites', express.static(path.join(__dirname, 'data', 'sprites')));

// Backend API: generowanie labiryntu, definicje wrogów/przedmiotów/petów/grafik
app.use('/api', apiRouter);

app.listen(PORT, () => {
  console.log(`Serwer "Escape the wsiz" działa: http://localhost:${PORT}`);
});
