import React from "react"
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme } from "react-native"
import { MaterialIcons } from "@expo/vector-icons"

type TabKey = "reader" | "favorites" | "notifications" | "settings"

interface BottomTabBarProps {
  activeKey?: TabKey
  onReaderPress?: () => void
  onFavoritesPress?: () => void
  onNotificationsPress?: () => void
  onSettingsPress?: () => void
}

export function BottomTabBar({ activeKey, onReaderPress, onFavoritesPress, onNotificationsPress, onSettingsPress }: BottomTabBarProps) {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === "dark"

  const allActions: { key: TabKey; icon: React.ComponentProps<typeof MaterialIcons>["name"]; label: string; onPress?: () => void }[] = [
    { key: "reader", icon: "menu-book", label: "Bíblia", onPress: onReaderPress },
    { key: "favorites", icon: "favorite", label: "Favoritos", onPress: onFavoritesPress },
    { key: "notifications", icon: "notifications", label: "Notificações", onPress: onNotificationsPress },
    { key: "settings", icon: "settings", label: "Configurações", onPress: onSettingsPress },
  ]
  const actions = allActions.filter((a) => a.onPress)

  if (actions.length === 0) return null

  return (
    <View style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}>
      {actions.map((action) => {
        const active = action.key === activeKey
        return (
          <TouchableOpacity
            key={action.label}
            style={styles.item}
            onPress={action.onPress}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
          >
            <View style={[styles.iconWrap, isDark ? styles.iconWrapDark : styles.iconWrapLight, active && styles.iconWrapActive]}>
              <MaterialIcons name={action.icon} size={20} color={active ? "#FFFFFF" : isDark ? "#93C5FD" : "#1D4ED8"} />
            </View>
            <Text style={[styles.label, isDark ? styles.labelDark : styles.labelLight, active && styles.labelActive]}>
              {action.label}
            </Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 10,
    paddingHorizontal: 8,
    borderTopWidth: 1,
  },
  containerLight: {
    backgroundColor: "rgba(255,255,255,0.97)",
    borderTopColor: "rgba(0,0,0,0.08)",
  },
  containerDark: {
    backgroundColor: "rgba(17,24,39,0.97)",
    borderTopColor: "rgba(255,255,255,0.08)",
  },
  item: {
    alignItems: "center",
    gap: 4,
    flex: 1,
    paddingBottom: 8,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  iconWrapLight: {
    backgroundColor: "#EFF6FF",
  },
  iconWrapDark: {
    backgroundColor: "rgba(59,130,246,0.15)",
  },
  iconWrapActive: {
    backgroundColor: "#1D4ED8",
  },
  label: {
    fontSize: 10,
    fontWeight: "600",
  },
  labelLight: {
    color: "#4B5563",
  },
  labelDark: {
    color: "#D1D5DB",
  },
  labelActive: {
    color: "#1D4ED8",
    fontWeight: "700",
  },
})
