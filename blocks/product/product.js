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
  // デバッグ: AEMの出力順を確認
  const rows = Array.from(block.querySelectorAll(':scope > div'));
  console.log('=== AEM Output Order ===');
  rows.forEach((row, index) => {
    const contentCell = row.querySelector(':scope > div');
    if (contentCell) {
      const text = contentCell.textContent.trim().substring(0, 50);
      console.log(`Row ${index}: "${text}..."`);
    }
  });

  // 処理なし - AEMの素の出力をそのまま表示
}