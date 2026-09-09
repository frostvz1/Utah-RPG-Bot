const fs = require("fs");
const path = require("path");

const databasePath = path.join(
  __dirname,
  "../../database/guilds.json"
);

const mediaPath = path.join(
  __dirname,
  "../../media/guilds"
);

function ensureDatabase() {
  if (!fs.existsSync(databasePath)) {
    fs.writeFileSync(databasePath, "{}");
  }

  if (!fs.existsSync(mediaPath)) {
    fs.mkdirSync(mediaPath, {
      recursive: true
    });
  }
}

function loadGuilds() {
  ensureDatabase();

  try {
    return JSON.parse(
      fs.readFileSync(
        databasePath,
        "utf8"
      )
    );
  } catch (error) {
    console.error(
      "[UTAH RPG] Erro ao carregar guildas:",
      error
    );

    return {};
  }
}

function saveGuilds(guilds) {
  ensureDatabase();

  fs.writeFileSync(
    databasePath,
    JSON.stringify(
      guilds,
      null,
      2
    )
  );
}

function generateGuildId(guilds) {
  let number = 1;

  while (
    guilds[`UTAH-G-${String(number).padStart(4, "0")}`]
  ) {
    number++;
  }

  return `UTAH-G-${String(number).padStart(4, "0")}`;
}

function getGuild(guildId) {
  const guilds = loadGuilds();

  return guilds[guildId] || null;
}

function getGuildByMember(userId) {
  const guilds = loadGuilds();

  for (const guild of Object.values(guilds)) {
    if (
      guild.members.some(
        member => member.id === userId
      )
    ) {
      return guild;
    }
  }

  return null;
}

function createGuild({
  creatorId,
  creatorName,
  creatorContact,
  groupId = null,
  name,
  description = "",
  motto = "",
  category = "Aventureiros"
}) {
  const guilds = loadGuilds();

  const guildId =
    generateGuildId(guilds);

  const guild = {
    id: guildId,

    name,

    image: null,

    creator: {
      id: creatorId,
      name: creatorName,
      contact: creatorContact
    },

    groupId,

    description,

    motto,

    category,

    level: 1,

    xp: 0,

    maxMembers: 30,

    coins: 0,

    victories: 0,

    defeats: 0,

    completedMissions: 0,

    territories: [],

    invites: [],

    members: [
      {
        id: creatorId,
        name: creatorName,
        contact: creatorContact,
        role: "Mestre",
        joinedAt: Date.now()
      }
    ],

    createdAt: Date.now()
  };

  guilds[guildId] = guild;

  saveGuilds(guilds);

  return guild;
}

function updateGuild(guildId, data) {
  const guilds = loadGuilds();

  if (!guilds[guildId]) {
    return null;
  }

  guilds[guildId] = {
    ...guilds[guildId],
    ...data
  };

  saveGuilds(guilds);

  return guilds[guildId];
}

function addMember(guildId, member) {
  const guilds = loadGuilds();

  const guild = guilds[guildId];

  if (!guild) {
    return {
      success: false,
      reason: "guild_not_found"
    };
  }

  if (
    guild.members.length >=
    guild.maxMembers
  ) {
    return {
      success: false,
      reason: "guild_full"
    };
  }

  if (
    guild.members.some(
      existing =>
        existing.id === member.id
    )
  ) {
    return {
      success: false,
      reason: "already_member"
    };
  }

  guild.members.push({
    id: member.id,
    name: member.name,
    contact: member.contact,
    role: "Recruta",
    joinedAt: Date.now()
  });

  saveGuilds(guilds);

  return {
    success: true,
    guild
  };
}

function removeMember(
  guildId,
  memberId
) {
  const guilds = loadGuilds();

  const guild = guilds[guildId];

  if (!guild) {
    return {
      success: false,
      reason: "guild_not_found"
    };
  }

  if (
    guild.creator.id === memberId
  ) {
    return {
      success: false,
      reason: "creator"
    };
  }

  const before =
    guild.members.length;

  guild.members =
    guild.members.filter(
      member =>
        member.id !== memberId
    );

  if (
    guild.members.length === before
  ) {
    return {
      success: false,
      reason: "member_not_found"
    };
  }

  saveGuilds(guilds);

  return {
    success: true,
    guild
  };
}

function updateMember(
  guildId,
  memberId,
  data
) {
  const guilds = loadGuilds();

  const guild = guilds[guildId];

  if (!guild) {
    return null;
  }

  const member =
    guild.members.find(
      member =>
        member.id === memberId
    );

  if (!member) {
    return null;
  }

  Object.assign(
    member,
    data
  );

  saveGuilds(guilds);

  return member;
}

function addGuildXP(
  guildId,
  amount
) {
  const guilds = loadGuilds();

  const guild = guilds[guildId];

  if (!guild) {
    return null;
  }

  guild.xp += amount;

  const xpRequired =
    guild.level * 1000;

  if (
    guild.xp >= xpRequired
  ) {
    guild.xp -= xpRequired;
    guild.level++;

    guild.maxMembers += 5;
  }

  saveGuilds(guilds);

  return guild;
}

