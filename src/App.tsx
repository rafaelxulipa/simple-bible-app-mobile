import React, { useState, useEffect, useRef } from "react"
import { StatusBar } from "expo-status-bar"
import { AppState, AppStateStatus } from "react-native"
import * as Notifications from "expo-notifications"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { WelcomeForm } from "./components/WelcomeForm"
import { VerseDisplay } from "./components/VerseDisplay"
import { BibleReader } from "./components/BibleReader"
import { PrivacyScreen } from "./components/PrivacyScreen"
import { DailyVerseNotificationModal } from "./components/DailyVerseNotificationModal"
import type { UserData } from "./types"
import { saveUserData, getUserData, removeUserData } from "./utils/storage"
import { scheduleDailyVerseNotification, isDailyVerseNotificationData, type DailyVerseNotificationData } from "./utils/notifications"

type Screen = "welcome" | "verse" | "reader" | "privacy"

interface ReaderParams {
  book?: string
  chapter?: number
  verse?: number
  version?: string
}

const App: React.FC = () => {
  const [userData, setUserData]     = useState<UserData | null>(null)
  const [isLoading, setIsLoading]   = useState(true)
  const [screen, setScreen]         = useState<Screen>("welcome")
  const [readerParams, setReaderParams] = useState<ReaderParams | null>(null)
  const [notifiedVerse, setNotifiedVerse] = useState<DailyVerseNotificationData | null>(null)
  const responseListener = useRef<Notifications.EventSubscription | null>(null)

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const data = await getUserData()
        setUserData(data)
        if (data) setScreen("verse")
      } catch (error) {
        console.error("Erro ao carregar dados do usuário:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadUserData()
  }, [])

  useEffect(() => {
    if (!userData) return

    scheduleDailyVerseNotification()

    const handleAppStateChange = (state: AppStateStatus) => {
      if (state === "active") scheduleDailyVerseNotification()
    }
    const appStateSub = AppState.addEventListener("change", handleAppStateChange)

    const openVerseFromNotification = (data: unknown) => {
      if (isDailyVerseNotificationData(data)) setNotifiedVerse(data)
    }

    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) openVerseFromNotification(response.notification.request.content.data)
    })

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      openVerseFromNotification(response.notification.request.content.data)
    })

    return () => {
      appStateSub.remove()
      responseListener.current?.remove()
    }
  }, [userData])

  const handleSubmit = async (data: UserData) => {
    try {
      await saveUserData(data)
      setUserData(data)
      setScreen("verse")
    } catch (error) {
      console.error("Erro ao salvar dados do usuário:", error)
    }
  }

  const handleReset = async () => {
    try {
      await removeUserData()
      setUserData(null)
      setScreen("welcome")
    } catch (error) {
      console.error("Erro ao remover dados do usuário:", error)
    }
  }

  const handleOpenReader = (params?: ReaderParams) => {
    setReaderParams(params ?? null)
    setScreen("reader")
  }

  if (isLoading) return null

  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor="transparent" translucent />
      {screen === "reader" ? (
        <BibleReader
          onBack={() => setScreen(userData ? "verse" : "welcome")}
          initialBook={readerParams?.book}
          initialChapter={readerParams?.chapter}
          initialVerse={readerParams?.verse}
          initialVersion={readerParams?.version}
        />
      ) : screen === "privacy" ? (
        <PrivacyScreen onBack={() => setScreen(userData ? "verse" : "welcome")} />
      ) : screen === "verse" && userData ? (
        <VerseDisplay
          userData={userData}
          onReset={handleReset}
          onPrivacyPress={() => setScreen("privacy")}
          onReaderPress={(params) => handleOpenReader(params)}
        />
      ) : (
        <WelcomeForm
          onSubmit={handleSubmit}
          onPrivacyPress={() => setScreen("privacy")}
        />
      )}
      <DailyVerseNotificationModal
        visible={!!notifiedVerse}
        verse={notifiedVerse}
        onClose={() => setNotifiedVerse(null)}
      />
    </SafeAreaProvider>
  )
}

export default App
