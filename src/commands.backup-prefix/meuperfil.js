const fs = require("fs");

const {
  getUser
} = require("../systems/users");

const {
  getGuildByMember
} = require("../systems/guilds");

const {
  sendGifMessage
} = require("../systems/gifEvents");

function barraXP(xp, necessario) {
  const tamanho = 10;

  const progresso =
    necessario > 0
      ? Math.min(
          tamanho,
          Math.floor(
            (xp / necessario) * tamanho
          )
        )
      : 0;

  return (
    "█".repeat(progresso) +
    "░".repeat(tamanho - progresso)
  );
}

async function meuPerfil(sock, msg) {
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
      "Use ${prefix}iniciar para começar sua jornada."
    );
  }

  const guild =
    getGuildByMember(userId);

  const guildName =
    guild?.name || "Nenhuma";

  const member =
    guild?.members?.find(
      item => item.id === userId
    );

  const xpNecessario =
    user.level * 100;

  const raca =
    user.race ||
    user.species ||
    "Não definida";

  const habilidade =
    user.ability ||
    user.skills?.[0] ||
    "Nenhuma";

  const titulo =
    user.title ||
    "Aventureiro";

  const bio =
    user.bio ||
    "Este aventureiro ainda não possui uma biografia.";

  const text =
    "╔════════════════════════════╗\n" +
    "          MEU PERFIL\n" +
    "╚════════════════════════════╝\n\n" +

    `Nome: ${user.name}\n` +
    `Título: ${titulo}\n\n` +

    "PERSONAGEM\n" +
    `Raça: ${raca}\n` +
    `Classe: ${user.class || "Não definida"}\n` +
    `Habilidade: ${habilidade}\n\n` +

    "PROGRESSÃO\n" +
    `Nível: ${user.level}\n` +
    `XP: ${user.xp}/${xpNecessario}\n` +
    `${barraXP(user.xp, xpNecessario)}\n\n` +

    "ECONOMIA\n" +
    `Moedas: ${user.coins}\n\n` +

    "GUILDA\n" +
    `Guilda: ${guildName}\n` +
    `Cargo: ${member?.role || "Nenhum"}\n\n` +

    "BIOGRAFIA\n" +
    `${bio}\n\n` +

    "━━━━━━━━━━━━━━━━━━━━\n" +
    "UTAH RPG";

  /*
   * Se o jogador possuir uma imagem de perfil,
   * ela será utilizada no ${prefix}meuperfil.
   */
  if (
    user.profileImage?.file &&
    fs.existsSync(user.profileImage.file)
  ) {
    try {
      const buffer =
        fs.readFileSync(
          user.profileImage.file
        );

      const tipo =
        (
          user.profileImage.type ||
          ""
        ).toLowerCase();

      if (tipo === "gif") {
        return sock.sendMessage(
          msg.key.remoteJid,
          {
            video: buffer,
            gifPlayback: true,
            caption: text
          }
        );
      }

      return sock.sendMessage(
        msg.key.remoteJid,
        {
          image: buffer,
          caption: text
        }
      );

    } catch (error) {
      console.error(
        "[UTAH RPG] Erro ao carregar imagem do perfil:",
        error
      );
    }
  }

  return sendGifMessage(
    sock,
    msg,
    "meuperfil",
    text
  );
}

module.exports = meuPerfil;
