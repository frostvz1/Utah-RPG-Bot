const { loadConfig } = require("../systems/config");
const {
  getUser
} = require("../systems/users");

const {
  rejectGuildInvite
} = require("../systems/guilds");

const {
  sendGifMessage
} = require("../systems/gifEvents");

async function guildaRecusar(sock, msg, args) {
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
      "Você ainda não possui um personagem."
    );
  }

  if (!args[0]) {
    return sendGifMessage(
      sock,
      msg,
      "guilda_recusar",
      "Informe o ID do convite.\n\n" +
      "Exemplo:\n" +
      `${prefix}guilda recusar INV-...`
    );
  }

  const result =
    rejectGuildInvite(
      args[0],
      userId
    );

  if (!result.success) {
    return sendGifMessage(
      sock,
      msg,
      "guilda_recusar",
      "Convite não encontrado ou já processado."
    );
  }

  return sendGifMessage(
    sock,
    msg,
    "guilda_recusar",
    "Convite recusado com sucesso."
  );
}

module.exports = guildaRecusar;
