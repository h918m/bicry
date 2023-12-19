"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = [
    {
        basePath: '/api/admin/ai-trading',
        controllerPath: './extensions/ai-trading/admin/controller',
        routes: [
            {
                method: 'get',
                path: '/analytics',
                controller: 'index',
                permission: 'Access AI Trading Management',
            },
        ],
    },
    {
        basePath: '/api/ai-trading',
        controllerPath: './extensions/ai-trading/investments/controller',
        routes: [
            {
                method: 'get',
                path: '',
                controller: 'index',
            },
            {
                method: 'get',
                path: '/fetch/active',
                controller: 'active',
            },
            {
                method: 'get',
                path: '/:uuid',
                controller: 'status',
                params: ['uuid'],
            },
            {
                method: 'post',
                path: '',
                controller: 'create',
                body: ['plan_id', 'duration', 'amount', 'currency', 'pair'],
            },
        ],
    },
    {
        basePath: '/api/cron/ai-trading/investment',
        controllerPath: './extensions/ai-trading/investments/controller',
        routes: [
            {
                method: 'get',
                path: '',
                controller: 'cron',
                isGuest: true,
            },
        ],
    },
    {
        basePath: '/api/ai-trading/plans',
        controllerPath: './extensions/ai-trading/plans/controller',
        routes: [
            {
                method: 'get',
                path: '',
                controller: 'index',
            },
        ],
    },
    {
        basePath: '/api/admin/ai-trading',
        controllerPath: './extensions/ai-trading/admin/investments/controller',
        routes: [
            {
                method: 'get',
                path: '',
                controller: 'index',
                permission: 'View AI Trading Investments',
            },
            {
                method: 'get',
                path: '/:uuid',
                controller: 'show',
                params: ['uuid'],
                permission: 'View AI Trading Investments',
            },
            {
                method: 'put',
                path: '/:uuid',
                controller: 'update',
                params: ['uuid'],
                body: ['profit', 'result'],
                permission: 'Edit AI Trading Investments',
            },
            {
                method: 'del',
                path: '/:id',
                controller: 'delete',
                params: ['id'],
                permission: 'Delete AI Trading Investments',
            },
        ],
    },
    {
        basePath: '/api/admin/ai-trading/plans',
        controllerPath: './extensions/ai-trading/admin/plans/controller',
        routes: [
            {
                method: 'get',
                path: '',
                controller: 'index',
                permission: 'View AI Trading Investment Plans',
            },
            {
                method: 'get',
                path: '/:id',
                controller: 'show',
                params: ['id'],
                permission: 'View AI Trading Investment Plans',
            },
            {
                method: 'post',
                path: '',
                controller: 'create',
                body: ['plan'],
                permission: 'Create AI Trading Investment Plans',
            },
            {
                method: 'put',
                path: '/:id',
                controller: 'update',
                params: ['id'],
                body: ['plan'],
                permission: 'Edit AI Trading Investment Plans',
            },
            {
                method: 'del',
                path: '/:id',
                controller: 'delete',
                params: ['id'],
                permission: 'Delete AI Trading Investment Plans',
            },
        ],
    },
    {
        basePath: '/api/admin/ai-trading/durations',
        controllerPath: './extensions/ai-trading/admin/durations/controller',
        routes: [
            {
                method: 'get',
                path: '',
                controller: 'index',
                permission: 'View AI Trading Investment Durations',
            },
            {
                method: 'get',
                path: '/:id',
                controller: 'show',
                params: ['id'],
                permission: 'View AI Trading Investment Durations',
            },
            {
                method: 'post',
                path: '',
                controller: 'create',
                body: ['duration'],
                permission: 'Create AI Trading Investment Durations',
            },
            {
                method: 'put',
                path: '/:id',
                controller: 'update',
                params: ['id'],
                body: ['duration'],
                permission: 'Edit AI Trading Investment Durations',
            },
            {
                method: 'del',
                path: '/:id',
                controller: 'delete',
                params: ['id'],
                permission: 'Delete AI Trading Investment Durations',
            },
        ],
    },
];
