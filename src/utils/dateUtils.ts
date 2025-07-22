export const getCurrentTime = (): string => {
  const now = new Date()
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }

  return now.toLocaleDateString("pt-BR", options)
}

export const formatReference = (book: string, chapter: number, verse: number): string => {
  return `${book} ${chapter}:${verse}`
}
