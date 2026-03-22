---
name: research-prompt-builder
description: 対話型ヒアリングで研究調査プロンプトを構築するスキル。AskUserQuestionツールを使った選択肢形式（複数選択・フリー記述可）のヒアリングを繰り返し、構造化された研究調査プロンプトを生成してファイル保存する。「調査プロンプトを作って」「研究テーマのプロンプトを作成」「サーベイ用のプロンプトを生成」「論文調査の指示書を作りたい」「research prompt」などのリクエストで使用する。研究分野を問わず汎用的に使える。
---

# Research Prompt Builder

AskUserQuestionツールを使った選択肢形式のヒアリングを段階的に行い、研究調査用の構造化プロンプトを生成するスキル。

## 全体の流れ

1. ユーザーの初期入力から研究テーマを把握する
2. 不足情報をAskUserQuestionで段階的にヒアリングする
3. 構造化プロンプトを生成し、会話内に表示＋ファイル保存する

ヒアリングはすべてAskUserQuestionの選択肢形式で行う。フリー記述はAskUserQuestionの「Other」オプション（自動付与）で受け付ける。テキストで質問を投げかけるのではなく、必ずAskUserQuestionツールを使うこと。

## Step 1: 研究テーマの把握

ユーザーの初期入力を分析し、以下の情報がどの程度含まれているか判断する：

- **テーマ/タイトル**: 何を調査するか
- **目的(objective)**: なぜ調査するか
- **除外条件(exclusion)**: 何を対象外とするか
- **ゴール(goals)**: 具体的に何を達成したいか
- **手順(steps)**: どのように進めるか
- **ルール(rules)**: どのような制約があるか

初期入力に十分な情報がある項目はヒアリングをスキップし、不足している項目のみ聞く。初期入力がほぼない場合は、まず研究分野と調査テーマをヒアリングする。

### 初期入力が少ない場合の最初のヒアリング

```
AskUserQuestion:
  question: "どの研究分野の調査プロンプトを作成しますか？"
  header: "研究分野"
  multiSelect: false
  options:
    - label: "機械学習・AI"
      description: "深層学習、強化学習、NLP、CV等の機械学習関連"
    - label: "統計・因果推論"
      description: "統計手法、因果推論、実験計画法等"
    - label: "ソフトウェア工学"
      description: "開発手法、アーキテクチャ、テスト等"
    - label: "自然科学・工学"
      description: "物理、化学、生物、電気電子等"
```

この回答を踏まえて、テーマの詳細をさらにヒアリングする。分野に応じた選択肢を動的に構成すること。

## Step 2: 目的(objective)のヒアリング

テーマが決まったら、調査の目的を明確にする。ユーザーの初期入力から目的が読み取れる場合はスキップ可能。

```
AskUserQuestion:
  question: "この調査の主な目的は何ですか？"
  header: "目的"
  multiSelect: false
  options:
    - label: "手法のサーベイ"
      description: "特定分野の手法を網羅的に調査し、比較・整理する"
    - label: "最新動向の把握"
      description: "直近の研究トレンドや新しいアプローチを把握する"
    - label: "実装・適用検討"
      description: "特定の手法を自分のタスクに適用するための知見を得る"
    - label: "理論的理解"
      description: "手法の理論的背景や数学的基盤を深く理解する"
```

## Step 3: 除外条件(exclusion)のヒアリング

調査範囲を絞るための除外条件を確認する。テーマに応じて選択肢を動的に構成する。

```
AskUserQuestion:
  question: "調査から除外したい条件はありますか？（複数選択可）"
  header: "除外条件"
  multiSelect: true
  options:
    - label: "{テーマに応じた除外候補1}"
      description: "{説明}"
    - label: "{テーマに応じた除外候補2}"
      description: "{説明}"
    - label: "{テーマに応じた除外候補3}"
      description: "{説明}"
    - label: "特になし"
      description: "除外条件を設けない"
```

選択肢はテーマに基づいて動的に生成する。例：
- 機械学習の場合: 「特定のモデルアーキテクチャ」「特定のタスク」「理論のみの論文」
- 因果推論の場合: 「特定の推定対象」「特定の手法カテゴリ」「シミュレーションのみの研究」

## Step 4: ゴール(goals)のヒアリング

具体的な成果物・達成目標を確認する。

```
AskUserQuestion:
  question: "調査のゴールとして何を重視しますか？（複数選択可）"
  header: "ゴール"
  multiSelect: true
  options:
    - label: "論文リストの作成"
      description: "関連論文を網羅的にリスト化する"
    - label: "手法の比較表"
      description: "手法の特徴・前提条件・性能を比較する表を作成"
    - label: "分類体系の整理"
      description: "手法を方向性・アプローチで分類する"
    - label: "実装ガイド"
      description: "実装に必要な情報やコード例をまとめる"
```

