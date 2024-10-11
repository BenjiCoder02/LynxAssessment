const { Op } = require("sequelize");
const Product = require("../models/product");
const ProductDTO = require("../models/productDTO/productDTO");

const DEFAULT_CURRENCY = 'USD';
const CURRENCY_ENDPOINT = 'https://api.currencylayer.com/convert?access_key={API_KEY}&from={fromCurr}&to={toCurr}&amount={price}';
const SUPPORTED_CURRENCIES = ['USD', 'CAD']

const productService = {

  findProductById: async (id) => {
    return await Product.findOne({ where: { id: parseInt(id) } });
  },

  findAllByViewCount: async (maxResults) => {
    return await Product.findAll({
      where: { productViewed: { [Op.gt]: 0 } }, // Only products with views
      order: [['productViewed', 'DESC']],
      limit: maxResults,
    });
  },

  incrementViewCount: async (product) => {
    product.productViewed += 1;
    await product.save();
  },

  convertCurrency: async (product, currency) => {
    try {
      const currencyResponse = await fetch(
        productService.getFormattedCurrencyConvertEndpoint(DEFAULT_CURRENCY, currency, product.price)
      );

      if (!currencyResponse.ok) {
        throw new Error('Failed to fetch currency data');
      }

      const currencyData = await currencyResponse.json();
      product.price = currencyData?.result || product.price; // Fallback to original price if conversion fails
    } catch (currencyErr) {

      console.error('Currency conversion failed:', currencyErr);
    }
  },

  getFormattedCurrencyConvertEndpoint: (fromCurrency, toCurrency, amount) => {
    return CURRENCY_ENDPOINT
      .replace('{API_KEY}', process.env.CURRENCY_API_KEY)
      .replace('{fromCurr}', fromCurrency)
      .replace('{toCurr}', toCurrency)
      .replace('{price}', amount);
  },

  handleErrorResponse: (h, code, message) => {
    return h.response({ error: message }).code(code);
  },

  getProduct: async (id, currency, h) => {
    const product = await productService.findProductById(id);
    if (!product) {
      return productService.handleErrorResponse(h, 404, 'Product not found');
    }

    await productService.incrementViewCount(product);

    if (currency) {
      await productService.convertCurrency(product, currency);
    }

    return new ProductDTO(product);
  },

  getMostViewedProducts: async (maxResults, currency, h) => {
    const products = await productService.findAllByViewCount(maxResults);

    if (products.length === 0) {
      return h.response({ message: 'No viewed products found.' }).code(404);
    }

    // convert currency if requested
    if (currency && SUPPORTED_CURRENCIES.includes(currency)) {
      for (const product of products) {
        await productService.convertCurrency(product, currency);
      }
    }

    const productDTOs = products.map(product => new ProductDTO(product));

    return productDTOs;
  }
}

module.exports = productService;
