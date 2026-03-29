# Daily Research Pipeline — アーキテクチャ設計

## 全体構成図

```
EventBridge Scheduler (cron: JST 09:00)
  ↓ RunTask
ECS Fargate Task (Private Subnet)
  │
  ├── main.py (オーケストレーション)
  │     │
  │     ├── load_config() → AppConfig（daily.domains リスト）
  │     ├── get_github_token() → token
  │     ├── clone_repo() → work_dir
  │     │
  │     ├── ドメインループ ─────────────────────────────┐
  │     │   │                                           │
  │     │   ├── csv_manager.get_next_pending()          │
  │     │   │     └── docs/daily/<domain>/list/*.csv    │
  │     │   │                                           │
  │     │   ├── prompt_builder.build_prompt()            │
  │     │   │     └── テンプレート + CSVデータ → プロンプト文字列│
  │     │   │                                           │
  │     │   ├── research_runner.run_research()           │
  │     │   │     └── claude -p → レポート生成            │
  │     │   │                                           │
  │     │   ├── report保存                               │
  │     │   │     └── docs/daily/<domain>/report/YYYYMMDD.md│
  │     │   │                                           │
  │     │   └── csv_manager.mark_done()                 │
  │     │         └── CSVのstatus更新                    │
  │     │                                               │
  │     ├── ←──────────────────────────────────────────┘
  │     │
  │     ├── commit_and_push() → 全ドメイン分まとめてコミット
  │     ├── create_pr() → PR作成
  │     └── notify_research_results() → 1通のメールで全レポート通知
  │
  ↕ mount
EFS (/claude-config) — Claude CLI認証永続化
```

## モジュール構成

### 新規モジュール

```
backend/src/
  csv_manager.py          # CSV読み書き（pending取得、done更新）
  prompt_builder.py       # プロンプトテンプレート展開
```

### 変更モジュール

```
backend/src/
  main.py                 # ドメインループ、集約通知
  config.py               # daily.domains設定構造
  research_runner.py      # プロンプト文字列直接受け取り対応
  email_notifier.py       # 複数ドメインまとめメール
  pr_creator.py           # 複数ドメインのPR本文
  git_manager.py          # コミットメッセージ変更
```

### 削除対象

```
docs/research/cate/metalearner/prompt/   # 旧プロンプト
docs/research/cate/prompt/               # 旧プロンプト
docs/research/prompt/                    # 旧プロンプトテンプレート
```

---

## データモデル

### 設定構造（config.py）

```python
@dataclass(frozen=True)
class DailyDomainConfig:
    name: str                    # ドメイン名（例: "legal_tech"）
    prompt_template: str         # テンプレートファイルパス

@dataclass(frozen=True)
class DailyConfig:
    domains: list[DailyDomainConfig]
    branch_prefix: str = "daily/auto"
    claude_options: str = ""

@dataclass(frozen=True)
class AppConfig:
    daily: DailyConfig           # research → daily に置換
    github: GitHubConfig         # 変更なし
    email: EmailConfig           # 変更なし
    environment: str = "dev"
    aws_region: str = "ap-northeast-1"
```

**ディレクトリ規約**:
- CSVパス: `docs/daily/{name}/list/` 配下の全`.csv`ファイル
- レポート出力先: `docs/daily/{name}/report/`
- `name`から自動導出するため、パスを個別設定する必要なし

### research-config.yaml（新構造）

```yaml
daily:
  branch_prefix: "daily/auto"
  claude_options: ""
  domains:
    - name: "legal_tech"
      prompt_template: "docs/daily/prompt_template.md"

github:
  repo: "YuriNakayama/research"
  base_branch: "main"

email:
  sender: "yuri620620@gmail.com"
  recipients:
    - "yuri.nakayama@g.softbank.co.jp"
    - "yuri620620@gmail.com"
```

**領域追加方法**: `domains`リストに1エントリ追加するだけ:
```yaml
    - name: "ai_regulation"
      prompt_template: "docs/daily/prompt_template.md"
```

### CSVデータ構造

```csv
title,url,authors,year,venue,summary,status
"Paper Title","https://arxiv.org/abs/...","Author et al.",2024,"arXiv","概要テキスト",pending
```

- `status`: `pending`（未実行）/ `done`（実行済み）
- 先頭の`pending`行から順次処理

### ディレクトリ構造

```
docs/daily/
  prompt_template.md              # 共通プロンプトテンプレート
  legal_tech/
    list/
      resources.csv               # リサーチ対象リスト
    report/
      20260329.md                 # 日次レポート
      20260330.md
  ai_regulation/                  # 領域追加例
    list/
      resources.csv
    report/
      20260329.md
```

---

## モジュール詳細設計

### csv_manager.py（新規）

```python
import csv
from pathlib import Path
from dataclasses import dataclass

@dataclass
class ResearchItem:
    """CSVの1行を表すデータクラス"""
    title: str
    url: str
    authors: str
    year: str
    venue: str
    summary: str
    status: str
    row_index: int          # CSV内の行番号（0-based、ヘッダー除く）

def get_next_pending(csv_path: Path) -> ResearchItem | None:
    """statusがpendingの先頭行を返す。なければNone。"""

def mark_done(csv_path: Path, row_index: int) -> None:
    """指定行のstatusをdoneに更新してCSVを上書き保存。"""

def get_csv_files(domain_dir: Path) -> list[Path]:
    """ドメインディレクトリ内のlist/*.csvを返す。"""
```

