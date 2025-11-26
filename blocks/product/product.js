function decorateReleaseRegion(row) {
  // 行内のコンテンツセルを取得
  const contentCell = row.querySelector(':scope > div');
  if (!contentCell) return;

  const text = contentCell.textContent.trim();
  if (!text) return;

  // スラッシュで分割
  const regions = text.split('/').filter((r) => r.trim());

  // コンテナを作成
  const container = document.createElement('div');
  container.className = 'release-region-container';

  // 「発売地域」ラベル
  const label = document.createElement('span');
  label.className = 'release-region-label';
  label.textContent = '発売地域';
  container.appendChild(label);

  regions.forEach((region) => {
    // "地域名:値" の形式をパース
    const parts = region.split(':');
    if (parts.length === 2) {
      const name = parts[0].trim();
      const value = parts[1].trim();

      // タグ要素を作成
      const tag = document.createElement('span');
      tag.className = 'region-tag';

      // 地域名を表示
      tag.textContent = name;

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
  contentCell.textContent = '';
  contentCell.appendChild(container);
}

function decorateProductPrice(row) {
  // 行内のコンテンツセルを取得
  const contentCell = row.querySelector(':scope > div');
  if (!contentCell) return;

  const text = contentCell.textContent.trim();
  if (!text) return;

  // 数値を取得
  const price = parseFloat(text);
  if (isNaN(price)) return;

  // 8%の消費税を加算
  const taxIncludedPrice = Math.floor(price * 1.08);

  // コンテナを作成
  const container = document.createElement('div');
  container.className = 'price-container';

  // ラベル
  const label = document.createElement('div');
  label.className = 'price-label';
  label.textContent = 'ファミリーマート通常価格';
  container.appendChild(label);

  // 価格
  const priceEl = document.createElement('div');
  priceEl.className = 'price-value';
  priceEl.textContent = `${price}円（税込${taxIncludedPrice}円）`;
  container.appendChild(priceEl);

  contentCell.textContent = '';
  contentCell.appendChild(container);
}

function decorateReleaseDate(row) {
  // 行内のコンテンツセルを取得
  const contentCell = row.querySelector(':scope > div');
  if (!contentCell) return;

  const text = contentCell.textContent.trim();
  if (!text) return;

  // 日付を日本語形式に変換 (2025-11-25 → 2025年11月25日)
  const match = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    contentCell.textContent = `発売日：${match[1]}年${parseInt(match[2], 10)}月${parseInt(match[3], 10)}日`;
  } else {
    contentCell.textContent = `発売日：${text}`;
  }
}

export default function decorate(block) {
  // デバッグ: AEMの出力構造を確認
  console.log('=== Product Block Debug ===');
  const rows = Array.from(block.querySelectorAll(':scope > div'));
  console.log('Total rows:', rows.length);
  rows.forEach((row, i) => {
    const cell = row.querySelector(':scope > div');
    const text = cell ? cell.textContent.trim().substring(0, 30) : '(no cell)';
    console.log(`Row ${i}: "${text}..."`);
  });

  // モデル定義での正しい順序（_product.json の fields 順）
  // sheet-importerのimport順と一致している必要がある
  const modelFieldOrder = [
    'release_region',
    'product_title',
    'product_image',
    'product_descr',
    'product_price',
    'release_date',
    'remarks',
    'allergy',
  ];

  // フィールドデータを格納するマップ
  const fieldElements = new Map();

  // 各行を処理
  rows.forEach((row, index) => {
    if (index < modelFieldOrder.length) {
      const fieldName = modelFieldOrder[index];
      // 行自体にクラスを付与
      row.classList.add(fieldName);
      fieldElements.set(fieldName, row);
      console.log(`Mapped: ${fieldName} -> Row ${index}`);
    }
  });

  // 各フィールドの装飾処理
  const releaseRegionRow = fieldElements.get('release_region');
  if (releaseRegionRow) {
    decorateReleaseRegion(releaseRegionRow);
  }

  const productPriceRow = fieldElements.get('product_price');
  if (productPriceRow) {
    decorateProductPrice(productPriceRow);
  }

  const releaseDateRow = fieldElements.get('release_date');
  if (releaseDateRow) {
    decorateReleaseDate(releaseDateRow);
  }

  // レイアウト再構築
  block.innerHTML = '';

  // 1. 発売地域
  if (fieldElements.get('release_region')) {
    block.appendChild(fieldElements.get('release_region'));
  }

  // 2. 商品タイトル
  if (fieldElements.get('product_title')) {
    block.appendChild(fieldElements.get('product_title'));
  }

  // 3. 2列レイアウト（画像 + 詳細）
  const twoColumnContainer = document.createElement('div');
  twoColumnContainer.className = 'product-two-column';

  // 左列（画像）
  const leftColumn = document.createElement('div');
  leftColumn.className = 'product-left-column';
  if (fieldElements.get('product_image')) {
    leftColumn.appendChild(fieldElements.get('product_image'));
  }

  // 右列（説明、発売日、価格、備考、アレルギー）
  const rightColumn = document.createElement('div');
  rightColumn.className = 'product-right-column';

  if (fieldElements.get('product_descr')) {
    rightColumn.appendChild(fieldElements.get('product_descr'));
  }
  if (fieldElements.get('release_date')) {
    rightColumn.appendChild(fieldElements.get('release_date'));
  }
  if (fieldElements.get('product_price')) {
    rightColumn.appendChild(fieldElements.get('product_price'));
  }
  if (fieldElements.get('remarks')) {
    rightColumn.appendChild(fieldElements.get('remarks'));
  }
  if (fieldElements.get('allergy')) {
    rightColumn.appendChild(fieldElements.get('allergy'));
  }

  twoColumnContainer.appendChild(leftColumn);
  twoColumnContainer.appendChild(rightColumn);
  block.appendChild(twoColumnContainer);
}