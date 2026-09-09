const fs = require("fs");
const path = require("path");

const databasePath = path.join(__dirname, "../../database/abilities.json");

const ASPECTOS = {
  arcano: "Manipulação de energia mágica, conhecimento oculto e forças místicas.",
  divino: "Poderes ligados a entidades superiores, luz sagrada e autoridade celestial.",
  sombrio: "Energia das trevas, corrupção, medo e forças ocultas.",
  elemental: "Controle e manifestação dos elementos naturais e sobrenaturais.",
  celestial: "Energia dos céus, estrelas, luz e forças superiores.",
  infernal: "Poderes provenientes de forças demoníacas e dimensões infernais.",
  espiritual: "Manipulação de espíritos, energia vital e forças da alma.",
  natural: "Conexão com natureza, animais, plantas e forças naturais.",
  fisico: "Aprimoramento direto do corpo, força, velocidade e resistência.",
  sobrenatural: "Capacidades que ultrapassam limitações naturais.",
  psiquico: "Manipulação da mente, percepção, emoções e consciência.",
  temporal: "Manipulação do tempo e eventos cronológicos.",
  dimensional: "Manipulação de espaços, dimensões e portais.",
  cosmico: "Energia relacionada ao universo, estrelas e forças cósmicas."
};

const RACAS = {
  humano: {
    nome: "Humano",
    descricao: "Uma raça extremamente adaptável, capaz de desenvolver diferentes caminhos de poder.",
    aspectos: ["fisico", "arcano", "espiritual"]
  },

  elfo: {
    nome: "Elfo",
    descricao: "Seres ligados à magia, natureza, percepção e forças ancestrais.",
    aspectos: ["arcano", "natural", "espiritual"]
  },

  anjo: {
    nome: "Anjo",
    descricao: "Seres celestiais ligados à luz, proteção e autoridade divina.",
    aspectos: ["divino", "celestial", "espiritual"]
  },

  demonio: {
    nome: "Demônio",
    descricao: "Seres ligados às trevas, corrupção, destruição e dimensões infernais.",
    aspectos: ["sombrio", "infernal", "sobrenatural"]
  },

  vampiro: {
    nome: "Vampiro",
    descricao: "Criaturas noturnas que manipulam sangue, sombras e energia vital.",
    aspectos: ["sombrio", "espiritual", "sobrenatural"]
  },

  lobisomem: {
    nome: "Lobisomem",
    descricao: "Criaturas bestiais com força, sentidos e regeneração sobrenaturais.",
    aspectos: ["fisico", "natural", "sobrenatural"]
  },

  fada: {
    nome: "Fada",
    descricao: "Seres mágicos ligados à natureza, encantamentos e energia feérica.",
    aspectos: ["arcano", "natural", "espiritual"]
  },

  dragao: {
    nome: "Dragão",
    descricao: "Seres ancestrais capazes de dominar elementos e energia cósmica.",
    aspectos: ["elemental", "arcano", "cosmico"]
  },

  deus: {
    nome: "Deus",
    descricao: "Entidades de poder divino capazes de manipular forças superiores.",
    aspectos: ["divino", "celestial", "cosmico"]
  },

  sobrenatural: {
    nome: "Sobrenatural",
    descricao: "Entidades que ultrapassam as regras convencionais da realidade.",
    aspectos: ["sobrenatural", "dimensional", "psiquico"]
  }
};

