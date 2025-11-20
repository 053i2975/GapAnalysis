/**
 * WebhookSender - 画像をGAS経由でWebhookに送信するライブラリ
 * @version 1.1.0 (Encryption Support Added)
 */
class WebhookSender {
  
  static RANDOMKEY = "JtxZVYprkbSUygf_XXFeiR"; 

  /**
   * コンストラクタ
   * @param {string} gasUrl - Google Apps ScriptのデプロイURL
   * @param {Object} options - オプション設定
   */
  constructor(gasUrl, options = {}) {
    this.gasUrl = gasUrl;
    this.options = {
      showAlerts: options.showAlerts !== false, // デフォルトtrue修正
      alertStyle: options.alertStyle || 'native',
      onSuccess: options.onSuccess || null,
      onError: options.onError || null,
      onProgress: options.onProgress || null,
      maxFileSize: options.maxFileSize || 10 * 1024 * 1024, // GASの制限を考慮し10MB推奨に変更
      allowedTypes: options.allowedTypes || ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    };
  }

  // ============================================================
  // 🔒 暗号化・復号化メソッド (Staticメソッド)
  // ============================================================

  /**
   * Webhook URLを暗号化（難読化）します。
   * サイトAで利用します: WebhookSender.encrypt(url)
   * @param {string} text - 生のWebhook URL
   * @returns {string} - 暗号化された文字列
   */
  static encrypt(text) {
    if (!text) return "";
    try {
      let xorResult = "";
      const key = WebhookSender.RANDOMKEY;
      for (let i = 0; i < text.length; i++) {
        const textCharCode = text.charCodeAt(i);
        const keyCharCode = key.charCodeAt(i % key.length);
        xorResult += String.fromCharCode(textCharCode ^ keyCharCode);
      }
      return btoa(xorResult); // Base64エンコード
    } catch (e) {
      console.error("暗号化エラー:", e);
      return text;
    }
  }

  /**
   * 暗号化された文字列を復号します。
   * 内部的に使用されますが、外部から WebhookSender.decrypt(str) としても呼べます。
   * @param {string} encryptedText - 暗号化された文字列
   * @returns {string} - 復号されたWebhook URL
   */
  static decrypt(encryptedText) {
    if (!encryptedText) return "";
    // 既にhttpで始まるなら暗号化されていないとみなし、そのまま返す
    if (encryptedText.startsWith('http')) return encryptedText;

    try {
      const xorResult = atob(encryptedText); // Base64デコード
      let decryptedText = "";
      const key = WebhookSender.RANDOMKEY;
      for (let i = 0; i < xorResult.length; i++) {
        const xorCharCode = xorResult.charCodeAt(i);
        const keyCharCode = key.charCodeAt(i % key.length);
        decryptedText += String.fromCharCode(xorCharCode ^ keyCharCode);
      }
      return decryptedText;
    } catch (e) {
      console.warn("復号に失敗しました。元の値をそのまま使用します。", e);
      return encryptedText;
    }
  }

  // ============================================================
  // 📁 ファイル処理メソッド
  // ============================================================

  /**
   * ファイルをBase64に変換
   */
  async fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = () => reject(new Error('ファイルの読み込みに失敗しました'));
      reader.readAsDataURL(file);
    });
  }

  /**
   * ファイルのバリデーション
   */
  validateFile(file) {
    if (!file) return { valid: false, error: 'ファイルが選択されていません' };

    if (!this.options.allowedTypes.includes(file.type)) {
      return { valid: false, error: `サポートされていないファイル形式です（${file.type}）` };
    }

    if (file.size > this.options.maxFileSize) {
      const maxSizeMB = (this.options.maxFileSize / 1024 / 1024).toFixed(1);
      return { valid: false, error: `ファイルサイズが大きすぎます（最大${maxSizeMB}MB）` };
    }

    return { valid: true };
  }

  // ============================================================
  // 🚀 メイン送信メソッド
  // ============================================================

  /**
   * 画像をWebhookに送信
   * URLが暗号化されている場合は自動で復号します。
   * @param {File|string} file - Fileオブジェクトまたはinput要素のID
   * @param {string} webhookUrl - Webhook URL (暗号化されていてもOK)
   * @param {string} message - 送信するメッセージ (任意)
   * @returns {Promise<Object>} 送信結果
   */
  async send(file, webhookUrl, message = '') {
    try {
      // 1. input要素IDならFileを取得
      if (typeof file === 'string') {
        const input = document.getElementById(file);
        if (!input || !input.files || !input.files[0]) throw new Error('ファイルが選択されていません');
        file = input.files[0];
      }

      // 2. バリデーション
      const validation = this.validateFile(file);
      if (!validation.valid) throw new Error(validation.error);

      // 3. URLの復号処理 (自動判別)
      // 暗号化された文字列が渡された場合、ここで復号されます
      const targetUrl = WebhookSender.decrypt(webhookUrl);

      if (!targetUrl.startsWith('http')) {
        throw new Error('有効なWebhook URLではありません（復号失敗の可能性があります）');
      }

      // 4. 進行状況: 変換開始
      if (this.options.onProgress) this.options.onProgress('変換中...', 30);

      const base64Data = await this.fileToBase64(file);

      // 5. 進行状況: 送信開始
      if (this.options.onProgress) this.options.onProgress('送信中...', 60);

      const formData = new FormData();
      formData.append('webhookUrl', targetUrl); // 復号済みのURLを使用
      formData.append('file', base64Data);
      formData.append('fileName', file.name);
      formData.append('mimeType', file.type);
      formData.append('message', message); // 以前のGASコードに合わせてキーを'name'としています

      // 6. GASへ送信
      const response = await fetch(this.gasUrl, {
        method: 'POST',
        body: formData,
        mode: 'no-cors' // GASへのPOSTはno-corsが基本
      });

      // 7. 完了処理
      if (this.options.onProgress) this.options.onProgress('完了', 100);

      const result = {
        success: true,
        message: '画像を送信しました',
        fileName: file.name
      };

      if (this.options.onSuccess) this.options.onSuccess(result);
      return result;

    } catch (error) {
      const errorResult = { success: false, message: error.message };
      if (this.options.onError) this.options.onError(errorResult);
      // エラーアラート表示(オプション)
      if(this.options.showAlerts) alert('❌ ' + error.message);
      throw error;
    }
  }
}

// グローバル公開
if (typeof window !== 'undefined') {
  window.WebhookSender = WebhookSender;
}