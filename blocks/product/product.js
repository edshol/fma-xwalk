export default function decorate(block) {
  // Get all p tags from the first div
  const firstDiv = block.querySelector('div');
  if (!firstDiv) return;

  const pTags = [...firstDiv.querySelectorAll('p')];

  // Field names in order
  const fieldOrder = ['product_title', 'product_descr', 'product_price'];

  // Clear the block
  block.innerHTML = '';

  // Create a wrapper for each field
  pTags.forEach((p, index) => {
    if (index < fieldOrder.length) {
      const fieldName = fieldOrder[index];
      const wrapper = document.createElement('div');
      wrapper.className = fieldName;

      const valueDiv = document.createElement('div');
      valueDiv.className = `${fieldName}-value`;
      valueDiv.appendChild(p);

      wrapper.appendChild(valueDiv);
      block.appendChild(wrapper);
    }
  });
}
