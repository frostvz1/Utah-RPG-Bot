const {
  loadConfig
} = require("./config");

function substituirVariaveis(
  text,
  data = {}
) {
  const config = loadConfig();

  const values = {
    user: data.user || "Jogador",
    name: data.name || config.name || "UTAH RPG",
    prefix: config.prefix || "P",
    group: data.group || "",
    level: data.level ?? "",
    coins: data.coins ?? "",
    hp: data.hp ?? "",
    maxHp: data.maxHp ?? "",
    energy: data.energy ?? "",
    maxEnergy: data.maxEnergy ?? ""
  };

  return String(text)
    .replace(
      /\{user\}/gi,
      values.user
    )
    .replace(
      /\{name\}/gi,
      values.name
    )
    .replace(
      /\{prefix\}/gi,
      values.prefix
    )
    .replace(
      /\{group\}/gi,
      values.group
    )
    .replace(
      /\{level\}/gi,
      String(values.level)
    )
    .replace(
      /\{coins\}/gi,
      String(values.coins)
    )
    .replace(
      /\{hp\}/gi,
      String(values.hp)
    )
    .replace(
      /\{maxHp\}/gi,
      String(values.maxHp)
    )
    .replace(
      /\{energy\}/gi,
      String(values.energy)
    )
    .replace(
      /\{maxEnergy\}/gi,
      String(values.maxEnergy)
    );
}

function getMessage(
  key,
  data = {}
) {
  const config = loadConfig();

  const message =
    config.messages?.[key];

  if (!message) {
    return null;
  }

  if (message.enabled === false) {
    return null;
  }

  return substituirVariaveis(
    message.text,
    data
  );
}

function hasMessage(key) {
  const config = loadConfig();

  return Boolean(
    config.messages?.[key] &&
    config.messages[key].enabled !== false
  );
}

async function sendAutomaticMessage(
  sock,
  msg,
  key,
  data = {},
  options = {}
) {
  const text =
    getMessage(key, data);

  if (!text) {
    return null;
  }

  const jid =
    msg.key.remoteJid;

  const payload = {
    text
  };

  if (options.quoted !== false) {
    payload.quoted = msg;
  }

  return sock.sendMessage(
    jid,
    payload
  );
}

module.exports = {
  substituirVariaveis,
  getMessage,
  hasMessage,
  sendAutomaticMessage
};
