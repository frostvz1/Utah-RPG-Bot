const { getUser, updateUser } = require("../systems/users");
const { loadConfig } = require("../systems/config");
const { createGuild, getGuildByMember } = require("../systems/guilds");
const { sendGifMessage } = require("../systems/gifEvents");

async function criarguilda(sock, msg, args) {
  const userId = msg.key.participant || msg.key.remoteJid;
  const user = getUser(userId);

  if (!user.registered) {
    return sendGifMessage(
      sock,
      msg,
      "guilda",
      "Você ainda não possui um personagem.\n\n" +
      `Use ${prefix}iniciar para começar sua jornada.`
    );
  }

  const existingGuild = getGuildByMember(userId);

  if (existingGuild) {
    return sendGifMessage(
      sock,
      msg,
      "guilda",
      "Você já pertence a uma guilda.\n\n" +
      `Guilda: ${existingGuild.name}\n` +
      `ID: ${existingGuild.id}\n\n` +
      "Saia da sua guilda antes de criar outra."
    );
  }

  const name = args.join(" ").trim();

  if (!name) {
    return sendGifMessage(
      sock,
      msg,
      "guilda",
      "╔════════════════════════════╗\n" +
      "        CRIAR GUILDA\n" +
      "╚════════════════════════════╝\n\n" +
      "Informe o nome da guilda.\n\n" +
      "Exemplo:\n" +
      `${prefix}criarguilda Cavaleiros do Eclipse\n\n` +
      "Custo de criação: 500 moedas"
    );
  }

  if (name.length < 3 || name.length > 30) {
    return sendGifMessage(
      sock,
      msg,
      "guilda",
      "O nome da guilda deve ter entre 3 e 30 caracteres."
    );
  }

  const custo = 500;

  if (user.coins < custo) {
    return sendGifMessage(
      sock,
      msg,
      "guilda",
      "╔════════════════════════════╗\n" +
      "        CRIAR GUILDA\n" +
      "╚════════════════════════════╝\n\n" +
      "Moedas insuficientes.\n\n" +
      `Custo: ${custo} moedas\n` +
      `Saldo atual: ${user.coins} moedas\n` +
      `Faltam: ${custo - user.coins} moedas`
    );
  }

  const contact =
    (userId.split("@")[0] || "")
      .replace(/\D/g, "");

  const groupId =
    msg.key.remoteJid.endsWith("@g.us")
      ? msg.key.remoteJid
      : null;

  const guild = createGuild({
    creatorId: userId,
    creatorName: user.name,
    creatorContact: contact,
    groupId,
    name
  });

  updateUser(userId, {
    coins: user.coins - custo,
    guildId: guild.id
  });

  return sendGifMessage(
    sock,
    msg,
    "guilda",
    "╔════════════════════════════╗\n" +
    "       GUILDA CRIADA\n" +
    "╚════════════════════════════╝\n\n" +
    `Nome: ${guild.name}\n` +
    `ID: ${guild.id}\n\n` +
    `Mestre: ${user.name}\n` +
    `Membros: 1/${guild.maxMembers}\n` +
    `Nível: ${guild.level}\n` +
    `XP: ${guild.xp}/${guild.level * 1000}\n` +
    `Cofre: ${guild.coins} moedas\n\n` +
    `Custo pago: ${custo} moedas\n` +
    `Saldo restante: ${user.coins - custo} moedas\n\n` +
    "Você agora é o Mestre da Guilda.\n\n" +
    `Use ${prefix}guilda para visualizar sua guilda.`
  );
}

module.exports = criarguilda;
