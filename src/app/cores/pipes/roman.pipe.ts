import { Pipe, PipeTransform } from '@angular/core';
import { EpisodeEnum } from '../models/enums'; // Pfad anpassen

/**
 * RomanPipe
 * Maps a numeric Star Wars episode (1..7) to its Roman numeral using EpisodeEnum.
 * Falls back to the input number as a string if no match exists.
 */
@Pipe({ name: 'roman', standalone: true, pure: true })
export class RomanPipe implements PipeTransform {
  // Transform numeric episode_id to Roman numeral (e.g., 4 → "IV")
  transform(n: number): string {
    return EpisodeEnum[n] ?? String(n);
  }
}
