const { loadConfig } = require("../systems/config");

const {
  getUser
} = require("../systems/users");

const {
  getPendingInvites
} = require("../systems/guilds");

const {
  sendGifMessage
} = require("../systems/gifEvents");

async function guildaConvites(sock, msg, args) {
  const config = loadConfig();
  const prefix = config.prefix || "P";

  const userId =
    msg.key.participant ||
    msg.key.remoteJid;

  const user =
    getUser(userId);

  if (!user.registered) {
    return sendGifMessage(
      sock,
      msg,
      "erro",
      "Você ainda não possui um personagem.\n\n" +
      `Use ${prefix}iniciar para começar sua jornada.`
    );
  }

  const invites =
    getPendingInvites(userId);

  if (!invites.length) {
    return sendGifMessage(
      sock,
      msg,
      "guilda_convites",
      "╔════════════════════════════╗\n" +
      "       CONVITES DE GUILDA\n" +
      "╚════════════════════════════╝\n\n" +
      "Você não possui convites pendentes."
    );
  }

  const lista =
    invites.map(
      (invite, index) =>
        `[${index + 1}] ${invite.guildName}\n` +
        `    Convidado por: ${invite.fromName}\n` +
        "    Validade: 24 horas"
    );

  const text =
    "╔════════════════════════════╗\n" +
    "       CONVITES DE GUILDA\n" +
    "╚════════════════════════════╝\n\n" +
    lista.join("\n\n") +
    "\n\n" +
    "Para aceitar:\n" +
    `${prefix}guilda aceitar 1\n\n` +
    "Para recusar:\n" +
    `${prefix}guilda recusar 1`;

  return sendGifMessage(
    sock,
    msg,
    "guilda_convites",
    text
  );
}

module.exports = guildaConvites;
