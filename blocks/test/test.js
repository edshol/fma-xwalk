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

async function createPageNode(nodePath, csrfToken) {
  console.log('Creating cq:Page node:', nodePath);

  try {
    const formData = new URLSearchParams();
    formData.append('jcr:primaryType', 'cq:Page');

    const response = await fetch(nodePath, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'CSRF-Token': csrfToken
      },
      body: formData.toString()
    });

    if (response.ok) {
      console.log(`✓ cq:Page created: ${nodePath}`);
      return true;
    } else {
      console.error(`✗ Failed to create cq:Page: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error('Error creating cq:Page:', error);
    return false;
  }
}

async function createJcrContentNode(nodePath, csrfToken) {
  console.log('Creating jcr:content node:', nodePath);

  try {
    const formData = new URLSearchParams();
    formData.append('jcr:primaryType', 'cq:PageContent');
    formData.append('sling:resourceType', 'core/franklin/components/page/v1/page');

    const response = await fetch(nodePath, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'CSRF-Token': csrfToken
      },
      body: formData.toString()
    });

    if (response.ok) {
      console.log(`✓ jcr:content created: ${nodePath}`);
      return true;
    } else {
      console.error(`✗ Failed to create jcr:content: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error('Error creating jcr:content:', error);
    return false;
  }
}

async function createRootNode(nodePath, csrfToken) {
  console.log('Creating root node:', nodePath);

  try {
    const formData = new URLSearchParams();
    formData.append('jcr:primaryType', 'nt:unstructured');
    formData.append('sling:resourceType', 'core/franklin/components/root/v1/root');

    const response = await fetch(nodePath, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'CSRF-Token': csrfToken
      },
      body: formData.toString()
    });

    if (response.ok) {
      console.log(`✓ root node created: ${nodePath}`);
      return true;
    } else {
      console.error(`✗ Failed to create root: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error('Error creating root:', error);
    return false;
  }
}

async function createSectionNode(nodePath, csrfToken) {
  console.log('Creating section node:', nodePath);

  try {
    const formData = new URLSearchParams();
    formData.append('jcr:primaryType', 'nt:unstructured');
    formData.append('sling:resourceType', 'core/franklin/components/section/v1/section');

    const response = await fetch(nodePath, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'CSRF-Token': csrfToken
      },
      body: formData.toString()
    });

    if (response.ok) {
      console.log(`✓ section node created: ${nodePath}`);
      return true;
    } else {
      console.error(`✗ Failed to create section: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error('Error creating section:', error);
    return false;
  }
}

async function createBlockNode(nodePath, nodeData, csrfToken) {
  console.log('Creating block node with data:', nodePath);

  try {
    const formData = new URLSearchParams();
    formData.append('jcr:primaryType', 'nt:unstructured');
    formData.append('sling:resourceType', 'core/franklin/components/block/v1/block');

    // CSVのすべてのプロパティを追加
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
      console.log(`✓ block node created: ${nodePath}`);
      return true;
    } else {
      console.error(`✗ Failed to create block: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error('Error creating block:', error);
    return false;
  }
}

async function createNodeViaAPI(nodePath, nodeData, csrfToken) {
  console.log('Creating complete page structure:', nodePath);

  // 1. cq:Page ノードを作成
  const pageCreated = await createPageNode(nodePath, csrfToken);
  if (!pageCreated) {
    return { success: false, path: nodePath, error: 'Failed to create cq:Page' };
  }

  // 2. jcr:content ノードを作成
  const jcrContentPath = `${nodePath}/jcr:content`;
  const jcrContentCreated = await createJcrContentNode(jcrContentPath, csrfToken);
  if (!jcrContentCreated) {
    return { success: false, path: nodePath, error: 'Failed to create jcr:content' };
  }

  // 3. root ノードを作成
  const rootPath = `${jcrContentPath}/root`;
  const rootCreated = await createRootNode(rootPath, csrfToken);
  if (!rootCreated) {
    return { success: false, path: nodePath, error: 'Failed to create root' };
  }

  // 4. section ノードを作成
  const sectionPath = `${rootPath}/section`;
  const sectionCreated = await createSectionNode(sectionPath, csrfToken);
  if (!sectionCreated) {
    return { success: false, path: nodePath, error: 'Failed to create section' };
  }

  // 5. block ノードを作成（CSVデータを含む）
  const blockPath = `${sectionPath}/block`;
  const blockCreated = await createBlockNode(blockPath, nodeData, csrfToken);
  if (!blockCreated) {
    return { success: false, path: nodePath, error: 'Failed to create block' };
  }

  console.log(`✓ Complete page structure created: ${nodePath}`);
  return { success: true, path: nodePath };
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
