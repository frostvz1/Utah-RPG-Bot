const fs = require("fs");
const path = require("path");

const databasePath = path.join(__dirname, "../../database/users.json");

function loadUsers() {
  try {
    if (!fs.existsSync(databasePath)) {
      fs.writeFileSync(databasePath, "{}");
    }

    return JSON.parse(
      fs.readFileSync(databasePath, "utf8")
    );
  } catch (error) {
    console.error("Erro ao carregar banco:", error);
    return {};
  }
}

function saveUsers(users) {
  fs.writeFileSync(
    databasePath,
    JSON.stringify(users, null, 2)
  );
}

function aplicarRegeneracao(user) {
  if (!user.registered) {
    return user;
  }

  if (user.combat?.active) {
    return user;
  }

  const agora = Date.now();
  const ultimo = user.lastRegeneration || agora;
  const intervalo = 5 * 60 * 1000;

  const ciclos = Math.floor(
    (agora - ultimo) / intervalo
  );

  if (ciclos <= 0) {
    return user;
  }

  const hp = Math.min(
    user.maxHp,
    user.hp + ciclos * 5
  );

  const energy = Math.min(
    user.maxEnergy,
    user.energy + ciclos * 5
  );

  user.hp = hp;
  user.energy = energy;

  user.lastRegeneration =
    ultimo + ciclos * intervalo;

  return user;
}

/*
 * Requisito de XP:
 *
 * Nível 1 -> 100 XP
 * Nível 2 -> 200 XP
 * Nível 3 -> 300 XP
 * ...
 *
 * O XP excedente permanece após subir de nível.
 */
function xpNecessario(level) {
  return Math.max(1, Number(level) || 1) * 100;
}

/*
 * Adiciona XP ao jogador e processa automaticamente
 * todos os níveis que forem alcançados.
 */
function adicionarXP(id, quantidade) {
  const users = loadUsers();

  if (!users[id]) {
    return null;
  }

  const user = users[id];

  const xpGanho = Math.max(
    0,
    Number(quantidade) || 0
  );

  if (xpGanho <= 0) {
    return {
      user,
      xpGanho: 0,
      niveisGanhos: 0,
      nivelAnterior: user.level,
      nivelAtual: user.level
    };
  }

  const nivelAnterior = Number(user.level) || 1;

  user.level = nivelAnterior;
  user.xp = Math.max(
    0,
    Number(user.xp) || 0
  );

  user.xp += xpGanho;

  let niveisGanhos = 0;

  while (
    user.level < 200 &&
    user.xp >= xpNecessario(user.level)
  ) {
    user.xp -= xpNecessario(user.level);
    user.level++;
    niveisGanhos++;
  }

  /*
   * O nível 200 é o limite atual do sistema.
   * Se chegar ao nível máximo, o XP não continua
   * consumindo requisitos inexistentes.
   */
  if (user.level >= 200) {
    user.level = 200;
  }

  saveUsers(users);

  return {
    user,
    xpGanho,
    niveisGanhos,
    nivelAnterior,
    nivelAtual: user.level
  };
}

function getUser(id) {
  const users = loadUsers();

  /*
   * Primeiro tenta encontrar pelo ID exato.
   */
  let userId = id;

  /*
   * Se não encontrar, compara os identificadores
   * apenas pelos números.
   */
  if (!users[userId]) {
    const normalizarId = valor =>
      String(valor || "")
        .replace(/@s\.whatsapp\.net/g, "")
        .replace(/@lid/g, "")
        .replace(/@c\.us/g, "")
        .replace(/\D/g, "");

    const numeroRecebido =
      normalizarId(id);

    if (numeroRecebido) {
      for (const chave of Object.keys(users)) {
        if (
          normalizarId(chave) ===
          numeroRecebido
        ) {
          userId = chave;
          break;
        }

        if (
          users[chave]?.id &&
          normalizarId(users[chave].id) ===
          numeroRecebido
        ) {
          userId = chave;
          break;
        }
      }
    }
  }

  /*
   * Se realmente não existir,
   * cria um novo usuário não registrado.
   */
  if (!users[userId]) {
    users[userId] = {
      id: userId,
      registered: false,
      name: "",
      class: null,

      level: 1,
      xp: 0,

      hp: 100,
      maxHp: 100,

      energy: 100,
      maxEnergy: 100,

      strength: 5,
      defense: 5,
      speed: 5,
      intelligence: 5,

      coins: 100,

      inventory: [],
      quests: [],
      skills: [],
      abilities: [],

      victories: 0,
      defeats: 0,

      combat: null,

      lastRegeneration: Date.now(),
      createdAt: Date.now()
    };

    saveUsers(users);
  }

  const user = users[userId];

  if (!user.inventory) {
    user.inventory = [];
  }

  if (!user.quests) {
    user.quests = [];
  }

  if (!user.skills) {
    user.skills = [];
  }

  if (!user.abilities) {
    user.abilities = [];
  }

  if (typeof user.victories !== "number") {
    user.victories = 0;
  }

  if (typeof user.defeats !== "number") {
    user.defeats = 0;
  }

  if (!user.maxHp) {
    user.maxHp = 100;
  }

  if (!user.maxEnergy) {
    user.maxEnergy = 100;
  }

  if (!user.lastRegeneration) {
    user.lastRegeneration = Date.now();
  }

  if (!user.level || user.level < 1) {
    user.level = 1;
  }

  if (
    typeof user.xp !== "number" ||
    user.xp < 0
  ) {
    user.xp = 0;
  }

  aplicarRegeneracao(user);

  saveUsers(users);

  return user;
}


function updateUser(id, data) {
  const users = loadUsers();

  if (!users[id]) {
    users[id] = getUser(id);
  }

  users[id] = {
    ...users[id],
    ...data
  };

  saveUsers(users);

  return users[id];
}

module.exports = {
  loadUsers,
  saveUsers,
  getUser,
  updateUser,
  aplicarRegeneracao,
  adicionarXP,
  xpNecessario
};
