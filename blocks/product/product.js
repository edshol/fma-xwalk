export default function decorate(block) {
  // 最初のdivから全ての直接の子要素を取得
  const firstDiv = block.querySelector('div');
  if (!firstDiv) return;

  // 全ての子ノード（pタグ、画像など）を順番に取得
  const children = [...firstDiv.children];

  // フィールド設定とデフォルト値（component-models.jsonの順序と一致させる必要がある）
  const fields = [
    { name: 'product_title', type: 'text', default: 'Product Title' },
    { name: 'product_descr', type: 'richtext', default: '<p>Product description goes here</p>' },
    { name: 'product_price', type: 'text', default: '1000' },
    { name: 'release_region', type: 'text', default: 'National release' },
    { name: 'product_image', type: 'image', default: null },
    { name: 'release_date', type: 'text', default: '2025-01-01' }
  ];

  // ブロックをクリア
  block.innerHTML = '';

  // models.jsonの順序に基づいて各フィールドを処理
  fields.forEach((field, index) => {
    const wrapper = document.createElement('div');
    wrapper.className = field.name;

    const valueDiv = document.createElement('div');
    valueDiv.className = `${field.name}-value`;

    // 対応する子要素を取得
    const childElement = children[index];

    if (childElement) {
      // 子要素が存在する場合、コンテンツがあるかチェック
      const hasContent = childElement.textContent.trim() || childElement.querySelector('picture');

      if (hasContent) {
        // コンテンツがある場合はそれを使用
        valueDiv.appendChild(childElement);
      } else {
        // 空の要素の場合はデフォルト値を使用
        if (field.type === 'richtext') {
          valueDiv.innerHTML = field.default;
        } else if (field.type !== 'image') {
          const p = document.createElement('p');
          p.textContent = field.default;
          valueDiv.appendChild(p);
        }
      }
    } else {
      // このインデックスに子要素がない場合はデフォルト値を使用
      if (field.type === 'richtext') {
        valueDiv.innerHTML = field.default;
      } else if (field.type !== 'image') {
        const p = document.createElement('p');
        p.textContent = field.default;
        valueDiv.appendChild(p);
      }
    }

    wrapper.appendChild(valueDiv);
    block.appendChild(wrapper);
  });
}
