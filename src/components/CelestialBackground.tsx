import React, { useEffect, useRef } from "react"
import { View, Animated, StyleSheet, useColorScheme, Dimensions } from "react-native"
import { LinearGradient } from "expo-linear-gradient"

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window")

// ── Estrelas ──────────────────────────────────────────────────────────
const NIGHT_STARS = [
  { top: "5%",  left: "8%",  size: 2, delay: 0    },
  { top: "10%", left: "22%", size: 1, delay: 500  },
  { top: "3%",  left: "38%", size: 3, delay: 1200 },
  { top: "7%",  left: "52%", size: 1, delay: 800  },
  { top: "13%", left: "65%", size: 2, delay: 2000 },
  { top: "4%",  left: "78%", size: 3, delay: 300  },
  { top: "9%",  left: "91%", size: 1, delay: 1500 },
  { top: "18%", left: "12%", size: 2, delay: 700  },
  { top: "22%", left: "29%", size: 1, delay: 2300 },
  { top: "16%", left: "45%", size: 2, delay: 1000 },
  { top: "25%", left: "58%", size: 3, delay: 400  },
  { top: "20%", left: "74%", size: 1, delay: 1800 },
  { top: "28%", left: "88%", size: 2, delay: 900  },
  { top: "33%", left: "5%",  size: 1, delay: 2500 },
  { top: "30%", left: "18%", size: 3, delay: 1100 },
  { top: "36%", left: "35%", size: 2, delay: 600  },
  { top: "38%", left: "50%", size: 1, delay: 1700 },
  { top: "32%", left: "63%", size: 2, delay: 2200 },
  { top: "40%", left: "80%", size: 3, delay: 200  },
  { top: "45%", left: "95%", size: 1, delay: 1400 },
  { top: "2%",  left: "55%", size: 4, delay: 0    },
  { top: "14%", left: "83%", size: 3, delay: 1600 },
  { top: "26%", left: "96%", size: 2, delay: 2800 },
  { top: "42%", left: "15%", size: 2, delay: 800  },
  { top: "48%", left: "28%", size: 1, delay: 2600 },
]

// ── Nuvem diurna ──────────────────────────────────────────────────────
function DayCloud({ x, y, opacity = 0.75, scale = 1 }: {
  x: number; y: number; opacity?: number; scale?: number
}) {
  return (
    <View style={{ position: "absolute", top: y, left: x, opacity, transform: [{ scale }] }}>
      <View style={[styles.cloudBase, { width: 160 * scale, height: 48 * scale }]} />
      <View style={[styles.cloudPuff, { width: 64 * scale, height: 64 * scale, bottom: 24 * scale, left: 16 * scale }]} />
      <View style={[styles.cloudPuff, { width: 88 * scale, height: 88 * scale, bottom: 28 * scale, left: 48 * scale }]} />
      <View style={[styles.cloudPuff, { width: 56 * scale, height: 52 * scale, bottom: 20 * scale, left: 108 * scale }]} />
    </View>
  )
}

// ── Nuvem noturna ─────────────────────────────────────────────────────
function NightCloud({ x, y, opacity = 0.5 }: { x: number; y: number; opacity?: number }) {
  return (
    <View style={{ position: "absolute", top: y, left: x, opacity }}>
      <View style={styles.nightCloudBase} />
      <View style={styles.nightCloudPuff1} />
      <View style={styles.nightCloudPuff2} />
    </View>
  )
}

// ── Estrela piscando ─────────────────────────────────────────────────
function TwinkleStar({ top, left, size, delay }: { top: string; left: string; size: number; delay: number }) {
  const anim = useRef(new Animated.Value(0.3)).current

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: 1, duration: 1500, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.2, duration: 1500, useNativeDriver: true }),
      ])
    )
    loop.start()
    return () => loop.stop()
  }, [])

  const topVal = parseFloat(top) / 100 * SCREEN_HEIGHT
  const leftVal = parseFloat(left) / 100 * SCREEN_WIDTH

  return (
    <Animated.View style={{
      position: "absolute",
      top: topVal,
      left: leftVal,
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: "#FFFFFF",
      opacity: anim,
    }} />
  )
}

