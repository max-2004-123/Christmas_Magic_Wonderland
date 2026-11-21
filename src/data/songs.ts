// All compositions are Public Domain traditional Christmas carols arranged for
// procedural Web Audio synthesis (celesta / music box / warm felt piano / sleigh bells).

export interface MelodyNote {
  /** MIDI note number (e.g., 60 = C4, 69 = A4). Null = rest */
  midi: number | null;
  /** Duration in beats */
  beats: number;
  /** Optional chord MIDI notes played gently on attack */
  chord?: number[];
  /** Relative note velocity (0..1) */
  vel?: number;
  /** Optional gentle sleigh bell shimmer */
  bell?: boolean;
}

export interface ChristmasSong {
  id: string;
  title: string;
  englishTitle: string;
  composer: string;
  style: string;
  instrument: 'musicbox' | 'piano' | 'celesta';
  bpm: number;
  notes: MelodyNote[];
}

export const CHRISTMAS_SONGS: ChristmasSong[] = [
  {
    id: 'silent-night',
    title: '平安夜',
    englishTitle: 'Silent Night',
    composer: 'Franz Xaver Gruber (1818 · Public Domain)',
    style: '夢幻八音盒 · 輕柔鋼琴',
    instrument: 'musicbox',
    bpm: 84,
    notes: [
      // "Silent night, holy night" (Key of C major, 3/4)
      { midi: 67, beats: 1.5, chord: [48, 55, 60], vel: 0.78 },
      { midi: 69, beats: 0.5, vel: 0.68 },
      { midi: 67, beats: 1.0, vel: 0.72 },
      { midi: 64, beats: 3.0, chord: [48, 55, 60], vel: 0.75, bell: true },

      { midi: 67, beats: 1.5, chord: [48, 55, 60], vel: 0.78 },
      { midi: 69, beats: 0.5, vel: 0.68 },
      { midi: 67, beats: 1.0, vel: 0.72 },
      { midi: 64, beats: 3.0, chord: [48, 55, 60], vel: 0.75 },

      // "All is calm, all is bright"
      { midi: 74, beats: 2.0, chord: [50, 55, 59], vel: 0.82, bell: true },
      { midi: 74, beats: 1.0, vel: 0.74 },
      { midi: 71, beats: 3.0, chord: [47, 55, 59], vel: 0.78 },

      { midi: 72, beats: 2.0, chord: [48, 55, 60], vel: 0.82 },
      { midi: 72, beats: 1.0, vel: 0.74 },
      { midi: 67, beats: 3.0, chord: [48, 52, 60], vel: 0.76, bell: true },

      // "Round yon virgin, mother and child"
      { midi: 69, beats: 2.0, chord: [53, 57, 60], vel: 0.8 },
      { midi: 69, beats: 1.0, vel: 0.74 },
      { midi: 72, beats: 1.5, chord: [53, 57, 60], vel: 0.84 },
      { midi: 71, beats: 0.5, vel: 0.72 },
      { midi: 69, beats: 1.0, vel: 0.75 },
      { midi: 67, beats: 1.5, chord: [48, 55, 60], vel: 0.78 },
      { midi: 69, beats: 0.5, vel: 0.7 },
      { midi: 67, beats: 1.0, vel: 0.74 },
      { midi: 64, beats: 3.0, chord: [48, 55, 60], vel: 0.75, bell: true },

      // "Holy infant so tender and mild"
      { midi: 69, beats: 2.0, chord: [53, 57, 60], vel: 0.8 },
      { midi: 69, beats: 1.0, vel: 0.74 },
      { midi: 72, beats: 1.5, chord: [53, 57, 60], vel: 0.84 },
      { midi: 71, beats: 0.5, vel: 0.72 },
      { midi: 69, beats: 1.0, vel: 0.75 },
      { midi: 67, beats: 1.5, chord: [48, 55, 60], vel: 0.78 },
      { midi: 69, beats: 0.5, vel: 0.7 },
      { midi: 67, beats: 1.0, vel: 0.74 },
      { midi: 64, beats: 3.0, chord: [48, 55, 60], vel: 0.75 },

      // "Sleep in heavenly peace"
      { midi: 74, beats: 2.0, chord: [50, 55, 59], vel: 0.85, bell: true },
      { midi: 74, beats: 1.0, vel: 0.76 },
      { midi: 77, beats: 1.5, chord: [50, 55, 59], vel: 0.88 },
      { midi: 74, beats: 0.5, vel: 0.76 },
      { midi: 71, beats: 1.0, vel: 0.78 },
      { midi: 72, beats: 3.0, chord: [48, 55, 60], vel: 0.84, bell: true },
      { midi: 76, beats: 3.0, chord: [48, 52, 60], vel: 0.8 },

      // "Sleep in heavenly peace"
      { midi: 72, beats: 1.5, chord: [48, 55, 60], vel: 0.76 },
      { midi: 67, beats: 0.5, vel: 0.68 },
      { midi: 64, beats: 1.0, vel: 0.7 },
      { midi: 67, beats: 1.5, chord: [47, 53, 55], vel: 0.74 },
      { midi: 65, beats: 0.5, vel: 0.68 },
      { midi: 62, beats: 1.0, vel: 0.7 },
      { midi: 60, beats: 5.0, chord: [48, 52, 55, 60], vel: 0.76, bell: true },
      { midi: null, beats: 1.0 },
    ],
  },
  {
    id: 'jingle-bells',
    title: '鈴兒響叮噹',
    englishTitle: 'Jingle Bells',
    composer: 'James Lord Pierpont (1857 · Public Domain)',
    style: '清脆聖誕鈴 · 鋼片琴',
    instrument: 'celesta',
    bpm: 132,
    notes: [
      // Chorus: "Jingle bells, jingle bells, jingle all the way" (Key of G major -> C major for sweet range)
      { midi: 64, beats: 1, chord: [48, 55, 60], vel: 0.82, bell: true },
      { midi: 64, beats: 1, vel: 0.76 },
      { midi: 64, beats: 2, vel: 0.82, bell: true },

      { midi: 64, beats: 1, chord: [48, 55, 60], vel: 0.82, bell: true },
      { midi: 64, beats: 1, vel: 0.76 },
      { midi: 64, beats: 2, vel: 0.82, bell: true },

      { midi: 64, beats: 1, chord: [48, 52, 60], vel: 0.84, bell: true },
      { midi: 67, beats: 1, vel: 0.82 },
      { midi: 60, beats: 1.5, vel: 0.82, bell: true },
      { midi: 62, beats: 0.5, vel: 0.74 },
      { midi: 64, beats: 4, chord: [48, 55, 60], vel: 0.86, bell: true },

      // "Oh what fun it is to ride in a one-horse open sleigh"
      { midi: 65, beats: 1, chord: [53, 57, 60], vel: 0.82, bell: true },
      { midi: 65, beats: 1, vel: 0.78 },
      { midi: 65, beats: 1.5, vel: 0.82, bell: true },
      { midi: 65, beats: 0.5, vel: 0.74 },

      { midi: 65, beats: 1, chord: [48, 55, 60], vel: 0.8, bell: true },
      { midi: 64, beats: 1, vel: 0.78 },
      { midi: 64, beats: 1, vel: 0.78, bell: true },
      { midi: 64, beats: 0.5, vel: 0.72 },
      { midi: 64, beats: 0.5, vel: 0.72 },

      { midi: 64, beats: 1, chord: [50, 54, 57], vel: 0.8, bell: true },
      { midi: 62, beats: 1, vel: 0.76 },
      { midi: 62, beats: 1, vel: 0.78, bell: true },
      { midi: 64, beats: 1, vel: 0.8 },
      { midi: 62, beats: 2, chord: [47, 50, 55], vel: 0.82, bell: true },
      { midi: 67, beats: 2, chord: [47, 55, 59], vel: 0.86, bell: true },

      // Second half of chorus
      { midi: 64, beats: 1, chord: [48, 55, 60], vel: 0.84, bell: true },
      { midi: 64, beats: 1, vel: 0.76 },
      { midi: 64, beats: 2, vel: 0.84, bell: true },

      { midi: 64, beats: 1, chord: [48, 55, 60], vel: 0.84, bell: true },
      { midi: 64, beats: 1, vel: 0.76 },
      { midi: 64, beats: 2, vel: 0.84, bell: true },

      { midi: 64, beats: 1, chord: [48, 52, 60], vel: 0.84, bell: true },
      { midi: 67, beats: 1, vel: 0.84 },
      { midi: 60, beats: 1.5, vel: 0.82, bell: true },
      { midi: 62, beats: 0.5, vel: 0.74 },
      { midi: 64, beats: 4, chord: [48, 55, 60], vel: 0.88, bell: true },

      { midi: 65, beats: 1, chord: [53, 57, 60], vel: 0.84, bell: true },
      { midi: 65, beats: 1, vel: 0.78 },
      { midi: 65, beats: 1.5, vel: 0.84, bell: true },
      { midi: 65, beats: 0.5, vel: 0.74 },

      { midi: 65, beats: 1, chord: [48, 55, 60], vel: 0.82, bell: true },
      { midi: 64, beats: 1, vel: 0.78 },
      { midi: 64, beats: 1, vel: 0.78, bell: true },
      { midi: 64, beats: 0.5, vel: 0.72 },
      { midi: 64, beats: 0.5, vel: 0.72 },

      { midi: 67, beats: 1, chord: [47, 53, 55], vel: 0.86, bell: true },
      { midi: 67, beats: 1, vel: 0.82 },
      { midi: 65, beats: 1, vel: 0.8, bell: true },
      { midi: 62, beats: 1, vel: 0.78 },
      { midi: 60, beats: 3.5, chord: [48, 52, 55, 60], vel: 0.88, bell: true },
      { midi: null, beats: 0.5 },
    ],
  },
  {
    id: 'we-wish-you',
    title: '祝你聖誕快樂',
    englishTitle: 'We Wish You a Merry Christmas',
    composer: 'Traditional English Carol (Public Domain)',
    style: '溫暖鋼琴 · 金色鈴鐺',
    instrument: 'piano',
    bpm: 122,
    notes: [
      // Pickup + "We wish you a Merry Christmas" (Key of G -> F/C bright)
      { midi: 62, beats: 1, vel: 0.74 },
      { midi: 67, beats: 1, chord: [43, 50, 55], vel: 0.82, bell: true },
      { midi: 67, beats: 0.5, vel: 0.76 },
      { midi: 69, beats: 0.5, vel: 0.76 },
      { midi: 67, beats: 0.5, vel: 0.76 },
      { midi: 66, beats: 0.5, vel: 0.74 },

      { midi: 64, beats: 1, chord: [48, 52, 55], vel: 0.8, bell: true },
      { midi: 64, beats: 1, vel: 0.76 },
      { midi: 64, beats: 1, vel: 0.78 },

      // "We wish you a Merry Christmas"
      { midi: 69, beats: 1, chord: [45, 52, 57], vel: 0.82, bell: true },
      { midi: 69, beats: 0.5, vel: 0.76 },
      { midi: 71, beats: 0.5, vel: 0.78 },
      { midi: 69, beats: 0.5, vel: 0.76 },
      { midi: 67, beats: 0.5, vel: 0.74 },

      { midi: 66, beats: 1, chord: [50, 54, 57], vel: 0.8, bell: true },
      { midi: 62, beats: 1, vel: 0.75 },
      { midi: 62, beats: 1, vel: 0.76 },

      // "We wish you a Merry Christmas"
      { midi: 71, beats: 1, chord: [47, 54, 59], vel: 0.84, bell: true },
      { midi: 71, beats: 0.5, vel: 0.78 },
      { midi: 72, beats: 0.5, vel: 0.8 },
      { midi: 71, beats: 0.5, vel: 0.78 },
      { midi: 69, beats: 0.5, vel: 0.76 },

      { midi: 67, beats: 1, chord: [48, 52, 55], vel: 0.82, bell: true },
      { midi: 64, beats: 1, vel: 0.76 },
      { midi: 62, beats: 0.5, vel: 0.72 },
      { midi: 62, beats: 0.5, vel: 0.72 },

      // "And a Happy New Year!"
      { midi: 64, beats: 1, chord: [48, 52, 55], vel: 0.8, bell: true },
      { midi: 69, beats: 1, chord: [50, 54, 57], vel: 0.82 },
      { midi: 66, beats: 1, vel: 0.8 },
      { midi: 67, beats: 2.5, chord: [43, 47, 50, 55], vel: 0.86, bell: true },

      // "Good tidings we bring to you and your kin"
      { midi: 62, beats: 0.5, vel: 0.74 },
      { midi: 67, beats: 1, chord: [43, 50, 55], vel: 0.82 },
      { midi: 67, beats: 1, vel: 0.78 },
      { midi: 67, beats: 1, vel: 0.78 },
      { midi: 66, beats: 2, chord: [50, 54, 57], vel: 0.8, bell: true },

      { midi: 66, beats: 1, vel: 0.76 },
      { midi: 67, beats: 1, chord: [48, 52, 55], vel: 0.82 },
      { midi: 66, beats: 1, vel: 0.78 },
      { midi: 64, beats: 1, vel: 0.78 },
      { midi: 62, beats: 2, chord: [50, 54, 57], vel: 0.8, bell: true },

      // "Good tidings for Christmas and a Happy New Year!"
      { midi: 69, beats: 1, vel: 0.8 },
      { midi: 71, beats: 1, chord: [43, 50, 55], vel: 0.84, bell: true },
      { midi: 69, beats: 1, vel: 0.8 },
      { midi: 67, beats: 1, vel: 0.8 },
      { midi: 74, beats: 1, chord: [50, 54, 57], vel: 0.86, bell: true },
      { midi: 62, beats: 1, vel: 0.76 },
      { midi: 62, beats: 0.5, vel: 0.72 },
      { midi: 62, beats: 0.5, vel: 0.72 },

      { midi: 64, beats: 1, chord: [48, 52, 55], vel: 0.82, bell: true },
      { midi: 69, beats: 1, chord: [50, 54, 57], vel: 0.84 },
      { midi: 66, beats: 1, vel: 0.8 },
      { midi: 67, beats: 3.5, chord: [43, 47, 50, 55], vel: 0.86, bell: true },
      { midi: null, beats: 0.5 },
    ],
  },
  {
    id: 'o-christmas-tree',
    title: '聖誕樹之歌',
    englishTitle: 'O Christmas Tree (O Tannenbaum)',
    composer: 'Traditional German Folk Carol (Public Domain)',
    style: '浪漫八音盒 · 圓舞曲',
    instrument: 'musicbox',
    bpm: 96,
    notes: [
      // Key of F major -> C major sweet register
      { midi: 60, beats: 1, vel: 0.72 },
      { midi: 65, beats: 0.75, chord: [53, 57, 60], vel: 0.8, bell: true },
      { midi: 65, beats: 0.25, vel: 0.72 },
      { midi: 65, beats: 1, vel: 0.78 },
      { midi: 67, beats: 1, vel: 0.8 },

      { midi: 69, beats: 0.75, chord: [53, 57, 60], vel: 0.82 },
      { midi: 69, beats: 0.25, vel: 0.74 },
      { midi: 69, beats: 1.5, vel: 0.82, bell: true },
      { midi: 69, beats: 0.5, vel: 0.74 },

      { midi: 67, beats: 0.5, chord: [55, 58, 62], vel: 0.78 },
      { midi: 69, beats: 0.5, vel: 0.8 },
      { midi: 70, beats: 1, vel: 0.82 },
      { midi: 64, beats: 1, chord: [48, 55, 58], vel: 0.78 },
      { midi: 67, beats: 1, vel: 0.8 },
      { midi: 65, beats: 2, chord: [53, 57, 60], vel: 0.82, bell: true },

      // Repeat phrase
      { midi: 60, beats: 1, vel: 0.72 },
      { midi: 65, beats: 0.75, chord: [53, 57, 60], vel: 0.8 },
      { midi: 65, beats: 0.25, vel: 0.72 },
      { midi: 65, beats: 1, vel: 0.78 },
      { midi: 67, beats: 1, vel: 0.8 },

      { midi: 69, beats: 0.75, chord: [53, 57, 60], vel: 0.82, bell: true },
      { midi: 69, beats: 0.25, vel: 0.74 },
      { midi: 69, beats: 1.5, vel: 0.82 },
      { midi: 69, beats: 0.5, vel: 0.74 },

      { midi: 67, beats: 0.5, chord: [55, 58, 62], vel: 0.78 },
      { midi: 69, beats: 0.5, vel: 0.8 },
      { midi: 70, beats: 1, vel: 0.82 },
      { midi: 64, beats: 1, chord: [48, 55, 58], vel: 0.78 },
      { midi: 67, beats: 1, vel: 0.8 },
      { midi: 65, beats: 2, chord: [53, 57, 60], vel: 0.82, bell: true },

      // Bridge: "Not only green when summer's here..."
      { midi: 72, beats: 0.5, vel: 0.8 },
      { midi: 72, beats: 0.5, vel: 0.78 },
      { midi: 69, beats: 0.5, chord: [53, 57, 60], vel: 0.82 },
      { midi: 74, beats: 1.5, chord: [58, 62, 65], vel: 0.86, bell: true },
      { midi: 72, beats: 0.5, vel: 0.8 },
      { midi: 72, beats: 0.5, vel: 0.78 },
      { midi: 70, beats: 0.5, chord: [55, 58, 62], vel: 0.8 },
      { midi: 70, beats: 1.5, vel: 0.82 },

      { midi: 70, beats: 0.5, vel: 0.78 },
      { midi: 70, beats: 0.5, vel: 0.76 },
      { midi: 67, beats: 0.5, chord: [48, 55, 58], vel: 0.8 },
      { midi: 72, beats: 1.5, vel: 0.84, bell: true },
      { midi: 70, beats: 0.5, vel: 0.78 },
      { midi: 70, beats: 0.5, vel: 0.76 },
      { midi: 69, beats: 0.5, chord: [53, 57, 60], vel: 0.8 },
      { midi: 69, beats: 1.5, vel: 0.82 },

      // Closing phrase
      { midi: 60, beats: 1, vel: 0.72 },
      { midi: 65, beats: 0.75, chord: [53, 57, 60], vel: 0.8, bell: true },
      { midi: 65, beats: 0.25, vel: 0.74 },
      { midi: 65, beats: 1, vel: 0.78 },
      { midi: 67, beats: 1, vel: 0.8 },

      { midi: 69, beats: 0.75, chord: [53, 57, 60], vel: 0.82 },
      { midi: 69, beats: 0.25, vel: 0.74 },
      { midi: 69, beats: 1.5, vel: 0.82 },
      { midi: 69, beats: 0.5, vel: 0.74 },

      { midi: 67, beats: 0.5, chord: [55, 58, 62], vel: 0.78 },
      { midi: 69, beats: 0.5, vel: 0.8 },
      { midi: 70, beats: 1, vel: 0.82 },
      { midi: 64, beats: 1, chord: [48, 55, 58], vel: 0.78 },
      { midi: 67, beats: 1, vel: 0.8 },
      { midi: 65, beats: 3.5, chord: [53, 57, 60, 65], vel: 0.84, bell: true },
      { midi: null, beats: 0.5 },
    ],
  },
  {
    id: 'deck-the-halls',
    title: '裝飾大廳',
    englishTitle: 'Deck the Halls',
    composer: 'Traditional Welsh Melody (Public Domain)',
    style: '歡快冬夜 · 星光鋼片琴',
    instrument: 'celesta',
    bpm: 126,
    notes: [
      // Key of C major, 4/4
      { midi: 67, beats: 1.5, chord: [48, 55, 60], vel: 0.82, bell: true },
      { midi: 65, beats: 0.5, vel: 0.74 },
      { midi: 64, beats: 1, vel: 0.78 },
      { midi: 62, beats: 1, vel: 0.76 },

      { midi: 60, beats: 1, chord: [48, 52, 55], vel: 0.8, bell: true },
      { midi: 62, beats: 1, vel: 0.76 },
      { midi: 64, beats: 1, vel: 0.78 },
      { midi: 60, beats: 1, vel: 0.76 },

      { midi: 62, beats: 0.5, chord: [50, 55, 59], vel: 0.78 },
      { midi: 64, beats: 0.5, vel: 0.78 },
      { midi: 65, beats: 0.5, vel: 0.8 },
      { midi: 62, beats: 0.5, vel: 0.76 },
      { midi: 64, beats: 1.5, chord: [48, 55, 60], vel: 0.82, bell: true },
      { midi: 62, beats: 0.5, vel: 0.74 },

      { midi: 60, beats: 1, chord: [47, 50, 55], vel: 0.78 },
      { midi: 59, beats: 1, vel: 0.76 },
      { midi: 60, beats: 2, chord: [48, 52, 55], vel: 0.84, bell: true },

      // Bridge: "Don we now our gay apparel"
      { midi: 62, beats: 1.5, chord: [50, 55, 59], vel: 0.8, bell: true },
      { midi: 64, beats: 0.5, vel: 0.76 },
      { midi: 65, beats: 1, vel: 0.8 },
      { midi: 62, beats: 1, vel: 0.76 },

      { midi: 64, beats: 1.5, chord: [48, 55, 60], vel: 0.82, bell: true },
      { midi: 65, beats: 0.5, vel: 0.78 },
      { midi: 67, beats: 1, vel: 0.82 },
      { midi: 62, beats: 1, vel: 0.76 },

      { midi: 64, beats: 0.5, chord: [45, 52, 57], vel: 0.8 },
      { midi: 66, beats: 0.5, vel: 0.8 },
      { midi: 67, beats: 1, chord: [43, 50, 55], vel: 0.84, bell: true },
      { midi: 69, beats: 0.5, vel: 0.82 },
      { midi: 71, beats: 0.5, vel: 0.84 },
      { midi: 72, beats: 1, chord: [48, 55, 60], vel: 0.86 },

      { midi: 71, beats: 1, chord: [43, 50, 55], vel: 0.82 },
      { midi: 69, beats: 1, vel: 0.8 },
      { midi: 67, beats: 2, chord: [43, 47, 50, 55], vel: 0.84, bell: true },

      // Finale
      { midi: 67, beats: 1.5, chord: [48, 55, 60], vel: 0.84, bell: true },
      { midi: 65, beats: 0.5, vel: 0.76 },
      { midi: 64, beats: 1, vel: 0.8 },
      { midi: 62, beats: 1, vel: 0.78 },

      { midi: 60, beats: 1, chord: [48, 52, 55], vel: 0.82, bell: true },
      { midi: 62, beats: 1, vel: 0.78 },
      { midi: 64, beats: 1, vel: 0.8 },
      { midi: 60, beats: 1, vel: 0.78 },

      { midi: 69, beats: 0.5, chord: [53, 57, 60], vel: 0.84 },
      { midi: 69, beats: 0.5, vel: 0.82 },
      { midi: 69, beats: 0.5, vel: 0.84 },
      { midi: 69, beats: 0.5, vel: 0.82 },
      { midi: 67, beats: 1.5, chord: [48, 55, 60], vel: 0.86, bell: true },
      { midi: 65, beats: 0.5, vel: 0.78 },

      { midi: 64, beats: 1, chord: [47, 50, 55], vel: 0.82 },
      { midi: 62, beats: 1, vel: 0.8 },
      { midi: 60, beats: 3.5, chord: [48, 52, 55, 60], vel: 0.88, bell: true },
      { midi: null, beats: 0.5 },
    ],
  },
];
