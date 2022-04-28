import { Command } from 'sheweny';
import { EmbedBuilder } from 'discord.js';
import type { ShewenyClient } from 'sheweny';

export class GetAvatar extends Command {
  constructor(client: ShewenyClient) {
    super(client, {
      name: 'send-embed',
      type: 'CONTEXT_MENU_MESSAGE',
      category: 'Misc',
      description: 'Get avatar of user',
      cooldown: 10,
    });
  }

  async execute(interaction: any) {
    const message = await interaction.channel!.messages.fetch(interaction.targetId);
    const embed = new EmbedBuilder()
      .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
      .setDescription(message.content)
      .setTimestamp();
    interaction.reply({ embeds: [embed] });
  }
}
