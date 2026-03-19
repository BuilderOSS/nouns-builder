const inMemoryStorage = new Map()

const AsyncStorage = {
  async getItem(key) {
    return inMemoryStorage.has(key) ? inMemoryStorage.get(key) : null
  },
  async setItem(key, value) {
    inMemoryStorage.set(key, value)
  },
  async removeItem(key) {
    inMemoryStorage.delete(key)
  },
  async clear() {
    inMemoryStorage.clear()
  },
  async getAllKeys() {
    return Array.from(inMemoryStorage.keys())
  },
  async multiGet(keys) {
    return keys.map((key) => [key, inMemoryStorage.has(key) ? inMemoryStorage.get(key) : null])
  },
  async multiSet(entries) {
    entries.forEach(([key, value]) => {
      inMemoryStorage.set(key, value)
    })
  },
  async multiRemove(keys) {
    keys.forEach((key) => {
      inMemoryStorage.delete(key)
    })
  },
}

export const useAsyncStorage = (key) => ({
  getItem: () => AsyncStorage.getItem(key),
  setItem: (value) => AsyncStorage.setItem(key, value),
  removeItem: () => AsyncStorage.removeItem(key),
})

export default AsyncStorage
