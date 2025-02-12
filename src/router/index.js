import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '../views/HomePage.vue';
import EventPage from '../views/EventPage.vue';
import SupportPage from '../views/SupportPage';


const routes = [
    { path: '/', name: 'Home', component: HomePage },
    { path: '/event', name: 'Event', component: EventPage },
    { path: '/support', name: 'Support', component: SupportPage },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
