export default function decorate(block) {
  // Get all p tags and images from the first div
  const firstDiv = block.querySelector('div');
  if (!firstDiv) return;

  const pTags = [...firstDiv.querySelectorAll('p')];
  const images = [...firstDiv.querySelectorAll('picture')];

  // Field names in order
  const fieldOrder = ['product_title', 'product_descr', 'product_price', 'release_region', 'product_image', 'release_date'];

  // Clear the block
  block.innerHTML = '';

  let pIndex = 0;
  let imgIndex = 0;

  // Create a wrapper for each field
  fieldOrder.forEach((fieldName) => {
    const wrapper = document.createElement('div');
    wrapper.className = fieldName;

    const valueDiv = document.createElement('div');
    valueDiv.className = `${fieldName}-value`;

    // Handle image field
    if (fieldName === 'product_image' && images[imgIndex]) {
      valueDiv.appendChild(images[imgIndex]);
      imgIndex++;
    } else if (pTags[pIndex]) {
      // Handle text/richtext/date fields
      valueDiv.appendChild(pTags[pIndex]);
      pIndex++;
    }

    wrapper.appendChild(valueDiv);
    block.appendChild(wrapper);
  });
}
