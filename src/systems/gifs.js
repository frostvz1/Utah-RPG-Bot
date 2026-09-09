const fs = require("fs");
const path = require("path");

const databasePath = path.join(__dirname, "../../database/gifs.json");
const mediaPath = path.join(__dirname, "../../media/gifs");

function ensureDatabase() {
  if (!fs.existsSync(databasePath)) {
    fs.writeFileSync(databasePath, "{}");
  }

  if (!fs.existsSync(mediaPath)) {
    fs.mkdirSync(mediaPath, { recursive: true });
  }
}

function loadGifs() {
  ensureDatabase();

  try {
    return JSON.parse(
      fs.readFileSync(databasePath, "utf8")
    );
  } catch {
    return {};
  }
}

function saveGifs(gifs) {
  ensureDatabase();

  fs.writeFileSync(
    databasePath,
    JSON.stringify(gifs, null, 2)
  );
}

function getGif(category) {
  const gifs = loadGifs();
  return gifs[category] || null;
}

function setGif(category, filePath) {
  const gifs = loadGifs();

  gifs[category] = {
    file: filePath,
    updatedAt: Date.now()
  };

  saveGifs(gifs);
}

function removeGif(category) {
  const gifs = loadGifs();

  if (!gifs[category]) {
    return false;
  }

  const file = gifs[category].file;

  if (fs.existsSync(file)) {
    fs.unlinkSync(file);
  }

  delete gifs[category];

  saveGifs(gifs);

  return true;
}

function listGifs() {
  return loadGifs();
}

module.exports = {
  getGif,
  setGif,
  removeGif,
  listGifs,
  mediaPath
};
