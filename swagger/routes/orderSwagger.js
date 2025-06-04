/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management and retrieval
 */

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Create a order
 *     description: USER can create order.
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/createOrder'
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 doc:
 *                     $ref: '#/components/schemas/Order'
 *       "400":
 *         $ref: '#/components/responses/DuplicateEmail'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 *   get:
 *     summary: Get all orders
 *     description: USER,ADMIN can retrieve all orders.
 *     tags: [Orders]
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: query
 *         name: fields
 *         schema:
 *           type: string
 *         description: what fields do you want to show (ex. name,price)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 10
 *         description: Maximum number of orders
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: key-words you want to search about it
 *       - in: query
 *         name: agg
 *         schema:
 *           type: string
 *         description: group data by any field  (ex. {group=[brand],max=price,min= price,sum=price,avg=price})
 *       - in: query
 *         name: aggDate
 *         schema:
 *           type: string
 *         description: group data by date fields   (ex. {group=[createdAt],date=month,max=price,min=price,avg=price,year=2022})
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: sort by query in the form of field:desc/asc (ex. name,-price)
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 doc:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Order'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Get a order
 *     description: USER,ADMIN can use this router.
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 doc:
 *                     $ref: '#/components/schemas/Order'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     summary: Update a order
 *     description: ADMIN can use this router.
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order id
 *     requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/updateOrder'
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 doc:
 *                     $ref: '#/components/schemas/Order'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   delete:
 *     summary: Delete a  order.
 *     description: ADMIN can use this router.
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: string
 *                   example: null
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */

exports.Order = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    // property
    methodePayment: { type: 'string', enum: ['cash', 'bank'] },
    status: {
      type: 'string',
      enum: ['wating', 'preparing', 'dlivery', 'done'],
    },
    total: { type: 'number' },
    address: {
      type: 'object',
      properties: {
        //  properties address
        descreption: { type: 'string' },

        street: { type: 'string' },

        region: { type: 'string' },
      },
    },
    cart: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          //  properties cart
          amount: { type: 'number' },

          price: { type: 'number' },

          product: { type: 'string' },
        },
      },
    },
    user: { type: 'string' },
  },
  example: {
    _id: '5ebac534954b54139806c112',
    // property example
    methodePayment: 'cash',

    status: 'wating',

    total: 5000,

    address: {
      // property example address
      descreption: 'desc',

      street: 'vilat',

      region: 'new aleppo',
    },

    cart: [
      {
        // property example cart
        amount: 3,

        price: 200,

        productId: '673c40cd59e293827f79e398',
      },
    ],

    userId: '673c40cd59e293827f79e398',

    createdAt: '2024-11-24T16:35:04.438Z',
    updatedAt: '2024-11-24T16:35:04.438Z',
  },
};
exports.createOrder = {
  type: 'object',
  properties: {
    // create property
    methodePayment: { type: 'string', enum: ['cash', 'bank'] },
    status: {
      type: 'string',
      enum: ['wating', 'preparing', 'dlivery', 'done'],
    },
    total: { type: 'number' },
    address: {
      type: 'object',
      properties: {
        //  create  properties address
        descreption: { type: 'string' },

        street: { type: 'string' },

        region: { type: 'string' },
      },
    },
    cart: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          //  create  properties cart
          amount: { type: 'number' },

          price: { type: 'number' },

          product: { type: 'string' },
        },
      },
    },
  },
  example: {
    // create property example
    methodePayment: 'cash',

    status: 'wating',

    total: 5000,

    address: {
      // create property example address
      descreption: 'desc',

      street: 'vilat',

      region: 'new aleppo',
    },

    cart: [
      {
        // create property example cart
        amount: 3,

        price: 200,

        productId: '673c40cd59e293827f79e398',
      },
    ],
  },
  required: [
    // required property
    'address.descreption',

    'address.street',

    'address.region',

    'total',

    'cart.amount',

    'cart.price',

    'cart.product',

    'user',
  ],
};
exports.updateOrder = {
  type: 'object',
  properties: {
    // update property
    methodePayment: { type: 'string', enum: ['cash', 'bank'] },
    status: {
      type: 'string',
      enum: ['wating', 'preparing', 'dlivery', 'done'],
    },
    total: { type: 'number' },
    address: {
      type: 'object',
      properties: {
        //  update properties address
        descreption: { type: 'string' },

        street: { type: 'string' },

        region: { type: 'string' },
      },
    },
    cart: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          //  update properties cart
          amount: { type: 'number' },

          price: { type: 'number' },

          product: { type: 'string' },
        },
      },
    },
  },
  example: {
    // update property example
    methodePayment: 'cash',

    status: 'wating',

    total: 5000,

    address: {
      // update property example address
      descreption: 'desc',

      street: 'vilat',

      region: 'new aleppo',
    },

    cart: [
      {
        // update property example cart
        amount: 3,

        price: 200,

        productId: '673c40cd59e293827f79e398',
      },
    ],
  },
};
