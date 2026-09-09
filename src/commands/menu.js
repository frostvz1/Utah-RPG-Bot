const { sendGifMessage } = require("../systems/gifEvents");
const { loadConfig } = require("../systems/config");

function substituirVariaveis(text, config) {
  const prefix = config.prefix || ";";
  const name = config.name || "UTAH RPG";

  return String(text)
    .replace(/\{prefix\}/g, prefix)
    .replace(/\{name\}/g, name);
}

function montarMenu(config) {
  /*
   * Se existir um menu personalizado definido pelo Owner,
   * ele será utilizado.
   */
  if (
    config.menu?.custom === true &&
    config.menu?.text
  ) {
    return substituirVariaveis(
      config.menu.text,
      config
    );
  }

  const prefix = config.prefix || ";";
  const name = config.name || "UTAH RPG";

  const separador =
    "━━━━━━━━━━━━━━━━━━━━";

  const text =
    "╔════════════════════════════╗\n" +
    `          ${name}\n` +
    "╚════════════════════════════╝\n\n" +

    `${prefix}\n\n` +

    "𝐃𝐚𝐝𝐨𝐬 𝐝𝐨 𝐂𝐫𝐢𝐚𝐝𝐨𝐫\n" +
    "𝐒𝐚𝐞𝐥 (𝟕𝟓𝟗𝟗𝟏𝟏𝟗𝟎𝟗𝟕𝟐)\n" +
    "𝐈𝐠: 𝐝_𝐚𝐫𝐭𝐳𝟏𝟖\n" +
    "𝐓𝐭𝐤: 𝐦𝐮𝐤𝐚_𝐬𝐱\n\n" +

    "𝐃𝐮́𝐯𝐢𝐝𝐚𝐬, 𝐩𝐞𝐝𝐢𝐝𝐨𝐬, 𝐚𝐥𝐮𝐠𝐮𝐞́𝐢𝐬 𝐝𝐞 𝐁𝐎𝐓𝐬 𝐨𝐮 " +
    "𝐪𝐮𝐚𝐥𝐪𝐮𝐞𝐫 𝐨𝐮𝐭𝐫𝐚 𝐢𝐧𝐟𝐨𝐫𝐦𝐚𝐜̧𝐚̃𝐨, 𝐜𝐨𝐧𝐭𝐚𝐭𝐞 " +
    "𝐪𝐮𝐮𝐚𝐥𝐪𝐮𝐞𝐫 𝐫𝐞𝐝𝐞 𝐬𝐨𝐜𝐢𝐚𝐥 𝐚𝐜𝐢𝐦𝐚.\n" +
    "𝐍𝐚̃𝐨 𝐛𝐮𝐫𝐥𝐞 𝐨 𝐬𝐢𝐬𝐭𝐞𝐦𝐚, 𝐬𝐞 𝐣𝐮𝐧𝐭𝐞 𝐚 𝐞𝐥𝐞!\n\n" +

    separador + "\n" +
    "𝐏𝐄𝐑𝐒𝐎𝐍𝐀𝐆𝐄𝐌\n" +
    separador + "\n\n" +

    `${prefix}𝐢𝐧𝐢𝐜𝐢𝐚𝐫\n` +
    `${prefix}𝐩𝐞𝐫𝐟𝐢𝐥\n` +
    `${prefix}𝐦𝐞𝐮𝐩𝐞𝐫𝐟𝐢𝐥\n` +
    `${prefix}𝐬𝐭𝐚𝐭𝐮𝐬\n` +
    `${prefix}𝐜𝐥𝐚𝐬𝐬𝐞\n` +
    `${prefix}𝐝𝐞𝐬𝐩𝐞𝐫𝐭𝐚𝐫\n\n` +

    separador + "\n" +
    "𝐀𝐕𝐄𝐍𝐓𝐔𝐑𝐀\n" +
    separador + "\n\n" +

    `${prefix}𝐚𝐯𝐞𝐧𝐭𝐮𝐫𝐚 𝐞𝐱𝐩𝐥𝐨𝐫𝐚𝐫\n` +
    `${prefix}𝐚𝐯𝐞𝐧𝐭𝐮𝐫𝐚 𝐦𝐚𝐩𝐚\n\n` +

    separador + "\n" +
    "𝐂𝐎𝐌𝐁𝐀𝐓𝐄\n" +
    separador + "\n\n" +

    "𝐏𝐯𝐄\n" +
    `${prefix}𝐚𝐭𝐚𝐜𝐚𝐫\n\n` +

    "𝐏𝐯𝐏\n" +
    `${prefix}𝐜𝐨𝐦𝐛𝐚𝐭𝐞 @𝐮𝐬𝐮𝐚́𝐫𝐢𝐨\n` +
    `${prefix}𝐜𝐨𝐦𝐛𝐚𝐭𝐞 @𝐮𝐬𝐮𝐚́𝐫𝐢𝐨 𝐡𝐚𝐛𝐢𝐥𝐢𝐝𝐚𝐝𝐞 𝟏\n\n` +

    "𝐇𝐀𝐁𝐈𝐋𝐈𝐃𝐀𝐃𝐄𝐒\n" +
    `${prefix}𝐡𝐚𝐛𝐢𝐥𝐢𝐝𝐚𝐝𝐞\n` +
    `${prefix}𝐡𝐚𝐛𝐢𝐥𝐢𝐝𝐚𝐝𝐞 𝐫𝐞𝐦𝐨𝐯𝐞𝐫 𝟏\n\n` +

    separador + "\n" +
    "𝐑𝐄𝐂𝐔𝐏𝐄𝐑𝐀𝐂̧𝐀̃𝐎\n" +
    separador + "\n\n" +

    `${prefix}𝐝𝐞𝐬𝐜𝐚𝐧𝐬𝐚𝐫\n` +
    `${prefix}𝐡𝐨𝐬𝐩𝐢𝐭𝐚𝐥\n\n` +

    separador + "\n" +
    "𝐈𝐍𝐕𝐄𝐍𝐓𝐀́𝐑𝐈𝐎\n" +
    separador + "\n\n" +

    `${prefix}𝐢𝐭𝐞𝐦\n` +
    `${prefix}𝐢𝐭𝐞𝐦 𝐮𝐬𝐚𝐫 <𝐢𝐭𝐞𝐦>\n` +
    `${prefix}𝐥𝐨𝐣𝐚\n\n` +

    separador + "\n" +
    "𝐄𝐂𝐎𝐍𝐎𝐌𝐈𝐀\n" +
    separador + "\n\n" +

    `${prefix}𝐭𝐫𝐚𝐧𝐬𝐟𝐞𝐫𝐢𝐫 @𝐮𝐬𝐮𝐚́𝐫𝐢𝐨 <𝐯𝐚𝐥𝐨𝐫>\n\n` +

    separador + "\n" +
    "𝐑𝐀𝐍𝐊𝐈𝐍𝐆𝐒\n" +
    separador + "\n\n" +

    "𝐉𝐎𝐆𝐀𝐃𝐎𝐑𝐄𝐒\n" +
    `${prefix}𝐫𝐚𝐧𝐤𝐢𝐧𝐠\n\n` +

    "𝐆𝐔𝐈𝐋𝐃𝐀𝐒\n" +
    `${prefix}𝐫𝐚𝐧𝐤𝐠\n\n` +

    separador + "\n" +
    "𝐆𝐔𝐈𝐋𝐃𝐀𝐒\n" +
    separador + "\n\n" +

    `${prefix}𝐜𝐫𝐢𝐚𝐫𝐠𝐮𝐢𝐥𝐝𝐚 <𝐧𝐨𝐦𝐞>\n` +
    `${prefix}𝐠𝐮𝐢𝐥𝐝𝐚\n` +
    `${prefix}𝐠𝐮𝐢𝐥𝐝𝐚 𝐦𝐞𝐦𝐛𝐫𝐨𝐬\n` +
    `${prefix}𝐠𝐮𝐢𝐥𝐝𝐚 𝐦𝐚𝐫𝐜𝐚𝐫\n` +
    `${prefix}𝐠𝐮𝐢𝐥𝐝𝐚 𝐜𝐨𝐧𝐯𝐢𝐭𝐞\n` +
    `${prefix}𝐠𝐮𝐢𝐥𝐝𝐚 𝐜𝐨𝐧𝐯𝐢𝐭𝐞𝐬\n` +
    `${prefix}𝐠𝐮𝐢𝐥𝐝𝐚 𝐚𝐜𝐞𝐢𝐭𝐚𝐫 <𝐢𝐝>\n` +
    `${prefix}𝐠𝐮𝐢𝐥𝐝𝐚 𝐫𝐞𝐜𝐮𝐬𝐚𝐫 <𝐢𝐝>\n` +
    `${prefix}𝐠𝐮𝐢𝐥𝐝𝐚 𝐯𝐢𝐧𝐜𝐮𝐥𝐚𝐫\n\n` +

    separador + "\n" +
    "𝐎𝐔𝐓𝐑𝐎𝐒\n" +
    separador + "\n\n" +

    `${prefix}𝐠𝐢𝐟\n` +
    `${prefix}𝐭𝐞𝐬𝐭𝐞𝐠𝐢𝐟\n\n` +

    separador + "\n" +
    "𝐀𝐃𝐌𝐈𝐍𝐈𝐒𝐓𝐑𝐀𝐂̧𝐀̃𝐎\n" +
    separador + "\n\n" +

    `${prefix}𝐜𝐨𝐧𝐟𝐢𝐠 — 𝐂𝐨𝐧𝐟𝐢𝐠𝐮𝐫𝐚𝐜̧𝐨̃𝐞𝐬 (𝐀𝐃𝐌)\n` +
    `${prefix}𝐜𝐨𝐧𝐟𝐢𝐠𝐨𝐰𝐧𝐞𝐫 — 𝐂𝐨𝐧𝐟𝐢𝐠𝐮𝐫𝐚𝐜̧𝐨̃𝐞𝐬 𝐝𝐨 𝐎𝐰𝐧𝐞𝐫\n\n` +

    separador + "\n" +
    "𝐃𝐄𝐒𝐏𝐄𝐑𝐓𝐀𝐑\n" +
    separador + "\n\n" +

    `${prefix}𝐝𝐞𝐬𝐩𝐞𝐫𝐭𝐚𝐫\n\n` +
    "𝐑𝐞𝐪𝐮𝐢𝐬𝐢𝐭𝐨: 𝐧𝐢́𝐯𝐞𝐥 𝟐𝟎𝟎";

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