// ── Céu diurno ────────────────────────────────────────────────────────
function DaySky() {
  const cloud1X = useRef(new Animated.Value(0)).current
  const cloud2X = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const c1 = Animated.loop(Animated.sequence([
      Animated.timing(cloud1X, { toValue: 30, duration: 8000, useNativeDriver: true }),
      Animated.timing(cloud1X, { toValue: 0,  duration: 8000, useNativeDriver: true }),
    ]))
    const c2 = Animated.loop(Animated.sequence([
      Animated.timing(cloud2X, { toValue: -20, duration: 12000, useNativeDriver: true }),
      Animated.timing(cloud2X, { toValue: 0,   duration: 12000, useNativeDriver: true }),
    ]))
    c1.start(); c2.start()
    return () => { c1.stop(); c2.stop() }
  }, [])

  return (
    <>
      <LinearGradient
        colors={["#0369a1", "#7dd3fc", "#fef3c7"]}
        locations={[0, 0.6, 1]}
        style={StyleSheet.absoluteFillObject}
      />
      {/* Sol */}
      <View style={styles.sun} />
      {/* Nuvens animadas */}
      <Animated.View style={{ transform: [{ translateX: cloud1X }] }}>
        <DayCloud x={-20}  y={SCREEN_HEIGHT * 0.05} opacity={0.75} scale={1.0} />
        <DayCloud x={SCREEN_WIDTH * 0.55} y={SCREEN_HEIGHT * 0.10} opacity={0.65} scale={0.8} />
        <DayCloud x={SCREEN_WIDTH * 0.25} y={SCREEN_HEIGHT * 0.20} opacity={0.80} scale={1.2} />
      </Animated.View>
      <Animated.View style={{ transform: [{ translateX: cloud2X }] }}>
        <DayCloud x={SCREEN_WIDTH * 0.75} y={SCREEN_HEIGHT * 0.32} opacity={0.55} scale={0.7} />
        <DayCloud x={-30}                 y={SCREEN_HEIGHT * 0.52} opacity={0.70} scale={1.1} />
        <DayCloud x={SCREEN_WIDTH * 0.60} y={SCREEN_HEIGHT * 0.65} opacity={0.60} scale={0.9} />
        <DayCloud x={SCREEN_WIDTH * 0.15} y={SCREEN_HEIGHT * 0.75} opacity={0.80} scale={1.3} />
      </Animated.View>
    </>
  )
}

