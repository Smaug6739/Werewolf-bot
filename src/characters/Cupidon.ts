import { Character } from './_Character';
export class Cupidon extends Character {
  public passed: boolean = false;
  public constructor(discordId: string) {
    super('Cupidon', discordId);
  }
}
