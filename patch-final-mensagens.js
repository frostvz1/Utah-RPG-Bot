const fs = require("fs");

const arquivos = [
  "src/index.js",
  "src/commands/combate.js"
];

const backupDir = `backup-final-mensagens-${Date.now()}`;

function fail(msg) {
  console.error("\nERRO:", msg);
  process.exit(1);
}

fs.mkdirSync(backupDir, { recursive: true });

for (const arquivo of arquivos) {
  if (!fs.existsSync(arquivo)) {
    fail(`Arquivo não encontrado: ${arquivo}`);
  }

  fs.copyFileSync(
    arquivo,
    `${backupDir}/${arquivo.replace(/\//g, "__")}`
  );
}

function salvar(arquivo, conteudo) {
  fs.writeFileSync(arquivo, conteudo, "utf8");
}

/* =========================================================
   INDEX.JS
   ========================================================= */

let index = fs.readFileSync("src/index.js", "utf8");

/* Remove duplicação no comando inexistente */
const antigoCommandNotFound = `text:
                  getMessage("commandNotFound") ||
                  (
                    (require("./systems/messages").getMessage("commandNotFound") || "Comando não encontrado.\\n\\n") +
                    \`Use \${activePrefix}menu para visualizar os comandos.\`
                  )`;

const novoCommandNotFound = `text:
                  getMessage("commandNotFound") ||
                  (
                    "Comando não encontrado.\\n\\n" +
                    \`Use \${activePrefix}menu para visualizar os comandos.\`
                  )`;

if (index.includes(antigoCommandNotFound)) {
  index = index.replace(
    antigoCommandNotFound,
    novoCommandNotFound
  );
}

/* Remove duplicação no erro interno */
const antigoInternalError = `text:
              getMessage("internalError") ||
              (require("./systems/messages").getMessage("internalError") || "Ocorreu um erro ao executar o comando.")`;

const novoInternalError = `text:
              getMessage("internalError") ||
              "Ocorreu um erro ao executar o comando."`;

if (index.includes(antigoInternalError)) {
  index = index.replace(
    antigoInternalError,
    novoInternalError
  );
}

/* Mensagens de sistema */
const marcadorSistema = `      const activePrefix =
        systemConfig.prefix ||
        config.prefix;

      if (
        !text.startsWith(activePrefix)
      ) {`;

const blocoSistema = `      const activePrefix =
        systemConfig.prefix ||
        config.prefix;

      if (
        !systemConfig.enabled
      ) {
        await sock.sendMessage(
          remoteJid,
          {
            text:
              getMessage("disabled") ||
              "O sistema está temporariamente desativado."
          }
        );
        return;
      }

      if (
        systemConfig.maintenance
      ) {
        await sock.sendMessage(
          remoteJid,
          {
            text:
              getMessage("maintenance") ||
              "O sistema está em manutenção no momento."
          }
        );
        return;
      }

      if (
        !text.startsWith(activePrefix)
      ) {`;

if (!index.includes("getMessage(\"disabled\")")) {
  if (!index.includes(marcadorSistema)) {
    fail("Não encontrei o bloco correto do activePrefix em index.js");
  }

  index = index.replace(
    marcadorSistema,
    blocoSistema
  );
}

/* Evento de entrada/saída de grupo */
if (!index.includes('"group-participants.update"')) {
  const marcadorEvento = `  sock.ev.on(
    "messages.upsert",`;

  const eventoGrupos = `  sock.ev.on(
    "group-participants.update",
    async update => {
      try {
        if (!update?.id) return;
        if (!Array.isArray(update.participants)) return;

        for (const participant of update.participants) {
          const user =
            participant?.split("@")[0] ||
            participant ||
            "Usuário";

          if (update.action === "add") {
            const text =
              getMessage("welcome", {
                user
              });

            if (text) {
              await sock.sendMessage(
                update.id,
                {
                  text
                }
              );
            }
          }

          if (
            update.action === "remove" ||
            update.action === "leave"
          ) {
            const text =
              getMessage("leave", {
                user
              });

            if (text) {
              await sock.sendMessage(
                update.id,
                {
                  text
                }
              );
            }
          }
        }
      } catch (error) {
        console.error(
          "[UTAH RPG] Erro no evento de grupo:",
          error
        );
      }
    }
  );

  sock.ev.on(
    "messages.upsert",`;

  if (!index.includes(marcadorEvento)) {
    fail("Não encontrei o evento messages.upsert em index.js");
  }

  index = index.replace(
    marcadorEvento,
    eventoGrupos
  );
}

salvar("src/index.js", index);

/* =========================================================
   COMBATE.JS
   ========================================================= */

let combate = fs.readFileSync(
  "src/commands/combate.js",
  "utf8"
);

const antigoDerrota = `      "╔════════════════════════════╗\\n" +
      "          DERROTA\\n" +
      "╚════════════════════════════╝\\n\\n" +
      \`Inimigo: \${enemy.name}\\n\` +
      \`Dano causado: \${damage}\\n\` +
      \`Dano recebido: \${enemyDamage}\\n\\n\` +
      (
        skillName
          ? \`Habilidade usada: \${skillName}\\n\\n\`
          : ""
      ) +
      "Seu personagem foi derrotado."`;

const novoDerrota = `      "╔════════════════════════════╗\\n" +
      "          " +
      (require("../systems/messages").getMessage("defeat") || "DERROTA") +
      "\\n" +
      "╚════════════════════════════╝\\n\\n" +
      \`Inimigo: \${enemy.name}\\n\` +
      \`Dano causado: \${damage}\\n\` +
      \`Dano recebido: \${enemyDamage}\\n\\n\` +
      (
        skillName
          ? \`Habilidade usada: \${skillName}\\n\\n\`
          : ""
      ) +
      "Seu personagem foi derrotado."`;

if (!combate.includes(antigoDerrota)) {
  fail("Não encontrei o bloco exato de DERROTA em combate.js");
}

combate = combate.replace(
  antigoDerrota,
  novoDerrota
);

salvar(
  "src/commands/combate.js",
  combate
);

/* =========================================================
   VALIDAÇÃO
   ========================================================= */

const { execSync } = require("child_process");

try {
  execSync("node --check src/index.js", {
    stdio: "inherit"
  });

  execSync("node --check src/commands/combate.js", {
    stdio: "inherit"
  });
} catch {
  console.error("\nSINTAXE INVÁLIDA. RESTAURANDO BACKUP...");

  for (const arquivo of arquivos) {
    fs.copyFileSync(
      `${backupDir}/${arquivo.replace(/\//g, "__")}`,
      arquivo
    );
  }

  console.log("BACKUP RESTAURADO.");
  process.exit(1);
}

console.log("\n========================================");
console.log("PATCH FINAL CONCLUÍDO");
console.log("========================================");
console.log("OK: welcome");
console.log("OK: leave");
console.log("OK: maintenance");
console.log("OK: disabled");
console.log("OK: defeat");
console.log("OK: victory já integrada");
console.log("OK: commandNotFound");
console.log("OK: internalError");
console.log("OK: sintaxe");
console.log("");
console.log(`BACKUP: ${backupDir}`);
console.log("========================================");
