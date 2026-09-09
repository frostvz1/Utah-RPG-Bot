const { getUser } = require("../systems/users");
const { loadConfig } = require("../systems/config");
const { sendGifMessage } = require("../systems/gifEvents");

async function status(sock, msg) {
  const userId =
    msg.key.participant ||
    msg.key.remoteJid;

  const user = getUser(userId);

  if (!user.registered) {
    return sendGifMessage(
      sock,
      msg,
      "status",
      "Você ainda não possui um personagem.\n\n" +
      `Use ${prefix}iniciar para começar sua jornada.`
    );
  }

  const xpNext = user.level * 100;
  const xpProgress = Math.min(user.xp, xpNext);

  const hpPercent = user.maxHp > 0
    ? Math.floor((user.hp / user.maxHp) * 100)
    : 0;

  const energyPercent = user.maxEnergy > 0
    ? Math.floor((user.energy / user.maxEnergy) * 100)
    : 0;

  const text =
    "╔════════════════════════════╗\n" +
    "          STATUS\n" +
    "╚════════════════════════════╝\n\n" +

    "PERSONAGEM\n" +
    `Nome: ${user.name}\n` +
    `Classe: ${user.class || "Não escolhida"}\n` +
    `Nível: ${user.level}\n` +
    `XP: ${xpProgress}/${xpNext}\n\n` +

    "RECURSOS\n" +
    `HP: ${user.hp}/${user.maxHp} (${hpPercent}%)\n` +
    `Energia: ${user.energy}/${user.maxEnergy} (${energyPercent}%)\n` +
    `Moedas: ${user.coins}\n\n` +

    "ATRIBUTOS\n" +
    `Força: ${user.strength}\n` +
    `Defesa: ${user.defense}\n` +
    `Velocidade: ${user.speed}\n` +
    `Inteligência: ${user.intelligence}\n\n` +

    "PROGRESSÃO\n" +
    `Próximo nível: ${xpNext} XP\n` +
    `Até o despertar: ${
      user.level >= 200
        ? "Nível alcançado"
        : `${200 - user.level} níveis`
    }\n\n` +

    `Despertado: ${user.awakened ? "Sim" : "Não"}`;

  return sendGifMessage(
    sock,
    msg,
    "status",
    text
  );
}

module.exports = status;
