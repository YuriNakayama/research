# JAX による RL の GPU アクセラレーション — 詳細レポート

## パラメータ

- **ドメイン**: `rl_gpu_acceleration`
- **対象クラスタ**: `all`（ドメイン全体の横断サーベイ）
- **生成日**: 2026-06-26
- **リソース種別**: GitHub リポジトリ / arXiv 論文 / 公式ドキュメント / 技術ブログ
- **入力ソース**: ユーザー指定の調査スコープ（JAX エコシステムによる RL アクセラレーション）
- **手法**: WebSearch / WebFetch による複数ソース突き合わせ。定量主張はすべて出典 URL を明記。検証できなかった主張は明示的にフラグ。

## レポート一覧

| # | テーマ | レポート |
|---|--------|----------|
| 01 | JAX コアプリミティブと「everything on accelerator」パラダイム | [詳細](01-jax-core-primitives.md) |
| 02 | PureJaxRL（Chris Lu / Oxford FLAIR） | [詳細](02-purejaxrl.md) |
| 03 | Brax / MJX（Google DeepMind）— GPU/TPU 物理シミュレーション | [詳細](03-brax-mjx.md) |
| 04 | gymnax（Robert Lange）— JAX ネイティブ古典環境 | [詳細](04-gymnax.md) |
| 05 | JaxMARL（Oxford FLAIR, NeurIPS 2024）— マルチエージェント | [詳細](05-jaxmarl.md) |
| 06 | その他の JAX RL ライブラリ・環境（Stoix / rejax / Mava / Jumanji / evosax / Craftax / XLand-MiniGrid / Kinetix ほか） | [詳細](06-other-jax-rl-libraries.md) |
| 07 | Podracer アーキテクチャ（Anakin / Sebulba, DeepMind） | [詳細](07-podracer-anakin-sebulba.md) |
| 08 | JAX RL の限界とトレードオフ | [詳細](08-limitations.md) |
| 09 | **実装・選定実践ガイド**（PyTorch vs JAX 判断基準・シナリオ別/ハードウェア別推奨・移行コスト・最適化チェックリスト・落とし穴・学習リソース） | [詳細](09-implementation-selection-guide.md) |

## サマリ：ライブラリ一覧表（2026-06-26 時点）

GitHub star 数は変動するため概算。最新リリース/状態と主要ベンチマークは各詳細レポートに出典 URL を記載。

| ライブラリ | 種別 | GitHub | Star（概算） | 最新リリース/状態 | 一言で言うと |
|-----------|------|--------|-------------|------------------|-------------|
| PureJaxRL | RL 実装集 | luchris429/purejaxrl | ~1,085 | リリースタグ無し。最終 push 2024-09-09 | end-to-end JAX RL のリファレンス実装（PPO/DQN/DPO） |
| Brax | 物理シミュレータ | google/brax | ~3.2k | v0.14.2（2026-03-15） | JAX 製の微分可能剛体物理エンジン |
| MJX (MuJoCo XLA) | 物理シミュレータ | google-deepmind/mujoco（`mjx/`） | MuJoCo 本体に内包 | MuJoCo プロジェクトの一部として活発 | MuJoCo の JAX/XLA 再実装、バッチ並列物理 |
| gymnax | 環境 | RobertTLange/gymnax | ~904 | v0.0.9（2025-05-23） | 古典 RL 環境の JAX ネイティブ実装 |
| JaxMARL | マルチエージェント | FLAIROx/JaxMARL | ~823 | v0.1.0（2025-06-01）, NeurIPS 2024 | JAX 製マルチエージェント RL 環境+アルゴリズム |
| Stoix | RL 実装集 | EdanToledo/Stoix | ~412 | タグ無し（Zenodo DOI）, 活発 | 単一エージェント RL、Anakin/Sebulba 実装 |
| rejax | RL 実装集 | keraJLi/rejax | ~269 | v0.1.3（2026-06-10） | 軽量・完全 jittable な RL アルゴリズム群 |
| Mava | マルチエージェント | instadeepai/Mava | ~916 | 活発（develop） | JAX 製 MARL、Anakin と Sebulba 両対応 |
| Jumanji | 環境 | instadeepai/jumanji | ~843 | v1.1.1（2025-06-18） | 組合せ最適化・産業問題向け JAX 環境（22 種） |
| evosax | 進化戦略 | RobertTLange/evosax | ~769 | v0.2.0（2025-03-11） | JAX 製進化戦略（CMA-ES, OpenES ほか 30+） |
| Craftax | 環境 | MichaelTMatthews/Craftax | ~417 | v1.6.1（2026-06-20）, ICML 2024 Spotlight | Crafter+NetHack の JAX 再実装、オープンエンド |
| XLand-MiniGrid | 環境 | corl-team/xland-minigrid | ~342 | v0.9.2（2025-12-16）, NeurIPS 2024 | メタ RL/in-context RL グリッドワールド |
| Kinetix | 環境 | FLAIROx/Kinetix | ~259 | v3.0.0（2026-05-21）, ICLR 2025 Oral | 2D 剛体物理のオープンエンド RL |

## 主要ベンチマーク数値（出典付き・要点）

| 主張 | 数値 | 条件・出典 |
|------|------|-----------|
| PureJaxRL 高速化 | 「4000x 超」（合成的スループット指標） | end-to-end JIT 単体は ~10x（vs CleanRL PyTorch）。残りは数千環境/エージェントの並列化（A100/A40）。出典: chrislu.page/blog/meta-disco |
| JaxMARL 高速化 | 単一実行 ~14x / 並列化時 最大 ~12,500x | A100。12,500x は複数実行をベクトル化した場合のみ。出典: arxiv.org/abs/2311.10090 |
| Brax 高速化 | 100–1000x（速度/コスト改善） | TPU v3。著者自身が「厳密に apples-to-apples ではない」と注記。出典: arxiv.org/abs/2106.13281 |
| MJX スループット | バッチ humanoid で TPU v5 2.7M / A100 950K steps/s | 単一シーンでは CPU MuJoCo より ~10x 遅い。出典: mujoco.readthedocs.io/en/stable/mjx.html |
| gymnax 高速化 | CartPole-v1 100万遷移を A100・2000 並列で 0.05秒（~1000x） | NumPy 10 並列 46秒との比較（並列数が異なる点に注意）。出典: github.com/RobertTLange/gymnax |
| Podracer Anakin | grid-world で 8-core TPU 555M steps/s | 小規模 NN+grid-world 時。出典: arxiv.org/abs/2104.06272 |
| Podracer Sebulba | Atari 200M frames を 8-core TPU で ~1時間（~$2.88）/ 2048-core で 43M fps | 出典: arxiv.org/abs/2104.06272 |
| Craftax 高速化 | Craftax-Classic 257x / フル Craftax 169x（vs オリジナル Crafter） | PureJaxRL PPO 利用時。10億インタラクションを GPU 1枚・1時間未満。出典: arxiv.org/abs/2402.16801 |

## 検証フラグ（要約）

- **「1〜2 週間で習熟」**: 権威ある一次ソースを特定できず。**未検証**として扱う（学習曲線は定性的記述のみ）。
- **PureJaxRL「4000x」**: ブログの見出し主張としては実在するが、単一実験ではなく合成的スループット指標。クリーンな単一エージェント値は ~10x。
- **JaxMARL「12,500x」**: 複数実行をベクトル化した場合に限る条件付き。単一実行は ~14x。
- **Star 数全般**: 変動するため概算。
- 詳細な検証フラグは各レポート末尾に記載。
