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
      valueSpan.innerHTML = ':' + value + '&#47;';

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
  // モデル定義での正しい順序（_product.json の fields 順）
  const modelFieldOrder = [
    'release_region',
    'product_title',
    'product_image',
    'product_descr',
    'product_price',
    'release_date',
    'remarks',
    'allergy'
  ];

  // 各行（div > div > div構造）の最初のセルにクラスを付与
  // AEMの出力順をそのまま使用（並び替えなし）
  const rows = Array.from(block.querySelectorAll(':scope > div'));

  rows.forEach((row, index) => {
    const contentCell = row.querySelector(':scope > div');
    if (contentCell && index < modelFieldOrder.length) {
      const fieldName = modelFieldOrder[index];
      contentCell.classList.add(fieldName);

      // release_regionの場合は特別処理
      if (fieldName === 'release_region') {
        decorateReleaseRegion(contentCell);
      }

      // product_priceの場合は価格フォーマット処理
      if (fieldName === 'product_price') {
        decorateProductPrice(contentCell);
      }
    }
  });
}