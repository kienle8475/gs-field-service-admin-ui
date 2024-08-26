import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import Aura from '@primevue/themes/aura';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import { VueQueryPlugin } from '@tanstack/vue-query';

import '@/assets/styles.scss';
import '@/assets/tailwind.css';

import store from './store';

const app = createApp(App);

app.use(PrimeVue, {
    theme: {
        preset: Aura,
        options: {
            darkModeSelector: '.app-dark'
        }
    }
});
app.use(ToastService);
app.use(ConfirmationService);
app.use(VueQueryPlugin);

app.use(router);
app.use(store);

router.beforeEach((to, from, next) => {
    // if any of the routes in ./router.js has a meta named 'requiresAuth: true'
    // then check if the user is logged in before routing to this path:
    if (to.matched.some((record) => record.meta.requiresAuth)) {
        if (!store.getters.loggedIn) {
            next({ name: 'login' });
        } else {
            next();
        }
    }
    // else if any of the routes in ./router.js has a meta named 'requiresLogged: true'
    // then check if the user is logged in; if true continue to home page else continue routing to the destination path
    // this comes to play if the user is logged in and tries to access the login/register page
    else if (to.matched.some((record) => record.meta.requiresLogged)) {
        if (store.getters.loggedIn) {
            next({ name: 'dashboard' });
        } else {
            next();
        }
    } else {
        next();
    }
});

app.mount('#app');
