import React from "react"
import { Modal, View, Text, TouchableOpacity, StyleSheet, FlatList } from "react-native"
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
}

export function SelectModal<T extends string | number>({
  visible,
  title,
  options,
  selectedValue,
  onSelect,
  onClose,
  layout = "list",
}: SelectModalProps<T>) {
  const handleSelect = (value: T) => {
    onSelect(value)
    onClose()
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} transparent>
      <View style={styles.backdrop}>
        <TouchableOpacity style={StyleSheet.absoluteFillObject} activeOpacity={1} onPress={onClose} />
        <SafeAreaView style={styles.sheet} edges={["bottom"]}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <MaterialIcons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          {layout === "grid" ? (
            <FlatList
              data={options}
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
              data={options}
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
