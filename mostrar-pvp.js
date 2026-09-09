const fs = require("fs");

function mostrar(arquivo, inicio, fim) {
  const linhas = fs.readFileSync(arquivo, "utf8").split("\n");

  console.log("\n" + "=".repeat(80));
  console.log(`${arquivo} — ${inicio}-${fim}`);
  console.log("=".repeat(80));

  for (let i = inicio; i <= Math.min(fim, linhas.length); i++) {
    console.log(`${String(i).padStart(4, " ")} | ${linhas[i - 1]}`);
  }
}

mostrar("src/commands/combate.js", 1, 180);
mostrar("src/systems/users.js", 1, 180);
mostrar("src/systems/abilities.js", 1, 180);
