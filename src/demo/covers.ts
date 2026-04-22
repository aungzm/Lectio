import { Image } from 'react-native';
import { DEMO_TRANSPARENT_COVER } from './demoData';

type DemoAssetModule = number;

export const DEMO_SERIES_COVER_FILES: Record<string, string> = {
  'series-alice': 'book-alice-1.webp',
  'series-oz': 'book-oz-1.webp',
  'series-anne': 'book-anne-1.webp',
  'series-princess-curdie': 'book-curdie-1.webp',
  'series-burnett': 'book-burnett-1.webp',
  'series-austen': 'book-austen-1.webp',
  'series-charlotte-bronte': 'book-charlotte-1.webp',
  'series-wells': 'book-scientific-1.webp',
  'series-stevenson': 'book-stevenson-1.webp',
  'series-holmes': 'book-sherlock-1.webp',
};

export const DEMO_BOOK_COVER_FILES: Record<string, string> = {
  'book-alice-1': 'book-alice-1.webp',
  'book-alice-2': 'book-alice-2.webp',
  'book-alice-3': 'book-alice-3.webp',
  'book-alice-4': 'book-alice-4.webp',
  'book-oz-1': 'book-oz-1.webp',
  'book-oz-2': 'book-oz-2.webp',
  'book-oz-3': 'book-oz-3.webp',
  'book-oz-4': 'book-oz-4.webp',
  'book-anne-1': 'book-anne-1.webp',
  'book-anne-2': 'book-anne-2.webp',
  'book-anne-3': 'book-anne-3.webp',
  'book-anne-4': 'book-anne-4.webp',
  'book-curdie-1': 'book-curdie-1.webp',
  'book-curdie-2': 'book-curdie-2.webp',
  'book-curdie-3': 'book-curdie-3.webp',
  'book-burnett-1': 'book-burnett-1.webp',
  'book-burnett-2': 'book-burnett-2.webp',
  'book-burnett-3': 'book-burnett-3.webp',
  'book-austen-1': 'book-austen-1.webp',
  'book-austen-2': 'book-austen-2.webp',
  'book-austen-3': 'book-austen-3.webp',
  'book-austen-4': 'book-austen-4.webp',
  'book-bronte-1': 'book-charlotte-1.webp',
  'book-bronte-2': 'book-charlotte-2.webp',
  'book-bronte-3': 'book-charlotte-3.webp',
  'book-bronte-4': 'book-charlotte-4.webp',
  'book-wells-1': 'book-scientific-1.webp',
  'book-wells-2': 'book-scientific-2.webp',
  'book-wells-3': 'book-scientific-3.webp',
  'book-wells-4': 'book-scientific-4.webp',
  'book-stevenson-1': 'book-stevenson-1.webp',
  'book-stevenson-2': 'book-stevenson-2.webp',
  'book-stevenson-3': 'book-stevenson-3.webp',
  'book-stevenson-4': 'book-stevenson-4.webp',
  'book-holmes-1': 'book-sherlock-1.webp',
  'book-holmes-2': 'book-sherlock-2.webp',
  'book-holmes-3': 'book-sherlock-3.webp',
  'book-holmes-4': 'book-sherlock-4.webp',
};

export const DEMO_AUTHOR_COVER_FILES: Record<string, string> = {
  'Lewis Carroll|writer': 'author-lewis-carroll.webp',
  'L. Frank Baum|writer': 'author-l-frank-baum.webp',
  'L. M. Montgomery|writer': 'author-l-m-montgomery.webp',
  'George MacDonald|writer': 'author-george-macdonald.webp',
  'Frances Hodgson Burnett|writer': 'author-frances-hodgson-burnett.webp',
  'Jane Austen|writer': 'author-jane-austen.webp',
  'Charlotte Bronte|writer': 'author-charlotte-bronte.webp',
  'H. G. Wells|writer': 'author-h-g-wells.webp',
  'Robert Louis Stevenson|writer': 'author-robert-louis-stevenson.webp',
  'Arthur Conan Doyle|writer': 'author-arthur-conan-doyle.webp',
};

