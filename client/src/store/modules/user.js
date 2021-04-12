const state = {
  currentUser: null
};
  
const getters = {
  user: state => state.currentUser
};

const actions = {
  setUser({ commit }, user) {
    commit('setCurrentUser', user);
  }
};

const mutations = {
  setCurrentUser: (state, user) => {
    state.currentUser = user
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}