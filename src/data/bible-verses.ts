import type { BibleVersion, BibleVerse, BibleBook } from "../types"
// Importa os arquivos JSON das diferentes versões
import NVI from "./nvi.json"
import ACF from "./acf.json"
import AA from "./aa.json"

// Dados expandidos das escrituras
export const bibleVersions: BibleVersion[] = [
  {
    name: "Nova Versão Internacional",
    abbreviation: "NVI",
    books: NVI,
  },
  {
    name: "Almeida Corrigida e Fiel",
    abbreviation: "ACF",
    books: ACF,
  },
  {
    name: "Almeida Revisada Imprensa Bíblica",
    abbreviation: "AA",
    books: AA,
  },
]

export function getRandomVerse(versionAbbr = "NVI"): BibleVerse | null {
  const version = bibleVersions.find((v) => v.abbreviation === versionAbbr)
  if (!version || version.books.length === 0) return null

  const randomBookIndex = Math.floor(Math.random() * version.books.length)
  const selectedBook = version.books[randomBookIndex]

  if (!selectedBook.chapters || selectedBook.chapters.length === 0) return null

  const randomChapterIndex = Math.floor(Math.random() * selectedBook.chapters.length)
  const selectedChapter = selectedBook.chapters[randomChapterIndex]

  if (!selectedChapter || selectedChapter.length === 0) return null

  const randomVerseIndex = Math.floor(Math.random() * selectedChapter.length)
  const selectedVerse = selectedChapter[randomVerseIndex]

  return {
    book: selectedBook.book,
    abbrev: selectedBook.abbrev,
    chapter: randomChapterIndex + 1,
    verse: randomVerseIndex + 1,
    text: selectedVerse,
    version: versionAbbr,
  }
}

export function getAvailableVersions() {
  return bibleVersions.map((v) => ({
    name: v.name,
    abbreviation: v.abbreviation,
  }))
}

export function getBooksFromVersion(versionAbbr: string): BibleBook[] {
  const version = bibleVersions.find((v) => v.abbreviation === versionAbbr)
  return version ? version.books : []
}

export function getSpecificVerse(
  versionAbbr: string,
  bookAbbrev: string,
  chapter: number,
  verse: number,
): BibleVerse | null {
  const version = bibleVersions.find((v) => v.abbreviation === versionAbbr)
  if (!version) return null

  const book = version.books.find((b) => b.abbrev === bookAbbrev)
  if (!book) return null

  const chapterData = book.chapters[chapter - 1]
  if (!chapterData) return null

  const verseText = chapterData[verse - 1]
  if (!verseText) return null

  return {
    book: book.book,
    abbrev: book.abbrev,
    chapter,
    verse,
    text: verseText,
    version: versionAbbr,
  }
}
