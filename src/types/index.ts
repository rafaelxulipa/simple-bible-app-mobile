export interface BibleBook {
  abbrev: string
  book: string
  chapters: string[][]
}

export interface BibleVerse {
  book: string
  abbrev: string
  chapter: number
  verse: number
  text: string
  version: string
}

export interface BibleVersion {
  name: string
  abbreviation: string
  books: BibleBook[]
}

export interface UserData {
  name: string
  church: string
}
