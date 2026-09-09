const fs = require("fs");

const arquivos = [
  "src/index.js",
  "src/commands/combate.js",
  "src/systems/users.js"
];

for (const arquivo of arquivos) {
  console.log("\n" + "=".repeat(70));
  console.log(arquivo);
  console.log("=".repeat(70));

  if (!fs.existsSync(arquivo)) {
    console.log("ARQUIVO NÃO ENCONTRADO");
    continue;
  }

  const linhas = fs.readFileSync(arquivo, "utf8").split("\n");

  const termos = [
    "group-participants.update",
    "participants",
    "maintenance",
    "systemConfig.enabled",
    "enabled",
    "getMessage",
    "vitória",
    "VITÓRIA",
    "derrotado",
    "DERROTA",
    "levelUp",
    "level up",
    "levelup"
  ];

  linhas.forEach((linha, i) => {
    if (termos.some(t => linha.toLowerCase().includes(t.toLowerCase()))) {
      console.log(`${i + 1}: ${linha}`);
    }
  });
}

console.log("\n" + "=".repeat(70));
console.log("FIM DO DIAGNÓSTICO — NENHUM ARQUIVO FOI ALTERADO.");
console.log("=".repeat(70));
