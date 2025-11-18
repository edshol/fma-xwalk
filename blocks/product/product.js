export default function decorate(block) {
  // 最初のp要素にrelease_regionクラスを付与し、値をパースして表示
  const firstP = block.querySelector('div > div > p');
  if (firstP) {
    firstP.classList.add('release_region');

    // テキストをパースして地域タグを生成
    const text = firstP.textContent.trim();
    if (text) {
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
      firstP.textContent = '';
      firstP.appendChild(container);
    }
  }
}
