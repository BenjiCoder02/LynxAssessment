const Joi = require('@hapi/joi');
const productController = require("../controllers/productController");

const productRoutes = [
  {
    method: 'GET',
    path: '/api/v1/products/{id?}',
    handler: productController.getProducts,
    options: {
      validate: {
        params: Joi.object({
          id: Joi.string().optional()
        }),
        query: Joi.object({
          currency: Joi.string().optional().valid('USD', 'CAD')
        })
      }
    }
  },
  {
    method: 'GET',
    path: '/api/v1/products/most-viewed',
    handler: productController.getMostViewedProducts,
    options: {
      validate: {
        query: Joi.object({
          currency: Joi.string().optional().valid('USD', 'CAD')
        })
      }
    }
  }
]

module.exports = productRoutes;
