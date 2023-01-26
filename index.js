const Discord = require(`discord.js`);
const client = new Discord.Client({ intents: [new Discord.Intents().add(32767)] });
const config = require(`./config.json`);
const Gamedig = require('gamedig');
const Canvas = require('canvas');
const db = require(`quick.db`);

const prefix = '+'

client.on(`ready`, () => {
    console.log(`Logged Us : ${client.user.tag}\nParis City Roleplay Is On`);
    client.user.setActivity(config.botinfo.status);
});


client.on(`messageCreate`, async smithmsg => {
    if (!smithmsg.content.startsWith(config.botinfo.prefix)) return;

    const args = smithmsg.content.slice(config.botinfo.prefix.length).trim().split(` `)
    const command = args.shift().toLowerCase();
    const channel = smithmsg.mentions.channels.first() || smithmsg.guild.channels.cache.get(args[0])


    if (command === `server`) {

        var timenow = new Date().getTime()

        var smithembedErr1 = new Discord.MessageEmbed()
            .setColor(`#1956ed`)
            .setAuthor({ name: smithmsg.author.username, iconURL: smithmsg.author.avatarURL() })
            .setTimestamp()
            .setDescription(`Please insert valid server ip (ex: ${config.botinfo.prefix}${command} <channel> <ip>:<port>)`);



        if (!args[0] || !channel) return smithmsg.reply({ embeds: [smithembedErr1] });

        var data = args[1].toString().split(`:`)
        var ip = data[0];
        var port = data[1];

        if (!port || !ip) return smithmsg.reply({ embeds: [smithembedErr1] });


        Send(smithmsg, channel, timenow, ip, port, data)
    }

})

function Send(msg, channel, time, ip, port) {
    Gamedig.query({
        type: 'samp',
        host: ip,
        port: port
    }).then(stats => {
        msg.react(`✅`).catch(err => { });
        var topOldTopPlayer = db.get(`smith_${ip}${port}`) || stats.raw.numplayers
        let topplayer = 0;

        if (Number(topOldTopPlayer) < stats.raw.numplayers) {
            db.set(`smith_${ip.replaceAll(`.`, `/`)}:${port.replaceAll(`.`, `/`)}`, Number(stats.raw.numplayers))


            topplayer = stats.raw.numplayers
        } else {
            topplayer = topOldTopPlayer
        }

        let player = stats.players
        let i = 0;
        let text1 = ``;
        let text2 = ``;
        while (i < player.length) {
            if (text1.length < 830) {
                let num;
                if (i < 10) {
                    num = "0" + i
                } else {
                    num = i
                }
                text1 += `${num} - ${player[i].name}\n`
                text2 += `${player[i].raw.ping} ms\n`

            } else {
                let otherPlayer = stats.maxplayers - i
                text1 += `and ${otherPlayer} others...`
                text2 += `...`
                break;
            }
            i++
        }

        const attachment = new Discord.MessageAttachment(`https://www.game-state.com/${ip}:${port}/stats.png`, 'smith.png');

        var smithembedErr1 = new Discord.MessageEmbed()
            .setAuthor({ name: stats.name, iconURL: msg.guild.iconURL() })
            .addFields({name: `🌐 Online:`, value: `**${stats.raw.numplayers}**/${stats.maxplayers}`, inline:true })
            .addFields({name: `💡 Timestamp:`, value: `<t:${time.toString().slice(0, 10)}:R>`, inline:true})
            .setImage(`attachment://smith.png`)
            .addFields({name: `📊 TOP ONLINE:`,value:  `**${topplayer}**`,inline: true})
            .setColor(`#1956ed`)
            .addFields({name: `players`,value: `\`\`\`${text1}\`\`\``,inline:true})
            .addFields({name: `ping`,value: `\`\`\`${text2}\`\`\``,inline:true})
            .setFooter({ text: `San Andreas Multiplayer | Paris Roleplay (c)`, iconURL: `https://media.discordapp.net/attachments/1067126121772093641/1067807618929803304/Picsart_23-01-25_01-48-28-845.png?width=639&height=646` })
            .setTimestamp()
            .addFields({name: `🔗 Server Link:`, value: `\`\`\`${ip}:${port}\`\`\`\n\`\`\`connect ${ip}:${port}\`\`\``, inline:false});

            var refresh_button = new Discord.MessageButton()
            .setLabel(`Refesh`)
            .setStyle(`SECONDARY`)
            .setCustomId(`refresh_samp`)
            .setEmoji(`🔄`);

            var all_cos = new Discord.MessageActionRow()
            .addComponents(refresh_button);

        channel.send({ embeds: [smithembedErr1], files: [attachment] , components: [all_cos] }).then(msg_sm => {
            if (!db.has(`all_server`)) {
                db.set(`all_server`, [])
            }
            db.push(`all_server`, { channel: channel.id, msg_id: msg_sm.id, time: time, ip: ip, port: port })
            
        }).catch(err => { });

    }).catch(err => {
        msg.react(`❌`).catch(err => { });
        var smithembedErr = new Discord.MessageEmbed()
            .setDescription(`I Can'T Found This Server Or Server Offline`)
            .setColor(`#1956ed`);

        msg.channel.send({ embeds: [smithembedErr] }).catch(err => { });
    });
}

