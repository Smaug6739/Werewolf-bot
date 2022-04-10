import { Character } from '../characters/_Character';

export function changeImmuneAtEndOfDay(characters: Character[]) {
  for (const ch of characters) {
    if (ch.immuneLast) ch.immuneLast = false;
    if (ch.immune) {
      ch.immune = false;
      ch.immuneLast = true;
    }
  }
  return characters;
}
