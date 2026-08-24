import * as Notifications from "expo-notifications"
import { Platform } from "react-native"
import { getDailyVerse } from "../data/bible-verses"
import { formatReference } from "./dateUtils"

const DAILY_VERSE_CHANNEL_ID = "daily-verse"
const DAILY_VERSE_IDENTIFIER = "daily-verse-notification"
const CLOSING_LINE = "Deus te ama, e sempre está ao seu lado! 🙏"
const NOTIFICATION_HOUR = 8
const NOTIFICATION_MINUTE = 0

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
    shouldShowAlert: true,
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

function nextTriggerDate(): Date {
  const now = new Date()
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate(), NOTIFICATION_HOUR, NOTIFICATION_MINUTE, 0, 0)
  if (next.getTime() <= now.getTime()) {
    next.setDate(next.getDate() + 1)
  }
  return next
}

export async function scheduleDailyVerseNotification(versionAbbr = "NVI"): Promise<void> {
  const granted = await requestNotificationPermissionsAsync()
  if (!granted) return

  await ensureAndroidChannelAsync()
  await Notifications.cancelScheduledNotificationAsync(DAILY_VERSE_IDENTIFIER).catch(() => {})

  const triggerDate = nextTriggerDate()
  const verse = getDailyVerse(versionAbbr, triggerDate)
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
    identifier: DAILY_VERSE_IDENTIFIER,
    content: {
      title: `📖 ${formatReference(verse.book, verse.chapter, verse.verse)}`,
      body: `"${verse.text}"\n\n${CLOSING_LINE}`,
      data,
      ...(Platform.OS === "android" ? { channelId: DAILY_VERSE_CHANNEL_ID } : {}),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerDate,
    },
  })
}

export function isDailyVerseNotificationData(data: unknown): data is DailyVerseNotificationData {
  return !!data && typeof data === "object" && (data as any).type === "daily-verse"
}
