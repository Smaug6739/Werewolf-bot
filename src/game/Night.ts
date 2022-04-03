import { embedDescription, readSelect, createCharactersSelectMenu } from '../utils/components';
import { Cupidon, Garde, LoupGarou, Voyante } from '../characters';
import { wait } from '../utils';
import { Game } from './Game';
import { Character } from '../characters/_Character';
import { ChannelType, VoiceChannel } from 'discord.js';
import { createVote, getVoteResult } from '../utils/interactions/vote';
export class Night {
  public game: Game;
  public eliminated: Character[] = [];
  constructor(game: Game) {
    this.game = game;
  }
  public run(ch: Character | Character[]): Promise<void> {
    return new Promise<void>(async (resolve) => {
      if (ch instanceof Cupidon) {
        await this.cupidon(ch);
      } else if (ch instanceof Voyante) {
        await this.voyante(ch);
      } else if (ch instanceof Garde) {
        await this.garde(ch);
      } else if (ch instanceof Array && ch.some((c) => c instanceof LoupGarou)) {
        await this.loupsGarous(ch);
      }
      wait(3000).then(() => resolve());
      await this.game.clearInteractionsChannel();
      resolve();
    });
  }
  // ===========================================================CUPIDON===========================================================
  private async cupidon(ch: Cupidon | Cupidon[]): Promise<void> {
    if (Array.isArray(ch)) {
      await ch.every(async (c) => await this.cupidon(c));
      return;
    }
    return new Promise<void>(async (resolve) => {
      if (this.game.couple?.length) return resolve();
      const embedCupidon = embedDescription(ch);
      const sent = await this.game.interactionsChannel?.send({
        embeds: [embedCupidon],
        // @ts-ignore
        components: [createCharactersSelectMenu(this.characters), createCharactersSelectMenu(this.characters)],
      });

      const v1 = (await readSelect(sent!, [sent!.author.id]))[0];
      const v2 = (await readSelect(sent!, [sent!.author.id]))[0];

      const ch1 = this.game.characters.find((c) => c.discordId === v1)!;
      const ch2 = this.game.characters.find((c) => c.discordId === v2)!;

      this.game.data.couple = [ch1, ch2];

      const user1 = this.game.client.users.cache.get(ch1.discordId);
      const user2 = this.game.client.users.cache.get(ch2.discordId);
      try {
        user1!.send(`Vous êtes maintenant en couple avec : ${user2!.username}`);
        user2!.send(`Vous êtes maintenant en couple avec : ${user1!.username}`);
      } catch (e) {
        console.error(e);
      }
      resolve();
    });
  }
  // ===========================================================VOYANTE===========================================================
  private async voyante(ch: Voyante | Voyante[]): Promise<void> {
    if (Array.isArray(ch)) {
      await ch.every(async (c) => await this.voyante(c));
      return;
    }
    return new Promise<void>(async (resolve) => {
      const embed = embedDescription(ch);
      const row = createCharactersSelectMenu(this.game.characters);
      const sent = await this.game.interactionsChannel?.send({
        embeds: [embed],
        // @ts-ignore
        components: [row],
      });
      const v1 = (await readSelect(sent!, [sent!.author.id]))[0];

      const character = this.game.characters.find((c) => c.discordId === v1);
      if (!character) throw new Error('Character not found');
      this.game.interactionsChannel?.send({
        embeds: [embedDescription(character)],
      });
      resolve();
    });
  }
  // ===========================================================GARDE===========================================================
  private async garde(ch: Garde | Garde[]): Promise<void> {
    if (Array.isArray(ch)) {
      await ch.every(async (c) => await this.garde(c));
      return;
    }
    return new Promise<void>(async (resolve) => {
      const embed = embedDescription(ch);
      const row = createCharactersSelectMenu(this.game.characters);
      const sent = await this.game.interactionsChannel?.send({
        embeds: [embed],
        // @ts-ignore
        components: [row],
      });
      const v1 = (await readSelect(sent!, [sent!.author.id]))[0];
      const character = this.game.characters.find((c) => c.discordId === v1);
      if (!character) throw new Error('Character not found');
      this.game.interactionsChannel?.send('Joueur imunisé pour cette nuit');
      character.immune = true;
      resolve();
    });
  }
  // ===========================================================LOUP-GAROU===========================================================
  private async loupsGarous(chs: LoupGarou[]): Promise<void> {
    this.game.guild.channels.create(`Loups-Garous`, {
      type: ChannelType.GuildVoice,
      parent: this.game.catId,
    });
    return new Promise<void>(async (resolve) => {
      for (const ch of chs) {
        const member = this.game.guild.members.cache.get(ch.discordId);
        if (!member) throw new Error('Member not found');
        await member.voice.setChannel(
          this.game.guild.channels.cache.find(
            (c) => c.name === 'Loups-Garous' && c.type === ChannelType.GuildVoice && c.parentId === this.game.catId
          )! as VoiceChannel
        );
      }
      const results = await createVote(this.game, chs, embedDescription(chs[0]));
      const e = getVoteResult(results);
      this.eliminated.push(e);

      resolve();
    });
  }
}
