const {
  triggerGif
} = require("../systems/gifEvents");

async function testegif(sock, msg, args) {
  const event = args[0]?.toLowerCase();

  if (!event) {
    return sock.sendMessage(msg.key.remoteJid, {
      text:
        "Use:\n\n" +
        "Ptestegif despertar\n" +
        "Ptestegif atacar\n" +
        "Ptestegif vitoria"
    });
  }

  await triggerGif(
    sock,
    msg,
    event
  );

  await sock.sendMessage(msg.key.remoteJid, {
    text:
      `Evento GIF executado: ${event}`
  });
}

module.exports = testegif;
