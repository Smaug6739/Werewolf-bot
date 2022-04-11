import { ChannelType, EmbedBuilder, PermissionsBitField } from 'discord.js';
import { Character } from '../characters';
import { Day, Night } from '.';
import {
  changeImmuneAtEndOfDay,
  sendCharactersToUsers,
  wait,
  createVote,
  getVoteResult,
  InteractionChannel,
  InfosChannel,
  embedStart,
} from '../utils';
import type { Guild, VoiceChannel } from 'discord.js';
import type { ShewenyClient } from 'sheweny';

interface GameChannels {
  infos: InfosChannel;
  interaction: InteractionChannel;
  catId: string;
}
export class Game {
  public client: ShewenyClient;
  public couple?: [Character, Character];
  public channels: GameChannels;
  public mayor?: Character;
  public characters: Character[] = [];
  public guild: Guild;
  public catId: string;
  public constructor(client: ShewenyClient, characters: Character[], guild: Guild, catId: string) {
    this.client = client;
    this.characters = characters;
    this.guild = guild;
    this.catId = catId;
    this.channels = {
      infos: new InfosChannel(this.client, this.guild),
      interaction: new InteractionChannel(this.client, this.guild),
      catId: catId,
    };
  }
  public async startGame() {
    await this.channels.interaction.create(this.channels.catId);
    await this.channels.infos.create(this.characters, this.channels.catId);
    await this.channels.infos.send({ embeds: [embedStart()] });
    await this.moveMembersInDedicatedChannel();
    await wait(5000);
    return;
  }

  public async moveMembersInDedicatedChannel() {
    const channels = this.guild.channels.cache.filter((c) => c.type === ChannelType.GuildVoice && c.parentId === this.catId);
    for (const c of this.characters) {
      let channel = channels.find((ch) => (ch as VoiceChannel).name.endsWith(c.discordId));
      let member = this.guild.members.cache.get(c.discordId);
      if (!member) member = await this.guild.members.fetch({ user: c.discordId, force: true });
      if (!channel)
        channel = await this.guild.channels.create(`Maison de ${member.user.username}-${c.discordId}`, {
          type: ChannelType.GuildVoice,
          parent: this.catId,
          permissionOverwrites: [
            {
              id: this.guild.id,
              deny: [PermissionsBitField.Flags.ViewChannel],
            },
          ],
        });
      if (!member || !channel) throw new Error('Member or channel not found');
      try {
        await member.voice.setChannel(channel as VoiceChannel);
      } catch {
        this.channels.infos?.send(`Impossible de déplacer ${member.user} vers sa maison.`);
      }
    }
  }
  public async sendRolesToUsers() {
    await sendCharactersToUsers(this.client, this.characters);
    return;
  }
  public async turn() {
    await this.channels.interaction.permissions(this.characters, true, this.guild.id);
    await this.channels.infos.send(
      `@everyone, la nuit tombe sur le village. Chaque membre du village va rejoindre sa maison et le village va s'endormir\n*Veillez à être dans un channel vocal*.`
    );
    await this.channels.interaction.permissions(this.characters, false, this.guild.id);
    const night = new Night(this);
    await night.run(this.characters.filter((c) => !c.eliminated && c.name === 'Cupidon'));
    await night.run(this.characters.filter((c) => !c.eliminated && c.name === 'Loup-Garou'));
    await night.run(this.characters.filter((c) => !c.eliminated && c.name === 'Loup-Blanc'));
    await night.run(this.characters.filter((c) => !c.eliminated && c.name === 'Voyante'));
    await night.run(this.characters.filter((c) => !c.eliminated && c.name === 'Garde'));
    await night.run(this.characters.filter((c) => !c.eliminated && c.name === 'Sorcière'));
    const day = new Day(this);
    await wait(3000);
    await this.channels.interaction.permissions(this.characters, true, this.guild.id);
    await wait(5000);
    await day.voicePlace();
    await this.channels.infos.send(
      `@everyone, le jour se lève. Cette nuil il y a eu ${night.eliminated.length} mort(s).\nNous allons donc procéder au vote. Pour cela, rendez-vous dans le channel **interactions**.`
    );
    if (night.eliminated.length > 0) {
      for (const toKill of night.eliminated) {
        await this.kill(toKill);
      }
    }
    if (this.checkVictory()) return this.checkVictory();
    if (!this.mayor) await day.mayor();

    await day.vote();
    if (this.checkVictory()) return this.checkVictory();

    // IMMUNE CHANGE
    this.characters = changeImmuneAtEndOfDay(this.characters);

    await wait(5000);
    await this.channels.interaction.clear();
    await this.moveMembersInDedicatedChannel();
    return false; // Continue
  }

  public kill(ch: Character) {
    return new Promise<void>(async (resolve) => {
      if (ch.eliminated) return resolve();
      if (ch.immune) return resolve();

      ch.eliminated = true;
      const discordUser = this.client.users.cache.get(ch.discordId)!;
      const embed = new EmbedBuilder()
        .setTitle('Mort:')
        .setAuthor({ name: discordUser.username, iconURL: discordUser.displayAvatarURL() })
        .setDescription(ch.description)
        .setThumbnail(ch.image)
        .setColor(0xff0000)
        .setFooter({ text: 'Mort' });
      await this.channels.interaction.send({ embeds: [embed] });
      if (ch.name === 'Chasseur') {
        const embedChasseur = new EmbedBuilder().setTitle('Le chasseur est mort').setDescription(`${discordUser} est mort`);
        const vote = await createVote(this, [ch], embedChasseur);
        const result = await getVoteResult(vote);
        this.kill(result);
      }
      if (this.couple?.includes(ch)) {
        const other = this.couple.find((c) => c !== ch);
        if (!other) return;
        await this.kill(other);
      }
      resolve();
    });
  }
  public checkVictory() {
    const alive = this.characters.filter((c) => !c.eliminated);
    if (!alive.length) return 1;
    const categoriesAlive = new Set(alive.map((c) => c.team));
    if (categoriesAlive.size === 1) return [...categoriesAlive][0];
    else return false;
  }

  public async end() {
    this.channels.interaction.permissions(this.characters, true, this.guild.id);
    // Delete voices channels
    const voices = this.guild.channels.cache.filter((c) => c.type === ChannelType.GuildVoice && c.parentId === this.catId);
    for (const v of voices.values()) {
      v.delete();
    }
    let description = `La partie est terminée.  ${
      this.checkVictory() != 1 ? 'Les ' + this.checkVictory() + 'ont gagné !' : 'Aucun gangant tous le monde est mort !'
    } \n\n`;
    for (const c of this.characters) {
      const discordUser = this.client.users.cache.get(c.discordId)!;
      description += `${discordUser} : ${c.name} (${c.eliminated ? 'mort' : 'vivant'})\n`;
    }
    const embed = new EmbedBuilder().setTitle('Fin de la partie').setDescription(description).setColor([10, 163, 240]);
    await this.channels.infos.send({ content: '@everyone', embeds: [embed] });
    await this.channels.interaction.send(
      'Ce channel et celui du déroulement seront supprimés dans 5 minutes. Vous pouvez lancer une nouvelle partie en utilisant la commande /game.'
    );
    await this.channels.infos.send(
      'Ce channel et celui du déroulement seront supprimés dans 5 minutes. Vous pouvez lancer une nouvelle partie en utilisant la commande /game.'
    );
    await wait(300000);
    try {
      await this.channels.infos?.delete();
      await this.channels.interaction?.delete();
    } catch {}
  }
}
