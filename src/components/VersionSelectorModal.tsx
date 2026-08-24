import React from "react"
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { MaterialIcons } from "@expo/vector-icons"

interface VersionOption {
  abbreviation: string
  name: string
}

interface VersionSelectorModalProps {
  visible: boolean
  versions: VersionOption[]
  selectedVersion: string
  onSelect: (abbreviation: string) => void
  onClose: () => void
}

export const VersionSelectorModal: React.FC<VersionSelectorModalProps> = ({ visible, versions, selectedVersion, onSelect, onClose }) => {
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} transparent>
      <View style={styles.backdrop}>
        <TouchableOpacity style={StyleSheet.absoluteFillObject} activeOpacity={1} onPress={onClose} />
        <SafeAreaView style={styles.sheet} edges={["bottom"]}>
          <View style={styles.header}>
            <Text style={styles.title}>Versão da Bíblia</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <MaterialIcons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          <View style={styles.list}>
            {versions.map((v) => {
              const selected = v.abbreviation === selectedVersion
              return (
                <TouchableOpacity
                  key={v.abbreviation}
                  style={[styles.row, selected && styles.rowSelected]}
                  onPress={() => { onSelect(v.abbreviation); onClose() }}
                  activeOpacity={0.7}
                >
                  <View style={[styles.badge, selected && styles.badgeSelected]}>
                    <MaterialIcons name="menu-book" size={16} color={selected ? "#FFFFFF" : "#1D4ED8"} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.rowName, selected && styles.rowNameSelected]}>{v.name}</Text>
                    <Text style={styles.rowAbbr}>{v.abbreviation}</Text>
                  </View>
                  {selected && <MaterialIcons name="check-circle" size={22} color="#1D4ED8" />}
                </TouchableOpacity>
              )
            })}
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  sheet: { backgroundColor: "#FFFFFF", borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 8 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, paddingBottom: 12 },
  title: { fontSize: 18, fontWeight: "bold", color: "#1F2937" },
  list: { paddingHorizontal: 16, paddingBottom: 12, gap: 8 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#F9FAFB", borderRadius: 16, paddingHorizontal: 14, paddingVertical: 14, borderWidth: 1, borderColor: "#E5E7EB" },
  rowSelected: { backgroundColor: "#EFF6FF", borderColor: "#BFDBFE" },
  badge: { width: 32, height: 32, borderRadius: 16, backgroundColor: "#EFF6FF", justifyContent: "center", alignItems: "center" },
  badgeSelected: { backgroundColor: "#1D4ED8" },
  rowName: { fontSize: 14, fontWeight: "600", color: "#1F2937" },
  rowNameSelected: { color: "#1D4ED8" },
  rowAbbr: { fontSize: 12, color: "#6B7280", marginTop: 1 },
})
