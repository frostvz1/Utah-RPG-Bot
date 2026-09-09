const { getUser, updateUser } = require("../systems/users");
const { getHabilidades } = require("../systems/abilities");
const {
  sendGifMessage,
  sendAbilityGifMessage
} = require("../systems/gifEvents");

function random(min, max) {
  return Math.floor(
    Math.random() * (max - min + 1)
  ) + min;
}

function criarInimigo(user) {
  const maxHp = 50 + user.level * 5;

  return {
    name: "Goblin",
    level: Math.max(1, user.level),
    maxHp,
    hp: maxHp,
    defense: 3 + Math.floor(user.level / 5),
    attack: 5 + Math.floor(user.level / 2)
  };
}

function obterHabilidadesDoUsuario(user) {
  if (Array.isArray(user.abilities)) {
    return user.abilities;
  }

  if (user.ability) {
    return [user.ability];
  }

  return [];
}

function encontrarHabilidade(user, nome) {
  if (!user.race) {
    return null;
  }

  const habilidades =
    getHabilidades(user.race);

  return habilidades.find(
    habilidade =>
      habilidade.nome.toLowerCase() ===
      String(nome).toLowerCase()
  ) || null;
}

function energiaDaHabilidade(habilidade) {
  if (!habilidade) return 20;

  const custos = {
    "Comum": 10,
    "Incomum": 15,
    "Rara": 20,
    "Épica": 25,
    "Lendária": 30,
    "Mítica": 35
  };

  return custos[habilidade.raridade] || 20;
}

function aplicarHabilidade(
  user,
  enemy,
  habilidade
) {
  const energia =
    energiaDaHabilidade(habilidade);

  let damage = 0;
  let heal = 0;
  let energyRestore = 0;
  let defenseBonus = 0;
  let enemyAttackReduction = 0;
  let descricao = "";

  switch (habilidade.tipo) {
    case "Ofensiva":
      damage =
        user.strength +
        user.speed +
        random(8, 18);

      damage +=
        Math.floor(user.level / 3);

      descricao =
        "O poder foi concentrado em um ataque devastador.";
      break;

    case "Mágica":
      damage =
        user.intelligence * 2 +
        random(10, 22);

      damage +=
        Math.floor(user.level / 2);

      descricao =
        "Energia arcana foi canalizada contra o inimigo.";
      break;

    case "Passiva":
      damage =
        user.strength +
        Math.floor(user.level / 2) +
        random(5, 12);

      descricao =
        "O efeito passivo aumentou o poder do próximo ataque.";
      break;

    case "Defensiva":
      damage =
        Math.max(
          1,
          Math.floor(user.strength / 2) +
          random(2, 7)
        );

      defenseBonus =
        5 +
        Math.floor(user.level / 4);

      descricao =
        `Uma defesa especial foi ativada. Defesa +${defenseBonus} neste turno.`;
      break;

    case "Suporte":
      heal =
        15 +
        user.intelligence +
        random(5, 15);

      energyRestore =
        5 +
        random(3, 10);

      damage =
        Math.max(
          1,
          Math.floor(user.strength / 2) +
          random(2, 6)
        );

      descricao =
        `O poder restaurou ${heal} HP e ${energyRestore} energia.`;
      break;

    case "Controle":
      damage =
        user.intelligence +
        random(5, 12);

      enemyAttackReduction =
        3 +
        Math.floor(user.level / 5);

      descricao =
        `O inimigo foi enfraquecido. Ataque -${enemyAttackReduction}.`;
      break;

    case "Transformação":
      damage =
        user.strength * 2 +
        user.speed +
        random(10, 20);

      defenseBonus =
        3 +
        Math.floor(user.level / 3);

      descricao =
        `Uma transformação foi ativada. Defesa +${defenseBonus}.`;
      break;

    case "Especial":
    default:
      damage =
        user.strength +
        user.intelligence +
        user.speed +
        random(8, 18);

      descricao =
        "A habilidade especial liberou seu poder único.";
      break;
  }

  damage = Math.max(
    1,
    damage -
    Math.floor(enemy.defense / 2)
  );

  return {
    energia,
    damage,
    heal,
    energyRestore,
    defenseBonus,
    enemyAttackReduction,
    descricao
  };
}

