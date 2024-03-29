exports.run = async (client, message, args, level) => {
  const Discord = require("discord.js");
  const helpInfoEmbed = new Discord.MessageEmbed();
  helpInfoEmbed.setTitle("__How to send Vents__")
  helpInfoEmbed.addField("`!vent`","**Command used to send messages to #vents**\nYou can either use the command in #send-vents or send a DM to the bot.\nCommand usage: `!vent <message>` for example `!vent Hello`",false)
  helpInfoEmbed.addField("\u200B","\u200B",false);
  helpInfoEmbed.addField("`!ping`","**Command used to check the bot's status.**\nCommand usage: `!ping`",false);
  helpInfoEmbed.addField("\u200B","\u200B",false);
  helpInfoEmbed.addField("Donations","If you want to support Venter financially to cover server costs please donate to https://paypal.me/slemea",false);
  helpInfoEmbed.setFooter("If you have any more questions or suggestions contact any Staff members.")
  message.channel.send(helpInfoEmbed)
};
/*
The HELP command is used to display every command's name and description
to the user, so that he may see what commands are available. The help
command is also filtered by level, so if a user does not have access to
a command, it is not shown to them. If a command name is given with the
help command, its extended help is shown.
*/
// const { codeBlock } = require("@discordjs/builders");
const { toProperCase } = require("../modules/functions.js");

exports.run = (client, message, args, level) => {
  // Grab the container from the client to reduce line length.
  const { container } = client;
  // If no specific command is called, show all filtered commands.
  if (!args[0]) {
    // Load guild settings (for prefixes and eventually per-guild tweaks)
    const settings = message.settings;

    // Filter all commands by which are available for the user's level, using
    // the <Collection>.filter() method.
    const myCommands = message.guild
      ? container.commands.filter(
          (cmd) => container.levelCache[cmd.conf.permLevel] <= level,
        )
      : container.commands.filter(
          (cmd) =>
            container.levelCache[cmd.conf.permLevel] <= level &&
            cmd.conf.guildOnly !== true,
        );

    // Then we will filter the myCommands collection again to get the enabled
    // commands.
    const enabledCommands = myCommands.filter((cmd) => cmd.conf.enabled);

    // Here we have to get the command names only, and we use that array to get
    // the longest name.
    const commandNames = [...enabledCommands.keys()];

    // This make the help commands "aligned" in the output.
    const longest = commandNames.reduce(
      (long, str) => Math.max(long, str.length),
      0,
    );

    let currentCategory = "";
    let output = `= Command List =\n[Use ${settings.prefix}help <commandname> for details]\n`;
    const sorted = enabledCommands.sort((p, c) =>
      p.help.category > c.help.category
        ? 1
        : p.help.name > c.help.name && p.help.category === c.help.category
          ? 1
          : -1,
    );

    sorted.forEach((c) => {
      const cat = toProperCase(c.help.category);
      if (currentCategory !== cat) {
        output += `\u200b\n== ${cat} ==\n`;
        currentCategory = cat;
      }
      output += `${settings.prefix}${
        c.help.name
      }${" ".repeat(longest - c.help.name.length)} :: ${c.help.description}\n`;
    });
    message.channel.send(codeBlock("asciidoc", output));
  } else {
    // Show individual command's help.
    let command = args[0];
    if (
      container.commands.has(command) ||
      container.commands.has(container.aliases.get(command))
    ) {
      command =
        container.commands.get(command) ??
        container.commands.get(container.aliases.get(command));
      if (level < container.levelCache[command.conf.permLevel]) return;
      message.channel.send(
        codeBlock(
          "asciidoc",
          `= ${command.help.name} = \n${command.help.description}\nusage:: ${
            command.help.usage
          }\naliases:: ${command.conf.aliases.join(", ")}`,
        ),
      );
    } else
      return message.channel.send(
        "No command with that name, or alias exists.",
      );
  }
};

exports.conf = {
  enabled: false,
  guildOnly: false,
  aliases: ["h", "halp"],
  permLevel: "User",
};

exports.help = {
  name: "help",
  category: "System",
  description: "Displays all the available commands for your permission level.",
  usage: "help [command]",
};
