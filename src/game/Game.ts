import { ChannelType, EmbedBuilder } from 'discord.js';
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
    await this.moveMembersInDedicatedChannel();
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
        });
      if (!member || !channel) throw new Error('Member or channel not found');
      try {
        await member.voice.setChannel(channel as VoiceChannel);
      } catch {
        this.channels.interaction?.send(`Impossible de déplacer ${member.user} vers sa maison.`);
      }
    }
  }
  public async sendRolesToUsers() {
    sendCharactersToUsers(this.client, this.characters);
  }
  public async turn() {
    this.channels.interaction.permissions(this.characters, false, this.guild.id);
    const night = new Night(this);
    await night.run(this.characters.filter((c) => !c.eliminated && c.name === 'Cupidon'));
    await night.run(this.characters.filter((c) => !c.eliminated && c.name === 'Loup-Garou'));
    await night.run(this.characters.filter((c) => !c.eliminated && c.name === 'Loup-Blanc'));
    await night.run(this.characters.filter((c) => !c.eliminated && c.name === 'Voyante'));
    await night.run(this.characters.filter((c) => !c.eliminated && c.name === 'Garde'));
    await night.run(this.characters.filter((c) => !c.eliminated && c.name === 'Sorcière'));
    const day = new Day(this);
    await wait(5000);
    await this.channels.interaction.permissions(this.characters, true, this.guild.id);
    await wait(5000);
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
    await this.channels.interaction.clear();
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
      this.checkVictory() != 1 ? 'Les' + this.checkVictory() + 'ont gagné !' : 'Aucun gangant tous le monde est mort !'
    } \n`;
    for (const c of this.characters) {
      const discordUser = this.client.users.cache.get(c.discordId)!;
      description += `${discordUser} : ${c.name} (${c.eliminated ? 'mort' : 'vivant'})\n`;
    }
    const embed = new EmbedBuilder().setTitle('Fin de la partie').setDescription(description);
    await this.channels.interaction.send({ content: '@everyone', embeds: [embed] });
    await this.channels.interaction.send(
      'Ce channel sera supprimé dans 5 minutes. Vous pouvez lancer une nouvelle partie en utilisant la commande /game.'
    );
    await wait(300000);
    try {
      await this.channels.interaction?.delete();
    } catch {}
  }
}
