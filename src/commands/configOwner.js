const fs = require("fs");
const path = require("path");
const { getMessage } = require("../systems/messages");

const {
  downloadContentFromMessage
} = require("@whiskeysockets/baileys");

const {
  isOwner,
  addAdmin,
  removeAdmin,
  loadPermissions
} = require("../systems/permissions");

const {
  loadConfig,
  setConfig,
  getDefaultMenu,
  resetMenu,
  resetConfig,
  getDefaultMessages,
  resetMessages,
  resetMessage,
  setMessage,
  setMessageEnabled
} = require("../systems/config");

const {
  sendGifMessage
} = require("../systems/gifEvents");

function getSender(msg) {
  return (
    msg.key.participant ||
    msg.key.remoteJid
  );
}

function obterMensagemCitada(msg) {
  return (
    msg.message?.extendedTextMessage
      ?.contextInfo
      ?.quotedMessage ||
    msg.message?.imageMessage
      ?.contextInfo
      ?.quotedMessage ||
    msg.message?.videoMessage
      ?.contextInfo
      ?.quotedMessage ||
    null
  );
}

function obterTextoCitado(msg) {
  const quoted =
    obterMensagemCitada(msg);

  if (!quoted) {
    return null;
  }

  return (
    quoted.conversation ||
    quoted.extendedTextMessage?.text ||
    quoted.imageMessage?.caption ||
    quoted.videoMessage?.caption ||
    null
  );
}

function obterImagemCitada(msg) {
  const quoted =
    obterMensagemCitada(msg);

  if (!quoted) {
    return null;
  }

  if (quoted.imageMessage) {
    return {
      type: "image",
      data: quoted.imageMessage
    };
  }

  return null;
}

async function salvarImagemRPG(
  msg
) {
  const imagem =
    obterImagemCitada(msg);

  if (!imagem) {
    return null;
  }

  const dir =
    path.join(
      __dirname,
      "../../media/rpg"
    );

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, {
      recursive: true
    });
  }

  const filePath =
    path.join(
      dir,
      "rpg-image.jpg"
    );

  const stream =
    await downloadContentFromMessage(
      imagem.data,
      "image"
    );

  const chunks = [];

  for await (
    const chunk of stream
  ) {
    chunks.push(chunk);
  }

  fs.writeFileSync(
    filePath,
    Buffer.concat(chunks)
  );

  return filePath;
}

