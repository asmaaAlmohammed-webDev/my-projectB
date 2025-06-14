const swaggerJsDoc = require('swagger-jsdoc');
const {
  Review,
  createReview,
  updateReview,
} = require('./routes/reviewSwagger');
const {
  Conact,
  createConact,
  updateConact,
} = require('./routes/conactSwagger');
const {
  Category,
  createCategory,
  updateCategory,
} = require('./routes/categorySwagger');
const { Order, createOrder, updateOrder } = require('./routes/orderSwagger');
const {
  Product,
  createProduct,
  updateProduct,
} = require('./routes/productSwagger');
const { signUp } = require('./routes/auth');
const { User, updateMe, createUser } = require('./routes/users');
const {
  DuplicateEmail,
  Error,
  Forbidden,
  NotFound,
  Unauthorized,
} = require('./components');

const options = {
  url: '',
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'REST API Docs',
      version: '1.0.0',
      description:
        'This is an API simpel Auth made with Express and documented with Swagger',
    },
    servers: [
      {
        url: 'http://localhost:7000/api/v1.0.0',
        description: 'Development server',
      },
    ],
    components: {
      schemas: {
        Review,
        createReview,
        updateReview,
        Conact,
        createConact,
        updateConact,
        Category,
        createCategory,
        updateCategory,
        Order,
        createOrder,
        updateOrder,
        Product,
        createProduct,
        updateProduct,
        signUp,
        createUser,
        updateMe,
        User,
        Error,
      },
      securitySchemes: {
        Bearer: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter the token : abcde12345".',
        },
      },
      responses: {
        DuplicateEmail,
        Forbidden,
        NotFound,
        Unauthorized,
        201: {
          description: 'created',
        },
        200: {
          description: 'ok',
        },
        204: {
          description: 'No content',
        },
        400: {
          description: 'Bad request',
        },
        401: {
          description: 'Unauthorized',
        },
        403: {
          description: 'Forbidden',
        },
        404: {
          description: 'Not found',
        },
        500: {
          description: 'Internal server error',
        },
      },
    },
  },
  apis: ['./swagger/routes/*.js'],
};
const swaggerSpec = swaggerJsDoc(options);
module.exports = swaggerSpec;
