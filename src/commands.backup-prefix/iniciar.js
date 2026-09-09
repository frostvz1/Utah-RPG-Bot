const { getUser, updateUser } = require("../systems/users");
const { sendGifMessage } = require("../systems/gifEvents");
const { loadConfig } = require("../systems/config");

async function iniciar(sock, msg, args) {
  const userId =
    msg.key.participant ||
    msg.key.remoteJid;

  const user = getUser(userId);

  if (user.registered) {
    return sendGifMessage(
      sock,
      msg,
      "iniciar",
      "Você já possui um personagem.\n\n" +
      `Use ${loadConfig().prefix || "P"}perfil para visualizar sua ficha.`
    );
  }

  const name =
    args.length > 0
      ? args.join(" ")
      : "Aventureiro";

  updateUser(userId, {
    registered: true,
    name
  });

  const text =
    "╔══════════════════════╗\n" +
    "        UTAH RPG\n" +
    "╚══════════════════════╝\n\n" +
    "PERSONAGEM CRIADO\n\n" +
    `Nome: ${name}\n` +
    "Nível: 1\n" +
    "XP: 0/100\n\n" +
    "Agora escolha sua classe:\n\n" +
    "1. Guerreiro\n" +
    "2. Mago\n" +
    "3. Assassino\n" +
    "4. Arqueiro\n" +
    "5. Paladino\n\n" +
    "Use:\n" +
    `${loadConfig().prefix || "P"}classe escolher 1`;

  return sendGifMessage(
    sock,
    msg,
    "iniciar",
    text
  );
}

module.exports = iniciar;
