import { createRouter, createWebHistory } from 'vue-router';
// import HomePage from '../views/HomePage.vue';
import LoginPage from '../views/LoginPage.vue';
// import EventPage from '../views/EventPage.vue';
import PonePge from '../views/PonePage';
import PtwoPage from '../views/PtwoPage';

const routes = [
    { path: '/', name: 'Home', component: PonePge },
    { path: '/login', name: 'Login', component: LoginPage },
    { path: '/event', name: 'Event', component: PtwoPage },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
