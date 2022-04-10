import { ChannelType, PermissionsBitField, TextChannel } from 'discord.js';
import { Character } from '../../characters';
import type { Client, Guild, MessageOptions, MessagePayload } from 'discord.js';
import type { ShewenyClient } from 'sheweny';

export class InteractionChannel {
  public client: Client;
  public guild: Guild;
  public channel?: TextChannel;
  constructor(client: ShewenyClient, guild: Guild) {
    this.client = client;
    this.guild = guild;
  }
  public async create(catId: string) {
    this.guild.channels.create('Déroulement', {
      parent: catId,
      type: ChannelType.GuildText,
      permissionOverwrites: [
        {
          id: this.guild.id,
          deny: [PermissionsBitField.Flags.ViewChannel],
        },
      ],
    });
  }
  public async permissions(characters: Character[], state: boolean, guildId: string) {
    const permsArr = characters.map((c) => {
      let obj: any = { id: c.discordId, allow: [PermissionsBitField.Flags.ReadMessageHistory], deny: [] };
      if (state) obj.allow.push(PermissionsBitField.Flags.ViewChannel);
      else obj.deny.push(PermissionsBitField.Flags.ViewChannel);
      return obj;
    });
    permsArr.push({ id: guildId, deny: [PermissionsBitField.Flags.ViewChannel] });
    await this.channel?.permissionOverwrites.set(permsArr);
    return;
  }
  public async clear(nb = 10) {
    await this.channel?.bulkDelete(nb);
    return;
  }
  public async delete() {
    await this.channel?.delete();
    return;
  }
  public async send(params: string | MessageOptions | MessagePayload) {
    if (!this.channel) return;
    return this.channel?.send(params);
  }
}
