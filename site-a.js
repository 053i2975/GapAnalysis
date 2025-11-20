// Modal functionality
const modal = document.getElementById('consentModal');
const checkbox = document.getElementById('modalConsentCheckbox');
const agreeBtn = document.getElementById('modalAgreeBtn');

// Check if user has already agreed
if (localStorage.getItem('termsAgreed') === 'true') {
    modal.classList.add('hidden');
}

checkbox.addEventListener('change', () => {
    agreeBtn.disabled = !checkbox.checked;
});

agreeBtn.addEventListener('click', () => {
    localStorage.setItem('termsAgreed', 'true');
    modal.classList.add('hidden');
});






// URL generation functionality
const webhookInput = document.getElementById('webhookInput');
const generateBtn = document.getElementById('generateBtn');
const generatedDiv = document.getElementById('generated');

generateBtn.addEventListener('click', () => {
    const webhookUrl = webhookInput.value.trim();
    
    if (!webhookUrl) {
    alert('Webhook URLを入力してください。');
        return;
    }

    // Validate URL format
    try {
        new URL(webhookUrl);
    } catch (e) {
        alert('有効なURLを入力してください。');
        return;
    }



    // サイトBのURLとパラメータを結合
    const siteBPath = 'GapAnalysis.html';
    
    const encryptedUrl = WebhookSender.encrypt(webhookUrl);

    // URLSearchParamsを使ってURLエンコードされたパラメータを作成
    const params = new URLSearchParams();
    params.append('sid', encryptedUrl);
    
    // 最終的な遷移先URLを生成: siteB.html?webhook=入力されたURL
    const finalUrl = `${siteBPath}?${params.toString()}`;




    // Display result
    generatedDiv.innerHTML = `
    <div class="result-box">
        <h3>✓ 専用URLが生成されました</h3>
        <p>このURLを共有すると、アクセスした人の診断画像を取得することができます。</p>
        <div class="url-display">
        <a href="${finalUrl}" class="generated-url" target="_blank">${finalUrl}</a>
        </div>
        <div class="action-buttons">
        <button class="copy-button" onclick="copyToClipboard('${finalUrl}')">URLをコピー</button>
        </div>
    </div>
    `;
});

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
    alert('URLをクリップボードにコピーしました！');
    }).catch(() => {
    alert('コピーに失敗しました。手動でコピーしてください。');
    });
}


