export { KavitaProvider } from './kavita';
export { kavitaLogin, kavitaValidateToken } from './kavita/client';
export { KomgaProvider } from './komga';
export { komgaLogin, komgaValidateToken } from './komga/client';
export type {
  ILibraryProvider,
  Library,
  Book,
  BookMetadata,
  PersonInfo,
  DetailedMetadata,
  Volume,
  Chapter,
  ReadingProgress,
  AuthResult,
  Author,
  Collection,
  ReadList,
  Bookmark,
} from './base/ILibraryProvider';
export { BookFormat } from './base/ILibraryProvider';
