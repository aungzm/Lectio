import { BookFormat, type BookMetadata, type DetailedMetadata, type PersonInfo } from '@/providers';

export const DEMO_TRANSPARENT_COVER =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';

export interface DemoLibraryRecord {
  id: string;
  name: string;
}

export interface DemoBookRecord {
  id: string;
  seriesId: string;
  libraryId: string;
  title: string;
  sortTitle: string;
  number: number;
  pagesTotal: number;
  pagesRead: number;
  format: BookFormat;
  metadata: BookMetadata;
  addedAt: string;
}

export interface DemoSeriesRecord {
  id: string;
  libraryId: string;
  title: string;
  sortTitle: string;
  booksCount: number;
  booksReadCount: number;
  metadata: BookMetadata;
  detailedMetadata: DetailedMetadata;
  bookIds: string[];
  addedAt: string;
  updatedAt: string;
}

export interface DemoCollectionRecord {
  id: string;
  name: string;
  summary: string | null;
  seriesIds: string[];
}

export interface DemoReadListRecord {
  id: string;
  name: string;
  summary: string | null;
  bookIds: string[];
}

function person(name: string): PersonInfo {
  return { id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'), name };
}

type SeriesSeed = {
  id: string;
  libraryId: string;
  title: string;
  summary: string;
  author: string;
  genres: string[];
  tags: string[];
  releaseYear: number;
  publisher: string;
  status?: string;
  ageRating?: number;
  addedAt: string;
  updatedAt: string;
  books: Array<{
    id: string;
    title: string;
    number: number;
    pagesTotal: number;
    pagesRead: number;
    addedAt: string;
    format?: BookFormat;
    summary?: string;
  }>;
};

const libraries: DemoLibraryRecord[] = [
  { id: 'lib-light-novels', name: 'Light Novel Library' },
  { id: 'lib-books', name: 'Book Library' },
];

const seriesSeeds: SeriesSeed[] = [
  {
    id: 'series-alice',
    libraryId: 'lib-light-novels',
    title: 'Alice Dream Cycle',
    summary:
      'Curious girls, talking creatures, chessboard kingdoms, and nonsense adventures make this a playful fantasy shelf that feels surprisingly close to modern whimsical light novels.',
    author: 'Lewis Carroll',
    genres: ['Fantasy', 'Adventure', 'Whimsical'],
    tags: ['Classic', 'Wonderland', 'Dreamlike'],
    releaseYear: 1865,
    publisher: 'Macmillan',
    status: 'ENDED',
    ageRating: 1,
    addedAt: '2026-04-20T09:00:00.000Z',
    updatedAt: '2026-04-20T09:00:00.000Z',
    books: [
      { id: 'book-alice-1', title: "Alice's Adventures in Wonderland", number: 1, pagesTotal: 176, pagesRead: 176, addedAt: '2026-04-20T09:00:00.000Z' },
      { id: 'book-alice-2', title: 'Through the Looking-Glass', number: 2, pagesTotal: 208, pagesRead: 84, addedAt: '2026-04-19T09:00:00.000Z' },
      { id: 'book-alice-3', title: 'Sylvie and Bruno', number: 3, pagesTotal: 244, pagesRead: 0, addedAt: '2026-04-18T09:00:00.000Z' },
      { id: 'book-alice-4', title: 'Sylvie and Bruno Concluded', number: 4, pagesTotal: 268, pagesRead: 0, addedAt: '2026-04-17T09:00:00.000Z' },
    ],
  },
  {
    id: 'series-oz',
    libraryId: 'lib-light-novels',
    title: 'Oz Adventures',
    summary:
      'A fast-moving fantasy journey through strange lands, odd companions, and magical politics, built from the first wave of Oz novels.',
    author: 'L. Frank Baum',
    genres: ['Fantasy', 'Adventure', 'Quest'],
    tags: ['Magic', 'Found Family', 'Portal Fantasy'],
    releaseYear: 1900,
    publisher: 'George M. Hill Company',
    status: 'ENDED',
    ageRating: 1,
    addedAt: '2026-04-21T07:45:00.000Z',
    updatedAt: '2026-04-21T07:45:00.000Z',
    books: [
      { id: 'book-oz-1', title: 'The Wonderful Wizard of Oz', number: 1, pagesTotal: 154, pagesRead: 154, addedAt: '2026-04-21T07:45:00.000Z' },
      { id: 'book-oz-2', title: 'The Marvelous Land of Oz', number: 2, pagesTotal: 202, pagesRead: 202, addedAt: '2026-04-20T07:45:00.000Z' },
      { id: 'book-oz-3', title: 'Ozma of Oz', number: 3, pagesTotal: 198, pagesRead: 31, addedAt: '2026-04-19T07:45:00.000Z' },
      { id: 'book-oz-4', title: 'Dorothy and the Wizard in Oz', number: 4, pagesTotal: 206, pagesRead: 0, addedAt: '2026-04-18T07:45:00.000Z' },
    ],
  },
  {
    id: 'series-anne',
    libraryId: 'lib-light-novels',
    title: 'Anne of Green Gables',
    summary:
      'A character-driven coming-of-age set in Prince Edward Island, full of warmth, humor, friendship, and the kind of comforting momentum readers binge.',
    author: 'L. M. Montgomery',
    genres: ['Coming of Age', 'Drama', 'Slice of Life'],
    tags: ['School Life', 'Found Family', 'Comfort Read'],
    releaseYear: 1908,
    publisher: 'L. C. Page & Company',
    status: 'ENDED',
    ageRating: 1,
    addedAt: '2026-04-17T07:15:00.000Z',
    updatedAt: '2026-04-20T14:00:00.000Z',
    books: [
      { id: 'book-anne-1', title: 'Anne of Green Gables', number: 1, pagesTotal: 320, pagesRead: 320, addedAt: '2026-04-17T07:15:00.000Z' },
      { id: 'book-anne-2', title: 'Anne of Avonlea', number: 2, pagesTotal: 336, pagesRead: 336, addedAt: '2026-04-16T07:15:00.000Z' },
      { id: 'book-anne-3', title: 'Anne of the Island', number: 3, pagesTotal: 292, pagesRead: 118, addedAt: '2026-04-15T07:15:00.000Z' },
      { id: 'book-anne-4', title: 'Rainbow Valley', number: 4, pagesTotal: 284, pagesRead: 0, addedAt: '2026-04-14T07:15:00.000Z' },
    ],
  },
  {
    id: 'series-princess-curdie',
    libraryId: 'lib-light-novels',
    title: 'Princess and Curdie Tales',
    summary:
      'Princesses, goblins, prophecy, and moral fairy-tale stakes give this shelf a strong fantasy arc with cozy and eerie moments mixed together.',
    author: 'George MacDonald',
    genres: ['Fantasy', 'Fairy Tale', 'Adventure'],
    tags: ['Royalty', 'Underground', 'Mythic'],
    releaseYear: 1872,
    publisher: 'Strahan',
    status: 'ENDED',
    ageRating: 1,
    addedAt: '2026-04-16T11:00:00.000Z',
    updatedAt: '2026-04-19T16:30:00.000Z',
    books: [
      { id: 'book-curdie-1', title: 'The Princess and the Goblin', number: 1, pagesTotal: 240, pagesRead: 240, addedAt: '2026-04-16T11:00:00.000Z' },
      { id: 'book-curdie-2', title: 'The Princess and Curdie', number: 2, pagesTotal: 228, pagesRead: 47, addedAt: '2026-04-15T11:00:00.000Z' },
      { id: 'book-curdie-3', title: 'At the Back of the North Wind', number: 3, pagesTotal: 280, pagesRead: 0, addedAt: '2026-04-14T11:00:00.000Z' },
    ],
  },
  {
    id: 'series-burnett',
    libraryId: 'lib-light-novels',
    title: 'Burnett Classics',
    summary:
      'Hopeful children, dramatic reversals, and restorative friendships make these public domain novels perfect demo material for a softer reading lane.',
    author: 'Frances Hodgson Burnett',
    genres: ['Drama', 'Family', 'Historical'],
    tags: ['Healing', 'Character Growth', 'Comfort Read'],
    releaseYear: 1886,
    publisher: 'Charles Scribner’s Sons',
    status: 'ENDED',
    ageRating: 1,
    addedAt: '2026-04-15T13:30:00.000Z',
    updatedAt: '2026-04-20T12:10:00.000Z',
    books: [
      { id: 'book-burnett-1', title: 'Little Lord Fauntleroy', number: 1, pagesTotal: 232, pagesRead: 232, addedAt: '2026-04-15T13:30:00.000Z' },
      { id: 'book-burnett-2', title: 'A Little Princess', number: 2, pagesTotal: 264, pagesRead: 90, addedAt: '2026-04-14T13:30:00.000Z' },
      { id: 'book-burnett-3', title: 'The Secret Garden', number: 3, pagesTotal: 288, pagesRead: 0, addedAt: '2026-04-13T13:30:00.000Z' },
    ],
  },
  {
    id: 'series-austen',
    libraryId: 'lib-books',
    title: 'Austen Essentials',
    summary:
      'A compact shelf of wit, social maneuvering, and romantic tension drawn from Jane Austen’s best-known novels.',
    author: 'Jane Austen',
    genres: ['Romance', 'Drama', 'Social Commentary'],
    tags: ['Regency', 'Marriage Plot', 'Classic'],
    releaseYear: 1811,
    publisher: 'T. Egerton',
    status: 'ENDED',
    ageRating: 1,
    addedAt: '2026-04-21T06:40:00.000Z',
    updatedAt: '2026-04-21T06:40:00.000Z',
    books: [
      { id: 'book-austen-1', title: 'Sense and Sensibility', number: 1, pagesTotal: 368, pagesRead: 368, addedAt: '2026-04-21T06:40:00.000Z' },
      { id: 'book-austen-2', title: 'Pride and Prejudice', number: 2, pagesTotal: 432, pagesRead: 124, addedAt: '2026-04-20T06:40:00.000Z' },
      { id: 'book-austen-3', title: 'Emma', number: 3, pagesTotal: 474, pagesRead: 0, addedAt: '2026-04-19T06:40:00.000Z' },
      { id: 'book-austen-4', title: 'Persuasion', number: 4, pagesTotal: 304, pagesRead: 0, addedAt: '2026-04-18T06:40:00.000Z' },
    ],
  },
  {
    id: 'series-charlotte-bronte',
    libraryId: 'lib-books',
    title: 'Charlotte Bronte Collection',
    summary:
      'Dark interiors, sharp emotional stakes, and intimate narration make this shelf a strong fit for readers who want classic fiction with momentum.',
    author: 'Charlotte Bronte',
    genres: ['Drama', 'Gothic', 'Romance'],
    tags: ['Classic', 'Character Study', 'Victorian'],
    releaseYear: 1847,
    publisher: 'Smith, Elder & Co.',
    status: 'ENDED',
    ageRating: 5,
    addedAt: '2026-04-19T10:25:00.000Z',
    updatedAt: '2026-04-20T18:30:00.000Z',
    books: [
      { id: 'book-bronte-1', title: 'Jane Eyre', number: 1, pagesTotal: 532, pagesRead: 532, addedAt: '2026-04-19T10:25:00.000Z' },
      { id: 'book-bronte-2', title: 'Shirley', number: 2, pagesTotal: 520, pagesRead: 74, addedAt: '2026-04-18T10:25:00.000Z' },
      { id: 'book-bronte-3', title: 'Villette', number: 3, pagesTotal: 496, pagesRead: 0, addedAt: '2026-04-17T10:25:00.000Z' },
      { id: 'book-bronte-4', title: 'The Professor', number: 4, pagesTotal: 320, pagesRead: 0, addedAt: '2026-04-16T10:25:00.000Z' },
    ],
  },
  {
    id: 'series-wells',
    libraryId: 'lib-books',
    title: 'Scientific Romances',
    summary:
      'Short, high-concept speculative fiction packed with time travel, invasion panic, invisibility, and bioethics gone wrong.',
    author: 'H. G. Wells',
    genres: ['Science Fiction', 'Adventure', 'Speculative'],
    tags: ['Classic Sci-Fi', 'Invention', 'Dystopian'],
    releaseYear: 1895,
    publisher: 'William Heinemann',
    status: 'ENDED',
    ageRating: 5,
    addedAt: '2026-04-21T08:15:00.000Z',
    updatedAt: '2026-04-21T08:15:00.000Z',
    books: [
      { id: 'book-wells-1', title: 'The Time Machine', number: 1, pagesTotal: 132, pagesRead: 132, addedAt: '2026-04-21T08:15:00.000Z' },
      { id: 'book-wells-2', title: 'The Invisible Man', number: 2, pagesTotal: 192, pagesRead: 80, addedAt: '2026-04-20T08:15:00.000Z' },
      { id: 'book-wells-3', title: 'The War of the Worlds', number: 3, pagesTotal: 240, pagesRead: 0, addedAt: '2026-04-19T08:15:00.000Z' },
      { id: 'book-wells-4', title: 'The Island of Doctor Moreau', number: 4, pagesTotal: 176, pagesRead: 0, addedAt: '2026-04-18T08:15:00.000Z' },
    ],
  },
  {
    id: 'series-stevenson',
    libraryId: 'lib-books',
    title: 'Stevenson Adventures',
    summary:
      'Treasure hunts, disguises, sea voyages, and dangerous inheritances make this shelf the action lane of the demo library.',
    author: 'Robert Louis Stevenson',
    genres: ['Adventure', 'Historical', 'Thriller'],
    tags: ['Pirates', 'Travel', 'Classic'],
    releaseYear: 1883,
    publisher: 'Cassell & Company',
    status: 'ENDED',
    ageRating: 5,
    addedAt: '2026-04-18T15:05:00.000Z',
    updatedAt: '2026-04-20T16:10:00.000Z',
    books: [
      { id: 'book-stevenson-1', title: 'Treasure Island', number: 1, pagesTotal: 240, pagesRead: 240, addedAt: '2026-04-18T15:05:00.000Z' },
      { id: 'book-stevenson-2', title: 'Kidnapped', number: 2, pagesTotal: 264, pagesRead: 102, addedAt: '2026-04-17T15:05:00.000Z' },
      { id: 'book-stevenson-3', title: 'The Black Arrow', number: 3, pagesTotal: 298, pagesRead: 0, addedAt: '2026-04-16T15:05:00.000Z' },
      { id: 'book-stevenson-4', title: 'Strange Case of Dr. Jekyll and Mr. Hyde', number: 4, pagesTotal: 144, pagesRead: 0, addedAt: '2026-04-15T15:05:00.000Z' },
    ],
  },
  {
    id: 'series-holmes',
    libraryId: 'lib-books',
    title: 'Sherlock Holmes Cases',
    summary:
      'Mysteries, deductions, and clean episodic momentum make Holmes a great demo shelf for browsing, collections, and reading lists.',
    author: 'Arthur Conan Doyle',
    genres: ['Mystery', 'Detective', 'Adventure'],
    tags: ['Classic', 'Detective', 'Case Files'],
    releaseYear: 1887,
    publisher: 'Ward Lock & Co.',
    status: 'ENDED',
    ageRating: 5,
    addedAt: '2026-04-20T17:20:00.000Z',
    updatedAt: '2026-04-21T05:30:00.000Z',
    books: [
      { id: 'book-holmes-1', title: 'A Study in Scarlet', number: 1, pagesTotal: 180, pagesRead: 180, addedAt: '2026-04-20T17:20:00.000Z' },
      { id: 'book-holmes-2', title: 'The Sign of the Four', number: 2, pagesTotal: 172, pagesRead: 64, addedAt: '2026-04-19T17:20:00.000Z' },
      { id: 'book-holmes-3', title: 'The Adventures of Sherlock Holmes', number: 3, pagesTotal: 324, pagesRead: 0, addedAt: '2026-04-18T17:20:00.000Z' },
      { id: 'book-holmes-4', title: 'The Hound of the Baskervilles', number: 4, pagesTotal: 256, pagesRead: 0, addedAt: '2026-04-17T17:20:00.000Z' },
    ],
  },
];

export const demoCollections: DemoCollectionRecord[] = [
  {
    id: 'collection-comfort',
    name: 'Comfort Reads',
    summary: 'Warm, character-driven classics that make the demo library feel lived in and approachable.',
    seriesIds: ['series-anne', 'series-burnett', 'series-austen'],
  },
  {
    id: 'collection-adventure',
    name: 'Adventure Cabinet',
    summary: 'A mix of fantasy, mystery, and expedition-heavy shelves for showing off broader browsing.',
    seriesIds: ['series-oz', 'series-wells', 'series-stevenson', 'series-holmes'],
  },
];

export const demoReadLists: DemoReadListRecord[] = [
  {
    id: 'readlist-weekend-sampler',
    name: 'Weekend Sampler',
    summary: 'A short cross-library read list that touches fantasy, mystery, science fiction, and comfort fiction.',
    bookIds: ['book-oz-1', 'book-anne-1', 'book-austen-2', 'book-wells-1', 'book-holmes-1'],
  },
];

function buildSeriesRecord(seed: SeriesSeed): DemoSeriesRecord {
  const writers = [person(seed.author)];
  const detailedMetadata: DetailedMetadata = {
    summary: seed.summary,
    writers,
    pencillers: [],
    inkers: [],
    colorists: [],
    letterers: [],
    coverArtists: [],
    editors: [],
    publishers: [person(seed.publisher)],
    translators: [],
    characters: [],
    genres: seed.genres,
    tags: seed.tags,
    language: 'en',
    releaseYear: seed.releaseYear,
    ageRating: seed.ageRating ?? 1,
    seriesStatus: seed.status ?? 'ENDED',
  };

  const metadata: BookMetadata = {
    summary: seed.summary,
    authors: [seed.author],
    genres: seed.genres,
    tags: seed.tags,
    language: 'en',
    year: seed.releaseYear,
  };

  return {
    id: seed.id,
    libraryId: seed.libraryId,
    title: seed.title,
    sortTitle: seed.title,
    booksCount: seed.books.length,
    booksReadCount: seed.books.filter((book) => book.pagesRead >= book.pagesTotal && book.pagesTotal > 0).length,
    metadata,
    detailedMetadata,
    bookIds: seed.books.map((book) => book.id),
    addedAt: seed.addedAt,
    updatedAt: seed.updatedAt,
  };
}

function buildBookRecords(seed: SeriesSeed): DemoBookRecord[] {
  return seed.books.map((book) => ({
    id: book.id,
    seriesId: seed.id,
    libraryId: seed.libraryId,
    title: book.title,
    sortTitle: `${seed.title} ${String(book.number).padStart(2, '0')}`,
    number: book.number,
    pagesTotal: book.pagesTotal,
    pagesRead: book.pagesRead,
    format: book.format ?? BookFormat.Epub,
    addedAt: book.addedAt,
    metadata: {
      summary: book.summary ?? `${book.title} is part of the ${seed.title} demo shelf.`,
      authors: [seed.author],
      genres: seed.genres,
      tags: seed.tags,
      language: 'en',
      year: seed.releaseYear,
    },
  }));
}

export const demoLibraries = libraries;
export const demoSeries = seriesSeeds.map(buildSeriesRecord);
export const demoBooks = seriesSeeds.flatMap(buildBookRecords);
