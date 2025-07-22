import React from "react"
import { useState, useEffect } from "react"
import { StatusBar } from "expo-status-bar"
import { WelcomeForm } from "./components/WelcomeForm"
import { VerseDisplay } from "./components/VerseDisplay"
import type { UserData } from "./types"
import { saveUserData, getUserData, removeUserData } from "./utils/storage"

const App: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const data = await getUserData()
        setUserData(data)
      } catch (error) {
        console.error("Erro ao carregar dados do usuário:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUserData()
  }, [])

  const handleSubmit = async (data: UserData) => {
    try {
      await saveUserData(data)
      setUserData(data)
    } catch (error) {
      console.error("Erro ao salvar dados do usuário:", error)
    }
  }

  const handleReset = async () => {
    try {
      await removeUserData()
      setUserData(null)
    } catch (error) {
      console.error("Erro ao remover dados do usuário:", error)
    }
  }

  if (isLoading) {
    return null // ou um componente de loading
  }

  return (
    <>
      <StatusBar style="light" backgroundColor="transparent" translucent />
      {userData ? <VerseDisplay userData={userData} onReset={handleReset} /> : <WelcomeForm onSubmit={handleSubmit} />}
    </>
  )
}

export default App

