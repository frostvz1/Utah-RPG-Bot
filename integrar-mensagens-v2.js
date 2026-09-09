const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const root = __dirname;
const src = path.join(root, "src");
const commands = path.join(src, "commands");

const stamp = Date.now();
const backup = path.join(root, `backup-integracao-${stamp}`);

fs.mkdirSync(backup, { recursive: true });

const alterados = [];
const erros = [];

function copiarBackup(file) {
  const rel = path.relative(root, file);
  const destino = path.join(backup, rel);

  fs.mkdirSync(path.dirname(destino), { recursive: true });
  fs.copyFileSync(file, destino);
}

function todosJS(dir) {
  const resultado = [];

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
      resultado.push(...todosJS(full));
    } else if (item.endsWith(".js")) {
      resultado.push(full);
    }
  }

  return resultado;
}

function substituir(file, replacements) {
  let content = fs.readFileSync(file, "utf8");
  const original = content;
  let count = 0;

  for (const replacement of replacements) {
    if (!content.includes(replacement.from)) {
      continue;
    }

    content = content.replace(
      replacement.from,
      replacement.to
    );

    count++;
  }

  if (content !== original) {
    copiarBackup(file);
    fs.writeFileSync(file, content, "utf8");
    alterados.push({
      file: path.relative(root, file),
      count
    });
  }
}

/*
 * CONFIG.JS
 */
const configFile = path.join(commands, "config.js");

substituir(configFile, [
  {
    from: '"Acesso negado.\\n\\nEste comando é exclusivo para ADMs."',
    to: 'require("../systems/messages").getMessage("permissionDenied") || "Acesso negado.\\n\\nEste comando é exclusivo para ADMs."'
  }
]);

/*
 * GIF.JS
 */
const gifFile = path.join(commands, "gif.js");

substituir(gifFile, [
  {
    from: '"Você não possui permissão para configurar GIFs."',
    to: 'require("../systems/messages").getMessage("permissionDenied") || "Você não possui permissão para configurar GIFs."'
  }
]);

/*
 * GUILDACONVITE.JS
 */
const convite = path.join(commands, "guildaconvite.js");

substituir(convite, [
  {
    from: '"Você não possui permissão para convidar membros.\\n\\n"',
    to: '(require("../systems/messages").getMessage("permissionDenied") || "Você não possui permissão para convidar membros.\\n\\n")'
  }
]);

/*
 * GUILDAMARCAR.JS
 */
const marcar = path.join(commands, "guildamarcar.js");

substituir(marcar, [
  {
    from: '"Você não possui permissão para marcar a guilda.\\n\\n"',
    to: '(require("../systems/messages").getMessage("permissionDenied") || "Você não possui permissão para marcar a guilda.\\n\\n")'
  }
]);

/*
 * COMBATE.JS
 *
 * O cabeçalho VITÓRIA é transformado em mensagem configurável.
 */
const combate = path.join(commands, "combate.js");

substituir(combate, [
  {
    from: '"          VITÓRIA\\n" +',
    to: '("          " + (require("../systems/messages").getMessage("victory") || "VITÓRIA") + "\\n") +'
  },
  {
    from: '"VITÓRIA\\n" +',
    to: '((require("../systems/messages").getMessage("victory") || "VITÓRIA") + "\\n") +'
  },
  {
    from: '"Você foi derrotado."',
    to: '(require("../systems/messages").getMessage("defeat") || "Você foi derrotado.")'
  },
  {
    from: '"DERROTA"',
    to: '(require("../systems/messages").getMessage("defeat") || "DERROTA")'
  }
]);

/*
 * INDEX.JS
 */
const index = path.join(src, "index.js");

substituir(index, [
  {
    from: '"Comando não encontrado.\\n\\n" +',
    to: '(require("./systems/messages").getMessage("commandNotFound") || "Comando não encontrado.\\n\\n") +'
  },
  {
    from: '"Ocorreu um erro ao executar o comando."',
    to: '(require("./systems/messages").getMessage("internalError") || "Ocorreu um erro ao executar o comando.")'
  }
]);

/*
 * PROCURA E TENTA INTEGRAR LEVEL UP EM TODOS OS COMANDOS.
 */
for (const file of todosJS(commands)) {
  let content = fs.readFileSync(file, "utf8");
  const original = content;

  /*
   * Formato:
   * `Você subiu para o nível ${level}!`
   */
  content = content.replace(
    /`Você subiu para o nível \$\{([^}]+)\}!`/g,
    '(require("../systems/messages").getMessage("levelUp", { level: $1 }) || `Você subiu para o nível ${$1}!`)'
  );

  /*
   * Formato:
   * Você subiu para o nível X!
   */
  content = content.replace(
    /"Você subiu para o nível ([^"]+)!"/g,
    '(require("../systems/messages").getMessage("levelUp", { level: $1 }) || "Você subiu para o nível " + $1 + "!")'
  );

  if (content !== original) {
    copiarBackup(file);
    fs.writeFileSync(file, content, "utf8");

    const existente = alterados.find(
      x => x.file === path.relative(root, file)
    );

    if (!existente) {
      alterados.push({
        file: path.relative(root, file),
        count: 1
      });
    }
  }
}

/*
 * VALIDAÇÃO
 */
console.log("");
console.log("========================================");
console.log(" UTAH RPG - INTEGRAÇÃO V2");
console.log("========================================");
console.log("");

console.log("Backup:");
console.log(backup);
console.log("");

console.log("Arquivos alterados:");

if (!alterados.length) {
  console.log("  Nenhum.");
} else {
  for (const item of alterados) {
    console.log(`  + ${item.file}`);
  }
}

console.log("");
console.log("Verificando sintaxe...");
console.log("");

const jsFiles = todosJS(src);

for (const file of jsFiles) {
  try {
    execSync(`node --check "${file}"`, {
      stdio: "pipe"
    });

    console.log(`OK    ${path.relative(root, file)}`);
  } catch (error) {
    erros.push({
      file,
      output:
        error.stderr?.toString() ||
        error.stdout?.toString() ||
        error.message
    });

    console.log(`ERRO  ${path.relative(root, file)}`);
  }
}

/*
 * ROLLBACK AUTOMÁTICO
 */
if (erros.length) {
  console.log("");
  console.log("ERRO DETECTADO.");
  console.log("Restaurando automaticamente o estado anterior...");
  console.log("");

  for (const item of alterados) {
    const original = path.join(
      backup,
      item.file
    );

    const target = path.join(
      root,
      item.file
    );

    if (fs.existsSync(original)) {
      fs.copyFileSync(original, target);
      console.log(`RESTAURADO: ${item.file}`);
    }
  }

  console.log("");
  console.log("========================================");
  console.log("ROLLBACK CONCLUÍDO");
  console.log("O projeto foi protegido.");
  console.log("========================================");
  console.log("");

  process.exit(1);
}

console.log("");
console.log("========================================");
console.log("RESULTADO: SINTAXE 100% OK");
console.log("========================================");
console.log("");

console.log("Integração aplicada com segurança.");
console.log(`Backup: ${backup}`);
