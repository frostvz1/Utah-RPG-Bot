const { getUser, updateUser } = require("../systems/users");
const { loadConfig } = require("../systems/config");
const { sendGifMessage } = require("../systems/gifEvents");
const { getMessage } = require("../systems/messages");

async function despertar(sock, msg) {
  const remoteJid = msg.key.remoteJid;

  const userId =
    msg.key.participant ||
    remoteJid;

  const user = getUser(userId);

  if (!user.registered) {
    return sendGifMessage(
      sock,
      msg,
      "despertar",
      getMessage("notRegistered") || (`Você ainda não possui um personagem.\n\nUse ${prefix}iniciar para começar sua jornada.`)
    );
  }

  if (!user.class) {
    return sendGifMessage(
      sock,
      msg,
      "despertar",
      "Você precisa escolher uma classe antes de despertar.\n\n" +
      `Use ${prefix}classe.`
    );
  }

  if (user.level < 200) {
    return sendGifMessage(
      sock,
      msg,
      "despertar",
      "╔════════════════════════════╗\n" +
      "          DESPERTAR\n" +
      "╚════════════════════════════╝\n\n" +
      "Seu personagem ainda não pode despertar.\n\n" +
      `Nível atual: ${user.level}\n` +
      "Nível necessário: 200\n\n" +
      `Faltam ${200 - user.level} níveis para o despertar.\n\n` +
      "Continue sua jornada para alcançar o nível 200."
    );
  }

  if (user.awakened) {
    return sendGifMessage(
      sock,
      msg,
      "despertar",
      "╔══════════════════════╗\n" +
      "          DESPERTAR\n" +
      "╚══════════════════════╝\n\n" +
      "Seu personagem já despertou.\n\n" +
      `Nome: ${user.name}\n` +
      `Classe: ${user.class}\n` +
      `Nível: ${user.level}\n\n` +
      "ESTADO: DESPERTADO"
    );
  }

  updateUser(userId, {
    awakened: true,
    awakeningLevel: user.level
  });

  return sendGifMessage(
    sock,
    msg,
    "despertar",
    "╔════════════════════════════╗\n" +
    "        DESPERTAR COMPLETO\n" +
    "╚════════════════════════════╝\n\n" +
    `Nome: ${user.name}\n` +
    `Classe: ${user.class}\n` +
    `Nível: ${user.level}\n\n` +
    "Seu personagem alcançou o nível necessário.\n\n" +
    "O despertar foi concluído.\n\n" +
    "ESTADO: DESPERTADO\n\n" +
    "Novos poderes e sistemas foram desbloqueados."
  );
}

module.exports = despertar;
