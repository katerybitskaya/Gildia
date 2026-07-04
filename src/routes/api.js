const path = require('path');
const fs = require('fs');
const express = require('express');
const DungeonGenerator = require('../dungeon/DungeonGenerator');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');

function loadJson(fileName) {
  const filePath = path.join(DATA_DIR, fileName);
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

const router = express.Router();

// Generuje nowy labirynt pokoi dla podanego poziomu (domyślnie 1)
router.get('/dungeon/new', (req, res) => {
  const level = Math.max(1, parseInt(req.query.level, 10) || 1);
  const generator = new DungeonGenerator(level);
  const dungeon = generator.generate();
  res.json(dungeon);
});

// Definicje danych z JSON (sekcja: "obrazy pobieramy z .json")
router.get('/enemies', (req, res) => {
  res.json(loadJson('enemies.json'));
});

router.get('/items', (req, res) => {
  res.json(loadJson('items.json'));
});

router.get('/pets', (req, res) => {
  res.json(loadJson('pets.json'));
});

router.get('/sprites', (req, res) => {
  res.json(loadJson('sprites.json'));
});

module.exports = router;
