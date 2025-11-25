// ===== Utility Functions (from test.js) =====

function parseCSV(csvText) {
  // ダブルクォートで囲まれた部分の改行を<br>に変換
  let processed = '';
  let insideQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        // エスケープされた "" → " に変換
        processed += '"';
        i++;
      } else {
        // クォートの開始/終了（出力には含めない）
        insideQuotes = !insideQuotes;
      }
    } else if (insideQuotes && (char === '\n' || char === '\r')) {
      // クォート内の改行を<br>に変換
      if (char === '\r' && nextChar === '\n') {
        processed += '<br>';
        i++; // \nをスキップ
      } else if (char === '\n') {
        processed += '<br>';
      }
      // \r単体は無視
    } else {
      processed += char;
    }
  }

  // 通常のCSVパース
  const lines = processed.split('\n').filter(line => line.trim());
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

// ===== Google Sheets Functions =====

function extractSheetId(spreadsheetUrl) {
  console.log('Extracting Sheet ID from:', spreadsheetUrl);

  // Pattern 1: https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit
  const pattern1 = /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/;
  const match1 = spreadsheetUrl.match(pattern1);

  if (match1) {
    console.log('Sheet ID extracted:', match1[1]);
    return match1[1];
  }

  console.error('Failed to extract Sheet ID from URL');
  return null;
}

