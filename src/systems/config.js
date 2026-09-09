const fs = require("fs");
const path = require("path");

const databasePath = path.join(
  __dirname,
  "../../database/config.json"
);

const DEFAULT_MENU = [
  "╔════════════════════════════╗",
  "          {name}",
  "╚════════════════════════════╝",
  "",
  "PERSONAGEM",
  "{prefix}iniciar",
  "{prefix}perfil",
  "{prefix}status",
  "{prefix}classe",
  "{prefix}despertar",
  "",
  "AVENTURA",
  "{prefix}aventura explorar",
  "{prefix}aventura mapa",
  "",
  "COMBATE",
  "{prefix}atacar",
  "{prefix}habilidade",
  "{prefix}defender",
  "{prefix}fugir",
  "",
  "INVENTÁRIO",
  "{prefix}inventario",
  "{prefix}item usar <item>",
  "{prefix}item equipar <item>",
  "",
  "MISSÕES",
  "{prefix}missao",
  "{prefix}missao aceitar <id>",
  "",
  "GUILDAS",
  "{prefix}guilda criar <nome>",
  "{prefix}guilda perfil",
  "{prefix}guilda membros",
  "",
  "ECONOMIA",
  "{prefix}loja",
  "{prefix}mercado",
  "{prefix}banco",
  "",
  "RANKING",
  "{prefix}ranking",
  "",
  "ADMINISTRAÇÃO",
  "{prefix}config — Configurações (ADM)",
  "{prefix}configowner — Configurações do Owner",
  "",
  "DESPERTAR",
  "{prefix}despertar",
  "Requer nível 200"
].join("\n");

const DEFAULT_MESSAGES = {
  welcome: {
    enabled: true,
    text: "Bem-vindo, {user}!\n\nVocê entrou no {name}."
  },

  leave: {
    enabled: true,
    text: "{user} saiu do grupo."
  },

  commandNotFound: {
    enabled: true,
    text: "Comando não encontrado.\n\nUse {prefix}menu para visualizar os comandos."
  },

  internalError: {
    enabled: true,
    text: "Ocorreu um erro ao executar o comando."
  },

  permissionDenied: {
    enabled: true,
    text: "Acesso negado.\n\nVocê não possui permissão para utilizar este comando."
  },

  maintenance: {
    enabled: true,
    text: "{name} está em manutenção no momento."
  },

  disabled: {
    enabled: true,
    text: "O sistema do {name} está temporariamente desativado."
  },

  notRegistered: {
    enabled: true,
    text: "Você ainda não possui um personagem.\n\nUse {prefix}iniciar para começar."
  },

  alreadyRegistered: {
    enabled: true,
    text: "Você já possui um personagem.\n\nUse {prefix}perfil para visualizar sua ficha."
  },

  victory: {
    enabled: true,
    text: "Vitória!"
  },

  defeat: {
    enabled: true,
    text: "Você foi derrotado."
  },

  levelUp: {
    enabled: true,
    text: "Você subiu para o nível {level}!"
  }
};

const defaultConfig = {
  name: "UTAH RPG",
  prefix: "P",
  version: "1.0.0",
  description: "RPG de aventura e evolução.",
  image: null,

  enabled: true,
  maintenance: false,

  gifs: {
    enabled: true
  },

  combat: {
    enabled: true,
    criticalEnabled: true
  },

  economy: {
    enabled: true,
    startingCoins: 100
  },

  group: {
    enabled: true
  },

  messages: DEFAULT_MESSAGES,

  menu: {
    enabled: true,
    custom: false,
    text: DEFAULT_MENU
  }
};

function ensureDatabase() {
  const dir = path.dirname(databasePath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, {
      recursive: true
    });
  }

  if (!fs.existsSync(databasePath)) {
    fs.writeFileSync(
      databasePath,
      JSON.stringify(defaultConfig, null, 2)
    );
  }
}

function mergeMessages(data = {}) {
  const savedMessages =
    data.messages &&
    typeof data.messages === "object"
      ? data.messages
      : {};

  const messages = {};

  for (const key of Object.keys(DEFAULT_MESSAGES)) {
    messages[key] = {
      ...DEFAULT_MESSAGES[key],
      ...(savedMessages[key] || {})
    };
  }

  for (const key of Object.keys(savedMessages)) {
    if (!messages[key]) {
      messages[key] = savedMessages[key];
    }
  }

  return messages;
}

