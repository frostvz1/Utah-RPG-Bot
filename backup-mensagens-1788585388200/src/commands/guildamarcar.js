const { loadConfig } = require("../systems/config");
const {
  getUser
} = require("../systems/users");

const {
  getGuildByMember
} = require("../systems/guilds");

const {
  sendGifMessage
} = require("../systems/gifEvents");

const CARGOS_PERMITIDOS = [
  "Mestre",
  "Vice-Mestre",
  "Oficial"
];

async function guildaMarcar(sock, msg, args) {
  const userId =
    msg.key.participant ||
    msg.key.remoteJid;

  const remoteJid =
    msg.key.remoteJid;

  // Só funciona em grupos
  if (!remoteJid.endsWith("@g.us")) {
    return sendGifMessage(
      sock,
      msg,
      "guilda_marcar",
      `O comando ${prefix}guilda marcar só pode ser usado dentro de um grupo.`
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
      "guilda_marcar",
      "Você não pertence a nenhuma guilda."
    );
  }

  // Proteção principal:
  // a guilda só pode ser marcada no grupo onde foi criada.
  if (!guild.groupId) {
    return sendGifMessage(
      sock,
      msg,
      "guilda_marcar",
      "Esta guilda ainda não possui um grupo vinculado.\n\n" +
      "O comando de marcação foi bloqueado por segurança."
    );
  }

  if (guild.groupId !== remoteJid) {
    return sendGifMessage(
      sock,
      msg,
      "guilda_marcar",
      "Este não é o grupo oficial da guilda.\n\n" +
      "A marcação foi bloqueada para evitar marcar membros em outros grupos."
    );
  }

  const member =
    guild.members.find(
      item => item.id === userId
    );

  if (!member) {
    return sendGifMessage(
      sock,
      msg,
      "guilda_marcar",
      "Você não foi encontrado como membro desta guilda."
    );
  }

  if (
    !CARGOS_PERMITIDOS.includes(
      member.role
    )
  ) {
    return sendGifMessage(
      sock,
      msg,
      "guilda_marcar",
      "Você não possui permissão para marcar a guilda.\n\n" +
      "Cargos autorizados:\n" +
      "Mestre\n" +
      "Vice-Mestre\n" +
      "Oficial"
    );
  }

  const outrosMembros =
    guild.members.filter(
      item => item.id !== userId
    );

  if (!outrosMembros.length) {
    return sendGifMessage(
      sock,
      msg,
      "guilda_marcar",
      "Não existem outros membros para marcar."
    );
  }

  const mentions = [];

  const nomes = [];

  for (const guildMember of outrosMembros) {
    if (!guildMember.id) {
      continue;
    }

    mentions.push(
      guildMember.id
    );

    nomes.push(
      `@${guildMember.id.split("@")[0]}`
    );
  }

  if (!mentions.length) {
    return sendGifMessage(
      sock,
      msg,
      "guilda_marcar",
      "Nenhum membro válido foi encontrado para marcação."
    );
  }

  const texto =
    "╔════════════════════════════╗\n" +
    "       MARCAÇÃO DA GUILDA\n" +
    "╚════════════════════════════╝\n\n" +
    `Guilda: ${guild.name}\n` +
    `Responsável: ${member.name}\n` +
    `Cargo: ${member.role}\n\n` +
    nomes.join(" ");

  try {
    await sock.sendMessage(
      remoteJid,
      {
        text: texto,
        mentions
      }
    );

    return;
  } catch (error) {
    console.error(
      "[UTAH RPG] Erro ao marcar membros:",
      error
    );

    return sendGifMessage(
      sock,
      msg,
      "erro",
      "Não foi possível realizar a marcação da guilda."
    );
  }
}

module.exports = guildaMarcar;
