async function loadCSV(csvPath) {
  console.log('loadCSV called with path:', csvPath);
  try {
    console.log('Attempting to fetch CSV...');
    const response = await fetch(csvPath);
    console.log('Fetch response:', response.status, response.statusText);
    if (!response.ok) {
      throw new Error(`Failed to load CSV: ${response.status} ${response.statusText}`);
    }
    const text = await response.text();
    console.log('CSV loaded successfully. Content length:', text.length);
    console.log('CSV content preview:', text.substring(0, 200));
    return text;
  } catch (error) {
    console.error('Error loading CSV:', error);
    return `Error: ${error.message}`;
  }
}

export default async function decorate(block) {
  // フィールド名の配列（AEM出力順序に対応）
  const fieldNames = ['csvPath', 'result'];

  // すべてのp要素を取得
  const allPElements = Array.from(block.querySelectorAll('div > div > p'));

  // 各p要素にフィールド名のクラスを付与
  allPElements.forEach((pElement, index) => {
    if (index < fieldNames.length) {
      const fieldName = fieldNames[index];
      pElement.classList.add(fieldName);
    }
  });

  // csvPathとresult要素を取得
  const csvPathElement = block.querySelector('.csvPath');
  const resultElement = block.querySelector('.result');

  if (csvPathElement && resultElement) {
    // csvPathの値を取得
    const csvPath = csvPathElement.textContent.trim();

    if (csvPath) {
      // CSVを読み込んで結果をresult要素に表示
      const csvContent = await loadCSV(csvPath);
      resultElement.textContent = csvContent;
    } else {
      resultElement.textContent = 'CSV path is not specified.';
    }
  }
}