function mergeConfig(data = {}) {
  return {
    ...defaultConfig,
    ...data,

    gifs: {
      ...defaultConfig.gifs,
      ...(data.gifs || {})
    },

    combat: {
      ...defaultConfig.combat,
      ...(data.combat || {})
    },

    economy: {
      ...defaultConfig.economy,
      ...(data.economy || {})
    },

    group: {
      ...defaultConfig.group,
      ...(data.group || {})
    },

    messages: mergeMessages(data),

    menu: {
      ...defaultConfig.menu,
      ...(data.menu || {})
    }
  };
}

function loadConfig() {
  ensureDatabase();

  try {
    const data = JSON.parse(
      fs.readFileSync(
        databasePath,
        "utf8"
      )
    );

    const config = mergeConfig(data);

    if (!config.menu.text) {
      config.menu.text = DEFAULT_MENU;
    }

    return config;

  } catch (error) {
    console.error(
      "[CONFIG] Erro ao carregar:",
      error
    );

    return mergeConfig();
  }
}

function saveConfig(config) {
  ensureDatabase();

  const finalConfig =
    mergeConfig(config);

  fs.writeFileSync(
    databasePath,
    JSON.stringify(
      finalConfig,
      null,
      2
    )
  );

  return finalConfig;
}

function updateConfig(data) {
  const config = loadConfig();

  return saveConfig({
    ...config,
    ...data
  });
}

function setConfig(pathString, value) {
  const config = loadConfig();

  const parts =
    pathString.split(".");

  let current = config;

  for (
    let i = 0;
    i < parts.length - 1;
    i++
  ) {
    if (
      !current[parts[i]] ||
      typeof current[parts[i]] !== "object"
    ) {
      current[parts[i]] = {};
    }

    current = current[parts[i]];
  }

  current[
    parts[parts.length - 1]
  ] = value;

  return saveConfig(config);
}

function getConfig(pathString) {
  const config = loadConfig();

  if (!pathString) {
    return config;
  }

  return pathString
    .split(".")
    .reduce(
      (obj, key) => obj?.[key],
      config
    );
}

function getDefaultMenu() {
  return DEFAULT_MENU;
}

function resetMenu() {
  const config = loadConfig();

  config.menu = {
    enabled: true,
    custom: false,
    text: DEFAULT_MENU
  };

  return saveConfig(config);
}

function resetConfig() {
  return saveConfig(
    JSON.parse(
      JSON.stringify(defaultConfig)
    )
  );
}

function getDefaultMessages() {
  return JSON.parse(
    JSON.stringify(DEFAULT_MESSAGES)
  );
}

function resetMessages() {
  const config = loadConfig();

  config.messages =
    getDefaultMessages();

  return saveConfig(config);
}

function resetMessage(key) {
  const config = loadConfig();

  if (!DEFAULT_MESSAGES[key]) {
    return null;
  }

  config.messages[key] =
    JSON.parse(
      JSON.stringify(
        DEFAULT_MESSAGES[key]
      )
    );

  return saveConfig(config);
}

function setMessage(key, text) {
  const config = loadConfig();

  if (!config.messages[key]) {
    config.messages[key] = {
      enabled: true,
      text: ""
    };
  }

  config.messages[key].text =
    String(text);

  return saveConfig(config);
}

function setMessageEnabled(
  key,
  enabled
) {
  const config = loadConfig();

  if (!config.messages[key]) {
    return null;
  }

  config.messages[key].enabled =
    Boolean(enabled);

  return saveConfig(config);
}

function getMessage(key) {
  const config = loadConfig();

  return config.messages[key] || null;
}

module.exports = {
  loadConfig,
  saveConfig,
  updateConfig,
  setConfig,
  getConfig,
  getDefaultMenu,
  resetMenu,
  resetConfig,

  getDefaultMessages,
  resetMessages,
  resetMessage,
  setMessage,
  setMessageEnabled,
  getMessage,

  databasePath
};
