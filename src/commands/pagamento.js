const { sendGifMessage } =
  require("../systems/gifEvents");

const {
  PLANOS,
  obterLicenca,
  estaAtiva,
  diasRestantes,
  formatarData
} = require("../systems/licenses");

async function pagamento(sock, msg) {
  const grupoId =
    msg.key.remoteJid;

  const licenca =
    obterLicenca(grupoId);

  let status =
    "SEM LICENÇA";

  if (estaAtiva(grupoId)) {
    status =
      licenca?.permanente
        ? "PERMANENTE"
        : "ATIVA";
  }

  let texto =
    "╔════════════════════════════╗\n" +
    "       𝐔𝐓𝐀𝐇 𝐑𝐏𝐆\n" +
    "        𝐋𝐈𝐂𝐄𝐍𝐂̧𝐀𝐒\n" +
    "╚════════════════════════════╝\n\n" +

    `𝐒𝐭𝐚𝐭𝐮𝐬: ${status}\n`;

  if (estaAtiva(grupoId)) {
    texto +=
      licenca?.permanente
        ? "𝐀𝐜𝐞𝐬𝐬𝐨: 𝐏𝐄𝐑𝐌𝐀𝐍𝐄𝐍𝐓𝐄\n\n"
        : `𝐃𝐢𝐚𝐬 𝐫𝐞𝐬𝐭𝐚𝐧𝐭𝐞𝐬: ${diasRestantes(grupoId)}\n` +
          `𝐕𝐞𝐧𝐜𝐢𝐦𝐞𝐧𝐭𝐨: ${formatarData(licenca.expiresAt)}\n\n`;
  } else {
    texto += "\n";
  }

  texto +=
    "━━━━━━━━━━━━━━━━━━━━\n" +
    "𝐏𝐋𝐀𝐍𝐎𝐒\n" +
    "━━━━━━━━━━━━━━━━━━━━\n\n" +

    "𝐆𝐑Á𝐓𝐈𝐒\n" +
    "5 dias — R$0,00\n\n" +

    "𝐁Á𝐒𝐈𝐂𝐎\n" +
    "15 dias — R$7,90\n\n" +

    "𝐏𝐀𝐃𝐑Ã𝐎\n" +
    "30 dias — R$14,90\n" +
    "𝐌𝐀𝐈𝐒 𝐕𝐄𝐍𝐃𝐈𝐃𝐎\n\n" +

    "𝐏𝐑𝐄𝐌𝐈𝐔𝐌\n" +
    "60 dias — R$24,90\n\n" +

    "𝐕𝐈𝐏 𝐏𝐄𝐑𝐌𝐀𝐍𝐄𝐍𝐓𝐄\n" +
    "Acesso permanente — R$49,90\n\n" +

    "━━━━━━━━━━━━━━━━━━━━\n" +
    "𝐏𝐀𝐆𝐀𝐌𝐄𝐍𝐓𝐎\n" +
    "━━━━━━━━━━━━━━━━━━━━\n\n" +

    "𝐍𝐨𝐦𝐞: Samuel Ferreira Duarte\n" +
    "𝐁𝐚𝐧𝐜𝐨: Banco Inter\n" +
    "𝐂𝐡𝐚𝐯𝐞 𝐏𝐈𝐗: 09019917595\n\n" +

    "Após o pagamento, envie o\n" +
    "comprovante neste grupo.\n\n" +

    "A ativação é realizada\n" +
    "manualmente pelo Owner.";

  return sendGifMessage(
    sock,
    msg,
    "pagamento",
    texto
  );
}

module.exports = pagamento;
