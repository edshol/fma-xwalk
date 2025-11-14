export default function decorate(block) {
  // Get the block's data
  const rows = [...block.children];

  // Create product container
  const productContainer = document.createElement('div');
  productContainer.className = 'product-container';

  // Process each row to extract product data
  const productData = {};
  rows.forEach((row) => {
    const cells = [...row.children];
    if (cells.length >= 2) {
      const key = cells[0].textContent.trim();
      const value = cells[1];
      productData[key] = value;
    }
  });

  // Create product title
  if (productData.product_title) {
    const title = document.createElement('h2');
    title.className = 'product-title';
    title.textContent = productData.product_title.textContent.trim();
    productContainer.append(title);
  }

  // Create product description
  if (productData.product_descr) {
    const description = document.createElement('div');
    description.className = 'product-description';
    description.innerHTML = productData.product_descr.innerHTML;
    productContainer.append(description);
  }

  // Create product price
  if (productData.product_price) {
    const price = document.createElement('div');
    price.className = 'product-price';
    const priceValue = productData.product_price.textContent.trim();
    price.textContent = `¥${priceValue}`;
    productContainer.append(price);
  }

  // Replace block content
  block.textContent = '';
  block.append(productContainer);
}
