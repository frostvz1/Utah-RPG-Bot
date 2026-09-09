const { getUser, updateUser } = require("../systems/users");
const { loadConfig } = require("../systems/config");
const { sendGifMessage } = require("../systems/gifEvents");

const OWNER_NUMBERS = [
  "5575991190972",
  "144272766541980"
];

function isOwner(userId) {
  const number = (userId.split("@")[0] || "")
    .replace(/\D/g, "");

  return OWNER_NUMBERS.includes(number);
}

async function coins50000(sock, msg) {
  const userId =
    msg.key.participant ||
    msg.key.remoteJid;

  if (!isOwner(userId)) {
    return sendGifMessage(
      sock,
      msg,
      "erro",
      "Comando restrito."
    );
  }

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

  const quantidade = 50000;
  const saldoAnterior = user.coins;

  updateUser(userId, {
    coins: saldoAnterior + quantidade
  });

  return sendGifMessage(
    sock,
    msg,
    "sucesso",
    "╔════════════════════════════╗\n" +
    "       RECOMPENSA ADMIN\n" +
    "╚════════════════════════════╝\n\n" +
    `Moedas recebidas: +${quantidade}\n\n` +
    `Saldo anterior: ${saldoAnterior}\n` +
    `Saldo atual: ${saldoAnterior + quantidade}\n\n` +
    "Operação concluída."
  );
}

module.exports = coins50000;