const NOMES = {
  Humano: [
    "Determinação",
    "Adaptabilidade",
    "Instinto de Sobrevivência",
    "Força de Vontade",
    "Reflexos Humanos",
    "Resistência Natural",
    "Estratégia",
    "Precisão",
    "Contra-Ataque",
    "Foco Absoluto",
    "Evolução Rápida",
    "Espírito de Luta",
    "Potencial Oculto",
    "Ascensão Humana",
    "Domínio Marcial",
    "Mente Adaptável",
    "Último Esforço",
    "Instinto Guerreiro",
    "Superação",
    "Limite Humano"
  ],

  Elfo: [
    "Visão Élfica",
    "Passo Silencioso",
    "Flecha Arcana",
    "Comunicação Natural",
    "Lâmina Élfica",
    "Cura da Floresta",
    "Percepção Espiritual",
    "Dança das Folhas",
    "Flecha Lunar",
    "Camuflagem Natural",
    "Raiz Aprisionadora",
    "Espírito da Floresta",
    "Chuva de Flechas",
    "Arco Ancestral",
    "Sussurro Feérico",
    "Domínio Natural",
    "Floresta Viva",
    "Guardião Élfico",
    "Essência Ancestral",
    "Ascensão Élfica"
  ],

  Anjo: [
    "Luz Sagrada",
    "Asas Celestiais",
    "Cura Divina",
    "Escudo Celestial",
    "Lança de Luz",
    "Benção Divina",
    "Julgamento Celestial",
    "Aura Sagrada",
    "Purificação",
    "Olhar Divino",
    "Espada Celestial",
    "Chama Sagrada",
    "Proteção dos Céus",
    "Ressurreição",
    "Domínio da Luz",
    "Decreto Divino",
    "Ira Celestial",
    "Milagre",
    "Apocalipse Celestial",
    "Forma Serafim"
  ],

  Demônio: [
    "Chamas Infernais",
    "Intimidação Demoníaca",
    "Garra Abissal",
    "Energia Infernal",
    "Marca Demoníaca",
    "Correntes do Inferno",
    "Sangue Profano",
    "Aura de Terror",
    "Possessão",
    "Teleporte Infernal",
    "Explosão Abissal",
    "Regeneração Demoníaca",
    "Invocação Infernal",
    "Domínio das Trevas",
    "Fúria Demoníaca",
    "Coroa Infernal",
    "Senhor das Cinzas",
    "Abismo Devorador",
    "Apocalipse Infernal",
    "Forma Demoníaca"
  ],

  Vampiro: [
    "Drenagem Vital",
    "Forma Sombria",
    "Presas Vampíricas",
    "Névoa de Sangue",
    "Regeneração Vampírica",
    "Sentidos Noturnos",
    "Dominação Mental",
    "Passo Sombrio",
    "Lâmina de Sangue",
    "Correntes Carmesim",
    "Transfusão Vital",
    "Exército de Morcegos",
    "Hipnose",
    "Sombra Eterna",
    "Banquete de Sangue",
    "Rei da Noite",
    "Sangue Ancestral",
    "Lua Carmesim",
    "Ressurreição Vampírica",
    "Forma Primordial"
  ],

  Lobisomem: [
    "Fúria Lupina",
    "Regeneração",
    "Sentidos Lupinos",
    "Garras Selvagens",
    "Mordida Lunar",
    "Rugido Feral",
    "Velocidade Bestial",
    "Instinto Predador",
    "Pele de Aço",
    "Caçada Noturna",
    "Uivo da Lua",
    "Força Ancestral",
    "Forma Alfa",
    "Matilha Espiritual",
    "Fúria da Lua",
    "Regeneração Suprema",
    "Predador Absoluto",
    "Lua Sangrenta",
    "Espírito Lupino",
    "Forma Fenrir"
  ],

  Fada: [
    "Magia Feérica",
    "Pó Encantado",
    "Luz Feérica",
    "Flor Encantada",
    "Cura Feérica",
    "Ilusão Feérica",
    "Voo Mágico",
    "Encanto Natural",
    "Semente Mística",
    "Dança das Fadas",
    "Lança Feérica",
    "Barreira Encantada",
    "Reino Feérico",
    "Espírito da Primavera",
    "Tempestade Feérica",
    "Sono Encantado",
    "Magia Ancestral",
    "Coroa Feérica",
    "Milagre Feérico",
    "Forma Arquifada"
  ],

  Dragão: [
    "Sopro Elemental",
    "Escamas Dracônicas",
    "Garras Dracônicas",
    "Rugido do Dragão",
    "Voo Dracônico",
    "Sangue Dracônico",
    "Chama Dracônica",
    "Presença Dracônica",
    "Cauda Devastadora",
    "Armadura Dracônica",
    "Sopro Congelante",
    "Sopro Tempestuoso",
    "Sopro Abissal",
    "Domínio Elemental",
    "Espírito Dracônico",
    "Fúria Dracônica",
    "Rei dos Dragões",
    "Cataclismo",
    "Dragão Primordial",
    "Forma Dragão Ancestral"
  ],

  Deus: [
    "Autoridade Divina",
    "Domínio Celestial",
    "Decreto Divino",
    "Criação",
    "Destruição",
    "Onisciência",
    "Presença Divina",
    "Milagre",
    "Julgamento Divino",
    "Luz Primordial",
    "Tempo Divino",
    "Espaço Divino",
    "Domínio Elemental",
    "Alma Divina",
    "Imortalidade",
    "Reino Celestial",
    "Ira dos Deuses",
    "Apocalipse Divino",
    "Poder Absoluto",
    "Forma Divina"
  ],

  Sobrenatural: [
    "Percepção Sobrenatural",
    "Manifestação",
    "Energia Oculta",
    "Telecinese",
    "Telepatia",
    "Manipulação Espiritual",
    "Forma Etérea",
    "Portal Dimensional",
    "Visão Astral",
    "Absorção Sobrenatural",
    "Barreira Oculta",
    "Projeção Astral",
    "Distorção da Realidade",
    "Controle Psíquico",
    "Ruptura Dimensional",
    "Existência Etérea",
    "Domínio Sobrenatural",
    "Colapso Dimensional",
    "Singularidade",
    "Transcendência"
  ]
};

const TIPOS = [
  "Passiva",
  "Ofensiva",
  "Defensiva",
  "Especial",
  "Controle",
  "Suporte",
  "Transformação",
  "Mágica"
];

const RARIDADES = [
  "Comum",
  "Comum",
  "Incomum",
  "Incomum",
  "Rara",
  "Rara",
  "Épica",
  "Épica",
  "Lendária",
  "Mítica"
];