client.on(`interactionCreate` , smithmsg => {
    if (!smithmsg.isButton()) return;

    var data = smithmsg.message.embeds[0].fields[5].value.toString().split("```\n```[F8]: connect ")[1].split("```")[0].split(`:`)
    var time = smithmsg.message.embeds[0].fields[1].value.toString().split(`<t:`)[1].split(`:R>`)[0]
    var ip = data[0];
    var port = data[1];
    var msg = smithmsg.message


    Update(msg, time, ip, port)

    smithmsg.reply({content: `Server Status Refreshed Successfully !!` , ephemeral: true})
    
})


function Update(msg, time, ip, port) {
    Gamedig.query({
        type: 'samp',
        host: ip,
        port: port
    }).then(stats => {
        var topOldTopPlayer = db.get(`smith_${ip.replaceAll(`.`, `/`)}:${port.replaceAll(`.`, `/`)}`) || 0
        let topplayer = 0;

        if (Number(stats.raw.numplayers) > Number(topOldTopPlayer)) {
            db.set(`smith_${ip.replaceAll(`.`, `/`)}:${port.replaceAll(`.`, `/`)}`, Number(stats.raw.numplayers))
            topplayer = stats.raw.numplayers
        } else {
            topplayer = topOldTopPlayer
        }

        let player = stats.players
        let i = 0;
        let text1 = ``;
        let text2 = ``;
        while (i < player.length) {
            if (text1.length < 830) {
                let num;
                if (i < 10) {
                    num = "0" + i
                } else {
                    num = i
                }
                text1 += `${num} - ${player[i].name}\n`
                text2 += `${player[i].raw.ping} ms\n`

            } else {
                let otherPlayer = stats.maxplayers - i
                text1 += `and ${otherPlayer} others...`
                text2 += `...`
                break;
            }
            i++
        }

        const attachment = new Discord.MessageAttachment(`https://www.game-state.com/${ip}:${port}/stats.png`, 'smith.png');

        var smithembedErr1 = new Discord.MessageEmbed()
        .setAuthor({ name: stats.name, iconURL: msg.guild.iconURL() })
        .addFields({name: `🌐 Online:`, value: `**${stats.raw.numplayers}**/${stats.maxplayers}`, inline:true })
        .addFields({name: `💡 Timestamp:`, value: `<t:${time.toString().slice(0, 10)}:R>`, inline:true})
        .setImage(`attachment://smith.png`)
        .addFields({name: `📊 TOP ONLINE:`,value:  `**${topplayer}**`,inline: true})
        .setColor(`#1956ed`)
        .addFields({name: `players`,value: `\`\`\`${text1}\`\`\``,inline:true})
        .addFields({name: `ping`,value: `\`\`\`${text2}\`\`\``,inline:true})
        .setFooter({ text: `San Andreas Multiplayer | Paris Roleplay (c)`, iconURL: `https://media.discordapp.net/attachments/1067126121772093641/1067807618929803304/Picsart_23-01-25_01-48-28-845.png?width=639&height=646` })
        .setTimestamp()
        .addFields({name: `🔗 Server Link:`, value: `\`\`\`${ip}:${port}\`\`\`\n\`\`\`[F8]: connect ${ip}:${port}\`\`\``, inline:false});

        msg.edit({ embeds: [smithembedErr1], files: [attachment] }).catch(err => { });

    }).catch(err => {
        var smithembedErr = new Discord.MessageEmbed()
            .setDescription(`I Can't Found This Server Or Server Offline`)
            .setColor(`#1956ed`);

        msg.edit({ embeds: [smithembedErr] }).catch(err => { });
    });
}

