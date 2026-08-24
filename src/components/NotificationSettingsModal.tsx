import React, { useEffect, useState } from "react"
import { Modal, View, Text, TouchableOpacity, StyleSheet, Switch, ScrollView } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { MaterialIcons } from "@expo/vector-icons"
import { SelectModal } from "./SelectModal"
import {
  getNotificationSettings,
  saveNotificationSettings,
  scheduleDailyVerseNotification,
  cancelDailyVerseNotification,
  MAX_NOTIFICATION_TIMES,
  type NotificationSettings,
  type NotificationTime,
} from "../utils/notifications"

type EditingSlot = { index: number; field: "hour" | "minute" }

interface NotificationSettingsModalProps {
  visible: boolean
  onClose: () => void
}

const HOURS = Array.from({ length: 24 }, (_, i) => i)
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5)

const timesEqual = (a: NotificationTime[], b: NotificationTime[]) =>
  a.length === b.length && a.every((t, i) => t.hour === b[i].hour && t.minute === b[i].minute)

export const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({ visible, onClose }) => {
  const [settings, setSettings] = useState<NotificationSettings | null>(null)
  const [draftTimes, setDraftTimes] = useState<NotificationTime[]>([])
  const [justSaved, setJustSaved] = useState(false)
  const [editingSlot, setEditingSlot] = useState<EditingSlot | null>(null)

  useEffect(() => {
    if (visible) {
      getNotificationSettings().then((s) => {
        setSettings(s)
        setDraftTimes(s.times)
        setJustSaved(false)
      })
    }
  }, [visible])

  const toggleEnabled = async (enabled: boolean) => {
    if (!settings) return
    const next = { ...settings, enabled }
    setSettings(next)
    await saveNotificationSettings(next)
    if (enabled && next.times.length > 0) {
      await scheduleDailyVerseNotification()
    } else {
      await cancelDailyVerseNotification()
    }
  }

  const updateDraftTime = (index: number, patch: Partial<NotificationTime>) => {
    setDraftTimes((prev) => prev.map((t, i) => (i === index ? { ...t, ...patch } : t)))
    setJustSaved(false)
  }

  const addDraftTime = () => {
    if (draftTimes.length >= MAX_NOTIFICATION_TIMES) return
    setDraftTimes((prev) => [...prev, { hour: 12, minute: 0 }])
    setJustSaved(false)
  }

  const removeDraftTime = (index: number) => {
    if (draftTimes.length <= 1) return
    setDraftTimes((prev) => prev.filter((_, i) => i !== index))
    setJustSaved(false)
  }

  const isDirty = settings ? !timesEqual(settings.times, draftTimes) : false

  const saveTimes = async () => {
    if (!settings) return
    const next = { ...settings, times: draftTimes }
    setSettings(next)
    await saveNotificationSettings(next)
    if (next.enabled && next.times.length > 0) {
      await scheduleDailyVerseNotification()
    } else {
      await cancelDailyVerseNotification()
    }
    setJustSaved(true)
  }

  const formattedTimes = draftTimes
    .map((t) => `${String(t.hour).padStart(2, "0")}:${String(t.minute).padStart(2, "0")}`)
    .join(", ")

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.header}>
          <Text style={styles.title}>🔔 Notificações</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <MaterialIcons name="close" size={24} color="#374151" />
          </TouchableOpacity>
        </View>

        {settings && (
          <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowLabel}>Receber versículo aleatório</Text>
                <Text style={styles.rowSub}>Uma notificação com um versículo sorteado a cada horário</Text>
              </View>
              <Switch
                value={settings.enabled}
                onValueChange={toggleEnabled}
                trackColor={{ false: "#D1D5DB", true: "#1D4ED8" }}
                thumbColor="#FFFFFF"
              />
            </View>

            {settings.enabled && (
              <View style={styles.timesSection}>
                <Text style={styles.sectionLabel}>Horários ({draftTimes.length}/{MAX_NOTIFICATION_TIMES})</Text>

                {draftTimes.map((time, index) => (
                  <View key={index} style={styles.timeRow}>
                    <View style={styles.timePicker}>
                      <Text style={styles.pickerLabel}>Hora</Text>
                      <TouchableOpacity style={styles.timeValueBtn} onPress={() => setEditingSlot({ index, field: "hour" })} activeOpacity={0.7}>
                        <Text style={styles.timeValueText}>{String(time.hour).padStart(2, "0")}</Text>
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.timeSeparator}>:</Text>
                    <View style={styles.timePicker}>
                      <Text style={styles.pickerLabel}>Minuto</Text>
                      <TouchableOpacity style={styles.timeValueBtn} onPress={() => setEditingSlot({ index, field: "minute" })} activeOpacity={0.7}>
                        <Text style={styles.timeValueText}>{String(time.minute).padStart(2, "0")}</Text>
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                      style={[styles.removeBtn, draftTimes.length <= 1 && styles.removeBtnDisabled]}
                      onPress={() => removeDraftTime(index)}
                      disabled={draftTimes.length <= 1}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <MaterialIcons name="delete-outline" size={20} color={draftTimes.length <= 1 ? "#D1D5DB" : "#EF4444"} />
                    </TouchableOpacity>
                  </View>
                ))}

                {draftTimes.length < MAX_NOTIFICATION_TIMES && (
                  <TouchableOpacity style={styles.addBtn} onPress={addDraftTime} activeOpacity={0.7}>
                    <MaterialIcons name="add" size={18} color="#1D4ED8" />
                    <Text style={styles.addBtnText}>Adicionar horário</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[styles.saveBtn, !isDirty && styles.saveBtnDisabled]}
                  onPress={saveTimes}
                  disabled={!isDirty}
                  activeOpacity={0.8}
                >
                  <MaterialIcons name={justSaved ? "check" : "save"} size={18} color="#FFFFFF" />
                  <Text style={styles.saveBtnText}>{justSaved ? "Horários salvos" : "Salvar horários"}</Text>
                </TouchableOpacity>
              </View>
            )}

            <Text style={styles.hint}>
              {settings.enabled
                ? `Você vai receber um versículo aleatório às ${formattedTimes} todos os dias.`
                : "As notificações estão desativadas. Ative para escolher os horários."}
            </Text>
          </ScrollView>
        )}
      </SafeAreaView>

      <SelectModal
        visible={editingSlot !== null}
        title={editingSlot?.field === "minute" ? "Selecionar minuto" : "Selecionar hora"}
        layout="grid"
        options={(editingSlot?.field === "minute" ? MINUTES : HOURS).map((n) => ({ label: String(n).padStart(2, "0"), value: n }))}
        selectedValue={editingSlot ? draftTimes[editingSlot.index]?.[editingSlot.field] ?? 0 : 0}
        onSelect={(value) => {
          if (editingSlot) updateDraftTime(editingSlot.index, { [editingSlot.field]: value })
        }}
        onClose={() => setEditingSlot(null)}
      />
    </Modal>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFFFF" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: "#E5E7EB" },
  title: { fontSize: 18, fontWeight: "bold", color: "#1F2937" },
  body: { flex: 1 },
  bodyContent: { padding: 20, gap: 20, paddingBottom: 40 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#F9FAFB", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#E5E7EB" },
  rowLabel: { fontSize: 15, fontWeight: "600", color: "#1F2937" },
  rowSub: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  timesSection: { gap: 10 },
  sectionLabel: { fontSize: 12, fontWeight: "700", color: "#6B7280", textTransform: "uppercase", letterSpacing: 0.5 },
  timeRow: { flexDirection: "row", alignItems: "flex-end", gap: 6 },
  timePicker: { flex: 1, backgroundColor: "#F9FAFB", borderRadius: 12, borderWidth: 1, borderColor: "#E5E7EB", paddingHorizontal: 8, overflow: "hidden" },
  pickerLabel: { fontSize: 11, fontWeight: "600", color: "#6B7280", marginTop: 6, marginLeft: 4, textTransform: "uppercase", letterSpacing: 0.5 },
  timeValueBtn: { paddingVertical: 12 },
  timeValueText: { fontSize: 16, fontWeight: "600", color: "#1F2937" },
  timeSeparator: { fontSize: 20, fontWeight: "bold", color: "#374151", marginBottom: 12 },
  removeBtn: { padding: 10 },
  removeBtnDisabled: { opacity: 0.4 },
  addBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, borderRadius: 12, paddingVertical: 10, backgroundColor: "#EFF6FF", borderWidth: 1, borderColor: "#BFDBFE", borderStyle: "dashed" },
  addBtnText: { color: "#1D4ED8", fontSize: 14, fontWeight: "600" },
  saveBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 12, paddingVertical: 13, backgroundColor: "#1D4ED8", marginTop: 4 },
  saveBtnDisabled: { backgroundColor: "#93C5FD" },
  saveBtnText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
  hint: { fontSize: 13, color: "#6B7280", textAlign: "center", lineHeight: 20 },
})
