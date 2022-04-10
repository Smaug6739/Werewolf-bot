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
export function embedStart() {
  const embed = new EmbedBuilder()
    .setTitle('Le jeu commence')
    .setDescription(
      "Le jeu commence. Le bot est en train d'envoyer vos roles dans vos messages privés. Lorsque ce sera à votre tour de jouer vous serez mentionné dans un channel nommé déroulement."
    )
    .setColor([229, 10, 240])
    .setFooter({ text: 'Le jeu commence' });
  return embed;
}
