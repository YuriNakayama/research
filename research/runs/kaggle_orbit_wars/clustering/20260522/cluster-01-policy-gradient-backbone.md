# Cluster 1: PPO / IMPALA 系 ポリシー勾配バックボーン

## 概要

Orbit Wars のような Kaggle Simulation 系コンペで**最も実績がある王道路線**。Frog Parade (Lux S3 銀)、Toad Brigade (Lux S1 1位)、DeNA HandyRL (Hungry Geese 1位) など歴代上位の主軸を担ってきた。PPO の安定性と IMPALA の throughput を、補助損失 (entropy / teacher-KL / 補助予測 head) と GAE-Lambda (γ=0.999–1.0) で味付けする。連続行動でも離散化 + masking で動かす方が学習が安定するという経験則あり。Model-based より組み込みコストが圧倒的に低く、**1 GPU + 1 週間で baseline が立つ**実用性が最大の強み。

## キーワード

`PPO`, `IMPALA`, `V-trace`, `UPGO`, `GAE-Lambda`, `policy gradient`, `entropy regularization`, `teacher KL`, `action masking`, `dual head (actor/critic)`, `BPTT`, `RNN/LSTM`

## 主要論文・実装 (代表リソース)

| Title | Type | Year | Summary |
|-------|------|------|---------|
| [Proximal Policy Optimization Algorithms](https://arxiv.org/abs/1707.06347) | Paper | 2017 | Schulman et al., OpenAI。clipped surrogate objective。すべての出発点 |
| [IMPALA: Scalable Distributed Deep-RL with Importance Weighted Actor-Learner](https://arxiv.org/abs/1802.01561) | Paper | 2018 | Espeholt et al., DeepMind。V-trace で 250k FPS、Toad Brigade / Flat Neurons の主軸 |
| [The Surprising Effectiveness of PPO in Cooperative, Multi-Agent Games](https://arxiv.org/abs/2103.01955) | Paper | 2021 | Yu et al. (MAPPO)。joint critic で SMAC SOTA、QMIX より単純で強い |
| [HandyRL (DeNA)](https://github.com/DeNA/HandyRL) | OSS | 2020– | IMPALA 風 learner-worker。V-trace/UPGO 切替、Hungry Geese 1 位の基盤 |
| [Frog Parade / Lux S3 writeup](https://github.com/IsaiahPressman/kaggle-lux-2024) | Writeup | 2025 | vanilla PPO + 8-block 3x3 CNN(256ch, 10M params) + entropy + teacher-KL + GAE(γ=0.9999) + per-unit log-prob sum |
| [Toad Brigade / Lux S1 writeup](https://github.com/IsaiahPressman/Kaggle_Lux_AI_2021) | Writeup | 2021 | FAIR IMPALA + UPGO + TD-λ + frozen teacher KL で **戦略循環** 抑止。24-block ResNet, 20M params, 8→16→24 curriculum |
| [CleanRL: High-quality single-file RL implementations](https://docs.cleanrl.dev/) | OSS | 2024 active | PPO/DQN/SAC を 1 ファイルで完結。Orbit Wars baseline の最短ルート |
| [Sample-Factory 2.0 (APPO)](https://github.com/alex-petrenko/sample-factory) | OSS | 2024 | 単 GPU + 16 CPU で 100k–130k FPS、self-play/multi-policy 学習 |

## Orbit Wars 適用時の調査戦略

1. **まず CleanRL の `ppo_atari.py` を Orbit Wars env に移植**し、reward 信号が下流に流れることを最小コードで確認 (1–2 日)
2. **Frog Parade の write-up** を起点に CNN 構造を再現 (`8-block 3x3, hidden=256, value head は per-cell→mean`)。Rust/JAX 化は後回しで Python 環境で 1k–10k step/s を狙う
3. **補助損失** を 1 つずつ追加: entropy → teacher-KL → 補助 head 予測 (敵存在確率 / hidden rule 推定)。各追加で勝率 evaluation
4. **GAE λ と γ を高め** (γ=0.999–1.0, λ=0.95) に設定。Orbit Wars の win/loss reward 遅延性に対応
5. **連続行動 (推力) は離散化** (例: 16 方向 + 5 強度 = 80 actions + noop) してから policy gradient を回す。連続のままだと sample efficiency が大きく劣化する事例多数
6. **PFSP self-play** (cluster-03) と **JAX/Rust 高速 sim** (cluster-05) で 100x 効率化を別軸で達成

## 注目研究グループ / 個人

- **Isaiah Pressman**: Toad Brigade (Lux S1) / Frog Parade (Lux S3) 個人参加でメダル獲得の連続事例。Kaggle Simulation の参考最有力
- **DeepMind**: PPO / IMPALA / V-trace 本家、AlphaStar 系も全て同系列
- **DeNA HandyRL**: 国内発、Hungry Geese 1 位、OSS で再現可能
- **Joseph Suarez (MIT)**: PufferLib 開発、PPO+LSTM の throughput 最適化に特化
- **Yu et al. (UCB MAPPO)**: 多 agent PPO ベース、SMAC/Hanabi SOTA

## 推奨読み順 (新規参入時)

1. Frog Parade write-up (実装の現実例)
2. PPO 原論文 (理論)
3. IMPALA + V-trace 原論文 (分散化)
4. CleanRL `ppo_atari.py` のコード読解 (最小実装)
5. MAPPO / HandyRL (multi-agent への拡張)
6. Toad Brigade write-up (戦略循環抑止の curriculum 設計)

## Orbit Wars 向け実装テンプレ案

```python
# 概念コード（疑似）
# env: vectorized Orbit Wars (n_envs=64, JAX/Rust)
# obs = {spatial: (B, T_hist*C_spatial, H, W), global: (B, T_hist*C_global)}
# action: per-ship discrete (n_ships, 10) + sap target (n_ships, H, W)
# reward: zero-sum win/loss (+1/-1) at episode end

loss = -clipped_surrogate(adv, log_pi, log_pi_old)         # PPO main
     + 0.5 * value_loss(v_pred, v_target_gae)              # value
     - ENT_COEF * entropy(pi)                              # exploration
     + KL_COEF * kl(pi_teacher, pi)                        # 戦略循環抑止
     + AUX_COEF * bce(enemy_presence_pred, enemy_mask)     # 補助予測
```
