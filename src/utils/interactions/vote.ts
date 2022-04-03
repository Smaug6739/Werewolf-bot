import { Character } from '../../characters/_Character';
import { Game } from '../../game/Game';
import { readSelect } from '../components';
import { EmbedBuilder } from 'discord.js';

export function createVote(game: Game, canVote: Character[], embed: EmbedBuilder): Promise<Character[]> {
  return new Promise<Character[]>(async (resolve) => {
    const sent = await game.interactionsChannel?.send({
      embeds: [embed],
      // @ts-ignore
      components: [createCharactersSelectMenu(game.characters)],
    });
    const votes = [];
    for (const user of canVote) {
      votes.push(readSelect(sent!, [user.discordId]));
    }
    const values = await Promise.all(votes);
    const results = [];
    for (const v of values) {
      results.push(game.characters.find((c) => c.discordId === v[0])!);
    }
    resolve(results);
  });
}

export function getVoteResult(chs: Character[]): Character {
  // Return the character who his most present in array
  const votes: any = chs.reduce((acc: any, c) => {
    if (!acc[c.discordId]) {
      acc[c.discordId] = 0;
    }
    acc[c.discordId]++;
    return acc;
  }, {});
  const max = Math.max(...(Object.values(votes) as any));
  const maxKeys = Object.keys(votes).filter((k) => votes[k] === max);
  return chs.find((c) => maxKeys.includes(c.discordId))!;
}
