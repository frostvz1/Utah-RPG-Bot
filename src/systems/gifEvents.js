const fs = require("fs");
const path = require("path");
const { getGif } = require("./gifs");

function normalizar(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}

function caminhoGifHabilidade(raca) {
  if (!raca) return null;

  const nomeRaca = normalizar(raca);

  return path.join(
    __dirname,
    "../../media/gifs/habilidades",
    `${nomeRaca}.mp4`
  );
}

function obterGifHabilidade(raca) {
  const arquivo = caminhoGifHabilidade(raca);

  if (
    arquivo &&
    fs.existsSync(arquivo)
  ) {
    return arquivo;
  }

  return null;
}

async function enviarGifArquivo(
  sock,
  remoteJid,
  arquivo,
  text = null
) {
  if (
    !arquivo ||
    !fs.existsSync(arquivo)
  ) {
    return false;
  }

  const buffer =
    fs.readFileSync(arquivo);

  const mensagem = {
    video: buffer,
    gifPlayback: true,
    mimetype: "video/mp4"
  };

  if (text) {
    mensagem.caption = text;
  }

  await sock.sendMessage(
    remoteJid,
    mensagem
  );

  return true;
}

async function sendGifMessage(
  sock,
  msg,
  event,
  text
) {
  try {
    const remoteJid =
      msg.key.remoteJid;

    const gif = getGif(event);

    if (
      !gif ||
      !gif.file ||
      !fs.existsSync(gif.file)
    ) {
      await sock.sendMessage(
        remoteJid,
        { text }
      );

      return false;
    }

    await enviarGifArquivo(
      sock,
      remoteJid,
      gif.file,
      text
    );

    return true;

  } catch (error) {
    console.error(
      `[UTAH RPG] Erro no GIF "${event}":`,
      error
    );

    await sock.sendMessage(
      msg.key.remoteJid,
      { text }
    );

    return false;
  }
}

async function sendAbilityGifMessage(
  sock,
  msg,
  race,
  text
) {
  try {
    const remoteJid =
      msg.key.remoteJid;

    /*
     * GIF específico da raça.
     * Esse mesmo GIF serve para
     * todas as 20 habilidades.
     */
    const gifRaca =
      obterGifHabilidade(race);

    if (gifRaca) {
      await enviarGifArquivo(
        sock,
        remoteJid,
        gifRaca,
        text
      );

      return true;
    }

    /*
     * Fallback para o GIF genérico.
     */
    const gifGenerico =
      getGif("habilidade");

    if (
      gifGenerico &&
      gifGenerico.file &&
      fs.existsSync(gifGenerico.file)
    ) {
      await enviarGifArquivo(
        sock,
        remoteJid,
        gifGenerico.file,
        text
      );

      return true;
    }

    await sock.sendMessage(
      remoteJid,
      { text }
    );

    return false;

  } catch (error) {
    console.error(
      `[UTAH RPG] Erro no GIF de habilidade da raça "${race}":`,
      error
    );

    await sock.sendMessage(
      msg.key.remoteJid,
      { text }
    );

    return false;
  }
}

async function triggerGif(
  sock,
  msg,
  event
) {
  try {
    const gif = getGif(event);

    if (
      !gif ||
      !gif.file ||
      !fs.existsSync(gif.file)
    ) {
      return false;
    }

    await enviarGifArquivo(
      sock,
      msg.key.remoteJid,
      gif.file
    );

    return true;

  } catch (error) {
    console.error(
      `[UTAH RPG] Erro ao enviar GIF "${event}":`,
      error
    );

    return false;
  }
}

async function triggerGifs(
  sock,
  msg,
  events
) {
  if (!Array.isArray(events)) {
    events = [events];
  }

  for (const event of events) {
    await triggerGif(
      sock,
      msg,
      event
    );
  }
}

module.exports = {
  sendGifMessage,
  sendAbilityGifMessage,
  triggerGif,
  triggerGifs,
  caminhoGifHabilidade,
  obterGifHabilidade
};
