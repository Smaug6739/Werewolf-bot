import { ActionRowBuilder, SelectMenuBuilder, SelectMenuOptionBuilder } from '@discordjs/builders';
import { Message, SelectMenuInteraction, Snowflake } from 'discord.js';
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
export function buildCommandSelectMenu(ch: string) {
  const row = new ActionRowBuilder();
  // Choice between 1 to 25

  const options = [
    { label: '1', discription: 'Choisir 1 personne', value: '1' },
    { label: '2', discription: 'Choisir 2 personnes', value: '2' },
    { label: '3', discription: 'Choisir 3 personnes', value: '3' },
    { label: '4', discription: 'Choisir 4 personnes', value: '4' },
    { label: '5', discription: 'Choisir 5 personnes', value: '5' },
    { label: '6', discription: 'Choisir 6 personnes', value: '6' },
    { label: '7', discription: 'Choisir 7 personnes', value: '7' },
    { label: '8', discription: 'Choisir 8 personnes', value: '8' },
    { label: '9', discription: 'Choisir 9 personnes', value: '9' },
    { label: '10', discription: 'Choisir 10 personnes', value: '10' },
    { label: '11', discription: 'Choisir 11 personnes', value: '11' },
    { label: '12', discription: 'Choisir 12 personnes', value: '12' },
    { label: '13', discription: 'Choisir 13 personnes', value: '13' },
    { label: '14', discription: 'Choisir 14 personnes', value: '14' },
    { label: '15', discription: 'Choisir 15 personnes', value: '15' },
    { label: '16', discription: 'Choisir 16 personnes', value: '16' },
    { label: '17', discription: 'Choisir 17 personnes', value: '17' },
    { label: '18', discription: 'Choisir 18 personnes', value: '18' },
    { label: '19', discription: 'Choisir 19 personnes', value: '19' },
    { label: '20', discription: 'Choisir 20 personnes', value: '20' },
    { label: '21', discription: 'Choisir 21 personnes', value: '21' },
    { label: '22', discription: 'Choisir 22 personnes', value: '22' },
    { label: '23', discription: 'Choisir 23 personnes', value: '23' },
    { label: '24', discription: 'Choisir 24 personnes', value: '24' },
    { label: '25', discription: 'Choisir 25 personnes', value: '25' },
  ];
  const select = new SelectMenuBuilder()
    .setOptions(...options)
    .setCustomId(`commandselect-${ch}`)
    .setPlaceholder('Choisissez le nombre de personnes pour ce role');
  row.addComponents(select);
  return row;
}
