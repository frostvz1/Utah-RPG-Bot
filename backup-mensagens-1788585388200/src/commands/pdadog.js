const fs = require("fs");
const { loadConfig } = require("../systems/config");
const path = require("path");

const {
  downloadMediaMessage
} = require("@whiskeysockets/baileys");

const {
  getUser
} = require("../systems/users");

const {
  getGuildByMember,
  updateGuild,
  mediaPath
} = require("../systems/guilds");

const {
  sendGifMessage
} = require("../systems/gifEvents");

const CATEGORIAS = [
  "Aventureiros",
  "Guerreiros",
  "Magos",
  "Assassinos",
  "Heróis",
  "Vilões",
  "Mercenários",
  "Exploradores",
  "Sobrenaturais",
  "Divindades"
];

function normalizar(texto) {
  return (texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function podeEditar(member) {
  return (
    member &&
    (
      member.role === "Mestre" ||
      member.role === "Vice-Mestre"
    )
  );
}

function obterMensagemCitada(msg) {
  const context =
    msg.message?.extendedTextMessage?.contextInfo;

  if (
    !context ||
    !context.quotedMessage
  ) {
    return null;
  }

  return {
    key: {
      remoteJid: msg.key.remoteJid,
      fromMe: false,
      id: context.stanzaId,
      participant: context.participant
    },
    message: context.quotedMessage
  };
}

function analisarMidia(quoted) {
  if (!quoted?.message) {
    return null;
  }

  const mensagem =
    quoted.message;

  if (mensagem.imageMessage) {
    return {
      type: "image",
      mimetype:
        mensagem.imageMessage.mimetype ||
        "image/jpeg"
    };
  }

  if (mensagem.videoMessage) {
    const mime =
      mensagem.videoMessage.mimetype || "";

    if (
      mime === "image/gif" ||
      mensagem.videoMessage.gifPlayback
    ) {
      return {
        type: "video",
        mimetype: "image/gif"
      };
    }
  }

  if (mensagem.documentMessage) {
    const mime =
      mensagem.documentMessage.mimetype || "";

    if (
      mime === "image/gif" ||
      mime === "image/png" ||
      mime === "image/jpeg" ||
      mime === "image/jpg"
    ) {
      return {
        type: "document",
        mimetype: mime
      };
    }
  }

  return null;
}

function definirExtensao(mimetype) {
  if (mimetype === "image/gif") {
    return "gif";
  }

  if (mimetype === "image/png") {
    return "png";
  }

  return "jpg";
}

async function salvarImagemGuilda(
  sock,
  msg,
  guild
) {
  const quoted =
    obterMensagemCitada(msg);

  if (!quoted) {
    return sendGifMessage(
      sock,
      msg,
      "dados_guilda",
      "Nenhuma mídia foi encontrada.\n\n" +
      "Envie uma imagem ou GIF e responda à mídia com:\n\n" +
      "Pdadog imagem"
    );
  }

  const media =
    analisarMidia(quoted);

  if (!media) {
    return sendGifMessage(
      sock,
      msg,
      "dados_guilda",
      "A mídia citada não é uma imagem compatível.\n\n" +
      "Envie uma imagem ou GIF e responda usando:\n\n" +
      "Pdadog imagem"
    );
  }

  try {
    if (!fs.existsSync(mediaPath)) {
      fs.mkdirSync(
        mediaPath,
        {
          recursive: true
        }
      );
    }

    const buffer =
      await downloadMediaMessage(
        quoted,
        "buffer",
        {},
        {
          logger: {
            info() {},
            error() {},
            warn() {},
            debug() {}
          }
        }
      );

    if (
      !buffer ||
      !buffer.length
    ) {
      return sendGifMessage(
        sock,
        msg,
        "erro",
        "Não foi possível baixar a imagem."
      );
    }

    if (
      buffer.length >
      10 * 1024 * 1024
    ) {
      return sendGifMessage(
        sock,
        msg,
        "dados_guilda",
        "A imagem é muito grande.\n\n" +
        "Tamanho máximo: 10 MB."
      );
    }

    const extensao =
      definirExtensao(
        media.mimetype
      );

    const arquivo =
      `guild_${guild.id}.${extensao}`;

    const caminho =
      path.join(
        mediaPath,
        arquivo
      );

    if (guild.image?.file) {
      const anterior =
        path.resolve(
          guild.image.file
        );

      const atual =
        path.resolve(caminho);

      if (
        fs.existsSync(anterior) &&
        anterior !== atual
      ) {
        fs.unlinkSync(anterior);
      }
    }

    fs.writeFileSync(
      caminho,
      buffer
    );

    updateGuild(
      guild.id,
      {
        image: {
          file: caminho,
          type: extensao,
          mimetype: media.mimetype,
          updatedAt: Date.now()
        }
      }
    );

    return sendGifMessage(
      sock,
      msg,
      "dados_guilda",
      "╔════════════════════════════╗\n" +
      "       IMAGEM DA GUILDA\n" +
      "╚════════════════════════════╝\n\n" +
      "Imagem atualizada com sucesso.\n\n" +
      `Formato detectado: ${media.mimetype}\n` +
      `Arquivo salvo: ${arquivo}\n\n` +
      `A imagem agora será utilizada no ${prefix}guilda.`
    );

  } catch (error) {
    console.error(
      "[UTAH RPG] Erro ao salvar imagem:",
      error
    );

    return sendGifMessage(
      sock,
      msg,
      "erro",
      "Ocorreu um erro ao processar a imagem."
    );
  }
}

async function pdadog(sock, msg, args) {
  const userId =
    msg.key.participant ||
    msg.key.remoteJid;

  const user =
    getUser(userId);

  if (!user.registered) {
    return sendGifMessage(
      sock,
      msg,
      "erro",
      "Você ainda não possui um personagem.\n\n" +
      `Use ${prefix}iniciar para começar sua jornada.`
    );
  }

  const guild =
    getGuildByMember(userId);

  if (!guild) {
    return sendGifMessage(
      sock,
      msg,
      "dados_guilda",
      "Você não pertence a nenhuma guilda."
    );
  }

  const member =
    guild.members.find(
      item =>
        item.id === userId
    );

  if (!podeEditar(member)) {
    return sendGifMessage(
      sock,
      msg,
      "dados_guilda",
      "Acesso negado.\n\n" +
      "Somente o Mestre e o Vice-Mestre podem alterar os dados da guilda."
    );
  }

  const action =
    normalizar(args[0]);

  const value =
    args
      .slice(1)
      .join(" ")
      .trim();

  if (action === "imagem") {
    return salvarImagemGuilda(
      sock,
      msg,
      guild
    );
  }

  if (!action) {
    return sendGifMessage(
      sock,
      msg,
      "dados_guilda",
      "╔════════════════════════════╗\n" +
      "       DADOS DA GUILDA\n" +
      "╚════════════════════════════╝\n\n" +
      "Pdadog nome <nome>\n" +
      "Pdadog descricao <texto>\n" +
      "Pdadog lema <texto>\n" +
      "Pdadog categoria <categoria>\n" +
      "Pdadog imagem\n\n" +
      "Para imagem:\n" +
      "Responda a uma imagem ou GIF\n" +
      "e envie Pdadog imagem."
    );
  }

  if (action === "nome") {
    if (!value) {
      return sendGifMessage(
        sock,
        msg,
        "dados_guilda",
        "Informe o novo nome da guilda.\n\n" +
        "Exemplo:\n" +
        "Pdadog nome Cavaleiros do Eclipse"
      );
    }

    if (
      value.length < 3 ||
      value.length > 30
    ) {
      return sendGifMessage(
        sock,
        msg,
        "dados_guilda",
        "O nome deve ter entre 3 e 30 caracteres."
      );
    }

    updateGuild(
      guild.id,
      {
        name: value
      }
    );

    return sendGifMessage(
      sock,
      msg,
      "dados_guilda",
      "Nome da guilda atualizado.\n\n" +
      `Novo nome: ${value}`
    );
  }

  if (action === "descricao") {
    if (value.length > 200) {
      return sendGifMessage(
        sock,
        msg,
        "dados_guilda",
        "A descrição pode ter no máximo 200 caracteres."
      );
    }

    updateGuild(
      guild.id,
      {
        description: value
      }
    );

    return sendGifMessage(
      sock,
      msg,
      "dados_guilda",
      "Descrição da guilda atualizada.\n\n" +
      `Descrição:\n${value || "Nenhuma"}`
    );
  }

  if (action === "lema") {
    if (value.length > 100) {
      return sendGifMessage(
        sock,
        msg,
        "dados_guilda",
        "O lema pode ter no máximo 100 caracteres."
      );
    }

    updateGuild(
      guild.id,
      {
        motto: value
      }
    );

    return sendGifMessage(
      sock,
      msg,
      "dados_guilda",
      "Lema da guilda atualizado.\n\n" +
      `Novo lema:\n${value || "Nenhum"}`
    );
  }

  if (action === "categoria") {
    const categoria =
      CATEGORIAS.find(
        item =>
          normalizar(item) ===
          normalizar(value)
      );

    if (!categoria) {
      return sendGifMessage(
        sock,
        msg,
        "dados_guilda",
        "Categoria inválida.\n\n" +
        "Categorias disponíveis:\n\n" +
        CATEGORIAS.join("\n")
      );
    }

    updateGuild(
      guild.id,
      {
        category: categoria
      }
    );

    return sendGifMessage(
      sock,
      msg,
      "dados_guilda",
      "Categoria da guilda atualizada.\n\n" +
      `Nova categoria: ${categoria}`
    );
  }

  return sendGifMessage(
    sock,
    msg,
    "dados_guilda",
    "Comando inválido.\n\n" +
    "Use Pdadog para visualizar os comandos disponíveis."
  );
}

module.exports = pdadog;
