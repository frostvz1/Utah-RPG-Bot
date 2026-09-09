const fs = require("fs");

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

async function guilda(sock, msg, args) {
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
      "guilda",
      "╔════════════════════════════╗\n" +
      "           GUILDA\n" +
      "╚════════════════════════════╝\n\n" +
      "Você atualmente não pertence a nenhuma guilda.\n\n" +
      "Para criar uma:\n" +
      "${prefix}criarguilda <nome>\n\n" +
      "Custo: 500 moedas"
    );
  }

  const member =
    guild.members.find(
      item =>
        item.id === userId
    );

  const xpRequired =
    guild.level * 1000;

  const text =
    "╔════════════════════════════╗\n" +
    "           GUILDA\n" +
    "╚════════════════════════════╝\n\n" +

    `Nome: ${guild.name}\n` +
    `ID: ${guild.id}\n\n` +

    "INFORMAÇÕES\n" +
    `Nível: ${guild.level}\n` +
    `XP: ${guild.xp}/${xpRequired}\n` +
    `Membros: ${guild.members.length}/${guild.maxMembers}\n` +
    `Categoria: ${guild.category}\n\n` +

    "CRIADOR\n" +
    `Nome: ${guild.creator.name}\n` +
    `Contato: ${
      guild.creator.showContact
        ? guild.creator.contact
        : "Privado"
    }\n\n` +

    "SUA POSIÇÃO\n" +
    `Cargo: ${member?.role || "Membro"}\n\n` +

    "GUILDA\n" +
    `Cofre: ${guild.coins} moedas\n` +
    `Vitórias: ${guild.victories}\n` +
    `Derrotas: ${guild.defeats}\n` +
    `Missões concluídas: ${guild.completedMissions}\n` +
    `Data de criação: ${formatDate(guild.createdAt)}\n\n` +

    "DESCRIÇÃO\n" +
    `${guild.description || "Nenhuma descrição definida."}\n\n` +

    "LEMA\n" +
    `${guild.motto || "Nenhum lema definido."}\n\n` +

    "COMANDOS\n" +
    "${prefix}guilda membros\n" +
    "${prefix}guilda marcar\n" +
    "${prefix}guilda informações\n" +
    "Pdadog";

  if (
    guild.image &&
    guild.image.file &&
    fs.existsSync(guild.image.file)
  ) {
    try {
      const buffer =
        fs.readFileSync(
          guild.image.file
        );

      const tipo =
        (
          guild.image.type ||
          ""
        ).toLowerCase();

      if (tipo === "gif") {
        return sock.sendMessage(
          msg.key.remoteJid,
          {
            video: buffer,
            gifPlayback: true,
            caption: text
          }
        );
      }

      return sock.sendMessage(
        msg.key.remoteJid,
        {
          image: buffer,
          caption: text
        }
      );

    } catch (error) {
      console.error(
        "[UTAH RPG] Erro ao carregar imagem da guilda:",
        error
      );
    }
  }

  return sendGifMessage(
    sock,
    msg,
    "guilda",
    text
  );
}

module.exports = guilda;
