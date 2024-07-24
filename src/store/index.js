import { createStore } from 'vuex'
import { getUserInfo } from '@/services/userService'

const store = createStore({
  state: {
    user: null
  },
  mutations: {
    setUser(state, user) {
      state.user = user
    },
    clearUser(state) {
      state.user = null
    }
  },
  actions: {
    async fetchUser({ commit }) {
      try {
        const response = await getUserInfo()
        const user = response.data
        commit('setUser', user)
        return user
      } catch (error) {
        console.error('Error fetching user info:', error)
        throw error
      }
    }
  }
})

export default store