client.on("messageCreate", (message) => {
  if (!message.guild || message.author.bot) return;
  const command = message.content.split(" ")[0];
  if (command == prefix + "bot") {
    // Made By: SLASH
    const days = Math.floor(client.uptime / 86400000);
    const hours = Math.floor(client.uptime / 3600000) % 24;
    const minutes = Math.floor(client.uptime / 60000) % 60;
    // Made By: SLASH
    const seconds = Math.floor(client.uptime / 1000) % 60;
    const embed = new Discord.MessageEmbed()
      .setThumbnail(client.user.avatarURL({ format: 'png' }))
      .setColor("BLUE")
      .addFields(
        {name: "🤖 **Bot Name**", value: `**${client.user.username}**`, inline: true},
        {name: "🆔 **Bot ID**", value: `**${client.user.id}**`, inline: true},
        {name: "🧙‍♂️ **Bot Dev**", value: `[! BaaDI 🤍. <3](https://discord.com/users/399865513431400459)`, inline: true},// Made By: SLASH
        {name: "📶 **My Ping**", value: `\`${Math.round(client.ws.ping)}ms\``, inline: true},
        {name: "📒 **Library**", value: `**Discord.js**`, inline: true},
        {name: "🌐 **Version**", value: `**V13.6.0**`, inline: true},
        {name: "🚀 **Uptime**", value: `${days}d ${hours}h ${minutes}m ${seconds}s`, inline: true}
      )
      .setFooter({text: `Paris City Roleplay `, iconURL: `https://media.discordapp.net/attachments/1067126121772093641/1067807618929803304/Picsart_23-01-25_01-48-28-845.png?width=639&height=646`});
    message.reply({ embeds: [embed] }).catch((err) => { return; });
  }
});
  
client.on('messageCreate',async message => {
    if (message.author.bot || message.channel.type === 'DM') return
    if(message.content.startsWith('hi')) {
            message.reply(' 💙 مرحبا بك في سيرفر ')
    }
})

client.on('messageCreate',async message => {
    if (message.author.bot || message.channel.type === 'DM') return
    if(message.content.startsWith('slm')) {
            message.reply('cv')
    }
})

client.on('messageCreate',async message => {
    if (message.author.bot || message.channel.type === 'DM') return
    if(message.content.startsWith('ip')) {
            message.reply('sire dwze whiteliste')
    }
})

client.on('messageCreate',async message => {
    if (message.author.bot || message.channel.type === 'DM') return
    if(message.content.startsWith('paris')) {
            message.reply('For Life Azby .')
    }
})

client.on('messageCreate',async message => {
    if (message.author.bot || message.channel.type === 'DM') return
    if(message.content.startsWith('porn')) {
            message.reply('strfirtlah sire fhalk sire .')
    }
})

client.login(config.botinfo.token);