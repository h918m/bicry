"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = [
    {
        basePath: '/api/admin/faq',
        controllerPath: './extensions/faq/admin/controller',
        routes: [
            {
                method: 'get',
                path: '/analytics',
                controller: 'index',
                permission: 'Access Knowledge Base Management',
            },
        ],
    },
    // Admin routes for FAQs
    {
        basePath: '/api/admin/faq/entries',
        controllerPath: './extensions/faq/admin/entries/controller',
        routes: [
            {
                method: 'get',
                path: '',
                controller: 'index',
                permission: 'View FAQs',
            },
            {
                method: 'post',
                path: '',
                controller: 'create',
                body: ['question', 'answer', 'faq_category_id'],
                permission: 'Create FAQ',
            },
            {
                method: 'get',
                path: '/:id',
                controller: 'show',
                params: ['id'],
                permission: 'View FAQ',
            },
            {
                method: 'put',
                path: '/:id',
                controller: 'update',
                params: ['id'],
                body: ['question', 'answer'],
                permission: 'Update FAQ',
            },
            {
                method: 'del',
                path: '/:id',
                controller: 'delete',
                params: ['id'],
                permission: 'Delete FAQ',
            },
        ],
    },
    // User routes for FAQ Categories
    {
        basePath: '/api/faq/categories',
        controllerPath: './extensions/faq/user/categories/controller',
        routes: [
            {
                method: 'get',
                path: '',
                controller: 'index',
            },
            {
                method: 'get',
                path: '/:identifier',
                controller: 'show',
                params: ['identifier'],
            },
        ],
    },
    // User routes for FAQs
    {
        basePath: '/api/faq/entries',
        controllerPath: './extensions/faq/user/entries/controller',
        routes: [
            {
                method: 'get',
                path: '',
                controller: 'index',
            },
            {
                method: 'get',
                path: '/:id',
                controller: 'show',
                params: ['id'],
            },
        ],
    },
];
