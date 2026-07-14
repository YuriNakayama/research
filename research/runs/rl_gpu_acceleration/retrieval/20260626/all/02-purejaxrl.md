# 02. PureJaxRL（Chris Lu / Oxford FLAIR）

## 概要カード

- **GitHub**: https://github.com/luchris429/purejaxrl
- **一言で言うと**: "Really Fast End-to-End Jax RL Implementations" — RL パイプライン全体（環境 + rollout + learner）を JAX で書き、end-to-end で jit コンパイル・ベクトル化して GPU 上で実行
- **Star（概算）**: ~1,085（≈1.1k、GitHub API ライブ取得 2026-06-26）
- **最新状態**: タグ付きリリースは一度も無し。最終 code push は 2024-09-09（以後コミット無し）。半休眠だが、新しい JAX-RL ライブラリ群が比較基準とする正典的リファレンス実装。License: Apache-2.0
- **実装アルゴリズム**: PPO（discrete）、PPO-continuous、PPO-RNN、PPO-MiniGrid、**DQN**、**DPO-continuous**
- **主要ベンチマーク**: 「4000x 超高速化」（合成的スループット指標）。クリーンな単一エージェント値は ~10x（vs CleanRL PyTorch）。出典: https://chrislu.page/blog/meta-disco/

## リポジトリ事実（GitHub API 直接取得 2026-06-26）

| 項目 | 値 |
|------|-----|
| 作成日 | 2023-02-25 |
| 最終 code push | 2024-09-09（以後コミット無し） |
| リリース | 公開タグ無し |
| License | Apache-2.0 |
| 一言説明 | "Really Fast End-to-End Jax RL Implementations" |

出典: https://api.github.com/repos/luchris429/purejaxrl

## 実装アルゴリズム（`purejaxrl/` ディレクトリ実体を検証）

GitHub API で `purejaxrl/` 配下を列挙して確認:

- `ppo.py` — PPO（discrete）
- `ppo_continuous_action.py` — 連続行動 PPO
- `ppo_rnn.py` — RNN（再帰）方策 PPO
- `ppo_minigrid.py` — MiniGrid 向け PPO
- `dqn.py` — **DQN**（Deep Q-Network）
- `dpo_continuous_action.py` — DPO（Discovered Policy Optimisation）連続版
- ほか `wrappers.py`、空の `experimental/`

→ **PPO（4 変種）+ DQN + DPO** が実装されている。表面的な検索スニペットは「PPO のみ」と誤記しがちだが、ディレクトリ実体が DQN・DPO の存在を裏付ける。

出典: https://api.github.com/repos/luchris429/purejaxrl/contents/purejaxrl

## 「4000x 高速化」の主張 — 検証と正確な条件

**ブログ題名（検証済み）**: "Achieving 4000x Speedups and Meta-Evolving Discoveries with PureJaxRL"（出典: https://chrislu.page/blog/meta-disco/ ）。公開は 2023-04-06（ローンチツイートから推定。ブログページ自体に印字日付なし → **日付は推定・要フラグ**。出典: https://x.com/_chris_lu_/status/1643992216413831171 ）。

**見出し主張（正確な引用）**: 「並列化された RL エージェントを GPU 上のみで 4000x 超高速に訓練する」。

**構成要素の数値と正確な条件**（すべて https://chrislu.page/blog/meta-disco/ より）:

1. **end-to-end JIT 単体**: 「追加の並列環境なしで 10x 超高速」 — すなわち同一ハイパラ・同一環境数での JAX PPO vs **CleanRL の PyTorch PPO** 比較。
2. **環境高速化（gymnax on A100）**: 「numpy で CartPole-v1 を 10 環境並列で回すと 100 万フレーム到達に 46 秒。A100 上の gymnax で 2k 環境並列なら 0.05 秒。これは 1000x 高速化」。
3. **MinAtar-Breakout**: 「CPU で 100 万フレーム到達に 50 秒、gymnax では 0.2 秒」（~250x）。
4. **ベクトル化並列エージェント**: 「CartPole-v1 では、CleanRL の単一エージェント訓練の約半分の時間で 2048 エージェントを訓練できる」。