async function loadGoogleSheet(sheetId) {
  console.log('Loading Google Sheet:', sheetId);

  // Google Sheets CSV export URL
  const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=0`;

  try {
    const response = await fetch(csvUrl);
    console.log('Google Sheets fetch response:', response.status);

    if (!response.ok) {
      throw new Error(`Failed to load Google Sheet: ${response.status}. Make sure the sheet is published or shared with "Anyone with the link can view".`);
    }

    const text = await response.text();
    console.log('Google Sheet loaded successfully. Length:', text.length);
    return text;
  } catch (error) {
    console.error('Error loading Google Sheet:', error);
    throw error;
  }
}

// ===== Node Creation Functions (from test.js) =====

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

async function createJcrContentNode(nodePath, title, csrfToken) {
  console.log('Creating jcr:content node:', nodePath);

  try {
    const formData = new URLSearchParams();
    formData.append('jcr:primaryType', 'cq:PageContent');
    formData.append('sling:resourceType', 'core/franklin/components/page/v1/page');
    formData.append('cq:template', '/libs/core/franklin/templates/page');

    if (title) {
      formData.append('jcr:title', title);
      console.log(`Setting jcr:title: ${title}`);
    }

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
  console.log('Data received:', nodeData);

  try {
    const formData = new URLSearchParams();
    formData.append('jcr:primaryType', 'nt:unstructured');
    formData.append('sling:resourceType', 'core/franklin/components/block/v1/block');
    formData.append('model', 'product');
    formData.append('name', 'Product');

    Object.keys(nodeData).forEach(key => {
      console.log(`Processing field: ${key} = ${nodeData[key]}`);
      if (key === 'name') {
        formData.append('jcr:title', nodeData[key]);
      } else {
        formData.append(key, nodeData[key]);
      }
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
      const errorText = await response.text();
      console.error(`✗ Failed to create block: ${response.status}`);
      console.error('Response body:', errorText);
      return false;
    }
  } catch (error) {
    console.error('Error creating block:', error);
    return false;
  }
}

async function createNodeViaAPI(nodePath, nodeData, csrfToken) {
  console.log('Creating complete page structure:', nodePath);

  const pageCreated = await createPageNode(nodePath, csrfToken);
  if (!pageCreated) {
    return { success: false, path: nodePath, error: 'Failed to create cq:Page' };
  }

  const jcrContentPath = `${nodePath}/jcr:content`;
  const jcrContentCreated = await createJcrContentNode(jcrContentPath, nodeData.product_title, csrfToken);
  if (!jcrContentCreated) {
    return { success: false, path: nodePath, error: 'Failed to create jcr:content' };
  }

  const rootPath = `${jcrContentPath}/root`;
  const rootCreated = await createRootNode(rootPath, csrfToken);
  if (!rootCreated) {
    return { success: false, path: nodePath, error: 'Failed to create root' };
  }

  const sectionPath = `${rootPath}/section`;
  const sectionCreated = await createSectionNode(sectionPath, csrfToken);
  if (!sectionCreated) {
    return { success: false, path: nodePath, error: 'Failed to create section' };
  }

  const blockPath = `${sectionPath}/block`;
  const blockCreated = await createBlockNode(blockPath, nodeData, csrfToken);
  if (!blockCreated) {
    return { success: false, path: nodePath, error: 'Failed to create block' };
  }

  console.log(`✓ Complete page structure created: ${nodePath}`);
  return { success: true, path: nodePath };
}

async function ensureImportedFolder(imageFolder, csrfToken) {
  const importedFolderPath = `${imageFolder}/imported`;
  console.log(`Checking if imported folder exists: ${importedFolderPath}`);

  try {
    const checkResponse = await fetch(`${importedFolderPath}.json`);
    if (checkResponse.ok) {
      console.log('✓ Imported folder already exists');
      return true;
    }

    console.log('Creating imported folder...');
    const formData = new URLSearchParams();
    formData.append('jcr:primaryType', 'sling:Folder');

    const createResponse = await fetch(importedFolderPath, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'CSRF-Token': csrfToken
      },
      body: formData.toString()
    });

    if (createResponse.ok) {
      console.log('✓ Imported folder created successfully');
      return true;
    } else {
      console.warn(`✗ Failed to create imported folder: ${createResponse.status}`);
      return false;
    }
  } catch (error) {
    console.warn('Error ensuring imported folder:', error);
    return false;
  }
}

async function ensureCategoryFolder(category, csrfToken) {
  const contentCategoryPath = `/content/fma/goods/${category}`;
  const damCategoryPath = `/content/dam/fma/goods/${category}`;

  console.log(`Ensuring category folders for: ${category}`);

  // Content category page creation
  try {
    const checkContentResponse = await fetch(`${contentCategoryPath}.json`);
    if (!checkContentResponse.ok) {
      // 1. Create cq:Page node
      console.log(`Creating content category page: ${contentCategoryPath}`);
      const pageFormData = new URLSearchParams();
      pageFormData.append('jcr:primaryType', 'cq:Page');

      const pageResponse = await fetch(contentCategoryPath, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'CSRF-Token': csrfToken
        },
        body: pageFormData.toString()
      });

      if (!pageResponse.ok) {
        console.warn(`✗ Failed to create category page: ${pageResponse.status}`);
        return false;
      }
      console.log(`✓ Category cq:Page created: ${contentCategoryPath}`);

      // 2. Create jcr:content node
      const jcrContentPath = `${contentCategoryPath}/jcr:content`;
      console.log(`Creating jcr:content node: ${jcrContentPath}`);
      const jcrContentFormData = new URLSearchParams();
      jcrContentFormData.append('jcr:primaryType', 'cq:PageContent');
      jcrContentFormData.append('cq:template', '/libs/core/franklin/templates/page');
      jcrContentFormData.append('sling:resourceType', 'core/franklin/components/page/v1/page');
      jcrContentFormData.append('jcr:title', category);

      const jcrContentResponse = await fetch(jcrContentPath, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'CSRF-Token': csrfToken
        },
        body: jcrContentFormData.toString()
      });

      if (!jcrContentResponse.ok) {
        console.warn(`✗ Failed to create jcr:content: ${jcrContentResponse.status}`);
        return false;
      }
      console.log(`✓ Category jcr:content created: ${jcrContentPath}`);

      // 3. Create root node
      const rootPath = `${jcrContentPath}/root`;
      console.log(`Creating root node: ${rootPath}`);
      const rootFormData = new URLSearchParams();
      rootFormData.append('jcr:primaryType', 'nt:unstructured');
      rootFormData.append('sling:resourceType', 'core/franklin/components/root/v1/root');

      const rootResponse = await fetch(rootPath, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'CSRF-Token': csrfToken
        },
        body: rootFormData.toString()
      });

      if (!rootResponse.ok) {
        console.warn(`✗ Failed to create root node: ${rootResponse.status}`);
        return false;
      }
      console.log(`✓ Category root node created: ${rootPath}`);

      // 4. Create section node
      const sectionPath = `${rootPath}/section`;
      console.log(`Creating section node: ${sectionPath}`);
      const sectionFormData = new URLSearchParams();
      sectionFormData.append('jcr:primaryType', 'nt:unstructured');
      sectionFormData.append('sling:resourceType', 'core/franklin/components/section/v1/section');

      const sectionResponse = await fetch(sectionPath, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'CSRF-Token': csrfToken
        },
        body: sectionFormData.toString()
      });

      if (!sectionResponse.ok) {
        console.warn(`✗ Failed to create section node: ${sectionResponse.status}`);
        return false;
      }
      console.log(`✓ Category section node created: ${sectionPath}`);

      console.log(`✓ Complete category page structure created: ${contentCategoryPath}`);
    } else {
      console.log(`✓ Content category folder exists: ${contentCategoryPath}`);
    }
  } catch (error) {
    console.warn('Error ensuring content category folder:', error);
    return false;
  }

  // DAM category folder creation
  try {
    const checkDamResponse = await fetch(`${damCategoryPath}.json`);
    if (!checkDamResponse.ok) {
      console.log(`Creating DAM category folder: ${damCategoryPath}`);
      const formData = new URLSearchParams();
      formData.append('jcr:primaryType', 'sling:Folder');

      const createResponse = await fetch(damCategoryPath, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'CSRF-Token': csrfToken
        },
        body: formData.toString()
      });

      if (createResponse.ok) {
        console.log(`✓ DAM category folder created: ${damCategoryPath}`);
      } else {
        console.warn(`✗ Failed to create DAM category folder: ${createResponse.status}`);
        return false;
      }
    } else {
      console.log(`✓ DAM category folder exists: ${damCategoryPath}`);
    }
  } catch (error) {
    console.warn('Error ensuring DAM category folder:', error);
    return false;
  }

  return true;
}

async function copyImageFile(sourcePath, destPath, csrfToken) {
  console.log(`Copying image: ${sourcePath} → ${destPath}`);

  try {
    const formData = new URLSearchParams();
    formData.append(':operation', 'copy');
    formData.append(':dest', destPath);
    formData.append(':replace', 'true');
    formData.append('_charset_', 'utf-8');

    const response = await fetch(sourcePath, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'CSRF-Token': csrfToken
      },
      body: formData.toString()
    });

    if (response.ok) {
      console.log(`✓ Image copied successfully: ${destPath}`);
      return true;
    } else {
      console.warn(`✗ Image copy failed: ${response.status} (continues with original path)`);
      return false;
    }
  } catch (error) {
    console.warn('Error copying image:', error, '(continues with original path)');
    return false;
  }
}

async function moveImageToImported(sourcePath, imageFolder, csrfToken) {
  const fileName = sourcePath.substring(sourcePath.lastIndexOf('/') + 1);
  const importedPath = `${imageFolder}/imported/${fileName}`;
  console.log(`Moving original image: ${sourcePath} → ${importedPath}`);

  try {
    const formData = new URLSearchParams();
    formData.append(':operation', 'move');
    formData.append(':dest', importedPath);
    formData.append(':replace', 'true');
    formData.append('_charset_', 'utf-8');

    const response = await fetch(sourcePath, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'CSRF-Token': csrfToken
      },
      body: formData.toString()
    });

    if (response.ok) {
      console.log(`✓ Original image moved to imported folder: ${importedPath}`);
      return true;
    } else {
      console.warn(`✗ Failed to move image to imported: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.warn('Error moving image to imported:', error);
    return false;
  }
}

