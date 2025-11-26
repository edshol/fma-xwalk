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

  console.log('=== Product Block Debug ===');

  // data-aue-prop属性を持つすべての要素を取得
  const fields = block.querySelectorAll('[data-aue-prop]');
  console.log('Found fields:', fields.length);

  // ブロックの内容をクリアして再構築
  block.innerHTML = '';

  // フィールドをマップに格納
  const fieldMap = {};
  fields.forEach((field) => {
    const propName = field.getAttribute('data-aue-prop');
    fieldMap[propName] = field.cloneNode(true);
    console.log(`Field: ${propName}`);
  });

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

  // 発売地域の装飾処理
  const releaseRegionRow = block.querySelector('.release_region');
  if (releaseRegionRow) {
    decorateReleaseRegion(releaseRegionRow);
  }
}