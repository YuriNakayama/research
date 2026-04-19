# 提出形式と思考時間管理

## 思考時間モデル

### 2 つの時間予算

| 予算 | 値 | 用途 |
|------|---|------|
| `actTimeout` | 1 秒/手 | 毎ターンの通常制限 |
| `remainingOverageTime` | 初期 2 秒 | 全 500 ターンで共有する超過用バッファ |

### 挙動（kaggle-environments 共通）

1. エージェント関数が `actTimeout` 以内に return すれば通常通り進行
2. `actTimeout` を超えると `remainingOverageTime` を消費
3. 消費した分だけ `observation.remainingOverageTime` が減る
4. `remainingOverageTime` が枯渇し、さらに `actTimeout` を超えると **TIMEOUT** 判定 → 脱落

### 実装上の含意

- **平均 0.8 秒/手** 程度に抑え、overage は **本当に計算が必要な瞬間** に使う
- 序盤は計算軽く、中盤以降（艦隊数が多い）で overage を投入
- 逆に **序盤は情報が少なく読み負けしにくい** ので、overage は中盤以降に取っておくのが定石
- 各ターン開始時に `remainingOverageTime` をチェックし、残り <0.5 秒なら簡易モードに fallback

## ターン予算の配分（目安）

500 ターン × 1 秒 + 2 秒 overage = **502 秒 ≈ 8.4 分/エピソード**

仮に 1 ターン平均 0.8 秒で動作すれば、**100 秒の余剰** が生まれる。MCTS の iteration 数や RHEA の horizon 拡張の源泉として活用可能。

## 提出形式（既存 Simulation コンペ準拠・要確認）

### Kaggle Code Competition の一般パターン

1. **Notebook 提出**: Kaggle Notebook で `%%writefile submission.py` or 単一ファイル出力
2. **スクリプト提出**: ローカル開発した `.py` を直接 upload
3. **Wrapper export**: `kaggle_environments.agent.save_agent_file()` で単一ファイル化

### 類似コンペ（Kore 2022）の例

Kore 2022 は「1 ファイル `.py` / `.ipynb` で agent 関数を定義して提出」だった。Orbit Wars も同形式の可能性が高い。

```python
# submission.py の典型例
def agent(observation, configuration):
    # 初期化はモジュールレベルで（毎ターン再初期化しない）
    # heavy import は lazy だと毎ターン遅い
    ...
    return [[planet_id, angle, ships], ...]
```

### 依存ライブラリ

- Kaggle Docker image に含まれるパッケージは利用可能（NumPy, PyTorch, TensorFlow, scikit-learn 等）
- 外部通信は **禁止**（submission 実行環境はオフライン）
- 学習済みモデルは Notebook dataset として一緒に upload

## チューニングのコツ（類似コンペから）

1. **起動時コスト** — import は最初のターンで済ませ、モジュールレベルでキャッシュ
2. **NumPy 配列 vs Python list** — 観測は list of list で来る。頻繁にアクセスする場合は最初のターンで ndarray 化
3. **シリアライズ回避** — deepcopy は遅い。状態遷移は差分更新で
4. **C 拡張** — 軌道計算は Numba JIT / Cython で 10-100 倍高速化可
5. **I/O 禁止** — print は許されるが不要、logger も disable
6. **乱数 seed** — `random.seed` 固定で再現性確保（テスト用）

## 既知の制限（類似コンペから推定）

| 項目 | 推定値 | 根拠 |
|------|-------|------|
| 実行メモリ | 16 GB（Kaggle default） | Kore 2022 / Lux S2 |
| CPU | 4 コア程度 | Kaggle Notebook runtime |
| GPU | 提供なし（inference 専用） | Simulation コンペは通常 CPU のみ |
| ネットワーク | 無効 | offline runtime |
| ディスク | 20 GB | Kaggle dataset 経由でロード |

## 要確認（公式ページ依存）

- **提出回数上限**（submission per day）
- **final scoring period** の長さ（最終評価期間）
- **team merge deadline**
- **external data policy**

上記は Kaggle 公式コンペページの Rules / Timeline タブを確認する必要がある。
