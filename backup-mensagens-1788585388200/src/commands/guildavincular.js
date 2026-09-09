const { loadConfig } = require("../systems/config");
const {
  getUser
} = require("../systems/users");

const {
  getGuildByMember,
  updateGuild
} = require("../systems/guilds");

const {
  sendGifMessage
} = require("../systems/gifEvents");

async function guildaVincular(sock, msg, args) {
  const userId =
    msg.key.participant ||
    msg.key.remoteJid;

  const remoteJid =
    msg.key.remoteJid;

  if (!remoteJid.endsWith("@g.us")) {
    return sendGifMessage(
      sock,
      msg,
      "guilda",
      `O comando ${prefix}guilda vincular só pode ser usado dentro de um grupo.`
    );
  }

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

  const guild =
    getGuildByMember(userId);

  if (!guild) {
    return sendGifMessage(
      sock,
      msg,
      "guilda",
      "Você não pertence a nenhuma guilda."
    );
  }

  const member =
    guild.members.find(
      item => item.id === userId
    );

  if (!member || member.role !== "Mestre") {
    return sendGifMessage(
      sock,
      msg,
      "guilda",
      "Somente o Mestre da guilda pode vincular o grupo."
    );
  }

  if (guild.groupId === remoteJid) {
    return sendGifMessage(
      sock,
      msg,
      "guilda",
      "Este grupo já está vinculado à guilda."
    );
  }

  if (guild.groupId) {
    return sendGifMessage(
      sock,
      msg,
      "guilda",
      "Esta guilda já possui um grupo oficial vinculado.\n\n" +
      "Por segurança, o vínculo não pode ser alterado por este comando."
    );
  }

  updateGuild(
    guild.id,
    {
      groupId: remoteJid
    }
  );

  return sendGifMessage(
    sock,
    msg,
    "guilda",
    "╔════════════════════════════╗\n" +
    "       GRUPO VINCULADO\n" +
    "╚════════════════════════════╝\n\n" +
    `Guilda: ${guild.name}\n` +
    `ID: ${guild.id}\n\n` +
    "Este grupo agora é o grupo oficial da guilda.\n\n" +
    `O comando ${prefix}guilda marcar só poderá realizar marcações aqui.`
  );
}

module.exports = guildaVincular;
