import type { BibleVersion, BibleVerse, BibleBook } from "../types"

// Dados expandidos das escrituras
const bibleData: BibleVersion[] = [
  {
    name: "Nova Versão Internacional",
    abbreviation: "NVI",
    books: [
      {
        abbrev: "jo",
        book: "João",
        chapters: [
          [
            "Porque Deus tanto amou o mundo que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.",
            "Pois Deus enviou o seu Filho ao mundo, não para condenar o mundo, mas para que este fosse salvo por meio dele.",
            "Quem nele crê não é condenado, mas quem não crê já está condenado, por não crer no nome do Filho unigênito de Deus.",
          ],
        ],
      },
      {
        abbrev: "sl",
        book: "Salmos",
        chapters: [
          [
            "O SENHOR é o meu pastor; nada me faltará.",
            "Deitar-me faz em verdes pastos, guia-me mansamente a águas tranquilas.",
            "Refrigera a minha alma; guia-me pelas veredas da justiça por amor do seu nome.",
          ],
          [
            "Lâmpada para os meus pés é a tua palavra e luz para o meu caminho.",
            "Jurei, e o cumprirei, que guardarei os teus justos juízos.",
          ],
          [
            "Aquietai-vos e sabei que eu sou Deus; sou exaltado entre as nações; sou exaltado na terra.",
            "O SENHOR dos Exércitos está conosco; o Deus de Jacó é o nosso refugio.",
          ],
        ],
      },
      {
        abbrev: "fp",
        book: "Filipenses",
        chapters: [
          [
            "Tudo posso naquele que me fortalece.",
            "Alegrai-vos sempre no Senhor; outra vez digo: alegrai-vos!",
            "E a paz de Deus, que excede todo o entendimento, guardará os vossos corações e os vossos sentimentos em Cristo Jesus.",
          ],
        ],
      },
      {
        abbrev: "pv",
        book: "Provérbios",
        chapters: [
          [
            "Confia no SENHOR de todo o teu coração e não te estribes no teu próprio entendimento.",
            "Reconhece-o em todos os teus caminhos, e ele endireitará as tuas veredas.",
          ],
          ["Entrega o teu caminho ao SENHOR; confia nele, e ele o fará."],
        ],
      },
      {
        abbrev: "jr",
        book: "Jeremias",
        chapters: [
          [
            "Porque eu bem sei os pensamentos que tenho a vosso respeito, diz o SENHOR; pensamentos de paz e não de mal, para vos dar o fim que esperais.",
            "Então me invocareis, e ireis, e orareis a mim, e eu vos ouvirei.",
          ],
        ],
      },
      {
        abbrev: "mt",
        book: "Mateus",
        chapters: [
          [
            "Vinde a mim, todos os que estais cansados e oprimidos, e eu vos aliviarei.",
            "Tomai sobre vós o meu jugo, e aprendei de mim, que sou manso e humilde de coração; e encontrareis descanso para as vossas almas.",
          ],
          [
            "Buscai primeiro o Reino de Deus, e a sua justiça, e todas essas coisas vos serão acrescentadas.",
            "Porque onde estiver o vosso tesouro, aí estará também o vosso coração.",
          ],
        ],
      },
      {
        abbrev: "rm",
        book: "Romanos",
        chapters: [
          [
            "E sabemos que todas as coisas contribuem juntamente para o bem daqueles que amam a Deus, daqueles que são chamados por seu decreto.",
            "Porque o salário do pecado é a morte, mas o dom gratuito de Deus é a vida eterna, por Cristo Jesus, nosso Senhor.",
          ],
        ],
      },
      {
        abbrev: "is",
        book: "Isaías",
        chapters: [
          [
            "Não temas, porque eu sou contigo; não te assombres, porque eu sou o teu Deus; eu te fortaleço, e te ajudo, e te sustento com a destra da minha justiça.",
            "Mas os que esperam no SENHOR renovarão as suas forças, subirão com asas como águias; correrão e não se cansarão; caminharão e não se fatigarão.",
            "Porque eu sou o SENHOR, teu Deus, que te toma pela tua mão direita e te diz: Não temas, que eu te ajudo.",
          ],
        ],
      },
      {
        abbrev: "ef",
        book: "Efésios",
        chapters: [
          [
            "Porque pela graça sois salvos, por meio da fé; e isso não vem de vós; é dom de Deus.",
            "Não vem das obras, para que ninguém se glorie.",
          ],
        ],
      },
      {
        abbrev: "1jo",
        book: "1 João",
        chapters: [
          [
            "Se confessarmos os nossos pecados, ele é fiel e justo para nos perdoar os pecados e nos purificar de toda injustiça.",
            "Se dissermos que não pecamos, fazemo-lo mentiroso, e a sua palavra não está em nós.",
          ],
        ],
      },
    ],
  },
  {
    name: "Almeida Corrigida e Fiel",
    abbreviation: "ACF",
    books: [
      {
        abbrev: "sl",
        book: "Salmos",
        chapters: [
          [
            "O SENHOR é o meu pastor; nada me faltará.",
            "Deitar-me faz em verdes pastos, guia-me mansamente a águas tranquilas.",
          ],
        ],
      },
      {
        abbrev: "jo",
        book: "João",
        chapters: [
          [
            "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.",
          ],
        ],
      },
    ],
  },
]

export const bibleVersions: BibleVersion[] = bibleData

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
