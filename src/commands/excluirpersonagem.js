const fs = require("fs");
const path = require("path");

const usersPath = path.join(
  __dirname,
  "../../database/users.json"
);

const guildsPath = path.join(
  __dirname,
  "../../database/guilds.json"
);

function loadJson(file, fallback) {
  try {
    if (!fs.existsSync(file)) {
      return fallback;
    }

    return JSON.parse(
      fs.readFileSync(file, "utf8")
    );
  } catch (error) {
    console.error(
      "[UTAH RPG] Erro ao carregar:",
      file,
      error
    );

    return fallback;
  }
}

function saveJson(file, data) {
  fs.writeFileSync(
    file,
    JSON.stringify(data, null, 2)
  );
}

async function excluirPersonagem(sock, msg, args) {
  const userId =
    msg.key.participant ||
    msg.key.remoteJid;

  if (!userId) {
    return;
  }

  const confirmacao =
    String(args[0] || "").toLowerCase();

  /*
   * PRIMEIRO PASSO:
   * apenas mostra o aviso.
   */
  if (confirmacao !== "confirmar") {
    return sock.sendMessage(
      msg.key.remoteJid,
      {
        text:
          "╔════════════════════════════╗\n" +
          "      EXCLUSÃO DE PERSONAGEM\n" +
          "╚════════════════════════════╝\n\n" +
          "Esta ação é permanente.\n\n" +
          "Serão apagados:\n" +
          "• Seu personagem\n" +
          "• Nível e XP\n" +
          "• Moedas\n" +
          "• Inventário\n" +
          "• Habilidades\n" +
          "• Classe e raça\n" +
          "• Progresso de aventura\n" +
          "• Guildas que você criou\n\n" +
          "Se você estiver em uma guilda criada por outra pessoa,\n" +
          "apenas será removido dela.\n\n" +
          "Para confirmar a exclusão, use:\n\n" +
          ";excluirpersonagem confirmar"
      },
      {
        quoted: msg
      }
    );
  }

  const users =
    loadJson(usersPath, {});

  if (!users[userId]) {
    return sock.sendMessage(
      msg.key.remoteJid,
      {
        text:
          "Você não possui um personagem registrado.\n\n" +
          "Use ;iniciar para criar um personagem."
      },
      {
        quoted: msg
      }
    );
  }

  /*
   * CARREGA GUILDAS
   */
  const guilds =
    loadJson(guildsPath, {});

  let guildasCriadas = 0;
  let guildasSaiu = 0;
  let convitesRemovidos = 0;

  /*
   * ANALISA TODAS AS GUILDAS
   */
  for (const guildId of Object.keys(guilds)) {
    const guild = guilds[guildId];

    if (!guild) {
      continue;
    }

    /*
     * SE O JOGADOR É O CRIADOR:
     * exclui a guilda inteira.
     */
    if (
      guild.creator &&
      guild.creator.id === userId
    ) {
      delete guilds[guildId];
      guildasCriadas++;
      continue;
    }

    /*
     * REMOVE O JOGADOR DOS MEMBROS.
     */
    if (Array.isArray(guild.members)) {
      const membrosAntes =
        guild.members.length;

      guild.members =
        guild.members.filter(
          member =>
            member.id !== userId
        );

      if (
        guild.members.length <
        membrosAntes
      ) {
        guildasSaiu++;
      }
    }

    /*
     * REMOVE CONVITES RELACIONADOS
     * AO PERSONAGEM EXCLUÍDO.
     */
    if (Array.isArray(guild.invites)) {
      const convitesAntes =
        guild.invites.length;

      guild.invites =
        guild.invites.filter(
          invite => {
            if (!invite) {
              return false;
            }

            return (
              invite.userId !== userId &&
              invite.targetId !== userId &&
              invite.to !== userId &&
              invite.id !== userId
            );
          }
        );

      convitesRemovidos +=
        convitesAntes -
        guild.invites.length;
    }
  }

  /*
   * SALVA GUILDAS ATUALIZADAS.
   */
  saveJson(
    guildsPath,
    guilds
  );

  /*
   * EXCLUI O PERSONAGEM.
   */
  delete users[userId];

  saveJson(
    usersPath,
    users
  );

  return sock.sendMessage(
    msg.key.remoteJid,
    {
      text:
        "╔════════════════════════════╗\n" +
        "       PERSONAGEM EXCLUÍDO\n" +
        "╚════════════════════════════╝\n\n" +
        "Seu personagem foi excluído permanentemente.\n\n" +
        `Guildas criadas excluídas: ${guildasCriadas}\n` +
        `Guildas das quais saiu: ${guildasSaiu}\n` +
        `Convites removidos: ${convitesRemovidos}\n\n` +
        "Todo o progresso do personagem foi apagado.\n\n" +
        "Para começar novamente, use:\n" +
        ";iniciar"
    },
    {
      quoted: msg
    }
  );
}

module.exports = excluirPersonagem;
