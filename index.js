//const config = require("./config.json"); 
// Code below supports and is tested under "stable" 11.3.x
const Discord = require("discord.js");
const client = new Discord.Client();
 const express = require('express');
const app = express();
app.get('/', (req, res) => {
  res.send('Hello Express app!')
});

app.listen(30001, () => {
  console.log('server started');
})
// end discord.js init
const ytdl = require('ytdl-core')
// Initialize the server configurations
const Enmap = require('enmap');
require("dotenv").config();

// I attach settings to client to allow for modular bot setups
// In this example we'll leverage fetchAll:false and autoFetch:true for
// best efficiency in memory usage. We also have to use cloneLevel:'deep'
// to avoid our values to be "reference" to the default settings.
// The explanation for why is complex - just go with it.
client.settings = new Enmap({
  name: "settings",
  fetchAll: false,
  autoFetch: true,
  cloneLevel: 'deep',
  autoEnsure: {
    prefix: "cr!",
    CHANNEL: "",
    //LIVE: "https://onlineradiofm.in/stations/mirchi",
    LIVE: 'https://www.youtube.com/watch?v=gnyW6uaUgk4',
    bitrate: "192000",
  }
});
client.once('ready', () => {
	console.log(`Logged in as ${client.user.tag}. Ready on ${client.guilds.cache.size} servers, for a total of ${client.users.cache.size} users`);
  client.user.setActivity(`cr!help and Music with ${client.guilds.cache.size} servers`, { type: 'LISTENING' });
});
client.on("guildDelete", guild => {
  // When the bot leaves or is kicked, delete settings to prevent stale entries.
  client.settings.delete(guild.id);
});

