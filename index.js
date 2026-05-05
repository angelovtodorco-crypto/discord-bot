const { Client, GatewayIntentBits, PermissionsBitField } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions
  ]
});

const prefix = "FR?";

client.on("ready", () => {
  console.log(`${client.user.tag} aktif!`);
});

function parseTime(time, unit) {
  if (unit.startsWith("dakika")) return time * 60 * 1000;
  if (unit.startsWith("saat")) return time * 60 * 60 * 1000;
  return 0;
}

client.on("messageCreate", async (message) => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const cmd = args.shift().toLowerCase();

  // 🔥 TAKIM SİL
  if (cmd === "takım-sil") {
    const messages = await message.channel.messages.fetch({ limit: 50 });

    messages.forEach(msg => {
      if (msg.reactions.cache.size === 0) {
        msg.delete().catch(() => {});
      }
    });

    message.reply("Emoji olmayan mesajlar silindi.");
  }

  // 🔥 OTOPASS (kanalda yazanlara rol ver)
  if (cmd === "otopass") {
    const role = message.mentions.roles.first();
    if (!role) return message.reply("Rol etiketle!");

    const messages = await message.channel.messages.fetch({ limit: 100 });

    const users = new Set();
    messages.forEach(msg => users.add(msg.author.id));

    for (let id of users) {
      const member = await message.guild.members.fetch(id).catch(() => null);
      if (member && !member.roles.cache.has(role.id)) {
        member.roles.add(role).catch(() => {});
      }
    }

    message.reply("Rol verildi.");
  }

  // 🔥 MUTE
  if (cmd === "mute") {
    const member = message.mentions.members.first();
    const time = parseInt(args[1]);
    const unit = args[2];

    if (!member) return message.reply("Kullanıcı etiketle!");
    if (!time || !unit) return message.reply("Süre yaz! Örn: 1 dakika");

    let muteRole = message.guild.roles.cache.find(r => r.name === "Muted");

    if (!muteRole) {
      muteRole = await message.guild.roles.create({
        name: "Muted",
        permissions: []
      });

      message.guild.channels.cache.forEach(channel => {
        channel.permissionOverwrites.create(muteRole, {
          SendMessages: false
        });
      });
    }

    member.roles.add(muteRole);

    const ms = parseTime(time, unit);

    setTimeout(() => {
      member.roles.remove(muteRole).catch(() => {});
    }, ms);

    message.reply(`Kullanıcı ${time} ${unit} mute atıldı.`);
  }

  // 🔥 ROL VER
  if (cmd === "rol") {
    const member = message.mentions.members.first();
    const role = message.mentions.roles.first();

    if (!member || !role) return message.reply("Kullanıcı ve rol etiketle!");

    member.roles.add(role).catch(() => {});
    message.reply("Rol verildi.");
  }

  // 🔥 SÜRELİ ROL
  if (cmd === "sürelirol-ver") {
    const member = message.mentions.members.first();
    const role = message.mentions.roles.first();
    const time = parseInt(args[2]);
    const unit = args[3];

    if (!member || !role) return message.reply("Eksik!");
    if (!time || !unit) return message.reply("Süre yaz!");

    member.roles.add(role);

    const ms = parseTime(time, unit);

    setTimeout(() => {
      member.roles.remove(role).catch(() => {});
    }, ms);

    message.reply("Süreli rol verildi.");
  }

  // 🔥 KOMUTLAR
  if (cmd === "komutlar") {
    message.reply(`
FR?takım-sil
FR?otopass @rol
FR?mute @kişi 1 dakika/saat
FR?rol @kişi @rol
FR?sürelirol-ver @kişi @rol 1 dakika/saat
FR?closed
FR?open
`);
  }

  // 🔥 KANAL KAPAT
  if (cmd === "closed") {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      return message.reply("Yetkin yok.");
    }

    await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, {
      SendMessages: false
    });

    message.reply("Kanal kapatıldı.");
  }

  // 🔥 KANAL AÇ
  if (cmd === "open") {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      return message.reply("Yetkin yok.");
    }

    await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, {
      SendMessages: true
    });

    message.reply("Kanal açıldı.");
  }

});

client.login(MTQ4NDUzODM3MTM0NTg3OTE3NQ.GkPwU-.jmwLpi6olnlYVe4o2XxKMPjskqiT9BLXGu0nbo);
