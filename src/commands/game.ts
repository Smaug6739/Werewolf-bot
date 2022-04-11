import { Command } from 'sheweny';
import { Game } from '../game/Game';
import type { ShewenyClient } from 'sheweny';
import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  CommandInteraction,
  Message,
  TextChannel,
} from 'discord.js';
import { Character } from '../characters/_Character';
import { buildCommandSelectMenu, embedCharacter, embedCommand, embedConfigGame, EmbedPaginator } from '../utils';

function shuffle(array: string[]) {
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }

  return array;
}

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
      ],
    });
  }

  async execute(interaction: CommandInteraction) {
    let nbVillageois = 0;
    let nbChasseur = 0;
    let nbCupidon = 0;
    let nbVoyante = 0;
    let nbGarde = 0;
    let nbLoupGarou = 0;
    let nbLoupBlanc = 0;
    let nbSorcière = 0;
    const embedsOfCharacters = [
      { embeds: [embedConfigGame()], components: [] },
      { embeds: [embedCharacter('Villageois')], components: [buildCommandSelectMenu('Villageois')] },
      { embeds: [embedCharacter('Chasseur')], components: [buildCommandSelectMenu('Chasseur')] },
      { embeds: [embedCharacter('Cupidon')], components: [buildCommandSelectMenu('Cupidon')] },
      { embeds: [embedCharacter('Voyante')], components: [buildCommandSelectMenu('Voyante')] },
      { embeds: [embedCharacter('Garde')], components: [buildCommandSelectMenu('Garde')] },
      { embeds: [embedCharacter('Loup-Garou')], components: [buildCommandSelectMenu('Loup-Garou')] },
      { embeds: [embedCharacter('Loup-Blanc')], components: [buildCommandSelectMenu('Loup-Blanc')] },
      { embeds: [embedCharacter('Sorcière')], components: [buildCommandSelectMenu('Sorcière')] },
    ];
    const paginator = new EmbedPaginator(interaction.channel! as TextChannel, embedsOfCharacters, interaction.user.id);
    await interaction.reply("Veuillez configurer la partie avec l'embed ci-dessous.");
    const characters: Character[] = [];
    paginator.on('end', async (data: any) => {
      for (const us of data) {
        switch (us.name) {
          case 'Villageois':
            nbVillageois = us.value;
            break;
          case 'Chasseur':
            nbChasseur = us.value;
            break;
          case 'Cupidon':
            nbCupidon = us.value;
            break;
          case 'Voyante':
            nbVoyante = us.value;
            break;
          case 'Garde':
            nbGarde = us.value;
            break;
          case 'Loup-Garou':
            nbLoupGarou = us.value;
            break;
          case 'Loup-Blanc':
            nbLoupBlanc = us.value;
            break;
          case 'Sorcière':
            nbSorcière = us.value;
            break;
        }
        if (characters.length > 25) {
          return interaction.channel?.send('Vous ne pouvez pas avoir plus de 25 personnages');
        }

        //=====================INSCRIPTIONS=====================
        const inscrits: string[] = [];
        const row = new ActionRowBuilder();
        row.addComponents(
          new ButtonBuilder()
            .setLabel('Inscription')
            .setStyle(ButtonStyle.Success)
            .setCustomId('inscription')
            .setEmoji({ name: '📢' })
        );
        const reply = await interaction.channel?.send({
          embeds: [embedCommand()],
          // @ts-ignore
          components: [row],
        });
        const collector = (reply as Message).createMessageComponentCollector({
          // @ts-ignore
          time: interaction.options.getNumber('temps') * 60 * 1000,
        });
        collector.on('collect', async (b: ButtonInteraction) => {
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
          return await interaction.channel?.send({
            content: 'Il manque des personnes pour que la partie commence !',
          });
        }
        //=====================SHUFFLE=====================
        shuffle(inscrits);
        //=====================AFFECT-USERS=====================
        for (let i = 0; i < nbVillageois; i++) {
          const user = inscrits[0];
          inscrits.splice(0, 1);
          characters.push(new Character('Villageois', user));
        }
        for (let i = 0; i < nbChasseur; i++) {
          const user = inscrits[0];
          inscrits.splice(0, 1);
          characters.push(new Character('Chasseur', user));
        }
        for (let i = 0; i < nbCupidon; i++) {
          const user = inscrits[0];
          inscrits.splice(0, 1);
          characters.push(new Character('Cupidon', user));
        }
        for (let i = 0; i < nbVoyante; i++) {
          const user = inscrits[0];
          inscrits.splice(0, 1);
          characters.push(new Character('Voyante', user));
        }
        for (let i = 0; i < nbGarde; i++) {
          const user = inscrits[0];
          inscrits.splice(0, 1);
          characters.push(new Character('Garde', user));
        }
        for (let i = 0; i < nbLoupGarou; i++) {
          const user = inscrits[0];
          inscrits.splice(0, 1);
          characters.push(new Character('Loup-Garou', user));
        }
        for (let i = 0; i < nbLoupBlanc; i++) {
          const user = inscrits[0];
          inscrits.splice(0, 1);
          characters.push(new Character('Loup-Blanc', user));
        }
        for (let i = 0; i < nbSorcière; i++) {
          const user = inscrits[0];
          inscrits.splice(0, 1);
          characters.push(new Character('Sorcière', user));
        }
        // =====================START GAME====================
        let end: string | false | number = false;

        const game = new Game(this.client, characters, interaction.guild!, (interaction.channel as TextChannel)!.parentId!);
        await game.startGame();
        await game.sendRolesToUsers();
        while (!end) {
          end = await game.turn();
          if (end) game.end();
        }
      }
    });
  }
}
