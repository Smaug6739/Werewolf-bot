import { ChannelType, OverwriteResolvable, PermissionsBitField, TextChannel } from 'discord.js';
import { Character } from '../../characters';
import type { Client, Guild, MessageOptions, MessagePayload } from 'discord.js';
import type { ShewenyClient } from 'sheweny';

export class InfosChannel {
  public client: Client;
  public guild: Guild;
  public channel?: TextChannel;
  constructor(client: ShewenyClient, guild: Guild) {
    this.client = client;
    this.guild = guild;
  }
  public async create(characters: Character[], catId: string) {
    const permissionsInfos: OverwriteResolvable[] = [
      {
        id: this.guild.id,
        deny: [PermissionsBitField.Flags.ViewChannel],
      },
    ];
    for (const c of characters) {
      permissionsInfos.push({
        id: c.discordId,
        allow: [PermissionsBitField.Flags.ReadMessageHistory, PermissionsBitField.Flags.ViewChannel],
        deny: [PermissionsBitField.Flags.SendMessages],
      });
    }
    this.channel = await this.guild.channels.create('Informations', {
      parent: catId,
      type: ChannelType.GuildText,
      permissionOverwrites: permissionsInfos,
    });
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
    return await this.channel?.send(params);
  }
}
