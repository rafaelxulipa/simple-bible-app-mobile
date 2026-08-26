import React, { useState } from "react"
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from "react-native"
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

const normalize = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()

export const VersionSelectorModal: React.FC<VersionSelectorModalProps> = ({ visible, versions, selectedVersion, onSelect, onClose }) => {
  const [search, setSearch] = useState("")

  const query = normalize(search.trim())
  const filteredVersions =
    query === ""
      ? versions
      : versions.filter((v) => normalize(v.name).includes(query) || normalize(v.abbreviation).includes(query))

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} transparent onShow={() => setSearch("")}>
      <View style={styles.backdrop}>
        <TouchableOpacity style={StyleSheet.absoluteFillObject} activeOpacity={1} onPress={onClose} />
        <SafeAreaView style={styles.sheet} edges={["bottom"]}>
          <View style={styles.header}>
            <Text style={styles.title}>Versão da Bíblia</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <MaterialIcons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          <View style={styles.searchBox}>
            <MaterialIcons name="search" size={18} color="#9CA3AF" />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar versão..."
              placeholderTextColor="#9CA3AF"
              value={search}
              onChangeText={setSearch}
              autoCorrect={false}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch("")} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <MaterialIcons name="close" size={16} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>

          {filteredVersions.length === 0 && <Text style={styles.emptyText}>Nenhuma versão encontrada.</Text>}

          <ScrollView style={styles.listScroll} contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
            {filteredVersions.map((v) => {
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
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  sheet: { backgroundColor: "#FFFFFF", borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 8, maxHeight: "80%" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, paddingBottom: 12 },
  title: { fontSize: 18, fontWeight: "bold", color: "#1F2937" },
  searchBox: { flexDirection: "row", alignItems: "center", gap: 8, marginHorizontal: 16, marginBottom: 12, backgroundColor: "#F3F4F6", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8 },
  searchInput: { flex: 1, fontSize: 15, color: "#111827", padding: 0 },
  emptyText: { textAlign: "center", color: "#9CA3AF", fontSize: 14, paddingVertical: 24 },
  listScroll: { flexGrow: 0 },
  list: { paddingHorizontal: 16, paddingBottom: 12, gap: 8 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#F9FAFB", borderRadius: 16, paddingHorizontal: 14, paddingVertical: 14, borderWidth: 1, borderColor: "#E5E7EB" },
  rowSelected: { backgroundColor: "#EFF6FF", borderColor: "#BFDBFE" },
  badge: { width: 32, height: 32, borderRadius: 16, backgroundColor: "#EFF6FF", justifyContent: "center", alignItems: "center" },
  badgeSelected: { backgroundColor: "#1D4ED8" },
  rowName: { fontSize: 14, fontWeight: "600", color: "#1F2937" },
  rowNameSelected: { color: "#1D4ED8" },
  rowAbbr: { fontSize: 12, color: "#6B7280", marginTop: 1 },
})
