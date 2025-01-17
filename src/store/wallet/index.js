import apiClientRequest from "@/lib/api";
import getEnv from "../../utils/env"

const defaultState = {
  resultMsg: null
}

export default {
  namespaced: true,
  state: { ...defaultState },
  mutations: {
    SET_RESULT(state, resultMsg) {
      state.resultMsg = resultMsg
    }
  },
  actions: {
    async walletBinding({commit}, payload) {
      try {
        const debioApiKey = getEnv("VUE_APP_DEBIO_API_KEY")
        const { data } = await apiClientRequest.post("/substrate/wallet-binding", payload , {
          headers: { "debio-api-key" : debioApiKey }
        })

        commit("SET_RESULT", data)
      } catch (e) {
        console.error(e)
      }
    }
  }
}
