const { sendGifMessage } = require("../systems/gifEvents");
const { loadConfig } = require("../systems/config");

function montarMenu(config) {
  const prefix = config.prefix || "P";
  const name = config.name || "UTAH RPG";

  const text =
    "╔════════════════════════════╗\n" +
    `          ${name}\n` +
    "╚════════════════════════════╝\n\n" +

    "PERSONAGEM\n" +
    `${prefix}iniciar\n` +
    `${prefix}perfil\n` +
    `${prefix}meuperfil\n` +
    `${prefix}status\n` +
    `${prefix}classe\n` +
    `${prefix}despertar\n\n` +

    "AVENTURA\n" +
    `${prefix}aventura explorar\n` +
    `${prefix}aventura mapa\n\n` +

    "COMBATE\n" +
    `${prefix}atacar\n` +
    `${prefix}habilidade\n\n` +

    "RECUPERAÇÃO\n" +
    `${prefix}descansar\n` +
    `${prefix}hospital\n\n` +

    "INVENTÁRIO\n" +
    `${prefix}item\n` +
    `${prefix}item usar <item>\n\n` +

    "LOJA\n" +
    `${prefix}loja\n\n` +

    "GUILDAS\n" +
    `${prefix}criarguilda <nome>\n` +
    `${prefix}guilda\n` +
    `${prefix}guilda membros\n` +
    `${prefix}guilda marcar\n` +
    `${prefix}guilda convite\n` +
    `${prefix}guilda convites\n` +
    `${prefix}guilda aceitar <id>\n` +
    `${prefix}guilda recusar <id>\n` +
    `${prefix}guilda vincular\n\n` +

    "OUTROS\n" +
    `${prefix}gif\n` +
    `${prefix}testegif\n\n` +

    "ADMINISTRAÇÃO\n" +
    `${prefix}config — Configurações (ADM)\n` +
    `${prefix}configowner — Configurações do Owner\n\n` +

    "DESPERTAR\n" +
    `${prefix}despertar\n` +
    "Requer nível 200";

  return text;
}

async function menu(sock, msg) {
  const config = loadConfig();

  if (config.menu?.enabled === false) {
    return sendGifMessage(
      sock,
      msg,
      "erro",
      "O menu está desativado pelo Owner."
    );
  }

  const text = montarMenu(config);

  return sendGifMessage(
    sock,
    msg,
    "menu",
    text
  );
}

module.exports = menu;
