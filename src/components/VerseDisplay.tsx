"use client"

import React, { useState, useEffect } from "react"
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, Animated } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { MaterialIcons } from "@expo/vector-icons"
import { Picker } from "@react-native-picker/picker"
import type { UserData, BibleVerse } from "../types"
import { getRandomVerse, getAvailableVersions } from "../data/bible-verses"
import { getCurrentTime, formatReference } from "../utils/dateUtils"

interface VerseDisplayProps {
  userData: UserData
  onReset: () => void
}

export const VerseDisplay: React.FC<VerseDisplayProps> = ({ userData, onReset }) => {
  const [currentVerse, setCurrentVerse] = useState<BibleVerse | null>(null)
  const [selectedVersion, setSelectedVersion] = useState("NVI")
  const [showUserInfo, setShowUserInfo] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [cloudAnimation] = useState(new Animated.Value(0))
  const [fadeAnimation] = useState(new Animated.Value(0))
  const availableVersions = getAvailableVersions()

  React.useEffect(() => {
    // Animação das nuvens
    Animated.loop(
      Animated.sequence([
        Animated.timing(cloudAnimation, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(cloudAnimation, {
          toValue: 0,
          duration: 4000,
          useNativeDriver: true,
        }),
      ]),
    ).start()

    // Animação de fade in
    Animated.timing(fadeAnimation, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start()
  }, [])

  const handleNewVerse = async () => {
    setIsLoading(true)
    try {
      // Pequeno delay para melhor UX
      await new Promise((resolve) => setTimeout(resolve, 500))
      const verse = getRandomVerse(selectedVersion)
      setCurrentVerse(verse)
    } catch (error) {
      console.error("Erro ao carregar versículo:", error)
      Alert.alert("Erro", "Não foi possível carregar um novo versículo.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleVersionChange = async (version: string) => {
    setSelectedVersion(version)
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 300))
      const verse = getRandomVerse(version)
      setCurrentVerse(verse)
    } catch (error) {
      console.error("Erro ao trocar versão:", error)
      Alert.alert("Erro", "Não foi possível carregar versículo da nova versão.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    Alert.alert("Redefinir dados", "Tem certeza que deseja redefinir suas informações?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Confirmar", onPress: onReset, style: "destructive" },
    ])
  }

  useEffect(() => {
    const loadInitialVerse = async () => {
      setIsLoading(true)
      try {
        await new Promise((resolve) => setTimeout(resolve, 800))
        const verse = getRandomVerse(selectedVersion)
        setCurrentVerse(verse)
      } catch (error) {
        console.error("Erro ao carregar versículo inicial:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadInitialVerse()
  }, [])

  const cloudTranslateX = cloudAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 30],
  })

  return (
    <LinearGradient colors={["#60A5FA", "#93C5FD", "#DBEAFE"]} style={styles.container}>
      {/* Animated clouds effect */}
      <View style={styles.cloudsContainer}>
        <Animated.View style={[styles.cloud, styles.cloud1, { transform: [{ translateX: cloudTranslateX }] }]} />
        <Animated.View
          style={[styles.cloud, styles.cloud2, { transform: [{ translateX: Animated.multiply(cloudTranslateX, -1) }] }]}
        />
        <Animated.View
          style={[
            styles.cloud,
            styles.cloud3,
            { transform: [{ translateX: Animated.multiply(cloudTranslateX, 0.5) }] },
          ]}
        />
        <Animated.View
          style={[
            styles.cloud,
            styles.cloud4,
            { transform: [{ translateX: Animated.multiply(cloudTranslateX, -0.7) }] },
          ]}
        />
        <Animated.View style={[styles.cloud, styles.cloud5, { transform: [{ translateX: cloudTranslateX }] }]} />
        <Animated.View
          style={[
            styles.cloud,
            styles.cloud6,
            { transform: [{ translateX: Animated.multiply(cloudTranslateX, -0.3) }] },
          ]}
        />
      </View>

      <Animated.View style={[styles.content, { opacity: fadeAnimation }]}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={styles.greeting}>Olá, {userData.name}! 🙏</Text>
              <Text style={styles.date}>{getCurrentTime()}</Text>
            </View>
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => setShowUserInfo(!showUserInfo)}
              activeOpacity={0.7}
            >
              <MaterialIcons name="settings" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* User Info Card */}
          {showUserInfo && (
            <Animated.View
              style={[
                styles.userInfoCard,
                {
                  opacity: fadeAnimation,
                  transform: [
                    {
                      translateY: fadeAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-20, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <View style={styles.userInfoContent}>
                <View style={styles.userInfoItem}>
                  <MaterialIcons name="person" size={20} color="#FFFFFF" />
                  <Text style={styles.userInfoText}>Nome: {userData.name}</Text>
                </View>
                <View style={styles.userInfoItem}>
                  <MaterialIcons name="church" size={20} color="#FFFFFF" />
                  <Text style={styles.userInfoText}>Igreja: {userData.church}</Text>
                </View>
              </View>
              <View style={styles.userInfoActions}>
                <TouchableOpacity style={styles.resetButton} onPress={handleReset} activeOpacity={0.7}>
                  <Text style={styles.resetButtonText}>Redefinir</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.closeButton} onPress={() => setShowUserInfo(false)} activeOpacity={0.7}>
                  <MaterialIcons name="close" size={20} color="rgba(255, 255, 255, 0.7)" />
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}

          {/* Version Selector */}
          <View style={styles.versionCard}>
            <View style={styles.versionHeader}>
              <MaterialIcons name="book" size={20} color="#FCD34D" />
              <Text style={styles.versionLabel}>Versão da Bíblia:</Text>
            </View>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedVersion}
                onValueChange={handleVersionChange}
                enabled={!isLoading}
                style={styles.picker}
                dropdownIconColor="#FFFFFF"
              >
                {availableVersions.map((version) => (
                  <Picker.Item
                    key={version.abbreviation}
                    label={`${version.name} (${version.abbreviation})`}
                    value={version.abbreviation}
                    color="#1F2937"
                  />
                ))}
              </Picker>
            </View>
          </View>

          {/* Main Verse Card */}
          <View style={styles.verseCard}>
            <View style={styles.verseHeader}>
              <MaterialIcons name="menu-book" size={32} color="#1E40AF" />
              <Text style={styles.verseTitle}>Versículo do Momento</Text>
            </View>

            <View style={styles.verseContent}>
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#3B82F6" />
                  <Text style={styles.loadingText}>Carregando versículo...</Text>
                </View>
              ) : currentVerse ? (
                <View style={styles.verseTextContainer}>
                  <Text style={styles.verseText}>"{currentVerse.text}"</Text>
                  <View style={styles.verseReference}>
                    <Text style={styles.referenceText}>
                      {formatReference(currentVerse.book, currentVerse.chapter, currentVerse.verse)}
                    </Text>
                    <Text style={styles.versionText}>
                      Versão: {availableVersions.find((v) => v.abbreviation === selectedVersion)?.name}
                    </Text>
                  </View>
                </View>
              ) : (
                <View style={styles.errorContainer}>
                  <MaterialIcons name="error-outline" size={48} color="#EF4444" />
                  <Text style={styles.errorText}>Não foi possível carregar o versículo. Tente novamente.</Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.newVerseButton, isLoading && styles.buttonDisabled]}
                onPress={handleNewVerse}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                <LinearGradient colors={["#3B82F6", "#1D4ED8"]} style={styles.buttonGradient}>
                  <MaterialIcons
                    name="refresh"
                    size={20}
                    color="#FFFFFF"
                    style={[styles.buttonIcon, isLoading && styles.spinningIcon]}
                  />
                  <Text style={styles.buttonText}>{isLoading ? "Carregando..." : "Novo Versículo"}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Que a palavra de Deus ilumine seu dia! ✨</Text>
            <Text style={styles.footerChurch}>Igreja: {userData.church}</Text>
          </View>
        </ScrollView>
      </Animated.View>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cloudsContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  cloud: {
    position: "absolute",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 50,
  },
  cloud1: {
    width: 120,
    height: 60,
    top: 40,
    left: 40,
  },
  cloud2: {
    width: 160,
    height: 80,
    top: 80,
    right: 80,
  },
  cloud3: {
    width: 100,
    height: 50,
    top: 120,
    left: "30%",
  },
  cloud4: {
    width: 140,
    height: 70,
    top: 160,
    right: "30%",
  },
  cloud5: {
    width: 180,
    height: 90,
    top: 240,
    left: "20%",
  },
  cloud6: {
    width: 120,
    height: 60,
    top: 320,
    right: "20%",
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 50,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  headerText: {
    flex: 1,
  },
  greeting: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  date: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    textTransform: "capitalize",
    marginTop: 4,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  settingsButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  userInfoCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  userInfoContent: {
    marginBottom: 15,
  },
  userInfoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  userInfoText: {
    color: "#FFFFFF",
    fontSize: 14,
    marginLeft: 8,
  },
  userInfoActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  resetButton: {
    backgroundColor: "rgba(239, 68, 68, 0.2)",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
  },
  resetButtonText: {
    color: "#FCA5A5",
    fontSize: 14,
    fontWeight: "500",
  },
  closeButton: {
    padding: 8,
  },
  versionCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  versionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  versionLabel: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 8,
  },
  pickerContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  picker: {
    color: "#FFFFFF",
    height: 50,
  },
  verseCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 20,
    padding: 25,
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  verseHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  verseTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1E40AF",
    marginLeft: 10,
  },
  verseContent: {
    alignItems: "center",
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    color: "#6B7280",
    fontSize: 16,
    marginTop: 15,
  },
  verseTextContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  verseText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#374151",
    lineHeight: 28,
    fontStyle: "italic",
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  verseReference: {
    alignItems: "center",
  },
  referenceText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#3B82F6",
    marginBottom: 5,
  },
  versionText: {
    fontSize: 12,
    color: "#6B7280",
  },
  errorContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  errorText: {
    color: "#6B7280",
    fontSize: 16,
    textAlign: "center",
    marginTop: 10,
  },
  newVerseButton: {
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
    paddingVertical: 15,
  },
  buttonIcon: {
    marginRight: 8,
  },
  spinningIcon: {
    // Você pode adicionar animação de rotação aqui se desejar
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    alignItems: "center",
    paddingBottom: 30,
  },
  footerText: {
    fontSize: 16,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    marginBottom: 8,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  footerChurch: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
})
