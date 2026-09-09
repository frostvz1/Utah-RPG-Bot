const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = path.join(__dirname, "src");
const COMMANDS = path.join(ROOT, "commands");
const INDEX = path.join(ROOT, "index.js");

const backupDir = path.join(
  __dirname,
  `backup-mensagens-${Date.now()}`
);

fs.mkdirSync(backupDir, { recursive: true });

const alterados = [];
const ignorados = [];
const problemas = [];

function backup(file) {
  const relative = path.relative(__dirname, file);
  const dest = path.join(backupDir, relative);

  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(file, dest);
}

function read(file) {
  return fs.readFileSync(file, "utf8");
}

function write(file, content) {
  fs.writeFileSync(file, content, "utf8");
}

function ensureImport(content, importLine) {
  if (content.includes(importLine)) return content;

  const lines = content.split("\n");

  let pos = 0;

  while (
    pos < lines.length &&
    (
      lines[pos].startsWith("const ") ||
      lines[pos].startsWith("require(") ||
      lines[pos].includes("require(")
    )
  ) {
    pos++;
  }

  lines.splice(pos, 0, importLine);

  return lines.join("\n");
}

function patchFile(file) {
  let content = read(file);
  const original = content;

  /*
   * SISTEMA DE MENSAGENS
   */
  content = ensureImport(
    content,
    'const { getMessage } = require("../systems/messages");'
  );

  /*
   * NÃO REGISTRADO
   */
  content = content.replace(
    /"Você ainda não possui um personagem\.\s*\\n\s*\\n"\s*\+\s*`Use \$\{prefix\}iniciar para começar sua jornada\.`/g,
    'getMessage("notRegistered") || (`Você ainda não possui um personagem.\\n\\nUse ${prefix}iniciar para começar sua jornada.`)'
  );

  content = content.replace(
    /"Você ainda não possui um personagem\.\s*\\n\s*\\n"\s*\+\s*`Use \$\{prefix\}iniciar para começar sua jornada\.`/g,
    'getMessage("notRegistered") || (`Você ainda não possui um personagem.\\n\\nUse ${prefix}iniciar para começar sua jornada.`)'
  );

  /*
   * FORMAS COMUNS DE "ACESSO NEGADO"
   */
  content = content.replace(
    /"Acesso negado\.[^"]*"/g,
    'getMessage("permissionDenied") || "Acesso negado."'
  );

  content = content.replace(
    /"Você não possui permissão para utilizar este comando\."/g,
    'getMessage("permissionDenied") || "Você não possui permissão para utilizar este comando."'
  );

  /*
   * VITÓRIA
   */
  content = content.replace(
    /"Vitória!"/g,
    'getMessage("victory") || "Vitória!"'
  );

  /*
   * DERROTA
   */
  content = content.replace(
    /"Você foi derrotado\."/g,
    'getMessage("defeat") || "Você foi derrotado."'
  );

  /*
   * LEVEL UP
   *
   * Mantém o texto original como fallback.
   */
  content = content.replace(
    /`Você subiu para o nível \$\{([^}]+)\}!`/g,
    'getMessage("levelUp", { level: $1 }) || `Você subiu para o nível ${$1}!`'
  );

  if (content !== original) {
    backup(file);
    write(file, content);
    alterados.push(path.relative(__dirname, file));
  } else {
    ignorados.push(path.relative(__dirname, file));
  }
}

console.log("");
console.log("========================================");
console.log(" UTAH RPG - INTEGRAÇÃO DE MENSAGENS");
console.log("========================================");
console.log("");

/*
 * COMMANDOS
 */
const files = fs
  .readdirSync(COMMANDS)
  .filter(file => file.endsWith(".js"));

for (const file of files) {
  patchFile(path.join(COMMANDS, file));
}

/*
 * INDEX.JS
 */
if (fs.existsSync(INDEX)) {
  let content = read(INDEX);
  const original = content;

  /*
   * Garante acesso ao sistema de mensagens.
   */
  if (!content.includes('require("./systems/messages")')) {
    const marker = 'const { getMessage } = require("./systems/messages");';

    if (!content.includes(marker)) {
      const lines = content.split("\n");

      let pos = 0;

      while (
        pos < lines.length &&
        (
          lines[pos].startsWith("const ") ||
          lines[pos].includes("require(")
        )
      ) {
        pos++;
      }

      lines.splice(pos, 0, marker);
      content = lines.join("\n");
    }
  }

  /*
   * COMANDO INEXISTENTE
   */
  content = content.replace(
    /Comando não encontrado\.[\s\S]*?visualizar os comandos\./g,
    'getMessage("commandNotFound") || `Comando não encontrado.\\n\\nUse ${activePrefix}menu para visualizar os comandos.`'
  );

  /*
   * ERRO INTERNO
   */
  content = content.replace(
    /Ocorreu um erro ao executar o comando\./g,
    'getMessage("internalError") || "Ocorreu um erro ao executar o comando."'
  );

  if (content !== original) {
    backup(INDEX);
    write(INDEX, content);
    alterados.push("src/index.js");
  } else {
    ignorados.push("src/index.js");
  }
}

/*
 * ANÁLISE FINAL
 */
console.log("BACKUP:");
console.log(`  ${backupDir}`);
console.log("");

console.log("ARQUIVOS ALTERADOS:");

if (alterados.length === 0) {
  console.log("  Nenhum arquivo precisou ser alterado.");
} else {
  for (const file of [...new Set(alterados)]) {
    console.log(`  + ${file}`);
  }
}

console.log("");
console.log("ARQUIVOS SEM ALTERAÇÃO:");

for (const file of [...new Set(ignorados)]) {
  console.log(`  - ${file}`);
}

console.log("");
console.log("VERIFICANDO SINTAXE JAVASCRIPT...");
console.log("");

let syntaxError = false;

const allJs = [];

function collect(dir) {
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    const stat = fs.statSync(full);

    if (stat.isDirectory()) {
      collect(full);
    } else if (item.endsWith(".js")) {
      allJs.push(full);
    }
  }
}

collect(ROOT);

for (const file of allJs) {
  try {
    execSync(`node --check "${file}"`, {
      stdio: "pipe"
    });
    console.log(`OK  ${path.relative(__dirname, file)}`);
  } catch (error) {
    syntaxError = true;
    console.log(`ERRO ${path.relative(__dirname, file)}`);

    const output =
      error.stderr?.toString() ||
      error.stdout?.toString() ||
      error.message;

    problemas.push({
      file: path.relative(__dirname, file),
      error: output
    });
  }
}

console.log("");
console.log("========================================");

if (syntaxError) {
  console.log("RESULTADO: EXISTEM ERROS DE SINTAXE");
  console.log("O backup foi preservado.");
} else {
  console.log("RESULTADO: SINTAXE OK");
}

console.log("========================================");
console.log("");

if (problemas.length > 0) {
  console.log("PROBLEMAS:");
  for (const problema of problemas) {
    console.log("");
    console.log(problema.file);
    console.log(problema.error);
  }
}

console.log("");
console.log("Integração concluída.");
