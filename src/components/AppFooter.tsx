import React from "react"
import { View, Text, TouchableOpacity, StyleSheet } from "react-native"
import { MaterialIcons } from "@expo/vector-icons"

interface AppFooterProps {
  onPrivacyPress?: () => void
}

export function AppFooter({ onPrivacyPress }: AppFooterProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.privacyButton} onPress={onPrivacyPress} activeOpacity={0.6} hitSlop={{ top: 8, bottom: 8 }}>
        <MaterialIcons name="shield" size={13} color="rgba(255,255,255,0.75)" />
        <Text style={styles.privacyText}>Política de Privacidade</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    paddingTop: 4,
    paddingBottom: 12,
  },
  privacyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  privacyText: {
    fontSize: 12,
    fontWeight: "500",
    color: "rgba(255,255,255,0.75)",
  },
})
