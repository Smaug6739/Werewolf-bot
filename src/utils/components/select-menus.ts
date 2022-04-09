import { ActionRowBuilder, SelectMenuBuilder, SelectMenuOptionBuilder } from '@discordjs/builders';
import type { Message, SelectMenuInteraction, Snowflake } from 'discord.js';
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
      .setCustomId('vote')
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
      i.reply({ content: 'Votre choix a été pris en compte.', ephemeral: true });
      resolve(i.values);
    });
  });
}
