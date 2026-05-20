import React from "react"
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme } from "react-native"
import { MaterialIcons } from "@expo/vector-icons"

interface AppFooterProps {
  onPrivacyPress?: () => void
}

export function AppFooter({ onPrivacyPress }: AppFooterProps) {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === "dark"

  return (
    <View style={styles.container}>
      {/* Política de Privacidade */}
      <TouchableOpacity
        style={[styles.privacyButton, isDark ? styles.privacyButtonDark : styles.privacyButtonLight]}
        onPress={onPrivacyPress}
        activeOpacity={0.7}
      >
        <MaterialIcons name="shield" size={14} color={isDark ? "#D1D5DB" : "#6B7280"} />
        <Text style={[styles.privacyText, isDark ? styles.privacyTextDark : styles.privacyTextLight]}>
          Política de Privacidade
        </Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 10,
  },
  privacyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
  },
  privacyButtonLight: {
    backgroundColor: "rgba(255,255,255,0.82)",
    borderColor: "#D1D5DB",
  },
  privacyButtonDark: {
    backgroundColor: "rgba(31,41,55,0.9)",
    borderColor: "#4B5563",
  },
  privacyText: {
    fontSize: 12,
    fontWeight: "500",
  },
  privacyTextLight: {
    color: "#4B5563",
  },
  privacyTextDark: {
    color: "#D1D5DB",
  },
})
