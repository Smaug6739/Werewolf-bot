import { Character } from './_Character';
export class Chasseur extends Character {
  public passed: boolean = false;
  public constructor(discordId: string) {
    super('Chasseur', discordId);
  }
}
