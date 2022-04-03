import { Character } from './_Character';
export class Garde extends Character {
  public passed: boolean = false;
  public constructor(discordId: string) {
    super('Garde', discordId);
  }
}
