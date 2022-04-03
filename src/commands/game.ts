import { Command } from 'sheweny';
import { Game } from '../game/Game';
import type { ShewenyClient } from 'sheweny';
import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  ButtonBuilder,
  ButtonStyle,
  CommandInteraction,
  Message,
  TextChannel,
} from 'discord.js';
import { Character } from '../characters/_Character';
export class GameCommand extends Command {
  constructor(client: ShewenyClient) {
    super(client, {
      name: 'game',
      description: 'Start a game',
      type: 'SLASH_COMMAND',
      category: 'Misc',
      // Select number in options of all characters
      options: [
        {
          name: 'temps',
          description: "Temps avant le début de la partie pour que les gens s'inscrivent (en minutes)",
          required: true,
          type: ApplicationCommandOptionType.Number,
        },
        {
          name: 'villageois',
          description: 'Son objectif est de vaincre les Loups-Garous.',
          required: false,
          type: ApplicationCommandOptionType.Integer,
        },
        {
          name: 'chasseur',
          description: 'Son objectif est de vaincre les Loups-Garous.',
          required: false,
          type: ApplicationCommandOptionType.Integer,
        },
        {
          name: 'cupidon',
          description: 'Cupidon a pour seul pouvoir de nommer les deux amoureux',
          required: false,
          type: ApplicationCommandOptionType.Integer,
        },
        {
          name: 'voyante',
          description: 'Son objectif est de vaincre les Loups-Garous.',
          required: false,
          type: ApplicationCommandOptionType.Integer,
        },
        {
          name: 'garde',
          description: 'Son objectif est de vaincre les Loups-Garous.',
          required: false,
          type: ApplicationCommandOptionType.Integer,
        },
        {
          name: 'loup-garou',
          description: 'Vaincre les villageois est son objectif.',
          required: false,
          type: ApplicationCommandOptionType.Integer,
        },
        {
          name: 'loup-blanc',
          description: 'Il fait partis des loups-garous vote avec eux.',
          required: false,
          type: ApplicationCommandOptionType.Integer,
        },
        {
          name: 'sorcière',
          description: 'Son objectif est de vaincre les Loups-Garous.',
          required: false,
          type: ApplicationCommandOptionType.Integer,
        },
      ],
    });
  }

  async execute(interaction: CommandInteraction) {
    const { options } = interaction;

    const nbVillageois = (options.get('Villageois')?.value as number) ?? 0;
    const nbChasseur = (options.get('Chasseur')?.value as number) ?? 0;
    const nbCupidon = (options.get('Cupidon')?.value as number) ?? 0;
    const nbVoyante = (options.get('Voyante')?.value as number) ?? 0;
    const nbGarde = (options.get('Garde')?.value as number) ?? 0;
    const nbLoupGarou = (options.get('Loup-Garou')?.value as number) ?? 0;
    const nbLoupBlanc = (options.get('Loup-Blanc')?.value as number) ?? 0;
    const nbSorcière = (options.get('Sorcière')?.value as number) ?? 0;
    const characters = [];
    const inscrits: string[] = [];
    const row = new ActionRowBuilder();
    row.addComponents(new ButtonBuilder().setLabel('Inscription').setStyle(ButtonStyle.Success).setCustomId('inscription'));
    await interaction.reply({
      content: "Une partie de loups-garous est en cours d'initialisation... Inscrivez vous en utilisant le bouton ci-dessous.",
      // @ts-ignore
      components: [row],
    });
    const reply = await interaction.fetchReply();
    // Create a collector for button click
    const collector = (reply as Message).createMessageComponentCollector({
      // @ts-ignore
      time: interaction.options.getNumber('temps') * 60 * 1000,
    });
    collector.on('collect', async (b) => {
      inscrits.push(b.user.id);
      await b.reply({ content: 'Vous êtes inscrit', ephemeral: true });
    });
    await new Promise<void>((resolve) => {
      collector.on('end', async () => {
        resolve();
        interaction.editReply('La partie peut commencer !');
      });
    });
    const total = nbChasseur + nbCupidon + nbVoyante + nbGarde + nbLoupGarou + nbLoupBlanc + nbSorcière + nbVillageois;
    if (inscrits.length < total) {
      return await interaction.reply({
        content: 'Il manque des personnes pour que la partie commence !',
      });
    }

    for (let i = 0; i < nbVillageois; i++) {
      const user = inscrits[Math.floor(Math.random() * inscrits.length)];
      inscrits.splice(inscrits.indexOf(user), 1);
      characters.push(new Character('Villageois', user));
    }
    for (let i = 0; i < nbChasseur; i++) {
      const user = inscrits[Math.floor(Math.random() * inscrits.length)];
      inscrits.splice(inscrits.indexOf(user), 1);
      characters.push(new Character('Chasseur', user));
    }
    for (let i = 0; i < nbCupidon; i++) {
      const user = inscrits[Math.floor(Math.random() * inscrits.length)];
      inscrits.splice(inscrits.indexOf(user), 1);
      characters.push(new Character('Cupidon', user));
    }
    for (let i = 0; i < nbVoyante; i++) {
      const user = inscrits[Math.floor(Math.random() * inscrits.length)];
      inscrits.splice(inscrits.indexOf(user), 1);
      characters.push(new Character('Voyante', user));
    }
    for (let i = 0; i < nbGarde; i++) {
      const user = inscrits[Math.floor(Math.random() * inscrits.length)];
      inscrits.splice(inscrits.indexOf(user), 1);
      characters.push(new Character('Garde', user));
    }
    for (let i = 0; i < nbLoupGarou; i++) {
      const user = inscrits[Math.floor(Math.random() * inscrits.length)];
      inscrits.splice(inscrits.indexOf(user), 1);
      characters.push(new Character('Loup-Garou', user));
    }
    for (let i = 0; i < nbLoupBlanc; i++) {
      const user = inscrits[Math.floor(Math.random() * inscrits.length)];
      inscrits.splice(inscrits.indexOf(user), 1);
      characters.push(new Character('Loup-Blanc', user));
    }
    for (let i = 0; i < nbSorcière; i++) {
      const user = inscrits[Math.floor(Math.random() * inscrits.length)];
      inscrits.splice(inscrits.indexOf(user), 1);
      characters.push(new Character('Sorcière', user));
    }
    const game = new Game(this.client, characters, interaction.guild!, (interaction.channel as TextChannel)!.parentId!);
    await game.startGame();
  }
}