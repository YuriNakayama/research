# Cluster 5: 訓練インフラ・高速化 (JAX / Rust / PufferLib)

## 概要

**RL の最大ボトルネックは環境シミュレーション**。Frog Parade (Lux S3) は Rust で sim を自作して **110k step/s**、Lux S3 公式環境は JAX 化で **GPU 上 100k–1M FPS**、PufferLib 2.0 (RLC 2025) は C 環境 + PuffeRL で **RTX 4090 単機 1M–4M steps/s** を達成。これらは「CPU 並列 envs → GPU で policy 学習」という古典構成の **1000–10000 倍**速。Orbit Wars でも sim を高速化できるかが 1 GPU で勝てるかどうかの分水嶺になる。学習フレームワーク (CleanRL/SB3/RLlib) と環境並列化 (envpool/gymnax/EnvPool/Sample-Factory) の組合せ選定が決定的に重要。Submission 100MB 制約には INT8 量子化 + TorchScript export + distillation の組合せで対応。

## キーワード

`JAX`, `jit`, `vmap`, `pmap`, `PureJaxRL`, `JaxMARL`, `gymnax`, `Podracer`, `Sebulba`, `PufferLib`, `PuffeRL`, `envpool`, `Sample-Factory`, `vectorized env`, `Rust sim`, `C sim`, `TorchScript`, `INT8 quantization`, `model distillation`

## 主要 OSS / 論文 (代表リソース)

