import { Game } from './Game';
import { Character } from '../characters/_Character';
import { EmbedBuilder } from 'discord.js';
import { createVote, getVoteResult } from '../utils/interactions/vote';
export class Day {
  public game: Game;
  public eliminated: Character[] = [];
  constructor(game: Game) {
    this.game = game;
  }
  public async mayor() {
    const embed = new EmbedBuilder()
      .setTitle('Vote pour élire le maire')
      .setDescription('Vous pouvez voter pour élire le maire en cliquant sur le select-menu ci-dessous')
      .setColor('#0099ff');
    const vote = await createVote(
      this.game,
      this.game.characters.filter((c) => !c.eliminated),
      embed
    );
    const result = await getVoteResult(vote);
    this.game.mayor = result;
    result.mayor = true;
    this.game.interactionsChannel!.send(
      `Le maire est ${this.game.client.users.cache.get(result.discordId)!.username} ! Félicitations !`
    );
  }
  public async vote() {
    const embed = new EmbedBuilder()
      .setTitle('Vote pour éliminer un joueur')
      .setDescription('Vous pouvez voter pour éliminer un joueur en cliquant sur le select-menu ci-dessous')
      .setColor('#0099ff');
    const vote = await createVote(this.game, this.game.characters, embed);
    const result = await getVoteResult(vote);
    this.game.kill(result);
  }
}
