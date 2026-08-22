/**
 * SoloLearn AI Companion - Extension Popup Logic
 */

document.addEventListener('DOMContentLoaded', async () => {
  const Config = window.SoloLearnConfig;
  const apiKeyInput = document.getElementById('apiKey');
  const modelSelect = document.getElementById('modelSelect');
  const customModelGroup = document.getElementById('customModelGroup');
  const customModelInput = document.getElementById('customModel');
  const saveBtn = document.getElementById('saveBtn');
  const testBtn = document.getElementById('testBtn');
  const statusMsg = document.getElementById('statusMsg');

  // Load existing settings
  const settings = await Config.Storage.get();

  // Populate models
  modelSelect.innerHTML = '';
  Config.DEFAULT_MODELS.forEach((m) => {
    const opt = document.createElement('option');
    opt.value = m.id;
    opt.innerText = m.name;
    modelSelect.appendChild(opt);
  });
  const customOpt = document.createElement('option');
  customOpt.value = 'custom';
  customOpt.innerText = 'Custom Model Name...';
  modelSelect.appendChild(customOpt);

  apiKeyInput.value = settings.apiKey || '';
  modelSelect.value = settings.selectedModel || 'codestral-latest';
  customModelInput.value = settings.customModel || '';

  if (settings.selectedModel === 'custom') {
    customModelGroup.style.display = 'block';
  }

  modelSelect.addEventListener('change', () => {
    if (modelSelect.value === 'custom') {
      customModelGroup.style.display = 'block';
    } else {
      customModelGroup.style.display = 'none';
    }
  });

  saveBtn.addEventListener('click', async () => {
    settings.apiKey = apiKeyInput.value.trim();
    settings.selectedModel = modelSelect.value;
    settings.customModel = customModelInput.value.trim();

    await Config.Storage.save(settings);
    showStatus('Mistral settings saved successfully!', 'success');
  });

  testBtn.addEventListener('click', async () => {
    const key = apiKeyInput.value.trim();
    if (!key) {
      showStatus('Please enter your Mistral API key first.', 'error');
      return;
    }

    showStatus('Testing Mistral connection & verifying models...', '');
    try {
      const res = await fetch('https://api.mistral.ai/v1/models', {
        headers: {
          'Authorization': `Bearer ${key}`,
          'Accept': 'application/json'
        }
      });

      if (res.ok) {
        const data = await res.json();
        let available = [];
        if (data && Array.isArray(data.data)) {
          available = data.data
            .map(m => m.id)
            .filter(id => id && !/embed|moderation|ocr|audio|image|vision/i.test(id));
        }
        const hasCodestral = available.some(id => id.includes('codestral'));
        showStatus(`✓ Connected! ${available.length} models ready (${hasCodestral ? 'Codestral Active' : available.slice(0, 2).join(', ')})`, 'success');
      } else {
        showStatus(`Invalid Key: HTTP ${res.status} (Check console.mistral.ai)`, 'error');
      }
    } catch (e) {
      showStatus(`Connection error: ${e.message}`, 'error');
    }
  });

  function showStatus(text, type) {
    statusMsg.innerText = text;
    statusMsg.className = `status-msg ${type}`;
    setTimeout(() => {
      if (statusMsg.innerText === text) {
        statusMsg.innerText = '';
      }
    }, 4000);
  }
});
