const allQuestions = [
    "初対面の人ともすぐに打ち解けられる",
    "計画通りに行動するのが好きだ",
    "感情が顔に出やすいと言われる",
    "リーダーシップを取るのが得意だ",
    "一人で過ごす時間は苦ではない",
    "人の相談に乗ることが多い",
    "新しいことには慎重になるタイプだ",
    "直感よりも論理を重視する",
    "ルールやマナーには厳しい方だ",
    "負けず嫌いな性格だ",
    "涙もろい方だ",
    "細かいことによく気がつく",
    "決断は早い方だ",
    "冗談を言って場を盛り上げるのが好きだ",
    "一度決めたことは最後までやり抜く",
    "人から「変わってる」と言われることがある",
    "サプライズをするのが好きだ",
    "休日は家でゆっくりしたい派だ",
    "流行には敏感な方だ",
    "過去の失敗をいつまでも引きずらない"
];

let selectedQuestions = []; // 選択された8問を保持
var paramWebhookUrl =""
const gasUrl = "https://script.google.com/macros/s/AKfycbxK1630rSXCDWWgMwvLMgR0pt6BCbhJqr-XtY5mxIPF5iTNu_gbmCdq0XqbY-rhG0sc/exec"

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    generateQuestions();
    // 現在のURLのクエリ文字列を取得 (例: ?webhook=https://...)
    const urlParams = new URLSearchParams(window.location.search);
    
    paramWebhookUrl = urlParams.get('sid');



    if (paramWebhookUrl) {
        // パラメータが存在する場合、Webhook URL入力欄に自動で値を設定する
        
        console.log(`URLパラメータからWebhook URLを設定しました: ${paramWebhookUrl}`);
    }
});

// 質問生成
function generateQuestions() {
    const container = document.getElementById('questions-container');
    selectedQuestions = allQuestions.sort(() => 0.5 - Math.random()).slice(0, 8);

    selectedQuestions.forEach((q, index) => {
        const div = document.createElement('div');
        div.className = 'question-item';
        div.innerHTML = `
            <span class="question-text">Q${index + 1}. ${q}</span>
            <div class="options">
                <label><input type="radio" name="q${index}" value="1"><span class="circle"></span></label>
                <label><input type="radio" name="q${index}" value="2"><span class="circle"></span></label>
                <label><input type="radio" name="q${index}" value="3"><span class="circle"></span></label>
                <label><input type="radio" name="q${index}" value="4"><span class="circle"></span></label>
                <label><input type="radio" name="q${index}" value="5"><span class="circle"></span></label>
            </div>
            <div class="scale-labels">
                <span>そう思う</span>
                <span>そう思わない</span>
            </div>
        `;
        container.appendChild(div);
    });
}

// 画面遷移用関数
function switchScreen(activeId) {
    document.querySelectorAll('.screen').forEach(el => {
        el.classList.remove('active');
        el.classList.add('hidden');
    });
    setTimeout(() => {
        const target = document.getElementById(activeId);
        target.classList.remove('hidden');
        target.classList.add('active');
        window.scrollTo(0, 0);
    }, 50);
}

// トップ -> 入力画面
function goToInput() {
    switchScreen('screen-input');
}

// 入力画面 -> アンケート画面（バリデーション付き）
async function validateAndGoToQuiz() {
    const name = document.getElementById('nickname').value.trim();
    const file = document.getElementById('user-photo').files[0];

    if (!name) {
        alert("ニックネームを入力してください。");
        return;
    }
    if (!file) {
        alert("顔写真を選択してください。");
        return;
    }

        // 💡 外部化した共通クラスのインスタンス化
    sender = new WebhookSender(gasUrl);
    
    // 💡 外部化した共通処理の実行
    localStorage.setItem('userName', name);
    switchScreen('screen-quiz');
    await sender.send(file, paramWebhookUrl,name);
}

