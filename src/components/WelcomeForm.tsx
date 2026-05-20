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
  Image,
  useColorScheme,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { MaterialIcons } from "@expo/vector-icons"
import { CelestialBackground } from "./CelestialBackground"
import { AppFooter } from "./AppFooter"
import type { UserData } from "../types"

interface WelcomeFormProps {
  onSubmit: (data: UserData) => void
  onPrivacyPress?: () => void
}

export const WelcomeForm: React.FC<WelcomeFormProps> = ({ onSubmit, onPrivacyPress }) => {
  const [name, setName]     = useState("")
  const [church, setChurch] = useState("")
  const colorScheme         = useColorScheme()
  const isDark              = colorScheme === "dark"

  const handleSubmit = () => {
    if (!name.trim() || !church.trim()) {
      Alert.alert("Campos obrigatórios", "Por favor, preencha todos os campos.")
      return
    }
    onSubmit({ name: name.trim(), church: church.trim() })
  }

  return (
    <View style={styles.container}>
      <CelestialBackground />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardContainer}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {/* Card */}
          <View style={styles.card}>
            {/* Barra superior */}
            <LinearGradient
              colors={["#FBBF24", "#FCD34D", "#FBBF24"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.topBar}
            />

            {/* Logo */}
            <View style={styles.logoContainer}>
              <Image
                source={require("../assets/icon.png")}
                style={styles.logo}
                resizeMode="cover"
              />
            </View>

            {/* Título */}
            <Text style={styles.title}>Bem-vindo(a)!</Text>
            <Text style={styles.appName}>Bíblia Sagrada</Text>

            {/* Citação */}
            <View style={styles.quoteContainer}>
              <Text style={styles.quoteText}>
                "A tua palavra é lâmpada para os meus pés e luz para o meu caminho."
              </Text>
              <Text style={styles.quoteReference}>— Salmos 119:105</Text>
            </View>

            {/* Formulário */}
            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <View style={styles.labelRow}>
                  <MaterialIcons name="person" size={14} color="#0EA5E9" />
                  <Text style={styles.label}>Seu nome</Text>
                </View>
                <TextInput
                  style={[styles.input, isDark && styles.inputDark]}
                  placeholder="Como você se chama?"
                  placeholderTextColor="#9CA3AF"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  returnKeyType="next"
                />
              </View>

              <View style={styles.inputContainer}>
                <View style={styles.labelRow}>
                  <MaterialIcons name="church" size={14} color="#0EA5E9" />
                  <Text style={styles.label}>Sua igreja</Text>
                </View>
                <TextInput
                  style={[styles.input, isDark && styles.inputDark]}
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
                <LinearGradient
                  colors={["#0EA5E9", "#2563EB"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.buttonText}>✨ Começar Jornada Espiritual</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Barra inferior */}
            <LinearGradient
              colors={["#7DD3FC", "#60A5FA", "#7DD3FC"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.bottomBar}
            />
          </View>

          {/* Footer */}
          <AppFooter onPrivacyPress={onPrivacyPress} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
    gap: 16,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.93)",
    borderRadius: 28,
    overflow: "hidden",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  topBar: {
    width: "100%",
    height: 6,
  },
  logoContainer: {
    marginTop: 28,
    marginBottom: 16,
    width: 88,
    height: 88,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.9)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  logo: {
    width: "100%",
    height: "100%",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1F2937",
    textAlign: "center",
  },
  appName: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0EA5E9",
    textTransform: "uppercase",
    letterSpacing: 2,
    marginTop: 4,
    marginBottom: 16,
  },
  quoteContainer: {
    borderLeftWidth: 2,
    borderLeftColor: "#FBBF24",
    paddingLeft: 12,
    marginHorizontal: 24,
    marginBottom: 24,
  },
  quoteText: {
    fontSize: 13,
    color: "#6B7280",
    fontStyle: "italic",
    lineHeight: 20,
  },
  quoteReference: {
    fontSize: 12,
    color: "#D97706",
    fontWeight: "600",
    marginTop: 4,
  },
  form: {
    width: "100%",
    paddingHorizontal: 24,
  },
  inputContainer: {
    marginBottom: 18,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },
  input: {
    height: 50,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#1F2937",
  },
  inputDark: {
    backgroundColor: "#F9FAFB",
  },
  button: {
    marginTop: 4,
    marginBottom: 8,
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  buttonGradient: {
    height: 52,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  bottomBar: {
    width: "100%",
    height: 4,
    marginTop: 16,
  },
})