// ── Céu noturno ───────────────────────────────────────────────────────
function NightSky() {
  const cloudX = useRef(new Animated.Value(0)).current
  const moonPulse = useRef(new Animated.Value(1)).current

  useEffect(() => {
    const c = Animated.loop(Animated.sequence([
      Animated.timing(cloudX, { toValue: 20,  duration: 10000, useNativeDriver: true }),
      Animated.timing(cloudX, { toValue: -10, duration: 10000, useNativeDriver: true }),
      Animated.timing(cloudX, { toValue: 0,   duration: 10000, useNativeDriver: true }),
    ]))
    const p = Animated.loop(Animated.sequence([
      Animated.timing(moonPulse, { toValue: 1.15, duration: 2500, useNativeDriver: true }),
      Animated.timing(moonPulse, { toValue: 1.0,  duration: 2500, useNativeDriver: true }),
    ]))
    c.start(); p.start()
    return () => { c.stop(); p.stop() }
  }, [])

  return (
    <>
      <LinearGradient
        colors={["#02020f", "#08082e", "#0d1540"]}
        locations={[0, 0.4, 1]}
        style={StyleSheet.absoluteFillObject}
      />
      {/* Aurora suave */}
      <View style={styles.aurora1} />
      <View style={styles.aurora2} />

      {/* Estrelas */}
      {NIGHT_STARS.map((s, i) => (
        <TwinkleStar key={i} top={s.top} left={s.left} size={s.size} delay={s.delay} />
      ))}

      {/* Lua */}
      <View style={styles.moonContainer}>
        <Animated.View style={[styles.moonHalo, { transform: [{ scale: moonPulse }] }]} />
        <View style={styles.moon}>
          <View style={[styles.crater, { width: 12, height: 12, top: "22%", left: "58%" }]} />
          <View style={[styles.crater, { width: 8,  height: 8,  top: "55%", left: "25%" }]} />
          <View style={[styles.crater, { width: 6,  height: 6,  top: "38%", left: "72%" }]} />
          <View style={[styles.crater, { width: 5,  height: 5,  top: "68%", left: "50%" }]} />
        </View>
      </View>

      {/* Nuvens noturnas */}
      <Animated.View style={{ transform: [{ translateX: cloudX }] }}>
        <NightCloud x={-10}                 y={SCREEN_HEIGHT * 0.05} opacity={0.55} />
        <NightCloud x={SCREEN_WIDTH * 0.55} y={SCREEN_HEIGHT * 0.15} opacity={0.40} />
        <NightCloud x={SCREEN_WIDTH * 0.25} y={SCREEN_HEIGHT * 0.30} opacity={0.35} />
        <NightCloud x={SCREEN_WIDTH * 0.70} y={SCREEN_HEIGHT * 0.45} opacity={0.45} />
      </Animated.View>
    </>
  )
}

// ── Componente principal ──────────────────────────────────────────────
export function CelestialBackground() {
  const colorScheme = useColorScheme()
  const isNight = colorScheme === "dark"

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {isNight ? <NightSky /> : <DaySky />}
    </View>
  )
}

const styles = StyleSheet.create({
  sun: {
    position: "absolute",
    top: SCREEN_HEIGHT * 0.06,
    right: SCREEN_WIDTH * 0.12,
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#fef08a",
    shadowColor: "#fde68a",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 24,
    elevation: 8,
  },
  cloudBase: {
    position: "absolute",
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 40,
  },
  cloudPuff: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 60,
  },
  nightCloudBase: {
    width: 200,
    height: 40,
    backgroundColor: "rgba(49,46,129,0.55)",
    borderRadius: 40,
  },
  nightCloudPuff1: {
    position: "absolute",
    width: 80,
    height: 64,
    bottom: 20,
    left: 24,
    backgroundColor: "rgba(49,46,129,0.45)",
    borderRadius: 40,
  },
  nightCloudPuff2: {
    position: "absolute",
    width: 100,
    height: 72,
    bottom: 24,
    left: 72,
    backgroundColor: "rgba(30,27,75,0.55)",
    borderRadius: 50,
  },
  aurora1: {
    position: "absolute",
    top: 0,
    left: "25%",
    width: 280,
    height: 200,
    borderRadius: 140,
    backgroundColor: "rgba(99,102,241,0.08)",
  },
  aurora2: {
    position: "absolute",
    top: 0,
    right: "20%",
    width: 240,
    height: 160,
    borderRadius: 120,
    backgroundColor: "rgba(139,92,246,0.06)",
  },
  moonContainer: {
    position: "absolute",
    top: SCREEN_HEIGHT * 0.07,
    right: SCREEN_WIDTH * 0.10,
    alignItems: "center",
    justifyContent: "center",
  },
  moonHalo: {
    position: "absolute",
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "rgba(255,248,180,0.12)",
  },
  moon: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: "#fef9c3",
    shadowColor: "#fef08a",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 8,
    overflow: "hidden",
  },
  crater: {
    position: "absolute",
    backgroundColor: "rgba(200,190,100,0.22)",
    borderRadius: 10,
  },
})
