# kaggle-environments との統合とローカル実行

## 一次ソース

- リポジトリ: https://github.com/Kaggle/kaggle-environments
- README: https://github.com/Kaggle/kaggle-environments/blob/master/README.md
- orbit_wars env ディレクトリ: https://github.com/Kaggle/kaggle-environments/tree/master/kaggle_environments/envs/orbit_wars

## インストール

```bash
uv pip install kaggle-environments
```

Docker の場合は kaggle-environments リポジトリの Dockerfile を参考にできる。ローカル開発は uv + pip で十分。

## 最小エージェント

```python
from kaggle_environments import make

def random_agent(observation, configuration):
    import random
    planets = observation.get("planets", [])
    player = observation.get("player", 0)
    my_planets = [p for p in planets if p[1] == player and p[5] > 1]
    if not my_planets:
        return []
    p = random.choice(my_planets)
    angle = random.uniform(0, 6.283)
    ships = max(1, p[5] // 2)
    return [[p[0], angle, ships]]

env = make("orbit_wars", debug=True)
env.run([random_agent, "random"])
env.render(mode="html", width=800, height=800)
```

## ローカル対戦・デバッグ

`make()` が返す `env` オブジェクトの主要 API:

| メソッド | 用途 |
|---------|------|
| `env.run(agents)` | エピソード実行、最終 state を返却 |
| `env.render(mode)` | `"ipython"` (notebook), `"html"` (ファイル出力), `"ansi"` |
| `env.reset()` | 環境初期化 |
| `env.step(actions)` | Gym 互換の 1 tick 進行 |
| `env.specification` | JSON spec オブジェクト（observation / action / configuration の schema） |

`agents` リスト要素は以下のいずれか:
- 関数オブジェクト（`def agent(obs, config): ...`）
- 文字列 `"random"` / `"negamax"`（組み込み default agent）
- ファイルパス（`"path/to/bot.py"`）
- コード文字列（`"def act(obs): return [...]"`）

## エージェント関数シグネチャ

```python
def my_agent(observation, configuration):
    """
    observation: Struct object with dot access (obs.planets / obs.fleets / ...)
                 also subscriptable (obs["planets"])
    configuration: Struct object (config.episodeSteps / config.actTimeout / ...)

    Returns: list of [from_planet_id, direction_angle, num_ships]
    """
    return []
```

- ホットパスで `obs.get("field", default)` は失敗するので、dict アクセス or attribute アクセスを使う
- 並行性なし（毎ターン同期実行）
- `remainingOverageTime` を観測して、危険時に簡易モード fallback が可能

## デバッグのコツ

1. `debug=True` を付けて `make("orbit_wars", debug=True)` するとエージェントエラー時に例外を表示
2. `env.toJSON()` でリプレイ JSON を取得、自作ビューワへ流せる
3. テスト: `kaggle_environments/envs/orbit_wars/test_orbit_wars.py` がコーナーケースの良い教材
4. `env.specification.observation` で観測スキーマを動的に確認

## 提出先（推定）

Kaggle 公式ページの Overview を要確認だが、既存 Simulation コンペ（Lux AI Season 2 / Kore 2022）と同じであれば:

- **Notebook submission**: Kaggle Notebook で `submission.py` を生成し、`Commit` → `Submit`
- **Code Competition**: Notebook を実行ランタイムで走らせ、エージェント関数を exporting
- ランタイム環境: Docker image に kaggle-environments が pre-install されている想定

## 参考: 類似環境の agent コード構造

- ConnectX: https://github.com/Kaggle/kaggle-environments/blob/master/kaggle_environments/envs/connectx/connectx.ipynb
- Hungry Geese: https://github.com/Kaggle/kaggle-environments/blob/master/kaggle_environments/envs/hungry_geese/hungry_geese.py
- Kore 2022: https://github.com/Kaggle/kaggle-environments/blob/master/kaggle_environments/envs/kore_fleets/kore_fleets.py
