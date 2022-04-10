import { EmbedBuilder } from '@discordjs/builders';
import type { Character } from '../../characters/_Character';

export function embedDescription(ch: Character) {
  const embed = new EmbedBuilder()
    .setTitle(ch.name)
    .setDescription(ch.description)
    .setColor(0xff0000)
    .setThumbnail(ch.image)
    .setFooter({ text: ch.discordId });
  return embed;
}
