function decorateReleaseRegion(element) {
  const text = element.textContent.trim();
  if (!text) return;

  // カンマで分割
  const regions = text.split(',').map(r => r.trim());

  // コンテナを作成
  const container = document.createElement('div');
  container.className = 'release-region-container';

  regions.forEach(region => {
    // "地域名:値" の形式をパース
    const parts = region.split(':');
    if (parts.length === 2) {
      const name = parts[0].trim();
      const value = parts[1].trim();

      // タグ要素を作成
      const tag = document.createElement('span');
      tag.className = 'region-tag';

      // 地域名を表示用spanに
      const nameSpan = document.createElement('span');
      nameSpan.className = 'region-name';
      nameSpan.textContent = name;

      // 値を非表示用spanに（データとして保持）
      const valueSpan = document.createElement('span');
      valueSpan.className = 'region-value';
      valueSpan.textContent = ':' + value + ',';

      tag.appendChild(nameSpan);
      tag.appendChild(valueSpan);

      // 値が1なら水色背景、0ならグレー背景
      if (value === '1') {
        tag.classList.add('active');
      } else {
        tag.classList.add('inactive');
      }

      container.appendChild(tag);
    }
  });

  // 元のテキストを置き換え
  element.textContent = '';
  element.appendChild(container);
}

export default function decorate(block) {
  // AEM出力順序に対応するフィールド名
  const fieldNames = [
    'release_region',
    'release_date',
    'product_title',
    'product_image',
    'product_descr',
    'product_price',
    'remarks',
    'allergy'
  ];

  // すべてのp要素を取得（フィールドの値が格納されている）
  const allPElements = Array.from(block.querySelectorAll('div > div > p'));

  // 各p要素にフィールド名のクラスを付与
  allPElements.forEach((pElement, index) => {
    if (index < fieldNames.length) {
      const fieldName = fieldNames[index];
      pElement.classList.add(fieldName);

      // release_regionの場合は特別処理
      if (fieldName === 'release_region') {
        decorateReleaseRegion(pElement);
      }
    }
  });
}
