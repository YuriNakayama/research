# selection_guide クラスタ — 一次資料 deep-dive（2026-06-26）

本ディレクトリは、ドメイン `rl_gpu_acceleration` の **selection_guide クラスタ**（実装・選定・方法論）に属する 8 本の VERIFIED primary source について、リソース単位の詳細レポートをまとめたもの。

実践ガイド `retrieval/20260626_all/09-implementation-selection-guide.md`（意思決定指向の横断ガイド）を **一次資料の精読で裏打ちする補完文書**。09 が「どのスタックを選ぶか・どこから最適化するか」を断定的に示すのに対し、本クラスタは **その根拠となる論文・ブログを 1 本ずつ深掘り** し、actionable な推奨（どの実装詳細が効くか／ライブラリの選び方／スケーリング則）を原文の引用つきで抽出する。

このクラスタは methodological（方法論）であり、扱う 8 本は大きく次の 3 系統に分かれる：

- **実装の正しさ・透明性**（01 CleanRL / 02 What Matters / 03 37 details / 04 Deep RL that Matters）— GPU 高速化以前に「正しく動く・正しく測る」ための前提。
- **ライブラリ/エンジンの選定**（05 RLlib / 06 Nine Physics Engines）— 分散戦略の抽象化と、物理エンジン（=GPU on-device 可否）の地図。
- **スケーリング則**（07 Scales Predictably / 08 Compute-Optimal Scaling）— off-policy RL で GPU バジェットを UTD・モデルサイズへどう配分するか。

## レポート一覧

| # | ファイル | タイトル | 種別 | 一言 |
|---|---|---|---|---|
| 01 | `01-cleanrl.md` | CleanRL: 単一ファイル実装 | ライブラリ論文（JMLR 2022） | PyTorch single-file。PPO 全詳細が ~330 行。学習・最適化の baseline |
| 02 | `02-what-matters-on-policy-rl.md` | オンポリシー RL で何が効くか | 大規模実証研究（Google, 2020） | 25 万体の ablation。PPO の具体的デフォルト値（tanh/分離/λ=0.9/lr=3e-4 等） |
| 03 | `03-37-ppo-implementation-details.md` | PPO の 37 実装詳細 | ICLR 2022 Blog Track | 13 コア+9 Atari+9 連続+5 LSTM+1 MultiDiscrete のチェックリスト |
| 04 | `04-deep-rl-that-matters.md` | 深層 RL の再現性問題 | AAAI 2018 | シード分散・コードベース差で結果が激変。多シード+有意検定を要求 |
| 05 | `05-rllib.md` | RLlib: 分散 RL の抽象化 | ICML 2018（Berkeley） | policy optimizer 抽象で分散戦略を差し替え。ES 8192 コアで 3.7 分 |
| 06 | `06-nine-physics-engines.md` | 9 物理エンジンのレビュー | arXiv 2024 | MuJoCo 首位。GPU は Brax（JAX）/ IsaacGym（PyTorch）が本命 |
| 07 | `07-value-based-rl-scales-predictably.md` | 価値ベース RL は予測可能にスケール | ICML 2025 | UTD 比 σ が data-compute Pareto を制御。小規模から大規模を予測 |
| 08 | `08-compute-optimal-scaling-value-rl.md` | 価値ベース RL の compute 最適化 | arXiv 2025 | TD-overfitting。モデルサイズ N と UTD σ を joint scaling せよ |

---

## 選定チェックリスト（8 本の actionable な知見の統合）

意思決定指向の統合リスト。上から順に確認する。**「正しく動かす → 正しく測る → 正しく選ぶ → 正しくスケールする」** の流れ。

### A. 実装の正しさを固める（速くする前に）
1. **PPO を組むなら 37 ディテールを全て満たす**（03）。特に: vectorized env / orthogonal init / Adam eps=1e-5 / GAE / advantage 正規化（ミニバッチ単位）/ value loss clip / global grad clip ≤0.5 / debug 変数。Atari なら前処理 9 項目、連続なら observation 正規化 9 項目を追加。→ チェックは CleanRL の `ppo*.py`（~330 行, 01）と照合。
2. **オンポリシー連続制御のデフォルト値**（02）: 活性化 **tanh**・隠れ **2 層**・**policy/value 分離**・**最終ポリシー層を 100 倍小さく初期化**・初期 action std **0.5**・**入力正規化必須**・value 正規化・**GAE λ=0.9**・**γ=0.99**（環境ごとに調整）・**Adam lr=3e-4, β₁=0.9**・PPO clip **0.25**。Huber/value-clip・エントロピー正則化は基本不要。
3. **off-policy（SAC/TD3/BRO）でスケールするなら別系統の則を使う**（07/08）。02 のオンポリシーデフォルトを流用しない。

