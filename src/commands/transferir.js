const { getUser, updateUser } = require("../systems/users");
const { sendGifMessage } = require("../systems/gifEvents");
const { loadConfig } = require("../systems/config");

async function transferir(sock, msg, args) {
  const config = loadConfig();
  const prefix = config.prefix || ";";

  const senderId =
    msg.key.participant ||
    msg.key.remoteJid;

  const sender = getUser(senderId);

  if (!sender.registered) {
    return sendGifMessage(
      sock,
      msg,
      "erro",
      "Você ainda não possui um personagem.\n\n" +
      `Use ${prefix}iniciar para começar sua jornada.`
    );
  }

  /*
   * Procura o jogador mencionado.
   */
  const mentions =
    msg.message?.extendedTextMessage?.contextInfo?.mentionedJid ||
    msg.message?.conversation?.contextInfo?.mentionedJid ||
    [];

  if (!mentions.length) {
    return sendGifMessage(
      sock,
      msg,
      "transferir",
      "Você precisa mencionar o jogador que receberá as moedas.\n\n" +
      "Exemplo:\n" +
      `${prefix}transferir 5000 @jogador`
    );
  }

  const targetId = mentions[0];

  if (targetId === senderId) {
    return sendGifMessage(
      sock,
      msg,
      "transferir",
      "Você não pode transferir moedas para si mesmo."
    );
  }

  /*
   * Encontra a quantidade de moedas.
   *
   * Pode ser:
   * ;transferir 5000 @jogador
   * ;transferir @jogador 5000
   *
   * Ignoramos argumentos que sejam a menção.
   */
  const amountArg = args.find((arg) => {
    if (!arg) return false;

    const texto = String(arg).trim();

    // Ignora menções
    if (
      texto.startsWith("@") ||
      mentions.some((jid) => {
        const numero = jid.split("@")[0];
        return texto.includes(numero);
      })
    ) {
      return false;
    }

    // Aceita somente números inteiros
    return /^\d+$/.test(texto);
  });

  const amount = amountArg
    ? Number(amountArg)
    : NaN;

  /*
   * Verificação contra números inválidos ou grandes demais.
   *
   * Number.isSafeInteger impede valores que o JavaScript
   * não consegue representar com precisão.
   */
  if (!Number.isSafeInteger(amount) || amount <= 0) {
    return sendGifMessage(
      sock,
      msg,
      "transferir",
      "Informe uma quantidade válida de moedas.\n\n" +
      "Exemplo:\n" +
      `${prefix}transferir 5000 @jogador`
    );
  }

  const target = getUser(targetId);

  if (!target.registered) {
    return sendGifMessage(
      sock,
      msg,
      "transferir",
      "O jogador mencionado ainda não possui um personagem."
    );
  }

  const saldo = Number(sender.coins) || 0;

  /*
   * Não existe limite máximo artificial.
   * O único limite é o saldo disponível.
   */
  if (amount > saldo) {
    return sendGifMessage(
      sock,
      msg,
      "transferir",
      "Saldo insuficiente.\n\n" +
      `Seu saldo: ${saldo.toLocaleString("pt-BR")} moedas\n` +
      `Valor solicitado: ${amount.toLocaleString("pt-BR")} moedas`
    );
  }

  const novoSaldoRemetente =
    saldo - amount;

  const saldoDestinatario =
    Number(target.coins) || 0;

  const novoSaldoDestinatario =
    saldoDestinatario + amount;

  updateUser(senderId, {
    coins: novoSaldoRemetente
  });

  updateUser(targetId, {
    coins: novoSaldoDestinatario
  });

  return sendGifMessage(
    sock,
    msg,
    "transferir",
    "╔════════════════════════════╗\n" +
    "       TRANSFERÊNCIA\n" +
    "╚════════════════════════════╝\n\n" +
    `Remetente: ${sender.name}\n` +
    `Destinatário: ${target.name}\n` +
    `Valor: ${amount.toLocaleString("pt-BR")} moedas\n\n` +
    "Transferência realizada com sucesso.\n\n" +
    `Seu novo saldo: ${novoSaldoRemetente.toLocaleString("pt-BR")} moedas`
  );
}

module.exports = transferir;