// ===== Main Import Function =====

async function createNodesFromSheet(spreadsheetUrl, imageFolderPath) {
  console.log('=== Starting node creation from Google Sheet ===');

  const csrfToken = await getCSRFToken();
  if (!csrfToken) {
    console.error('Cannot proceed without CSRF token');
    throw new Error('Failed to obtain CSRF token');
  }

  const sheetId = extractSheetId(spreadsheetUrl);
  if (!sheetId) {
    throw new Error('Invalid Google Spreadsheet URL');
  }

  const csvContent = await loadGoogleSheet(sheetId);
  if (!csvContent) {
    throw new Error('Failed to load spreadsheet data');
  }

  const data = parseCSV(csvContent);
  if (data.length === 0) {
    throw new Error('No data found in spreadsheet');
  }

  // Ensure image folder path ends without trailing slash
  const imageFolder = imageFolderPath.replace(/\/$/, '');

  await ensureImportedFolder(imageFolder, csrfToken);

  // Collect categories
  const categories = new Set();
  data.forEach(row => {
    const category = (row.category || 'omusubi').toLowerCase();
    categories.add(category);
  });

  // Create category folders
  for (const category of categories) {
    await ensureCategoryFolder(category, csrfToken);
  }

  const results = [];

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const name = row.name || row.Name || row.NAME || `item-${i}`;
    const category = (row.category || 'omusubi').toLowerCase();
    const nodePath = `/content/fma/goods/${category}/${name}`;

    console.log(`\n--- Processing ${i + 1}/${data.length} ---`);
    console.log(`Category: ${category}, Name: ${name}`);

    // Image processing
    if (row.product_image) {
      const sourceImagePath = `${imageFolder}/${row.product_image}`;
      const destImagePath = `/content/dam/fma/goods/${category}/${row.product_image}`;

      const imageCopied = await copyImageFile(sourceImagePath, destImagePath, csrfToken);
      if (imageCopied) {
        row.product_image = destImagePath;
        await moveImageToImported(sourceImagePath, imageFolder, csrfToken);
      } else {
        console.warn(`Continuing with original image path: ${row.product_image}`);
      }
    }

    const result = await createNodeViaAPI(nodePath, row, csrfToken);
    results.push(result);

    await new Promise(resolve => setTimeout(resolve, 100));
  }

  const successCount = results.filter(r => r.success).length;
  console.log(`\n=== Summary: ${successCount}/${results.length} successful ===`);

  return results;
}

