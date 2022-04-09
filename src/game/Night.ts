import { embedDescription, readSelect, createCharactersSelectMenu } from '../utils/components';
import { Cupidon, Garde, LoupGarou, Voyante } from '../characters';
import { wait } from '../utils';
import { Game } from './Game';
import { Character } from '../characters/_Character';
import { ChannelType, VoiceChannel, PermissionFlagsBits } from 'discord.js';
import { createVote, getVoteResult } from '../utils/interactions/vote';
export class Night {
  public game: Game;
  public eliminated: Character[] = [];
  constructor(game: Game) {
    this.game = game;
  }
  public async run(ch: Character[]): Promise<void> {
    console.log('NIGHT:RUN: ' + ch.map((c) => c.name).join(','));
    if (!ch.length) return Promise.resolve();
    await this.game.clearInteractionsChannel();
    if (ch.some((c) => c.name === 'Cupidon')) {
      await this.cupidon(ch);
    } else if (ch.some((c) => c.name === 'Voyante')) {
      await this.voyante(ch);
    } else if (ch.some((c) => c.name === 'Garde')) {
      await this.garde(ch);
    } else if (ch.some((c) => c.name === 'Loup-Garou')) {
      console.log('NIGHT:RUN: LOUP');
      await this.loupsGarous(ch);
    }
    await wait(3000);
    await this.game.clearInteractionsChannel();
    return;
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
        components: [
          // @ts-ignore
          createCharactersSelectMenu(this.game.client, this.characters),
          // @ts-ignore
          createCharactersSelectMenu(this.game.client, this.characters),
        ],
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
      const row = createCharactersSelectMenu(this.game.client, this.game.characters);
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
      const row = createCharactersSelectMenu(this.game.client, this.game.characters);
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
    await this.game.interactionChannelPermissions(chs, true);
    const channel = (await this.game.guild.channels.create(`Loups-Garous`, {
      type: ChannelType.GuildVoice,
      parent: this.game.catId,
      permissionOverwrites: [
        {
          id: this.game.guild.id,
          deny: [PermissionFlagsBits.ViewChannel],
        },
      ],
    })) as VoiceChannel;
    return new Promise<void>(async (resolve) => {
      for (const ch of chs) {
        const member = this.game.guild.members.cache.get(ch.discordId);
        if (!member) return console.error(new Error('Member not found'));
        await member.voice.setChannel(channel);
      }
      const results = await createVote(this.game, chs, embedDescription(chs[0]));
      const e = getVoteResult(results);
      this.eliminated.push(e);

      await this.game.interactionChannelPermissions(chs, false);
      await this.game.moveMembersInDedicatedChannel();
      await channel.delete();
      resolve();
    });
  }
}
