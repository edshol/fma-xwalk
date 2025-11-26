/**
 * 発売地域の装飾処理
 */
function decorateReleaseRegion(row) {
  const contentCell = row.querySelector(':scope > div');
  if (!contentCell) return;

  const text = contentCell.textContent.trim();
  if (!text) return;

  // release_regionのパターンチェック
  if (!/[^:]+:[01]/.test(text)) return;

  // スラッシュで分割
  const regions = text.split('/').filter((r) => r.trim());

  // コンテナを作成
  const container = document.createElement('div');
  container.className = 'release-region-container';

  // 「注目」ラベル
  const attentionLabel = document.createElement('span');
  attentionLabel.className = 'attention-label';
  attentionLabel.textContent = '注目';
  container.appendChild(attentionLabel);

  // 「発売地域」ラベル
  const label = document.createElement('span');
  label.className = 'release-region-label';
  label.textContent = '発売地域';
  container.appendChild(label);

  regions.forEach((region) => {
    const parts = region.split(':');
    if (parts.length === 2) {
      const name = parts[0].trim();
      const value = parts[1].trim();

      const tag = document.createElement('span');
      tag.className = 'region-tag';
      tag.textContent = name;

      if (value === '1') {
        tag.classList.add('active');
      } else {
        tag.classList.add('inactive');
      }

      container.appendChild(tag);
    }
  });

  contentCell.textContent = '';
  contentCell.appendChild(container);
}

/**
 * 画像の装飾処理
 * @param {Element} row - 画像行要素
 * @param {string} category - カテゴリ名
 */
function decorateProductImage(row, category) {
  const contentCell = row.querySelector(':scope > div');
  if (!contentCell) return;

  const imgPath = contentCell.textContent.trim();
  if (!imgPath) return;

  // 画像要素を作成
  const img = document.createElement('img');
  // フルパスの場合はそのまま、ファイル名だけの場合はcategoryを含むパスを構築
  if (imgPath.startsWith('/')) {
    img.src = imgPath;
  } else {
    const cat = category || 'omusubi';
    img.src = `/content/dam/fma/goods/${cat}/${imgPath}`;
  }
  img.alt = 'Product Image';
  img.className = 'product-img';

  contentCell.textContent = '';
  contentCell.appendChild(img);
}

/**
 * 発売日の装飾処理
 */
function decorateReleaseDate(row) {
  const contentCell = row.querySelector(':scope > div');
  if (!contentCell) return;

  const dateText = contentCell.textContent.trim();
  if (!dateText) return;

  // 日付をフォーマット（YYYY-MM-DD → YYYY年MM月DD日）
  const dateMatch = dateText.match(/(\d{4})-(\d{2})-(\d{2})/);
  let formattedDate = dateText;
  if (dateMatch) {
    formattedDate = `${dateMatch[1]}年${parseInt(dateMatch[2], 10)}月${parseInt(dateMatch[3], 10)}日`;
  }

  const container = document.createElement('div');
  container.className = 'release-date-container';
  container.innerHTML = `<span class="release-date-label">発売日：</span><span class="release-date-value">${formattedDate}</span>`;

  contentCell.textContent = '';
  contentCell.appendChild(container);
}

/**
 * 価格の装飾処理
 */
function decorateProductPrice(row) {
  const contentCell = row.querySelector(':scope > div');
  if (!contentCell) return;

  const priceText = contentCell.textContent.trim();
  if (!priceText) return;

  const price = parseInt(priceText, 10);
  const taxIncludedPrice = Math.floor(price * 1.08);

  const container = document.createElement('div');
  container.className = 'price-container';
  container.innerHTML = `
    <div class="price-label">ファミリーマート通常価格</div>
    <div class="price-value">${price.toLocaleString()}円<span class="tax-included">（税込${taxIncludedPrice.toLocaleString()}円）</span></div>
  `;

  contentCell.textContent = '';
  contentCell.appendChild(container);
}

/**
 * 備考の装飾処理
 */
function decorateRemarks(row) {
  const contentCell = row.querySelector(':scope > div');
  if (!contentCell) return;

  const remarksText = contentCell.textContent.trim();
  if (!remarksText) return;

  const container = document.createElement('div');
  container.className = 'remarks-container';
  container.innerHTML = `<div class="remarks-label">【備考】</div><div class="remarks-content">${remarksText}</div>`;

  contentCell.textContent = '';
  contentCell.appendChild(container);
}

export default function decorate(block) {
  // 表示したい順序
  const displayOrder = [
    'release_region',
    'product_title',
    'product_image',
    'product_descr',
    'product_price',
    'release_date',
    'remarks',
    'allergy',
  ];

  // デバッグ用: ブロックの初期HTML
  console.log('Product block initial HTML:', block.innerHTML);

  const fieldMap = {};
  let category = '';

  // data-aue-prop（AEM Author環境）または data-field（aem.live/aem.page環境）でフィールドを取得
  const aueFields = block.querySelectorAll('[data-aue-prop]');
  const dataFields = block.querySelectorAll('[data-field]');

  if (aueFields.length > 0) {
    // AEM Author環境: data-aue-prop属性でフィールドを識別
    console.log('Using AEM Author mode (data-aue-prop)');
    aueFields.forEach((field) => {
      const propName = field.getAttribute('data-aue-prop');
      fieldMap[propName] = field.cloneNode(true);
    });
  } else if (dataFields.length > 0) {
    // aem.live/aem.page環境: data-field属性でフィールドを識別
    console.log('Using Edge Delivery mode (data-field)');
    dataFields.forEach((field) => {
      const fieldName = field.getAttribute('data-field');
      fieldMap[fieldName] = field.cloneNode(true);
    });
  }

  // categoryの値を取得
  if (fieldMap.category) {
    category = fieldMap.category.textContent.trim().toLowerCase();
  }

  console.log('Category:', category);
  console.log('FieldMap keys:', Object.keys(fieldMap));

  // ブロックの内容をクリアして再構築
  block.innerHTML = '';

  // 表示順に行を作成
  displayOrder.forEach((fieldName) => {
    const field = fieldMap[fieldName];
    if (field) {
      const row = document.createElement('div');
      row.className = fieldName;

      const cell = document.createElement('div');
      cell.appendChild(field);
      row.appendChild(cell);

      block.appendChild(row);
    }
  });

  // 各フィールドの装飾処理
  const releaseRegionRow = block.querySelector('.release_region');
  if (releaseRegionRow) {
    decorateReleaseRegion(releaseRegionRow);
  }

  const productImageRow = block.querySelector('.product_image');
  if (productImageRow) {
    decorateProductImage(productImageRow, category);
  }

  const releaseDateRow = block.querySelector('.release_date');
  if (releaseDateRow) {
    decorateReleaseDate(releaseDateRow);
  }

  const productPriceRow = block.querySelector('.product_price');
  if (productPriceRow) {
    decorateProductPrice(productPriceRow);
  }

  const remarksRow = block.querySelector('.remarks');
  if (remarksRow) {
    decorateRemarks(remarksRow);
  }
}