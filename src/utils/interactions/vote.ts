import { Character } from '../../characters/_Character';
import { Game } from '../../game/Game';
import { readSelect } from '../components';
import { EmbedBuilder } from 'discord.js';
import { createCharactersSelectMenu } from '../components';
export function createVote(game: Game, canVote: Character[], embed: EmbedBuilder, content = ''): Promise<Character[]> {
  return new Promise<Character[]>(async (resolve) => {
    const sent = await game.channels.interaction?.send({
      embeds: [embed],
      content,
      // @ts-ignore
      components: [createCharactersSelectMenu(game.client, game.characters)],
    });
    const votes = [];
    for (const user of canVote) {
      if (user.mayor) {
        const result = readSelect(sent!, [user.discordId]);
        votes.push(result, result);
      } else votes.push(readSelect(sent!, [user.discordId]));
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
  let r = chs.find((c) => maxKeys.includes(c.discordId))!;
  // if r is undefined, set a random character
  if (!r) {
    r = chs[0];
  }
  return r;
}
