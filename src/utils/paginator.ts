import { Paginator } from 'array-paginator';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageComponentInteraction } from 'discord.js';
import { EventEmitter } from 'node:events';
import type { Message, ButtonInteraction, TextChannel } from 'discord.js';

export class EmbedPaginator extends EventEmitter {
  channel: TextChannel;
  pager: Paginator<any>;
  summoner: string;
  data: any = [];
  // emojis: IObject
  message: Message | null;
  constructor(channel: TextChannel, pages: any[] = [], summoner: string) {
    super();
    this.channel = channel;
    this.pager = new Paginator(pages, 1);
    this.summoner = summoner;
    this.message = null;

    this.init();
  }
  async init() {
    if (this.pager.total < 2) throw new Error('A Pagination Embed must contain at least 2 pages');
    const page: any = this.pager.first()![0];
    console.log(page);

    this.message = await this.channel.send({
      embeds: page!.embeds,
      // @ts-ignore
      components: [...page.components, this.getComponents()],
    });
    this.listenButtons();
  }
  getComponents() {
    const row = new ActionRowBuilder();

    row.addComponents(
      new ButtonBuilder()
        .setLabel('Précédent')
        .setCustomId('previous')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(this.pager.hasPrevious() ? false : true)
    );
    row.addComponents(
      new ButtonBuilder()
        .setLabel('Suivant')
        .setCustomId('next')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(this.pager.hasNext() ? false : true)
    );
    row.addComponents(
      new ButtonBuilder()
        .setLabel('Terminer')
        .setCustomId('end')
        .setStyle(ButtonStyle.Success)
        .setDisabled(this.pager.hasNext() ? false : true)
    );

    return row;
  }
  listenButtons() {
    const filter = (i: MessageComponentInteraction) => i.message.id === this.message!.id && i.user.id === this.summoner;
    const collector = this.channel.createMessageComponentCollector({
      filter: filter,
    });
    collector.on('collect', async (i: MessageComponentInteraction) => {
      if (i.isButton())
        switch (i.customId) {
          case 'previous':
            if (this.pager.hasPrevious()) await this.changePage(this.pager.previous()![0], i);
            break;
          case 'next':
            if (this.pager.hasNext()) await this.changePage(this.pager.next()![0], i);
            break;
          case 'end':
            await this.message?.delete();
            await this.emit('end', this.data);
            break;
        }
      if (i.isSelectMenu()) {
        this.data.push({ name: i.customId.split('-')[1], value: i.values[0] });
        i.reply({ content: 'Votre réponse a été enregistrée', ephemeral: true });
      }
    });
  }
  async changePage(page: any, interaction: ButtonInteraction) {
    await interaction.update({
      embeds: page.embeds,
      // @ts-ignore
      components: [...page.components, this.getComponents()],
    });
  }
}
