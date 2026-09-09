const {
  getUser
} = require("../systems/users");

const {
  loadGuilds
} = require("../systems/guilds");

const {
  sendGifMessage
} = require("../systems/gifEvents");

async function rankg(sock, msg) {
  const groupId = msg.key.remoteJid;

  if (!groupId || !groupId.endsWith("@g.us")) {
    return sendGifMessage(
      sock,
      msg,
      "erro",
      "Este comando só pode ser usado em grupos."
    );
  }

  const guilds = loadGuilds();

  const ranking = [];

  for (const guild of Object.values(guilds)) {
    if (!guild) continue;

    if (guild.groupId !== groupId) continue;

    let level = 0;
    let xp = 0;
    let coins = 0;
    let victories = 0;
    let defeats = 0;
    let members = 0;

    for (const member of guild.members || []) {
      if (!member?.id) continue;

      const user = getUser(member.id);

      if (!user.registered) continue;

      level += Number(user.level) || 0;
      xp += Number(user.xp) || 0;
      coins += Number(user.coins) || 0;
      victories += Number(user.victories) || 0;
      defeats += Number(user.defeats) || 0;

      members++;
    }

    ranking.push({
      name: guild.name || "Guilda sem nome",
      level,
      xp,
      coins,
      victories,
      defeats,
      members
    });
  }

  ranking.sort((a, b) =>
    b.level - a.level ||
    b.xp - a.xp ||
    b.victories - a.victories ||
    a.defeats - b.defeats
  );

  if (!ranking.length) {
    return sendGifMessage(
      sock,
      msg,
      "erro",
      "Nenhuma guilda está vinculada a este grupo."
    );
  }

  const top = ranking.slice(0, 10);

  const linhas = top.map((guild, index) => {
    return (
      `${index + 1}. ${guild.name}\n` +
      `Membros: ${guild.members}\n` +
      `Nível total: ${guild.level} | XP total: ${guild.xp}\n` +
      `Saldo total: ${guild.coins.toLocaleString("pt-BR")}\n` +
      `Vitórias: ${guild.victories} | Derrotas: ${guild.defeats}`
    );
  });

  const texto =
    "╔════════════════════════════╗\n" +
    "             RANKING DE GUILDAS\n" +
    "╚════════════════════════════╝\n\n" +
    linhas.join("\n\n");

  return sendGifMessage(
    sock,
    msg,
    "rankg",
    texto
  );
}

module.exports = rankg;
