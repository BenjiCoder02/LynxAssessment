const productService = require("../services/productService");
const SUPPORTED_CURRENCIES = ['USD', 'CAD'];



const productController = {

  getProducts: async (req, h) => {
    const { id } = req.params;
    const { currency } = req.query;

    if (!id) {
      return productService.handleErrorResponse(h, 400, 'ID is required');
    }

    if (currency && !SUPPORTED_CURRENCIES.includes(currency)) {
      return productService.handleErrorResponse(h, 400, 'Currency must be either USD or CAD');
    }

    try {
      const dto = await productService.getProduct(id, currency, h);
      return h.response(dto).code(200);
    } catch (err) {
      console.error('Error fetching product:', err);
      return productService.handleErrorResponse(h, 500, 'An error occurred while fetching the product.');
    }
  },

  getMostViewedProducts: async (req, h) => {
    const { limit } = req.query;
    const maxResults = limit ? parseInt(limit) : 5; // Default to top 5 products

    if (isNaN(maxResults) || maxResults < 1) {
      return productService.handleErrorResponse(h, 400, 'Limit must be a positive integer.');
    }

    try {
      const productDTOs = await productService.getMostViewedProducts(maxResults, req.query.currency, h);

      return h.response(productDTOs).code(200);
    } catch (err) {
      console.error('Error fetching most viewed products:', err);
      return productService.handleErrorResponse(h, 500, 'An error occurred while fetching the most viewed products.');
    }
  },
};

module.exports = productController;
