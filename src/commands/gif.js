const fs = require("fs");
const path = require("path");
const { getMessage } = require("../systems/messages");

const {
  downloadContentFromMessage
} = require("@whiskeysockets/baileys");

const {
  setGif,
  removeGif,
  listGifs,
  mediaPath
} = require("../systems/gifs");

const OWNER_NUMBERS = [
  "5575991190972",
  "144272766541980"
];

const CATEGORIES = [
  "menu",
  "iniciar",
  "perfil",
  "meuperfil",
  "status",
  "classe",
  "aventura",
  "explorar",
  "mapa",

  "atacar",
  "habilidade",
  "magia",
  "defesa",
  "fuga",
  "vitoria",
  "derrota",
  "boss",
  "levelup",
  "despertar",

  "descansar",
  "regeneracao",
  "hospital",

  "inventario",
  "item",
  "item_comprar",
  "item_usar",

  "missao",
  "guilda",
  "guilda_membros",
  "guilda_marcar",
  "guilda_recusar",
  "guilda_aceitar",
  "guilda_convites",
  "guilda_convite",
  "dados_guilda",
  "loja",
  "mercado",
  "banco",
  "ranking",

  "perfil_editar",
  "perfil_editar_nome",
  "perfil_editar_raca",
  "perfil_editar_habilidade",
  "perfil_editar_titulo",
  "perfil_editar_bio",
  "perfil_editar_imagem",

  "sucesso",
  "erro"
];

const RACAS = [
  "humano",
  "elfo",
  "anjo",
  "demonio",
  "vampiro",
  "lobisomem",
  "fada",
  "dragao",
  "deus",
  "sobrenatural"
];

function normalizeCategory(value) {
  if (!value) return "";

  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}

function getSenderNumber(msg) {
  const participant =
    msg.key.participant ||
    msg.key.remoteJid ||
    "";

  return participant
    .split("@")[0]
    .replace(/\D/g, "");
}

function isOwner(msg) {
  return OWNER_NUMBERS.includes(
    getSenderNumber(msg)
  );
}

async function downloadVideo(message) {
  const stream =
    await downloadContentFromMessage(
      message,
      "video"
    );

  const chunks = [];

  for await (const chunk of stream) {
    chunks.push(chunk);
  }

  return Buffer.concat(chunks);
}

function nomeRaca(raca) {
  const nomes = {
    humano: "Humano",
    elfo: "Elfo",
    anjo: "Anjo",
    demonio: "Demônio",
    vampiro: "Vampiro",
    lobisomem: "Lobisomem",
    fada: "Fada",
    dragao: "Dragão",
    deus: "Deus",
    sobrenatural: "Sobrenatural"
  };

  return nomes[raca] || raca;
}

async function configurarGifHabilidade(
  sock,
  msg,
  raca
) {
  const quoted =
    msg.message
      ?.extendedTextMessage
      ?.contextInfo
      ?.quotedMessage;

  if (!quoted?.videoMessage) {
    return sock.sendMessage(
      msg.key.remoteJid,
      {
        text:
          "Responda a um GIF ou vídeo usando:\n\n" +
          `Pgif habilidade ${raca}`
      }
    );
  }

  try {
    const buffer =
      await downloadVideo(
        quoted.videoMessage
      );

    const directory =
      path.join(
        mediaPath,
        "habilidades"
      );

    if (!fs.existsSync(directory)) {
      fs.mkdirSync(
        directory,
        {
          recursive: true
        }
      );
    }

    const filePath =
      path.join(
        directory,
        `${raca}.mp4`
      );

    fs.writeFileSync(
      filePath,
      buffer
    );

    return sock.sendMessage(
      msg.key.remoteJid,
      {
        text:
          "GIF de habilidades configurado com sucesso.\n\n" +
          `Raça: ${nomeRaca(raca)}\n` +
          `Arquivo: habilidades/${raca}.mp4\n\n` +
          "Esse GIF será utilizado nas 20 habilidades dessa raça."
      }
    );

  } catch (error) {
    console.error(
      "[UTAH RPG] Erro ao salvar GIF de habilidade:",
      error
    );

    return sock.sendMessage(
      msg.key.remoteJid,
      {
        text:
          "Não foi possível salvar o GIF de habilidades."
      }
    );
  }
}

