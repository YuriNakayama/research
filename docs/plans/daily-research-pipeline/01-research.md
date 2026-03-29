# Daily Research Pipeline — テクニカルリサーチ

## コードベース深掘り分析

### main.py — オーケストレーション

**ファイル**: `backend/src/main.py`

```python
def main() -> int:
```

**現在のフロー**:
1. `load_config()` → `AppConfig`（単一リサーチ設定）
2. `get_github_token()` → GitHub認証トークン
3. `clone_repo()` → 一時ディレクトリにリポジトリクローン
4. `configure_git()` / `create_branch()` → ブランチ作成
5. `run_research()` → **単一の**レポートファイル（Path）
6. `commit_and_push()` → git操作
7. `create_pr()` → PR作成・URL取得
8. `notify_success()` or `notify_failure()` → メール通知

**変更が必要な点**:
- 単一`run_research()`呼び出し → 複数ドメインのループ処理
- PR作成はオプション化（daily方式ではPR不要の可能性あり）
- `notify_success()`に複数ファイルのまとめ送信対応

### research_runner.py — リサーチ実行

**ファイル**: `backend/src/research_runner.py`

```python
def run_research(
    prompt_path: str,
    output_dir: str,
    work_dir: str | Path,
    claude_options: str = "",
    timeout: int = 1800,
) -> Path:
```

**現在の動作**:
- `prompt_path`のMarkdownファイルを読み込み、`claude -p`で実行
- 出力を`report-YYYYMMDD.md`で保存（UTC日付）
- プリアンブル（Claude CLIの権限メッセージ）を`\n# `の前で除去

**変更が必要な点**:
- プロンプトをファイルから読むのではなく、テンプレート＋CSVデータから動的生成
- ファイル名を`report-YYYYMMDD.md`から`YYYYMMDD.md`に変更
- 出力先を`docs/daily/<domain>/report/`に変更

### config.py — 設定管理

**ファイル**: `backend/src/config.py`

```python
@dataclass(frozen=True)
class ResearchConfig:
    prompt_path: str          # 単一プロンプトパス
    output_dir: str           # 単一出力先
    branch_prefix: str = "research/auto"
    claude_options: str = ""
    skill: str = ""
```

**変更が必要な点**:
- `ResearchConfig`を複数ドメイン対応に再設計
- ドメインリスト構造の追加
- 共通プロンプトテンプレートパスの管理

### email_notifier.py — メール通知

**ファイル**: `backend/src/email_notifier.py`

```python
def notify_success(
    pr_url: str,
    output_files: list[str],
    region: str = "ap-northeast-1",
    sender: str = "",
    recipients: list[str] | None = None,
    work_dir: str | Path | None = None,
) -> None:
```

**現在の動作**:
- PR URLとファイルリストをメール本文に記載
- 各出力ファイルをMarkdown + PDF添付
- `_markdown_to_pdf()`: fpdf2で日本語フォント対応PDF生成
- AWS SES経由で送信（`send_raw_email`でMIME添付）

**変更が必要な点**:
- PR URLパラメータの廃止（daily方式ではPR不要）
- 複数ドメインのレポートを1通にまとめる本文構成
- 件名の変更（ドメイン情報を含める）
- 各ドメインごとにMarkdown+PDF添付

### git_manager.py — Git操作

```python
def create_branch(work_dir, prefix="research/auto") -> str:
def commit_and_push(work_dir, branch_name, message=None) -> None:
```

**変更が必要な点**:
- コミットメッセージに複数ドメイン情報を含める
- ブランチプレフィックスの変更（`daily/auto`等）

### pr_creator.py — PR作成

**変更が必要な点**:
- PR本文に複数ドメインのレポートをリスト
- または、daily方式ではPR作成をスキップする選択肢

### research-config.yaml — 現在の設定

```yaml
research:
  prompt_path: "docs/research/cate/metalearner/prompt/search_paper.md"
  output_dir: "docs/research/cate/metalearner"
  branch_prefix: "research/auto"

github:
  repo: "YuriNakayama/research"
  base_branch: "main"

email:
  sender: "yuri620620@gmail.com"
  recipients:
    - "yuri.nakayama@g.softbank.co.jp"
    - "yuri620620@gmail.com"
```

**変更が必要な点**: `research`セクションを`daily`セクションに完全置換

### テストパターン

**ファイル**: `backend/tests/test_*.py`

- AAA（Arrange-Act-Assert）パターン
- `unittest.mock`でsubprocess、boto3、requestsをモック
- `tmp_path` pytestフィクスチャで一時ディレクトリ
- 環境変数は`patch.dict(os.environ, ...)`でオーバーライド

---

## research-gatherスキル出力 → CSV変換

### research-gather出力形式

