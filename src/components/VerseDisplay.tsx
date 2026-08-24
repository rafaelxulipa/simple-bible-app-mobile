import React, { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Animated,
  TextInput,
  Share,
  Modal,
  FlatList,
  Image,
  useColorScheme,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { LinearGradient } from "expo-linear-gradient"
import { MaterialIcons } from "@expo/vector-icons"
import * as ImagePicker from "expo-image-picker"
import { CelestialBackground } from "./CelestialBackground"
import { AppFooter } from "./AppFooter"
import { BottomTabBar } from "./BottomTabBar"
import { NotificationSettingsModal } from "./NotificationSettingsModal"
import { VersionSelectorModal } from "./VersionSelectorModal"
import { SelectModal } from "./SelectModal"
import { PhotoCropperModal } from "./PhotoCropperModal"
import type { UserData, BibleVerse, BibleBook } from "../types"
import {
  getRandomVerse,
  getDailyVerse,
  getAvailableVersions,
  getBooksFromVersion,
  getChapterVerses,
  searchVerses,
} from "../data/bible-verses"
import { getCurrentTime, formatReference } from "../utils/dateUtils"
import AsyncStorage from "@react-native-async-storage/async-storage"

interface VerseDisplayProps {
  userData: UserData
  onReset: () => void
  onPrivacyPress?: () => void
  onReaderPress?: (params?: { book?: string; chapter?: number; verse?: number; version?: string }) => void
}

type Mode = "random" | "daily" | "navigate" | "search"

interface FavoriteVerse extends BibleVerse {
  savedAt: string
}

const FAVORITES_KEY = "simpleBible:favorites"
const PHOTO_KEY = "simpleBible:userPhoto"
const DEFAULT_AVATAR_EMOJI = "👼"

async function loadFavorites(): Promise<FavoriteVerse[]> {
  try {
    const data = await AsyncStorage.getItem(FAVORITES_KEY)
    return data ? (JSON.parse(data) as FavoriteVerse[]) : []
  } catch {
    return []
  }
}

async function saveFavoritesToStorage(favorites: FavoriteVerse[]) {
  await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
}

export const VerseDisplay: React.FC<VerseDisplayProps> = ({ userData, onReset, onPrivacyPress, onReaderPress }) => {
  const isDarkMode = useColorScheme() === "dark"
  const [mode, setMode]                       = useState<Mode>("random")
  const [selectedVersion, setSelectedVersion] = useState("ACF")
  const [isLoading, setIsLoading]             = useState(false)
  const [showUserInfo, setShowUserInfo]       = useState(false)
  const [showFavorites, setShowFavorites]     = useState(false)
  const [showNotificationSettings, setShowNotificationSettings] = useState(false)
  const [showVersionSelector, setShowVersionSelector] = useState(false)
  const [photoUri, setPhotoUri] = useState<string | null>(null)
  const [showCropper, setShowCropper] = useState(false)
  const [cropperImage, setCropperImage] = useState<{ uri: string; width: number; height: number } | null>(null)

  // Modo aleatório — histórico para prev/next
  const [verseHistory, setVerseHistory]   = useState<BibleVerse[]>([])
  const [historyIndex, setHistoryIndex]   = useState(-1)

  // Modo diário
  const [dailyVerse, setDailyVerse] = useState<BibleVerse | null>(null)

  // Modo navegar
  const [books, setBooks]               = useState<BibleBook[]>([])
  const [selectedBook, setSelectedBook] = useState("")
  const [selectedChapter, setSelectedChapter] = useState(1)
  const [chapterVerses, setChapterVerses]     = useState<BibleVerse[]>([])

  // Modo pesquisa
  const [searchQuery, setSearchQuery]       = useState("")
  const [searchResults, setSearchResults]   = useState<BibleVerse[]>([])
  const [isSearching, setIsSearching]       = useState(false)
  const [hasSearched, setHasSearched]       = useState(false)

  const [favorites, setFavorites] = useState<FavoriteVerse[]>([])
  const [readingProgress, setReadingProgress] = useState<{ bookAbbrev: string; bookName: string; chapter: number; verse?: number; version: string } | null>(null)
  const [showReaderModal, setShowReaderModal] = useState(false)
  const [showBookSelector, setShowBookSelector] = useState(false)
  const [showChapterSelector, setShowChapterSelector] = useState(false)

  const fadeAnimation = useRef(new Animated.Value(0)).current
  const availableVersions = getAvailableVersions()
  const currentVerse = historyIndex >= 0 ? verseHistory[historyIndex] : null
  const selectedBookData = books.find((b) => b.abbrev === selectedBook)
  const chapterCount = selectedBookData?.chapters.length ?? 1

  useEffect(() => {
    Animated.timing(fadeAnimation, { toValue: 1, duration: 1000, useNativeDriver: true }).start()
    loadFavorites().then(setFavorites)
    AsyncStorage.getItem(PHOTO_KEY).then(setPhotoUri)
    AsyncStorage.getItem("simpleBible:progress").then((raw) => {
      if (!raw) return
      try {
        const prog = JSON.parse(raw)
        const bookList = getBooksFromVersion(prog.version ?? "ACF")
        const bookData = bookList.find((b: any) => b.abbrev === prog.bookAbbrev)
        if (bookData) {
          setReadingProgress({
            bookAbbrev: prog.bookAbbrev,
            bookName: bookData.book,
            chapter: prog.chapter,
            verse: prog.verse,
            version: prog.version ?? "ACF",
          })
        }
      } catch {}
    })
    const init = async () => {
      const verse = getRandomVerse("ACF")
      const daily = getDailyVerse("ACF")
      if (verse) { setVerseHistory([verse]); setHistoryIndex(0) }
      setDailyVerse(daily)
      const bookList = getBooksFromVersion("ACF")
      setBooks(bookList)
      if (bookList.length > 0) setSelectedBook(bookList[0].abbrev)
    }
    init()
  }, [])

  useEffect(() => {
    const bookList = getBooksFromVersion(selectedVersion)
    setBooks(bookList)
    if (bookList.length > 0) setSelectedBook(bookList[0].abbrev)
    const daily = getDailyVerse(selectedVersion)
    setDailyVerse(daily)
  }, [selectedVersion])

  useEffect(() => {
    if (mode === "navigate" && selectedBook) {
      const verses = getChapterVerses(selectedVersion, selectedBook, selectedChapter)
      setChapterVerses(verses)
    }
  }, [mode, selectedBook, selectedChapter, selectedVersion])

  const loadNewVerse = () => {
    setIsLoading(true)
    setTimeout(() => {
      const verse = getRandomVerse(selectedVersion)
      if (verse) {
        const newHistory = verseHistory.slice(0, historyIndex + 1)
        newHistory.push(verse)
        setVerseHistory(newHistory)
        setHistoryIndex(newHistory.length - 1)
      }
      setIsLoading(false)
    }, 400)
  }

  const handlePrev = () => {
    if (historyIndex > 0) setHistoryIndex(historyIndex - 1)
  }

  const handleNext = () => {
    if (historyIndex < verseHistory.length - 1) {
      setHistoryIndex(historyIndex + 1)
    } else {
      loadNewVerse()
    }
  }

  const handleSearch = () => {
    if (!searchQuery.trim()) return
    setIsSearching(true)
    setHasSearched(false)
    setTimeout(() => {
      const results = searchVerses(selectedVersion, searchQuery)
      setSearchResults(results)
      setHasSearched(true)
      setIsSearching(false)
    }, 300)
  }

  const toggleFavorite = async (verse: BibleVerse) => {
    const isFav = favorites.some(
      (f) => f.book === verse.book && f.chapter === verse.chapter && f.verse === verse.verse
    )
    let updated: FavoriteVerse[]
    if (isFav) {
      updated = favorites.filter(
        (f) => !(f.book === verse.book && f.chapter === verse.chapter && f.verse === verse.verse)
      )
    } else {
      updated = [...favorites, { ...verse, savedAt: new Date().toISOString() }]
    }
    setFavorites(updated)
    await saveFavoritesToStorage(updated)
  }

  const isFavorite = (verse: BibleVerse | null) => {
    if (!verse) return false
    return favorites.some(
      (f) => f.book === verse.book && f.chapter === verse.chapter && f.verse === verse.verse
    )
  }

  const handleShare = async (verse: BibleVerse | null) => {
    if (!verse) return
    const ref = formatReference(verse.book, verse.chapter, verse.verse)
    await Share.share({ message: `"${verse.text}" — ${ref} (${verse.version})` })
  }

  const handleReset = () => {
    Alert.alert("Redefinir dados", "Tem certeza que deseja redefinir suas informações?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Confirmar", onPress: onReset, style: "destructive" },
    ])
  }

  const pickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted) return
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      quality: 1,
    })
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0]
      setCropperImage({ uri: asset.uri, width: asset.width, height: asset.height })
      setShowCropper(true)
    }
  }

  const handleCropConfirm = async (uri: string) => {
    setPhotoUri(uri)
    await AsyncStorage.setItem(PHOTO_KEY, uri)
    setShowCropper(false)
    setCropperImage(null)
  }

  const handleCropCancel = () => {
    setShowCropper(false)
    setCropperImage(null)
  }

  const removePhoto = async () => {
    setPhotoUri(null)
    await AsyncStorage.removeItem(PHOTO_KEY)
  }

  const handleAvatarPress = () => {
    const buttons: any[] = [{ text: "Escolher da galeria", onPress: pickPhoto }]
    if (photoUri) buttons.push({ text: "Remover foto", onPress: removePhoto, style: "destructive" })
    buttons.push({ text: "Cancelar", style: "cancel" })
    Alert.alert("Foto de perfil", "Como deseja continuar?", buttons)
  }

  const displayVerse = mode === "daily" ? dailyVerse : currentVerse

  const renderModeButtons = () => (
    <View style={styles.modeGrid}>
      {(["random", "daily", "navigate", "search"] as Mode[]).map((m) => {
          const icons: Record<Mode, string> = { random: "shuffle", daily: "today", navigate: "explore", search: "search" }
          const labels: Record<Mode, string> = { random: "Aleatório", daily: "Diário", navigate: "Navegar", search: "Buscar" }
          return (
            <TouchableOpacity
              key={m}
              style={[styles.modeBtn, mode === m && styles.modeBtnActive]}
              onPress={() => setMode(m)}
              activeOpacity={0.7}
            >
              <MaterialIcons name={icons[m] as any} size={20} color={mode === m ? "#FFFFFF" : "#1D4ED8"} />
              <Text style={[styles.modeBtnText, mode === m && styles.modeBtnTextActive]}>{labels[m]}</Text>
            </TouchableOpacity>
          )
        })}
    </View>
  )

  const renderVerseActions = (verse: BibleVerse | null) => verse ? (
    <View style={styles.verseActions}>
      <TouchableOpacity style={styles.actionItem} onPress={() => toggleFavorite(verse)} activeOpacity={0.7}>
        <View style={styles.actionBtn}>
          <MaterialIcons name={isFavorite(verse) ? "favorite" : "favorite-border"} size={20} color={isFavorite(verse) ? "#EF4444" : "#1D4ED8"} />
        </View>
        <Text style={styles.actionLabel}>Favorito</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionItem} onPress={() => handleShare(verse)} activeOpacity={0.7}>
        <View style={styles.actionBtn}>
          <MaterialIcons name="share" size={20} color="#1D4ED8" />
        </View>
        <Text style={styles.actionLabel}>Compartilhar</Text>
      </TouchableOpacity>
    </View>
  ) : null

  const renderRandomMode = () => (
    <View style={styles.verseCard}>
      <LinearGradient colors={["rgba(30,64,175,0.06)", "transparent"]} style={StyleSheet.absoluteFillObject} />
      <View style={styles.verseHeader}>
        <View style={[styles.verseIconBadge, { backgroundColor: "#1D4ED8" }]}>
          <MaterialIcons name="menu-book" size={18} color="#FFFFFF" />
        </View>
        <Text style={[styles.verseTitle, { color: "#1D4ED8" }]}>Versículo do Momento</Text>
      </View>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      ) : currentVerse ? (
        <>
          <Text style={styles.verseText}>"{currentVerse.text}"</Text>
          <View style={styles.verseReference}>
            <Text style={styles.referenceText}>{formatReference(currentVerse.book, currentVerse.chapter, currentVerse.verse)}</Text>
            <Text style={styles.versionText}>Versão: {availableVersions.find((v) => v.abbreviation === selectedVersion)?.name}</Text>
          </View>
          {renderVerseActions(currentVerse)}
        </>
      ) : null}
      <View style={styles.navRow}>
        <TouchableOpacity style={[styles.navBtn, historyIndex <= 0 && styles.btnDisabled]} onPress={handlePrev} disabled={historyIndex <= 0} activeOpacity={0.7}>
          <MaterialIcons name="chevron-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.newVerseButton, isLoading && styles.btnDisabled]} onPress={loadNewVerse} disabled={isLoading} activeOpacity={0.8}>
          <LinearGradient colors={["#0EA5E9", "#2563EB"]} style={styles.buttonGradient}>
            <MaterialIcons name="shuffle" size={18} color="#FFFFFF" />
            <Text style={styles.buttonText}>Novo Versículo</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navBtn} onPress={handleNext} activeOpacity={0.7}>
          <MaterialIcons name="chevron-right" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  )

  const renderDailyMode = () => (
    <View style={styles.verseCard}>
      <LinearGradient colors={["rgba(234,179,8,0.08)", "transparent"]} style={StyleSheet.absoluteFillObject} />
      <View style={styles.verseHeader}>
        <View style={[styles.verseIconBadge, { backgroundColor: "#D97706" }]}>
          <MaterialIcons name="today" size={18} color="#FFFFFF" />
        </View>
        <Text style={[styles.verseTitle, { color: "#92400E" }]}>Versículo do Dia</Text>
      </View>
      {dailyVerse ? (
        <>
          <Text style={styles.verseText}>"{dailyVerse.text}"</Text>
          <View style={styles.verseReference}>
            <Text style={styles.referenceText}>{formatReference(dailyVerse.book, dailyVerse.chapter, dailyVerse.verse)}</Text>
            <Text style={styles.versionText}>Versão: {availableVersions.find((v) => v.abbreviation === selectedVersion)?.name}</Text>
          </View>
          {renderVerseActions(dailyVerse)}
        </>
      ) : <ActivityIndicator size="large" color="#D97706" />}
    </View>
  )

  const renderNavigateMode = () => {
    return (
      <View style={styles.verseCard}>
        <View style={styles.verseHeader}>
          <View style={[styles.verseIconBadge, { backgroundColor: "#059669" }]}>
            <MaterialIcons name="explore" size={18} color="#FFFFFF" />
          </View>
          <Text style={[styles.verseTitle, { color: "#065F46" }]}>Navegar</Text>
          {onReaderPress && (
            <TouchableOpacity
              style={styles.openReaderBtn}
              onPress={() => onReaderPress?.({ book: selectedBook, chapter: selectedChapter, version: selectedVersion })}
              activeOpacity={0.8}
            >
              <MaterialIcons name="menu-book" size={14} color="#FFFFFF" />
              <Text style={styles.openReaderBtnText}>Abrir no Leitor</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.navigateSelectors}>
          <TouchableOpacity style={styles.pickerContainer} onPress={() => setShowBookSelector(true)} activeOpacity={0.7}>
            <Text style={styles.pickerLabel}>Livro</Text>
            <View style={styles.pickerValueRow}>
              <Text style={styles.pickerValueText} numberOfLines={1}>{selectedBookData?.book ?? "Selecionar"}</Text>
              <MaterialIcons name="expand-more" size={20} color="#374151" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.pickerContainer} onPress={() => setShowChapterSelector(true)} activeOpacity={0.7}>
            <Text style={styles.pickerLabel}>Capítulo</Text>
            <View style={styles.pickerValueRow}>
              <Text style={styles.pickerValueText}>Capítulo {selectedChapter}</Text>
              <MaterialIcons name="expand-more" size={20} color="#374151" />
            </View>
          </TouchableOpacity>
        </View>
        {chapterVerses.length > 0 ? (
          <ScrollView style={styles.chapterScroll} nestedScrollEnabled>
            {chapterVerses.map((v) => (
              <TouchableOpacity key={v.verse} style={styles.chapterVerseRow} onLongPress={() => handleShare(v)} activeOpacity={0.8}>
                <Text style={styles.chapterVerseNum}>{v.verse}</Text>
                <Text style={styles.chapterVerseText}>{v.text}</Text>
                <TouchableOpacity onPress={() => toggleFavorite(v)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <MaterialIcons name={isFavorite(v) ? "favorite" : "favorite-border"} size={16} color={isFavorite(v) ? "#EF4444" : "#D1D5DB"} />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : <ActivityIndicator size="large" color="#059669" style={{ marginVertical: 24 }} />}
      </View>
    )
  }

  const renderSearchMode = () => (
    <View style={styles.verseCard}>
      <View style={styles.verseHeader}>
        <View style={[styles.verseIconBadge, { backgroundColor: "#7C3AED" }]}>
          <MaterialIcons name="search" size={18} color="#FFFFFF" />
        </View>
        <Text style={[styles.verseTitle, { color: "#4C1D95" }]}>Pesquisar</Text>
      </View>
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar palavra ou trecho..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchBtn} onPress={handleSearch} activeOpacity={0.8}>
          <LinearGradient colors={["#7C3AED", "#5B21B6"]} style={styles.searchBtnGradient}>
            <MaterialIcons name="search" size={20} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
      {isSearching && <ActivityIndicator size="large" color="#7C3AED" style={{ marginVertical: 24 }} />}
      {hasSearched && !isSearching && (
        searchResults.length === 0 ? (
          <Text style={styles.emptyText}>Nenhum resultado encontrado.</Text>
        ) : (
          <>
            <Text style={styles.resultsCount}>{searchResults.length} resultado(s)</Text>
            <ScrollView style={styles.chapterScroll} nestedScrollEnabled>
              {searchResults.map((v, i) => (
                <TouchableOpacity key={i} style={styles.chapterVerseRow} onPress={() => handleShare(v)} activeOpacity={0.8}>
                  <View style={styles.searchResultHeader}>
                    <Text style={styles.searchResultRef}>{formatReference(v.book, v.chapter, v.verse)}</Text>
                    <TouchableOpacity onPress={() => toggleFavorite(v)}>
                      <MaterialIcons name={isFavorite(v) ? "favorite" : "favorite-border"} size={16} color={isFavorite(v) ? "#EF4444" : "#D1D5DB"} />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.chapterVerseText}>{v.text}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )
      )}
    </View>
  )

  return (
    <View style={styles.container}>
      <CelestialBackground />
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <Animated.View style={[styles.content, { opacity: fadeAnimation }]}>
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

            {/* Header */}
            <View style={styles.headerCard}>
              <TouchableOpacity style={styles.avatarCircle} onPress={handleAvatarPress} activeOpacity={0.75}>
                {photoUri ? (
                  <Image source={{ uri: photoUri }} style={styles.avatarImage} />
                ) : (
                  <Text style={styles.avatarEmoji}>{DEFAULT_AVATAR_EMOJI}</Text>
                )}
                <View style={styles.avatarEditBadge}>
                  <MaterialIcons name="edit" size={10} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
              <View style={styles.headerText}>
                <Text style={styles.greeting}>Olá, {userData.name}! 🙏</Text>
                <Text style={styles.date}>{getCurrentTime()}</Text>
              </View>
            </View>

            {/* Version Selector */}
            <View style={styles.versionSection}>
              <Text style={[styles.versionSectionLabel, isDarkMode && styles.versionSectionLabelDark]}>Versão da Bíblia</Text>
              <TouchableOpacity style={styles.versionCard} onPress={() => setShowVersionSelector(true)} activeOpacity={0.8}>
                <View style={styles.versionIconBadge}>
                  <MaterialIcons name="menu-book" size={18} color="#FFFFFF" />
                </View>
                <Text style={styles.versionCardText} numberOfLines={1}>
                  {availableVersions.find((v) => v.abbreviation === selectedVersion)?.name} ({selectedVersion})
                </Text>
                <MaterialIcons name="expand-more" size={22} color="#1E293B" />
              </TouchableOpacity>
            </View>

            {/* Mode Buttons */}
            {renderModeButtons()}

            {/* Content by Mode */}
            {mode === "random"   && renderRandomMode()}
            {mode === "daily"    && renderDailyMode()}
            {mode === "navigate" && renderNavigateMode()}
            {mode === "search"   && renderSearchMode()}

            {/* Footer */}
            <View style={styles.footerText}>
              <View style={styles.footerPill}>
                <View style={styles.footerIconBadge}>
                  <MaterialIcons name="auto-awesome" size={14} color="#FFFFFF" />
                </View>
                <View>
                  <Text style={styles.footerMessage}>Que a palavra de Deus ilumine seu dia! ✨</Text>
                  <Text style={styles.footerChurch}>Igreja: {userData.church}</Text>
                </View>
              </View>
            </View>

            <AppFooter onPrivacyPress={onPrivacyPress} />
          </ScrollView>

          <BottomTabBar
            activeKey={
              showFavorites ? "favorites" : showNotificationSettings ? "notifications" : showUserInfo ? "settings" : showReaderModal ? "reader" : undefined
            }
            onReaderPress={onReaderPress ? () => (readingProgress ? setShowReaderModal(true) : onReaderPress?.()) : undefined}
            onFavoritesPress={() => setShowFavorites(true)}
            onNotificationsPress={() => setShowNotificationSettings(true)}
            onSettingsPress={() => setShowUserInfo(true)}
          />
        </Animated.View>
      </SafeAreaView>

      {/* Modal Favoritos */}
      <Modal visible={showFavorites} animationType="slide" onRequestClose={() => setShowFavorites(false)}>
        <SafeAreaView style={styles.modalSafe} edges={["top"]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>❤️ Favoritos</Text>
            <TouchableOpacity onPress={() => setShowFavorites(false)}>
              <MaterialIcons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>
          {favorites.length === 0 ? (
            <View style={styles.emptyFavContainer}>
              <MaterialIcons name="favorite-border" size={48} color="#D1D5DB" />
              <Text style={styles.emptyText}>Nenhum favorito ainda.</Text>
              <Text style={styles.emptySubText}>Toque no coração em um versículo para salvar.</Text>
            </View>
          ) : (
            <FlatList
              data={favorites}
              keyExtractor={(item, i) => `${item.book}-${item.chapter}-${item.verse}-${i}`}
              contentContainerStyle={{ padding: 16, gap: 12 }}
              renderItem={({ item }) => (
                <View style={styles.favCard}>
                  <Text style={styles.favVerse}>"{item.text}"</Text>
                  <View style={styles.favRefRow}>
                    <Text style={styles.favRef}>{formatReference(item.book, item.chapter, item.verse)} ({item.version})</Text>
                    <View style={styles.favActions}>
                      <TouchableOpacity onPress={() => handleShare(item)} style={{ marginRight: 8 }}>
                        <MaterialIcons name="share" size={18} color="#6B7280" />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => toggleFavorite(item)}>
                        <MaterialIcons name="delete-outline" size={18} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}
            />
          )}
        </SafeAreaView>
      </Modal>

      {/* Modal de configuração de notificações */}
      <NotificationSettingsModal visible={showNotificationSettings} onClose={() => setShowNotificationSettings(false)} />

      {/* Modal de seleção de versão */}
      <VersionSelectorModal
        visible={showVersionSelector}
        versions={availableVersions}
        selectedVersion={selectedVersion}
        onSelect={setSelectedVersion}
        onClose={() => setShowVersionSelector(false)}
      />

      {/* Modal de seleção de livro */}
      <SelectModal
        visible={showBookSelector}
        title="Selecionar livro"
        options={books.map((b) => ({ label: b.book, value: b.abbrev }))}
        selectedValue={selectedBook}
        onSelect={(v) => { setSelectedBook(v); setSelectedChapter(1) }}
        onClose={() => setShowBookSelector(false)}
      />

      {/* Modal de seleção de capítulo */}
      <SelectModal
        visible={showChapterSelector}
        title="Selecionar capítulo"
        layout="grid"
        options={Array.from({ length: chapterCount }, (_, i) => i + 1).map((c) => ({ label: String(c), value: c }))}
        selectedValue={selectedChapter}
        onSelect={setSelectedChapter}
        onClose={() => setShowChapterSelector(false)}
      />

      {/* Modal de configurações do usuário */}
      <Modal visible={showUserInfo} animationType="slide" onRequestClose={() => setShowUserInfo(false)} transparent>
        <View style={styles.userModalBackdrop}>
          <View style={styles.userModalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>⚙️ Configurações</Text>
              <TouchableOpacity onPress={() => setShowUserInfo(false)}>
                <MaterialIcons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>
            <View style={styles.userModalBody}>
              <View style={styles.userInfoRow}>
                <MaterialIcons name="person" size={18} color="#374151" />
                <Text style={styles.userModalText}>{userData.name}</Text>
              </View>
              <View style={styles.userInfoRow}>
                <MaterialIcons name="church" size={18} color="#374151" />
                <Text style={styles.userModalText}>{userData.church}</Text>
              </View>
              <TouchableOpacity style={styles.resetButton} onPress={handleReset} activeOpacity={0.7}>
                <MaterialIcons name="delete-outline" size={16} color="#EF4444" />
                <Text style={styles.resetButtonText}>Redefinir dados</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de recorte de foto */}
      <PhotoCropperModal
        visible={showCropper}
        imageUri={cropperImage?.uri ?? null}
        imageWidth={cropperImage?.width ?? null}
        imageHeight={cropperImage?.height ?? null}
        onCancel={handleCropCancel}
        onConfirm={handleCropConfirm}
      />

      {/* Modal de retomada de leitura */}
      <Modal visible={showReaderModal} animationType="fade" transparent onRequestClose={() => setShowReaderModal(false)}>
        <TouchableOpacity style={styles.readerModalBackdrop} activeOpacity={1} onPress={() => setShowReaderModal(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.readerModalCard} onPress={() => {}}>
            {/* Header */}
            <LinearGradient colors={["#1D4ED8", "#0EA5E9"]} style={styles.readerModalHeader}>
              <Text style={styles.readerModalLabel}>LEITURA</Text>
              <Text style={styles.readerModalTitle}>Como deseja continuar?</Text>
            </LinearGradient>

            <View style={styles.readerModalBody}>
              {readingProgress?.verse ? (
                <>
                  {/* Continuar do versículo marcado */}
                  <TouchableOpacity
                    style={[styles.readerOption, styles.readerOptionPrimary]}
                    onPress={() => {
                      setShowReaderModal(false)
                      onReaderPress?.({ book: readingProgress.bookAbbrev, chapter: readingProgress.chapter, verse: readingProgress.verse, version: readingProgress.version })
                    }}
                  >
                    <MaterialIcons name="bookmark" size={18} color="#1D4ED8" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.readerOptionTitle}>Continuar do versículo marcado</Text>
                      <Text style={styles.readerOptionSub}>{readingProgress.bookName} {readingProgress.chapter}:{readingProgress.verse}</Text>
                    </View>
                  </TouchableOpacity>

                  {/* Abrir o capítulo do início */}
                  <TouchableOpacity
                    style={styles.readerOption}
                    onPress={() => {
                      setShowReaderModal(false)
                      onReaderPress?.({ book: readingProgress.bookAbbrev, chapter: readingProgress.chapter, version: readingProgress.version })
                    }}
                  >
                    <MaterialIcons name="menu-book" size={18} color="#6B7280" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.readerOptionTitle}>Abrir o capítulo do início</Text>
                      <Text style={styles.readerOptionSub}>{readingProgress.bookName} — Capítulo {readingProgress.chapter}</Text>
                    </View>
                  </TouchableOpacity>
                </>
              ) : readingProgress ? (
                <>
                  {/* Continuar do capítulo */}
                  <TouchableOpacity
                    style={[styles.readerOption, styles.readerOptionPrimary]}
                    onPress={() => {
                      setShowReaderModal(false)
                      onReaderPress?.({ book: readingProgress.bookAbbrev, chapter: readingProgress.chapter, version: readingProgress.version })
                    }}
                  >
                    <MaterialIcons name="play-arrow" size={18} color="#1D4ED8" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.readerOptionTitle}>Continuar do capítulo {readingProgress.chapter}</Text>
                      <Text style={styles.readerOptionSub}>{readingProgress.bookName}</Text>
                    </View>
                  </TouchableOpacity>

                  {/* Já li, ir para o próximo */}
                  <TouchableOpacity
                    style={styles.readerOption}
                    onPress={() => {
                      setShowReaderModal(false)
                      onReaderPress?.({ book: readingProgress.bookAbbrev, chapter: readingProgress.chapter + 1, version: readingProgress.version })
                    }}
                  >
                    <MaterialIcons name="skip-next" size={18} color="#6B7280" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.readerOptionTitle}>Já li o cap. {readingProgress.chapter}, ir para o {readingProgress.chapter + 1}</Text>
                      <Text style={styles.readerOptionSub}>{readingProgress.bookName}</Text>
                    </View>
                  </TouchableOpacity>
                </>
              ) : null}

              {/* Começar do início */}
              <TouchableOpacity
                style={styles.readerOptionReset}
                onPress={() => { setShowReaderModal(false); onReaderPress?.() }}
              >
                <Text style={styles.readerOptionResetText}>Começar do início (Gênesis 1)</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: "transparent" },
  safeArea:      { flex: 1, backgroundColor: "transparent" },
  content:       { flex: 1, backgroundColor: "transparent" },
  scrollView:    { flex: 1, backgroundColor: "transparent" },
  scrollContent: { padding: 16, gap: 14, backgroundColor: "transparent" },

  headerCard: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "rgba(255,255,255,0.92)", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 10, elevation: 4 },
  avatarCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#1E3A8A", justifyContent: "center", alignItems: "center", overflow: "visible" },
  avatarImage: { width: 44, height: 44, borderRadius: 22 },
  avatarEmoji: { fontSize: 22 },
  avatarEditBadge: { position: "absolute", bottom: -2, right: -2, width: 18, height: 18, borderRadius: 9, backgroundColor: "#1D4ED8", justifyContent: "center", alignItems: "center", borderWidth: 2, borderColor: "#FFFFFF" },
  headerText: { flex: 1 },
  greeting: { fontSize: 19, fontWeight: "700", color: "#1E293B" },
  date: { fontSize: 12, color: "#64748B", marginTop: 2 },

  userModalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center", padding: 20 },
  userModalCard: { width: "100%", maxWidth: 400, backgroundColor: "#FFFFFF", borderRadius: 24, overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 20 },
  userModalBody: { padding: 20, gap: 14 },
  userInfoRow: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#F9FAFB", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: "#E5E7EB" },
  userModalText: { color: "#1F2937", fontSize: 14, fontWeight: "500" },
  resetButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: "rgba(239,68,68,0.1)", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: "rgba(239,68,68,0.25)", marginTop: 4 },
  resetButtonText: { color: "#EF4444", fontSize: 14, fontWeight: "600" },

  // Version card — solid card with label above
  versionSection: { gap: 8 },
  versionSectionLabel: { color: "#1D4ED8", fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.8, marginLeft: 6, textShadowColor: "rgba(255,255,255,0.7)", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 },
  versionSectionLabelDark: { color: "#FFFFFF", textShadowColor: "rgba(0,0,0,0.4)" },
  versionCard: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "rgba(255,255,255,0.94)", borderRadius: 18, paddingHorizontal: 12, paddingVertical: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 3 },
  versionIconBadge: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#1D4ED8", justifyContent: "center", alignItems: "center" },
  versionCardText: { flex: 1, fontSize: 15, fontWeight: "600", color: "#1E293B" },

  // Mode row — 2x2 grid, light cards with the active one solid blue
  modeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  modeBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, width: "48%", minHeight: 52, paddingVertical: 14, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.92)", borderWidth: 1, borderColor: "rgba(255,255,255,0.6)", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 2 },
  modeBtnActive: { backgroundColor: "#1D4ED8", borderColor: "#1D4ED8", shadowOpacity: 0.28, shadowRadius: 10, elevation: 5 },
  modeBtnText: { color: "#1E293B", fontSize: 13, fontWeight: "600" },
  modeBtnTextActive: { color: "#FFFFFF", fontWeight: "700" },

  verseCard: { backgroundColor: "rgba(255,255,255,0.97)", borderRadius: 26, padding: 22, overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.22, shadowRadius: 20, elevation: 12 },
  verseHeader: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 20, flexWrap: "wrap" },
  verseIconBadge: { width: 36, height: 36, borderRadius: 18, justifyContent: "center", alignItems: "center" },
  openReaderBtn: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#059669", borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5 },
  openReaderBtnText: { color: "#FFFFFF", fontSize: 11, fontWeight: "600" },
  verseTitle: { fontSize: 15, fontWeight: "700" },
  loadingContainer: { alignItems: "center", paddingVertical: 32, gap: 10 },
  loadingText: { color: "#6B7280", fontSize: 14 },
  verseText: { fontSize: 18, fontWeight: "600", color: "#1E293B", lineHeight: 28, textAlign: "center", marginBottom: 18 },
  verseReference: { alignItems: "center", gap: 4, marginBottom: 14 },
  referenceText: { fontSize: 15, fontWeight: "bold", color: "#3B82F6" },
  versionText: { fontSize: 12, color: "#6B7280" },
  verseActions: { flexDirection: "row", justifyContent: "center", gap: 28, marginBottom: 20 },
  actionItem: { alignItems: "center", gap: 6 },
  actionBtn: { padding: 11, backgroundColor: "#FFFFFF", borderRadius: 24, borderWidth: 1.5, borderColor: "#DBEAFE" },
  actionLabel: { fontSize: 11, fontWeight: "600", color: "#475569" },

  navRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  navBtn: { backgroundColor: "rgba(30,64,175,0.75)", borderRadius: 14, width: 48, height: 48, justifyContent: "center", alignItems: "center" },
  newVerseButton: { flex: 1, borderRadius: 14, overflow: "hidden", elevation: 4 },
  buttonGradient: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 14, gap: 8 },
  buttonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "600" },
  btnDisabled: { opacity: 0.5 },

  navigateSelectors: { gap: 10, marginBottom: 12 },
  pickerContainer: { backgroundColor: "#F9FAFB", borderRadius: 12, borderWidth: 1, borderColor: "#E5E7EB", paddingHorizontal: 12 },
  pickerLabel: { fontSize: 11, fontWeight: "600", color: "#6B7280", marginTop: 8, marginLeft: 2, textTransform: "uppercase", letterSpacing: 0.5 },
  pickerValueRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 12 },
  pickerValueText: { fontSize: 15, fontWeight: "600", color: "#1F2937", flex: 1, marginRight: 6 },
  chapterScroll: { maxHeight: 320 },
  chapterVerseRow: { flexDirection: "row", alignItems: "flex-start", gap: 8, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  chapterVerseNum: { fontSize: 11, fontWeight: "bold", color: "#3B82F6", minWidth: 22, marginTop: 2 },
  chapterVerseText: { flex: 1, fontSize: 14, color: "#374151", lineHeight: 20 },

  searchRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  searchInput: { flex: 1, height: 44, backgroundColor: "#F9FAFB", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 12, paddingHorizontal: 14, fontSize: 15, color: "#1F2937" },
  searchBtn: { width: 44, height: 44, borderRadius: 12, overflow: "hidden" },
  searchBtnGradient: { flex: 1, justifyContent: "center", alignItems: "center" },
  resultsCount: { fontSize: 12, color: "#6B7280", marginBottom: 8 },
  searchResultHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  searchResultRef: { fontSize: 12, fontWeight: "bold", color: "#3B82F6" },
  emptyText: { textAlign: "center", color: "#6B7280", marginTop: 16 },

  // Footer — light pill with icon badge
  footerText: { alignItems: "center" },
  footerPill: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "rgba(255,255,255,0.9)", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 2 },
  footerIconBadge: { width: 28, height: 28, borderRadius: 14, backgroundColor: "#1E3A8A", justifyContent: "center", alignItems: "center" },
  footerMessage: { fontSize: 13, fontWeight: "600", color: "#1E293B" },
  footerChurch: { fontSize: 11, color: "#64748B", marginTop: 1 },

  modalSafe: { flex: 1, backgroundColor: "#FFFFFF" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: "#E5E7EB" },
  modalTitle: { fontSize: 18, fontWeight: "bold", color: "#1F2937" },
  emptyFavContainer: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  emptySubText: { fontSize: 13, color: "#9CA3AF", textAlign: "center" },
  favCard: { backgroundColor: "#F9FAFB", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#E5E7EB" },
  favVerse: { fontSize: 15, color: "#374151", fontStyle: "italic", lineHeight: 22, marginBottom: 10 },
  favRefRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  favRef: { fontSize: 12, fontWeight: "bold", color: "#3B82F6" },
  favActions: { flexDirection: "row", alignItems: "center" },

  // Reader modal
  readerModalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center", padding: 20 },
  readerModalCard: { width: "100%", maxWidth: 400, backgroundColor: "#FFFFFF", borderRadius: 24, overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 20 },
  readerModalHeader: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 },
  readerModalLabel: { color: "rgba(255,255,255,0.7)", fontSize: 10, fontWeight: "700", letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 },
  readerModalTitle: { color: "#FFFFFF", fontSize: 20, fontWeight: "700" },
  readerModalBody: { padding: 16, gap: 8 },
  readerOption: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#F9FAFB", borderRadius: 14, paddingHorizontal: 14, paddingVertical: 13, borderWidth: 1, borderColor: "#E5E7EB" },
  readerOptionPrimary: { backgroundColor: "#EFF6FF", borderColor: "#BFDBFE" },
  readerOptionTitle: { fontSize: 14, fontWeight: "600", color: "#111827" },
  readerOptionSub: { fontSize: 12, color: "#6B7280", marginTop: 1 },
  readerOptionReset: { alignItems: "center", paddingVertical: 10 },
  readerOptionResetText: { fontSize: 13, color: "#9CA3AF" },
})