**「4000x」の解釈（重要な注意）**: ~4000x は**合成的/スループット指標**である。end-to-end JIT 高速化（~10x）に、大規模な環境ベクトル化（GPU 1 枚で数千エージェント/シードを並列訓練）を掛け合わせたものであり、**単一エージェントの wall-clock 高速化ではない**。最もクリーンな単一エージェント値は **~10x**（vs CleanRL PyTorch）。~1000x や ~4000x は **A100**（環境ベンチ）/ **A40**（メタ進化）上で数千の並列環境/エージェントを回す前提に依存する。ブログには「4000x」と単一実験として明示された箇所はなく、これらの積み上げの集計値である。**→ 条件を要フラグ**。

## アーキテクチャ — どう動くか

- **end-to-end JAX（引用）**: 「過去の RL 実装と違い、我々のものは end-to-end で JAX で書かれている」。環境・rollout・learner がすべて GPU 上で動き、CPU 環境ステップもステップごとのホスト↔デバイスコピーもない。
- **ベクトル化環境**: 「JAX で環境をベクトル化し GPU で動かす」 — `vmap` で「即座にベクトル化版を生成」。
- **end-to-end jit**: 訓練ループ全体が 1 つのコンパイル済み XLA プログラム。
- **ベクトル化エージェント訓練**: 「RL 訓練ループ全体をベクトル化」し、`vmap` で数千の独立エージェント/シードを一度に訓練。
- **マルチ GPU**: 「JAX の `pmap` で複数 GPU 上で動かす」。
- **設計思想**: CleanRL 流の単一ファイル実装（モジュラーな import 可能ライブラリではない）。`walkthrough.ipynb`、`brax_minatar.ipynb` 等の例を同梱。

出典: https://chrislu.page/blog/meta-disco/ , https://github.com/luchris429/purejaxrl

## メタ進化 / メタ学習能力

- **能力（引用）**: PureJaxRL のスループットは「進化を用いた Meta-RL による新発見」を駆動する。具体的には「CartPole-v1 上で PPO エージェントの value loss 関数をメタ学習する … これをニューラルネットでパラメータ化して進化させられる」。
- **スケール（引用）**: 「単一 Nvidia A40 上で 512 エージェントを 1024 世代訓練し、1000 億フレーム超を処理する」。
- **仕組み**: GPU 1 枚あたり数千エージェントを並列訓練できるため、外側の進化ループ（evosax エコシステム経由の進化戦略等）が個体群全体を安価に評価でき、RL の目的関数/損失関数をメタ学習できる。

出典: https://chrislu.page/blog/meta-disco/

**研究基盤**: これは **"Discovered Policy Optimisation" (DPO), Lu, Kuba, Letcher, Metz, Schroeder de Witt, Foerster, NeurIPS 2022** に基づく。DPO は Mirror Learning（PPO を含む族）の drift 関数をメタ学習し PPO を上回る。リポジトリの `dpo_continuous_action.py` はその JAX 実装。

出典: https://arxiv.org/abs/2210.05639 , https://proceedings.neurips.cc/paper_files/paper/2022/hash/688c7a82e31653e7c256c6c29fd3b438-Abstract-Conference.html , https://github.com/luchris429/discovered-policy-optimisation

## 検証フラグ

- **Star 数**: ~1,085 は GitHub API ライブ取得で権威的。ただし検索キャッシュ値（955 / 「1.1k」）は不一致。概算・変動扱い。
- **「4000x」**: ブログ見出し主張として実在するが、合成的スループット指標（A100/A40 上で JIT×大規模並列を積み上げ）であり単一実験ではない。クリーンな単一エージェント値は ~10x。**条件を明示すること**。
- **ブログ公開日**: ページに印字日付なし。2023-04-06 はローンチツイートから推定。**推定値**。
- **アルゴリズム一覧**: リポジトリ実体から検証済み（DQN・DPO を含む、PPO のみではない）。✅

## 出典

- https://github.com/luchris429/purejaxrl
- https://api.github.com/repos/luchris429/purejaxrl
- https://chrislu.page/blog/meta-disco/
- https://x.com/_chris_lu_/status/1643992216413831171
- https://arxiv.org/abs/2210.05639 (DPO, NeurIPS 2022)
- https://github.com/luchris429/discovered-policy-optimisation