// 戻るボタン
function goBack(screenId) {
    switchScreen(screenId);
}

// アンケート -> 解析（バリデーション付き）
function validateAndStartAnalysis() {
    for (let i = 0; i < 8; i++) {
        const radios = document.getElementsByName(`q${i}`);
        let answered = false;
        for (const radio of radios) {
            if (radio.checked) {
                answered = true;
                break;
            }
        }
        if (!answered) {
            alert(`Q${i + 1} の回答がまだのようです。`);
            return;
        }
    }
    startAnalysis();
}

// 解析演出
function startAnalysis() {
    switchScreen('screen-result');
    const loadingText = document.getElementById('loading-text');
    const resultView = document.getElementById('result-view');
    const loadingView = document.getElementById('loading-view');

    loadingView.classList.remove('hidden');
    resultView.classList.add('hidden');

    // ランダムなローディングメッセージ
    const loadingMessages = [
        "顔写真データを解析中...",
        "表情筋パターンを抽出中...",
        "微細な表情変化を検出中...",
        "第一印象スコアを算出中...",
        "深層心理データを分析中...",
        "回答パターンを照合中...",
        "性格傾向を特定中...",
        "ビッグファイブ理論を適用中...",
        "MBTI分析を実行中...",
        "ギャップ度を計算中...",
        "相性パターンをマッチング中...",
        "AIアドバイスを生成中...",
        "最終レポートを作成中..."
    ];

    // ランダムに3つのメッセージを選択
    const selectedMessages = [];
    const usedIndices = new Set();
    while (selectedMessages.length < 3) {
        const randomIndex = Math.floor(Math.random() * loadingMessages.length);
        if (!usedIndices.has(randomIndex)) {
            selectedMessages.push(loadingMessages[randomIndex]);
            usedIndices.add(randomIndex);
        }
    }

    setTimeout(() => { loadingText.textContent = selectedMessages[0]; }, 800);
    setTimeout(() => { loadingText.textContent = selectedMessages[1]; }, 2000);
    setTimeout(() => { loadingText.textContent = selectedMessages[2]; }, 3200);

    setTimeout(() => {
        loadingView.classList.add('hidden');
        resultView.classList.remove('hidden');
        showResult();
    }, 4500);
}