client.on("guildMemberAdd", member => {
  // This executes when a member joins, so let's welcome them!

  // First, ensure the settings exist
  client.settings.ensure(member.guild.id, defaultSettings);

  // First, get the welcome message using get: 
  let welcomeMessage = client.settings.get(member.guild.id, "welcomeMessage");

  // Our welcome message has a bit of a placeholder, let's fix that:
  welcomeMessage = welcomeMessage.replace("{{user}}", member.user.tag)

  // we'll send to the welcome channel.
  member.guild.channels.cache
    .find(channel => channel.name === client.settings.get(member.guild.id, "welcomeChannel"))
    .send(welcomeMessage)
    .catch(console.error);

});
    client.on("message", async (message) => {
const guildConf = client.settings.get(message.guild.id);
if(message.content.toLowerCase().startsWith(guildConf.prefix))
  // This stops if it's not a guild (obviously), and we ignore all bots.
  // Pretty standard for any bot.
  if(!message.guild || message.author.bot) return;

  // We get the value, and autoEnsure guarantees we have a value already.
  

  // Now we can use the values! We stop processing if the message does not
  // start with our prefix for this guild.
  if(message.content.indexOf(guildConf.prefix) !== 0) return;
  //Then we use the config prefix to get our arguments and command:
  const args = message.content.split(/\s+/g);
  const command = args.shift().slice(guildConf.prefix.length).toLowerCase();
  if(command === 'help'){
    const embed = new Discord.MessageEmbed()
    .setTitle(`Radio Bot`)
    .setColor("RANDOM")
    .setDescription(`Help command: \`${guildConf.prefix}help\`\n\nServer Configuration: \`${guildConf.prefix}setconf (prefix | CHANNEL | LIVE | bitrate)\`\n\nStart radio: \`${guildConf.prefix}start\`\n\nStop radio/Restart radio: \`${guildConf.prefix}stop\`\n\nShow configurations: \`${guildConf.prefix}showconf\`\n\nInvite: \`${guildConf.prefix}invite\``)
    .setFooter('Developed and maintained by by Agent Hacker#0477')
    message.channel.send(embed)
  }
if(command === "setconf") {
    // Command is admin only, let's grab the admin value: 
if(message.member.hasPermission('MANAGE_GUILD', 'ADMINISTRATOR')){


    // Let's get our key and value from the arguments. 
    // This is array destructuring, by the way. 
    const [prop, ...value] = args;
    // Example: 
    // prop: "prefix"
    // value: ["+"]
    // (yes it's an array, we join it further down!)

    // We can check that the key exists to avoid having multiple useless, 
    // unused keys in the config:
    if(!args[0]) return message.channel.send('What do u want to change')
    if(!args[1]) return message.channel.send('Enter a value')
    if(!client.settings.has(message.guild.id, prop)) {
      return message.reply("This key is not in the configuration.");
    }

    // Now we can finally change the value. Here we only have strings for values 
    // so we won't bother trying to make sure it's the right type and such. 
    client.settings.set(message.guild.id, value.join(" "), prop);

    // We can confirm everything's done to the client.
    message.channel.send(`Guild configuration item ${prop} has been changed to:\n\`${value.join(" ")}\``)
    message.author.send(`Guild configuration item ${prop} has been changed to:\n\`${value.join(" ")}\`in ${message.guild.name}. I dm'ed u this so that dont forget it`)
}else{
  message.channel.send('You don\'t have perms\nPermissions require are \`Manage server\` and \`ADMINISTRATOR \`')
}
  }
    if(command === 'ping'){
            const msg = await message.channel.send("Pinging...");
      const Embed = new Discord.MessageEmbed()
        .setTitle("Pong!")
        .setAuthor(`${message.author.username}` , message.author.displayAvatarURL())
        .setDescription(
          `⌛ Latency is ${Math.floor(
            msg.createdTimestamp - message.createdTimestamp
          )}ms\n⏲️ API Ping is ${Math.round(client.ws.ping)}`
        )
        .setColor('RANDOM');
      msg.edit(Embed);
      msg.edit("\u200b");
    }
    if(command === 'invite'){
      const Embed = new Discord.MessageEmbed()
      .setTitle('Invite Radio Bot')
      .setDescription('By clicking [here](https://discord.com/api/oauth2/authorize?client_id=828510451595870218&permissions=8&scope=bot) you will redirected to authorization site aka Invite page\n\nIf here button is not working click this link: https://discord.com/api/oauth2/authorize?client_id=828510451595870218&permissions=8&scope=bot')
      .setColor('RANDOM')
      message.channel.send(Embed)
    }
    if(command === 'start'){
      
      if (message.member.voice.channel){ 
      if(!guildConf.CHANNEL) return message.channel.send(`Setup an channel by doing ${guildConf.prefix}setconf CHANNEL (vc id)`)
      let channel = client.channels.cache.get(guildConf.CHANNEL) || await client.channels.fetch(guildConf.CHANNEL)
  if(!channel) return;
  const connection = await channel.join();
  connection.play(ytdl(guildConf.LIVE),{ volume: 0.5}, {bitrate: 192000 /* 192kbps */})
  connection.voice.setSelfDeaf(true);
  const embed = new Discord.MessageEmbed()
  .setTitle('Live Radio')
  .setDescription(`Currently Playing ["LIVE RADIO"](${guildConf.LIVE})`)
  .setThumbnail(guildConf.LIVE)
  message.channel.send(embed)
    setInterval(async function () {
  if(!client.voice.connections.get(message.guild.id)) {
    let channel = client.channels.cache.get(guildConf.CHANNEL) || await client.channels.fetch(guildConf.CHANNEL)
    if(!channel) return;

    const connection = await channel.join()
    connection.play(ytdl(guildConf.LIVE), { volume: 0.5 }, {bitrate: guildConf.bitrate /* 192kbps */})
  }
}, 25920000)

      }else{
        message.channel.send('Join vc first')
      }
  }
  if(command === 'pause'){
        let channel = client.channels.cache.get(guildConf.CHANNEL) || await client.channels.fetch(guildConf.CHANNEL)
        const connection = await channel.join();
        const dis = connection.play();
   dis.pause(true);
  }
  if(command === 'play'){
                   let channel = client.channels.cache.get(guildConf.CHANNEL) || await client.channels.fetch(guildConf.CHANNEL)
        const connection = await channel.join();   
        const dis = connection.play();
        
    dis.resume();
  }
if(command === 'stop'){
        let channel = client.channels.cache.get(guildConf.CHANNEL) || await client.channels.fetch(guildConf.CHANNEL)
        const connection = await channel.join();
  connection.disconnect();

}
    if(command === "showconf") {
    let configProps = Object.keys(guildConf).map(prop => {
      return `${prop}  :  ${guildConf[prop]}`;
    });
    message.channel.send(`The following are the server's current configuration:
    \`\`\`${configProps.join("\n")}\`\`\``);
  }

  // Commands Go Here
});
client.login(process.env.TOKEN)