```markdown
## 学術論文
| # | 領域 | タイトル | 著者 | 年 | Venue | 概要 |
|---|------|---------|------|-----|-------|------|
| 1 | legal_tech | [タイトル](https://arxiv.org/abs/...) | Author et al. | 2024 | arXiv | 概要テキスト |
```

### CSV変換時の考慮点

- Markdownリンク `[title](url)` → `title`列と`url`列に分離が必要
- `status`列の追加（初期値: `pending`）
- 領域列はディレクトリ構造で暗黙的に表現されるため、CSV内では不要
- Python標準ライブラリ`csv`モジュールで十分（pandas不要）

### CSV構造（最終設計）

```csv
title,url,authors,year,venue,summary,status
"Paper Title","https://arxiv.org/abs/...","Author et al.",2024,"arXiv","概要テキスト",pending
```

---

## プロンプトテンプレート分析

### 既存プロンプトパターン

**XMLタグ方式**（`docs/research/prompt/search_paper.md`）:
```markdown
<title>テーマ名</title>
<objective>調査目的</objective>
<goals>調査ゴール</goals>
<steps>調査手順</steps>
<rules>制約条件</rules>
```

**自然言語方式**（`docs/research/cate/metalearner/prompt/search_paper.md`）:
```markdown
# 調査テーマ
## 調査観点
## 出力形式
```

### Daily方式のプロンプトテンプレート設計

CSVの各フィールドを埋め込み可能なテンプレートが必要。Pythonの`str.format()`または`string.Template`で十分:

```markdown
# {title} の詳細調査

以下のリソースについて、詳細な調査レポートを日本語で作成してください。

## 調査対象
- **タイトル**: {title}
- **URL**: {url}
- **著者**: {authors}
- **発表年**: {year}
- **掲載先**: {venue}
- **概要**: {summary}

## 調査観点
1. 論文/リソースの主要な貢献と新規性
2. 提案手法の詳細（アルゴリズム、アーキテクチャ等）
3. 実験結果と既存手法との比較
4. 実務への応用可能性と限界
5. 関連する最新の研究動向

## 出力形式
Markdown形式で、セクションを分けて記述してください。
```

**選択**: `str.format_map()`を使用。理由:
- 外部ライブラリ不要
- CSVのdict行をそのまま渡せる
- 未定義キーはKeyErrorで明示的にエラー

---

## 技術的制約

### Claude CLI
- タイムアウト: デフォルト30分（各ドメインで独立）
- 同時実行: 不可（1プロセスずつ順次実行）
- `--allowedTools WebSearch WebFetch`が必須

### AWS SES
- 添付ファイルサイズ: 最大10MB（raw email）
- 複数ドメインのPDF添付時にサイズ制限に注意
- レート制限: 1秒あたり1通（デフォルト）

### ECS Fargate
- タスク最大実行時間の考慮（複数ドメイン×30分/ドメイン）
- メモリ制限: 現行設定の確認が必要

### CSV操作
- Python標準`csv`モジュールで十分
- UTF-8 BOMなし
- ファイルロック不要（単一プロセス実行）

---

## ライブラリ選定

### CSV処理
- **選択**: Python標準`csv`モジュール
- **理由**: 外部依存なし、要件が単純（読み取り・1行更新）
- **代替案**: pandas — オーバースペック、依存が大きい

### テンプレートエンジン
- **選択**: `str.format_map()`（Python標準）
- **理由**: CSVのdict行をそのまま渡せる、外部依存なし
- **代替案**: Jinja2 — 現時点では不要な複雑さ

### 追加依存: なし
- 全て Python標準ライブラリで対応可能

---

## リサーチサマリ

### 設計に影響する主要な発見

1. **research_runner.pyは軽微な変更で再利用可能** — プロンプト文字列を直接渡すインターフェースに変更すれば、CSV→テンプレート→実行のフローに対応できる
2. **email_notifier.pyのPDF生成は既に複数ファイル対応** — `output_files: list[str]`で複数ファイルを受け取れる。本文テンプレートの変更のみ
3. **config.pyのfrozenデータクラスパターンを維持** — 新しいドメイン設定もimmutableデータクラスで定義
4. **CSV操作は標準ライブラリで十分** — 外部依存の追加不要
5. **プロンプトテンプレートは`str.format_map()`で実装** — CSVのdict行と直接互換

### 推奨アプローチ

- 新規モジュール`csv_manager.py`を追加してCSV読み書きを担当
- `research_runner.py`はプロンプト文字列を直接受け取るように変更
- `main.py`でドメインループを実装し、各ドメインの結果を集約
- 設定は`daily.domains`リストで管理、領域追加はYAMLに1エントリ追加のみ
- 既存の単一プロンプト方式のコード・設定は完全削除