function addGuildCoins(
  guildId,
  amount
) {
  const guilds = loadGuilds();

  const guild = guilds[guildId];

  if (!guild) {
    return null;
  }

  guild.coins += amount;

  saveGuilds(guilds);

  return guild;
}

function removeGuildCoins(
  guildId,
  amount
) {
  const guilds = loadGuilds();

  const guild = guilds[guildId];

  if (!guild) {
    return {
      success: false,
      reason: "guild_not_found"
    };
  }

  if (guild.coins < amount) {
    return {
      success: false,
      reason: "insufficient_funds"
    };
  }

  guild.coins -= amount;

  saveGuilds(guilds);

  return {
    success: true,
    guild
  };
}


function createGuildInvite(guildId, fromMember, targetId, targetName) {
  const guilds = loadGuilds();
  const guild = guilds[guildId];

  if (!guild) {
    return {
      success: false,
      reason: "guild_not_found"
    };
  }

  if (!guild.invites) {
    guild.invites = [];
  }

  const agora = Date.now();

  guild.invites = guild.invites.filter(
    invite => invite.expiresAt > agora
  );

  if (
    guild.invites.some(
      invite =>
        invite.targetId === targetId &&
        invite.status === "pending"
    )
  ) {
    return {
      success: false,
      reason: "already_invited"
    };
  }

  const invite = {
    id: `INV-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    guildId,
    guildName: guild.name,
    fromId: fromMember.id,
    fromName: fromMember.name,
    targetId,
    targetName,
    status: "pending",
    createdAt: agora,
    expiresAt: agora + (24 * 60 * 60 * 1000)
  };

  guild.invites.push(invite);

  saveGuilds(guilds);

  return {
    success: true,
    invite
  };
}

function getPendingInvites(userId) {
  const guilds = loadGuilds();
  const agora = Date.now();
  const invites = [];

  let changed = false;

  for (const guild of Object.values(guilds)) {
    if (!guild.invites) {
      guild.invites = [];
      changed = true;
    }

    const validInvites = guild.invites.filter(
      invite => invite.expiresAt > agora
    );

    if (validInvites.length !== guild.invites.length) {
      guild.invites = validInvites;
      changed = true;
    }

    for (const invite of guild.invites) {
      if (
        invite.targetId === userId &&
        invite.status === "pending"
      ) {
        invites.push(invite);
      }
    }
  }

  if (changed) {
    saveGuilds(guilds);
  }

  return invites;
}

function getInviteById(inviteId, userId) {
  const invites = getPendingInvites(userId);

  return invites.find(
    invite => invite.id === inviteId
  ) || null;
}

function acceptGuildInvite(inviteId, userId, userName, userContact) {
  const guilds = loadGuilds();
  const agora = Date.now();

  let selectedGuild = null;
  let selectedInvite = null;

  for (const guild of Object.values(guilds)) {
    if (!guild.invites) continue;

    const invite = guild.invites.find(
      item =>
        item.id === inviteId &&
        item.targetId === userId &&
        item.status === "pending" &&
        item.expiresAt > agora
    );

    if (invite) {
      selectedGuild = guild;
      selectedInvite = invite;
      break;
    }
  }

  if (!selectedGuild || !selectedInvite) {
    return {
      success: false,
      reason: "invite_not_found"
    };
  }

  if (!selectedGuild.members) {
    selectedGuild.members = [];
  }

  if (
    selectedGuild.members.length >=
    selectedGuild.maxMembers
  ) {
    return {
      success: false,
      reason: "guild_full"
    };
  }

  if (
    selectedGuild.members.some(
      member => member.id === userId
    )
  ) {
    return {
      success: false,
      reason: "already_member"
    };
  }

  selectedGuild.members.push({
    id: userId,
    name: userName,
    contact: userContact,
    role: "Recruta",
    joinedAt: agora
  });

  selectedInvite.status = "accepted";
  selectedInvite.acceptedAt = agora;

  saveGuilds(guilds);

  return {
    success: true,
    guild: selectedGuild,
    invite: selectedInvite
  };
}

function rejectGuildInvite(inviteId, userId) {
  const guilds = loadGuilds();

  for (const guild of Object.values(guilds)) {
    if (!guild.invites) continue;

    const invite = guild.invites.find(
      item =>
        item.id === inviteId &&
        item.targetId === userId &&
        item.status === "pending"
    );

    if (invite) {
      invite.status = "rejected";
      invite.rejectedAt = Date.now();

      saveGuilds(guilds);

      return {
        success: true,
        invite
      };
    }
  }

  return {
    success: false,
    reason: "invite_not_found"
  };
}


module.exports = {
  loadGuilds,
  saveGuilds,
  getGuild,
  getGuildByMember,
  createGuild,
  updateGuild,
  addMember,
  removeMember,
  updateMember,
  addGuildXP,
  addGuildCoins,
  removeGuildCoins,
  createGuildInvite,
  getPendingInvites,
  getInviteById,
  acceptGuildInvite,
  rejectGuildInvite,
  mediaPath
};