### prompt_builder.py（新規）

```python
from pathlib import Path

def build_prompt(template_path: Path, item: dict) -> str:
    """テンプレートファイルを読み込み、itemのフィールドで展開。

    str.format_map()を使用。
    item keys: title, url, authors, year, venue, summary
    """
```

### research_runner.py（変更）

```python
def run_research(
    prompt: str,                   # 変更: prompt_path → prompt（文字列直接）
    output_path: Path,             # 変更: output_dir → output_path（完全パス）
    work_dir: str | Path,
    claude_options: str = "",
    timeout: int = 1800,
) -> Path:
```

**変更点**:
- `prompt_path`（ファイルパス）→ `prompt`（文字列）に変更
- `output_dir`（ディレクトリ）→ `output_path`（完全ファイルパス）に変更
- ファイル名生成ロジックを呼び出し元に移動

### main.py（変更）

```python
def main() -> int:
    # 1. 設定読み込み
    config = load_config()

    # 2. GitHub認証・リポジトリクローン
    token = get_github_token(...)
    work_dir = clone_repo(...)
    configure_git(work_dir)
    branch_name = create_branch(work_dir, config.daily.branch_prefix)

    # 3. ドメインループ
    results: list[DomainResult] = []
    for domain in config.daily.domains:
        try:
            result = process_domain(domain, work_dir, config)
            results.append(result)
        except Exception as e:
            logger.error(f"Domain {domain.name} failed: {e}")
            results.append(DomainResult(domain.name, success=False, error=str(e)))

    # 4. Git操作（成功したドメインがあれば）
    if any(r.success for r in results):
        commit_and_push(work_dir, branch_name)
        pr_url = create_pr(work_dir, branch_name, ...)

    # 5. メール通知（全結果をまとめて1通）
    notify_research_results(results, ...)

    return 0 if any(r.success for r in results) else 1
```

**DomainResult**:
```python
@dataclass
class DomainResult:
    domain_name: str
    success: bool
    output_file: Path | None = None
    item_title: str = ""
    error: str = ""
```

### email_notifier.py（変更）

```python
def notify_research_results(
    results: list[DomainResult],
    pr_url: str = "",
    region: str = "ap-northeast-1",
    sender: str = "",
    recipients: list[str] | None = None,
    work_dir: str | Path | None = None,
) -> None:
    """全ドメインの結果を1通のメールにまとめて送信。

    件名: [Daily Research] YYYY-MM-DD (N domains)
    本文: 各ドメインの成功/失敗サマリ + レポート概要
    添付: 成功ドメインのMarkdown + PDF
    """
```

**メール本文構成**:
```
Daily Research Report - 2026-03-29

■ 実行サマリ
  成功: 2 / 3 ドメイン

■ レポート
  ✓ legal_tech: "Paper Title" の詳細調査
  ✓ ai_regulation: "Patent Title" の詳細調査
  ✗ fintech: エラー — Claude CLI timeout

■ PR
  https://github.com/owner/repo/pull/123

添付ファイル:
  - legal_tech_20260329.md / .pdf
  - ai_regulation_20260329.md / .pdf
```

### pr_creator.py（変更）

PR本文に複数ドメインの情報を含める:

```markdown
## Daily Research Report

**Date**: 2026-03-29
**Domains**: legal_tech, ai_regulation

### Reports
- `docs/daily/legal_tech/report/20260329.md` — "Paper Title"
- `docs/daily/ai_regulation/report/20260329.md` — "Patent Title"

Generated automatically by Auto Research Pipeline
```

---

## プロンプトテンプレート

### docs/daily/prompt_template.md

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
1. 主要な貢献と新規性
2. 提案手法の詳細（アルゴリズム、アーキテクチャ、理論的根拠）
3. 実験結果と既存手法との比較
4. 実務への応用可能性と限界
5. 関連する最新の研究動向

## 出力形式
Markdown形式で、以下のセクション構成で記述してください：
1. 概要
2. 背景と動機
3. 提案手法
4. 実験・評価
5. 考察と今後の展望
```

### ドメイン固有テンプレートの対応

`prompt_template`フィールドでドメインごとに異なるテンプレートを指定可能:

```yaml
domains:
  - name: "legal_tech"
    prompt_template: "docs/daily/prompt_template.md"         # 共通テンプレート
  - name: "patent_analysis"
    prompt_template: "docs/daily/patent_prompt_template.md"  # 特化テンプレート
```

---

## エラーハンドリング設計

```
main()
  └── ドメインループ
        ├── ドメインA: 成功 → DomainResult(success=True)
        ├── ドメインB: CSV空 → DomainResult(success=False, error="No pending items")
        └── ドメインC: Claude CLIタイムアウト → DomainResult(success=False, error="...")

  → 1つでも成功 → commit/push/PR → メール（成功+失敗の両方を記載）→ exit 0
  → 全て失敗 → メール（失敗のみ）→ exit 1
  → 全てCSV空 → メール（全完了通知）→ exit 0
```

---

## インフラ変更

### ECS タスク定義
- タイムアウト延長の検討: 複数ドメイン × 30分/ドメイン
- メモリ・CPU設定は現行維持（Claude CLI実行が支配的）

### その他
- EventBridge Scheduler: 変更なし（同じcronスケジュール）
- EFS: 変更なし
- ECR: Dockerイメージ再ビルドのみ
- Terraform: タスク定義のタイムアウト値変更のみ（必要に応じて）