function obterHabilidadeDeClasse(user) {
  const habilidades = {
    Guerreiro: {
      name: "Golpe Devastador",
      energy: 20,
      damage:
        user.strength * 2 +
        random(5, 12)
    },

    Mago: {
      name: "Explosão Arcana",
      energy: 20,
      damage:
        user.intelligence * 2 +
        random(8, 15)
    },

    Assassino: {
      name: "Corte Sombrio",
      energy: 20,
      damage:
        user.speed * 2 +
        random(6, 14)
    },

    Arqueiro: {
      name: "Flecha Perfurante",
      energy: 20,
      damage:
        user.speed +
        user.strength +
        random(8, 15)
    },

    Paladino: {
      name: "Golpe Sagrado",
      energy: 20,
      damage:
        user.strength +
        user.intelligence +
        random(8, 14)
    }
  };

  return habilidades[user.class] || null;
}

function montarMenuHabilidades(user) {
  const nomes =
    obterHabilidadesDoUsuario(user);

  if (!nomes.length) {
    return null;
  }

  const habilidades =
    nomes
      .map(nome =>
        encontrarHabilidade(
          user,
          nome
        )
      )
      .filter(Boolean);

  if (!habilidades.length) {
    return null;
  }

  let texto =
    "╔════════════════════════════╗\n" +
    "       HABILIDADES DE COMBATE\n" +
    "╚════════════════════════════╝\n\n" +
    `Habilidades disponíveis: ${habilidades.length}/5\n\n`;

  habilidades.forEach(
    (habilidade, index) => {
      const energia =
        energiaDaHabilidade(
          habilidade
        );

      texto +=
        `${index + 1}. ${habilidade.nome}\n` +
        `   Aspecto: ${habilidade.aspectos.join(" + ").toUpperCase()}\n` +
        `   Tipo: ${habilidade.tipo}\n` +
        `   Raridade: ${habilidade.raridade}\n` +
        `   Energia: ${energia}\n` +
        `   ${habilidade.descricao}\n\n`;
    }
  );

  texto +=
    "━━━━━━━━━━━━━━━━━━━━\n" +
    "Escolha uma habilidade:\n" +
    "${prefix}habilidade <número>\n\n" +
    "Exemplo: ${prefix}habilidade 1";

  return texto;
}

