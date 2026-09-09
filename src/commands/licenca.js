const { sendGifMessage } =
  require("../systems/gifEvents");

const {
  obterLicenca,
  estaAtiva,
  diasRestantes,
  formatarData
} = require("../systems/licenses");

async function licenca(sock, msg) {
  const grupoId =
    msg.key.remoteJid;

  const dados =
    obterLicenca(grupoId);

  if (!dados) {
    return sendGifMessage(
      sock,
      msg,
      "erro",
      "╔════════════════════════════╗\n" +
      "       𝐋𝐈𝐂𝐄𝐍𝐂̧𝐀\n" +
      "╚════════════════════════════╝\n\n" +
      "Status: SEM LICENÇA\n\n" +
      "Use ;pagamento para visualizar\n" +
      "os planos disponíveis."
    );
  }

  if (dados.permanente) {
    return sendGifMessage(
      sock,
      msg,
      "licenca",
      "╔════════════════════════════╗\n" +
      "       𝐋𝐈𝐂𝐄𝐍𝐂̧𝐀\n" +
      "╚════════════════════════════╝\n\n" +
      "Status: ATIVA\n" +
      "Plano: VIP PERMANENTE\n" +
      "Vencimento: NUNCA\n\n" +
      "Acesso permanente autorizado."
    );
  }

  const ativa =
    estaAtiva(grupoId);

  const dias =
    diasRestantes(grupoId);

  return sendGifMessage(
    sock,
    msg,
    ativa
      ? "licenca"
      : "erro",
    "╔════════════════════════════╗\n" +
    "       𝐋𝐈𝐂𝐄𝐍𝐂̧𝐀\n" +
    "╚════════════════════════════╝\n\n" +
    `Status: ${ativa ? "ATIVA" : "EXPIRADA"}\n` +
    `Dias restantes: ${dias}\n` +
    `Vencimento: ${formatarData(dados.expiresAt)}`
  );
}

module.exports = licenca;