### B. 正しく測る（比較を信じる前に）
4. **多シードで評価し有意検定する**（04）。少数シードの平均は「シードガチャ」になりうる（同一設定で 2 群 5 シードが有意差）。bootstrap 信頼区間・t-test/KS 検定・power analysis で試行数を決める。N<5 は不可。
5. **フレームワーク間 steps/s・性能比較は「方向性」として読む**（04 + 06）。コードベース差だけで結果が変わる。PufferLib（軽量 C env）と Brax/Isaac（重い物理）の steps/s は直接比較不可。
6. **全ハイパラ・実装詳細・評価法を報告/記録**（04）。CleanRL の W&B トラッキング（01）はこの実践を支える（コード・依存・コマンド・動画まで自動記録）。

### C. ライブラリ・エンジンを選ぶ
7. **学習・教育・PyTorch baseline → CleanRL**（01）。single-file で透明、`Ctrl+C` デバッグ容易。`torch.compile`+cudagraphs 最適化の出発点。
8. **大規模分散・マルチアルゴリズム・任意 env（jit 不能）→ RLlib**（05）。policy optimizer 抽象で分散戦略を差し替え。env=CPU・学習=分散の古典構成を効率化（ES 8192 コアで 3.7 分、Ape-X 256 ワーカーで 160k fps）。
9. **物理エンジン = GPU on-device 可否で選ぶ**（06）:
   - **JAX end-to-end GPU → Brax**（sim+学習を 1 チップ。ただし MARL 不可）。
   - **PyTorch GPU env / ロボティクス sim-to-real → IsaacGym/PhysX**（PyTorch Tensor 直結で CPU ボトルネック回避）。
   - **MuJoCo は忠実度首位だが GPU スケールは MJX/Brax 化が前提**。Unity/Gazebo/Webots/PyBullet/ODE/Chrono は GPU 大規模 RL 非推奨。

### D. 正しくスケールする（GPU バジェットの配分）
10. **off-policy RL のハイパラは「予測」できる**（07）: 小規模ランから冪則 fit → 最適 UTD σ・batch・lr を外挿。lr とバッチは独立（教師ありと違う）。GPU 大量投入前に安いランで配分を決める。
11. **UTD 比 σ が data ↔ compute のレバー**（07）: GPU が余る（learner-bound でない）なら σ を上げてデータ効率を稼ぐ。sim-bound/learner-bound 判定（09 ガイド §5）と連動。
12. **compute を増やすなら モデルサイズ N と UTD σ を一緒に上げる**（08）。片寄せ（σ-only +26% / N-only +11% のデータ増）は非効率。
13. **大モデルほど大バッチが効く（TD-overfitting 回避）**（08）。小モデル + 大バッチは validation TD-error を悪化させる罠。GPU の大バッチ並列を活かすにはモデルも大きく。

### 横断的な意思決定の要点
- **環境が JAX で書ける/既存 JAX 環境（Brax/gymnax/Isaac）が使える + スループット律速 → JAX**。それ以外は **PyTorch**（09 ガイド §1.7 と一致）。06 がそのエンジン選定の地図、07/08 が off-policy GPU スケールの定量根拠を与える。
- **正しさ（A）と測定（B）はフレームワーク非依存の前提**。01-04 はスタック選定の前に必ず満たすべき不変条件。

---

## 検証フラグ・注意

- 07/08 の冪則は **関数形の主張**であり、汎用の単一指数/係数は与えられない（各設定で fit が必要）。連続制御 off-policy に限定。08 は 2025 年最新で独立追試は途上。
- 06 は定性レビュー主体で、統一 steps/s ベンチ表は弱い。速度の絶対比較は他一次情報（EnvPool / MuJoCo Playground）で補完。
- 05 RLlib の論文 API（policy graph 等）は現行 Ray 2.x（RLModule/Learner）と名称が異なる。設計思想は有効だが API は最新ドキュメント参照。
- 04 の教訓により、本クラスタの全定量比較は「方向性」として扱う。

## 主要出典

- CleanRL: https://arxiv.org/abs/2111.08819
- What Matters In On-Policy RL: https://arxiv.org/abs/2006.05990
- 37 Implementation Details of PPO: https://iclr-blog-track.github.io/2022/03/25/ppo-implementation-details/
- Deep RL that Matters: https://arxiv.org/abs/1709.06560
- RLlib: https://arxiv.org/abs/1712.09381
- Nine Physics Engines: https://arxiv.org/abs/2407.08590
- Value-Based Deep RL Scales Predictably: https://arxiv.org/abs/2502.04327
- Compute-Optimal Scaling for Value-Based Deep RL: https://arxiv.org/abs/2508.14881
- 補完: `retrieval/20260626_all/09-implementation-selection-guide.md`
