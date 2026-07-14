# 4. Meta-learning for Heterogeneous Treatment Effect Estimation with Closed-form Solvers

- **URL / arXiv**: https://arxiv.org/abs/2305.11353
- **著者 / 発表年 / venue**: Tomoharu Iwata, Yoichi Chikahara / 2023 / arXiv (stat.ML)

## 概要
少数の観測データしかない複数タスクから CATE を学習する問題に、メタ学習で取り組む。複数の処置効果推定問題から共通知識を獲得し、新規（未見）タスクでの少数データ推定性能を高めることを狙う。task-shared パラメータと task-specific パラメータを持つニューラルネットを用い、task-specific 部分を閉形式（closed-form）かつ微分可能に解けるよう定式化した点が中心的な新規性。既存のメタ学習・CATE 手法を上回る性能を示す。

## 手法・キーアイデア
CATE 推定をより小さなサブ問題に分解し、ネットワークを task-shared（全タスク共通）と task-specific（各タスク固有）に分ける。task-specific パラメータは閉形式で解け、しかも微分可能であるため、その解を通して逆伝播し shared パラメータを更新できる（MAML のような内側最適化ループが不要で効率的）。学習目標は、大規模データで得た CATE 推定と few-shot 設定での推定との性能ギャップを最小化することであり、少数データでの汎化性能を直接最適化する。

## ユーザー課題への適用
「過去の多数のマーケティング施策」を複数タスク、「新施策」を新規タスクと見なすと本手法が直接適用できる。多数の旧施策で task-shared パラメータ（施策横断の共通因果構造）を事前に学習しておけば、新施策では少量データから task-specific パラメータを閉形式で即座に解くだけで CATE を推定できる。これは新施策ごとに個別選択する必要がなく、複数の旧施策資産を一括で統合活用する点で CITA（単一ソース選択）と補完的。閉形式ソルバは新施策のデータ量に応じて解が自動調整されるため、少量データ時の過適合を抑え、実質的に negative transfer を緩和する。ただし旧施策群と新施策の共変量空間が共通である前提には注意が必要。

## 長所と限界
長所: 内側最適化ループ不要で計算効率が高く、多数タスクからの一括転移に向く。few-shot 性能を直接最適化する。限界: task-specific を閉形式にするためモデル構造に制約があり、複雑な非線形固有効果の表現力が犠牲になり得る。特徴空間の異質性は扱わず、事前タスク（旧施策）が多数必要。

## 関連手法・次に読むべきもの
CITA（2210.00380、転移元選択との対比）、heterogeneous feature transfer（2210.06183）、CorNet（2202.12891）、MAML / メタ学習の closed-form solver（Bertinetto et al. の R2-D2, Ridge Regression Differentiable Discriminator）。
