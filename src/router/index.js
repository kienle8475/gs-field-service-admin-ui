import AppLayout from '@/layout/AppLayout.vue';
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            component: AppLayout,
            children: [
                {
                    path: '/fms/report/attendance',
                    name: 'attendance',
                    component: () => import('@/views/pages/fms/reports/ReportAttendance.vue')
                },
                {
                    path: '/fms/report/oos',
                    name: 'oos',
                    component: () => import('@/views/pages/fms/reports/ReportOOS.vue')
                },
                {
                    path: '/fms/report/sale-out',
                    name: 'sale-out',
                    component: () => import('@/views/pages/fms/reports/ReportSaleout.vue')
                },
                {
                    path: '/fms/report/customer',
                    name: 'customer',
                    component: () => import('@/views/pages/fms/reports/ReportCustomer.vue')
                },
                {
                    path: '/fms/report/sampling',
                    name: 'sampling',
                    component: () => import('@/views/pages/fms/reports/ReportSampling.vue')
                },
                {
                    path: '/fms/report/images',
                    name: 'images',
                    component: () => import('@/views/pages/fms/reports/ReportImage.vue')
                },
                {
                    path: '/fms/report/attendance',
                    name: 'attendance',
                    component: () => import('@/views/pages/fms/reports/ReportAttendance.vue')
                },
                {
                    path: '/fms/config/users',
                    name: 'users',
                    component: () => import('@/views/pages/fms/configs/Users.vue')
                },
                {
                    path: '/fms/config/locations',
                    name: 'locations',
                    component: () => import('@/views/pages/fms/configs/Locations.vue')
                },
                {
                    path: '/fms/config/working-shift',
                    name: 'working-shift',
                    component: () => import('@/views/pages/fms/configs/WorkingShift.vue')
                },
                {
                    path: '/fms/config/gift',
                    name: 'gift-config',
                    component: () => import('@/views/pages/fms/configs/GiftConfig.vue')
                },
                {
                    path: '/',
                    name: 'dashboard',
                    component: () => import('@/views/Dashboard.vue'),
                    meta: {
                        requiresAuth: true,
                    },
                },
                {
                    path: '/uikit/formlayout',
                    name: 'formlayout',
                    component: () => import('@/views/uikit/FormLayout.vue')
                },
                {
                    path: '/uikit/input',
                    name: 'input',
                    component: () => import('@/views/uikit/InputDoc.vue')
                },
                {
                    path: '/uikit/button',
                    name: 'button',
                    component: () => import('@/views/uikit/ButtonDoc.vue')
                },
                {
                    path: '/uikit/table',
                    name: 'table',
                    component: () => import('@/views/uikit/TableDoc.vue')
                },
                {
                    path: '/uikit/list',
                    name: 'list',
                    component: () => import('@/views/uikit/ListDoc.vue')
                },
                {
                    path: '/uikit/tree',
                    name: 'tree',
                    component: () => import('@/views/uikit/TreeDoc.vue')
                },
                {
                    path: '/uikit/panel',
                    name: 'panel',
                    component: () => import('@/views/uikit/PanelsDoc.vue')
                },

                {
                    path: '/uikit/overlay',
                    name: 'overlay',
                    component: () => import('@/views/uikit/OverlayDoc.vue')
                },
                {
                    path: '/uikit/media',
                    name: 'media',
                    component: () => import('@/views/uikit/MediaDoc.vue')
                },
                {
                    path: '/uikit/message',
                    name: 'message',
                    component: () => import('@/views/uikit/MessagesDoc.vue')
                },
                {
                    path: '/uikit/file',
                    name: 'file',
                    component: () => import('@/views/uikit/FileDoc.vue')
                },
                {
                    path: '/uikit/menu',
                    name: 'menu',
                    component: () => import('@/views/uikit/MenuDoc.vue')
                },
                {
                    path: '/uikit/charts',
                    name: 'charts',
                    component: () => import('@/views/uikit/ChartDoc.vue')
                },
                {
                    path: '/uikit/misc',
                    name: 'misc',
                    component: () => import('@/views/uikit/MiscDoc.vue')
                },
                {
                    path: '/uikit/timeline',
                    name: 'timeline',
                    component: () => import('@/views/uikit/TimelineDoc.vue')
                },
                {
                    path: '/pages/empty',
                    name: 'empty',
                    component: () => import('@/views/pages/Empty.vue')
                },
                {
                    path: '/pages/crud',
                    name: 'crud',
                    component: () => import('@/views/pages/Crud.vue')
                },
                {
                    path: '/documentation',
                    name: 'documentation',
                    component: () => import('@/views/pages/Documentation.vue')
                }
            ]
        },
        {
            path: '/fms',
            component: AppLayout,
            children: [
                
            ]
        },
        {
            path: '/landing',
            name: 'landing',
            component: () => import('@/views/pages/Landing.vue')
        },
        {
            path: '/pages/notfound',
            name: 'notfound',
            component: () => import('@/views/pages/NotFound.vue')
        },

        {
            path: '/auth/login',
            name: 'login',
            component: () => import('@/views/pages/auth/Login.vue')
        },
        {
            path: '/auth/access',
            name: 'accessDenied',
            component: () => import('@/views/pages/auth/Access.vue')
        },
        {
            path: '/auth/error',
            name: 'error',
            component: () => import('@/views/pages/auth/Error.vue')
        }
    ]
});

export default router;
