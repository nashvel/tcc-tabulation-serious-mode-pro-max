import { createRouter, createWebHistory } from 'vue-router';

// Import pages
import JudgePage from '../pages/judge/JudgePage.vue';
import AdminPage from '../pages/admin/AdminPage.vue';
import SetupPage from '../pages/admin/SetupPage.vue';
import LoginPage from '../pages/admin/LoginPage.vue';
import DocumentationPage from '../pages/admin/DocumentationPage.vue';
import CertificatesPage from '../pages/admin/CertificatesPage.vue';
import JudgesConfigurePage from '../pages/admin/JudgesConfigurePage.vue';
import CreateEventPage from '../pages/admin/CreateEventPage.vue';
import PrintJudgeScoresPage from '../pages/admin/PrintJudgeScoresPage.vue';

// Auth check helper
const requireAuth = (to, from, next) => {
  const isAdmin = localStorage.getItem('isAdmin');
  if (!isAdmin) {
    next('/admin/login');
  } else {
    next();
  }
};

const routes = [
  {
    path: '/judge',
    name: 'judge',
    component: JudgePage,
  },
  {
    path: '/admin',
    name: 'admin',
    component: AdminPage,
    beforeEnter: requireAuth,
  },
  {
    path: '/setup',
    name: 'setup',
    component: SetupPage,
    beforeEnter: requireAuth,
  },
  {
    path: '/admin/login',
    name: 'login',
    component: LoginPage,
  },
  {
    path: '/admin/documentation',
    name: 'documentation',
    component: DocumentationPage,
    beforeEnter: requireAuth,
  },
  {
    path: '/admin/certificates',
    name: 'certificates',
    component: CertificatesPage,
    beforeEnter: requireAuth,
  },
  {
    path: '/judges/configure',
    name: 'judges-configure',
    component: JudgesConfigurePage,
    beforeEnter: requireAuth,
  },
  {
    path: '/create-event',
    name: 'create-event',
    component: CreateEventPage,
    beforeEnter: requireAuth,
  },
  {
    path: '/admin/print-judge-scores',
    name: 'print-judge-scores',
    component: PrintJudgeScoresPage,
    beforeEnter: requireAuth,
  },
  // Redirect old vue paths
  {
    path: '/vue/judge',
    redirect: '/judge',
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
