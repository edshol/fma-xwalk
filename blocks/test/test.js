async function loadCSV(csvPath) {
  console.log('######### loadCSV called with path:', csvPath);
  try {
    console.log(' ########  Attempting to fetch CSV...');
    const response = await fetch(csvPath);
    console.log('Fetch response:', response.status, response.statusText);

    if (!response.ok) {
      throw new Error(`Failed to load CSV: ${response.status} ${response.statusText}`);
    }

    const text = await response.text();
    console.log(' ========== CSV loaded successfully. Content length:', text.length);
    console.log(' ========== CSV content:');
    console.log(text);
    return text;
  } catch (error) {
    console.error('Error loading CSV:', error);
    return `Error: ${error.message}`;
  }
}

export default async function decorate(block) {
  console.log('=== TEST BLOCK DECORATE CALLED ===');
  console.log('Block element:', block);

  // すべてのp要素を取得
  const allPElements = Array.from(block.querySelectorAll('div > div > p'));
  console.log('Found p elements:', allPElements.length);

  allPElements.forEach((pElement, index) => {
    console.log(`p[${index}] content:`, pElement.textContent);
  });

  // フィールド名の配列（AEM出力順序に対応）
  const fieldNames = ['csvPath', 'result'];

  // 各p要素にフィールド名のクラスを付与
  allPElements.forEach((pElement, index) => {
    if (index < fieldNames.length) {
      const fieldName = fieldNames[index];
      pElement.classList.add(fieldName);
      console.log(`Added class '${fieldName}' to p[${index}]`);
    }
  });

  // csvPath要素を取得
  const csvPathElement = block.querySelector('.csvPath');
  console.log('csvPath element found:', csvPathElement);

  if (csvPathElement) {
    const csvPath = csvPathElement.textContent.trim();
    console.log('CSV Path value:', csvPath);

    // CSVを読み込んでconsole.logに出力
    if (csvPath) {
      console.log(' ######### Starting CSV load...');
      await loadCSV(csvPath);
      console.log(' ######### CSV load completed.');
    } else {
      console.log(' ######### CSV path is empty!');
    }
  } else {
    console.log('ERROR: csvPath element not found!');
  }
}
