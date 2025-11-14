export default function decorate(block) {
  // Wrap each column with appropriate class
  [...block.children].forEach((row) => {
    [...row.children].forEach((col, index) => {
      if (index === 0) {
        // First column is the label
        col.classList.add('product-label');
      } else {
        // Second column is the value
        col.classList.add('product-value');
      }
    });
  });
}
