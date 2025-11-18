function decorateReleaseRegion(element) {
  const text = element.textContent.trim();
  if (!text) return;

  // スラッシュで分割
  const regions = text.split('/').filter(r => r.trim());

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
      valueSpan.textContent = ':' + value;

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

function decorateProductPrice(element) {
  const text = element.textContent.trim();
  if (!text) return;

  // 数値を取得
  const price = parseFloat(text);
  if (isNaN(price)) return;

  // 8%の消費税を加算
  const taxIncludedPrice = Math.floor(price * 1.08);

  // フォーマット: XXX円(税込XXX円)
  element.textContent = `${price}円(税込${taxIncludedPrice}円)`;
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

      // product_priceの場合は価格フォーマット処理
      if (fieldName === 'product_price') {
        decorateProductPrice(pElement);
      }
    }
  });

  // 2列レイアウト用のコンテナを作成
  const productImage = block.querySelector('.product_image');
  const productDescr = block.querySelector('.product_descr');
  const productPrice = block.querySelector('.product_price');
  const remarks = block.querySelector('.remarks');
  const allergy = block.querySelector('.allergy');

  if (productImage && productDescr) {
    // 2列コンテナを作成
    const twoColumnContainer = document.createElement('div');
    twoColumnContainer.className = 'product-two-column';

    // 左列（画像）
    const leftColumn = document.createElement('div');
    leftColumn.className = 'product-left-column';
    leftColumn.appendChild(productImage);

    // 右列（説明、価格、備考、アレルギー）
    const rightColumn = document.createElement('div');
    rightColumn.className = 'product-right-column';
    if (productDescr) rightColumn.appendChild(productDescr);
    if (productPrice) rightColumn.appendChild(productPrice);
    if (remarks) rightColumn.appendChild(remarks);
    if (allergy) rightColumn.appendChild(allergy);

    twoColumnContainer.appendChild(leftColumn);
    twoColumnContainer.appendChild(rightColumn);

    // product_titleの後に挿入
    const productTitle = block.querySelector('.product_title');
    if (productTitle && productTitle.parentElement) {
      productTitle.parentElement.insertAdjacentElement('afterend', twoColumnContainer);
    }
  }
}
