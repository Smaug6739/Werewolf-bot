import { Character } from './_Character';
export class LoupGarou extends Character {
  public passed: boolean = false;
  public constructor(discordId: string) {
    super('Loup-Garou', discordId);
  }
}
