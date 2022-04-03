import type { Guild, SelectMenuInteraction, TextChannel, VoiceChannel } from 'discord.js';
import { PermissionsBitField, ChannelType } from 'discord.js';
import { EmbedBuilder } from '@discordjs/builders';
import { Character } from '../characters/_Character';
import { createCharactersSelectMenu } from '../utils/components';
import { Night } from './Night';
import type { ShewenyClient } from 'sheweny';

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
    this.moveMembersInDedicatedChannel(this.guild, this.catId);
  }
  public async moveMembersInDedicatedChannel(guild: Guild, catId: string) {
    const channels = guild.channels.cache.filter((c) => c.type === ChannelType.GuildVoice && c.parentId === catId);
    for (const c of this.characters) {
      let channel = channels.find((ch) => (ch as VoiceChannel).name.endsWith(c.discordId));
      if (!channel)
        channel = await guild.channels.create(`${c.name}-${c.discordId}`, { type: ChannelType.GuildVoice, parent: catId });
      const member = guild.members.cache.get(c.discordId);
      if (!member || !channel) throw new Error('Member or channel not found');
      await member.voice.setChannel(channel as VoiceChannel);
    }
  }
  public async turn() {
    // // Cupidon
    // const cupidon = this.characters.find((c) => c.name === 'Cupidon');
    // if (cupidon) this.couple = await cupidon.run(this);
    // await this.clearInteractionsChannel();
    // // Voyante
    // const voyante = this.characters.find((c) => c.name === 'Voyante');
    // if (voyante) await voyante.run(this);
    // await this.clearInteractionsChannel();
    // // Garde
    // const garde = this.characters.find((c) => c.name === 'Garde');
    // if (garde) this.characters = await garde.run(this);
    // await this.clearInteractionsChannel();
    // // Loup-garou
    // const loupGarou = this.characters.find((c) => ['Loup-garou', 'Loup-blanc'].includes(c.name));
    // if (loupGarou) await loupGarou.run(this);
    // await this.clearInteractionsChannel();
    const night = new Night(this);
    await night.run(this.characters.filter((c) => c.name === 'Cupidon'));
    await night.run(this.characters.filter((c) => c.name === 'Voyante'));
    await night.run(this.characters.filter((c) => c.name === 'Garde'));
  }

  public kill(ch: Character) {
    return new Promise<void>(async (resolve) => {
      ch.eliminated = true;
      const embed = new EmbedBuilder()
        .setTitle('Mort')
        .setAuthor({ name: ch.name, iconURL: ch.image })
        .setDescription(ch.description)
        .setThumbnail(ch.image)
        .setColor(0xff0000)
        .setFooter({ text: 'Mort' });
      this.interactionsChannel?.send({ embeds: [embed] });
      if (ch.name === 'Chasseur') {
        const sent = await this.interactionsChannel?.send({
          content: 'Chasseur, choisis une personne à tuer',
          // @ts-ignore
          components: [createCharactersSelectMenu(this.characters)],
        });
        const collector = await sent?.createMessageComponentCollector({
          filter: (m) => m.user.id === ch.discordId,
        });
        collector?.on('collect', async (i: SelectMenuInteraction) => {
          const person = this.characters.find((c) => c.discordId === i.values[0])!;
          if (!person) return;
          await this.kill(person);
        });
      }
      if (this.couple?.includes(ch)) {
        const other = this.couple.find((c) => c !== ch);
        if (!other) return;
        this.kill(other);
      }
      resolve();
    });
  }

  async clearInteractionsChannel() {
    await this.interactionsChannel?.bulkDelete(100);
  }
}