const ASPECTOS_EXTRAS = {
  Humano: ["fisico", "arcano", "espiritual", "psiquico"],
  Elfo: ["arcano", "natural", "espiritual", "celestial"],
  Anjo: ["divino", "celestial", "espiritual", "arcano"],
  Demônio: ["sombrio", "infernal", "sobrenatural", "dimensional"],
  Vampiro: ["sombrio", "espiritual", "sobrenatural", "psiquico"],
  Lobisomem: ["fisico", "natural", "sobrenatural", "espiritual"],
  Fada: ["arcano", "natural", "espiritual", "elemental"],
  Dragão: ["elemental", "arcano", "cosmico", "infernal"],
  Deus: ["divino", "celestial", "cosmico", "temporal"],
  Sobrenatural: ["sobrenatural", "dimensional", "psiquico", "temporal"]
};

function gerarDescricao(nome, raca) {
  return `${nome} é uma habilidade exclusiva da raça ${raca}, permitindo ao usuário manifestar uma característica única de seu poder.`;
}

function gerarEfeito(nome, tipo, index) {
  const efeitos = {
    Passiva: `Aumenta permanentemente uma característica do personagem relacionada a ${nome}.`,
    Ofensiva: `Causa dano adicional ao inimigo através de ${nome}.`,
    Defensiva: `Reduz o dano recebido através do poder de ${nome}.`,
    Especial: `Concede um efeito especial baseado em ${nome}.`,
    Controle: `Permite controlar, limitar ou alterar uma ação do alvo através de ${nome}.`,
    Suporte: `Fortalece o usuário ou seus aliados através de ${nome}.`,
    Transformação: `Altera temporariamente o estado do personagem através de ${nome}.`,
    Mágica: `Canaliza energia sobrenatural para produzir o efeito de ${nome}.`
  };

  return efeitos[tipo] || `Produz um efeito especial relacionado a ${nome}.`;
}

function gerarHabilidades(racaNome) {
  const nomes = NOMES[racaNome];
  const aspectos = ASPECTOS_EXTRAS[racaNome];

  return nomes.map((nome, index) => {
    const tipo = TIPOS[index % TIPOS.length];
    const raridade = RARIDADES[index % RARIDADES.length];

    const aspectoPrincipal = aspectos[index % aspectos.length];
    const aspectoSecundario = aspectos[(index + 1) % aspectos.length];

    const requisitoNivel = Math.floor(index / 4) * 10;

    return {
      id: `${racaNome.toLowerCase().replace(/[^a-z0-9]/gi, "")}_${index + 1}`,
      nome,
      raca: racaNome,
      aspectos: [aspectoPrincipal, aspectoSecundario],
      aspectoPrincipal,
      tipo,
      raridade,
      custo: 100,
      descricao: gerarDescricao(nome, racaNome),
      efeito: gerarEfeito(nome, tipo, index),
      requisito: requisitoNivel === 0
        ? "Nenhum"
        : `Nível ${requisitoNivel}`
    };
  });
}

const HABILIDADES = {};

for (const raca of Object.values(RACAS)) {
  HABILIDADES[raca.nome] = gerarHabilidades(raca.nome);
}

function salvarBanco() {
  fs.writeFileSync(
    databasePath,
    JSON.stringify(
      {
        aspectos: ASPECTOS,
        racas: RACAS,
        habilidades: HABILIDADES
      },
      null,
      2
    )
  );
}

function carregarBanco() {
  try {
    if (!fs.existsSync(databasePath)) {
      salvarBanco();
      return;
    }

    const banco = JSON.parse(
      fs.readFileSync(databasePath, "utf8")
    );

    if (banco?.habilidades) {
      for (const raca of Object.keys(HABILIDADES)) {
        if (Array.isArray(banco.habilidades[raca]) &&
            banco.habilidades[raca].length === 20) {
          HABILIDADES[raca] = banco.habilidades[raca];
        }
      }
    }
  } catch (error) {
    console.error("[UTAH RPG] Erro ao carregar habilidades:", error);
  }
}

carregarBanco();
salvarBanco();

function getRacas() {
  return RACAS;
}

function getAspectos() {
  return ASPECTOS;
}

function getHabilidades(raca) {
  if (!raca) return [];

  const encontrada = Object.values(RACAS).find(
    item => item.nome.toLowerCase() === String(raca).toLowerCase()
  );

  if (!encontrada) return [];

  return HABILIDADES[encontrada.nome] || [];
}

function getRacaPorNome(nome) {
  if (!nome) return null;

  return Object.values(RACAS).find(
    raca => raca.nome.toLowerCase() === String(nome).toLowerCase()
  ) || null;
}

function getHabilidade(raca, nome) {
  return getHabilidades(raca).find(
    habilidade =>
      habilidade.nome.toLowerCase() === String(nome).toLowerCase()
  ) || null;
}

module.exports = {
  ASPECTOS,
  RACAS,
  HABILIDADES,
  getRacas,
  getAspectos,
  getHabilidades,
  getRacaPorNome,
  getHabilidade,
  salvarBanco
};
