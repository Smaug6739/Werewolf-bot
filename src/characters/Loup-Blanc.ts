import { Character } from './_Character';
export class LoupBlanc extends Character {
  public passed: boolean = false;
  public constructor(discordId: string) {
    super('Loup-Blanc', discordId);
  }
}
