const {
  getUser
} = require("../systems/users");

const {
  getGuildByMember
} = require("../systems/guilds");

const {
  sendGifMessage
} = require("../systems/gifEvents");

function formatDate(timestamp) {
  if (!timestamp) {
    return "Não disponível";
  }

  return new Date(timestamp)
    .toLocaleDateString("pt-BR");
}

async function guildaMembros(
  sock,
  msg,
  args
) {
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
      "Use ${prefix}iniciar para começar sua jornada."
    );
  }

  const guild =
    getGuildByMember(userId);

  if (!guild) {
    return sendGifMessage(
      sock,
      msg,
      "guilda_membros",
      "Você não pertence a nenhuma guilda."
    );
  }

  if (!guild.members.length) {
    return sendGifMessage(
      sock,
      msg,
      "guilda_membros",
      "A guilda ainda não possui membros."
    );
  }

  const linhas =
    guild.members.map(
      (member, index) => {
        const memberUser =
          getUser(member.id);

        return (
          `${index + 1}. ${member.name}\n` +
          `Cargo: ${member.role}\n` +
          `Nível: ${memberUser.level}\n` +
          `Contato: ${member.contact || "Não disponível"}\n` +
          `Entrada: ${formatDate(member.joinedAt)}`
        );
      }
    );

  const text =
    "╔════════════════════════════╗\n" +
    "       MEMBROS DA GUILDA\n" +
    "╚════════════════════════════╝\n\n" +

    `Guilda: ${guild.name}\n` +
    `Membros: ${guild.members.length}/${guild.maxMembers}\n\n` +

    linhas.join("\n\n");

  return sendGifMessage(
    sock,
    msg,
    "guilda_membros",
    text
  );
}

module.exports = guildaMembros;
