# 05. Parameterized Action Space — 文献レビュー

## ソース

- Hausknecht & Stone, "Deep RL in Parameterized Action Space" (2015): https://arxiv.org/abs/1511.04143
- Xiong et al., "Parametrized Deep Q-Networks Learning" P-DQN (2018): https://arxiv.org/abs/1810.06394
- HyAR: Addressing Discrete-Continuous Action Reinforcement Learning via Hybrid Action Representation: https://openreview.net/pdf?id=wQkaGq7Vz6q
- Fan et al., "Multi-Agent Deep RL with Discrete-Continuous Hybrid Action Spaces" (2019): https://arxiv.org/abs/1903.04959
- Model-based RL for Parameterized Action Spaces: https://arxiv.org/html/2404.03037v2

## 「組み合わせ + パラメータ」問題の数学的定式化

Orbit Wars の行動は形式的には:

```
A = ⋃_{type ∈ {NOOP, ATTACK}} { (type, params(type)) }

where:
  params(NOOP) = ∅
  params(ATTACK) = (source, target, amount)
                 = ({1,...,N_my}, {1,...,N_all}, {0,1,...,K})
```

これは **parameterized action space** と呼ばれる構造で、Hausknecht & Stone (2015) が RoboCup Soccer で初めて深層 RL で解いた。

## PADDPG (Parameterized Actor-DDPG)

### アクター出力構造

```python
class PADDPGActor(nn.Module):
    def forward(self, state):
        discrete_logits = self.discrete_head(state)        # [K] action types
        continuous_params = self.continuous_head(state)    # [K * P_max] all params
        return discrete_logits, continuous_params
```

- 学習時: critic が **(離散 logits + 全 continuous params)** を入力にして Q-value を出力。actor は critic からの gradient で更新
- 推論時: `argmax(discrete_logits)` で type 選択 → 対応する continuous スロット採用

### Inverted Gradient Bounding（重要トリック）

continuous params が valid range を超えないよう、boundary 近傍で gradient を反転スケール。Sigmoid squash や clipping よりも安定。

### Orbit Wars との相性

× **不向き**:
1. PADDPG は **オンライン RL 想定** で actor-critic、模倣学習には素直に使えない
2. Orbit Wars の continuous param (target_planet_id, amount) のうち target は本質的に離散
3. amount を continuous にすると loss が MSE 的になり multi-modality 失う

→ **概念は知っておく価値あるが、Orbit Wars の主軸にしない**。

## P-DQN (Parametrized Deep Q-Networks)

DQN + DDPG の組合せ:

```
Q(s, a_discrete, a_continuous) を直接学習
  with a_continuous determined by a deterministic function of s
```

具体的には:
1. State + 全 discrete actions に対する continuous params を deterministic に出力する actor
2. (state, discrete, continuous) → Q を出力する critic
3. discrete を ε-greedy で選択

### Orbit Wars との相性

△ **限定的に使える**:
- 模倣学習文脈では Q を expert action から学習する形に変形可能（offline P-DQN）
- ただし AlphaStar Unplugged 系の autoregressive policy のほうが構造的に強い
- amount の連続性を本気で扱いたい場合のオプション

## HyAR: Hybrid Action Representation

action 全体を **連続 latent 空間に embed** し、latent space で policy を学習。inverse mapping で離散 + 連続に decode。

```
action a = (discrete_d, continuous_c)
  ↓ encode
latent z ∈ R^d (連続)
  policy π(z|s)
  ↓ decode
(d', c') = decoder(z)
```

### メリット
- 連続的な policy gradient が使える
- 離散と連続の境界を意識せず学習可能

### デメリット
- Encoder/Decoder の追加学習コスト
- 模倣学習では expert action → z へのマッピングが必要
- Interpretability が下がる（debug 困難）

→ Orbit Wars には **過剰**。概念として記憶。

## Action Space Shaping (Kanervisto et al. 2020)

実用的な指針: **action space の設計が algorithm 選択より重要**。
- Orbit Wars でやるべきこと:
  1. NOOP を必ず action_type に含める（「何もしない」は重要）
  2. amount は **fraction of source ships に正規化** して学習しやすくする
  3. 無効 action（自分の planet ではない source 等）は **mask out**

## Multi-agent 視点 (Fan et al. 2019)

Orbit Wars は厳密には single-agent だが、各 planet を mini-agent と見ると **per-planet decision** は協調 multi-agent 的:

```
Centralized critic + Decentralized per-planet actor
```

実装的には全 planet で同じ encoder と decoder を共有 → **parameter sharing で実質 1 ネットワーク**。共有がない multi-agent はサンプル効率激減。

## Loss 設計 (Parameterized Action Space 特有の論点)

### Approach 1: 構造的損失（**推奨**）

```python
# Action type ごとに loss を分岐
if gold_action_type == NOOP:
    loss = ce(action_type_logits, NOOP)
    # source/target/amount は学習しない
elif gold_action_type == ATTACK:
    loss = ce(action_type_logits, ATTACK) \
         + ce(source_logits, gold_source) \
         + ce(target_logits, gold_target) \
         + ce(amount_logits, gold_amount)
```

→ NOOP の場合に source/target に意味のない loss を計算しない。

### Approach 2: Mask-based loss

```python
loss_at = ce(action_type_logits, gold_at)
mask = (gold_at == ATTACK).float()
loss_others = mask * (
    ce(source_logits, gold_source) +
    ce(target_logits, gold_target) +
    ce(amount_logits, gold_amount)
)
loss = loss_at + loss_others.mean()
```

→ ベクトル化しやすい（GPU 効率良い）。実装はこちら推奨。

## まとめ

| 手法 | Orbit Wars 適合度 | 採用判断 |
|------|------------------|----------|
| PADDPG | 低（online RL 前提） | 不採用 |
| P-DQN | 中（offline 変形可） | 不採用、知識として保持 |
| HyAR | 低（過剰複雑） | 不採用 |
| Action Space Shaping 原則 | 高 | **採用**: NOOP 含める / amount を fraction に正規化 / invalid mask |
| Mask-based loss | 高 | **採用**: NOOP 時は source/target loss を mask |

**結論**: Parameterized action space の文献は知識として重要だが、Orbit Wars の主軸は **AlphaStar 風 autoregressive heads + pointer network**（02 章）に置く。本章で得た指針は loss 設計と action space shaping に反映する。
