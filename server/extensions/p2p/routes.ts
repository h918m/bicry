export default [
  {
    basePath: '/api/admin/p2p/analytics',
    controllerPath: './extensions/p2p/admin/analytics/controller',
    routes: [
      {
        method: 'get',
        path: '',
        controller: 'index',
        permission: 'Access P2P Management',
      },
    ],
  },
  {
    basePath: '/api/admin/p2p/payment-methods',
    controllerPath: './extensions/p2p/admin/payment-methods/controller',
    routes: [
      {
        method: 'get',
        path: '',
        controller: 'index',
        permission: 'View P2P Payment Methods',
      },
      {
        method: 'put',
        path: '/:id',
        controller: 'update',
        params: ['id'],
        body: ['name', 'instructions', '?image', 'status', 'currency'],
        permission: 'Update P2P Payment Method',
      },
      {
        method: 'del',
        path: '/:id',
        controller: 'delete',
        params: ['id'],
        permission: 'Delete P2P Payment Method',
      },
    ],
  },

  {
    basePath: '/api/p2p/payment-methods',
    controllerPath: './extensions/p2p/user/payment-methods/controller',
    routes: [
      { method: 'get', path: '', controller: 'index' },
      { method: 'get', path: '/:id', controller: 'show', params: ['id'] },
      {
        method: 'post',
        path: '',
        controller: 'create',
        body: ['name', 'instructions', 'currency', '?image'],
      },
      {
        method: 'put',
        path: '/:id',
        controller: 'update',
        params: ['id'],
        body: ['name', 'instructions', 'currency', '?image'],
      },
      {
        method: 'del',
        path: '/:id',
        controller: 'delete',
        params: ['id'],
      },
    ],
  },

  {
    basePath: '/api/admin/p2p/offers',
    controllerPath: './extensions/p2p/admin/offers/controller',
    routes: [
      {
        method: 'get',
        path: '',
        controller: 'index',
        permission: 'View P2P Offers',
      },
      {
        method: 'get',
        path: '/:id',
        controller: 'show',
        params: ['id'],
        permission: 'View P2P Offer Details',
      },
      {
        method: 'put',
        path: '/:id',
        controller: 'update',
        params: ['id'],
        body: ['status'],
        permission: 'Update P2P Offer',
      },
      {
        method: 'del',
        path: '/:id',
        controller: 'delete',
        params: ['id'],
        permission: 'Delete P2P Offer',
      },
    ],
  },

  {
    basePath: '/api/p2p/offers',
    controllerPath: './extensions/p2p/user/offers/controller',
    routes: [
      {
        method: 'get',
        path: '',
        controller: 'index',
      },
      {
        method: 'get',
        path: '/user',
        controller: 'userOffers',
      },
      {
        method: 'get',
        path: '/show/:uuid',
        controller: 'show',
        params: ['uuid'],
      },
      {
        method: 'get',
        path: '/fetch/:uuid',
        controller: 'showUuid',
        params: ['uuid'],
      },
      {
        method: 'post',
        path: '',
        controller: 'create',
        body: [
          'wallet_type',
          'currency',
          'amount',
          'price',
          'payment_method_id',
          'min_amount',
          'max_amount',
        ],
      },
      {
        method: 'put',
        path: '/edit/:uuid',
        controller: 'edit',
        params: ['uuid'],
        body: ['min_amount', 'max_amount'],
      },
      {
        method: 'put',
        path: '/:uuid',
        controller: 'update',
        params: ['uuid'],
        body: ['status'],
      },
    ],
  },

  {
    basePath: '/api/admin/p2p/trades',
    controllerPath: './extensions/p2p/admin/trades/controller',
    routes: [
      {
        method: 'get',
        path: '',
        controller: 'index',
        permission: 'View P2P Trades',
      },
      {
        method: 'get',
        path: '/:id',
        controller: 'show',
        params: ['id'],
        permission: 'View P2P Trade Details',
      },
      {
        method: 'put',
        path: '/:id',
        controller: 'update',
        params: ['id'],
        body: ['status'],
        permission: 'Update P2P Trade',
      },
      {
        method: 'put',
        path: '/:id/cancel',
        controller: 'cancel',
        params: ['id'],
        permission: 'Cancel P2P Trade',
      },
      {
        method: 'put',
        path: '/:id/complete',
        controller: 'complete',
        params: ['id'],
        permission: 'Complete P2P Trade',
      },
    ],
  },

  {
    basePath: '/api/p2p/trades',
    controllerPath: './extensions/p2p/user/trades/controller',
    routes: [
      { method: 'get', path: '', controller: 'index' },
      { method: 'get', path: '/:uuid', controller: 'show', params: ['uuid'] },
      {
        method: 'post',
        path: '',
        controller: 'store',
        body: ['offer_id', 'amount'],
      },
      {
        method: 'post',
        path: '/:uuid/chat',
        controller: 'sendMessage',
        params: ['uuid'],
        body: ['message', 'isSeller'],
      },
      {
        method: 'post',
        path: '/:uuid/cancel',
        controller: 'cancelTrade',
        params: ['uuid'],
      },
      {
        method: 'post',
        path: '/:uuid/markAsPaid',
        controller: 'markTradeAsPaid',
        params: ['uuid'],
        body: ['txHash'],
      },
      {
        method: 'post',
        path: '/:uuid/dispute',
        controller: 'disputeTrade',
        params: ['uuid'],
        body: ['reason'],
      },
      {
        method: 'post',
        path: '/:uuid/cancelDispute',
        controller: 'cancelDispute',
        params: ['uuid'],
      },
      {
        method: 'post',
        path: '/:uuid/release',
        controller: 'releaseTrade',
        params: ['uuid'],
      },
      {
        method: 'post',
        path: '/:uuid/refund',
        controller: 'refundTrade',
        params: ['uuid'],
      },
    ],
  },

  {
    basePath: '/api/admin/p2p/escrow',
    controllerPath: './extensions/p2p/admin/escrow/controller',
    routes: [
      {
        method: 'get',
        path: '',
        controller: 'index',
        permission: 'View P2P Escrow',
      },
      {
        method: 'get',
        path: '/:id',
        controller: 'show',
        params: ['id'],
        permission: 'View P2P Escrow Details',
      },
    ],
  },

  {
    basePath: '/api/admin/p2p/disputes',
    controllerPath: './extensions/p2p/admin/disputes/controller',
    routes: [
      {
        method: 'get',
        path: '',
        controller: 'index',
        permission: 'View P2P Disputes',
      },
      {
        method: 'get',
        path: '/:id',
        controller: 'show',
        params: ['id'],
        permission: 'View P2P Dispute Details',
      },
      {
        method: 'put',
        path: '/:id',
        controller: 'resolve',
        params: ['id'],
        body: ['resolution'],
        permission: 'Resolve P2P Dispute',
      },
      {
        method: 'put',
        path: '/:id/markAsResolved',
        controller: 'markAsResolved',
        params: ['id'],
        permission: 'Resolve P2P Dispute',
      },
    ],
  },

  {
    basePath: '/api/p2p/disputes',
    controllerPath: './extensions/p2p/user/disputes/controller',
    routes: [
      { method: 'get', path: '', controller: 'index' },
      { method: 'get', path: '/:id', controller: 'show', params: ['id'] },
      {
        method: 'post',
        path: '/create',
        controller: 'create',
        body: ['trade_id', 'reason'],
      },
    ],
  },

  {
    basePath: '/api/admin/p2p/reviews',
    controllerPath: './extensions/p2p/admin/reviews/controller',
    routes: [
      {
        method: 'get',
        path: '',
        controller: 'index',
        permission: 'View P2P Reviews',
      },
      {
        method: 'get',
        path: '/:id',
        controller: 'show',
        params: ['id'],
        permission: 'View P2P Review Details',
      },
      {
        method: 'del',
        path: '/:id',
        controller: 'delete',
        params: ['id'],
        permission: 'Delete P2P Review',
      },
    ],
  },

  {
    basePath: '/api/p2p/reviews',
    controllerPath: './extensions/p2p/user/reviews/controller',
    routes: [
      {
        method: 'post',
        path: '/:uuid',
        controller: 'create',
        params: ['uuid'],
        body: ['rating', 'comment'],
      },
    ],
  },
]
