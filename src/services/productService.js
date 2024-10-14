const { Op } = require("sequelize");
const Product = require("../models/product");
const ProductDTO = require("../models/productDTO/productDTO");
const cachingService = require("./cachingService");
const CACHE_KEYS = require("../config/cachekeys");
const currencyConversionService = require("./currencyConversionService");


const productService = {

  currencyConversionService: currencyConversionService,

  findProductById: async (id) => await Product.findOne({ where: { id: parseInt(id) } }),

  findAllByViewCount: async (maxResults) => {
    const cacheData = cachingService.getCacheWithKey(CACHE_KEYS.MOST_VIEWED);

    if (cacheData) {
      return cacheData;
    }

    const mostViewedProducts = await Product.findAll({
      where: { productViewed: { [Op.gt]: 0 } }, // Only products with views
      order: [['productViewed', 'DESC']],
      limit: maxResults,
    });
    cachingService.setCacheWithKey(CACHE_KEYS.MOST_VIEWED, mostViewedProducts);

    return mostViewedProducts;
  },

  incrementViewCount: async (product) => {
    // Clear most-viewed cache since we are updating the view count to prevent stale data being served
    cachingService.evictCache(CACHE_KEYS.MOST_VIEWED);
    product.productViewed += 1;
    await product.save();
  },

  handleErrorResponse: (h, code, message) => h.response({ error: message }).code(code),

  getProduct: async (id, currency, h) => {
    const product = await productService.findProductById(id);
    if (!product) {
      return productService.handleErrorResponse(h, 404, 'Product not found');
    }

    await productService.incrementViewCount(product);

    if (currency) {
      await currencyConversionService.convertCurrency(product, currency);
    }

    return new ProductDTO(product);
  },

  getMostViewedProducts: async (maxResults, currency, h) => {
    const products = await productService.findAllByViewCount(maxResults);

    if (products.length === 0) {
      return h.response({ message: 'No viewed products found.' }).code(404);
    }

    return currencyConversionService.convertPricesToCurrency(currency, products);
  }
}

module.exports = productService;