async function combate(
  sock,
  msg,
  args
) {
  const userId =
    msg.key.participant ||
    msg.key.remoteJid;

  const user =
    getUser(userId);

  if (!user.registered) {
    return sendGifMessage(
      sock,
      msg,
      "erro",
      "Você ainda não possui um personagem.\n\n" +
      "Use ${prefix}iniciar para começar sua jornada."
    );
  }

  if (!user.class) {
    return sendGifMessage(
      sock,
      msg,
      "erro",
      "Você precisa escolher uma classe antes de entrar em combate.\n\n" +
      "Use ${prefix}classe."
    );
  }

  const action =
    (args[0] || "atacar")
      .toLowerCase();

  if (
    action !== "atacar" &&
    action !== "habilidade"
  ) {
    return sendGifMessage(
      sock,
      msg,
      "erro",
      "Ação de combate inválida.\n\n" +
      "Use:\n" +
      "${prefix}atacar\n" +
      "${prefix}habilidade"
    );
  }

  if (user.hp <= 0) {
    return sendGifMessage(
      sock,
      msg,
      "derrota",
      "Seu personagem está sem HP.\n\n" +
      "Não é possível continuar o combate."
    );
  }

  /*
   * MENU DE HABILIDADES
   */
  if (
    action === "habilidade" &&
    !args[1]
  ) {
    const menu =
      montarMenuHabilidades(user);

    if (!menu) {
      const classe =
        obterHabilidadeDeClasse(user);

      if (!classe) {
        return sendGifMessage(
          sock,
          msg,
          "erro",
          "Você ainda não possui habilidades disponíveis."
        );
      }

      return sendGifMessage(
        sock,
        msg,
        "habilidade_menu",
        "╔════════════════════════════╗\n" +
        "       HABILIDADE DE CLASSE\n" +
        "╚════════════════════════════╝\n\n" +
        `Classe: ${user.class}\n` +
        `Habilidade: ${classe.name}\n` +
        `Energia: ${classe.energy}\n\n` +
        "Você ainda não possui habilidades raciais.\n" +
        "Sua habilidade de classe continua disponível."
      );
    }

    return sendAbilityGifMessage(
      sock,
      msg,
      user.race,
      menu
    );
  }

  /*
   * HABILIDADE POR NÚMERO
   */
  let habilidadeUsada = null;
  let numeroHabilidade = null;

  if (action === "habilidade") {
    const numero =
      Number(args[1]);

    if (
      !Number.isInteger(numero) ||
      numero < 1 ||
      numero > 5
    ) {
      return sendGifMessage(
        sock,
        msg,
        "habilidade_erro",
        "Número de habilidade inválido.\n\n" +
        "Use ${prefix}habilidade para visualizar suas habilidades."
      );
    }

    numeroHabilidade =
      numero;

    const nomes =
      obterHabilidadesDoUsuario(
        user
      );

    if (!nomes[numero - 1]) {
      return sendGifMessage(
        sock,
        msg,
        "habilidade_erro",
        `Você não possui uma habilidade no espaço ${numero}.\n\n` +
        `Habilidades disponíveis: ${nomes.length}/5`
      );
    }

    habilidadeUsada =
      encontrarHabilidade(
        user,
        nomes[numero - 1]
      );

    if (!habilidadeUsada) {
      return sendGifMessage(
        sock,
        msg,
        "habilidade_erro",
        "Essa habilidade não está mais disponível no catálogo da sua raça."
      );
    }
  }

  /*
   * INICIA OU CONTINUA COMBATE
   */
  let combat = user.combat;

  if (
    !combat ||
    !combat.active ||
    !combat.enemy ||
    combat.enemy.hp <= 0
  ) {
    combat = {
      active: true,
      enemy: criarInimigo(user)
    };
  }

  const enemy =
    combat.enemy;

  let damage = 0;
  let skillName = null;
  let energyCost = 0;
  let heal = 0;
  let energyRestore = 0;
  let defenseBonus = 0;
  let enemyAttackReduction = 0;
  let skillDescription = "";

  /*
   * ATAQUE NORMAL
   */
  if (action === "atacar") {
    damage =
      Math.max(
        1,
        user.strength +
        random(1, 8) -
        enemy.defense
      );
  }

  /*
   * HABILIDADE RACIAL
   */
  if (
    action === "habilidade" &&
    habilidadeUsada
  ) {
    skillName =
      habilidadeUsada.nome;

    const resultado =
      aplicarHabilidade(
        user,
        enemy,
        habilidadeUsada
      );

    energyCost =
      resultado.energia;

    damage =
      resultado.damage;

    heal =
      resultado.heal;

    energyRestore =
      resultado.energyRestore;

    defenseBonus =
      resultado.defenseBonus;

    enemyAttackReduction =
      resultado.enemyAttackReduction;

    skillDescription =
      resultado.descricao;
  }

  /*
   * HABILIDADE DE CLASSE
   */
  if (
    action === "habilidade" &&
    !habilidadeUsada
  ) {
    const skill =
      obterHabilidadeDeClasse(
        user
      );

    if (!skill) {
      return sendGifMessage(
        sock,
        msg,
        "habilidade_erro",
        "Nenhuma habilidade pode ser utilizada."
      );
    }

    if (
      user.energy <
      skill.energy
    ) {
      return sendGifMessage(
        sock,
        msg,
        "habilidade_sem_energia",
        "ENERGIA INSUFICIENTE\n\n" +
        `Energia atual: ${user.energy}/${user.maxEnergy}\n` +
        `Necessário: ${skill.energy}`
      );
    }

    skillName =
      skill.name;

    energyCost =
      skill.energy;

    damage =
      Math.max(
        1,
        skill.damage -
        Math.floor(
          enemy.defense / 2
        )
      );

    skillDescription =
      "A habilidade da classe foi utilizada.";
  }

  /*
   * ENERGIA
   */
  if (
    action === "habilidade" &&
    user.energy < energyCost
  ) {
    return sendGifMessage(
      sock,
      msg,
      "habilidade_sem_energia",
      "ENERGIA INSUFICIENTE\n\n" +
      `Habilidade: ${skillName}\n` +
      `Energia atual: ${user.energy}/${user.maxEnergy}\n` +
      `Necessário: ${energyCost}`
    );
  }

  /*
   * DANO NO INIMIGO
   */
  enemy.hp =
    Math.max(
      0,
      enemy.hp - damage
    );

  /*
   * CURA
   */
  const newHpBeforeEnemy =
    Math.min(
      user.maxHp,
      user.hp + heal
    );

  /*
   * VITÓRIA
   */
  if (enemy.hp <= 0) {
    const xpGain =
      25 + user.level * 5;

    const coinsGain =
      10 + random(1, 10);

    const newXp =
      user.xp + xpGain;

    const newEnergy =
      Math.min(
        user.maxEnergy,
        user.energy -
        energyCost +
        energyRestore
      );

    updateUser(
      userId,
      {
        hp: newHpBeforeEnemy,
        xp: newXp,
        coins:
          user.coins +
          coinsGain,
        energy: newEnergy,
        combat: null
      }
    );

    const texto =
      "╔════════════════════════════╗\n" +
      "          VITÓRIA\n" +
      "╚════════════════════════════╝\n\n" +
      `Inimigo: ${enemy.name}\n` +
      `Dano causado: ${damage}\n` +
      (
        skillName
          ? `Habilidade: ${skillName}\n`
          : ""
      ) +
      (
        energyCost
          ? `Energia utilizada: ${energyCost}\n`
          : ""
      ) +
      (
        heal
          ? `HP recuperado: +${heal}\n`
          : ""
      ) +
      "\n" +
      `XP recebido: +${xpGain}\n` +
      `Moedas recebidas: +${coinsGain}\n\n` +
      "O inimigo foi derrotado.";

    if (
      action === "habilidade" &&
      habilidadeUsada
    ) {
      return sendAbilityGifMessage(
        sock,
        msg,
        user.race,
        texto
      );
    }

    return sendGifMessage(
      sock,
      msg,
      "vitoria",
      texto
    );
  }

  /*
   * CONTRA-ATAQUE
   */
  let enemyDamage =
    Math.max(
      1,
      enemy.attack +
      random(1, 5) -
      user.defense -
      defenseBonus
    );

  if (
    enemyAttackReduction > 0
  ) {
    enemyDamage =
      Math.max(
        1,
        enemyDamage -
        enemyAttackReduction
      );
  }

  const newHp =
    Math.max(
      0,
      newHpBeforeEnemy -
      enemyDamage
    );

  /*
   * DERROTA
   */
  if (newHp <= 0) {
    updateUser(
      userId,
      {
        hp: 0,
        energy:
          Math.max(
            0,
            user.energy -
            energyCost +
            energyRestore
          ),
        combat: null
      }
    );

    return sendGifMessage(
      sock,
      msg,
      "derrota",
      "╔════════════════════════════╗\n" +
      "          DERROTA\n" +
      "╚════════════════════════════╝\n\n" +
      `Inimigo: ${enemy.name}\n` +
      `Dano causado: ${damage}\n` +
      `Dano recebido: ${enemyDamage}\n\n` +
      (
        skillName
          ? `Habilidade usada: ${skillName}\n\n`
          : ""
      ) +
      "Seu personagem foi derrotado."
    );
  }

  /*
   * ENERGIA FINAL
   */
  const newEnergy =
    Math.min(
      user.maxEnergy,
      Math.max(
        0,
        user.energy -
        energyCost +
        energyRestore
      )
    );

  updateUser(
    userId,
    {
      hp: newHp,
      energy: newEnergy,
      combat: {
        active: true,
        enemy
      }
    }
  );

  /*
   * TEXTO DO COMBATE
   */
  let texto =
    "╔════════════════════════════╗\n" +
    "           COMBATE\n" +
    "╚════════════════════════════╝\n\n" +
    `Inimigo: ${enemy.name}\n` +
    `HP: ${enemy.hp}/${enemy.maxHp}\n\n`;

  if (skillName) {
    texto +=
      `Habilidade usada: ${skillName}\n` +
      `Dano causado: ${damage}\n` +
      `Energia utilizada: ${energyCost}\n`;

    if (heal > 0) {
      texto +=
        `HP recuperado: +${heal}\n`;
    }

    if (energyRestore > 0) {
      texto +=
        `Energia recuperada: +${energyRestore}\n`;
    }

    if (defenseBonus > 0) {
      texto +=
        `Defesa bônus: +${defenseBonus}\n`;
    }

    if (
      enemyAttackReduction > 0
    ) {
      texto +=
        `Redução do inimigo: -${enemyAttackReduction}\n`;
    }

    texto +=
      `\n${skillDescription}\n\n`;
  } else {
    texto +=
      "Ataque normal realizado.\n" +
      `Dano causado: ${damage}\n\n`;
  }

  texto +=
    `Dano recebido: ${enemyDamage}\n\n` +
    `Seu HP: ${newHp}/${user.maxHp}\n` +
    `Energia: ${newEnergy}/${user.maxEnergy}\n\n` +
    "O combate continua.";

  /*
   * GIF DA HABILIDADE:
   *
   * Se for habilidade racial,
   * usa o GIF da raça.
   *
   * Exemplo:
   * Anjo -> habilidades/anjo.mp4
   * Dragão -> habilidades/dragao.mp4
   *
   * O mesmo GIF é usado nas 20
   * habilidades daquela raça.
   */
  if (
    action === "habilidade" &&
    habilidadeUsada
  ) {
    return sendAbilityGifMessage(
      sock,
      msg,
      user.race,
      texto
    );
  }

  /*
   * HABILIDADE DE CLASSE
   */
  if (
    action === "habilidade" &&
    !habilidadeUsada
  ) {
    return sendGifMessage(
      sock,
      msg,
      "habilidade",
      texto
    );
  }

  return sendGifMessage(
    sock,
    msg,
    "atacar",
    texto
  );
}

module.exports = combate;
