import { Character } from './_Character';
export class Sorciere extends Character {
  public passed: boolean = false;
  public save = false;
  public kill = false;
  public constructor(discordId: string) {
    super('Sorcière', discordId);
  }
}
