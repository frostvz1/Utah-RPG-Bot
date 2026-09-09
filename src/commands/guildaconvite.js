const { loadConfig } = require("../systems/config");
const {
  getUser
} = require("../systems/users");

const {
  getGuildByMember,
  createGuildInvite
} = require("../systems/guilds");

const {
  sendGifMessage
} = require("../systems/gifEvents");

const CARGOS_PERMITIDOS = [
  "Mestre",
  "Vice-Mestre",
  "Oficial"
];

async function guildaConvite(sock, msg, args) {
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

  const guild =
    getGuildByMember(userId);

  if (!guild) {
    return sendGifMessage(
      sock,
      msg,
      "guilda_convite",
      "Você não pertence a nenhuma guilda."
    );
  }

  const member =
    guild.members.find(
      item => item.id === userId
    );

  if (
    !member ||
    !CARGOS_PERMITIDOS.includes(member.role)
  ) {
    return sendGifMessage(
      sock,
      msg,
      "guilda_convite",
      (require("../systems/messages").getMessage("permissionDenied") || "Você não possui permissão para convidar membros.\n\n") +
      "Cargos autorizados:\n" +
      "Mestre\n" +
      "Vice-Mestre\n" +
      "Oficial"
    );
  }

  if (
    guild.members.length >=
    guild.maxMembers
  ) {
    return sendGifMessage(
      sock,
      msg,
      "guilda_convite",
      "A guilda está cheia.\n\n" +
      `Capacidade: ${guild.maxMembers} membros.`
    );
  }

  const mentioned =
    msg.message?.extendedTextMessage
      ?.contextInfo?.mentionedJid || [];

  if (!mentioned.length) {
    return sendGifMessage(
      sock,
      msg,
      "guilda_convite",
      "Você precisa mencionar o usuário que deseja convidar.\n\n" +
      "Exemplo:\n" +
      `${prefix}guilda convite @usuario`
    );
  }

  const targetId =
    mentioned[0];

  if (targetId === userId) {
    return sendGifMessage(
      sock,
      msg,
      "guilda_convite",
      "Você não pode convidar a si mesmo."
    );
  }

  if (
    guild.members.some(
      item => item.id === targetId
    )
  ) {
    return sendGifMessage(
      sock,
      msg,
      "guilda_convite",
      "Este usuário já pertence à guilda."
    );
  }

  const targetUser =
    getUser(targetId);

  if (!targetUser.registered) {
    return sendGifMessage(
      sock,
      msg,
      "guilda_convite",
      "Este usuário ainda não possui um personagem.\n\n" +
      `Ele precisa usar ${prefix}iniciar antes de entrar em uma guilda.`
    );
  }

  const outraGuilda =
    getGuildByMember(targetId);

  if (outraGuilda) {
    return sendGifMessage(
      sock,
      msg,
      "guilda_convite",
      "Este usuário já pertence a outra guilda."
    );
  }

  const result =
    createGuildInvite(
      guild.id,
      {
        id: userId,
        name: member.name
      },
      targetId,
      targetUser.name
    );

  if (!result.success) {
    if (result.reason === "already_invited") {
      return sendGifMessage(
        sock,
        msg,
        "guilda_convite",
        "Este usuário já possui um convite pendente para esta guilda."
      );
    }

    return sendGifMessage(
      sock,
      msg,
      "erro",
      "Não foi possível criar o convite."
    );
  }

  return sendGifMessage(
    sock,
    msg,
    "guilda_convite",
    "╔════════════════════════════╗\n" +
    "        CONVITE ENVIADO\n" +
    "╚════════════════════════════╝\n\n" +
    `Guilda: ${guild.name}\n` +
    `Convidado: ${targetUser.name}\n` +
    `Por: ${member.name}\n\n` +
    "O convite ficará disponível por 24 horas.\n\n" +
    "O usuário poderá usar:\n" +
    `${prefix}guilda convites`
  );
}

module.exports = guildaConvite;