// ===== Block Decoration =====

export default async function decorate(block) {
  console.log('=== SHEET IMPORT BLOCK DECORATE ===');

  const allPElements = Array.from(block.querySelectorAll('div > div > p'));
  const fieldNames = ['spreadsheetUrl', 'imageFolderPath', 'result'];

  allPElements.forEach((pElement, index) => {
    if (index < fieldNames.length) {
      pElement.classList.add(fieldNames[index]);
    }
  });

  const urlElement = block.querySelector('.spreadsheetUrl');
  const pathElement = block.querySelector('.imageFolderPath');

  const defaultUrl = urlElement ? urlElement.textContent.trim() : '';
  const defaultPath = pathElement ? pathElement.textContent.trim() : '/content/dam/fma/csv/';

  block.innerHTML = '';

  const formContainer = document.createElement('div');
  formContainer.className = 'sheet-import-container';

  const form = document.createElement('form');
  form.className = 'sheet-import-form';

  // Spreadsheet URL field
  const urlGroup = document.createElement('div');
  urlGroup.className = 'form-group';

  const urlLabel = document.createElement('label');
  urlLabel.setAttribute('for', 'spreadsheetUrl');
  urlLabel.textContent = 'Google Spreadsheet URL:';

  const urlInput = document.createElement('input');
  urlInput.type = 'text';
  urlInput.id = 'spreadsheetUrl';
  urlInput.name = 'spreadsheetUrl';
  urlInput.value = defaultUrl;
  urlInput.placeholder = 'https://docs.google.com/spreadsheets/d/.../edit';

  urlGroup.appendChild(urlLabel);
  urlGroup.appendChild(urlInput);

  // Image Folder Path field
  const pathGroup = document.createElement('div');
  pathGroup.className = 'form-group';

  const pathLabel = document.createElement('label');
  pathLabel.setAttribute('for', 'imageFolderPath');
  pathLabel.textContent = 'Image Folder Path:';

  const pathInput = document.createElement('input');
  pathInput.type = 'text';
  pathInput.id = 'imageFolderPath';
  pathInput.name = 'imageFolderPath';
  pathInput.value = defaultPath;
  pathInput.placeholder = '/content/dam/fma/csv/';

  pathGroup.appendChild(pathLabel);
  pathGroup.appendChild(pathInput);

  // Submit button
  const submitBtn = document.createElement('button');
  submitBtn.type = 'submit';
  submitBtn.className = 'submit-btn';
  submitBtn.textContent = 'Import from Google Sheet';

  // Result area
  const resultArea = document.createElement('div');
  resultArea.className = 'result-area';
  resultArea.textContent = 'Ready to import from Google Spreadsheet';

  form.appendChild(urlGroup);
  form.appendChild(pathGroup);
  form.appendChild(submitBtn);
  formContainer.appendChild(form);
  formContainer.appendChild(resultArea);
  block.appendChild(formContainer);

  // Submit handler
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const spreadsheetUrl = urlInput.value.trim();
    const imageFolderPath = pathInput.value.trim();

    if (!spreadsheetUrl) {
      resultArea.textContent = 'Please enter a Google Spreadsheet URL';
      resultArea.className = 'result-area error';
      return;
    }

    if (!imageFolderPath) {
      resultArea.textContent = 'Please enter an Image Folder Path';
      resultArea.className = 'result-area error';
      return;
    }

    resultArea.textContent = 'Processing...';
    resultArea.className = 'result-area processing';
    submitBtn.disabled = true;

    try {
      const results = await createNodesFromSheet(spreadsheetUrl, imageFolderPath);

      if (results) {
        const successCount = results.filter(r => r.success).length;
        const failCount = results.length - successCount;

        resultArea.innerHTML = `
          <strong>Complete!</strong><br>
          ✓ Success: ${successCount} nodes<br>
          ${failCount > 0 ? `✗ Failed: ${failCount} nodes<br>` : ''}
          Total: ${results.length} nodes processed
        `;
        resultArea.className = 'result-area success';
      } else {
        resultArea.textContent = 'Failed to process Google Sheet';
        resultArea.className = 'result-area error';
      }
    } catch (error) {
      console.error('Error during import:', error);
      resultArea.innerHTML = `
        <strong>Error:</strong><br>
        ${error.message || 'Unknown error occurred'}
      `;
      resultArea.className = 'result-area error';
    } finally {
      submitBtn.disabled = false;
    }
  });
}
