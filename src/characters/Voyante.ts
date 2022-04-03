import { Character } from './_Character';
export class Voyante extends Character {
  public passed: boolean = false;
  public constructor(discordId: string) {
    super('Voyante', discordId);
  }
}
