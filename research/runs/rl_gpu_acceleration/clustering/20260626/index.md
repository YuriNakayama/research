# 強化学習の GPU 高速化技術 — ドメインクラスタリング

- **ドメイン**: `rl_gpu_acceleration`
- **生成日**: 2026-06-26
- **入力**: ユーザー指定スコープ「強化学習のための JAX などの GPU での実行高速化技術」
- **目的**: RL の学習・推論を GPU/TPU 上で桁違いに高速化する技術を体系化し、フレームワーク網羅・技術原理・実装/選定指針の 3 軸でマッピングする。

## 背景と問題設定

強化学習（RL）の最大のボトルネックは、計算量（ニューラルネットの FLOPs）ではなく **環境シミュレーションのスループットと CPU↔GPU 転送オーバーヘッド**にある。古典的な「環境は CPU、ポリシーは GPU」構成では、毎ステップの host-device 往復とバッチ蓄積に時間の大半を費やし、GPU 稼働率が 5〜20% に留まる（GA3C は推論待ち 108ms 中 GPU 推論はわずか 10%）。

この問題を解く現代的アプローチは 3 系統に大別される。

1. **環境そのものを GPU/TPU 上で実装**（JAX / Brax / Isaac Lab / Madrona）— ロールアウト〜学習を全てデバイス上に閉じ、host 転送を原理的に排除。100〜1000x の高速化。
2. **ネイティブコードで環境を高速化**（PufferLib の C 環境 / EnvPool の C++ / Rust sim）— CPU 上で 1M+ steps/s を出して GPU トレーナへ供給。
3. **トレーナ側の起動オーバーヘッドを削減**（torch.compile / CUDA graphs / XLA fusion / 混合精度）— launch-bound な RL の弱点を直接叩く。

本ドメインはこれらを横断的に整理する。

## クラスタ一覧

各クラスタは **clustering（本マップ）→ gather（リソース一覧）→ retrieval（詳細レポート）** の3フェーズで構成される。

| # | クラスタ | 焦点 | 優先度 | gather（リソース一覧） | retrieval（概念サーベイ） | retrieval（論文別 deep-dive） |
|---|---------|------|--------|----------------------|--------------------------|------------------------------|
| 01 | [高速化の技術原理](cluster-01-principles.md) | なぜ GPU で RL が速くなるのか（メカニズム） | highest | `gather/20260626_principles/` (論文13+特許5) | `retrieval/20260626_principles/` | `retrieval/20260626_principles_papers/` (7本) |
| 02 | [JAX エコシステム](cluster-02-jax-ecosystem.md) | end-to-end GPU/TPU RL（PureJaxRL/Brax/JaxMARL ほか） | highest | `gather/20260626_jax_ecosystem/` (論文10+特許5) | `retrieval/20260626_all/` (01–08) | `retrieval/20260626_jax_ecosystem_papers/` (8本) |
| 03 | [PyTorch / ネイティブコード系](cluster-03-pytorch-native.md) | PufferLib/EnvPool/Isaac Lab/Madrona ほか | high | `gather/20260626_pytorch_native/` (論文9+特許5) | `retrieval/20260626_pytorch_native/` | `retrieval/20260626_pytorch_native_papers/` (8本) |
| 04 | [実装・選定実践ガイド](cluster-04-selection-guide.md) | PyTorch vs JAX 判断・ハードウェア別推奨・移行コスト | high | `gather/20260626_selection_guide/` (論文12+特許3) | `retrieval/20260626_all/09-*` | `retrieval/20260626_selection_guide_papers/` (8本) |

> **gather 合計**: 論文44本 + 特許18件（全件 WebFetch で URL・タイトル検証済み）。**論文別 deep-dive 合計**: 31本（各クラスタの主要一次資料を逐語引用付きで分析）。

## クラスタ相関図

```
                  ┌──────────────────────────────────────┐
                  │  01 技術原理（なぜ速いのか）           │
                  │  host転送排除 / ベクトル化 / JIT融合   │
                  │  Anakin vs Sebulba / スループットの算数 │
                  └───────────────┬──────────────────────┘
                       原理を実装した二大系統
              ┌───────────────────┴───────────────────┐
              ▼                                         ▼
  ┌───────────────────────┐               ┌───────────────────────────┐
  │ 02 JAX エコシステム     │               │ 03 PyTorch/ネイティブ系     │
  │ env を JAX で書く        │               │ env を C/C++/Rust で高速化  │
  │ everything on device     │               │ or 物理を GPU 常駐化         │
  └───────────┬───────────┘               └─────────────┬─────────────┘
              └──────────────────┬──────────────────────┘
                                 ▼
                  ┌──────────────────────────────────────┐
                  │  04 実装・選定ガイド                   │
                  │  どちらを・どのハードで・どう選ぶか      │
                  └──────────────────────────────────────┘
```

## 推奨読み順

1. **cluster-01（技術原理）** — まず「なぜ速いのか」と「FPS ≠ 収束までの実時間」を理解する。これが全ての判断の土台。
2. **cluster-04（選定ガイド）** — 自分の状況（env が JAX 化可能か / ハードウェア）で大方針を決める。
3. **cluster-02 または 03** — 選んだ系統の具体ツールを深掘り。

## 主要な検証上の注意（詳細は各 retrieval run 末尾）

- 「4000x」「12,500x」「1000x」等の大きな倍率は、ほぼ常に **1 GPU vs 少数 CPU コア** または **並列度の違い**の比較であり、ベースライン条件に決定的に依存する。単一ポリシーの収束高速化（≈10x）とは別物。
- 二次まとめの誤伝（例: Podracer Anakin を「5M steps/s」と記載）に注意。一次資料では **555M steps/s**。
- GitHub star 数・最新リリースは 2026-06-26 時点のライブ値（変動する）。
