import AsyncStorage from "@react-native-async-storage/async-storage"
import type { UserData } from "../types"

const USER_DATA_KEY = "simpleBible:user"

export const saveUserData = async (userData: UserData): Promise<void> => {
  try {
    await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userData))
  } catch (error) {
    console.error("Erro ao salvar dados do usuário:", error)
    throw error
  }
}

export const getUserData = async (): Promise<UserData | null> => {
  try {
    const data = await AsyncStorage.getItem(USER_DATA_KEY)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error("Erro ao carregar dados do usuário:", error)
    return null
  }
}

export const removeUserData = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(USER_DATA_KEY)
  } catch (error) {
    console.error("Erro ao remover dados do usuário:", error)
    throw error
  }
}
