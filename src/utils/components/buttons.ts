import { ActionRowBuilder, ButtonBuilder } from '@discordjs/builders';
import { ButtonInteraction, ButtonStyle, Message, Snowflake } from 'discord.js';

export function readButton(msg: Message, id: Snowflake[]) {
  return new Promise<string>((resolve) => {
    const collector = msg.createMessageComponentCollector({
      filter: (m) => id.includes(m.user.id),
    });

    collector.once('collect', async (i: ButtonInteraction) => {
      await i.reply({ content: 'Votre choix a été pris en compte.', ephemeral: true });
      resolve(i.customId);
    });
  });
}

export function buildActionsButtons() {
  const row = new ActionRowBuilder();
  row.addComponents(
    new ButtonBuilder().setLabel('Tuer un joueur').setCustomId('kill').setStyle(ButtonStyle.Danger).setEmoji({ name: '❤️‍🔥' }),
    new ButtonBuilder().setLabel('Protéger un joueur').setCustomId('save').setStyle(ButtonStyle.Success).setEmoji({ name: '❤️' }),
    new ButtonBuilder().setLabel('Ne rien faire').setCustomId('nothing').setStyle(ButtonStyle.Secondary).setEmoji({ name: '⌛' })
  );
  return row;
}
