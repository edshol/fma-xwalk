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
  // JCRから出力される順序（sheet-importerのimport順）
  const jcrFieldOrder = [
    'release_region',
    'release_date',
    'product_title',
    'product_descr',
    'product_price',
    'remarks',
    'allergy',
    'product_image',
  ];

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

  const rows = Array.from(block.querySelectorAll(':scope > div'));

  console.log('=== Product Block Debug ===');
  console.log('Block HTML:', block.innerHTML);
  console.log('Total rows:', rows.length);

  // JCR順でクラスを付与
  rows.forEach((row, index) => {
    if (index < jcrFieldOrder.length) {
      const fieldName = jcrFieldOrder[index];
      row.classList.add(fieldName);

      const contentCell = row.querySelector(':scope > div');
      const text = contentCell ? contentCell.textContent.trim().substring(0, 30) : '(no cell)';
      console.log(`Row ${index}: class="${fieldName}", content="${text}..."`);
    }
  });

  // 表示順に並べ替え
  displayOrder.forEach((fieldName) => {
    const row = block.querySelector(`.${fieldName}`);
    if (row) {
      block.appendChild(row);
    }
  });

  // 発売地域の装飾処理
  const releaseRegionRow = block.querySelector('.release_region');
  if (releaseRegionRow) {
    decorateReleaseRegion(releaseRegionRow);
  }
}