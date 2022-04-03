import { ShewenyClient } from 'sheweny';
import { ActivityType, IntentsBitField, Partials, CommandInteraction, Message } from 'discord.js';
import dotenv from 'dotenv';
dotenv.config();
class Client extends ShewenyClient {
  constructor() {
    super({
      intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.GuildVoiceStates,
      ],
      partials: [Partials.GuildMember],
      mode: 'development',
      joinThreadsOnCreate: true,
      presence: {
        status: 'online',
        activities: [
          {
            name: `Loup Garou`,
            type: ActivityType.Watching,
          },
        ],
      },
      managers: {
        commands: {
          directory: './commands',
          guildId: process.env.guildId, // Change with id of your guild or remote it
          prefix: '!',
          default: {
            cooldown: 10,
          },
        },
      },
    });

    this.managers
      .commands!.on('cooldownLimit', (ctx: CommandInteraction | Message): any => {
        return ctx.reply({
          content: 'Please slow down',
        });
      })
      .on('userMissingPermissions', (interaction: CommandInteraction, missing: string) => {
        return interaction.reply({
          content: `You don't have ${missing} permissions`,
          ephemeral: true,
        });
      });
    this.login(process.env.DISCORD_TOKEN);
  }
}

new Client();
