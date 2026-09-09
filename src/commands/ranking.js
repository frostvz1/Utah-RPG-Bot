const {
  getUser
} = require("../systems/users");

const {
  sendGifMessage
} = require("../systems/gifEvents");

async function ranking(sock, msg) {
  const groupId = msg.key.remoteJid;

  if (!groupId || !groupId.endsWith("@g.us")) {
    return sendGifMessage(
      sock,
      msg,
      "erro",
      "Este comando só pode ser usado em grupos."
    );
  }

  let metadata;

  try {
    metadata = await sock.groupMetadata(groupId);
  } catch (error) {
    console.error("[UTAH RPG] Erro ao obter membros do grupo:", error);

    return sendGifMessage(
      sock,
      msg,
      "erro",
      "Não foi possível obter os membros deste grupo."
    );
  }

  const jogadores = [];

  for (const participant of metadata.participants || []) {
    const userId =
      participant.id ||
      participant.jid ||
      participant.phoneNumber;

    if (!userId) continue;

    const user = getUser(userId);

    if (!user.registered) continue;

    jogadores.push({
      id: userId,
      name: user.name || userId.split("@")[0],
      level: Number(user.level) || 1,
      xp: Number(user.xp) || 0,
      coins: Number(user.coins) || 0,
      victories: Number(user.victories) || 0,
      defeats: Number(user.defeats) || 0
    });
  }

  jogadores.sort((a, b) =>
    b.level - a.level ||
    b.xp - a.xp ||
    b.victories - a.victories ||
    a.defeats - b.defeats
  );

  if (!jogadores.length) {
    return sendGifMessage(
      sock,
      msg,
      "erro",
      "Nenhum jogador registrado foi encontrado neste grupo."
    );
  }

  const top = jogadores.slice(0, 10);

  const linhas = top.map((player, index) => {
    return (
      `${index + 1}. ${player.name}\n` +
      `Nível: ${player.level} | XP: ${player.xp}\n` +
      `Saldo: ${player.coins.toLocaleString("pt-BR")}\n` +
      `Vitórias: ${player.victories} | Derrotas: ${player.defeats}`
    );
  });

  const texto =
    "╔════════════════════════════╗\n" +
    "          RANKING DOS JOGADORES\n" +
    "╚════════════════════════════╝\n\n" +
    `Grupo: ${metadata.subject || "Grupo atual"}\n` +
    `Jogadores registrados: ${jogadores.length}\n\n` +
    linhas.join("\n\n");

  return sendGifMessage(
    sock,
    msg,
    "ranking",
    texto
  );
}

module.exports = ranking;
