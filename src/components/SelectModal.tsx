import React, { useState } from "react"
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { MaterialIcons } from "@expo/vector-icons"

export interface SelectModalOption<T extends string | number> {
  label: string
  value: T
}

interface SelectModalProps<T extends string | number> {
  visible: boolean
  title: string
  options: SelectModalOption<T>[]
  selectedValue: T
  onSelect: (value: T) => void
  onClose: () => void
  layout?: "list" | "grid"
  searchable?: boolean
  searchPlaceholder?: string
}

const normalize = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()

export function SelectModal<T extends string | number>({
  visible,
  title,
  options,
  selectedValue,
  onSelect,
  onClose,
  layout = "list",
  searchable = false,
  searchPlaceholder = "Buscar...",
}: SelectModalProps<T>) {
  const [search, setSearch] = useState("")

  const handleSelect = (value: T) => {
    onSelect(value)
    onClose()
  }

  const query = normalize(search.trim())
  const filteredOptions = query === "" ? options : options.filter((o) => normalize(o.label).includes(query))

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      transparent
      onShow={() => setSearch("")}
    >
      <View style={styles.backdrop}>
        <TouchableOpacity style={StyleSheet.absoluteFillObject} activeOpacity={1} onPress={onClose} />
        <SafeAreaView style={styles.sheet} edges={["bottom"]}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <MaterialIcons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          {searchable && (
            <View style={styles.searchBox}>
              <MaterialIcons name="search" size={18} color="#9CA3AF" />
              <TextInput
                style={styles.searchInput}
                placeholder={searchPlaceholder}
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
          )}

          {searchable && filteredOptions.length === 0 && (
            <Text style={styles.emptyText}>Nenhum resultado encontrado.</Text>
          )}

          {layout === "grid" ? (
            <FlatList
              data={filteredOptions}
              numColumns={4}
              keyExtractor={(item) => String(item.value)}
              style={styles.listMaxHeight}
              contentContainerStyle={styles.gridContent}
              columnWrapperStyle={styles.gridRow}
              renderItem={({ item }) => {
                const selected = item.value === selectedValue
                return (
                  <TouchableOpacity
                    style={[styles.chip, selected && styles.chipSelected]}
                    onPress={() => handleSelect(item.value)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{item.label}</Text>
                  </TouchableOpacity>
                )
              }}
            />
          ) : (
            <FlatList
              data={filteredOptions}
              keyExtractor={(item) => String(item.value)}
              style={styles.listMaxHeight}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => {
                const selected = item.value === selectedValue
                return (
                  <TouchableOpacity
                    style={[styles.row, selected && styles.rowSelected]}
                    onPress={() => handleSelect(item.value)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.rowText, selected && styles.rowTextSelected]} numberOfLines={1}>{item.label}</Text>
                    {selected && <MaterialIcons name="check-circle" size={20} color="#1D4ED8" />}
                  </TouchableOpacity>
                )
              }}
            />
          )}
        </SafeAreaView>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  sheet: { backgroundColor: "#FFFFFF", borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 8, maxHeight: "75%" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, paddingBottom: 12 },
  title: { fontSize: 18, fontWeight: "bold", color: "#1F2937" },
  searchBox: { flexDirection: "row", alignItems: "center", gap: 8, marginHorizontal: 16, marginBottom: 12, backgroundColor: "#F3F4F6", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8 },
  searchInput: { flex: 1, fontSize: 15, color: "#111827", padding: 0 },
  emptyText: { textAlign: "center", color: "#9CA3AF", fontSize: 14, paddingVertical: 24 },
  listMaxHeight: { flexGrow: 0 },
  listContent: { paddingHorizontal: 16, paddingBottom: 16, gap: 6 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#F9FAFB", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, borderWidth: 1, borderColor: "#E5E7EB" },
  rowSelected: { backgroundColor: "#EFF6FF", borderColor: "#BFDBFE" },
  rowText: { fontSize: 14, fontWeight: "500", color: "#1F2937", flex: 1, marginRight: 8 },
  rowTextSelected: { color: "#1D4ED8", fontWeight: "700" },
  gridContent: { paddingHorizontal: 12, paddingBottom: 16 },
  gridRow: { gap: 8, marginBottom: 8 },
  chip: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#F9FAFB", borderRadius: 12, paddingVertical: 14, borderWidth: 1, borderColor: "#E5E7EB" },
  chipSelected: { backgroundColor: "#1D4ED8", borderColor: "#1D4ED8" },
  chipText: { fontSize: 14, fontWeight: "600", color: "#1F2937" },
  chipTextSelected: { color: "#FFFFFF" },
})
