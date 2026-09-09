const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const root = __dirname;
const commandsDir = path.join(root, "src", "commands");
const srcDir = path.join(root, "src");

const backups = fs.readdirSync(root)
  .filter(name => name.startsWith("backup-mensagens-"))
  .map(name => ({
    name,
    time: fs.statSync(path.join(root, name)).mtimeMs
  }))
  .sort((a, b) => b.time - a.time);

if (!backups.length) {
  console.error("ERRO: nenhum backup-mensagens encontrado.");
  process.exit(1);
}

const backup = path.join(root, backups[0].name);

const files = [
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

console.log("");
console.log("========================================");
console.log(" RESTAURAÇÃO SEGURA - UTAH RPG");
console.log("========================================");
console.log("");
console.log("Backup utilizado:");
console.log(backup);
console.log("");

for (const file of files) {
  const source = path.join(backup, "src", "commands", file);
  const target = path.join(commandsDir, file);

  if (fs.existsSync(source)) {
    fs.copyFileSync(source, target);
    console.log(`RESTAURADO: ${file}`);
  } else {
    console.log(`AVISO: backup não possui ${file}`);
  }
}

/*
 * index.js também volta ao estado seguro do backup.
 */
const backupIndex = path.join(backup, "src", "index.js");
const index = path.join(srcDir, "index.js");

if (fs.existsSync(backupIndex)) {
  fs.copyFileSync(backupIndex, index);
  console.log("RESTAURADO: src/index.js");
}

console.log("");
console.log("Verificando todos os arquivos JavaScript...");
console.log("");

const errors = [];

function scan(dir) {
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);

    if (full.includes("backup-")) continue;

    const stat = fs.statSync(full);

    if (stat.isDirectory()) {
      scan(full);
      continue;
    }

    if (!item.endsWith(".js")) continue;

    try {
      execSync(`node --check "${full}"`, {
        stdio: "pipe"
      });

      console.log(`OK    ${path.relative(root, full)}`);
    } catch (error) {
      errors.push({
        file: path.relative(root, full),
        output:
          error.stderr?.toString() ||
          error.stdout?.toString() ||
          error.message
      });

      console.log(`ERRO  ${path.relative(root, full)}`);
    }
  }
}

scan(srcDir);

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
