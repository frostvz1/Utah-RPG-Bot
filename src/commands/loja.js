const { getUser, updateUser } = require("../systems/users");
const { loadConfig } = require("../systems/config");
const { sendGifMessage } = require("../systems/gifEvents");
const { getMessage } = require("../systems/messages");

const ITEMS = {
  pocao: {
    name: "Poção",
    price: 25
  },

  energetico: {
    name: "Energético",
    price: 25
  }
};

function normalizar(value) {
  return (value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

async function loja(sock, msg, args) {
  const config = loadConfig();
  const prefix = config.prefix || "P";
  const userId =
    msg.key.participant ||
    msg.key.remoteJid;

  const user = getUser(userId);

  if (!user.registered) {
    return sendGifMessage(
      sock,
      msg,
      "erro",
      getMessage("notRegistered") || (`Você ainda não possui um personagem.\n\nUse ${prefix}iniciar para começar sua jornada.`)
    );
  }

  const action = normalizar(args[0]);

  if (action !== "comprar") {
    return sendGifMessage(
      sock,
      msg,
      "loja",
      "╔════════════════════════════╗\n" +
      "            LOJA\n" +
      "╚════════════════════════════╝\n\n" +
      "ITENS DE RECUPERAÇÃO\n\n" +
      "Poção\n" +
      "Recupera até 50 HP\n" +
      "Preço: 25 moedas\n\n" +
      "Energético\n" +
      "Recupera até 50 Energia\n" +
      "Preço: 25 moedas\n\n" +
      "COMPRAR\n" +
      `${prefix}loja comprar poção\n` +
      `${prefix}loja comprar energético`
    );
  }

  const itemId =
    normalizar(args.slice(1).join("_"));

  if (!ITEMS[itemId]) {
    return sendGifMessage(
      sock,
      msg,
      "item_comprar",
      "Item inválido.\n\n" +
      "Itens disponíveis:\n" +
      "Poção\n" +
      "Energético"
    );
  }

  const item = ITEMS[itemId];

  if (user.coins < item.price) {
    return sendGifMessage(
      sock,
      msg,
      "item_comprar",
      "Moedas insuficientes.\n\n" +
      `Item: ${item.name}\n` +
      `Preço: ${item.price} moedas\n` +
      `Saldo: ${user.coins} moedas\n` +
      `Faltam: ${item.price - user.coins} moedas`
    );
  }

  const inventory = [
    ...user.inventory,
    itemId
  ];

  updateUser(userId, {
    coins: user.coins - item.price,
    inventory
  });

  const quantidade =
    inventory.filter(
      item => item === itemId
    ).length;

  return sendGifMessage(
    sock,
    msg,
    "item_comprar",
    "╔════════════════════════════╗\n" +
    "       COMPRA REALIZADA\n" +
    "╚════════════════════════════╝\n\n" +
    `Item: ${item.name}\n` +
    `Quantidade: ${quantidade}\n` +
    `Valor: ${item.price} moedas\n\n` +
    `Saldo restante: ${user.coins - item.price} moedas\n\n` +
    "O item foi adicionado ao inventário."
  );
}

module.exports = loja;
