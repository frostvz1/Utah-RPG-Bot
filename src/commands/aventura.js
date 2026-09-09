const { loadConfig } = require("../systems/config");
const prefix = loadConfig().prefix || ";";

const { getUser } = require("../systems/users");

const { sendGifMessage } = require("../systems/gifEvents");
const { getMessage } = require("../systems/messages");

async function aventura(sock, msg, args) {
  const userId =
    msg.key.participant ||
    msg.key.remoteJid;

  const user = getUser(userId);

  if (!user.registered) {
    return sendGifMessage(
      sock,
      msg,
      "aventura",
      getMessage("notRegistered") || (`Você ainda não possui um personagem.\n\nUse ${prefix}iniciar para começar sua jornada.`)
    );
  }

  const action = args[0]?.toLowerCase();

  if (!action) {
    const text =
      "╔════════════════════════════╗\n" +
      "          AVENTURA\n" +
      "╚════════════════════════════╝\n\n" +
      `Aventureiro: ${user.name}\n` +
      `Nível: ${user.level}\n` +
      `Classe: ${user.class || "Não escolhida"}\n\n` +
      "Escolha uma ação:\n\n" +
      `${prefix}aventura explorar\n` +
      `${prefix}aventura mapa`;

    return sendGifMessage(
      sock,
      msg,
      "aventura",
      text
    );
  }

  if (action === "explorar") {
    if (!user.class) {
      return sendGifMessage(
        sock,
        msg,
        "explorar",
        "Você precisa escolher uma classe antes de explorar.\n\n" +
        `Use ${prefix}classe para escolher sua classe.`
      );
    }

    const text =
      "╔════════════════════════════╗\n" +
      "         EXPLORAÇÃO\n" +
      "╚════════════════════════════╝\n\n" +
      `Aventureiro: ${user.name}\n` +
      `Nível: ${user.level}\n` +
      `Classe: ${user.class}\n\n` +
      "Você entrou em uma região desconhecida.\n\n" +
      "O sistema de exploração foi iniciado.\n\n" +
      "Novas regiões, inimigos, eventos e recompensas serão adicionados à sua jornada.";

    return sendGifMessage(
      sock,
      msg,
      "explorar",
      text
    );
  }

  if (action === "mapa") {
    const text =
      "╔════════════════════════════╗\n" +
      "            MAPA\n" +
      "╚════════════════════════════╝\n\n" +
      "MUNDO PRINCIPAL\n\n" +
      "[1] Reino Inicial\n" +
      "[2] Floresta Sombria\n" +
      "[3] Montanhas\n" +
      "[4] Ruínas Antigas\n" +
      "[5] Cidade Central\n\n" +
      "Algumas regiões ainda estão bloqueadas.\n\n" +
      "Explore o mundo para descobrir novas áreas.";

    return sendGifMessage(
      sock,
      msg,
      "mapa",
      text
    );
  }

  return sendGifMessage(
    sock,
    msg,
    "aventura",
    "Ação de aventura inválida.\n\n" +
    "Use:\n" +
    `${prefix}aventura explorar\n` +
    `${prefix}aventura mapa`
  );
}

module.exports = aventura;
