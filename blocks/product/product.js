// export default function decorate(block) {
//   // Get all p tags and images from the first div
//   const firstDiv = block.querySelector('div');
//   if (!firstDiv) return;

//   const pTags = [...firstDiv.querySelectorAll('p')];
//   const images = [...firstDiv.querySelectorAll('picture')];

//   console.log('Number of p tags:', pTags.length);
//   console.log('Number of images:', images.length);
//   console.log('P tags content:', pTags.map(p => p.textContent));

//   // Field names in order
//   const fieldOrder = ['product_title', 'product_descr', 'product_price', 'release_region', 'product_image', 'release_date'];

//   // Clear the block
//   block.innerHTML = '';

//   let pIndex = 0;
//   let imgIndex = 0;

//   // Create a wrapper for each field
//   fieldOrder.forEach((fieldName) => {
//     console.log(`Processing field: ${fieldName}, pIndex: ${pIndex}, imgIndex: ${imgIndex}`);

//     const wrapper = document.createElement('div');
//     wrapper.className = fieldName;

//     const valueDiv = document.createElement('div');
//     valueDiv.className = `${fieldName}-value`;

//     // Handle image field
//     if (fieldName === 'product_image') {
//       if (images[imgIndex]) {
//         valueDiv.appendChild(images[imgIndex]);
//         imgIndex++;
//       }
//       // Always add the wrapper even if there's no image
//       wrapper.appendChild(valueDiv);
//       block.appendChild(wrapper);
//     } else {
//       // Handle text/richtext/date fields
//       if (pTags[pIndex]) {
//         valueDiv.appendChild(pTags[pIndex]);
//         pIndex++;
//       }
//       wrapper.appendChild(valueDiv);
//       block.appendChild(wrapper);
//     }
//   });
// }
