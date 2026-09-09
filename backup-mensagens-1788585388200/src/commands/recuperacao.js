const { getUser, updateUser } = require("../systems/users");
const { loadConfig } = require("../systems/config");
const { sendGifMessage } = require("../systems/gifEvents");

async function recuperacao(sock, msg, args) {
  const userId =
    msg.key.participant ||
    msg.key.remoteJid;

  const user = getUser(userId);

  if (!user.registered) {
    return sendGifMessage(
      sock,
      msg,
      "erro",
      "Você ainda não possui um personagem.\n\n" +
      `Use ${prefix}iniciar para começar sua jornada.`
    );
  }

  const action =
    (args[0] || "descansar").toLowerCase();

  if (action === "descansar") {
    if (
      user.hp >= user.maxHp &&
      user.energy >= user.maxEnergy
    ) {
      return sendGifMessage(
        sock,
        msg,
        "descansar",
        "Você já está completamente recuperado.\n\n" +
        `HP: ${user.hp}/${user.maxHp}\n` +
        `Energia: ${user.energy}/${user.maxEnergy}`
      );
    }

    const oldHp = user.hp;
    const oldEnergy = user.energy;

    const newHp = Math.min(
      user.maxHp,
      user.hp + 20
    );

    const newEnergy = Math.min(
      user.maxEnergy,
      user.energy + 30
    );

    updateUser(userId, {
      hp: newHp,
      energy: newEnergy,
      lastRegeneration: Date.now()
    });

    return sendGifMessage(
      sock,
      msg,
      "descansar",
      "╔════════════════════════════╗\n" +
      "          DESCANSO\n" +
      "╚════════════════════════════╝\n\n" +
      `HP: +${newHp - oldHp}\n` +
      `Energia: +${newEnergy - oldEnergy}\n\n` +
      `HP atual: ${newHp}/${user.maxHp}\n` +
      `Energia atual: ${newEnergy}/${user.maxEnergy}\n\n` +
      "O descanso foi concluído.\n" +
      "Nenhuma moeda foi utilizada."
    );
  }

  if (action === "hospital") {
    const custo = 100;

    if (user.coins < custo) {
      return sendGifMessage(
        sock,
        msg,
        "hospital",
        "╔════════════════════════════╗\n" +
        "          HOSPITAL\n" +
        "╚════════════════════════════╝\n\n" +
        "Moedas insuficientes.\n\n" +
        `Custo: ${custo} moedas\n` +
        `Saldo atual: ${user.coins} moedas\n` +
        `Faltam: ${custo - user.coins} moedas`
      );
    }

    if (
      user.hp >= user.maxHp &&
      user.energy >= user.maxEnergy
    ) {
      return sendGifMessage(
        sock,
        msg,
        "hospital",
        "Você já está completamente recuperado.\n\n" +
        `HP: ${user.hp}/${user.maxHp}\n` +
        `Energia: ${user.energy}/${user.maxEnergy}`
      );
    }

    updateUser(userId, {
      hp: user.maxHp,
      energy: user.maxEnergy,
      coins: user.coins - custo,
      lastRegeneration: Date.now()
    });

    return sendGifMessage(
      sock,
      msg,
      "hospital",
      "╔════════════════════════════╗\n" +
      "          HOSPITAL\n" +
      "╚════════════════════════════╝\n\n" +
      "Tratamento concluído.\n\n" +
      `HP: ${user.maxHp}/${user.maxHp}\n` +
      `Energia: ${user.maxEnergy}/${user.maxEnergy}\n\n` +
      `Custo: ${custo} moedas\n` +
      `Saldo restante: ${user.coins - custo} moedas`
    );
  }

  return sendGifMessage(
    sock,
    msg,
    "erro",
    "Comando de recuperação inválido.\n\n" +
    "Use:\n" +
    `${prefix}descansar\n` +
    `${prefix}hospital`
  );
}

module.exports = recuperacao;
