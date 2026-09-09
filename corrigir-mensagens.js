const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const root = __dirname;
const commandsDir = path.join(root, "src", "commands");
const srcDir = path.join(root, "src");

function latestBackup() {
  const dirs = fs.readdirSync(root)
    .filter(x => x.startsWith("backup-mensagens-"))
    .map(x => ({
      name: x,
      time: fs.statSync(path.join(root, x)).mtimeMs
    }))
    .sort((a, b) => b.time - a.time);

  return dirs.length ? path.join(root, dirs[0].name) : null;
}

const backup = latestBackup();

if (!backup) {
  console.error("ERRO: backup-mensagens não encontrado.");
  process.exit(1);
}

console.log("");
console.log("========================================");
console.log(" UTAH RPG - CORREÇÃO DA INTEGRAÇÃO");
console.log("========================================");
console.log("");
console.log("Backup encontrado:");
console.log(backup);
console.log("");

/*
 * Restaurar somente os arquivos que apresentaram
 * erro de sintaxe a partir do backup.
 */
const problematic = [
  "combate.js",
  "config.js",
  "guildaaceitar.js",
  "guildaconvite.js",
  "guildaconvites.js",
  "guildamarcar.js",
  "guildamembros.js",
  "guildarecusar.js",
  "guildavincular.js",
  "testegif.js"
];

for (const file of problematic) {
  const original = path.join(backup, "src", "commands", file);
  const target = path.join(commandsDir, file);

  if (fs.existsSync(original)) {
    fs.copyFileSync(original, target);
    console.log(`RESTAURADO: src/commands/${file}`);
  }
}

/*
 * Restaurar index.js porque a alteração automática
 * deixou uma expressão inválida.
 */
const backupIndex = path.join(backup, "src", "index.js");
const currentIndex = path.join(srcDir, "index.js");

if (fs.existsSync(backupIndex)) {
  fs.copyFileSync(backupIndex, currentIndex);
  console.log("RESTAURADO: src/index.js");
}

console.log("");
console.log("Aplicando somente correções seguras...");
console.log("");

/*
 * Corrige automaticamente os imports dos comandos.
 *
 * O require será colocado no topo, fora de qualquer
 * destructuring ou chamada require existente.
 */
for (const file of fs.readdirSync(commandsDir)) {
  if (!file.endsWith(".js")) continue;

  const target = path.join(commandsDir, file);
  let content = fs.readFileSync(target, "utf8");

  if (
    content.includes('require("../systems/messages")')
  ) {
    continue;
  }

  const importLine =
    'const { getMessage } = require("../systems/messages");';

  const lines = content.split("\n");

  let insertAt = 0;

  while (
    insertAt < lines.length &&
    (
      lines[insertAt].trim().startsWith("const ") ||
      lines[insertAt].trim().startsWith("const{") ||
      lines[insertAt].trim().startsWith("let ") ||
      lines[insertAt].trim().startsWith("var ")
    )
  ) {
    insertAt++;
  }

  lines.splice(insertAt, 0, importLine);

  fs.writeFileSync(target, lines.join("\n"), "utf8");

  console.log(`IMPORT ADICIONADO: ${file}`);
}

/*
 * INDEX.JS
 *
 * Adiciona getMessage de forma segura.
 */
let index = fs.readFileSync(currentIndex, "utf8");

if (!index.includes('const { getMessage } = require("./systems/messages");')) {
  const lines = index.split("\n");

  let insertAt = 0;

  while (
    insertAt < lines.length &&
    (
      lines[insertAt].trim().startsWith("const ") ||
      lines[insertAt].trim().startsWith("let ") ||
      lines[insertAt].trim().startsWith("var ")
    )
  ) {
    insertAt++;
  }

  lines.splice(
    insertAt,
    0,
    'const { getMessage } = require("./systems/messages");'
  );

  index = lines.join("\n");
}

/*
 * Não fazemos substituições agressivas no index.
 *
 * O index original já possui a integração correta
 * do sistema de mensagens no fluxo principal.
 */
fs.writeFileSync(currentIndex, index, "utf8");

console.log("");
console.log("Verificando sintaxe...");
console.log("");

let errors = [];

function collect(dir) {
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    const stat = fs.statSync(full);

    if (stat.isDirectory()) {
      collect(full);
      continue;
    }

    if (
      item.endsWith(".js") &&
      !full.includes("backup-")
    ) {
      try {
        execSync(`node --check "${full}"`, {
          stdio: "pipe"
        });

        console.log(`OK  ${path.relative(root, full)}`);
      } catch (error) {
        errors.push({
          file: path.relative(root, full),
          output:
            error.stderr?.toString() ||
            error.stdout?.toString() ||
            error.message
        });

        console.log(`ERRO ${path.relative(root, full)}`);
      }
    }
  }
}

collect(srcDir);

console.log("");
console.log("========================================");

if (errors.length === 0) {
  console.log("RESULTADO: SINTAXE 100% OK");
} else {
  console.log("RESULTADO: AINDA EXISTEM ERROS");
  console.log("");

  for (const error of errors) {
    console.log(`--- ${error.file} ---`);
    console.log(error.output);
  }
}

console.log("========================================");
console.log("");

if (errors.length === 0) {
  console.log("A correção foi concluída.");
  console.log("O UTAH RPG está com os arquivos JavaScript válidos.");
} else {
  console.log("O backup original continua preservado.");
}
