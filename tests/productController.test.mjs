import { expect } from 'chai';
import sinon from 'sinon';
import Product from '../src/models/product.js';

describe('Product Model', () => {
  const mockProduct = {
    name: 'Kawasaki Ninja 650',
    price: 10.5,
    description: null,
    isDeleted: 0,
    productViewed: 0,
    createdDate: new Date(),
    updatedDate: new Date(),
  };

  describe('Create Product', () => {
    it('should create a product successfully', async () => {
      const createStub = sinon.stub(Product, 'create').returns(Promise.resolve(mockProduct));

      const product = await Product.create(mockProduct);

      expect(product).to.have.property('name', 'Kawasaki Ninja 650');
      expect(createStub.calledOnce).to.be.true;

      createStub.restore(); // Restore the original function
    });
  });

  describe('Find Product', () => {
    it('should find a product by ID', async () => {
      const findByPkStub = sinon.stub(Product, 'findByPk').returns(Promise.resolve(mockProduct));

      const product = await Product.findByPk(1);

      expect(product).to.have.property('name', 'Kawasaki Ninja 650');
      expect(findByPkStub.calledOnce).to.be.true;

      findByPkStub.restore();
    });

    it('should return null if product not found', async () => {
      const findByPkStub = sinon.stub(Product, 'findByPk').returns(Promise.resolve(null));

      const product = await Product.findByPk(9999);

      expect(product).to.be.null;
      expect(findByPkStub.calledOnce).to.be.true;

      findByPkStub.restore();
    });
  });

  describe('Update Product', () => {
    it('should update a product successfully', async () => {
      const updateStub = sinon.stub(Product, 'update').returns(Promise.resolve([1])); // 1 means one record updated

      const result = await Product.update({ price: 12.5 }, { where: { id: 1 } });

      expect(result[0]).to.equal(1);
      expect(updateStub.calledOnce).to.be.true;

      updateStub.restore();
    });
  });

  describe('Delete Product', () => {
    it('should delete a product successfully', async () => {
      const destroyStub = sinon.stub(Product, 'destroy').returns(Promise.resolve(1)); // 1 means one record deleted

      const result = await Product.destroy({ where: { id: 1 } });

      expect(result).to.equal(1);
      expect(destroyStub.calledOnce).to.be.true;

      destroyStub.restore();
    });
  });
});
