import React from "react"
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, useColorScheme } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { MaterialIcons } from "@expo/vector-icons"
import { CelestialBackground } from "./CelestialBackground"

interface PrivacyScreenProps {
  onBack: () => void
}

const sections = [
  {
    icon: "security" as const,
    title: "Nossa filosofia de privacidade",
    body: "O Bíblia Sagrada foi construído com privacidade por padrão. Não coletamos, transmitimos nem armazenamos qualquer dado pessoal em servidores externos. Toda a informação que você fornece permanece exclusivamente no seu dispositivo.",
    list: null,
  },
  {
    icon: "smartphone" as const,
    title: "O que é armazenado localmente",
    body: null,
    list: [
      { label: "Nome e Igreja", desc: "Informados voluntariamente no primeiro acesso, usados apenas para personalizar a saudação." },
      { label: "Versículos favoritos", desc: "Lista de versículos marcados com ❤️, guardada para consulta futura." },
      { label: "Progresso de leitura", desc: "O livro e capítulo onde você parou na leitura corrida da Bíblia." },
      { label: "Preferências", desc: "Versão da Bíblia selecionada e outras configurações do app." },
    ],
  },
  {
    icon: "storage" as const,
    title: "O que NÃO fazemos",
    body: null,
    list: [
      { label: "Sem conta de usuário", desc: "Não é necessário criar conta, fornecer e-mail ou senha." },
      { label: "Sem rastreamento", desc: "Não usamos analytics que identifiquem você." },
      { label: "Sem envio de dados", desc: "Nenhuma informação digitada no app é enviada para qualquer servidor." },
      { label: "Sem anúncios personalizados", desc: "Não vendemos nem compartilhamos dados com terceiros." },
    ],
  },
  {
    icon: "menu-book" as const,
    title: "Conteúdo da Bíblia",
    body: "Os textos bíblicos (NVI, ACF e AA) são carregados diretamente do seu dispositivo. Não há chamadas para APIs externas para exibir os versículos.",
    list: null,
  },
  {
    icon: "delete-outline" as const,
    title: "Como apagar seus dados",
    body: "Para remover todos os dados armazenados, acesse as Configurações do aplicativo e toque em \"Redefinir\". Isso apaga nome, igreja e preferências do app.",
    list: null,
  },
]

export function PrivacyScreen({ onBack }: PrivacyScreenProps) {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === "dark"

  return (
    <View style={styles.container}>
      <CelestialBackground />
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
            <MaterialIcons name="arrow-back" size={22} color="rgba(255,255,255,0.85)" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Política de Privacidade</Text>
            <Text style={styles.headerSubtitle}>Bíblia Sagrada · Atualizada em maio de 2026</Text>
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Destaque */}
          <View style={[styles.card, styles.highlightCard]}>
            <View style={styles.highlightBar} />
            <View style={styles.highlightContent}>
              <View style={styles.highlightIconContainer}>
                <MaterialIcons name="security" size={24} color="#16A34A" />
              </View>
              <View style={styles.highlightText}>
                <Text style={styles.highlightTitle}>Seus dados ficam só no seu dispositivo</Text>
                <Text style={styles.highlightBody}>
                  Este aplicativo não possui servidor back-end, não cria contas de usuário e não transmite nenhuma informação para a internet. Tudo que você configura é salvo localmente via AsyncStorage.
                </Text>
              </View>
            </View>
          </View>

          {/* Seções */}
          {sections.map((s, i) => (
            <View key={i} style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconContainer}>
                  <MaterialIcons name={s.icon} size={16} color="#0284C7" />
                </View>
                <Text style={[styles.sectionTitle, isDark ? styles.textDark : styles.textLight]}>{s.title}</Text>
              </View>
              {s.body && (
                <Text style={[styles.sectionBody, isDark ? styles.bodyDark : styles.bodyLight]}>{s.body}</Text>
              )}
              {s.list && (
                <View style={styles.list}>
                  {s.list.map((item, j) => (
                    <View key={j} style={styles.listItem}>
                      <View style={styles.listBullet} />
                      <View style={styles.listItemText}>
                        <Text style={[styles.listLabel, isDark ? styles.textDark : styles.textLight]}>{item.label}</Text>
                        <Text style={[styles.listDesc, isDark ? styles.bodyDark : styles.bodyLight]}>{item.desc}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}

          {/* Rodapé */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Dúvidas? Entre em contato:{" "}
              <Text style={styles.footerEmail}>contato@bibliasagrada.app</Text>
            </Text>
            <TouchableOpacity style={styles.backFooterButton} onPress={onBack} activeOpacity={0.7}>
              <Text style={styles.backFooterText}>← Voltar ao app</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    margin: 16,
    backgroundColor: "rgba(0,0,0,0.22)",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    textShadowColor: "rgba(0,0,0,0.4)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  headerSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.75)",
    marginTop: 2,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    gap: 12,
  },
  card: {
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },
  highlightCard: {
    backgroundColor: "rgba(255,255,255,0.97)",
  },
  highlightBar: {
    height: 5,
    backgroundColor: "#FBBF24",
  },
  highlightContent: {
    flexDirection: "row",
    gap: 14,
    padding: 20,
  },
  highlightIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#DCFCE7",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  highlightText: {
    flex: 1,
  },
  highlightTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1F2937",
  },
  highlightBody: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 20,
    marginTop: 4,
  },
  cardLight: {
    backgroundColor: "rgba(255,255,255,0.92)",
  },
  cardDark: {
    backgroundColor: "rgba(17,24,39,0.88)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 20,
    paddingBottom: 10,
  },
  sectionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#E0F2FE",
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    flex: 1,
  },
  sectionBody: {
    fontSize: 13,
    lineHeight: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  listItem: {
    flexDirection: "row",
    gap: 10,
  },
  listBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#38BDF8",
    marginTop: 6,
    flexShrink: 0,
  },
  listItemText: {
    flex: 1,
  },
  listLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  listDesc: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 2,
  },
  textLight: { color: "#1F2937" },
  textDark:  { color: "#F9FAFB" },
  bodyLight: { color: "#6B7280" },
  bodyDark:  { color: "#9CA3AF" },
  footer: {
    alignItems: "center",
    paddingTop: 8,
    gap: 12,
  },
  footerText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
    textAlign: "center",
  },
  footerEmail: {
    color: "rgba(255,255,255,0.85)",
  },
  backFooterButton: {
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 999,
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  backFooterText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "500",
  },
})
