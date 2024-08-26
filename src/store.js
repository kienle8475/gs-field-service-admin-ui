import { getAPI } from "./api/axios-base";
import { createStore } from 'vuex'


const state = {
  accessToken: localStorage.getItem("access_token") || null, // makes sure the user is logged in even after
  // refreshing the page
  APIData: "" // received data from the backend API is stored here.
}

const mutations = {
  set (state, [variable, value]) {
    state[variable] = value
  },
  updateLocalStorage(state, { access }) {
    localStorage.setItem("access_token", access);
    state.accessToken = access;
  },
  destroyToken(state) {
    state.accessToken = null;
  }
}

const getters = {
  loggedIn(state) {
    return state.accessToken != null;
  }
};

const actions = {
  logout(context) {
    if (context.getters.loggedIn) {
      return new Promise(() => {
        localStorage.removeItem("access_token");
        context.commit("destroyToken");
      });
    }
  },

  login(context, credentials) {
    return new Promise((resolve, reject) => {
      // send the username and password to the backend API:
      getAPI
        .post(
          "/auth/login",credentials
        )
        //if successful update local storage:
        .then(response => {
          context.commit("updateLocalStorage", {
            access: response.data.data.token,
          },
          ); // store the access and refresh token in localstorage
          resolve();
        })
        .catch(err => {
          console.log(err)
          reject(err);
        });
    });
  }
};

const store = createStore({
    state, mutations, getters, actions
})

export default store;