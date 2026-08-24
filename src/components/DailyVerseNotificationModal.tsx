import React from "react"
import { Modal, View, Text, TouchableOpacity, StyleSheet, Share } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { MaterialIcons } from "@expo/vector-icons"
import type { DailyVerseNotificationData } from "../utils/notifications"
import { formatReference } from "../utils/dateUtils"

interface DailyVerseNotificationModalProps {
  visible: boolean
  verse: DailyVerseNotificationData | null
  onClose: () => void
}

export const DailyVerseNotificationModal: React.FC<DailyVerseNotificationModalProps> = ({ visible, verse, onClose }) => {
  if (!verse) return null

  const reference = formatReference(verse.book, verse.chapter, verse.verse)

  const handleShare = async () => {
    await Share.share({ message: `"${verse.text}" — ${reference} (${verse.version})` })
  }

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <TouchableOpacity style={StyleSheet.absoluteFillObject} activeOpacity={1} onPress={onClose} />
        <View style={styles.card}>
          <LinearGradient colors={["#1D4ED8", "#0EA5E9"]} style={styles.header}>
            <View style={styles.headerIcon}>
              <MaterialIcons name="notifications-active" size={22} color="#FFFFFF" />
            </View>
            <Text style={styles.headerLabel}>VERSÍCULO DO DIA</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <MaterialIcons name="close" size={22} color="rgba(255,255,255,0.9)" />
            </TouchableOpacity>
          </LinearGradient>

          <View style={styles.body}>
            <Text style={styles.verseText}>"{verse.text}"</Text>
            <Text style={styles.reference}>{reference}</Text>
            <Text style={styles.version}>Versão: {verse.version}</Text>

            <View style={styles.divider} />

            <View style={styles.blessingPill}>
              <Text style={styles.blessing}>Deus te ama, e sempre está ao seu lado! 🙏</Text>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity style={styles.actionBtn} onPress={handleShare} activeOpacity={0.8}>
                <MaterialIcons name="share" size={18} color="#1D4ED8" />
                <Text style={styles.actionBtnText}>Compartilhar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.8}>
                <Text style={styles.closeBtnText}>Fechar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center", padding: 20 },
  card: { width: "100%", maxWidth: 400, backgroundColor: "#FFFFFF", borderRadius: 24, overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 20 },
  header: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 18, paddingVertical: 16 },
  headerIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.2)", justifyContent: "center", alignItems: "center" },
  headerLabel: { flex: 1, color: "#FFFFFF", fontSize: 13, fontWeight: "700", letterSpacing: 1.5 },
  body: { padding: 22, alignItems: "center" },
  verseText: { fontSize: 17, fontWeight: "500", color: "#374151", lineHeight: 26, fontStyle: "italic", textAlign: "center", marginBottom: 14 },
  reference: { fontSize: 15, fontWeight: "bold", color: "#3B82F6" },
  version: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  divider: { width: "100%", height: 1, backgroundColor: "#F3F4F6", marginVertical: 18 },
  blessingPill: { backgroundColor: "#EFF6FF", borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1, borderColor: "#BFDBFE", marginBottom: 20 },
  blessing: { fontSize: 14, fontWeight: "600", color: "#1D4ED8", textAlign: "center" },
  actions: { flexDirection: "row", gap: 10, width: "100%" },
  actionBtn: { flex: 1, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 6, borderRadius: 14, paddingVertical: 12, backgroundColor: "#EFF6FF", borderWidth: 1, borderColor: "#BFDBFE" },
  actionBtnText: { color: "#1D4ED8", fontSize: 14, fontWeight: "600" },
  closeBtn: { flex: 1, justifyContent: "center", alignItems: "center", borderRadius: 14, paddingVertical: 12, backgroundColor: "#1D4ED8" },
  closeBtnText: { color: "#FFFFFF", fontSize: 14, fontWeight: "600" },
})
