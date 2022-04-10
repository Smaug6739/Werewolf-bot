import { ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, SelectMenuOptionBuilder } from '@discordjs/builders';
import { ButtonInteraction, ButtonStyle, Message, SelectMenuInteraction, Snowflake } from 'discord.js';
import { ShewenyClient } from 'sheweny';
import { Character } from '../../characters/_Character';

export function createCharactersSelectMenu(client: ShewenyClient, characters: Character[]) {
  characters = characters.filter((c) => !c.eliminated);
  const row = new ActionRowBuilder();
  const options = characters.map((c) => {
    const discordUser = client.users.cache.get(c.discordId)!;
    return new SelectMenuOptionBuilder()
      .setDescription(discordUser.username + '#' + discordUser.discriminator)
      .setLabel(discordUser.username)
      .setValue(c.discordId);
  });
  row.addComponents(
    new SelectMenuBuilder()
      .setOptions(...options)
      .setCustomId('vote' + Math.random() * 5)
      .setPlaceholder('Votez pour une personne')
  );
  return row;
}

export function readSelect(msg: Message, id: Snowflake[]) {
  return new Promise<string[]>((resolve) => {
    const collector = msg.createMessageComponentCollector({
      filter: (m) => id.includes(m.user.id),
    });
    collector.once('collect', async (i: SelectMenuInteraction) => {
      await i.reply({ content: 'Votre choix a été pris en compte.', ephemeral: true });
      resolve(i.values);
    });
  });
}
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
    new ButtonBuilder().setLabel('Tuer le joueur').setCustomId('kill').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setLabel('Protéger le joueur').setCustomId('save').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setLabel('Ne rien faire').setCustomId('nothing').setStyle(ButtonStyle.Secondary)
  );
  return row;
}