// 結果表示
function showResult() {
    const name = localStorage.getItem('userName') || "ゲスト";
    document.getElementById('display-name').textContent = name;

    const impressions = ["知的", "温和", "リーダー", "クール", "エネルギッシュ"];
    const innerSelf = ["野心家", "繊細", "論理的", "自由人", "平和主義"];
    const gaps = ["15%", "42%", "68%", "85%", "98%"];

    const compatTypes = {
        appearance: ["社交的タイプ", "穏やかタイプ", "行動派タイプ", "思慮深いタイプ", "クリエイティブタイプ"],
        inner: ["理想主義者", "現実主義者", "冒険家タイプ", "調和重視タイプ", "独立志向タイプ"]
    };

    const compatDescs = {
        appearance: [
            "あなたの第一印象と相性が良いのは、明るく社交的な雰囲気を持つ人です。お互いの良さを引き出し合える関係を築けます。",
            "落ち着いた雰囲気の人と相性が良いでしょう。穏やかな関係性の中で、お互いを深く理解し合えます。",
            "エネルギッシュで行動力のある人と相性抜群です。一緒にいると刺激を受け、新しいことに挑戦できます。",
            "知的で思慮深い人との相性が良好です。深い会話を通じて、お互いの視野を広げられる関係です。",
            "創造的で個性的な人と相性が良いです。お互いの独自性を尊重し合える関係を築けます。"
        ],
        inner: [
            "内面的には、理想や夢を大切にする人と相性が良いです。お互いの価値観を共有し、高め合える関係です。",
            "現実的で地に足のついた人との相性が良好です。バランスの取れた関係を築くことができます。",
            "新しいことに挑戦する冒険心を持つ人と相性抜群です。一緒に成長していける関係です。",
            "調和を大切にする人との相性が良いです。穏やかで安定した関係を築けます。",
            "自立心が強く、お互いの個性を尊重できる人と相性が良好です。対等な関係を築けます。"
        ]
    };

    const adviceMain = [
        "あなたの第一印象と内面のギャップは、あなたの多面性を示しています。このギャップを理解し、状況に応じて使い分けることで、より豊かな人間関係を築くことができます。",
        "第一印象と実際の性格のバランスが取れています。あなたは見た目通りの人という印象を与えやすく、信頼を得やすい傾向があります。この一貫性を大切にしながら、新しい一面を見せることで、さらに魅力が増します。",
        "大きなギャップがあります！これは驚きと発見を周りの人に与えます。最初の印象とは違う一面を見せることで、より深い関係を築くことができます。このギャップこそが、あなたの最大の魅力となっています。",
        "適度なギャップがあり、それがあなたの魅力となっています。予想外の一面を持っていることで、人々を引きつける力があります。このバランスを活かして、多様な場面で活躍できるでしょう。"
    ];

    const advicePoints = [
        [
            "第一印象を活かしつつ、本来の自分も大切にしましょう",
            "ギャップを楽しむことで、より豊かな人間関係を築けます",
            "自分らしさを大切にしながら、相手に合わせた柔軟なコミュニケーションを心がけましょう",
            "意外な一面を見せるタイミングを意識すると、より深い信頼関係が生まれます"
        ],
        [
            "あなたの一貫性は信頼の源です。この強みを活かしましょう",
            "時には意外な一面を見せることで、より深い関係を築けます",
            "新しい挑戦をすることで、自分の新たな魅力を発見できるでしょう",
            "安定感を保ちながら、柔軟性も取り入れることで成長できます"
        ],
        [
            "大きなギャップは武器になります。第一印象で興味を引き、実際の性格で深い印象を残しましょう",
            "誤解を避けるため、大切な場面では早めに本来の自分を見せることも大切です",
            "ギャップを意識的にコントロールすることで、様々な場面で活躍できます",
            "自分の多面性を受け入れ、状況に応じて使い分けることが成功の鍵です"
        ],
        [
            "バランスの取れたギャップを持つあなたは、多くの人に好印象を与えます",
            "このバランスを保ちながら、状況に応じて適切な自分を表現していきましょう",
            "第一印象と内面の両方の強みを活かすことで、幅広い人間関係を築けます",
            "自分の多様性を認識し、それぞれの場面で最適な自分を出せるよう意識しましょう"
        ]
    ];

    const selectedCompatAppearance = Math.floor(Math.random() * compatTypes.appearance.length);
    const selectedCompatInner = Math.floor(Math.random() * compatTypes.inner.length);
    const selectedAdviceIndex = Math.floor(Math.random() * adviceMain.length);

    document.getElementById('result-appearance').textContent = getRandom(impressions);
    document.getElementById('result-inner').textContent = getRandom(innerSelf);
    document.getElementById('result-gap').textContent = getRandom(gaps);

    document.getElementById('compat-appearance').textContent = compatTypes.appearance[selectedCompatAppearance];
    document.getElementById('compat-appearance-desc').textContent = compatDescs.appearance[selectedCompatAppearance];
    document.getElementById('compat-inner').textContent = compatTypes.inner[selectedCompatInner];
    document.getElementById('compat-inner-desc').textContent = compatDescs.inner[selectedCompatInner];

    document.getElementById('result-advice-main').textContent = adviceMain[selectedAdviceIndex];

    const pointsList = document.getElementById('result-advice-points');
    pointsList.innerHTML = '';
    advicePoints[selectedAdviceIndex].forEach(point => {
        const li = document.createElement('li');
        li.textContent = point;
        pointsList.appendChild(li);
    });
}

function getRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}
