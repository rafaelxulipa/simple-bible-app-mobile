import React, { useRef, useState } from "react"
import { Modal, View, Text, TouchableOpacity, StyleSheet, Animated, PanResponder, ActivityIndicator, Dimensions } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { MaterialIcons } from "@expo/vector-icons"
import { ImageManipulator, SaveFormat } from "expo-image-manipulator"

interface PhotoCropperModalProps {
  visible: boolean
  imageUri: string | null
  imageWidth: number | null
  imageHeight: number | null
  onCancel: () => void
  onConfirm: (croppedUri: string) => void
}

const VIEWPORT = Math.min(280, Dimensions.get("window").width - 80)
const OUTPUT_SIZE = 512
const MIN_ZOOM = 1
const MAX_ZOOM = 4
const ZOOM_STEP = 0.4

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function distanceBetween(touches: { pageX: number; pageY: number }[]) {
  const [a, b] = touches
  return Math.hypot(a.pageX - b.pageX, a.pageY - b.pageY)
}

export function PhotoCropperModal({ visible, imageUri, imageWidth, imageHeight, onCancel, onConfirm }: PhotoCropperModalProps) {
  const [zoomValue, setZoomValue] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)

  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current
  const zoom = useRef(new Animated.Value(1)).current
  const lastPan = useRef({ x: 0, y: 0 })
  const lastZoom = useRef(1)
  const initialPinchDistance = useRef<number | null>(null)

  const imgWidth = imageWidth || 1
  const imgHeight = imageHeight || 1
  const baseScale = VIEWPORT / Math.min(imgWidth, imgHeight)

  const maxPanFor = (currentZoom: number) => {
    const effectiveScale = baseScale * currentZoom
    const dispW = imgWidth * effectiveScale
    const dispH = imgHeight * effectiveScale
    return {
      x: Math.max(0, (dispW - VIEWPORT) / 2),
      y: Math.max(0, (dispH - VIEWPORT) / 2),
    }
  }

  const applyZoom = (nextZoom: number) => {
    const clamped = clamp(nextZoom, MIN_ZOOM, MAX_ZOOM)
    zoom.setValue(clamped)
    setZoomValue(clamped)
    const maxPan = maxPanFor(clamped)
    const nx = clamp(lastPan.current.x, -maxPan.x, maxPan.x)
    const ny = clamp(lastPan.current.y, -maxPan.y, maxPan.y)
    pan.setValue({ x: nx, y: ny })
    lastPan.current = { x: nx, y: ny }
    lastZoom.current = clamped
  }

  const resetState = () => {
    pan.setValue({ x: 0, y: 0 })
    zoom.setValue(1)
    setZoomValue(1)
    lastPan.current = { x: 0, y: 0 }
    lastZoom.current = 1
    initialPinchDistance.current = null
  }

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        lastPan.current = { x: (pan.x as any).__getValue(), y: (pan.y as any).__getValue() }
        lastZoom.current = (zoom as any).__getValue()
        initialPinchDistance.current = null
      },
      onPanResponderMove: (evt, gestureState) => {
        const touches = evt.nativeEvent.touches
        if (touches.length === 2) {
          const dist = distanceBetween(touches as any)
          if (initialPinchDistance.current == null) {
            initialPinchDistance.current = dist
            lastZoom.current = (zoom as any).__getValue()
            return
          }
          const rawZoom = lastZoom.current * (dist / initialPinchDistance.current)
          const clampedZoom = clamp(rawZoom, MIN_ZOOM, MAX_ZOOM)
          zoom.setValue(clampedZoom)
          setZoomValue(clampedZoom)
          const maxPan = maxPanFor(clampedZoom)
          const nx = clamp((pan.x as any).__getValue(), -maxPan.x, maxPan.x)
          const ny = clamp((pan.y as any).__getValue(), -maxPan.y, maxPan.y)
          pan.setValue({ x: nx, y: ny })
        } else if (touches.length === 1) {
          if (initialPinchDistance.current != null) {
            lastPan.current = { x: (pan.x as any).__getValue(), y: (pan.y as any).__getValue() }
            initialPinchDistance.current = null
          }
          const maxPan = maxPanFor(lastZoom.current)
          const nx = clamp(lastPan.current.x + gestureState.dx, -maxPan.x, maxPan.x)
          const ny = clamp(lastPan.current.y + gestureState.dy, -maxPan.y, maxPan.y)
          pan.setValue({ x: nx, y: ny })
        }
      },
      onPanResponderRelease: () => {
        lastPan.current = { x: (pan.x as any).__getValue(), y: (pan.y as any).__getValue() }
        lastZoom.current = (zoom as any).__getValue()
        initialPinchDistance.current = null
      },
      onPanResponderTerminate: () => {
        lastPan.current = { x: (pan.x as any).__getValue(), y: (pan.y as any).__getValue() }
        lastZoom.current = (zoom as any).__getValue()
        initialPinchDistance.current = null
      },
    })
  ).current

  const handleCancel = () => {
    resetState()
    onCancel()
  }

  const handleConfirm = async () => {
    if (!imageUri || !imageWidth || !imageHeight) return
    setIsProcessing(true)
    try {
      const currentZoom = lastZoom.current
      const effectiveScale = baseScale * currentZoom
      const dispW = imageWidth * effectiveScale
      const dispH = imageHeight * effectiveScale
      const cropSize = VIEWPORT / effectiveScale

      let originX = (dispW - VIEWPORT) / 2 / effectiveScale - lastPan.current.x / effectiveScale
      let originY = (dispH - VIEWPORT) / 2 / effectiveScale - lastPan.current.y / effectiveScale
      originX = clamp(originX, 0, Math.max(0, imageWidth - cropSize))
      originY = clamp(originY, 0, Math.max(0, imageHeight - cropSize))

      const context = ImageManipulator.manipulate(imageUri)
      const rendered = await context
        .crop({ originX, originY, width: cropSize, height: cropSize })
        .resize({ width: OUTPUT_SIZE, height: OUTPUT_SIZE })
        .renderAsync()
      const result = await rendered.saveAsync({ format: SaveFormat.JPEG, compress: 0.85 })
      resetState()
      onConfirm(result.uri)
    } finally {
      setIsProcessing(false)
    }
  }

  const dispWidth = imgWidth * baseScale
  const dispHeight = imgHeight * baseScale

  return (
    <Modal visible={visible} animationType="fade" onRequestClose={handleCancel} transparent>
      <View style={styles.backdrop}>
        <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
          <View style={styles.header}>
            <Text style={styles.title}>Ajustar foto</Text>
          </View>

          <View style={styles.viewportWrapper}>
            <View style={[styles.viewport, { width: VIEWPORT, height: VIEWPORT }]}>
              {imageUri && (
                <Animated.Image
                  source={{ uri: imageUri }}
                  style={{
                    width: dispWidth,
                    height: dispHeight,
                    transform: [{ translateX: pan.x }, { translateY: pan.y }, { scale: zoom }],
                  }}
                  {...panResponder.panHandlers}
                />
              )}
            </View>
            <View pointerEvents="none" style={[styles.viewportBorder, { width: VIEWPORT, height: VIEWPORT, borderRadius: VIEWPORT / 2 }]} />
          </View>

          <View style={styles.zoomRow}>
            <TouchableOpacity
              style={styles.zoomButton}
              onPress={() => applyZoom(zoomValue - ZOOM_STEP)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialIcons name="remove" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.zoomButton}
              onPress={() => applyZoom(zoomValue + ZOOM_STEP)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialIcons name="add" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel} disabled={isProcessing}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm} disabled={isProcessing}>
              {isProcessing ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.confirmButtonText}>Confirmar</Text>}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.85)" },
  container: { flex: 1, justifyContent: "space-between" },
  header: { alignItems: "center", paddingTop: 16, paddingBottom: 8 },
  title: { fontSize: 16, fontWeight: "700", color: "#FFFFFF" },
  viewportWrapper: { flex: 1, justifyContent: "center", alignItems: "center" },
  viewport: { overflow: "hidden", backgroundColor: "#111827", justifyContent: "center", alignItems: "center" },
  viewportBorder: { position: "absolute", borderWidth: 3, borderColor: "#FFFFFF" },
  zoomRow: { flexDirection: "row", justifyContent: "center", gap: 16, paddingBottom: 16 },
  zoomButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  footer: { flexDirection: "row", gap: 12, paddingHorizontal: 20, paddingBottom: 12 },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: { color: "#E5E7EB", fontSize: 15, fontWeight: "600" },
  confirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#1D4ED8",
    alignItems: "center",
    justifyContent: "center",
  },
  confirmButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
})
