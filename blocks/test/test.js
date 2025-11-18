function parseCSV(csvText) {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length === 0) return [];

  const headers = lines[0].split(',').map(h => h.trim());
  console.log('CSV headers:', headers);

  const data = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    data.push(row);
  }

  return data;
}

async function loadCSV(csvPath) {
  console.log('Loading CSV from:', csvPath);
  try {
    const response = await fetch(csvPath);
    console.log('CSV fetch response:', response.status);

    if (!response.ok) {
      throw new Error(`Failed to load CSV: ${response.status}`);
    }

    const text = await response.text();
    console.log('CSV loaded successfully. Length:', text.length);
    return text;
  } catch (error) {
    console.error('Error loading CSV:', error);
    return null;
  }
}

async function getCSRFToken() {
  try {
    const response = await fetch('/libs/granite/csrf/token.json');
    const data = await response.json();
    console.log('CSRF Token obtained:', data.token);
    return data.token;
  } catch (error) {
    console.error('Failed to get CSRF token:', error);
    return null;
  }
}

async function createNodeViaAPI(nodePath, nodeData, csrfToken) {
  console.log('Creating node:', nodePath);

  try {
    const formData = new URLSearchParams();
    formData.append('jcr:primaryType', 'nt:unstructured');

    Object.keys(nodeData).forEach(key => {
      formData.append(key, nodeData[key]);
    });

    const response = await fetch(nodePath, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'CSRF-Token': csrfToken
      },
      body: formData.toString()
    });

    if (response.ok) {
      console.log(`✓ Node created: ${nodePath}`);
      return { success: true, path: nodePath };
    } else {
      console.error(`✗ Failed: ${response.status}`);
      return { success: false, path: nodePath, error: response.status };
    }
  } catch (error) {
    console.error('Error:', error);
    return { success: false, path: nodePath, error: error.message };
  }
}

async function createNodesFromCSV(csvPath) {
  console.log('=== Starting node creation ===');

  const csrfToken = await getCSRFToken();
  if (!csrfToken) {
    console.error('Cannot proceed without CSRF token');
    return;
  }

  const csvContent = await loadCSV(csvPath);
  if (!csvContent) return;

  const data = parseCSV(csvContent);
  if (data.length === 0) return;

  const results = [];

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const name = row.name || row.Name || row.NAME || `item-${i}`;
    const nodePath = `/content/fma/goods/omusubi/${name}`;

    console.log(`\n--- Processing ${i + 1}/${data.length} ---`);
    const result = await createNodeViaAPI(nodePath, row, csrfToken);
    results.push(result);

    await new Promise(resolve => setTimeout(resolve, 100));
  }

  const successCount = results.filter(r => r.success).length;
  console.log(`\n=== Summary: ${successCount}/${results.length} successful ===`);

  return results;
}

export default async function decorate(block) {
  console.log('=== TEST BLOCK DECORATE ===');

  const allPElements = Array.from(block.querySelectorAll('div > div > p'));
  const fieldNames = ['csvPath', 'result'];

  allPElements.forEach((pElement, index) => {
    if (index < fieldNames.length) {
      pElement.classList.add(fieldNames[index]);
    }
  });

  const csvPathElement = block.querySelector('.csvPath');

  if (csvPathElement) {
    const csvPath = csvPathElement.textContent.trim();
    console.log('CSV Path:', csvPath);

    if (csvPath) {
      await createNodesFromCSV(csvPath);
    }
  }
}
