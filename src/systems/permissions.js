const fs = require("fs");
const path = require("path");

const databasePath = path.join(
  __dirname,
  "../../database/permissions.json"
);

const OWNER_NUMBERS = [
  "5575991190972",
  "144272766541980"
];

function ensureDatabase() {
  const dir = path.dirname(databasePath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (!fs.existsSync(databasePath)) {
    fs.writeFileSync(
      databasePath,
      JSON.stringify(
        {
          admins: [],
          owners: OWNER_NUMBERS
        },
        null,
        2
      )
    );
  }
}

function normalizeNumber(id) {
  return String(id || "")
    .replace(/\D/g, "")
    .replace("@s.whatsapp.net", "");
}

function loadPermissions() {
  ensureDatabase();

  try {
    const data = JSON.parse(
      fs.readFileSync(databasePath, "utf8")
    );

    return {
      admins: Array.isArray(data.admins)
        ? data.admins
        : [],
      owners: Array.isArray(data.owners)
        ? data.owners
        : OWNER_NUMBERS
    };
  } catch (error) {
    console.error("[PERMISSIONS] Erro:", error);

    return {
      admins: [],
      owners: OWNER_NUMBERS
    };
  }
}

function savePermissions(data) {
  ensureDatabase();

  fs.writeFileSync(
    databasePath,
    JSON.stringify(data, null, 2)
  );

  return data;
}

function isOwner(id) {
  const number = normalizeNumber(id);
  const permissions = loadPermissions();

  return permissions.owners.some(
    owner => normalizeNumber(owner) === number
  );
}

function isAdmin(id) {
  const number = normalizeNumber(id);
  const permissions = loadPermissions();

  return (
    isOwner(number) ||
    permissions.admins.some(
      admin => normalizeNumber(admin) === number
    )
  );
}

function addAdmin(id) {
  const number = normalizeNumber(id);

  if (!number) return false;

  const permissions = loadPermissions();

  if (isOwner(number)) {
    return false;
  }

  if (
    permissions.admins.some(
      admin => normalizeNumber(admin) === number
    )
  ) {
    return false;
  }

  permissions.admins.push(number);

  savePermissions(permissions);

  return true;
}

function removeAdmin(id) {
  const number = normalizeNumber(id);
  const permissions = loadPermissions();

  const before = permissions.admins.length;

  permissions.admins =
    permissions.admins.filter(
      admin =>
        normalizeNumber(admin) !== number
    );

  savePermissions(permissions);

  return before !== permissions.admins.length;
}

module.exports = {
  OWNER_NUMBERS,
  loadPermissions,
  savePermissions,
  isOwner,
  isAdmin,
  addAdmin,
  removeAdmin,
  normalizeNumber
};