async function listarGifsHabilidades(
  sock,
  msg
) {
  const directory =
    path.join(
      mediaPath,
      "habilidades"
    );

  let text =
    "╔════════════════════════════╗\n" +
    "       GIFS DE HABILIDADES\n" +
    "╚════════════════════════════╝\n\n";

  for (const raca of RACAS) {
    const arquivo =
      path.join(
        directory,
        `${raca}.mp4`
      );

    text +=
      `${fs.existsSync(arquivo) ? "[✓]" : "[ ]"} ` +
      `${nomeRaca(raca)}\n`;
  }

  text +=
    "\nCada raça possui 1 GIF.\n" +
    "O GIF é utilizado nas 20 habilidades da raça.\n\n" +
    "Para configurar:\n" +
    "Pgif habilidade <raça>\n\n" +
    "Exemplo:\n" +
    "Pgif habilidade anjo";

  return sock.sendMessage(
    msg.key.remoteJid,
    { text }
  );
}

async function gif(
  sock,
  msg,
  args
) {
  if (!isOwner(msg)) {
    return sock.sendMessage(
      msg.key.remoteJid,
      {
        text:
          require("../systems/messages").getMessage("permissionDenied") || "Você não possui permissão para configurar GIFs."
      }
    );
  }

  const action =
    normalizeCategory(args[0]);

  /*
   * SISTEMA DE GIFS DE HABILIDADES
   */
  if (action === "habilidade") {
    const segundo =
      normalizeCategory(args[1]);

    if (segundo === "lista") {
      return listarGifsHabilidades(
        sock,
        msg
      );
    }

    if (!RACAS.includes(segundo)) {
      return sock.sendMessage(
        msg.key.remoteJid,
        {
          text:
            "Raça inválida.\n\n" +
            "Use:\n" +
            "Pgif habilidade lista"
        }
      );
    }

    return configurarGifHabilidade(
      sock,
      msg,
      segundo
    );
  }

  /*
   * LISTA DOS GIFS NORMAIS
   */
  if (action === "lista") {
    const gifs = listGifs();

    let text =
      "╔════════════════════════════╗\n" +
      "          GIFS UTAH RPG\n" +
      "╚════════════════════════════╝\n\n";

    for (const category of CATEGORIES) {
      text +=
        `${gifs[category] ? "[✓]" : "[ ]"} ` +
        `${category}\n`;
    }

    text +=
      "\nPara configurar:\n" +
      "Responda a um GIF/vídeo com:\n" +
      "Pgif <categoria>\n\n" +
      "GIFs de habilidades:\n" +
      "Pgif habilidade lista";

    return sock.sendMessage(
      msg.key.remoteJid,
      { text }
    );
  }

  /*
   * REMOVER GIF NORMAL
   */
  if (action === "remover") {
    const category =
      normalizeCategory(args[1]);

    if (
      !CATEGORIES.includes(category)
    ) {
      return sock.sendMessage(
        msg.key.remoteJid,
        {
          text:
            "Categoria inválida.\n\n" +
            "Use Pgif lista."
        }
      );
    }

    const removed =
      removeGif(category);

    return sock.sendMessage(
      msg.key.remoteJid,
      {
        text: removed
          ? `GIF "${category}" removido com sucesso.`
          : `Não existe GIF configurado para "${category}".`
      }
    );
  }

  /*
   * GIF NORMAL
   */
  if (
    !CATEGORIES.includes(action)
  ) {
    return sock.sendMessage(
      msg.key.remoteJid,
      {
        text:
          "Categoria inválida.\n\n" +
          "Use Pgif lista."
      }
    );
  }

  const quoted =
    msg.message
      ?.extendedTextMessage
      ?.contextInfo
      ?.quotedMessage;

  if (!quoted?.videoMessage) {
    return sock.sendMessage(
      msg.key.remoteJid,
      {
        text:
          "Responda a um GIF ou vídeo usando:\n\n" +
          `Pgif ${action}`
      }
    );
  }

  try {
    const buffer =
      await downloadVideo(
        quoted.videoMessage
      );

    if (!fs.existsSync(mediaPath)) {
      fs.mkdirSync(
        mediaPath,
        {
          recursive: true
        }
      );
    }

    const filePath =
      path.join(
        mediaPath,
        `${action}.mp4`
      );

    fs.writeFileSync(
      filePath,
      buffer
    );

    setGif(
      action,
      filePath
    );

    return sock.sendMessage(
      msg.key.remoteJid,
      {
        text:
          "GIF configurado com sucesso.\n\n" +
          `Categoria: ${action}\n` +
          `Arquivo: ${action}.mp4`
      }
    );

  } catch (error) {
    console.error(
      "[UTAH RPG] Erro ao salvar GIF:",
      error
    );

    return sock.sendMessage(
      msg.key.remoteJid,
      {
        text:
          "Não foi possível salvar o GIF."
      }
    );
  }
}

module.exports = gif;
