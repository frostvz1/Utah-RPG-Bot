const { loadConfig } = require("../systems/config");

const {
  getUser
} = require("../systems/users");

const {
  getInviteById,
  getPendingInvites,
  acceptGuildInvite,
  getGuildByMember
} = require("../systems/guilds");

const {
  sendGifMessage
} = require("../systems/gifEvents");

async function guildaAceitar(sock, msg, args) {
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
      "Você ainda não possui um personagem."
    );
  }

  if (!args[0]) {
    return sendGifMessage(
      sock,
      msg,
      "guilda_aceitar",
      "Informe o número do convite.\n\n" +
      "Exemplo:\n" +
      `${prefix}guilda aceitar 1\n\n` +
      "Use " +
      `${prefix}guilda convites para visualizar seus convites.`
    );
  }

  const atual =
    getGuildByMember(userId);

  if (atual) {
    return sendGifMessage(
      sock,
      msg,
      "guilda_aceitar",
      "Você já pertence a uma guilda.\n\n" +
      "Saia da guilda atual antes de aceitar outro convite."
    );
  }

  const entrada =
    String(args[0]).trim();

  let inviteId = entrada;

  /*
   * Se o jogador informou um número,
   * converte o número para o ID real do convite.
   */
  if (/^\d+$/.test(entrada)) {
    const numero =
      Number(entrada);

    const invites =
      getPendingInvites(userId);

    const invite =
      invites[numero - 1];

    if (!invite) {
      return sendGifMessage(
        sock,
        msg,
        "guilda_aceitar",
        "Convite não encontrado.\n\n" +
        `Use ${prefix}guilda convites para visualizar os convites disponíveis.`
      );
    }

    inviteId =
      invite.id;
  }

  const invite =
    getInviteById(
      inviteId,
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
      inviteId,
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
    `Use ${prefix}guilda para visualizar seus dados.`
  );
}

module.exports = guildaAceitar;
