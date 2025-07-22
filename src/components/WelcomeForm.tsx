"use client"

import React, { useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Animated,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { MaterialIcons } from "@expo/vector-icons"
import type { UserData } from "../types"

interface WelcomeFormProps {
  onSubmit: (data: UserData) => void
}

export const WelcomeForm: React.FC<WelcomeFormProps> = ({ onSubmit }) => {
  const [name, setName] = useState("")
  const [church, setChurch] = useState("")
  const [cloudAnimation] = useState(new Animated.Value(0))

  React.useEffect(() => {
    // Animação das nuvens
    Animated.loop(
      Animated.sequence([
        Animated.timing(cloudAnimation, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(cloudAnimation, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ]),
    ).start()
  }, [])

  const handleSubmit = () => {
    if (!name.trim() || !church.trim()) {
      Alert.alert("Campos obrigatórios", "Por favor, preencha todos os campos.")
      return
    }

    onSubmit({ name: name.trim(), church: church.trim() })
  }

  const cloudTranslateX = cloudAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 20],
  })

  return (
    <LinearGradient colors={["#60A5FA", "#93C5FD", "#DBEAFE"]} style={styles.container}>
      {/* Animated clouds effect */}
      <View style={styles.cloudsContainer}>
        <Animated.View style={[styles.cloud, styles.cloud1, { transform: [{ translateX: cloudTranslateX }] }]} />
        <Animated.View
          style={[styles.cloud, styles.cloud2, { transform: [{ translateX: Animated.multiply(cloudTranslateX, -1) }] }]}
        />
        <Animated.View style={[styles.cloud, styles.cloud3, { transform: [{ translateX: cloudTranslateX }] }]} />
        <Animated.View
          style={[
            styles.cloud,
            styles.cloud4,
            { transform: [{ translateX: Animated.multiply(cloudTranslateX, -0.5) }] },
          ]}
        />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardContainer}>
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <View style={styles.iconContainer}>
              <LinearGradient colors={["#3B82F6", "#1D4ED8"]} style={styles.iconBackground}>
                <MaterialIcons name="favorite" size={40} color="#FFFFFF" />
              </LinearGradient>
            </View>

            <Text style={styles.title}>Bem-vindo(a)!</Text>
            <Text style={styles.description}>
              Para começar a receber versículos bíblicos diários, precisamos conhecer você melhor.
            </Text>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Seu nome</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Digite seu nome"
                  placeholderTextColor="#9CA3AF"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  returnKeyType="next"
                />
              </View>

              <View style={styles.inputContainer}>
                <View style={styles.labelContainer}>
                  <MaterialIcons name="church" size={16} color="#374151" />
                  <Text style={styles.label}>Sua igreja</Text>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Nome da sua igreja"
                  placeholderTextColor="#9CA3AF"
                  value={church}
                  onChangeText={setChurch}
                  autoCapitalize="words"
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit}
                />
              </View>

              <TouchableOpacity
                style={[styles.button, (!name.trim() || !church.trim()) && styles.buttonDisabled]}
                onPress={handleSubmit}
                disabled={!name.trim() || !church.trim()}
                activeOpacity={0.8}
              >
                <LinearGradient colors={["#3B82F6", "#1D4ED8"]} style={styles.buttonGradient}>
                  <Text style={styles.buttonText}>Começar Jornada Espiritual</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    marginBottom: 20,
  },
  iconBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 10,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 30,
  },
  form: {
    width: "100%",
  },
  inputContainer: {
    marginBottom: 20,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginLeft: 4,
  },
  input: {
    height: 50,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#1F2937",
  },
  button: {
    marginTop: 10,
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
    opacity: 0.5,
  },
  buttonGradient: {
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
})
