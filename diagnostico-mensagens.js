const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "src");

const termos = [
  "Acesso negado",
  "não possui permissão",
  "Vitória",
  "Você foi derrotado",
  "subiu para o nível",
  "está em manutenção",
  "temporariamente desativado",
  "Bem-vindo",
  "saiu do grupo",
  "Comando não encontrado",
  "Ocorreu um erro ao executar"
];

function procurar(dir) {
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);

    if (
      full.includes("backup-") ||
      full.includes("node_modules")
    ) {
      continue;
    }

    const stat = fs.statSync(full);

    if (stat.isDirectory()) {
      procurar(full);
      continue;
    }

    if (!item.endsWith(".js")) continue;

    const linhas = fs.readFileSync(full, "utf8").split("\n");

    for (let i = 0; i < linhas.length; i++) {
      const linha = linhas[i];

      for (const termo of termos) {
        if (linha.toLowerCase().includes(termo.toLowerCase())) {
          console.log(
            `${path.relative(__dirname, full)}:${i + 1}`
          );
          console.log(`  ${linha.trim()}`);
          console.log("");
          break;
        }
      }
    }
  }
}

console.log("");
console.log("========================================");
console.log(" UTAH RPG - DIAGNÓSTICO DE MENSAGENS");
console.log("========================================");
console.log("");

procurar(root);

console.log("========================================");
console.log("DIAGNÓSTICO CONCLUÍDO");
console.log("Nenhum arquivo foi alterado.");
console.log("========================================");
