const fs = require("fs");
const path = require("path");
const { getMessage } = require("../systems/messages");

const { getUser, updateUser } = require("../systems/users");
const { sendGifMessage } = require("../systems/gifEvents");
const {
  getRacas,
  getHabilidades,
  getRacaPorNome,
  getAspectos
} = require("../systems/abilities");

const mediaPath = path.join(__dirname, "../../media/profile");

function normalizar(texto) {
  return String(texto || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function obterMensagemCitada(msg) {
  return msg.message?.extendedTextMessage?.contextInfo?.quotedMessage || null;
}

function analisarMidia(quoted) {
  if (!quoted) return null;

  if (quoted.imageMessage) {
    return {
      tipo: "png",
      mensagem: quoted.imageMessage
    };
  }

  if (quoted.videoMessage) {
    const mimetype = quoted.videoMessage.mimetype || "";

    if (
      mimetype.includes("gif") ||
      quoted.videoMessage.gifPlayback
    ) {
      return {
        tipo: "gif",
        mensagem: quoted.videoMessage
      };
    }
  }

  if (quoted.documentMessage) {
    const mimetype = quoted.documentMessage.mimetype || "";

    if (mimetype === "image/gif") {
      return {
        tipo: "gif",
        mensagem: quoted.documentMessage
      };
    }

    if (
      mimetype === "image/png" ||
      mimetype === "image/jpeg" ||
      mimetype === "image/jpg"
    ) {
      return {
        tipo: mimetype.includes("png") ? "png" : "jpg",
        mensagem: quoted.documentMessage
      };
    }
  }

  return null;
}

function obterHabilidadesDoUsuario(user) {
  if (Array.isArray(user.abilities)) {
    return user.abilities;
  }

  if (user.ability) {
    return [user.ability];
  }

  return [];
}

function mostrarPerfil(user) {
  const habilidades = obterHabilidadesDoUsuario(user);

  return (
    "╔════════════════════════════╗\n" +
    "           PERFIL\n" +
    "╚════════════════════════════╝\n\n" +
    `Nome: ${user.name}\n` +
    `Nível: ${user.level}\n` +
    `XP: ${user.xp}\n\n` +
    "ATRIBUTOS\n" +
    `HP: ${user.hp}/${user.maxHp}\n` +
    `Energia: ${user.energy}/${user.maxEnergy}\n` +
    `Força: ${user.strength}\n` +
    `Defesa: ${user.defense}\n` +
    `Velocidade: ${user.speed}\n` +
    `Inteligência: ${user.intelligence}\n\n` +
    "PERSONAGEM\n" +
    `Raça: ${user.race || "Não definida"}\n` +
    `Classe: ${user.class || "Não definida"}\n\n` +
    "HABILIDADES\n" +
    `Selecionadas: ${habilidades.length}/5\n` +
    (
      habilidades.length
        ? habilidades.map((habilidade, i) =>
            `${i + 1}. ${habilidade}`
          ).join("\n")
        : "Nenhuma habilidade selecionada."
    ) +
    "\n\n" +
    "ECONOMIA\n" +
    `Moedas: ${user.coins}\n\n` +
    "━━━━━━━━━━━━━━━━━━━━\n" +
    "UTAH RPG"
  );
}

async function mostrarPerfilComGif(sock, msg, user) {
  return sendGifMessage(
    sock,
    msg,
    "perfil",
    mostrarPerfil(user)
  );
}

async function listarRacas(sock, msg) {
  const racas = Object.values(getRacas());

  let texto =
    "╔════════════════════════════╗\n" +
    "       ESCOLHA SUA RAÇA\n" +
    "╚════════════════════════════╝\n\n";

  racas.forEach((raca, index) => {
    texto +=
      `${index + 1}. ${raca.nome}\n` +
      `   ${raca.descricao}\n` +
      `   Aspectos: ${raca.aspectos.map(a => a.toUpperCase()).join(", ")}\n\n`;
  });

  texto +=
    "Para escolher:\n" +
    "Pperfil editar raça <número>\n\n" +
    "Exemplo: Pperfil editar raça 4";

  return sendGifMessage(
    sock,
    msg,
    "perfil_editar_raca",
    texto
  );
}

async function escolherRaca(sock, msg, argumento, user) {
  const racas = Object.values(getRacas());
  const numero = Number(argumento);

  if (
    !Number.isInteger(numero) ||
    numero < 1 ||
    numero > racas.length
  ) {
    return sendGifMessage(
      sock,
      msg,
      "erro",
      `Raça inválida.\n\nEscolha um número entre 1 e ${racas.length}.`
    );
  }

  const raca = racas[numero - 1];

  updateUser(user.id, {
    race: raca.nome
  });

  return sendGifMessage(
    sock,
    msg,
    "perfil_editar_raca",
    "RAÇA ALTERADA\n\n" +
    `Raça: ${raca.nome}\n` +
    `Descrição: ${raca.descricao}\n\n` +
    `Aspectos: ${raca.aspectos.map(a => a.toUpperCase()).join(", ")}\n\n` +
    "As habilidades anteriores foram mantidas.\n" +
    "Use Pperfil editar habilidade para visualizar as habilidades disponíveis."
  );
}

async function listarHabilidades(sock, msg, user) {
  if (!user.race) {
    return sendGifMessage(
      sock,
      msg,
      "erro",
      "Você ainda não escolheu uma raça.\n\n" +
      "Use:\n" +
      "Pperfil editar raça"
    );
  }

  const habilidades = getHabilidades(user.race);

  if (!habilidades.length) {
    return sendGifMessage(
      sock,
      msg,
      "erro",
      "Não existem habilidades cadastradas para sua raça."
    );
  }

  const selecionadas = obterHabilidadesDoUsuario(user);

  let texto =
    "╔════════════════════════════╗\n" +
    "      HABILIDADES DA RAÇA\n" +
    "╚════════════════════════════╝\n\n" +
    `Raça: ${user.race}\n` +
    `Selecionadas: ${selecionadas.length}/5\n\n`;

  habilidades.forEach((habilidade, index) => {
    const possui = selecionadas.some(
      item => normalizar(item) === normalizar(habilidade.nome)
    );

    const aspectos = habilidade.aspectos
      .map(aspecto => aspecto.toUpperCase())
      .join(" + ");

    const aspectoInfo = habilidade.aspectos
      .map(aspecto => getAspectos()[aspecto])
      .join(" | ");

    texto +=
      `${index + 1}. ${habilidade.nome}${possui ? " [ADQUIRIDA]" : ""}\n` +
      `   Aspecto: ${aspectos}\n` +
      `   Tipo: ${habilidade.tipo}\n` +
      `   Raridade: ${habilidade.raridade}\n` +
      `   Custo: ${habilidade.custo} moedas\n` +
      `   Requisito: ${habilidade.requisito}\n` +
      `   Descrição: ${habilidade.descricao}\n` +
      `   Efeito: ${habilidade.efeito}\n` +
      `   Aspectos: ${aspectoInfo}\n\n`;
  });

  texto +=
    "━━━━━━━━━━━━━━━━━━━━\n" +
    "Máximo: 5 habilidades\n\n" +
    "Para adquirir:\n" +
    "Pperfil editar habilidade <número>\n\n" +
    "Exemplo: Pperfil editar habilidade 1";

  return sendGifMessage(
    sock,
    msg,
    "perfil_editar_habilidade",
    texto
  );
}

async function adquirirHabilidade(sock, msg, argumento, user) {
  if (!user.race) {
    return sendGifMessage(
      sock,
      msg,
      "erro",
      "Escolha uma raça antes de adquirir habilidades."
    );
  }

  const numero = Number(argumento);

  if (!Number.isInteger(numero)) {
    return sendGifMessage(
      sock,
      msg,
      "erro",
      "Número de habilidade inválido.\n\n" +
      "Use Pperfil editar habilidade para ver a lista."
    );
  }

  const habilidades = getHabilidades(user.race);
  const habilidade = habilidades[numero - 1];

  if (!habilidade) {
    return sendGifMessage(
      sock,
      msg,
      "erro",
      `Habilidade inexistente.\n\nEscolha entre 1 e ${habilidades.length}.`
    );
  }

  const atuais = obterHabilidadesDoUsuario(user);

  if (atuais.length >= 5) {
    return sendGifMessage(
      sock,
      msg,
      "erro",
      "LIMITE DE HABILIDADES ATINGIDO\n\n" +
      "Seu personagem já possui 5/5 habilidades.\n" +
      "Não é possível adquirir uma sexta habilidade."
    );
  }

  const jaPossui = atuais.some(
    item => normalizar(item) === normalizar(habilidade.nome)
  );

  if (jaPossui) {
    return sendGifMessage(
      sock,
      msg,
      "erro",
      `Você já possui a habilidade "${habilidade.nome}".`
    );
  }

  if (habilidade.requisito !== "Nenhum") {
    const nivelNecessario = Number(
      habilidade.requisito.replace(/\D/g, "")
    );

    if (user.level < nivelNecessario) {
      return sendGifMessage(
        sock,
        msg,
        "erro",
        "NÍVEL INSUFICIENTE\n\n" +
        `Habilidade: ${habilidade.nome}\n` +
        `Requisito: ${habilidade.requisito}\n` +
        `Seu nível: ${user.level}`
      );
    }
  }

  if (user.coins < habilidade.custo) {
    return sendGifMessage(
      sock,
      msg,
      "erro",
      "MOEDAS INSUFICIENTES\n\n" +
      `Habilidade: ${habilidade.nome}\n` +
      `Custo: ${habilidade.custo} moedas\n` +
      `Suas moedas: ${user.coins}`
    );
  }

  const novasHabilidades = [
    ...atuais,
    habilidade.nome
  ];

  updateUser(user.id, {
    abilities: novasHabilidades,
    ability: habilidade.nome,
    abilityData: {
      nome: habilidade.nome,
      aspectos: habilidade.aspectos,
      aspectoPrincipal: habilidade.aspectoPrincipal,
      tipo: habilidade.tipo,
      raridade: habilidade.raridade,
      descricao: habilidade.descricao,
      efeito: habilidade.efeito
    },
    coins: user.coins - habilidade.custo
  });

  return sendGifMessage(
    sock,
    msg,
    "perfil_editar_habilidade",
    "HABILIDADE ADQUIRIDA\n\n" +
    `Habilidade: ${habilidade.nome}\n` +
    `Aspectos: ${habilidade.aspectos.map(a => a.toUpperCase()).join(" + ")}\n` +
    `Tipo: ${habilidade.tipo}\n` +
    `Raridade: ${habilidade.raridade}\n` +
    `Custo: ${habilidade.custo} moedas\n\n` +
    `${habilidade.descricao}\n\n` +
    `Efeito: ${habilidade.efeito}\n\n` +
    `Habilidades: ${novasHabilidades.length}/5\n` +
    `Moedas restantes: ${user.coins - habilidade.custo}`
  );
}

async function editarPerfil(sock, msg, args, user) {
  const opcao = normalizar(args[0]);

  if (!opcao) {
    return sendGifMessage(
      sock,
      msg,
      "perfil_editar",
      "╔════════════════════════════╗\n" +
      "        EDITAR PERFIL\n" +
      "╚════════════════════════════╝\n\n" +
      "Pperfil editar nome <nome>\n" +
      "Pperfil editar raça\n" +
      "Pperfil editar raça <número>\n" +
      "Pperfil editar habilidade\n" +
      "Pperfil editar habilidade <número>\n" +
      "Pperfil editar título <título>\n" +
      "Pperfil editar bio <texto>\n" +
      "Pperfil editar imagem"
    );
  }

  if (opcao === "nome") {
    const nome = args.slice(1).join(" ").trim();

    if (!nome) {
      return sendGifMessage(
        sock,
        msg,
        "erro",
        "Informe o novo nome."
      );
    }

    updateUser(user.id, {
      name: nome
    });

    return sendGifMessage(
      sock,
      msg,
      "perfil_editar_nome",
      `NOME ALTERADO\n\nSeu novo nome é: ${nome}`
    );
  }

  if (opcao === "raca") {
    if (!args[1]) {
      return listarRacas(sock, msg);
    }

    return escolherRaca(
      sock,
      msg,
      args[1],
      user
    );
  }

  if (opcao === "habilidade") {
    if (!args[1]) {
      return listarHabilidades(sock, msg, user);
    }

    return adquirirHabilidade(
      sock,
      msg,
      args[1],
      user
    );
  }

  if (opcao === "titulo") {
    const titulo = args.slice(1).join(" ").trim();

    if (!titulo) {
      return sendGifMessage(
        sock,
        msg,
        "erro",
        "Informe o novo título."
      );
    }

    updateUser(user.id, {
      title: titulo
    });

    return sendGifMessage(
      sock,
      msg,
      "perfil_editar_titulo",
      `TÍTULO ALTERADO\n\nNovo título: ${titulo}`
    );
  }

  if (opcao === "bio") {
    const bio = args.slice(1).join(" ").trim();

    if (!bio) {
      return sendGifMessage(
        sock,
        msg,
        "erro",
        "Informe a nova biografia."
      );
    }

    updateUser(user.id, {
      bio
    });

    return sendGifMessage(
      sock,
      msg,
      "perfil_editar_bio",
      "BIOGRAFIA ALTERADA\n\n" +
      bio
    );
  }

  if (opcao === "imagem") {
    const quoted = obterMensagemCitada(msg);
    const midia = analisarMidia(quoted);

    if (!midia) {
      return sendGifMessage(
        sock,
        msg,
        "erro",
        "Responda a uma imagem ou GIF usando:\n\n" +
        "Pperfil editar imagem"
      );
    }

    try {
      const {
        downloadContentFromMessage
      } = require("@whiskeysockets/baileys");

      fs.mkdirSync(mediaPath, {
        recursive: true
      });

      const extensao = midia.tipo === "gif"
        ? "gif"
        : midia.tipo;

      const nomeArquivo =
        `profile_${user.id.replace(/[^a-zA-Z0-9]/g, "_")}.${extensao}`;

      const caminho = path.join(
        mediaPath,
        nomeArquivo
      );

      for (const arquivo of fs.readdirSync(mediaPath)) {
        if (
          arquivo.startsWith(
            `profile_${user.id.replace(/[^a-zA-Z0-9]/g, "_")}.`
          )
        ) {
          fs.unlinkSync(
            path.join(mediaPath, arquivo)
          );
        }
      }

      const stream = await downloadContentFromMessage(
        midia.mensagem,
        midia.tipo === "gif" ? "video" : "image"
      );

      const chunks = [];

      for await (const chunk of stream) {
        chunks.push(chunk);
      }

      fs.writeFileSync(
        caminho,
        Buffer.concat(chunks)
      );

      updateUser(user.id, {
        profileImage: {
          file: caminho,
          type: midia.tipo
        }
      });

      return sendGifMessage(
        sock,
        msg,
        "perfil_editar_imagem",
        "IMAGEM DE PERFIL ALTERADA\n\n" +
        "A nova imagem foi salva no seu perfil."
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
        "Não foi possível salvar a imagem."
      );
    }
  }

  return sendGifMessage(
    sock,
    msg,
    "erro",
    "Opção de edição inválida.\n\n" +
    "Use Pperfil editar para ver as opções."
  );
}

async function perfil(sock, msg, args = []) {
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
      "Use Piniciar para começar sua jornada."
    );
  }

  if (
    normalizar(args[0]) === "editar"
  ) {
    return editarPerfil(
      sock,
      msg,
      args.slice(1),
      user
    );
  }

  return mostrarPerfilComGif(
    sock,
    msg,
    user
  );
}

module.exports = perfil;
