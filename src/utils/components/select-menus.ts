import { ActionRowBuilder, SelectMenuBuilder, UnsafeSelectMenuOptionBuilder } from '@discordjs/builders';
import type { Message, SelectMenuInteraction, Snowflake } from 'discord.js';
import { Character } from '../../characters/_Character';

export function createCharactersSelectMenu(characters: Character[]) {
  characters = characters.filter((c) => !c.eliminated);
  const row = new ActionRowBuilder();
  const options = characters.map((c) =>
    new UnsafeSelectMenuOptionBuilder().setDescription(c.description).setLabel(c.name).setValue(`cupidon-${c.discordId}`)
  );
  row.addComponents(new SelectMenuBuilder().setOptions(...options));
  return row;
}

export function readSelect(msg: Message, id: Snowflake[]) {
  return new Promise<string[]>((resolve) => {
    const collector = msg.createMessageComponentCollector({
      filter: (m) => id.includes(m.user.id),
    });
    collector.once('collect', async (i: SelectMenuInteraction) => {
      resolve(i.values);
    });
  });
}
