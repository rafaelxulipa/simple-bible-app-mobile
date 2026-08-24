import * as Notifications from "expo-notifications"
import { Platform } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { getRandomVerse } from "../data/bible-verses"
import { formatReference } from "./dateUtils"

const DAILY_VERSE_CHANNEL_ID = "daily-verse"
const DAILY_VERSE_IDENTIFIER = "daily-verse-notification"
const CLOSING_LINE = "Deus te ama, e sempre está ao seu lado! 🙏"
const SETTINGS_KEY = "simpleBible:notificationSettings"
export const MAX_NOTIFICATION_TIMES = 4

export interface NotificationTime {
  hour: number
  minute: number
}

export interface NotificationSettings {
  enabled: boolean
  times: NotificationTime[]
}

const DEFAULT_SETTINGS: NotificationSettings = { enabled: true, times: [{ hour: 8, minute: 0 }] }

export async function getNotificationSettings(): Promise<NotificationSettings> {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY)
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS
  } catch {
    return DEFAULT_SETTINGS
  }
}

export async function saveNotificationSettings(settings: NotificationSettings): Promise<void> {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}

export interface DailyVerseNotificationData {
  [key: string]: unknown
  type: "daily-verse"
  book: string
  chapter: number
  verse: number
  text: string
  version: string
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
})

async function ensureAndroidChannelAsync() {
  if (Platform.OS !== "android") return
  await Notifications.setNotificationChannelAsync(DAILY_VERSE_CHANNEL_ID, {
    name: "Versículo do dia",
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
  })
}

export async function requestNotificationPermissionsAsync(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync()
  if (current.granted) return true
  const requested = await Notifications.requestPermissionsAsync()
  return requested.granted
}

function nextTriggerDate(hour: number, minute: number): Date {
  const now = new Date()
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, 0, 0)
  if (next.getTime() <= now.getTime()) {
    next.setDate(next.getDate() + 1)
  }
  return next
}

function identifierForSlot(index: number): string {
  return `${DAILY_VERSE_IDENTIFIER}-${index}`
}

export async function cancelDailyVerseNotification(): Promise<void> {
  await Promise.all(
    Array.from({ length: MAX_NOTIFICATION_TIMES }, (_, index) =>
      Notifications.cancelScheduledNotificationAsync(identifierForSlot(index)).catch(() => {})
    )
  )
}

export async function scheduleDailyVerseNotification(versionAbbr = "NVI"): Promise<void> {
  const settings = await getNotificationSettings()
  await cancelDailyVerseNotification()
  if (!settings.enabled || settings.times.length === 0) return

  const granted = await requestNotificationPermissionsAsync()
  if (!granted) return

  await ensureAndroidChannelAsync()

  await Promise.all(
    settings.times.slice(0, MAX_NOTIFICATION_TIMES).map(async (time, index) => {
      const verse = getRandomVerse(versionAbbr)
      if (!verse) return

      const data: DailyVerseNotificationData = {
        type: "daily-verse",
        book: verse.book,
        chapter: verse.chapter,
        verse: verse.verse,
        text: verse.text,
        version: verse.version,
      }

      await Notifications.scheduleNotificationAsync({
        identifier: identifierForSlot(index),
        content: {
          title: `📖 ${formatReference(verse.book, verse.chapter, verse.verse)}`,
          body: `"${verse.text}"\n\n${CLOSING_LINE}`,
          data,
          ...(Platform.OS === "android" ? { channelId: DAILY_VERSE_CHANNEL_ID } : {}),
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: nextTriggerDate(time.hour, time.minute),
        },
      })
    })
  )
}

export function isDailyVerseNotificationData(data: unknown): data is DailyVerseNotificationData {
  return !!data && typeof data === "object" && (data as any).type === "daily-verse"
}
