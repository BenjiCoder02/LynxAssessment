class ProductDTO {
  constructor(product) {
    this.name = product.name;
    this.price = product.price;
    this.description = product.description;
    this.isDeleted = product.isDeleted;
    this.productViewed = product.productViewed;
    this.createdDate = product.createdDate;
    this.updatedDate = product.updatedDate;
  }
}

module.exports = ProductDTO;