## Step 5: 調査手順(steps)のヒアリング

調査の進め方について確認する。

```
AskUserQuestion:
  question: "調査はどのような手順で進めますか？（複数選択可）"
  header: "手順"
  multiSelect: true
  options:
    - label: "キーワード検索 (Recommended)"
      description: "検索キーワードを収集し、Google Scholar/arXivで論文を検索"
    - label: "引用ネットワーク追跡"
      description: "主要論文の引用・被引用をたどって関連論文を発見"
    - label: "サーベイ論文起点"
      description: "既存のサーベイ論文を起点に関連手法を網羅"
    - label: "会議・ジャーナル指定"
      description: "特定の学会やジャーナルの論文を優先的に調査"
```

## Step 6: ルール(rules)のヒアリング

調査の制約・ルールを確認する。

```
AskUserQuestion:
  question: "調査に適用するルールを選んでください（複数選択可）"
  header: "ルール"
  multiSelect: true
  options:
    - label: "英語論文のみ (Recommended)"
      description: "英語で書かれた論文に限定する"
    - label: "直近N年以内"
      description: "発表時期を直近の数年に限定する"
    - label: "概要は簡潔に"
      description: "各論文の概要は3-5文程度にまとめる"
    - label: "リンク必須"
      description: "論文へのリンクを必ず含める"
```

「直近N年以内」が選ばれた場合、年数を追加でヒアリングする：

```
AskUserQuestion:
  question: "論文の公開時期をどの範囲に限定しますか？"
  header: "期間"
  multiSelect: false
  options:
    - label: "過去3年以内 (Recommended)"
      description: "比較的新しい研究に絞る"
    - label: "過去5年以内"
      description: "やや広めに最近の研究をカバー"
    - label: "過去1年以内"
      description: "最新の研究のみに絞る"
```

## Step 7: 確認と生成

すべてのヒアリングが完了したら、収集した情報をまとめて確認する。

```
AskUserQuestion:
  question: "以下の内容でプロンプトを生成します。よろしいですか？"
  header: "確認"
  multiSelect: false
  options:
    - label: "生成する"
      description: "この内容でプロンプトを生成してファイルに保存する"
    - label: "修正したい項目がある"
      description: "特定の項目を修正してから生成する"
```

確認の質問を出す前に、収集した情報のサマリーを会話内にテキストで表示すること。

「修正したい項目がある」が選ばれた場合は、修正対象の項目を選択肢で聞き、該当項目のヒアリングをやり直す。

## 出力フォーマット

以下のXMLベースの構造で出力する：

```markdown
## {タイトル}
<title>{タイトル}</title>
<objective>
{目的の記述}
</objective>

<exclusion>
{除外条件のリスト（箇条書き）}
</exclusion>

<goals>
{ゴールのリスト（箇条書き）}
</goals>

<steps>
{番号付きの手順リスト}
</steps>

<rules>
{ルールのリスト（箇条書き）}
</rules>
```

## 出力先

1. **会話内に表示**: 生成したプロンプト全文を会話内に表示する
2. **ファイル保存**: 保存先をユーザーに確認する

```
AskUserQuestion:
  question: "プロンプトをどこに保存しますか？"
  header: "保存先"
  multiSelect: false
  options:
    - label: "docs/research/ 配下"
      description: "リポジトリのdocs/research/ディレクトリに保存"
    - label: "カレントディレクトリ"
      description: "現在の作業ディレクトリに保存"
    - label: "保存しない"
      description: "会話内の表示のみで保存しない"
```

ファイル名は `{テーマのkebab-case}-prompt.md` とする。

## ヒアリングの原則

- すべてのヒアリングはAskUserQuestionツールの選択肢形式で行う。テキストベースの質問は使わない
- ユーザーの初期入力から読み取れる情報はスキップし、不足分のみ聞く
- 選択肢はテーマに応じて動的に構成する（上記の例はテンプレートであり、そのまま使うのではなく内容を調整する）
- 1回のAskUserQuestionで1-4個の質問を同時に聞ける。関連する質問はまとめて効率的にヒアリングする
- ユーザーが「Other」で自由記述した内容は、プロンプトにそのまま反映する

## 言語

- ヒアリング（AskUserQuestionのlabel, description, question）はすべて日本語
- 出力プロンプトも日本語
- 手法名や専門用語は原語のまま保持する
