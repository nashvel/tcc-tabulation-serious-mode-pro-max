import { createRouter, createWebHistory } from 'vue-router';

// Import pages
import JudgePage from '../pages/judge/JudgePage.vue';
import AdminPage from '../pages/admin/AdminPage.vue';
import SetupPage from '../pages/admin/SetupPage.vue';
import LoginPage from '../pages/admin/LoginPage.vue';
import DocumentationPage from '../pages/admin/DocumentationPage.vue';
import CertificatesPage from '../pages/admin/CertificatesPage.vue';

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
  },
  {
    path: '/setup',
    name: 'setup',
    component: SetupPage,
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
  },
  {
    path: '/admin/certificates',
    name: 'certificates',
    component: CertificatesPage,
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
