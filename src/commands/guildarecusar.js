const { loadConfig } = require("../systems/config");

const {
  getUser
} = require("../systems/users");

const {
  getPendingInvites,
  rejectGuildInvite
} = require("../systems/guilds");

const {
  sendGifMessage
} = require("../systems/gifEvents");

async function guildaRecusar(sock, msg, args) {
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
      "guilda_recusar",
      "Informe o número do convite.\n\n" +
      "Exemplo:\n" +
      `${prefix}guilda recusar 1\n\n` +
      "Use " +
      `${prefix}guilda convites para visualizar seus convites.`
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
        "guilda_recusar",
        "Convite não encontrado.\n\n" +
        `Use ${prefix}guilda convites para visualizar os convites disponíveis.`
      );
    }

    inviteId =
      invite.id;
  }

  const result =
    rejectGuildInvite(
      inviteId,
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
    "╔════════════════════════════╗\n" +
    "       CONVITE RECUSADO\n" +
    "╚════════════════════════════╝\n\n" +
    "O convite foi recusado com sucesso."
  );
}

module.exports = guildaRecusar;
