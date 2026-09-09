const { getUser, updateUser } = require("../systems/users");
const { sendGifMessage } = require("../systems/gifEvents");

const ITEMS = {
  pocao: {
    name: "Poção",
    heal: 50
  },

  energetico: {
    name: "Energético",
    energy: 50
  }
};

function normalizarItem(value) {
  return (value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function contarItem(inventory, itemId) {
  return inventory.filter(
    item => item === itemId
  ).length;
}

async function item(sock, msg, args) {
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
      "Use ${prefix}iniciar para começar sua jornada."
    );
  }

  const action =
    normalizarItem(args[0]);

  if (action !== "usar") {
    return sendGifMessage(
      sock,
      msg,
      "item",
      "╔════════════════════════════╗\n" +
      "          INVENTÁRIO\n" +
      "╚════════════════════════════╝\n\n" +
      "Use:\n\n" +
      "${prefix}item usar poção\n" +
      "${prefix}item usar energético\n\n" +
      "Os itens devem ser comprados na ${prefix}loja."
    );
  }

  const itemId =
    normalizarItem(args.slice(1).join("_"));

  if (!ITEMS[itemId]) {
    return sendGifMessage(
      sock,
      msg,
      "item_usar",
      "Item inválido.\n\n" +
      "Itens disponíveis:\n" +
      "Poção\n" +
      "Energético"
    );
  }

  const quantidade =
    contarItem(user.inventory, itemId);

  if (quantidade <= 0) {
    return sendGifMessage(
      sock,
      msg,
      "item_usar",
      `Você não possui ${ITEMS[itemId].name}.\n\n` +
      "Compre o item na ${prefix}loja."
    );
  }

  if (
    itemId === "pocao" &&
    user.hp >= user.maxHp
  ) {
    return sendGifMessage(
      sock,
      msg,
      "item_usar",
      "Seu HP já está completamente recuperado."
    );
  }

  if (
    itemId === "energetico" &&
    user.energy >= user.maxEnergy
  ) {
    return sendGifMessage(
      sock,
      msg,
      "item_usar",
      "Sua energia já está completamente recuperada."
    );
  }

  const inventory = [...user.inventory];

  const index =
    inventory.indexOf(itemId);

  inventory.splice(index, 1);

  if (itemId === "pocao") {
    const oldHp = user.hp;

    const newHp = Math.min(
      user.maxHp,
      user.hp + ITEMS[itemId].heal
    );

    updateUser(userId, {
      hp: newHp,
      inventory,
      lastRegeneration: Date.now()
    });

    return sendGifMessage(
      sock,
      msg,
      "item_usar",
      "╔════════════════════════════╗\n" +
      "          POÇÃO\n" +
      "╚════════════════════════════╝\n\n" +
      "Poção utilizada.\n\n" +
      `HP: +${newHp - oldHp}\n` +
      `HP atual: ${newHp}/${user.maxHp}\n\n` +
      `Poções restantes: ${contarItem(inventory, itemId)}`
    );
  }

  if (itemId === "energetico") {
    const oldEnergy = user.energy;

    const newEnergy = Math.min(
      user.maxEnergy,
      user.energy + ITEMS[itemId].energy
    );

    updateUser(userId, {
      energy: newEnergy,
      inventory,
      lastRegeneration: Date.now()
    });

    return sendGifMessage(
      sock,
      msg,
      "item_usar",
      "╔════════════════════════════╗\n" +
      "        ENERGÉTICO\n" +
      "╚════════════════════════════╝\n\n" +
      "Energético utilizado.\n\n" +
      `Energia: +${newEnergy - oldEnergy}\n` +
      `Energia atual: ${newEnergy}/${user.maxEnergy}\n\n` +
      `Energéticos restantes: ${contarItem(inventory, itemId)}`
    );
  }
}

module.exports = item;
