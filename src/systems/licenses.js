const fs = require("fs");
const path = require("path");

const databasePath = path.join(
  __dirname,
  "../../database/licenses.json"
);

const PLANOS = {
  5: {
    nome: "GRÁTIS",
    dias: 5,
    valor: "R$0,00"
  },

  15: {
    nome: "BÁSICO",
    dias: 15,
    valor: "R$7,90"
  },

  30: {
    nome: "PADRÃO",
    dias: 30,
    valor: "R$14,90"
  },

  60: {
    nome: "PREMIUM",
    dias: 60,
    valor: "R$24,90"
  }
};

function garantirBanco() {
  const dir = path.dirname(databasePath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, {
      recursive: true
    });
  }

  if (!fs.existsSync(databasePath)) {
    fs.writeFileSync(
      databasePath,
      JSON.stringify({}, null, 2)
    );
  }
}

function carregarLicencas() {
  garantirBanco();

  try {
    return JSON.parse(
      fs.readFileSync(
        databasePath,
        "utf8"
      )
    );
  } catch (error) {
    console.error(
      "[LICENSES] Erro ao carregar:",
      error
    );

    return {};
  }
}

function salvarLicencas(data) {
  garantirBanco();

  fs.writeFileSync(
    databasePath,
    JSON.stringify(
      data,
      null,
      2
    )
  );

  return data;
}

function obterLicenca(id) {
  if (!id) return null;

  const licencas =
    carregarLicencas();

  return licencas[id] || null;
}

function ativarLicenca(id, dias) {
  const licencas =
    carregarLicencas();

  const atual =
    licencas[id];

  const agora =
    Date.now();

  let inicio;

  if (
    atual &&
    atual.permanente !== true &&
    Number(atual.expiresAt) > agora
  ) {
    inicio =
      Number(atual.expiresAt);
  } else {
    inicio = agora;
  }

  const expiresAt =
    inicio +
    (dias * 24 * 60 * 60 * 1000);

  licencas[id] = {
    ...(atual || {}),
    active: true,
    permanente: false,
    activatedAt:
      atual?.activatedAt || agora,
    updatedAt: agora,
    expiresAt,
    lastDaysAdded: dias
  };

  salvarLicencas(
    licencas
  );

  return licencas[id];
}

function ativarPermanente(id) {
  const licencas =
    carregarLicencas();

  const agora =
    Date.now();

  licencas[id] = {
    ...(licencas[id] || {}),
    active: true,
    permanente: true,
    activatedAt:
      licencas[id]?.activatedAt ||
      agora,
    updatedAt: agora,
    expiresAt: null,
    lastDaysAdded: null
  };

  salvarLicencas(
    licencas
  );

  return licencas[id];
}

function desativarLicenca(id) {
  const licencas =
    carregarLicencas();

  const atual =
    licencas[id];

  if (!atual) {
    return null;
  }

  licencas[id] = {
    ...atual,
    active: false,
    permanente: false,
    updatedAt: Date.now()
  };

  salvarLicencas(
    licencas
  );

  return licencas[id];
}

function estaAtiva(id) {
  const licenca =
    obterLicenca(id);

  if (!licenca) {
    return false;
  }

  if (
    licenca.active !== true
  ) {
    return false;
  }

  if (
    licenca.permanente === true
  ) {
    return true;
  }

  return (
    Number(licenca.expiresAt) >
    Date.now()
  );
}

function diasRestantes(id) {
  const licenca =
    obterLicenca(id);

  if (!licenca) {
    return 0;
  }

  if (
    licenca.permanente === true &&
    licenca.active === true
  ) {
    return Infinity;
  }

  const restante =
    Number(licenca.expiresAt || 0) -
    Date.now();

  if (restante <= 0) {
    return 0;
  }

  return Math.ceil(
    restante /
      (24 * 60 * 60 * 1000)
  );
}

function formatarData(timestamp) {
  if (!timestamp) {
    return "Não definido";
  }

  return new Date(timestamp)
    .toLocaleString(
      "pt-BR",
      {
        timeZone: "America/Sao_Paulo"
      }
    );
}

module.exports = {
  PLANOS,
  carregarLicencas,
  salvarLicencas,
  obterLicenca,
  ativarLicenca,
  ativarPermanente,
  desativarLicenca,
  estaAtiva,
  diasRestantes,
  formatarData
};
