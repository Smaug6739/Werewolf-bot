import {
  embedDescription,
  readSelect,
  readButton,
  buildActionsButtons,
  createCharactersSelectMenu,
  wait,
  createVote,
  getVoteResult,
} from '../utils';
import { Character, Cupidon, Garde, LoupGarou, Voyante, LoupBlanc, Sorciere } from '../characters';
import { Game } from '.';
import { ChannelType, VoiceChannel, PermissionFlagsBits } from 'discord.js';
export class Night {
  public game: Game;
  public eliminated: Character[] = [];
  constructor(game: Game) {
    this.game = game;
  }
  public async run(ch: Character[]): Promise<void> {
    if (!ch.length) return Promise.resolve();
    await this.game.channels.interaction.clear();
    if (ch.some((c) => c.name === 'Cupidon')) {
      await this.cupidon(ch);
    } else if (ch.some((c) => c.name === 'Voyante')) {
      await this.voyante(ch);
    } else if (ch.some((c) => c.name === 'Garde')) {
      await this.garde(ch);
    } else if (ch.some((c) => c.name === 'Loup-Blanc')) {
      await this.loupsBlancs(ch);
    } else if (ch.some((c) => c.name === 'Sorcière')) {
      await this.sorcieres(ch as Sorciere[]);
    } else if (ch.some((c) => c.name === 'Loup-Garou')) {
      await this.loupsGarous(ch);
    }
    await wait(3000);
    return;
  }
  // ===========================================================CUPIDON===========================================================
  private async cupidon(ch: Cupidon | Cupidon[]): Promise<void | boolean> {
    if (Array.isArray(ch)) {
      for (const cpdn of ch) {
        return await this.cupidon(cpdn);
      }
    } else
      return new Promise<void>(async (resolve) => {
        if (ch.passed) return resolve();
        await this.game.channels.interaction.permissions([ch], true, this.game.guild.id);
        if (this.game.couple?.length) return resolve();
        const embedCupidon = embedDescription(ch);
        const sent = await this.game.channels.interaction.send({
          embeds: [embedCupidon],
          components: [
            // @ts-ignore
            createCharactersSelectMenu(
              this.game.client,
              this.game.characters.filter((c) => !c.eliminated)
            ),
            // @ts-ignore
            createCharactersSelectMenu(
              this.game.client,
              this.game.characters.filter((c) => !c.eliminated)
            ),
          ],
        });

        const v1 = (await readSelect(sent!, [ch.discordId]))[0];
        const v2 = (await readSelect(sent!, [ch.discordId]))[0];

        const ch1 = this.game.characters.find((c) => c.discordId === v1)!;
        const ch2 = this.game.characters.find((c) => c.discordId === v2)!;

        this.game.couple = [ch1, ch2];

        const user1 = this.game.client.users.cache.get(ch1.discordId);
        const user2 = this.game.client.users.cache.get(ch2.discordId);
        try {
          await user1!.send(`Vous êtes maintenant en couple avec : ${user2!.username}`);
          await user2!.send(`Vous êtes maintenant en couple avec : ${user1!.username}`);
        } catch (e) {
          console.error(e);
        }
        await this.game.channels.interaction.clear();
        await this.game.channels.interaction.permissions([ch], false, this.game.guild.id);
        ch.passed = true;
        resolve();
      });
  }
  // ===========================================================VOYANTE===========================================================
  private async voyante(ch: Voyante | Voyante[]): Promise<void> {
    if (Array.isArray(ch)) {
      for (const cpdn of ch) {
        return await this.voyante(cpdn);
      }
    } else
      return new Promise<void>(async (resolve) => {
        await this.game.channels.interaction.permissions([ch], true, this.game.guild.id);
        const embed = embedDescription(ch);
        const row = createCharactersSelectMenu(this.game.client, this.game.characters);
        const sent = await this.game.channels.interaction.send({
          embeds: [embed],
          content: `<@${ch.discordId}>`,
          // @ts-ignore
          components: [row],
        });
        const v1 = (await readSelect(sent!, [ch.discordId]))[0];

        const character = this.game.characters.find((c) => c.discordId === v1);
        if (!character) throw new Error('Character not found');
        this.game.channels.interaction.send({
          embeds: [embedDescription(character)],
        });
        await this.game.channels.interaction.clear();
        await this.game.channels.interaction.permissions([ch], false, this.game.guild.id);
        resolve();
      });
  }
  // ===========================================================GARDE===========================================================
  private async garde(ch: Garde | Garde[]): Promise<void> {
    if (Array.isArray(ch)) {
      for (const cpdn of ch) {
        return await this.garde(cpdn);
      }
    } else
      return new Promise<void>(async (resolve) => {
        await this.game.channels.interaction.permissions([ch], true, this.game.guild.id);
        const embed = embedDescription(ch);
        const row = createCharactersSelectMenu(this.game.client, this.game.characters);
        const sent = await this.game.channels.interaction.send({
          embeds: [embed],
          content: `<@${ch.discordId}>`,
          // @ts-ignore
          components: [row],
        });
        let choice;
        while (!choice) {
          const v1 = (await readSelect(sent!, [ch.discordId]))[0];
          const character = this.game.characters.find((c) => c.discordId === v1);
          if (character?.immuneLast) {
            this.game.channels.interaction.send(
              "Vous ne pouvez pas choisir ce personnage car il a été immunisé au tour précédent. Merci d'en choisir un autre."
            );
            continue;
          }
          choice = character;
        }

        await this.game.channels.interaction.send('Joueur imunisé pour cette nuit');
        await wait(5000);
        choice.immune = true;
        await this.game.channels.interaction.clear();
        await this.game.channels.interaction.permissions([ch], false, this.game.guild.id);
        resolve();
      });
  }
  // ===========================================================LOUP-GAROU===========================================================
  private async loupsGarous(chs: LoupGarou[]): Promise<void> {
    await this.game.channels.interaction.permissions(chs, true, this.game.guild.id);
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
      const results = await createVote(
        this.game,
        chs,
        embedDescription(chs[0]),
        `${chs.map((c) => '<@' + c.discordId + '>').join(' ')}`
      );
      const e = getVoteResult(results);
      this.eliminated.push(e);
      await this.game.channels.interaction.clear();
      await this.game.channels.interaction.permissions(chs, false, this.game.guild.id);
      await this.game.moveMembersInDedicatedChannel();
      await channel.delete();
      resolve();
    });
  }
  // ===========================================================LOUP-BLANC===========================================================
  private async loupsBlancs(ch: LoupBlanc[] | LoupBlanc): Promise<void> {
    if (Array.isArray(ch)) {
      for (const lpb of ch) {
        return await this.loupsBlancs(lpb);
      }
    } else
      return new Promise<void>(async (resolve) => {
        await this.game.channels.interaction.permissions([ch], true, this.game.guild.id);
        const embed = embedDescription(ch);
        const row = createCharactersSelectMenu(
          this.game.client,
          this.game.characters.filter((c) => c.name === 'Loup-Garou' || c.name === 'Loup-Blanc')
        );
        const sent = await this.game.channels.interaction.send({
          embeds: [embed],
          content: `<@${ch.discordId}>`,
          // @ts-ignore
          components: [row],
        });
        const v1 = (await readSelect(sent!, [ch.discordId]))[0];
        const character = this.game.characters.find((c) => c.discordId === v1);
        if (!character) throw new Error('Character not found');
        this.eliminated.push(character);

        await wait(5000);
        await this.game.channels.interaction.clear();
        await this.game.channels.interaction.permissions([ch], false, this.game.guild.id);
        resolve();
      });
  }

  // ===========================================================SORCIERE===========================================================
  private async sorcieres(ch: Sorciere[] | Sorciere): Promise<void> {
    if (Array.isArray(ch)) {
      for (const lpb of ch) {
        return await this.sorcieres(lpb);
      }
    } else
      return new Promise<void>(async (resolve) => {
        await this.game.channels.interaction.permissions([ch], true, this.game.guild.id);
        const embed = embedDescription(ch);
        const row = createCharactersSelectMenu(
          this.game.client,
          this.game.characters.filter((c) => !c.eliminated)
        );
        const sent = await this.game.channels.interaction.send({
          embeds: [embed],
          content: `<@${ch.discordId}>`,
          // @ts-ignore
          components: [buildActionsButtons()],
        });
        let action;
        while (!action) {
          action = await readButton(sent!, [ch.discordId]);
          if (action === 'kill' && ch.kill) {
            this.game.channels.interaction.send('Vous avez déjà fait cette action');
            action = '';
          }
          if (action === 'save' && ch.save) {
            this.game.channels.interaction.send('Vous avez déjà fait cette action');
            action = '';
          }
        }
        if (action === 'kill' || action === 'save') {
          const sent2 = await this.game.channels.interaction.send({
            // @ts-ignore
            components: [row],
          });
          const v1 = (await readSelect(sent2!, [ch.discordId]))[0];
          const character = this.game.characters.find((c) => c.discordId === v1);
          if (!character) throw new Error('Character not found');
          if (action === 'kill') {
            ch.kill = true;
            this.eliminated.push(character);
          }
          if (action === 'save') {
            ch.save = true;
            character.immune = true;
          }
        }
        await wait(5000);
        await this.game.channels.interaction.clear();
        await this.game.channels.interaction.permissions([ch], false, this.game.guild.id);
        resolve();
      });
  }
}
