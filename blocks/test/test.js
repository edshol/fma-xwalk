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

async function ensureImportedFolder(csvFolder, csrfToken) {
  const importedFolderPath = `${csvFolder}/imported`;
  console.log(`Checking if imported folder exists: ${importedFolderPath}`);

  try {
    // フォルダの存在確認
    const checkResponse = await fetch(`${importedFolderPath}.json`);
    if (checkResponse.ok) {
      console.log('✓ Imported folder already exists');
      return true;
    }

    // フォルダが存在しない場合は作成
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

  // /content/fma/goods/{category} を作成
  try {
    const checkContentResponse = await fetch(`${contentCategoryPath}.json`);
    if (!checkContentResponse.ok) {
      console.log(`Creating content category folder: ${contentCategoryPath}`);
      const formData = new URLSearchParams();
      formData.append('jcr:primaryType', 'cq:Page');

      const createResponse = await fetch(contentCategoryPath, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'CSRF-Token': csrfToken
        },
        body: formData.toString()
      });

      if (createResponse.ok) {
        console.log(`✓ Content category folder created: ${contentCategoryPath}`);
      } else {
        console.warn(`✗ Failed to create content category folder: ${createResponse.status}`);
        return false;
      }
    } else {
      console.log(`✓ Content category folder exists: ${contentCategoryPath}`);
    }
  } catch (error) {
    console.warn('Error ensuring content category folder:', error);
    return false;
  }

  // /content/dam/fma/goods/{category} を作成
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

async function moveImageToImported(sourcePath, csvFolder, csrfToken) {
  const fileName = sourcePath.substring(sourcePath.lastIndexOf('/') + 1);
  const importedPath = `${csvFolder}/imported/${fileName}`;
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

async function createBlockNode(nodePath, nodeData, csrfToken) {
  console.log('Creating block node with data:', nodePath);
  console.log('CSV Data received:', nodeData);

  try {
    const formData = new URLSearchParams();
    formData.append('jcr:primaryType', 'nt:unstructured');
    formData.append('sling:resourceType', 'core/franklin/components/block/v1/block');
    formData.append('model', 'product');
    formData.append('name', 'Product');

    // CSVのプロパティを追加
    Object.keys(nodeData).forEach(key => {
      console.log(`Processing CSV field: ${key} = ${nodeData[key]}`);
      if (key === 'name') {
        // nameの値はjcr:titleに設定
        formData.append('jcr:title', nodeData[key]);
      } else {
        // その他はそのまま
        formData.append(key, nodeData[key]);
      }
    });

    // 送信データをログ出力
    const formDataEntries = Array.from(formData.entries());
    console.log('FormData to be sent:', formDataEntries);
    console.log('FormData body:', formData.toString());

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

  // 1. cq:Page ノードを作成
  const pageCreated = await createPageNode(nodePath, csrfToken);
  if (!pageCreated) {
    return { success: false, path: nodePath, error: 'Failed to create cq:Page' };
  }

  // 2. jcr:content ノードを作成
  const jcrContentPath = `${nodePath}/jcr:content`;
  const jcrContentCreated = await createJcrContentNode(jcrContentPath, nodeData.product_title, csrfToken);
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

  // CSVフォルダパスを取得
  const csvFolder = csvPath.substring(0, csvPath.lastIndexOf('/'));

  // importedフォルダの存在を確認/作成
  await ensureImportedFolder(csvFolder, csrfToken);

  // カテゴリフォルダを事前に作成（重複を避けるためSetで管理）
  const categories = new Set();
  data.forEach(row => {
    const category = (row.category || 'omusubi').toLowerCase();
    categories.add(category);
  });

  // 各カテゴリフォルダを作成
  for (const category of categories) {
    await ensureCategoryFolder(category, csrfToken);
  }

  const results = [];

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const name = row.name || row.Name || row.NAME || `item-${i}`;
    const category = (row.category || 'omusubi').toLowerCase(); // 小文字に変換
    const nodePath = `/content/fma/goods/${category}/${name}`;

    console.log(`\n--- Processing ${i + 1}/${data.length} ---`);
    console.log(`Category: ${category}, Name: ${name}`);

    // 画像ファイルのコピー処理
    if (row.product_image) {
      const sourceImagePath = `${csvFolder}/${row.product_image}`;
      const destImagePath = `/content/dam/fma/goods/${category}/${row.product_image}`;

      const imageCopied = await copyImageFile(sourceImagePath, destImagePath, csrfToken);
      if (imageCopied) {
        // コピー成功時はパスを更新
        row.product_image = destImagePath;

        // 元のファイルをimportedフォルダに移動
        await moveImageToImported(sourceImagePath, csvFolder, csrfToken);
      } else {
        // コピー失敗時は元のパスのまま続行
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

export default async function decorate(block) {
  console.log('=== TEST BLOCK DECORATE ===');

  // フィールドからデフォルト値を取得
  const allPElements = Array.from(block.querySelectorAll('div > div > p'));
  const fieldNames = ['csvPath', 'result'];

  allPElements.forEach((pElement, index) => {
    if (index < fieldNames.length) {
      pElement.classList.add(fieldNames[index]);
    }
  });

  const csvPathElement = block.querySelector('.csvPath');
  const defaultCsvPath = csvPathElement ? csvPathElement.textContent.trim() : '/content/dam/fma/csv/omusubi3.csv';

  // 既存のコンテンツをクリアしてフォームを作成
  block.innerHTML = '';

  // フォームコンテナを作成
  const formContainer = document.createElement('div');
  formContainer.className = 'csv-import-container';

  // フォーム作成
  const form = document.createElement('form');
  form.className = 'csv-import-form';

  // フォームグループ作成
  const formGroup = document.createElement('div');
  formGroup.className = 'form-group';

  // ラベル作成
  const label = document.createElement('label');
  label.setAttribute('for', 'csvPath');
  label.textContent = 'CSV Path:';

  // 入力フィールド作成
  const input = document.createElement('input');
  input.type = 'text';
  input.id = 'csvPath';
  input.name = 'csvPath';
  input.value = defaultCsvPath;
  input.placeholder = 'Enter CSV path';

  // Submitボタン作成
  const submitBtn = document.createElement('button');
  submitBtn.type = 'submit';
  submitBtn.className = 'submit-btn';
  submitBtn.textContent = 'Submit';

  // 結果表示エリア作成
  const resultArea = document.createElement('div');
  resultArea.className = 'result-area';
  resultArea.textContent = 'Ready to import CSV';

  // フォーム組み立て
  formGroup.appendChild(label);
  formGroup.appendChild(input);
  form.appendChild(formGroup);
  form.appendChild(submitBtn);
  formContainer.appendChild(form);
  formContainer.appendChild(resultArea);
  block.appendChild(formContainer);

  // Submit イベントリスナー
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const csvPath = input.value.trim();

    if (!csvPath) {
      resultArea.textContent = 'Please enter a CSV path';
      resultArea.className = 'result-area error';
      return;
    }

    // 処理中表示
    resultArea.textContent = 'Processing...';
    resultArea.className = 'result-area processing';
    submitBtn.disabled = true;

    try {
      const results = await createNodesFromCSV(csvPath);

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
        resultArea.textContent = 'Failed to process CSV';
        resultArea.className = 'result-area error';
      }
    } catch (error) {
      console.error('Error during CSV import:', error);
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
