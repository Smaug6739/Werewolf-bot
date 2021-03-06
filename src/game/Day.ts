import { ChannelType, EmbedBuilder } from 'discord.js';
import { Game } from '.';
import { Character } from '../characters';
import { createVote, getVoteResult } from '../utils';
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
    this.game.channels.interaction.send(
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
  public async voicePlace() {
    const voicePlace = await this.game.guild.channels.create('Place du village', {
      parent: this.game.catId,
      type: ChannelType.GuildVoice,
    });
    for (const ch of this.game.characters) {
      if (ch.eliminated) continue;
      const member = this.game.guild.members.cache.get(ch.discordId);
      if (!member) continue;
      try {
        await member.voice.setChannel(voicePlace);
      } catch {}
    }
    return;
  }
}
