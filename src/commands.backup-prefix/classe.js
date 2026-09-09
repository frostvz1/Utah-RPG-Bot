const { getUser, updateUser } = require("../systems/users");
const { sendGifMessage } = require("../systems/gifEvents");

const classes = {
  1: {
    name: "Guerreiro",
    strength: 12,
    defense: 10,
    speed: 5,
    intelligence: 3
  },

  2: {
    name: "Mago",
    strength: 3,
    defense: 5,
    speed: 6,
    intelligence: 14
  },

  3: {
    name: "Assassino",
    strength: 9,
    defense: 4,
    speed: 14,
    intelligence: 7
  },

  4: {
    name: "Arqueiro",
    strength: 8,
    defense: 6,
    speed: 12,
    intelligence: 7
  },

  5: {
    name: "Paladino",
    strength: 9,
    defense: 14,
    speed: 4,
    intelligence: 8
  }
};

async function classe(sock, msg, args) {
  const userId =
    msg.key.participant ||
    msg.key.remoteJid;

  const user = getUser(userId);

  if (!user.registered) {
    return sendGifMessage(
      sock,
      msg,
      "classe",
      "Você ainda não possui um personagem.\n\n" +
      "Use ${prefix}iniciar para começar sua jornada."
    );
  }

  const action = args[0]?.toLowerCase();

  if (action === "escolher") {
    const choice = args[1];
    const selected = classes[choice];

    if (!selected) {
      return sendGifMessage(
        sock,
        msg,
        "classe",
        "Classe inválida.\n\n" +
        "1. Guerreiro\n" +
        "2. Mago\n" +
        "3. Assassino\n" +
        "4. Arqueiro\n" +
        "5. Paladino"
      );
    }

    if (user.class) {
      return sendGifMessage(
        sock,
        msg,
        "classe",
        `Você já escolheu a classe ${user.class}.\n\n` +
        "Sua classe poderá ser evoluída posteriormente."
      );
    }

    updateUser(userId, {
      class: selected.name,
      strength: selected.strength,
      defense: selected.defense,
      speed: selected.speed,
      intelligence: selected.intelligence
    });

    const text =
      "CLASSE DEFINIDA\n\n" +
      `Classe: ${selected.name}\n\n` +
      `Força: ${selected.strength}\n` +
      `Defesa: ${selected.defense}\n` +
      `Velocidade: ${selected.speed}\n` +
      `Inteligência: ${selected.intelligence}\n\n` +
      "Sua jornada começou.\n\n" +
      "Use ${prefix}aventura explorar para iniciar sua primeira aventura.";

    return sendGifMessage(
      sock,
      msg,
      "classe",
      text
    );
  }

  const text =
    "CLASSES DISPONÍVEIS\n\n" +
    "1. Guerreiro\n" +
    "2. Mago\n" +
    "3. Assassino\n" +
    "4. Arqueiro\n" +
    "5. Paladino\n\n" +
    "Escolha usando:\n" +
    "${prefix}classe escolher <número>";

  return sendGifMessage(
    sock,
    msg,
    "classe",
    text
  );
}

module.exports = classe;
