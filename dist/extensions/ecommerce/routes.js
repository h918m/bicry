"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = [
    // Admin routes for Ecommerce
    {
        basePath: '/api/admin/ecommerce',
        controllerPath: './extensions/ecommerce/admin/analytics/controller',
        routes: [
            {
                method: 'get',
                path: '/analytics',
                controller: 'index',
                permission: 'Access Ecommerce Management',
            },
        ],
    },
    // Admin routes for Category Management
    {
        basePath: '/api/admin/ecommerce/categories',
        controllerPath: './extensions/ecommerce/admin/categories/controller',
        routes: [
            {
                method: 'get',
                path: '',
                controller: 'index',
                permission: 'View Ecommerce Categories',
            },
            {
                method: 'post',
                path: '',
                controller: 'create',
                body: ['name', 'description', '?image'],
                permission: 'Create Ecommerce Category',
            },
            {
                method: 'put',
                path: '/:id',
                controller: 'update',
                params: ['id'],
                body: ['name', 'description', '?image', 'status'],
                permission: 'Update Ecommerce Category',
            },
            {
                method: 'del',
                path: '/:id',
                controller: 'delete',
                params: ['id'],
                permission: 'Delete Ecommerce Category',
            },
        ],
    },
    // User routes for Category Browsing
    {
        basePath: '/api/ecommerce/categories',
        controllerPath: './extensions/ecommerce/user/categories/controller',
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
    // Admin routes for Product Management
    {
        basePath: '/api/admin/ecommerce/products',
        controllerPath: './extensions/ecommerce/admin/products/controller',
        routes: [
            {
                method: 'get',
                path: '',
                controller: 'index',
                permission: 'View Ecommerce Products',
            },
            {
                method: 'get',
                path: '/:id',
                controller: 'show',
                params: ['id'],
                permission: 'View Ecommerce Product',
            },
            {
                method: 'post',
                path: '',
                controller: 'create',
                body: [
                    'name',
                    'description',
                    'type',
                    'price',
                    'currency',
                    'wallet_type',
                    'category_id',
                    'inventory_quantity',
                    '?file_path',
                    '?image',
                ],
                permission: 'Create Ecommerce Product',
            },
            {
                method: 'put',
                path: '/:id',
                controller: 'update',
                params: ['id'],
                body: [
                    'name',
                    'description',
                    'type',
                    'price',
                    'currency',
                    'wallet_type',
                    'category_id',
                    'inventory_quantity',
                    '?file_path',
                    'status',
                    '?image',
                ],
                permission: 'Update Ecommerce Product',
            },
            {
                method: 'del',
                path: '/:id',
                controller: 'delete',
                params: ['id'],
                permission: 'Delete Product',
            },
        ],
    },
    // User routes for Product Catalog
    {
        basePath: '/api/ecommerce/products',
        controllerPath: './extensions/ecommerce/user/products/controller',
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
    // Admin routes for Order Management
    {
        basePath: '/api/admin/ecommerce/orders',
        controllerPath: './extensions/ecommerce/admin/orders/controller',
        routes: [
            {
                method: 'get',
                path: '',
                controller: 'index',
                permission: 'View Ecommerce Orders',
            },
            {
                method: 'get',
                path: '/:id',
                controller: 'show',
                params: ['id'],
                permission: 'View Ecommerce Order Details',
            },
            {
                method: 'put',
                path: '/:id',
                controller: 'update',
                params: ['id'],
                body: ['status'],
                permission: 'Update Ecommerce Order',
            },
            {
                method: 'put',
                path: '/item/:id',
                controller: 'updateItem',
                params: ['id'],
                body: ['key'],
                permission: 'Update Ecommerce Order Item',
            },
            {
                method: 'del',
                path: '/:id',
                controller: 'delete',
                params: ['id'],
                permission: 'Delete Ecommerce Order',
            },
        ],
    },
    // User routes for Managing Orders
    {
        basePath: '/api/ecommerce/orders',
        controllerPath: './extensions/ecommerce/user/orders/controller',
        routes: [
            {
                method: 'get',
                path: '',
                controller: 'index',
            },
            {
                method: 'post',
                path: '/create',
                controller: 'create',
                body: ['product_ids', 'quantities'],
            },
            {
                method: 'post',
                path: '/store',
                controller: 'store',
                body: ['product_id', '?discount_id'],
            },
            {
                method: 'get',
                path: '/:id',
                controller: 'show',
                params: ['id'],
            },
        ],
    },
    // Admin routes for Review Management
    {
        basePath: '/api/admin/ecommerce/reviews',
        controllerPath: './extensions/ecommerce/admin/reviews/controller',
        routes: [
            {
                method: 'get',
                path: '',
                controller: 'index',
                permission: 'View Ecommerce Reviews',
            },
            {
                method: 'get',
                path: '/:id',
                controller: 'show',
                params: ['id'],
                permission: 'View Ecommerce Review',
            },
            {
                method: 'put',
                path: '/:id',
                controller: 'update',
                params: ['id'],
                body: ['rating', 'comment', 'status'],
                permission: 'Update Ecommerce Review',
            },
            {
                method: 'del',
                path: '/:id',
                controller: 'delete',
                params: ['id'],
                permission: 'Delete Ecommerce Review',
            },
        ],
    },
    // Routes for Product Reviews
    {
        basePath: '/api/ecommerce/reviews',
        controllerPath: './extensions/ecommerce/user/reviews/controller',
        routes: [
            {
                method: 'post',
                path: '/:product_id',
                controller: 'create',
                params: ['product_id'],
                body: ['rating', 'comment'],
            },
        ],
    },
    // Routes for Discounts and Promotions
    {
        basePath: '/api/admin/ecommerce/discounts',
        controllerPath: './extensions/ecommerce/admin/discounts/controller',
        routes: [
            {
                method: 'get',
                path: '',
                controller: 'index',
                permission: 'View Ecommerce Discounts',
            },
            {
                method: 'post',
                path: '',
                controller: 'create',
                body: ['code', 'percentage', 'valid_until', 'product_id'],
                permission: 'Create Ecommerce Discount',
            },
            {
                method: 'put',
                path: '/:id',
                controller: 'update',
                params: ['id'],
                body: ['code', 'percentage', 'valid_until', 'product_id', 'status'],
                permission: 'Update Ecommerce Discount',
            },
            {
                method: 'del',
                path: '/:id',
                controller: 'delete',
                params: ['id'],
                permission: 'Delete Ecommerce Discount',
            },
        ],
    },
    // User routes for viewing discounts
    {
        basePath: '/api/ecommerce/discounts',
        controllerPath: './extensions/ecommerce/user/discounts/controller',
        routes: [
            {
                method: 'post',
                path: '/:product_id',
                controller: 'apply',
                params: ['product_id'],
                body: ['code'],
            },
        ],
    },
    // Routes for User Wishlist
    {
        basePath: '/api/ecommerce/wishlist',
        controllerPath: './extensions/ecommerce/user/wishlist/controller',
        routes: [
            {
                method: 'get',
                path: '',
                controller: 'index',
            },
            {
                method: 'post',
                path: '/add',
                controller: 'store',
                body: ['product_id'],
            },
            {
                method: 'del',
                path: '/remove/:product_id',
                controller: 'delete',
                params: ['product_id'],
            },
        ],
    },
];
