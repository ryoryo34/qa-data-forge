# QA Data Forge - デプロイメントガイド

## 🚀 起動方法

### 1. 依存関係のインストール

```bash
# ルートディレクトリで
npm install

# フロントエンド依存関係
cd frontend
npm install
cd ..
```

### 2. アプリケーションの起動

#### 方法A: フルスタック起動（推奨）
```bash
npm run dev:full
```

#### 方法B: 個別起動
```bash
# ターミナル1: APIサーバー (http://localhost:3001)
npm run server

# ターミナル2: フロントエンド (http://localhost:3000)
npm run frontend
```

### 3. アクセス先
- **Webアプリケーション**: http://localhost:3000
- **API サーバー**: http://localhost:3001
- **API ドキュメント**: http://localhost:3001/api/health

## 🧪 テスト実行

### ユニットテスト
```bash
npm test
```

### 手動統合テスト
```bash
npm run build
node test-manual.js
```

### 型チェック
```bash
npm run typecheck
```

## 📁 プロジェクト構造

```
qa-data-forge/
├── src/                    # コアライブラリ
│   ├── core/              # メインパイプライン
│   ├── processors/        # データ処理・変換
│   ├── validators/        # データ検証・整合性チェック
│   ├── agents/           # モックデータ生成
│   └── interfaces/       # 型定義
├── server/               # Express.js APIサーバー
├── frontend/            # React Webアプリケーション
├── e2e/                # Playwright E2Eテスト
└── tests/              # Jestユニットテスト
```

## 🔧 主な機能

### データ生成
- プロンプト入力によるモックデータ生成
- カスタマイズ可能な生成数とフォーマット
- 384次元埋め込みベクトル自動生成

### データ処理
- JSON ファイルアップロード対応
- データ検証・前処理
- 既存データとの整合性チェック
- テーブル形式変換

### 出力フォーマット
- JSON / CSV対応
- ダウンロード機能
- 複数表示モード（テーブル/JSON/フォーマット済み）

## 🛠️ 技術スタック

- **バックエンド**: Node.js, TypeScript, Express.js, Zod
- **フロントエンド**: React, TypeScript, Axios
- **テスト**: Jest, Playwright
- **開発ツール**: ESLint, TypeScript Compiler

## 📊 テスト結果サマリー

✅ **ユニットテスト**: 4/4 パス  
✅ **統合テスト**: 4/4 パス  
✅ **型チェック**: エラーなし  
✅ **ビルド**: 成功  

## 🚨 トラブルシューティング

### ポート競合エラー
```bash
# プロセス確認・終了
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
```

### 依存関係エラー
```bash
# キャッシュクリア・再インストール
rm -rf node_modules package-lock.json
npm install
```

### フロントエンド起動エラー
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

## 💡 開発のヒント

1. **ホットリロード**: `npm run dev:full` で両方のサーバーが自動リロードされます
2. **API テスト**: http://localhost:3001/api/health で動作確認
3. **ログ監視**: サーバーコンソールでAPIリクエストログを確認可能