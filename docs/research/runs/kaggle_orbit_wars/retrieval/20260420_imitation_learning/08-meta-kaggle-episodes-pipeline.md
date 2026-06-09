# Meta Kaggle Episodes 活用パイプライン

## 基本情報

- **Meta Kaggle dataset**: https://www.kaggle.com/datasets/kaggle/meta-kaggle
- **Meta Kaggle Code**: https://www.kaggle.com/datasets/kaggle/meta-kaggle-code
- **kaggle-environments**: https://github.com/Kaggle/kaggle-environments
- **目的**: Orbit Wars の LB 上位 bot リプレイを大量に取得し、BC / DAgger の学習データにする

## データソースの階層

Kaggle Simulation の IL で使うデータは次の 3 レイヤ：

| レイヤ | 取得手段 | 内容 | 更新頻度 |
|-------|---------|------|---------|
| A. Episode metadata | Meta Kaggle CSV (`EpisodeAgents.csv`, `Episodes.csv`) | エピソード ID, 参加チーム, 終了時刻 | 日次 |
| B. Episode replay | `/api/i/competitions.EpisodeService/DownloadEpisode?EpisodeId=<id>` | 各ターンの観測・行動 JSON | on-demand |
| C. Submission code | Meta Kaggle Code / 公開 kernel | BC 学習以外の参考 | イベント時 |

## 実装パターン

### Step 1: 上位 bot のエピソード ID 列挙

```python
# Meta Kaggle dataset から高レーティング bot の episode を絞る
import pandas as pd
episodes = pd.read_csv("Episodes.csv")
agents   = pd.read_csv("EpisodeAgents.csv")

# 対象コンペ ID で絞る
orbit_wars_id = <kaggle competition id>
target = episodes[episodes.CompetitionId == orbit_wars_id]

# score 上位 bot の SubmissionId を取得
agents = agents[agents.EpisodeId.isin(target.Id)]
top = agents.nlargest(100, "UpdatedScore").SubmissionId.unique()

# それら bot が参加したエピソードだけ
ep_ids = agents[agents.SubmissionId.isin(top)].EpisodeId.unique()
```

### Step 2: エピソード本体のダウンロード

```python
import requests, json, time

URL = "https://www.kaggle.com/api/i/competitions.EpisodeService/DownloadEpisode"

for eid in ep_ids:
    resp = requests.post(URL, json={"EpisodeId": int(eid)})
    data = resp.json()
    with open(f"replays/{eid}.json", "w") as f:
        json.dump(data, f)
    time.sleep(1.0)  # rate limit 配慮
```

実際の endpoint は kaggle-environments の `episode_replayer.py` か公開 kernel を参考に。HTTP 429 や認証要件に注意。

### Step 3: 観測/行動対への展開

```python
from kaggle_environments import make

env = make("orbit_wars")  # コンペ名が公開されたら
env.steps = episode_json["steps"]

samples = []
for step_idx, step in enumerate(env.steps):
    for agent_idx, agent_state in enumerate(step):
        obs    = agent_state.observation
        action = agent_state.action
        if action is None:
            continue
        samples.append({
            "obs": tensorize(obs),
            "action": encode_action(action),
            "agent_idx": agent_idx,
            "step": step_idx,
        })
```

### Step 4: フィルタリング

- **勝者側のみ使う** / **両者使うが勝率で weighting**
- LB スコア閾値（Hungry Geese Maxwell 解法では > 1200）
- 同一 bot 多数エピソードは overfit 要因 → bot 毎 cap を設ける
- 対称性（左右反転、180° 回転）で水増し（盤面性質次第）

### Step 5: 学習フォーマット

- parquet で保存推奨（エピソード単位で shard）
- observation は (C, H, W) の numpy or torch tensor で pre-materialize（逐次 tensorize は遅い）
- 行動は **factorized action** (source_planet, target_planet, fleet_size) または **sequence token** として保存

## 落とし穴 & ベストプラクティス

1. **Rate limit**: Kaggle API は分あたり〜60 req 程度が目安。バックオフ必須
2. **ストレージ**: 数万エピソード × 数百 KB = 数 GB ～ 数十 GB。EFS 等に保存
3. **データ leak**: 自分の bot のエピソードを混ぜると overfit。チーム ID で除外
4. **バージョン drift**: コンペ途中で環境ルールが変わると旧エピソードが使えなくなる → 取得時の環境バージョンをメタデータに残す
5. **偏り**: 強い bot ほど特定戦術に偏る。複数 bot から少しずつ混合する方が generalize する（Kore 2022 の top5 混合と同じ発想）

## 既存の参考実装

- [Fkaneko/kaggle_lux_ai](https://github.com/Fkaneko/kaggle_lux_ai) — Lux AI 向け episode 収集スクリプト
- [RoboEden/Luxai-s2-Baseline](https://github.com/RoboEden/Luxai-s2-Baseline) — 公式推奨 IL データ生成
- 公開 Kaggle kernel "Meta Kaggle Episodes" で検索（各コンペごとに複数ある）

## Orbit Wars 向けの実装タスク

- [ ] コンペ公開直後に `CompetitionId` を確定
- [ ] `Episodes.csv` / `EpisodeAgents.csv` を日次で pull するスクリプト
- [ ] Top-N bot のエピソードをダウンロードして parquet 化する worker
- [ ] observation/action tensorizer（game_mechanics クラスタの仕様に従う）
- [ ] 学習用 Dataset クラス (PyTorch `IterableDataset` 推奨、shuffle buffer 付き)

## 参考文献

- Kaggle, "Meta Kaggle": https://www.kaggle.com/datasets/kaggle/meta-kaggle
- Kaggle/kaggle-environments: https://github.com/Kaggle/kaggle-environments
