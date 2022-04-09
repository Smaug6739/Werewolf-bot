import { characters } from '../utils/characters';
export class Character {
  public discordId: string;
  public name: string;
  public description: string;
  public shortDescription: string;
  public order: number;
  public image: string;
  public team: string;
  public mayor: boolean = false;
  public passed: boolean = false;
  public eliminated = false;
  public immune: boolean = false;
  //public abstract run(game: Game): Promise<any>;
  public constructor(name: string, discordId: string) {
    const character = characters.find((character: any) => character.name === name);
    if (!character) throw new Error(`Character ${name} not found`);
    this.discordId = discordId;

    this.name = character.name;
    this.description = character.description;
    this.shortDescription = character.shortDescription;
    this.order = character.order;
    this.image = character.image;
    this.team = character.team;
  }
}
