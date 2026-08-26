import type { BibleVersion, BibleVerse, BibleBook } from "../types"
// Importa os arquivos JSON das diferentes versões
import NVI from "./nvi.json"
import ACF from "./acf.json"
import AA from "./aa.json"
import ALM1911 from "./alm1911.json"
import ARA from "./ara.json"
import ARC from "./arc.json"
import AS21 from "./as21.json"
import BLIVRE from "./blivre.json"
import JFAA from "./jfaa.json"
import KJA from "./kja.json"
import KJF from "./kjf.json"
import MENS from "./mens.json"
import NAA from "./naa.json"
import NBV from "./nbv.json"
import NTLH from "./ntlh.json"
import NVT from "./nvt.json"
import OL from "./ol.json"
import TB from "./tb.json"
import VFL from "./vfl.json"

// Versão padrão do aplicativo até o usuário escolher outra
export const DEFAULT_VERSION_ABBR = "ARC"

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
  {
    name: "Almeida 1911",
    abbreviation: "ALM1911",
    books: ALM1911,
  },
  {
    name: "Almeida Revista e Atualizada",
    abbreviation: "ARA",
    books: ARA,
  },
  {
    name: "Almeida Revista e Corrigida",
    abbreviation: "ARC",
    books: ARC,
  },
  {
    name: "Almeida Século 21",
    abbreviation: "AS21",
    books: AS21,
  },
  {
    name: "Bíblia Livre",
    abbreviation: "BLIVRE",
    books: BLIVRE,
  },
  {
    name: "João Ferreira de Almeida Atualizada",
    abbreviation: "JFAA",
    books: JFAA,
  },
  {
    name: "King James Atualizada",
    abbreviation: "KJA",
    books: KJA,
  },
  {
    name: "King James Fiel",
    abbreviation: "KJF",
    books: KJF,
  },
  {
    name: "A Mensagem",
    abbreviation: "MENS",
    books: MENS,
  },
  {
    name: "Nova Almeida Atualizada",
    abbreviation: "NAA",
    books: NAA,
  },
  {
    name: "Nova Bíblia Viva",
    abbreviation: "NBV",
    books: NBV,
  },
  {
    name: "Nova Tradução na Linguagem de Hoje",
    abbreviation: "NTLH",
    books: NTLH,
  },
  {
    name: "Nova Versão Transformadora",
    abbreviation: "NVT",
    books: NVT,
  },
  {
    name: "O Livro",
    abbreviation: "OL",
    books: OL,
  },
  {
    name: "Tradução Brasileira",
    abbreviation: "TB",
    books: TB,
  },
  {
    name: "Versão Fácil de Ler",
    abbreviation: "VFL",
    books: VFL,
  },
]

export function getRandomVerse(versionAbbr = DEFAULT_VERSION_ABBR): BibleVerse | null {
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

export function getDailyVerse(versionAbbr = DEFAULT_VERSION_ABBR, date: Date = new Date()): BibleVerse | null {
  const version = bibleVersions.find((v) => v.abbreviation === versionAbbr)
  if (!version || version.books.length === 0) return null
  const seed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate()
  const bookIndex = seed % version.books.length
  const book = version.books[bookIndex]
  const chapterIndex = (seed * 7) % book.chapters.length
  const chapter = book.chapters[chapterIndex]
  if (!chapter || chapter.length === 0) return null
  const verseIndex = (seed * 13) % chapter.length
  return {
    book: book.book,
    abbrev: book.abbrev,
    chapter: chapterIndex + 1,
    verse: verseIndex + 1,
    text: chapter[verseIndex],
    version: versionAbbr,
  }
}

export function getChapterVerses(versionAbbr: string, bookAbbrev: string, chapter: number): BibleVerse[] {
  const version = bibleVersions.find((v) => v.abbreviation === versionAbbr)
  if (!version) return []
  const book = version.books.find((b) => b.abbrev === bookAbbrev)
  if (!book) return []
  const chapterData = book.chapters[chapter - 1]
  if (!chapterData) return []
  return chapterData.map((text, i) => ({
    book: book.book,
    abbrev: book.abbrev,
    chapter,
    verse: i + 1,
    text,
    version: versionAbbr,
  }))
}

export function searchVerses(versionAbbr: string, query: string): BibleVerse[] {
  const version = bibleVersions.find((v) => v.abbreviation === versionAbbr)
  if (!version || !query.trim()) return []
  const q = query.toLowerCase()
  const results: BibleVerse[] = []
  for (const book of version.books) {
    for (let ci = 0; ci < book.chapters.length; ci++) {
      const chapter = book.chapters[ci]
      for (let vi = 0; vi < chapter.length; vi++) {
        if (chapter[vi].toLowerCase().includes(q)) {
          results.push({
            book: book.book,
            abbrev: book.abbrev,
            chapter: ci + 1,
            verse: vi + 1,
            text: chapter[vi],
            version: versionAbbr,
          })
          if (results.length >= 50) return results
        }
      }
    }
  }
  return results
}