async function configOwner(
  sock,
  msg,
  args
) {
  const sender =
    getSender(msg);

  if (!isOwner(sender)) {
    return sendGifMessage(
      sock,
      msg,
      "erro",
      getMessage("permissionDenied") || "Acesso negado."
    );
  }

  const config = loadConfig();
  const prefix =
    config.prefix || "P";

  if (!args.length) {
    const text =
      "╔════════════════════════════╗\n" +
      "      CONFIGURAÇÕES OWNER\n" +
      "╚════════════════════════════╝\n\n" +

      "1. Identidade do RPG\n" +
      "2. Prefixo\n" +
      "3. Imagem do RPG\n" +
      "4. Pmenu\n" +
      "5. Administradores\n" +
      "6. Sistema / Manutenção\n" +
      "7. Banco de dados\n" +
      "8. Global\n\n" +

      "Use:\n" +
      `${prefix}configowner 1\n` +
      `${prefix}configowner 2\n` +
      `${prefix}configowner 3\n` +
      `${prefix}configowner 4\n` +
      `${prefix}configowner 5\n` +
      `${prefix}configowner 6\n` +
      `${prefix}configowner 7\n` +
      `${prefix}configowner 8\n\n` +

      "Também é possível usar os nomes das opções.";

    return sendGifMessage(
      sock,
      msg,
      "configowner",
      text
    );
  }

  const option =
    args[0].toLowerCase();

  if (
    option === "1" ||
    option === "rpg" ||
    option === "identidade"
  ) {
    const action =
      args[1]?.toLowerCase();

    if (!action) {
      return sendGifMessage(
        sock,
        msg,
        "configowner",
        "IDENTIDADE DO RPG\n\n" +
        `Nome: ${config.name}\n` +
        `Descrição: ${config.description}\n` +
        `Versão: ${config.version}\n\n` +
        `Use ${prefix}configowner rpg nome <novo nome>\n` +
        `Use ${prefix}configowner rpg descricao <texto>`
      );
    }

    if (
      action === "nome"
    ) {
      const name =
        args.slice(2).join(" ").trim();

      if (!name) {
        return sendGifMessage(
          sock,
          msg,
          "erro",
          "Informe o novo nome do RPG."
        );
      }

      setConfig(
        "name",
        name
      );

      return sendGifMessage(
        sock,
        msg,
        "sucesso",
        `Nome do RPG alterado para:\n${name}`
      );
    }

    if (
      action === "descricao"
    ) {
      const description =
        args.slice(2).join(" ").trim();

      if (!description) {
        return sendGifMessage(
          sock,
          msg,
          "erro",
          "Informe a nova descrição."
        );
      }

      setConfig(
        "description",
        description
      );

      return sendGifMessage(
        sock,
        msg,
        "sucesso",
        "Descrição do RPG atualizada."
      );
    }

    return sendGifMessage(
      sock,
      msg,
      "erro",
      "Opção de identidade inválida."
    );
  }

  if (
    option === "2" ||
    option === "prefixo"
  ) {
    const newPrefix =
      args[1]?.trim();

    if (!newPrefix) {
      return sendGifMessage(
        sock,
        msg,
        "configowner",
        `Prefixo atual: ${prefix}\n\n` +
        `Use ${prefix}configowner prefixo <novo prefixo>`
      );
    }

    if (
      newPrefix.length > 3
    ) {
      return sendGifMessage(
        sock,
        msg,
        "erro",
        "O prefixo pode ter no máximo 3 caracteres."
      );
    }

    setConfig(
      "prefix",
      newPrefix
    );

    return sendGifMessage(
      sock,
      msg,
      "sucesso",
      `Prefixo alterado com sucesso.\n\n` +
      `Novo prefixo: ${newPrefix}\n\n` +
      `A partir de agora, utilize ${newPrefix} para os comandos.`
    );
  }

  if (
    option === "3" ||
    option === "imagem"
  ) {
    const action =
      args[1]?.toLowerCase();

    if (
      action === "remover"
    ) {
      const oldImage =
        config.image;

      if (
        oldImage &&
        fs.existsSync(oldImage)
      ) {
        try {
          fs.unlinkSync(oldImage);
        } catch {}
      }

      setConfig(
        "image",
        null
      );

      return sendGifMessage(
        sock,
        msg,
        "sucesso",
        "Imagem do RPG removida."
      );
    }

    try {
      const filePath =
        await salvarImagemRPG(msg);

      if (!filePath) {
        return sendGifMessage(
          sock,
          msg,
          "erro",
          "Para definir a imagem, responda a uma imagem com:\n\n" +
          `${prefix}configowner imagem`
        );
      }

      setConfig(
        "image",
        filePath
      );

      return sendGifMessage(
        sock,
        msg,
        "sucesso",
        "Imagem do RPG configurada com sucesso."
      );

    } catch (error) {
      console.error(
        "[CONFIG OWNER] Erro ao salvar imagem:",
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

  if (
    option === "4" ||
    option === "menu"
  ) {
    const action =
      args[1]?.toLowerCase();

    if (!action) {
      const status =
        config.menu?.custom
          ? "PERSONALIZADO"
          : "PADRÃO";

      return sendGifMessage(
        sock,
        msg,
        "configowner",
        "CONFIGURAÇÃO DO PMENU\n\n" +
        `Status: ${status}\n\n` +
        "Comandos:\n" +
        `${prefix}configowner menu ver\n` +
        `${prefix}configowner menu definir\n` +
        `${prefix}configowner menu reset\n\n` +
        "Para definir um menu personalizado:\n" +
        "1. Envie uma mensagem com o menu desejado.\n" +
        "2. Responda essa mensagem com:\n" +
        `${prefix}configowner menu definir\n\n` +
        "Variáveis disponíveis:\n" +
        "{name} = nome do RPG\n" +
        "{prefix} = prefixo atual"
      );
    }

    if (
      action === "ver"
    ) {
      const menuText =
        config.menu?.text ||
        getDefaultMenu();

      return sendGifMessage(
        sock,
        msg,
        "configowner",
        "PMENU ATUAL\n\n" +
        menuText
          .replace(
            /\{prefix\}/g,
            prefix
          )
          .replace(
            /\{name\}/g,
            config.name
          )
      );
    }

    if (
      action === "reset"
    ) {
      resetMenu();

      return sendGifMessage(
        sock,
        msg,
        "sucesso",
        "Pmenu restaurado para o modelo padrão."
      );
    }

    if (
      action === "definir"
    ) {
      const menuText =
        obterTextoCitado(msg);

      if (!menuText) {
        return sendGifMessage(
          sock,
          msg,
          "erro",
          "Você precisa responder a uma mensagem de texto com:\n\n" +
          `${prefix}configowner menu definir`
        );
      }

      setConfig(
        "menu.text",
        menuText
      );

      setConfig(
        "menu.custom",
        true
      );

      return sendGifMessage(
        sock,
        msg,
        "sucesso",
        "Pmenu personalizado configurado com sucesso."
      );
    }

    return sendGifMessage(
      sock,
      msg,
      "erro",
      "Opção de menu inválida."
    );
  }

  if (
    option === "5" ||
    option === "admins" ||
    option === "administradores"
  ) {
    const action =
      args[1]?.toLowerCase();

    const permissions =
      loadPermissions();

    if (!action) {
      const list =
        permissions.admins.length
          ? permissions.admins
              .map(
                (number, index) =>
                  `${index + 1}. ${number}`
              )
              .join("\n")
          : "Nenhum ADM cadastrado.";

      return sendGifMessage(
        sock,
        msg,
        "configowner",
        "ADMINISTRADORES\n\n" +
        list +
        "\n\n" +
        `Adicionar:\n${prefix}configowner admins add <numero>\n\n` +
        `Remover:\n${prefix}configowner admins remove <numero>`
      );
    }

    if (
      action === "add"
    ) {
      const number =
        args[2];

      if (!number) {
        return sendGifMessage(
          sock,
          msg,
          "erro",
          "Informe o número do ADM."
        );
      }

      const result =
        addAdmin(number);

      return sendGifMessage(
        sock,
        msg,
        result
          ? "sucesso"
          : "erro",
        result
          ? `ADM ${number} adicionado com sucesso.`
          : "Não foi possível adicionar este ADM."
      );
    }

    if (
      action === "remove"
    ) {
      const number =
        args[2];

      if (!number) {
        return sendGifMessage(
          sock,
          msg,
          "erro",
          "Informe o número do ADM."
        );
      }

      const result =
        removeAdmin(number);

      return sendGifMessage(
        sock,
        msg,
        result
          ? "sucesso"
          : "erro",
        result
          ? `ADM ${number} removido com sucesso.`
          : "ADM não encontrado."
      );
    }

    return sendGifMessage(
      sock,
      msg,
      "erro",
      "Use add ou remove."
    );
  }

  if (
    option === "6" ||
    option === "sistema"
  ) {
    const action =
      args[1]?.toLowerCase();

    if (!action) {
      return sendGifMessage(
        sock,
        msg,
        "configowner",
        "SISTEMA\n\n" +
        `Status: ${
          config.enabled
            ? "ATIVO"
            : "DESATIVADO"
        }\n` +
        `Manutenção: ${
          config.maintenance
            ? "ATIVA"
            : "DESATIVADA"
        }\n\n` +
        `Use ${prefix}configowner sistema on/off\n` +
        `Use ${prefix}configowner sistema manutencao on/off`
      );
    }

    if (
      action === "on" ||
      action === "off"
    ) {
      setConfig(
        "enabled",
        action === "on"
      );

      return sendGifMessage(
        sock,
        msg,
        "sucesso",
        `Sistema ${
          action === "on"
            ? "ativado"
            : "desativado"
        }.`
      );
    }

    if (
      action === "manutencao"
    ) {
      const value =
        args[2]?.toLowerCase();

      if (
        value !== "on" &&
        value !== "off"
      ) {
        return sendGifMessage(
          sock,
          msg,
          "erro",
          "Use manutencao on ou off."
        );
      }

      setConfig(
        "maintenance",
        value === "on"
      );

      return sendGifMessage(
        sock,
        msg,
        "sucesso",
        `Modo manutenção ${
          value === "on"
            ? "ativado"
            : "desativado"
        }.`
      );
    }

    return sendGifMessage(
      sock,
      msg,
      "erro",
      "Configuração de sistema inválida."
    );
  }

  if (
    option === "9" ||
    option === "mensagens"
  ) {
    const messages = loadConfig().messages || {};

    const nomes = {
      welcome: "Boas-vindas",
      leave: "Saída do grupo",
      commandNotFound: "Comando inexistente",
      internalError: "Erro interno",
      permissionDenied: "Sem permissão",
      maintenance: "Manutenção",
      disabled: "Bot desativado",
      notRegistered: "Usuário não registrado",
      alreadyRegistered: "Personagem já existente",
      victory: "Vitória",
      defeat: "Derrota",
      levelUp: "Level Up"
    };

    const keys = Object.keys(nomes);

    const acao = args[1]?.toLowerCase();

    if (!acao) {
      let texto =
        "╔════════════════════════════╗\n" +
        "      MENSAGENS AUTOMÁTICAS\n" +
        "╚════════════════════════════╝\n\n";

      keys.forEach((key, index) => {
        const status =
          messages[key]?.enabled === false
            ? "DESATIVADA"
            : "ATIVA";

        texto +=
          `${index + 1}. ${nomes[key]} — ${status}\n`;
      });

      texto +=
        "\nCOMANDOS\n" +
        `${prefix}configowner mensagens ver <número>\n` +
        `${prefix}configowner mensagens editar <número> <texto>\n` +
        `${prefix}configowner mensagens ativar <número>\n` +
        `${prefix}configowner mensagens desativar <número>\n` +
        `${prefix}configowner mensagens resetar <número>\n` +
        `${prefix}configowner mensagens resetar todas\n\n` +
        "VARIÁVEIS DISPONÍVEIS\n" +
        "{user} = usuário\n" +
        "{name} = nome do RPG\n" +
        "{prefix} = prefixo atual\n" +
        "{group} = grupo\n" +
        "{level} = nível\n" +
        "{coins} = moedas\n" +
        "{hp} = HP atual\n" +
        "{maxHp} = HP máximo\n" +
        "{energy} = energia atual\n" +
        "{maxEnergy} = energia máxima";

      return sendGifMessage(
        sock,
        msg,
        "configowner",
        texto
      );
    }

    if (
      acao === "ver" ||
      acao === "visualizar"
    ) {
      const numero =
        Number(args[2]);

      if (
        !Number.isInteger(numero) ||
        numero < 1 ||
        numero > keys.length
      ) {
        return sendGifMessage(
          sock,
          msg,
          "erro",
          `Informe um número entre 1 e ${keys.length}.`
        );
      }

      const key = keys[numero - 1];
      const message = messages[key];

      return sendGifMessage(
        sock,
        msg,
        "configowner",
        `MENSAGEM: ${nomes[key]}\n\n` +
        `Status: ${
          message?.enabled === false
            ? "DESATIVADA"
            : "ATIVA"
        }\n\n` +
        `${message?.text || "Sem texto configurado."}`
      );
    }

    if (
      acao === "editar"
    ) {
      const numero =
        Number(args[2]);

      if (
        !Number.isInteger(numero) ||
        numero < 1 ||
        numero > keys.length
      ) {
        return sendGifMessage(
          sock,
          msg,
          "erro",
          `Informe um número entre 1 e ${keys.length}.`
        );
      }

      const novoTexto =
        args.slice(3).join(" ").trim();

      if (!novoTexto) {
        return sendGifMessage(
          sock,
          msg,
          "erro",
          `Informe o novo texto.\n\nExemplo:\n${prefix}configowner mensagens editar ${numero} Bem-vindo, {user}!`
        );
      }

      const key = keys[numero - 1];

      setMessage(
        key,
        novoTexto
      );

      return sendGifMessage(
        sock,
        msg,
        "sucesso",
        `Mensagem "${nomes[key]}" atualizada com sucesso.`
      );
    }

    if (
      acao === "ativar" ||
      acao === "desativar"
    ) {
      const numero =
        Number(args[2]);

      if (
        !Number.isInteger(numero) ||
        numero < 1 ||
        numero > keys.length
      ) {
        return sendGifMessage(
          sock,
          msg,
          "erro",
          `Informe um número entre 1 e ${keys.length}.`
        );
      }

      const key = keys[numero - 1];

      setMessageEnabled(
        key,
        acao === "ativar"
      );

      return sendGifMessage(
        sock,
        msg,
        "sucesso",
        `Mensagem "${nomes[key]}" ${
          acao === "ativar"
            ? "ativada"
            : "desativada"
        } com sucesso.`
      );
    }

    if (
      acao === "resetar"
    ) {
      const alvo =
        args[2]?.toLowerCase();

      if (
        alvo === "todas" ||
        alvo === "tudo"
      ) {
        resetMessages();

        return sendGifMessage(
          sock,
          msg,
          "sucesso",
          "Todas as mensagens automáticas foram restauradas para o padrão."
        );
      }

      const numero =
        Number(alvo);

      if (
        !Number.isInteger(numero) ||
        numero < 1 ||
        numero > keys.length
      ) {
        return sendGifMessage(
          sock,
          msg,
          "erro",
          `Informe um número entre 1 e ${keys.length}, ou use "todas".`
        );
      }

      const key = keys[numero - 1];

      resetMessage(key);

      return sendGifMessage(
        sock,
        msg,
        "sucesso",
        `Mensagem "${nomes[key]}" restaurada para o padrão.`
      );
    }

    return sendGifMessage(
      sock,
      msg,
      "erro",
      "Ação de mensagens não reconhecida."
    );
  }

  if (
    option === "7" ||
    option === "banco"
  ) {
    const action =
      args[1]?.toLowerCase();

    if (
      action === "reset"
    ) {
      resetConfig();

      return sendGifMessage(
        sock,
        msg,
        "sucesso",
        "Banco de configurações restaurado para os valores padrão."
      );
    }

    return sendGifMessage(
      sock,
      msg,
      "configowner",
      "BANCO DE DADOS\n\n" +
      "Arquivo:\n" +
      "database/config.json\n\n" +
      "Use:\n" +
      `${prefix}configowner banco reset`
    );
  }

  if (
    option === "8" ||
    option === "global"
  ) {
    const action =
      args[1]?.toLowerCase();

    if (
      action === "reset"
    ) {
      resetConfig();

      return sendGifMessage(
        sock,
        msg,
        "sucesso",
        "Todas as configurações globais foram restauradas."
      );
    }

    return sendGifMessage(
      sock,
      msg,
      "configowner",
      "CONFIGURAÇÕES GLOBAIS\n\n" +
      `Nome: ${config.name}\n` +
      `Prefixo: ${config.prefix}\n` +
      `Versão: ${config.version}\n` +
      `Sistema: ${
        config.enabled
          ? "ATIVO"
          : "DESATIVADO"
      }\n` +
      `Manutenção: ${
        config.maintenance
          ? "ATIVA"
          : "DESATIVADA"
      }\n` +
      `Imagem: ${
        config.image
          ? "CONFIGURADA"
          : "NÃO CONFIGURADA"
      }\n` +
      `Pmenu: ${
        config.menu?.custom
          ? "PERSONALIZADO"
          : "PADRÃO"
      }\n\n` +
      `Use ${prefix}configowner global reset para restaurar tudo.`
    );
  }

  return sendGifMessage(
    sock,
    msg,
    "erro",
    "Configuração Owner não encontrada."
  );
}

module.exports = configOwner;