const demoBookCoverModules: Partial<Record<string, DemoAssetModule>> = {
  'book-alice-1': require('../../assets/demo/books/book-alice-1.webp'),
  'book-alice-2': require('../../assets/demo/books/book-alice-2.webp'),
  'book-alice-3': require('../../assets/demo/books/book-alice-3.webp'),
  'book-alice-4': require('../../assets/demo/books/book-alice-4.webp'),
  'book-oz-1': require('../../assets/demo/books/book-oz-1.webp'),
  'book-oz-2': require('../../assets/demo/books/book-oz-2.webp'),
  'book-oz-3': require('../../assets/demo/books/book-oz-3.webp'),
  'book-oz-4': require('../../assets/demo/books/book-oz-4.webp'),
  'book-anne-1': require('../../assets/demo/books/book-anne-1.webp'),
  'book-anne-2': require('../../assets/demo/books/book-anne-2.webp'),
  'book-anne-3': require('../../assets/demo/books/book-anne-3.webp'),
  'book-anne-4': require('../../assets/demo/books/book-anne-4.webp'),
  'book-curdie-1': require('../../assets/demo/books/book-curdie-1.webp'),
  'book-curdie-2': require('../../assets/demo/books/book-curdie-2.webp'),
  'book-curdie-3': require('../../assets/demo/books/book-curdie-3.webp'),
  'book-burnett-1': require('../../assets/demo/books/book-burnett-1.webp'),
  'book-burnett-2': require('../../assets/demo/books/book-burnett-2.webp'),
  'book-burnett-3': require('../../assets/demo/books/book-burnett-3.webp'),
  'book-austen-1': require('../../assets/demo/books/book-austen-1.webp'),
  'book-austen-2': require('../../assets/demo/books/book-austen-2.webp'),
  'book-austen-3': require('../../assets/demo/books/book-austen-3.webp'),
  'book-austen-4': require('../../assets/demo/books/book-austen-4.webp'),
  'book-bronte-1': require('../../assets/demo/books/book-charlotte-1.webp'),
  'book-bronte-2': require('../../assets/demo/books/book-charlotte-2.webp'),
  'book-bronte-3': require('../../assets/demo/books/book-charlotte-3.webp'),
  'book-bronte-4': require('../../assets/demo/books/book-charlotte-4.webp'),
  'book-wells-1': require('../../assets/demo/books/book-scientific-1.webp'),
  'book-wells-2': require('../../assets/demo/books/book-scientific-2.webp'),
  'book-wells-3': require('../../assets/demo/books/book-scientific-3.webp'),
  'book-wells-4': require('../../assets/demo/books/book-scientific-4.webp'),
  'book-stevenson-1': require('../../assets/demo/books/book-stevenson-1.webp'),
  'book-stevenson-2': require('../../assets/demo/books/book-stevenson-2.webp'),
  'book-stevenson-3': require('../../assets/demo/books/book-stevenson-3.webp'),
  'book-stevenson-4': require('../../assets/demo/books/book-stevenson-4.webp'),
  'book-holmes-1': require('../../assets/demo/books/book-sherlock-1.webp'),
  'book-holmes-2': require('../../assets/demo/books/book-sherlock-2.webp'),
  'book-holmes-3': require('../../assets/demo/books/book-sherlock-3.webp'),
  'book-holmes-4': require('../../assets/demo/books/book-sherlock-4.webp'),
};

const demoAuthorCoverModules: Partial<Record<string, DemoAssetModule>> = {
  'Lewis Carroll|writer': require('../../assets/demo/authors/author-lewis-carroll.webp'),
  'L. Frank Baum|writer': require('../../assets/demo/authors/author-l-frank-baum.webp'),
  'L. M. Montgomery|writer': require('../../assets/demo/authors/author-l-m-montgomery.webp'),
  'George MacDonald|writer': require('../../assets/demo/authors/author-george-macdonald.webp'),
  'Frances Hodgson Burnett|writer': require('../../assets/demo/authors/author-frances-hodgson-burnett.webp'),
  'Jane Austen|writer': require('../../assets/demo/authors/author-jane-austen.webp'),
  'Charlotte Bronte|writer': require('../../assets/demo/authors/author-charlotte-bronte.webp'),
  'H. G. Wells|writer': require('../../assets/demo/authors/author-h-g-wells.webp'),
  'Robert Louis Stevenson|writer': require('../../assets/demo/authors/author-robert-louis-stevenson.webp'),
  'Arthur Conan Doyle|writer': require('../../assets/demo/authors/author-arthur-conan-doyle.webp'),
};

const demoSeriesFirstBookMap: Record<string, string> = {
  'series-alice': 'book-alice-1',
  'series-oz': 'book-oz-1',
  'series-anne': 'book-anne-1',
  'series-princess-curdie': 'book-curdie-1',
  'series-burnett': 'book-burnett-1',
  'series-austen': 'book-austen-1',
  'series-charlotte-bronte': 'book-bronte-1',
  'series-wells': 'book-wells-1',
  'series-stevenson': 'book-stevenson-1',
  'series-holmes': 'book-holmes-1',
};

function resolveAssetUri(assetModule: DemoAssetModule | undefined): string | null {
  if (!assetModule) return null;
  return Image.resolveAssetSource(assetModule).uri ?? null;
}

export function getDemoSeriesCoverUri(seriesId: string): string {
  const firstBookId = demoSeriesFirstBookMap[seriesId];
  return firstBookId ? getDemoBookCoverUri(firstBookId) : DEMO_TRANSPARENT_COVER;
}

export function getDemoBookCoverUri(bookId: string): string {
  return resolveAssetUri(demoBookCoverModules[bookId]) ?? DEMO_TRANSPARENT_COVER;
}

export function getDemoAuthorCoverUri(authorId: string): string | null {
  return resolveAssetUri(demoAuthorCoverModules[authorId]);
}
