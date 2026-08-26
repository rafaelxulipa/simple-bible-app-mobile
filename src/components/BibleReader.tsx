import React, { useState, useEffect, useCallback, useRef } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
  Alert,
  Share,
  ScrollView,
  Platform,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { MaterialIcons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { CelestialBackground } from "./CelestialBackground"
import { getBooksFromVersion, DEFAULT_VERSION_ABBR } from "../data/bible-verses"
import { getSelectedVersion } from "../utils/storage"
import type { BibleBook } from "../types"

const FAVORITES_KEY = "simpleBible:favorites"
const PROGRESS_KEY = "simpleBible:progress"

const FONT_SIZES = { small: 14, medium: 16, large: 18 } as const
type FontSizeKey = keyof typeof FONT_SIZES

interface SavedProgress {
  version: string
  bookAbbrev: string
  chapter: number
  verse?: number
}

interface FavoriteVerse {
  version: string
  bookAbbrev: string
  book: string
  chapter: number
  verse: number
  text: string
}

interface BibleReaderProps {
  onBack: () => void
  initialBook?: string
  initialChapter?: number
  initialVerse?: number
  initialVersion?: string
}

export const BibleReader: React.FC<BibleReaderProps> = ({
  onBack,
  initialBook,
  initialChapter,
  initialVerse,
  initialVersion,
}) => {
  const [version, setVersion] = useState(initialVersion ?? DEFAULT_VERSION_ABBR)
  const [books, setBooks] = useState<BibleBook[]>([])
  const [selectedBookIndex, setSelectedBookIndex] = useState(0)
  const [selectedChapter, setSelectedChapter] = useState(initialChapter ?? 1)
  const [verses, setVerses] = useState<string[]>([])
  const [selectedVerseIndex, setSelectedVerseIndex] = useState<number | null>(null)
  const [bookmarkedVerse, setBookmarkedVerse] = useState<{ bookAbbrev: string; chapter: number; verse: number } | null>(null)
  const [activeVerseIndex, setActiveVerseIndex] = useState<number | null>(null)
  const [bookmarkConfirm, setBookmarkConfirm] = useState(false)
  const [favorites, setFavorites] = useState<FavoriteVerse[]>([])
  const [fontSizeKey, setFontSizeKey] = useState<FontSizeKey>("medium")
  const [showTOC, setShowTOC] = useState(false)
  const [tocSearch, setTocSearch] = useState("")
  const [showChapterPicker, setShowChapterPicker] = useState(false)
  const [chapterSearch, setChapterSearch] = useState("")
  const [savedProgress, setSavedProgress] = useState<SavedProgress | null>(null)
  const [showProgressBanner, setShowProgressBanner] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const listRef = useRef<FlatList>(null)
  const pendingScrollVerse = useRef<number | null>(initialVerse ?? null)

  // Inicialização: carrega livros, favoritos e progresso salvo
  useEffect(() => {
    const loaded = getBooksFromVersion(version)
    setBooks(loaded)

    // Se veio com livro específico, posiciona nele
    if (initialBook && loaded.length > 0) {
      const idx = loaded.findIndex((b) => b.abbrev === initialBook || b.book === initialBook)
      if (idx >= 0) {
        setSelectedBookIndex(idx)
        if (initialVerse) {
          setBookmarkedVerse({ bookAbbrev: loaded[idx].abbrev, chapter: initialChapter ?? 1, verse: initialVerse })
        }
      }
    }

    AsyncStorage.getItem(FAVORITES_KEY).then((raw) => {
      if (raw) setFavorites(JSON.parse(raw))
    })

    AsyncStorage.getItem(PROGRESS_KEY).then((raw) => {
      if (!raw) { setInitialized(true); return }
      const prog: SavedProgress = JSON.parse(raw)
      setSavedProgress(prog)
      // Restaura o bookmark do progresso salvo
      if (prog.verse && !initialVerse) {
        setBookmarkedVerse({ bookAbbrev: prog.bookAbbrev, chapter: prog.chapter, verse: prog.verse })
      }
      // Só mostra banner se não foi aberto em posição específica pelo usuário
      if (!initialBook && !initialChapter) {
        const bookIdx = loaded.findIndex((b) => b.abbrev === prog.bookAbbrev)
        if (bookIdx >= 0) setShowProgressBanner(true)
      }
      setInitialized(true)
    })
  }, [])

  // Recarrega livros ao trocar versão (mantém posição)
  useEffect(() => {
    const loaded = getBooksFromVersion(version)
    setBooks(loaded)
  }, [version])

  // Sem versão explícita (ex.: aba "Bíblia" sem progresso salvo): usa a última versão escolhida pelo usuário
  useEffect(() => {
    if (initialVersion) return
    getSelectedVersion().then((v) => { if (v) setVersion(v) })
  }, [])

  // Carrega versículos ao mudar livro/capítulo e faz scroll para versículo marcado
  useEffect(() => {
    if (books.length === 0) return
    const book = books[selectedBookIndex]
    if (!book) return
    const chapter = book.chapters[selectedChapter - 1]
    setVerses(chapter ?? [])
    setSelectedVerseIndex(null)

    // Scroll para versículo pendente (bookmark ou initialVerse)
    const scrollTo = pendingScrollVerse.current
    if (scrollTo && scrollTo > 1) {
      pendingScrollVerse.current = null
      setTimeout(() => {
        listRef.current?.scrollToIndex({ index: scrollTo - 1, animated: true, viewPosition: 0.3 })
      }, 300)
    } else {
      listRef.current?.scrollToOffset({ offset: 0, animated: false })
    }
  }, [books, selectedBookIndex, selectedChapter])

  // Salva progresso automaticamente ao navegar
  useEffect(() => {
    if (!initialized || books.length === 0) return
    const book = books[selectedBookIndex]
    if (!book) return
    const prog: SavedProgress = {
      version,
      bookAbbrev: bookmarkedVerse?.bookAbbrev ?? book.abbrev,
      chapter: bookmarkedVerse?.chapter ?? selectedChapter,
      verse: bookmarkedVerse?.verse,
    }
    AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(prog))
  }, [version, selectedBookIndex, selectedChapter, initialized])

  const saveProgressWithVerse = useCallback(
    async (bookIdx: number, chapter: number, verse?: number) => {
      if (books.length === 0) return
      const book = books[bookIdx]
      if (!book) return
      const prog: SavedProgress = { version, bookAbbrev: book.abbrev, chapter, verse }
      await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(prog))
    },
    [books, version],
  )

  const handleBookmarkVerse = (verseNum: number) => {
    const book = books[selectedBookIndex]
    if (!book) return
    const alreadyMarked =
      bookmarkedVerse?.bookAbbrev === book.abbrev &&
      bookmarkedVerse?.chapter === selectedChapter &&
      bookmarkedVerse?.verse === verseNum
    const newBookmark = alreadyMarked ? null : { bookAbbrev: book.abbrev, chapter: selectedChapter, verse: verseNum }
    setBookmarkedVerse(newBookmark)
    saveProgressWithVerse(selectedBookIndex, selectedChapter, newBookmark?.verse)
    setSelectedVerseIndex(null)
  }

  const navigateToBookChapter = (bookIdx: number, chapter: number, scrollVerse?: number) => {
    pendingScrollVerse.current = scrollVerse ?? null
    setSelectedBookIndex(bookIdx)
    setSelectedChapter(chapter)
    setSelectedVerseIndex(null)
  }

  const handleRestoreProgress = () => {
    if (!savedProgress || books.length === 0) return
    if (savedProgress.version !== version) setVersion(savedProgress.version)
    const bookIdx = books.findIndex((b) => b.abbrev === savedProgress.bookAbbrev)
    if (bookIdx >= 0) {
      pendingScrollVerse.current = savedProgress.verse ?? null
      navigateToBookChapter(bookIdx, savedProgress.chapter, savedProgress.verse)
    }
    setShowProgressBanner(false)
    setSavedProgress(null)
  }

  const handlePrevChapter = () => {
    if (selectedChapter > 1) {
      navigateToBookChapter(selectedBookIndex, selectedChapter - 1)
    } else if (selectedBookIndex > 0) {
      const prevBook = books[selectedBookIndex - 1]
      const lastChapter = prevBook.chapters.length
      navigateToBookChapter(selectedBookIndex - 1, lastChapter)
    }
  }

  const handleNextChapter = () => {
    const currentBook = books[selectedBookIndex]
    if (!currentBook) return
    if (selectedChapter < currentBook.chapters.length) {
      navigateToBookChapter(selectedBookIndex, selectedChapter + 1)
    } else if (selectedBookIndex < books.length - 1) {
      navigateToBookChapter(selectedBookIndex + 1, 1)
    }
  }

  const toggleFavorite = async (verseIndex: number) => {
    if (books.length === 0) return
    const book = books[selectedBookIndex]
    if (!book) return
    const text = verses[verseIndex]
    const key = `${version}-${book.abbrev}-${selectedChapter}-${verseIndex + 1}`
    const exists = favorites.find(
      (f) =>
        f.version === version &&
        f.bookAbbrev === book.abbrev &&
        f.chapter === selectedChapter &&
        f.verse === verseIndex + 1,
    )
    let updated: FavoriteVerse[]
    if (exists) {
      updated = favorites.filter(
        (f) => !(f.version === version && f.bookAbbrev === book.abbrev && f.chapter === selectedChapter && f.verse === verseIndex + 1),
      )
    } else {
      updated = [...favorites, { version, bookAbbrev: book.abbrev, book: book.book, chapter: selectedChapter, verse: verseIndex + 1, text }]
    }
    setFavorites(updated)
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updated))
  }

  const isFavorite = (verseIndex: number) => {
    if (books.length === 0) return false
    const book = books[selectedBookIndex]
    if (!book) return false
    return favorites.some(
      (f) =>
        f.version === version &&
        f.bookAbbrev === book.abbrev &&
        f.chapter === selectedChapter &&
        f.verse === verseIndex + 1,
    )
  }

  const handleShare = async (verseIndex: number) => {
    if (books.length === 0) return
    const book = books[selectedBookIndex]
    if (!book) return
    const text = verses[verseIndex]
    const ref = `${book.book} ${selectedChapter}:${verseIndex + 1} (${version})`
    try {
      await Share.share({ message: `"${text}"\n— ${ref}` })
    } catch {}
  }


  const cycleFontSize = () => {
    const sizes: FontSizeKey[] = ["small", "medium", "large"]
    const current = sizes.indexOf(fontSizeKey)
    setFontSizeKey(sizes[(current + 1) % sizes.length])
  }

  const currentBook = books[selectedBookIndex]
  const chapterCount = currentBook?.chapters.length ?? 0
  const chapterOptions = Array.from({ length: chapterCount }, (_, i) => i + 1).filter((c) =>
    chapterSearch.trim() === "" ? true : String(c).includes(chapterSearch.trim()),
  )

  const normalize = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
  const tocQuery = normalize(tocSearch.trim())
  const matchesQuery = (b: BibleBook) => tocQuery === "" || normalize(b.book).includes(tocQuery)

  const oldTestament = books
    .slice(0, 39)
    .map((b, index) => ({ b, index }))
    .filter(({ b }) => matchesQuery(b))
  const newTestament = books
    .slice(39)
    .map((b, index) => ({ b, index: index + 39 }))
    .filter(({ b }) => matchesQuery(b))

  const closeVerseModal = () => {
    setActiveVerseIndex(null)
    setBookmarkConfirm(false)
  }

  const renderVerse = ({ item, index }: { item: string; index: number }) => {
    const book = books[selectedBookIndex]
    const isBookmarked =
      bookmarkedVerse !== null &&
      bookmarkedVerse.bookAbbrev === book?.abbrev &&
      bookmarkedVerse.chapter === selectedChapter &&
      bookmarkedVerse.verse === index + 1
    return (
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={() => setActiveVerseIndex(index)}
        style={[styles.verseRow, isBookmarked && styles.verseRowBookmarked]}
      >
        <View style={styles.verseNumberCol}>
          <Text style={styles.verseNumber}>{index + 1}</Text>
          {isBookmarked && <MaterialIcons name="bookmark" size={12} color="#F59E0B" />}
        </View>
        <Text style={[styles.verseText, { fontSize: FONT_SIZES[fontSizeKey] }]}>{item}</Text>
      </TouchableOpacity>
    )
  }

  const hasPrev = selectedBookIndex > 0 || selectedChapter > 1
  const hasNext = selectedBookIndex < books.length - 1 || (currentBook && selectedChapter < currentBook.chapters.length)

  return (
    <View style={styles.container}>
      <CelestialBackground />
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        {/* Header bar */}
        <View style={styles.headerBar}>
          <TouchableOpacity style={styles.iconBtn} onPress={onBack}>
            <MaterialIcons name="arrow-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Book + Chapter pills */}
          <View style={styles.navPills}>
            <TouchableOpacity style={styles.bookPill} onPress={() => setShowTOC(true)} activeOpacity={0.75}>
              <MaterialIcons name="menu-book" size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.bookPillText} numberOfLines={1}>{currentBook?.book ?? "—"}</Text>
              <MaterialIcons name="expand-more" size={16} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.chapterPill} onPress={() => setShowChapterPicker(true)} activeOpacity={0.75}>
              <Text style={styles.chapterPillText}>{selectedChapter}</Text>
              <MaterialIcons name="expand-more" size={14} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
          </View>

          <View style={styles.headerActions}>
            <View style={styles.versionBadge}>
              <Text style={styles.versionBadgeText}>{version}</Text>
            </View>
            <TouchableOpacity style={styles.iconBtn} onPress={cycleFontSize}>
              <Text style={styles.fontSizeBtnText}>{fontSizeKey === "small" ? "A" : fontSizeKey === "large" ? "A+" : "Aa"}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Progress banner */}
        {showProgressBanner && savedProgress && (
          <View style={styles.progressBanner}>
            <MaterialIcons name="bookmark" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.progressBannerText}>
              {books.find((b) => b.abbrev === savedProgress.bookAbbrev)?.book} cap. {savedProgress.chapter} · {savedProgress.version}
            </Text>
            <TouchableOpacity style={styles.progressBannerBtn} onPress={handleRestoreProgress}>
              <Text style={styles.progressBannerBtnText}>Continuar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowProgressBanner(false)} style={{ padding: 4 }}>
              <MaterialIcons name="close" size={16} color="rgba(255,255,255,0.8)" />
            </TouchableOpacity>
          </View>
        )}

        {/* Chapter title + chapter navigation */}
        <View style={styles.chapterTitle}>
          <TouchableOpacity
            style={[styles.chapterNavBtn, !hasPrev && styles.chapterNavBtnDisabled]}
            onPress={handlePrevChapter}
            disabled={!hasPrev}
          >
            <MaterialIcons name="chevron-left" size={20} color={hasPrev ? "#FFFFFF" : "rgba(255,255,255,0.3)"} />
          </TouchableOpacity>

          <View style={styles.chapterTitlePill}>
            <MaterialIcons name="menu-book" size={14} color="rgba(255,255,255,0.8)" />
            <Text style={styles.chapterTitleText}>
              {currentBook?.book} · Capítulo {selectedChapter}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.chapterNavBtn, !hasNext && styles.chapterNavBtnDisabled]}
            onPress={handleNextChapter}
            disabled={!hasNext}
          >
            <MaterialIcons name="chevron-right" size={20} color={hasNext ? "#FFFFFF" : "rgba(255,255,255,0.3)"} />
          </TouchableOpacity>
        </View>

        {/* Verse list */}
        <FlatList
          ref={listRef}
          data={verses}
          keyExtractor={(_, i) => String(i)}
          renderItem={renderVerse}
          contentContainerStyle={styles.verseList}
          showsVerticalScrollIndicator={false}
        />

        {/* Verse action modal */}
        <Modal
          visible={activeVerseIndex !== null}
          animationType="fade"
          transparent
          onRequestClose={closeVerseModal}
        >
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={closeVerseModal}>
            <TouchableOpacity activeOpacity={1} style={styles.verseModal} onPress={() => {}}>
              <TouchableOpacity style={styles.verseModalClose} onPress={closeVerseModal}>
                <MaterialIcons name="close" size={18} color="#9CA3AF" />
              </TouchableOpacity>

              {activeVerseIndex !== null && !bookmarkConfirm && (() => {
                const book = books[selectedBookIndex]
                const verseNum = activeVerseIndex + 1
                const text = verses[activeVerseIndex]
                const fav = isFavorite(activeVerseIndex)
                const isBookmarked =
                  bookmarkedVerse !== null &&
                  bookmarkedVerse.bookAbbrev === book?.abbrev &&
                  bookmarkedVerse.chapter === selectedChapter &&
                  bookmarkedVerse.verse === verseNum
                const ref = `${book?.book} ${selectedChapter}:${verseNum}`
                return (
                  <>
                    {/* Referência + preview */}
                    <Text style={styles.verseModalRef}>{ref}</Text>
                    <Text style={styles.verseModalPreview} numberOfLines={3}>{text}</Text>

                    {/* Ações */}
                    <View style={styles.verseModalActions}>
                      <TouchableOpacity
                        style={[styles.verseModalBtn, fav && styles.verseModalBtnRed]}
                        onPress={() => { toggleFavorite(activeVerseIndex); closeVerseModal() }}
                      >
                        <MaterialIcons name={fav ? "favorite" : "favorite-border"} size={20} color={fav ? "#EF4444" : "#374151"} />
                        <Text style={[styles.verseModalBtnText, fav && { color: "#EF4444" }]}>
                          {fav ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.verseModalBtn, isBookmarked && styles.verseModalBtnAmber]}
                        onPress={() => {
                          if (isBookmarked) {
                            handleBookmarkVerse(verseNum)
                            closeVerseModal()
                          } else {
                            setBookmarkConfirm(true)
                          }
                        }}
                      >
                        <MaterialIcons name={isBookmarked ? "bookmark" : "bookmark-border"} size={20} color={isBookmarked ? "#D97706" : "#374151"} />
                        <Text style={[styles.verseModalBtnText, isBookmarked && { color: "#D97706" }]}>
                          {isBookmarked ? "Remover marcador" : "Marcar onde parei"}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.verseModalBtn}
                        onPress={() => { handleShare(activeVerseIndex); closeVerseModal() }}
                      >
                        <MaterialIcons name="share" size={20} color="#374151" />
                        <Text style={styles.verseModalBtnText}>Compartilhar versículo</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )
              })()}

              {bookmarkConfirm && activeVerseIndex !== null && (() => {
                const book = books[selectedBookIndex]
                const verseNum = activeVerseIndex + 1
                return (
                  <>
                    <Text style={styles.verseModalTitle}>Marcar onde parei?</Text>
                    <Text style={styles.verseModalDesc}>
                      O versículo {book?.book} {selectedChapter}:{verseNum} será salvo como seu marcador de leitura. Você será direcionado à tela inicial.
                    </Text>
                    <View style={styles.verseModalConfirmRow}>
                      <TouchableOpacity
                        style={[styles.verseModalConfirmBtn, styles.verseModalConfirmCancel]}
                        onPress={() => setBookmarkConfirm(false)}
                      >
                        <Text style={styles.verseModalConfirmCancelText}>Cancelar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.verseModalConfirmBtn, styles.verseModalConfirmOk]}
                        onPress={() => {
                          handleBookmarkVerse(verseNum)
                          closeVerseModal()
                          onBack()
                        }}
                      >
                        <Text style={styles.verseModalConfirmOkText}>Sim, marcar aqui</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )
              })()}
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>

        {/* Table of Contents Modal */}
        <Modal
          visible={showTOC}
          animationType="fade"
          transparent
          onRequestClose={() => setShowTOC(false)}
          onShow={() => setTocSearch("")}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.tocModal}>
              <View style={styles.tocHeader}>
                <Text style={styles.tocTitle}>Índice</Text>
                <TouchableOpacity onPress={() => setShowTOC(false)}>
                  <MaterialIcons name="close" size={26} color="#374151" />
                </TouchableOpacity>
              </View>
              <View style={styles.tocSearchBox}>
                <MaterialIcons name="search" size={18} color="#9CA3AF" />
                <TextInput
                  style={styles.tocSearchInput}
                  placeholder="Buscar livro..."
                  placeholderTextColor="#9CA3AF"
                  value={tocSearch}
                  onChangeText={setTocSearch}
                  autoCorrect={false}
                />
                {tocSearch.length > 0 && (
                  <TouchableOpacity onPress={() => setTocSearch("")} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <MaterialIcons name="close" size={16} color="#9CA3AF" />
                  </TouchableOpacity>
                )}
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                {oldTestament.length === 0 && newTestament.length === 0 && (
                  <Text style={styles.tocEmptyText}>Nenhum livro encontrado.</Text>
                )}
                {oldTestament.length > 0 && <Text style={styles.tocSection}>Antigo Testamento</Text>}
                {oldTestament.map(({ b, index }) => (
                  <TouchableOpacity
                    key={b.abbrev}
                    style={[styles.tocBookRow, selectedBookIndex === index && styles.tocBookRowActive]}
                    onPress={() => {
                      navigateToBookChapter(index, 1)
                      setShowTOC(false)
                    }}
                  >
                    <Text style={[styles.tocBookText, selectedBookIndex === index && styles.tocBookTextActive]}>{b.book}</Text>
                    <Text style={styles.tocChapterCount}>{b.chapters.length} cap.</Text>
                  </TouchableOpacity>
                ))}
                {newTestament.length > 0 && <Text style={styles.tocSection}>Novo Testamento</Text>}
                {newTestament.map(({ b, index }) => (
                  <TouchableOpacity
                    key={b.abbrev}
                    style={[styles.tocBookRow, selectedBookIndex === index && styles.tocBookRowActive]}
                    onPress={() => {
                      navigateToBookChapter(index, 1)
                      setShowTOC(false)
                    }}
                  >
                    <Text style={[styles.tocBookText, selectedBookIndex === index && styles.tocBookTextActive]}>{b.book}</Text>
                    <Text style={styles.tocChapterCount}>{b.chapters.length} cap.</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Chapter picker modal */}
        <Modal
          visible={showChapterPicker}
          animationType="fade"
          transparent
          onRequestClose={() => setShowChapterPicker(false)}
          onShow={() => setChapterSearch("")}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.bottomSheet}>
              <View style={styles.tocHeader}>
                <Text style={styles.tocTitle}>Capítulo — {currentBook?.book}</Text>
                <TouchableOpacity onPress={() => setShowChapterPicker(false)}>
                  <MaterialIcons name="close" size={24} color="#374151" />
                </TouchableOpacity>
              </View>
              {chapterCount > 12 && (
                <View style={styles.tocSearchBox}>
                  <MaterialIcons name="search" size={18} color="#9CA3AF" />
                  <TextInput
                    style={styles.tocSearchInput}
                    placeholder="Buscar capítulo..."
                    placeholderTextColor="#9CA3AF"
                    value={chapterSearch}
                    onChangeText={setChapterSearch}
                    keyboardType="number-pad"
                  />
                  {chapterSearch.length > 0 && (
                    <TouchableOpacity onPress={() => setChapterSearch("")} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <MaterialIcons name="close" size={16} color="#9CA3AF" />
                    </TouchableOpacity>
                  )}
                </View>
              )}
              {chapterOptions.length === 0 && (
                <Text style={styles.tocEmptyText}>Nenhum capítulo encontrado.</Text>
              )}
              <ScrollView contentContainerStyle={styles.chapterGrid}>
                {chapterOptions.map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[styles.chapterGridItem, selectedChapter === c && styles.chapterGridItemActive]}
                    onPress={() => { navigateToBookChapter(selectedBookIndex, c); setShowChapterPicker(false) }}
                  >
                    <Text style={[styles.chapterGridText, selectedChapter === c && styles.chapterGridTextActive]}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  safeArea: {
    flex: 1,
    backgroundColor: "transparent",
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.35)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 8,
  },
  iconBtn: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 18,
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  navPills: {
    flex: 1,
    flexDirection: "row",
    gap: 6,
  },
  bookPill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  bookPillText: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  chapterPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    minWidth: 52,
    justifyContent: "center",
  },
  chapterPillText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  versionBadge: {
    backgroundColor: "rgba(59,130,246,0.5)",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "rgba(59,130,246,0.6)",
  },
  versionBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  fontSizeBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  progressBanner: {
    backgroundColor: "rgba(30,64,175,0.9)",
    marginHorizontal: 12,
    marginTop: 8,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  progressBannerText: {
    color: "#FFFFFF",
    fontSize: 13,
    flex: 1,
    fontWeight: "500",
  },
  progressBannerBtn: {
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  progressBannerBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  bottomSheet: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    marginHorizontal: 20,
    maxHeight: "75%",
  },
  chapterGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 16,
    gap: 10,
  },
  chapterGridItem: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  chapterGridItemActive: {
    backgroundColor: "#1D4ED8",
    borderColor: "#1D4ED8",
  },
  chapterGridText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
  },
  chapterGridTextActive: {
    color: "#FFFFFF",
  },
  chapterTitle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  chapterTitlePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  chapterNavBtn: {
    backgroundColor: "#3B82F6",
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
  },
  chapterNavBtnDisabled: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderColor: "rgba(255,255,255,0.2)",
  },
  chapterTitleText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  verseList: {
    paddingHorizontal: 12,
    paddingBottom: 16,
  },
  verseRow: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 12,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  verseRowSelected: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "rgba(59,130,246,0.4)",
    elevation: 4,
  },
  verseRowBookmarked: {
    borderLeftWidth: 3,
    borderLeftColor: "#F59E0B",
    backgroundColor: "rgba(255,251,235,0.97)",
  },
  verseNumberCol: {
    width: 28,
    alignItems: "center",
    paddingTop: 2,
    gap: 2,
  },
  verseNumber: {
    color: "#3B82F6",
    fontWeight: "700",
    fontSize: 13,
  },
  verseText: {
    flex: 1,
    color: "#374151",
    lineHeight: 24,
  },
  verseModal: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    marginHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  verseModalClose: {
    position: "absolute",
    top: 14,
    right: 14,
    padding: 4,
    zIndex: 1,
  },
  verseModalRef: {
    fontSize: 12,
    fontWeight: "700",
    color: "#9CA3AF",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
    marginRight: 24,
  },
  verseModalPreview: {
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 22,
    fontStyle: "italic",
    marginBottom: 20,
  },
  verseModalActions: {
    gap: 10,
  },
  verseModalBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#F3F4F6",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  verseModalBtnRed: { backgroundColor: "#FEF2F2" },
  verseModalBtnAmber: { backgroundColor: "#FFFBEB" },
  verseModalBtnText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#374151",
  },
  verseModalTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
    marginRight: 24,
  },
  verseModalDesc: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 22,
    marginBottom: 24,
  },
  verseModalConfirmRow: {
    flexDirection: "row",
    gap: 10,
  },
  verseModalConfirmBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: "center",
  },
  verseModalConfirmCancel: { backgroundColor: "#F3F4F6" },
  verseModalConfirmOk: { backgroundColor: "#F59E0B" },
  verseModalConfirmCancelText: { fontSize: 15, fontWeight: "600", color: "#374151" },
  verseModalConfirmOkText: { fontSize: 15, fontWeight: "700", color: "#FFFFFF" },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
  },
  tocModal: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    marginHorizontal: 20,
    maxHeight: "75%",
    paddingBottom: 16,
  },
  tocSearchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  tocSearchInput: {
    flex: 1,
    fontSize: 15,
    color: "#111827",
    padding: 0,
  },
  tocEmptyText: {
    textAlign: "center",
    color: "#9CA3AF",
    fontSize: 14,
    paddingVertical: 24,
  },
  tocHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  tocTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  tocSection: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  tocBookRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  tocBookRowActive: {
    backgroundColor: "rgba(59,130,246,0.08)",
  },
  tocBookText: {
    fontSize: 15,
    color: "#374151",
  },
  tocBookTextActive: {
    color: "#3B82F6",
    fontWeight: "700",
  },
  tocChapterCount: {
    fontSize: 12,
    color: "#9CA3AF",
  },
})
