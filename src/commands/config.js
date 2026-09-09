const {
  isAdmin
} = require("../systems/permissions");

const {
  loadConfig,
  setConfig
} = require("../systems/config");

const {
  sendGifMessage
} = require("../systems/gifEvents");

async function configCommand(
  sock,
  msg,
  args
) {
  const sender =
    msg.key.participant ||
    msg.key.remoteJid;

  if (!isAdmin(sender)) {
    return sendGifMessage(
      sock,
      msg,
      "erro",
      require("../systems/messages").getMessage("permissionDenied") || "Acesso negado.\n\nEste comando é exclusivo para ADMs."
    );
  }

  const config = loadConfig();

  if (!args.length) {
    const text =
      "╔════════════════════════════╗\n" +
      "       CONFIGURAÇÕES ADM\n" +
      "╚════════════════════════════╝\n\n" +

      "1. GIFs\n" +
      "2. Combate\n" +
      "3. Economia\n" +
      "4. Grupo\n" +
      "5. Mensagens\n\n" +

      "Use:\n" +
      `${config.prefix}config 1\n` +
      `${config.prefix}config 2\n` +
      `${config.prefix}config 3\n` +
      `${config.prefix}config 4\n` +
      `${config.prefix}config 5\n\n` +

      "Ou:\n" +
      `${config.prefix}config gifs\n` +
      `${config.prefix}config combate\n` +
      `${config.prefix}config economia\n` +
      `${config.prefix}config grupo\n` +
      `${config.prefix}config mensagens\n\n` +

      "Configurações de identidade e estrutura:\n" +
      `Use ${config.prefix}configowner`;

    return sendGifMessage(
      sock,
      msg,
      "config",
      text
    );
  }

  const section =
    args[0].toLowerCase();

  const sections = {
    "1": "gifs",
    "2": "combate",
    "3": "economia",
    "4": "grupo",
    "5": "mensagens",

    gifs: "gifs",
    combate: "combate",
    economia: "economia",
    grupo: "grupo",
    mensagens: "mensagens"
  };

  const selected =
    sections[section];

  if (!selected) {
    return sendGifMessage(
      sock,
      msg,
      "erro",
      "Configuração não encontrada."
    );
  }

  if (selected === "gifs") {
    const action =
      args[1]?.toLowerCase();

    if (!action) {
      return sendGifMessage(
        sock,
        msg,
        "config",
        "CONFIGURAÇÃO DE GIFS\n\n" +
        `Status: ${
          config.gifs.enabled
            ? "ATIVO"
            : "DESATIVADO"
        }\n\n` +
        `Use ${config.prefix}config gifs on\n` +
        `ou ${config.prefix}config gifs off`
      );
    }

    if (
      action !== "on" &&
      action !== "off"
    ) {
      return sendGifMessage(
        sock,
        msg,
        "erro",
        "Use on ou off."
      );
    }

    setConfig(
      "gifs.enabled",
      action === "on"
    );

    return sendGifMessage(
      sock,
      msg,
      "sucesso",
      `GIFs ${
        action === "on"
          ? "ativados"
          : "desativados"
      }.`
    );
  }

  if (selected === "combate") {
    const action =
      args[1]?.toLowerCase();

    if (!action) {
      return sendGifMessage(
        sock,
        msg,
        "config",
        "CONFIGURAÇÃO DE COMBATE\n\n" +
        `Status: ${
          config.combat.enabled
            ? "ATIVO"
            : "DESATIVADO"
        }\n` +
        `Críticos: ${
          config.combat.criticalEnabled
            ? "ATIVOS"
            : "DESATIVADOS"
        }`
      );
    }

    if (
      action !== "on" &&
      action !== "off"
    ) {
      return sendGifMessage(
        sock,
        msg,
        "erro",
        "Use on ou off."
      );
    }

    setConfig(
      "combat.enabled",
      action === "on"
    );

    return sendGifMessage(
      sock,
      msg,
      "sucesso",
      `Sistema de combate ${
        action === "on"
          ? "ativado"
          : "desativado"
      }.`
    );
  }

  if (selected === "economia") {
    const action =
      args[1]?.toLowerCase();

    if (!action) {
      return sendGifMessage(
        sock,
        msg,
        "config",
        "CONFIGURAÇÃO DE ECONOMIA\n\n" +
        `Status: ${
          config.economy.enabled
            ? "ATIVO"
            : "DESATIVADO"
        }\n` +
        `Moedas iniciais: ${
          config.economy.startingCoins
        }`
      );
    }

    if (
      action === "on" ||
      action === "off"
    ) {
      setConfig(
        "economy.enabled",
        action === "on"
      );

      return sendGifMessage(
        sock,
        msg,
        "sucesso",
        `Economia ${
          action === "on"
            ? "ativada"
            : "desativada"
        }.`
      );
    }

    if (
      action === "moedas"
    ) {
      const value =
        Number(args[2]);

      if (
        !Number.isInteger(value) ||
        value < 0
      ) {
        return sendGifMessage(
          sock,
          msg,
          "erro",
          "Informe uma quantidade válida de moedas."
        );
      }

      setConfig(
        "economy.startingCoins",
        value
      );

      return sendGifMessage(
        sock,
        msg,
        "sucesso",
        `Moedas iniciais alteradas para ${value}.`
      );
    }

    return sendGifMessage(
      sock,
      msg,
      "erro",
      "Use on, off ou moedas <quantidade>."
    );
  }

  if (selected === "grupo") {
    const action =
      args[1]?.toLowerCase();

    if (!action) {
      return sendGifMessage(
        sock,
        msg,
        "config",
        "CONFIGURAÇÃO DE GRUPO\n\n" +
        `Status: ${
          config.group.enabled
            ? "ATIVO"
            : "DESATIVADO"
        }`
      );
    }

    if (
      action !== "on" &&
      action !== "off"
    ) {
      return sendGifMessage(
        sock,
        msg,
        "erro",
        "Use on ou off."
      );
    }

    setConfig(
      "group.enabled",
      action === "on"
    );

    return sendGifMessage(
      sock,
      msg,
      "sucesso",
      `Sistema de grupo ${
        action === "on"
          ? "ativado"
          : "desativado"
      }.`
    );
  }

  if (selected === "mensagens") {
    const type =
      args[1]?.toLowerCase();

    const action =
      args[2]?.toLowerCase();

    if (
      !type ||
      !action
    ) {
      return sendGifMessage(
        sock,
        msg,
        "config",
        "CONFIGURAÇÃO DE MENSAGENS\n\n" +
        `Welcome: ${
          config.messages.welcome
            ? "ATIVO"
            : "DESATIVADO"
        }\n` +
        `Erros: ${
          config.messages.errors
            ? "ATIVO"
            : "DESATIVADO"
        }\n\n` +
        `Use ${config.prefix}config mensagens welcome on/off\n` +
        `Use ${config.prefix}config mensagens erros on/off`
      );
    }

    if (
      action !== "on" &&
      action !== "off"
    ) {
      return sendGifMessage(
        sock,
        msg,
        "erro",
        "Use on ou off."
      );
    }

    if (
      type !== "welcome" &&
      type !== "erros"
    ) {
      return sendGifMessage(
        sock,
        msg,
        "erro",
        "Tipo de mensagem inválido."
      );
    }

    const path =
      type === "welcome"
        ? "messages.welcome"
        : "messages.errors";

    setConfig(
      path,
      action === "on"
    );

    return sendGifMessage(
      sock,
      msg,
      "sucesso",
      `Mensagens de ${type} ${
        action === "on"
          ? "ativadas"
          : "desativadas"
      }.`
    );
  }
}

module.exports = configCommand;
