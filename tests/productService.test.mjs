import { expect } from 'chai';
import sinon from 'sinon';
import productService from '../src/services/productService.js';
import Product from '../src/models/product.js';
import ProductDTO from '../src/models/productDTO/productDTO.js';
import cachingService from '../src/services/cachingService.js';
import CACHE_KEYS from '../src/config/cachekeys.js';


const date = new Date();
const expectedProductDTO = {
  name: 'Sample Product',
  productViewed: 0,
  price: 100,
  description: null,
  isDeleted: 0,
  createdDate: date,
  updatedDate: date,
};
const product = { ...expectedProductDTO, id: 1, deletedDate: null, };



describe('Product Service - findProductById', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should return a product by ID', async () => {
    sinon.stub(Product, 'findOne').resolves(product);

    const result = await productService.findProductById(1);
    expect(result).to.equal(product);
  });

  it('should return null if no product is found', async () => {
    sinon.stub(Product, 'findOne').resolves(null);

    const result = await productService.findProductById(999);
    expect(result).to.be.null;
  });
});

describe('Product Service - findAllByViewCount', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should return cached data if available', async () => {
    const cacheData = [product];
    sinon.stub(cachingService, 'getCacheWithKey').returns(cacheData);

    const result = await productService.findAllByViewCount(5);
    expect(result).to.equal(cacheData);
  });

  it('should fetch products from the database if cache is empty', async () => {
    const products = [product];
    sinon.stub(cachingService, 'getCacheWithKey').returns(null);
    sinon.stub(Product, 'findAll').resolves(products);
    const setCacheStub = sinon.stub(cachingService, 'setCacheWithKey');

    const result = await productService.findAllByViewCount(5);
    expect(result).to.equal(products);
    expect(setCacheStub.calledWith(CACHE_KEYS.MOST_VIEWED, products)).to.be.true;
  });
});

describe('Product Service - incrementViewCount', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should increment the view count of the product', async () => {
    const productEntity = { ...product, save: sinon.stub().resolves() };
    const evictCacheStub = sinon.stub(cachingService, 'evictCache');

    await productService.incrementViewCount(productEntity);
    expect(productEntity.productViewed).to.equal(1);
    expect(productEntity.save.calledOnce).to.be.true;
    expect(evictCacheStub.calledWith(CACHE_KEYS.MOST_VIEWED)).to.be.true;
  });
});

describe('Product Service - convertCurrency', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should convert the product price if the API request is successful', async () => {
    const fetchStub = sinon.stub(global, 'fetch').resolves({
      ok: true,
      json: () => Promise.resolve({ result: 100 }),
    });

    await productService.convertCurrency(product, 'USD');
    expect(product.price).to.equal(100);
  });

  it('should throw an error if the API request fails', async () => {
    const product = { price: 100 };
    sinon.stub(global, 'fetch').resolves({ ok: false }); // Simulate a failed API request

    try {
      await productService.convertCurrency(product, 'USD');
    } catch (err) {
      expect(err.message).to.equal('Failed to fetch currency data'); // Check the error message
    }

    expect(product.price).to.equal(100); // Price should remain unchanged
  });


});

describe('Product Service - getProduct', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should return a product DTO when product is found', async () => {
    sinon.stub(productService, 'findProductById').resolves(product);
    sinon.stub(productService, 'incrementViewCount').resolves();
    sinon.stub(productService, 'convertCurrency').resolves();  // Stub convertCurrency to prevent it from running
    sinon.stub(ProductDTO, 'call').returns(expectedProductDTO);

    const result = await productService.getProduct(1, 'USD', { response: () => ({ code: () => { } }) });

    // Check that the product DTO matches expected values
    expect(result).to.deep.equal(expectedProductDTO);
  });

  it('should return a 404 error if the product is not found', async () => {
    sinon.stub(productService, 'findProductById').resolves(null);
    const h = { response: sinon.stub().returns({ code: sinon.stub() }) };

    const result = await productService.getProduct(999, 'USD', h);
    expect(h.response.calledWith({ error: 'Product not found' })).to.be.true;
  });
});




