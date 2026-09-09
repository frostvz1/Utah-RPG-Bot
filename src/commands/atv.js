const { sendGifMessage } =
  require("../systems/gifEvents");

const {
  isOwner
} = require("../systems/permissions");

const {
  ativarLicenca,
  ativarPermanente,
  desativarLicenca
} = require("../systems/licenses");

function obterRemetente(msg) {
  return (
    msg.key.participant ||
    msg.participant ||
    msg.key.remoteJid
  );
}

async function atv(sock, msg, args) {
  const sender =
    obterRemetente(msg);

  if (!isOwner(sender)) {
    return sendGifMessage(
      sock,
      msg,
      "erro",
      "Acesso negado.\n\n" +
      "Somente o Owner pode\n" +
      "gerenciar licenças."
    );
  }

  const grupoId =
    msg.key.remoteJid;

  if (
    !grupoId ||
    !grupoId.endsWith("@g.us")
  ) {
    return sendGifMessage(
      sock,
      msg,
      "erro",
      "Os comandos de licença devem\n" +
      "ser usados dentro de um grupo."
    );
  }

  const opcao =
    String(args[0] || "")
      .toLowerCase()
      .trim();

  if (opcao === "0") {
    const desativada =
      desativarLicenca(grupoId);

    if (!desativada) {
      return sendGifMessage(
        sock,
        msg,
        "erro",
        "Este grupo não possui\n" +
        "uma licença registrada."
      );
    }

    return sendGifMessage(
      sock,
      msg,
      "sucesso",
      "╔════════════════════════════╗\n" +
      "      𝐋𝐈𝐂𝐄𝐍𝐂̧𝐀 𝐃𝐄𝐒𝐀𝐓𝐈𝐕𝐀𝐃𝐀\n" +
      "╚════════════════════════════╝\n\n" +
      "Status: DESATIVADA\n\n" +
      "O acesso ao UTAH RPG foi\n" +
      "bloqueado neste grupo."
    );
  }

  if (!opcao) {
    return sendGifMessage(
      sock,
      msg,
      "erro",
      "Comandos Owner:\n\n" +
      ";atv 5\n" +
      ";atv 15\n" +
      ";atv 30\n" +
      ";atv 60\n" +
      ";atv permanente\n" +
      ";atv0"
    );
  }

  if (
    opcao === "permanente" ||
    opcao === "perm"
  ) {
    ativarPermanente(
      grupoId
    );

    return sendGifMessage(
      sock,
      msg,
      "sucesso",
      "╔════════════════════════════╗\n" +
      "      𝐋𝐈𝐂𝐄𝐍𝐂̧𝐀 𝐀𝐓𝐈𝐕𝐀𝐃𝐀\n" +
      "╚════════════════════════════╝\n\n" +
      "Plano: VIP PERMANENTE\n" +
      "Duração: PERMANENTE\n" +
      "Status: ATIVA\n\n" +
      "O UTAH RPG foi liberado neste grupo."
    );
  }

  const dias =
    Number(opcao);

  if (
    !Number.isInteger(dias) ||
    ![5, 15, 30, 60].includes(dias)
  ) {
    return sendGifMessage(
      sock,
      msg,
      "erro",
      "Plano inválido.\n\n" +
      "Use:\n" +
      ";atv 5\n" +
      ";atv 15\n" +
      ";atv 30\n" +
      ";atv 60\n" +
      ";atv permanente"
    );
  }

  const licenca =
    ativarLicenca(
      grupoId,
      dias
    );

  return sendGifMessage(
    sock,
    msg,
    "sucesso",
    "╔════════════════════════════╗\n" +
    "      𝐋𝐈𝐂𝐄𝐍𝐂̧𝐀 𝐀𝐓𝐈𝐕𝐀𝐃𝐀\n" +
    "╚════════════════════════════╝\n\n" +
    `Dias adicionados: ${dias}\n` +
    `Novo vencimento: ${new Date(licenca.expiresAt).toLocaleString("pt-BR")}\n` +
    "Status: ATIVA\n\n" +
    "O UTAH RPG foi liberado neste grupo."
  );
}

module.exports = atv;
