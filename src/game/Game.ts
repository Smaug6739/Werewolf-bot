import type { Guild, TextChannel, VoiceChannel } from 'discord.js';
import { PermissionsBitField, ChannelType } from 'discord.js';
import { EmbedBuilder } from '@discordjs/builders';
import { Character } from '../characters/_Character';
import { embedDescription } from '../utils/components';
import { createVote, getVoteResult } from '../utils/interactions/vote';
import { Night } from './Night';
import { Day } from './Day';
import type { ShewenyClient } from 'sheweny';
import { wait } from '../utils/index';

interface GameData {
  mayor?: Character;
  couple?: [Character, Character];
}
export class Game {
  public client: ShewenyClient;
  public couple?: [Character, Character];
  public mayor?: Character;
  public characters: Character[] = [];
  public guild: Guild;
  public catId: string;
  public interactionsChannel?: TextChannel;
  public data: GameData = {};
  public constructor(client: ShewenyClient, characters: Character[], guild: Guild, catId: string) {
    this.client = client;
    this.characters = characters;
    this.guild = guild;
    this.catId = catId;
  }
  public async startGame() {
    this.interactionsChannel = await this.guild.channels.create('Déroulement', {
      parent: this.catId,
      type: ChannelType.GuildText,
      permissionOverwrites: [
        {
          id: this.guild.id,
          deny: [PermissionsBitField.Flags.ViewChannel],
        },
      ],
    });
    await this.moveMembersInDedicatedChannel();
  }
  public async interactionChannelPermissions(characters: Character[], state: boolean, guildId: string) {
    const permsArr = characters.map((c) => {
      let obj: any = { id: c.discordId, allow: [PermissionsBitField.Flags.ReadMessageHistory], deny: [] };
      if (state) obj.allow.push(PermissionsBitField.Flags.ViewChannel);
      else obj.deny.push(PermissionsBitField.Flags.ViewChannel);
      return obj;
    });
    permsArr.push({ id: guildId, deny: [PermissionsBitField.Flags.ViewChannel] });
    await this.interactionsChannel?.permissionOverwrites.set(permsArr);
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
        });
      if (!member || !channel) throw new Error('Member or channel not found');
      try {
        await member.voice.setChannel(channel as VoiceChannel);
      } catch {
        this.interactionsChannel?.send(`Impossible de déplacer ${member.user.username} vers sa maison.`);
      }
    }
  }
  public async sendRolesToUsers() {
    console.log('Sending roles to users');
    for (const c of this.characters) {
      const user = this.client.users.cache.get(c.discordId);
      if (user) user.send({ embeds: [embedDescription(c)] });
      await wait(2000);
    }
    await wait(30000); // Wait for 30 seconds
  }
  public async turn() {
    this.interactionChannelPermissions(this.characters, false, this.guild.id);
    const night = new Night(this);
    await night.run(this.characters.filter((c) => !c.eliminated && c.name === 'Cupidon'));
    await night.run(this.characters.filter((c) => !c.eliminated && c.name === 'Loup-Garou'));
    await night.run(this.characters.filter((c) => !c.eliminated && c.name === 'Loup-Blanc'));
    await night.run(this.characters.filter((c) => !c.eliminated && c.name === 'Voyante'));
    await night.run(this.characters.filter((c) => !c.eliminated && c.name === 'Garde'));
    await night.run(this.characters.filter((c) => !c.eliminated && c.name === 'Sorcière'));
    const day = new Day(this);
    await wait(5000);
    await this.interactionChannelPermissions(this.characters, true, this.guild.id);
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
    for (const ch of this.characters) {
      if (ch.immuneLast) ch.immuneLast = false;
      if (ch.immune) {
        ch.immune = false;
        ch.immuneLast = true;
      }
    }
    await this.clearInteractionsChannel();
    return false;
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
      await this.interactionsChannel?.send({ embeds: [embed] });
      if (ch.name === 'Chasseur') {
        const embedChasseur = new EmbedBuilder().setTitle('Le chasseur est mort').setDescription(`${discordUser} est mort`);
        const vote = await createVote(this, [ch], embedChasseur);
        const result = await getVoteResult(vote);
        this.kill(result);
      }
      if (this.couple?.includes(ch)) {
        console.log("===Couple's death===");
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
  async clearInteractionsChannel() {
    console.log('Clearing interactions channel');
    await this.interactionsChannel?.bulkDelete(10);
  }
  public async end() {
    this.interactionChannelPermissions(this.characters, true, this.guild.id);
    console.log('END');
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
    await this.interactionsChannel?.send({ content: '@everyone', embeds: [embed] });
    await this.interactionsChannel?.send(
      'Ce channel sera supprimé dans 5 minutes. Vous pouvez lancer une nouvelle partie en utilisant la commande /game.'
    );
    await wait(300000);
    try {
      await this.interactionsChannel?.delete();
    } catch {}
  }
}
