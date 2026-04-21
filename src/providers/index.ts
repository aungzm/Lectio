export { KomgaProvider } from './komga';
export { DemoProvider } from './demo/DemoProvider';
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
  FilterType,
  FilterCriterion,
  SearchFilters,
  PagedResult,
  FilterOptions,
} from './base/ILibraryProvider';
export { BookFormat } from './base/ILibraryProvider';
