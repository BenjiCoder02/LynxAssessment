const ProductDTO = require("../models/productDTO/productDTO");

const CURRENCY_ENDPOINT = 'https://api.currencylayer.com/convert?access_key={API_KEY}&from={fromCurr}&to={toCurr}&amount={price}';
const CURRENCY_CONVERSION_RATE = `http://api.currencylayer.com/live?access_key={API_KEY}&currencies={CURRENCIES}&source={SOURCE_CURRENCY}&format=1`;
const DEFAULT_CURRENCY = 'USD';
const SUPPORTED_CURRENCIES = ['USD', 'CAD'];


class CurrencyConversionService {

  getCurrencyConversionRateUrl = (source, target) => {
    return CURRENCY_CONVERSION_RATE
      .replace('{API_KEY}', process.env.CURRENCY_API_KEY)
      .replace('{CURRENCIES}', target)
      .replace('{SOURCE_CURRENCY}', source);
  }

  getFormattedCurrencyConvertEndpoint = (fromCurrency, toCurrency, amount) => {
    return CURRENCY_ENDPOINT
      .replace('{API_KEY}', process.env.CURRENCY_API_KEY)
      .replace('{fromCurr}', fromCurrency)
      .replace('{toCurr}', toCurrency)
      .replace('{price}', amount);
  }

  getConvertedCurrencyResult = async (currency, productPrice) => {
    const currencyResponse = await fetch(
      this.getFormattedCurrencyConvertEndpoint(DEFAULT_CURRENCY, currency, productPrice)
    );

    if (!currencyResponse.ok) {
      throw new Error('Failed to fetch currency data');
    }

    return currencyResponse.json();
  }

  getCurrencyRate = async (sourceCurrency, targetCurrency) => {
    if (sourceCurrency === targetCurrency) {
      return 1;
    }

    try {
      const response = await fetch(this.getCurrencyConversionRateUrl(sourceCurrency, targetCurrency));
      const data = await response.json();
      if (data.success) {
        const conversionRate = data.quotes[`${sourceCurrency}${targetCurrency}`];
        return conversionRate;
      } else {
        throw new Error(`Error fetching conversion rate: ${data.error.info}`);
      }
    } catch (error) {
      console.error('Error fetching currency rate:', error.message);
      throw error;
    }
  }

  convertCurrency = async (product, currency) => {
    if (currency === DEFAULT_CURRENCY) {
      return Promise.resolve(product);
    }

    try {
      const currencyData = await this.getConvertedCurrencyResult(currency, product.price);
      product.price = currencyData?.result || product.price; // Fallback to original price if conversion fails

      return Promise.resolve(product);
    } catch (currencyErr) {

      console.error('Currency conversion failed:', currencyErr);

      return Promise.reject(currencyErr);
    }
  }

  convertPricesToCurrency = async (currency, products) => {
    let conversionRate = 1;

    // Check if currency conversion is needed
    if (currency && SUPPORTED_CURRENCIES.includes(currency)) {
      conversionRate = await this.getCurrencyRate(DEFAULT_CURRENCY, currency);
    }

    // Convert currency for each product using the fetched conversion rate
    for (let product of products) {
      if (conversionRate !== 1) {
        product.price *= conversionRate;
        product.price = parseFloat(product.price.toFixed(2)); // Keep the price as a float with two decimals
      }
    }

    return products.map((product) => new ProductDTO(product));
  };

}

module.exports = new CurrencyConversionService();
