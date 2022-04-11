import { EmbedBuilder } from '@discordjs/builders';
import { characters } from '..';
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
    .setColor(0xff0000)
    .setFooter({ text: 'Le jeu commence' });
  return embed;
}
export function embedConfigGame() {
  const embed = new EmbedBuilder()
    .setTitle('Configuration de la partie')
    .setThumbnail('https://storage.crisp.chat/users/helpdesk/website/18579a93d9b99c00/loupgarouwolfy_1q2yt0l.png')
    .setDescription(
      "Veuillez utiliser l'embed avec les select-menus ci-dessous pour configurer une partie.\n\n- Pour choisir le nombre de joueurs vous devez le séléctionner dans le select-menu ci-dessous. Vous pouvez choisir un total (au maximum) de 25 roles. Le nombre de joueurs par défaut pour les roles est de 0.\n\n- Utilisez les boutons `Suivant` et `Précédent` pour naviguer entre les personnages.\n\n- Une fois le choix terminé, cliquez sur le bouton 'Terminé' pour valider votre choix."
    )
    .setColor(0xff0000)
    .setFooter({
      text: 'Une fois que vous aurez cliqué sur terminé, les inscriptions seront ouvertes dans ce channel.',
    });
  return embed;
}
export function embedCommand() {
  const embed = new EmbedBuilder()
    .setTitle('Début de la partie')
    .setThumbnail('https://storage.crisp.chat/users/helpdesk/website/18579a93d9b99c00/loupgarouwolfy_1q2yt0l.png')
    .setDescription(
      "Une nouvelle partie de loup-garou vient d'être lancée.\nVous pouvez vous inscrire __en appuyant sur le bouton ci-dessous__.\nMerci de rejoindre un channel vocal pour que le bot puisse vous déplacer par la suite. Il n'est pas obligatoire d'avoir de casque ou de micro pour jouer"
    )
    .setColor([213, 48, 50])
    .setFooter({
      text: 'Une fois inscrit merci de prendre le temps de jouer sans quoi vous bloquerez les autres joueurs. Bonne partie à tous !',
    });
  return embed;
}
export function embedCharacter(name: string): EmbedBuilder {
  const character = characters.find((ch) => ch.name === name);
  if (!character) throw new Error('Character not found');
  const embed = new EmbedBuilder();
  embed.setTitle(character.name);
  embed.setDescription(character.description);
  embed.setColor(0xff0000);
  embed.setThumbnail(character.image);
  embed.setFooter({ text: 'Choisissez ci-dessous le nombre de personnages que vous souhaitez' });
  return embed;
}
