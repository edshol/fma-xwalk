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

  // 既にpicture/img要素がある場合（Edge Delivery環境）はそのまま使用
  const existingPicture = contentCell.querySelector('picture');
  const existingImg = contentCell.querySelector('img');
  if (existingPicture || existingImg) {
    // 既存の画像にクラスを追加
    if (existingImg) {
      existingImg.className = 'product-img';
    }
    return;
  }

  // テキストパスの場合（AEM Author環境）は画像要素を作成
  const imgPath = contentCell.textContent.trim();
  if (!imgPath) return;

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

  // data-aue-prop（AEM Author環境）でフィールドを取得
  const aueFields = block.querySelectorAll('[data-aue-prop]');

  if (aueFields.length > 0) {
    // AEM Author環境: data-aue-prop属性でフィールドを識別
    console.log('Using AEM Author mode (data-aue-prop)');
    aueFields.forEach((field) => {
      const propName = field.getAttribute('data-aue-prop');
      fieldMap[propName] = field.cloneNode(true);
    });
    // categoryの値を取得
    if (fieldMap.category) {
      category = fieldMap.category.textContent.trim().toLowerCase();
    }
  } else {
    // aem.live/aem.page環境: 行/セル構造からフィールドを取得
    console.log('Using Edge Delivery mode (row-based)');

    const rows = Array.from(block.querySelectorAll(':scope > div'));
    console.log('Found rows:', rows.length);

    // Edge Deliveryの出力構造を解析
    // Row 0: release_region, release_date
    // Row 1: product_title, product_image, product_descr, product_price
    // Row 2: remarks
    // Row 3: allergy

    if (rows.length >= 4) {
      // Row 0
      const row0Cells = rows[0].querySelectorAll(':scope > div > p');
      if (row0Cells.length >= 1) {
        const releaseRegionP = document.createElement('p');
        releaseRegionP.textContent = row0Cells[0]?.textContent || '';
        fieldMap.release_region = releaseRegionP;
      }
      if (row0Cells.length >= 2) {
        const releaseDateP = document.createElement('p');
        // ISO日付形式を YYYY-MM-DD に変換
        const dateText = row0Cells[1]?.textContent || '';
        const dateMatch = dateText.match(/(\d{4})-(\d{2})-(\d{2})/);
        releaseDateP.textContent = dateMatch ? `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}` : dateText;
        fieldMap.release_date = releaseDateP;
      }

      // Row 1
      const row1Container = rows[1].querySelector(':scope > div');
      if (row1Container) {
        const row1Elements = Array.from(row1Container.children);
        row1Elements.forEach((el, idx) => {
          if (idx === 0) {
            fieldMap.product_title = el.cloneNode(true);
          } else if (el.tagName === 'P' && el.querySelector('picture')) {
            fieldMap.product_image = el.cloneNode(true);
          } else if (idx === 2) {
            fieldMap.product_descr = el.cloneNode(true);
          } else if (idx === 3) {
            fieldMap.product_price = el.cloneNode(true);
          }
        });
      }

      // Row 2: remarks
      const row2Content = rows[2].querySelector(':scope > div');
      if (row2Content) {
        fieldMap.remarks = row2Content.cloneNode(true);
      }

      // Row 3: allergy
      const row3Content = rows[3].querySelector(':scope > div');
      if (row3Content) {
        fieldMap.allergy = row3Content.cloneNode(true);
      }
    }
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