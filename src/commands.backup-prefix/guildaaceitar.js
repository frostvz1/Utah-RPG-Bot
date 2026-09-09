const {
  getUser
} = require("../systems/users");

const {
  getInviteById,
  acceptGuildInvite
} = require("../systems/guilds");

const {
  sendGifMessage
} = require("../systems/gifEvents");

async function guildaAceitar(sock, msg, args) {
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
      "guilda_aceitar",
      "Informe o ID do convite.\n\n" +
      "Exemplo:\n" +
      "${prefix}guilda aceitar INV-..."
    );
  }

  const atual =
    require("../systems/guilds")
      .getGuildByMember(userId);

  if (atual) {
    return sendGifMessage(
      sock,
      msg,
      "guilda_aceitar",
      "Você já pertence a uma guilda.\n\n" +
      "Saia da guilda atual antes de aceitar outro convite."
    );
  }

  const invite =
    getInviteById(
      args[0],
      userId
    );

  if (!invite) {
    return sendGifMessage(
      sock,
      msg,
      "guilda_aceitar",
      "Convite não encontrado, expirado ou inválido."
    );
  }

  const result =
    acceptGuildInvite(
      args[0],
      userId,
      user.name,
      userId
    );

  if (!result.success) {
    return sendGifMessage(
      sock,
      msg,
      "guilda_aceitar",
      "Não foi possível aceitar o convite."
    );
  }

  return sendGifMessage(
    sock,
    msg,
    "guilda_aceitar",
    "╔════════════════════════════╗\n" +
    "        GUILDA ACEITA\n" +
    "╚════════════════════════════╝\n\n" +
    `Guilda: ${result.guild.name}\n` +
    `ID: ${result.guild.id}\n` +
    "Cargo: Recruta\n\n" +
    "Você agora faz parte desta guilda.\n\n" +
    "Use ${prefix}guilda para visualizar seus dados."
  );
}

module.exports = guildaAceitar;