| Name | Type | Year | Summary |
|------|------|------|---------|
| [PureJaxRL](https://github.com/luchris429/purejaxrl) | OSS (~1.5k stars) | 2023– active | end-to-end JAX で **4000x speedup**, meta-evolution 可能 ([Chris Lu blog](https://chrislu.page/blog/meta-disco/)) |
| [JaxMARL (NeurIPS 2024)](https://github.com/FLAIROx/JaxMARL) | OSS / Paper | 2024 | Oxford/FAIR FLAIR。SMAX/MPE で **12,500x** 高速化 ([arXiv 2311.10090](https://arxiv.org/abs/2311.10090)) |
| [gymnax](https://github.com/RobertTLange/gymnax) | OSS (~700 stars) | 2024 active | CartPole/MinAtar 等を JAX 化、A100 で 1k env 0.05s/step |
| [PufferLib 2.0 (RLC 2025)](https://github.com/PufferAI/PufferLib) | OSS / Paper | 2025 (v2.0) | C 環境 + PuffeRL で **1M–4M steps/s** on RTX 4090 ([paper](https://arxiv.org/abs/2406.12905)) |
| [envpool (sail-sg)](https://github.com/sail-sg/envpool) | OSS | 2024 | C++ ベース、Atari 1M FPS / Mujoco 3M FPS、subprocess 比 20x |
| [Sample-Factory 2.0 (APPO)](https://github.com/alex-petrenko/sample-factory) | OSS (~1k stars) | 2024 | 単 GPU + 16 CPU で 100k–130k FPS |
| [Podracer (Anakin/Sebulba)](https://arxiv.org/abs/2104.06272) | Paper | 2021 | DeepMind。TPU Pod 向け JAX 分散 RL、IMPALA→Sebulba mapping |
| [MAVA (InstaDeep)](https://github.com/instadeepai/Mava) | OSS (~800 stars) | 2025 active | JAX 純化 MARL、TPU 対応、Sebulba mapping |
| [Lux-Design-S3 (NeurIPS 2024)](https://github.com/Lux-AI-Challenge/Lux-Design-S3) | OSS | 2024 | JAX で 100k–1M FPS。Orbit Wars sim 自作の最良参考 |
| [Frog Parade Rust sim](https://github.com/IsaiahPressman/kaggle-lux-2024) | OSS | 2025 | Rust + Maturin で 110k step/s、Python から PyO3 binding |
| [TorchScript export](https://pytorch.org/docs/stable/jit.html) | Tool | – | submission 依存無し化、CleanRL の単一ファイル設計と相性◎ |
| [PyTorch dynamic quantization](https://pytorch.org/tutorials/recipes/recipes/dynamic_quantization.html) | Tool | – | FP32 → INT8、4x モデル縮小 |
| [Brax / MJX (Google)](https://github.com/google/brax) | OSS (~2.5k stars) | 2025 (v0.14.x) | TPU/GPU で物理 sim millions FPS、PPO/SAC backend |

## Orbit Wars 適用時の調査戦略

1. **環境の高速化が最優先課題**: 既存 kaggle-environments の Python sim では throughput が桁違いに不足。以下のいずれかを早期に決断
   - **Plan A**: kaggle-environments を最小に保ち、PufferLib 統合 (難易度低)
   - **Plan B**: Rust で sim 再実装 + PyO3 binding (Frog Parade 流、難易度中)
   - **Plan C**: JAX で sim 再実装 (lux-s3 流、難易度高、上限最高)
2. **PufferLib 2.0 をデフォルト推奨**: 1 RTX 4090 で 1M+ steps/s、CleanRL 互換 API、self-play 例あり。Plan A → Plan B の架け橋として最強
3. **JAX 路線採用時**: PureJaxRL + JaxMARL を学習層に、gymnax の wrapper API で Orbit Wars env を整える。Sebulba mapping で TPU/GPU pod 対応も視野
4. **submission 整形**:
   - **TorchScript export** (`torch.jit.script`) で依存無し化
   - **INT8 dynamic quantization** で 4x 縮小
   - **distillation**: 大型 teacher (50–200M params) → 軽量 student (5–10M params)
   - これらの組合せで 200M params → 30MB 程度まで圧縮可
5. **W&B 等の experiment tracking** を早期導入 (Frog Parade も Wandb)。league 学習で agent 数が増えると不可欠

## 注目研究グループ / 個人

- **Joseph Suarez (MIT)**: PufferLib / Neural MMO、throughput 最適化の権威
- **Oxford FLAIR (Foerster lab)**: PureJaxRL / JaxMARL、JAX RL の中心
- **Chris Lu**: PureJaxRL 著者、blog [meta-disco](https://chrislu.page/blog/meta-disco/) は必読
- **DeepMind (Hessel et al.)**: Podracer / Sebulba、JAX TPU 最適化
- **InstaDeep**: MAVA、産業界 MARL の代表
- **Stone Tao (UC San Diego)**: Lux AI Challenge organizer、JAX 化の中心
- **sail-sg (Sea AI Lab)**: envpool、C++ 並列化

## 推奨読み順

1. PufferLib 2.0 paper (1M FPS の世界を体感)
2. Chris Lu blog "Meta-Disco" (PureJaxRL の thought process)
3. JaxMARL paper (NeurIPS 2024)
4. Sample-Factory 2.0 readme (PyTorch 経路のベスト)
5. Frog Parade write-up (Rust sim の現実例)
6. Lux-Design-S3 JAX 実装 (JAX sim の現実例)
7. Podracer paper (Sebulba mapping)

## 環境フレームワーク選択フローチャート

```
JAX を書ける/書きたい?
├─ Yes
│   ├─ Orbit Wars sim を JAX 化できる? (公式が JAX 提供 or 自作可能)
│   │   ├─ Yes → PureJaxRL + JaxMARL + gymnax wrapper (最上限)
│   │   └─ No → Brax/MJX で物理擬似 + JAX RL learner
│   │
│   └─ → MAVA (InstaDeep) で MARL + JAX
│
└─ No (PyTorch 派)
    ├─ Throughput 最優先?
    │   ├─ Yes → PufferLib 2.0 (C 環境 + PuffeRL) ★最推奨
    │   ├─ self-play league 公式サポート欲しい → RLlib (Ray)
    │   └─ 単 GPU + コード短く → CleanRL + envpool
    │
    └─ → Sample-Factory 2.0 (APPO 単 GPU + マルチ CPU)
```

## 訓練効率化チェックリスト

- [ ] Sim throughput を計測 (目標: 100k step/s 以上)
- [ ] vectorized env (envpool / gymnax / PufferLib) を使っているか
- [ ] PyTorch なら `torch.compile` で 1.5–2x
- [ ] Mixed precision (fp16/bf16) で 2x speedup, GPU memory 半減
- [ ] gradient accumulation で large batch を実現
- [ ] W&B で実験管理、最適 hyperparam を探索
- [ ] submission 1 週間前から **TorchScript + INT8** で容量試験

## Orbit Wars 向け推奨スタック (Top 3)

### 1位: **PufferLib 2.0 + 自作 C sim + PuffeRL (PPO + LSTM)**
RTX 4090 1 枚で 1M–4M steps/s。Orbit Wars の連続 2D 空間を 200–500 行の C コードで書けば、self-play で 1 日に「数百年」相当を回せる。Lux S3 の JAX 化と同じ思想を、より少ない学習コストで実現。submission は単一 PyTorch policy として軽量 export 可能。

### 2位: **PureJaxRL + JaxMARL + Orbit Wars JAX 化 (lux-s3 流)**
4000x speedup の実績、JaxMARL の self-play 部品も流用可能。学習コストは PufferLib より高い (JAX/jit 知識必須) が、学術的に最先端で、A100 1 枚あれば NeurIPS 上位レベルのスループット。

### 3位: **CleanRL (PPO + envpool) + PettingZoo self-play**
単一ファイルで全コードを把握でき、改造・debug が最速。envpool で C++ レベル並列化、PettingZoo wrapper で self-play league を手書きしやすい。Submission 整形 (TorchScript + INT8) も楽。

## 注意事項

- **JAX 学習コストは高い**: vmap/jit/scan の挙動把握に 1-2 週間。短期コンペでは PyTorch 路線が現実的
- **PufferLib の C 環境は debug が厳しい**: Rust で書くか、最初は Python sim でロジック検証してから C 移植
- **submission 100MB**: 想像以上に厳しい。10M params 級の CNN (Frog Parade) が安全圏、Transformer + LSTM の 200M params (Flat Neurons) は積極的な distillation/量子化が必須
- **Kaggle 推論時間 (~100ms/step)**: MCTS 系 (cluster-02) はここで詰まる可能性。PPO + 単一 forward pass は安全
