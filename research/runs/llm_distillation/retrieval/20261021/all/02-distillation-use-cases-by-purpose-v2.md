# 蒸留技術の事業者別ユースケース（改訂版） — 教師→生徒のモデル・パラメータ数と実行時間を併記

- **Type**: 横断整理（Cross-cluster synthesis、[01](01-distillation-use-cases-by-purpose.md) の表形式を改訂）
- **Generated on**: 2026-11-05
- **01 からの変更点**: (1) 「教師 → 生徒」列に双方のモデル名とパラメータ数の変化を記載、(2) 「成果」列に指標の変化と実行時間（レイテンシ・スループット・学習時間）の変化を併記、(3) 「段階」列と「エビデンス」列を削除。資料 URL と詳細レポートの列は維持
- **凡例**: 「—」= 原典に記載なし。「非公開」= 原典が意図的に伏せている。時間は原典の計測条件（GPU 種別・バッチ）が異なるため、行間の比較はできません
- **数値の出典**: すべて各クラスタの詳細レポート（右端列）で原典照合済み。本ページで新たに集計した数値はありません

## 目的 1: 推論コスト・レイテンシの削減（本番の大量処理を小型モデルに置き換える）

| 地域 | 事業者・用途 | 教師 → 生徒（モデル / パラメータ数） | 成果（指標） | 成果（実行時間） | 資料 | 詳細レポート |
|---|---|---|---|---|---|---|
| 海外 | Walmart: EC 検索の関連度判定 | Mistral-7B（LoRA 分類器）7B → BERT-Base 約 110M（約 1/64） | カート追加率 +1.2%（A/B） | 7B 交差エンコーダは再ランキング段でリアルタイム不可 → BERT で本番配信。絶対値は — | [arXiv 2505.07105](https://arxiv.org/abs/2505.07105) | [search_recsys/01](../search_recsys/01-walmart-search-relevance-kd.md) |
| 海外 | LinkedIn: 求人・人物検索 | 関連度 oracle 8B + エンゲージメント教師 1.7B → SLM 0.6B → 剪定後 375M（約 1/21） | NDCG@10 +7.73%、DAU +1.2% 超 | H100 1 枚・500ms 予算で 290 → 22,000 items/s（75 倍超）。蒸留パイプライン 約 45 時間 → 5 時間未満 | [arXiv 2602.07309](https://arxiv.org/abs/2602.07309v1) | [search_recsys/02](../search_recsys/02-linkedin-semantic-search-multi-teacher.md) |
| 海外 | Tencent: Web 検索ランキング | Mistral-7B-v0.1（CPT + SFT）7B → 6 層 BERT 0.1B（約 1/70） | nDCG@5 0.8536、PageCTR +0.47%、滞在時間 +1.2% | 約 100ms → 約 10ms（A10、batch 48、系列長 256） | [arXiv 2411.04539](https://arxiv.org/abs/2411.04539v1) | [search_recsys/07](../search_recsys/07-tencent-disranker-web-search.md) |
| 海外 | Taobao（Alibaba）: EC 検索関連度 | Qwen2-72B / Llama3-70B → Qwen2-7B（CoT で SFT）→ 生徒 101.2M（約 1/70 の 2 段） | CTR +0.17%、全トラフィック稼働 | 7B は 1,000 ペアあたり 84 秒（直接）〜432 秒（CoT）でオンライン不可 → 101M で配信。7B 学習は 16×H20 で 10 時間 | [arXiv 2411.13045](https://arxiv.org/abs/2411.13045) | [search_recsys/04](../search_recsys/04-taobao-ellm-multidim-distillation.md) |
| 海外 | AliExpress: EC 検索関連度 | Qwen3-14B（LoRA、多視点 CoT）14B → BERT-multilingual-base 168.15M（約 1/83） | RPM +1.42%（7 日 A/B） | 100 件バッチで 46,800ms → 132〜149ms（A100、約 350 倍高速）。抽出器の追加 0.46〜16.54ms | [arXiv 2601.21611](https://arxiv.org/abs/2601.21611v1) | [search_recsys/06](../search_recsys/06-aliexpress-latent-reasoning-distillation.md) |
| 海外 | Meituan: 検索広告の関連度 | Qwen3-8B（CPT + SFT + GRPO）8B → 6 層中国語 BERT（パラメータ数 —） | 広告 CTR +0.91%、CVR +1.06% | — （LLM は「レイテンシ制約で直接使えない」と記載のみ） | [arXiv 2510.11056](https://arxiv.org/abs/2510.11056v3) | [search_recsys/05](../search_recsys/05-meituan-reasoning-llm-to-bert.md) |
| 海外 | Meituan: CTR 予測（MSD） | LLM（名称・サイズ非公開）→ 小型生徒（サイズ非公開）→ CTR モデルに注入 | CTR +2.12%、CPM +2.59%（10 日 A/B） | 配信 35ms → 37.2ms（+2.2ms）。教師 LLM はオンラインから除去 | [arXiv 2412.06860](https://arxiv.org/abs/2412.06860) | [search_recsys/17](../search_recsys/17-meituan-msd-llm-infused-ctr.md) |
| 海外 | NAVER: ロングテール検索の再ランキング | HyperCLOVA X Large（パラメータ数非公開）→ RRA-BERT / RRA-GPT 1B 未満 | CTR +5.63%、滞在時間 +7.97%（7 日 A/B） | TCL 除去で推論時間 −5.58%、bfloat16 で QPS +18%（性能 99.8% 維持） | [arXiv 2410.18097](https://arxiv.org/abs/2410.18097) | [search_recsys/15](../search_recsys/15-naver-rradistill-long-tail-reranking.md) |
| 海外 | JD.com: EC 検索関連度 | Qwen3-8B + 知識注入（軌跡合成は GPT-5.2）8B → 小型 BERT（サイズ非公開） | Bad Case 率 12.10% → 11.3%（相対 −5.87%） | 教師比でレイテンシ 1 桁削減（絶対値非公開） | [arXiv 2604.25683](https://arxiv.org/abs/2604.25683) | [search_recsys/16](../search_recsys/16-jd-kcare-relevance-distillation.md) |
| 海外 | Pinterest: 検索関連度 | Llama-3-8B（qLoRA 交差エンコーダ）8B → 特徴量ベース FFN（サイズ —） | nDCG@20 +2.18%、非 US fulfillment +2.0%、45 以上の言語 | — （LLM 交差エンコーダは「配信不可」と記載のみ） | [arXiv 2410.17152](https://arxiv.org/abs/2410.17152) | [search_recsys/03](../search_recsys/03-pinterest-search-relevance-llm.md) |
| 海外 | Etsy: 検索関連度 | 推論 LLM（o3 と推定）→ Qwen 3 VL 4B（SFT）→ BERT 双塔（サイズ —） | 完全関連の割合 58 → 62% | 生徒の追加レイテンシ 10ms 未満。教師 4B は vLLM で日次数百万件をオフライン処理 | [Etsy Code as Craft](https://www.etsy.com/codeascraft/how-etsy-uses-llms-to-improve-search-relevance) | [search_recsys/13](../search_recsys/13-etsy-semantic-relevance-cascade.md) |
| 海外 | DoorDash: 検索広告の関連度 | 微調整 LLM（非公開、人手 70 万件）→ DistilBERT 双塔 64 次元 | Precision@2 +5.2% | 埋め込みを事前計算し KV ストアに保存。追加レイテンシほぼゼロ | [DoorDash Blog](https://careersatdoordash.com/blog/small-language-models-to-serve-more-relevant-doordash-search-ads/) | [search_recsys/12](../search_recsys/12-doordash-slm-ad-relevance.md) |
| 海外 | Amazon: EC 関連度分類（研究） | Mixtral 8x7B Instruct（根拠生成）→ BERT-base 110M 交差エンコーダ | 9 データ平均 ROC-AUC +1.4%、微調整 7B と差 1% 未満 | 本番は BERT のみで 7B 比 50 倍高速。20B LLM で 5,000 万ペア分類は 1 GPU で数日 → 交差エンコーダなら数時間 | [COLING 2025 Industry](https://aclanthology.org/2025.coling-industry.12.pdf) | [search_recsys/08](../search_recsys/08-amazon-rationale-guided-distillation.md) |
| 海外 | ByteDance: 音楽アプリの function calling | 大型 LLM（名称非公開）→ deepseek-coder-1.3B（簡単な問合せ約 60% を振り分け） | 精度低下はごくわずか | 期待遅延 1,600ms → 870ms（−45%）、中央値遅延 −78%。従来は 1〜2 秒、ピーク P90 2〜3 秒 | [arXiv 2507.08877](https://arxiv.org/abs/2507.08877) | [enterprise_workflows/02](../enterprise_workflows/02-bytedance-odia-function-calling.md) |
| 海外 | LivePerson: コンタクトセンターの agent-assist | GPT-3（text-davinci-003）→ 蒸留 GPT-2 6 層 81M | 採用率 69% → 57%、年間純節約額 53,653 ドル vs 50,920 ドル（差約 3,000 ドル） | A100 で 12ms / 推論、0.0011 セント / 推論（GPT-3 の約 1/1000） | [arXiv 2306.07402](https://arxiv.org/abs/2306.07402v1) | [enterprise_workflows/01](../enterprise_workflows/01-liveperson-economic-tradeoffs.md) |
| 海外 | Convirza: コールセンター通話分析（**蒸留ではなく LoRA 微調整** と判定） | OpenAI API / Longformer 60 モデル → Llama 3.1 8B + LoRA 60 アダプタ（1 GPU） | コスト削減（金額非公開） | 約 0.1 秒 / 推論、スループット OpenAI 比 約 +80%・Longformer 比 約 4 倍、学習サイクル 9〜24 時間超 → 短縮 | [ZenML](https://zenml.io/llmops-database/optimizing-call-center-analytics-with-small-language-models-and-multi-adapter-serving) | [enterprise_workflows/10](../enterprise_workflows/10-convirza-predibase-call-analytics.md) |
| 海外 | Darrow: 法務リサーチの大量文書処理 | 非公開（蒸留済み API モデル GPT-4o mini 等を利用） | 業務利用（数値なし） | GPT-4o mini は GPT-3.5 Turbo の 2.5 倍高速（第三者レポートの引用） | [Darrow](https://darrow.ai/resources/distilled-llms) | [enterprise_workflows/13](../enterprise_workflows/13-darrow-legal-distilled-llms.md) |
| 海外 | Alibaba: SQL 補完（DistilQwen2.5） | Qwen2.5-7B（int4、微調整済み）→ Qwen2.5-3B | 採用率 26.5% → 25.5%、Pass@1 は 7B に近接 | レイテンシ 384ms → 148ms（本文は推論速度 1.4 倍、表からは約 2.6 倍） | [arXiv DistilQwen2.5](../distillation_platforms/08-distilqwen25-alibaba-pai.md) | [distillation_platforms/08](../distillation_platforms/08-distilqwen25-alibaba-pai.md) |
| 国内 | 富士通: 自社 CRM の商談勝敗予測 | Takane（サイズ非公開）→ 約 1/100 規模（NAS で探索） | 精度 +43%、GPU メモリ・運用コスト各 −70%（ベンダー申告） | 推論 11 倍速 | [富士通 PR](https://global.fujitsu/ja-jp/pr/news/2025/09/08-01)（取得不可）/ [クラウド Watch](https://cloud.watch.impress.co.jp/docs/news/2045596.html) | [japan_cases/03](../japan_cases/03-fujitsu-takane-specialized-distillation.md) |
| 国内 | LINE ヤフー: 検索クエリ埋め込み（**蒸留を試して不採用**） | UBIQUE（DistilBERT 系）の蒸留・量子化 → 不採用。静的埋め込み（埋め込み層のみ）に置換 | 社内ベンチマーク平均 85.2 → 82.8 | CPU 18.8ms（INT8）→ 1.8ms（10 倍以上） | [LY Tech Blog](https://techblog.lycorp.co.jp/ja/20250804a) | [search_recsys/18](../search_recsys/18-ly-static-embedding-query.md) |

## 目的 2: 社内文書・業務データからの情報抽出（ラベルなしデータの自動処理）

| 地域 | 事業者・用途 | 教師 → 生徒（モデル / パラメータ数） | 成果（指標） | 成果（実行時間） | 資料 | 詳細レポート |
|---|---|---|---|---|---|---|
| 海外 | Amazon: 社内経費書類の情報抽出 | Claude 3 Sonnet（サイズ非公開）→ LLaVA-Net 7B（テキスト部 Mistral 7B、LoRA） | Sonnet と同等以上、約 85% 安価、拒否 0 件 | 約 5 倍高速（0.3 → 1.5 docs/s）、単一 20GB GPU で稼働。学習は SageMaker 8 GPU 約 10 時間 | [arXiv 2411.14957](https://arxiv.org/html/2411.14957) | [enterprise_workflows/03](../enterprise_workflows/03-amazon-tail-expense-documents.md) |
| 海外 | Grab: 本人確認書類の読取り（**教師を使わない微調整** と判定） | — → Qwen2-VL 2B 全層 FT → 視覚エンコーダ + Qwen2.5 0.5B デコーダの約 1B モデル | 2B 比で精度差 3pp 以内、タイ語 +70pp・ベトナム語 +40pp（ベースライン比） | 1B は 2B・OCR・外部 API を「大きく上回る」（共有サマリーは 50% 高速）。商用 API は P99 が P50 の 3〜4 倍 | [Grab Engineering](https://engineering.grab.com/custom-vision-llm-at-grab) | [enterprise_workflows/14](../enterprise_workflows/14-grab-custom-vision-llm-document-processing.md) |
| 海外 | シカゴ大 / Stanford（npj Digital Medicine）: 臨床情報の抽出 | Llama-3.1-70B-Instruct 70B → Llama 8B / 3B / 1B（QLoRA） | 8B が 89.1% vs 教師 76.1%、apixaban 試験 93.5% vs 88.7% | 推論 2.34 秒 / 例 → 0.535 秒 / 例、1 万人 × 23 問で 4,066 ドル → 929 ドル（約 77% 減）。学習 8 GPU で 12 時間未満 | [PMC12065832](https://pmc.ncbi.nlm.nih.gov/articles/PMC12065832/) | [enterprise_workflows/05](../enterprise_workflows/05-npj-synthetic-data-distillation-clinical.md) |
| 海外 | Stanford: 臨床 NER | LLM + オントロジーのラベル → 小型 BERT（LLM の約 1/1000） | NER 性能は LLM と同程度 | 最大 101 倍安価、12 倍高速（1 記録あたり） | [arXiv 2501.00031](https://arxiv.org/abs/2501.00031v1) | [enterprise_workflows/06](../enterprise_workflows/06-stanford-clinical-ner-distillation.md) |
| 海外 | SHIELD: 臨床ノートの匿名化 | LLM → 蒸留 SLM（モデル名・サイズは abs のみ取得のため —） | 企業規模の匿名化 | — | [arXiv 2605.03301](https://arxiv.org/abs/2605.03301) | [enterprise_workflows/15](../enterprise_workflows/15-shield-clinical-deidentification-distillation.md) |
| 海外 | SAP: 業務文書理解（特許） | LLM → T5 系エンコーダ・デコーダ（サイズ記載なし） | 登録特許（定量効果の記載なし） | — | [US12475175](https://patents.google.com/patent/US12475175) | [enterprise_workflows/04](../enterprise_workflows/04-sap-patent-document-understanding-kd.md) |
| 国内 | NTT 東日本: 通信設備保守の危険予知 | Qwen3-VL-235B-A22B（235B、活性 22B）→ Qwen3-VL-8B（LoRA r16、約 1/29） | 危険予知スコア 8.04 → 8.65（+7.6%）、Accuracy +4.4〜5.0% | — （235B → 8B で「オンプレ等の限られた計算資源」で稼働可、と記載のみ） | [NLP2026 C4-2](https://www.anlp.jp/proceedings/annual_meeting/2026/pdf_dir/C4-2.pdf) | [japan_cases/09](../japan_cases/09-ntt-east-facility-maintenance-vlm.md) |
| 国内 | ビズリーチ: 求人・レジュメのマッチング埋め込み | GPT-4o-mini（採点、サイズ非公開）→ 自社 BERT 12M / 30M / 45M | 総合 68.88（45M）で OpenAI Embedding API 68.58 と同等以上、ruri-small 42.54 | — （レイテンシ・コストの数値は報告なし。長文 2,048 トークン対応） | [NLP2026 C7-6](https://www.anlp.jp/proceedings/annual_meeting/2026/pdf_dir/C7-6.pdf) | [search_recsys/14](../search_recsys/14-bizreach-llm-teacher-job-embedding.md) |
| 国内 | Japan Digital Design（MUFG 系）: 金融市場レポートの日英翻訳 | Llama 3.3 Swallow 70B（初期翻訳モデル）+ DeepSeek-V3.1（Judge / Editor）→ 同じ 70B（データ蒸留、小型化なし） | Judge Overall +0.178、品質の分散 1/18、BLEU は低下 | 推論コスト・時間は不変（同サイズ）。学習は各セグメント 50 候補生成 + Judge | [NLP2026 C9-7](https://www.anlp.jp/proceedings/annual_meeting/2026/pdf_dir/C9-7.pdf) | [japan_cases/08](../japan_cases/08-jdd-financial-translation-distillation.md) |

## 目的 3: エッジ・端末・車載への配置（クラウド不可・オフライン）

| 地域 | 事業者・用途 | 教師 → 生徒（モデル / パラメータ数） | 成果（指標） | 成果（実行時間） | 資料 | 詳細レポート |
|---|---|---|---|---|---|---|
| 海外 | Apple: iPhone / Mac の端末内モデル（AFM 2025） | 社内 MoE 教師（密 3B を 64 エキスパートに upcycle）→ 密 3B（非埋め込み 2.58B + 埋め込み 0.15B） | 2bit QAT で MMLU 67.8 → 64.4、教師学習コスト 90% 減 | KV キャッシュメモリ 37.5% 減、TTFT 約 37.5% 減。蒸留は最後の約 10%（約 1.4T トークン） | [arXiv 2507.13575](https://arxiv.org/abs/2507.13575) | [edge_ondevice/01](../edge_ondevice/01-apple-foundation-models-2025.md) |
| 海外 | Apple × Google: Gemini からの蒸留（AFM 3） | Gemini frontier models → AFM 3 Core 3B 密 / Core Advanced 20B スパース（活性 1〜4B） | 前世代比 SxS 選好 45.6% 対 23.3%（蒸留効果は分離されず）、Gemini 利用料 年約 10 億ドル（報道） | — | [The Decoder](https://the-decoder.com/apple-gets-full-gemini-access-and-uses-distillation-to-build-lightweight-on-device-ai/) | [edge_ondevice/02](../edge_ondevice/02-apple-gemini-distillation-reports.md) |
| 海外 | Google: Pixel / Android の Gemini Nano | 大型 Gemini（Pro / Ultra、サイズ非公開）→ Nano-1 1.8B / Nano-2 3.25B（4bit 量子化） | Pro 比 Factuality 0.71 / 0.81、MBPP 0.33 / 0.45 | — （後継 Gemma 3n は Gemma 3 4B 比で応答開始約 1.5 倍高速、視覚エンコーダ 13 倍高速） | [arXiv 2312.11805](https://arxiv.org/abs/2312.11805) | [edge_ondevice/03](../edge_ondevice/03-gemini-nano.md) |
| 海外 | Microsoft: Copilot+ PC の Phi Silica | 本体は Phi-3.5-mini 派生 3.3B（非蒸留）。LoRA 部分のみ GPT-4o → 3.3B + LoRA | 拒否率 75% 減、選好 4.6 倍（Learning Zone） | 初トークン 230ms、最大 20 tok/s、メモリ約 60% 減（QuaRot 4bit）。LoRA 学習ジョブ 平均 45〜60 分 | [Windows Blog](https://blogs.windows.com/windowsdeveloper/2025/07/31/phi-silica-task-specialization-using-lora-in-microsoft-learning-zone-a-technical-deep-dive/) | [edge_ondevice/04](../edge_ondevice/04-phi-silica.md) |
| 海外 | Meta: Llama 3.2 1B / 3B モバイル向け | Llama 3.1 8B / 70B（logit）→ 1B / 3B（剪定で初期化、約 1/8〜1/70） | 教師 logit 生成 86k H100 時間（学習全体 916k の約 10%） | 1B デコード 19.2 → 45.8 tok/s（QAT+LoRA、2.4 倍）/ 50.2 tok/s（SpinQuant、2.6 倍） | [Meta AI Blog](https://ai.meta.com/blog/llama-3-2-connect-2024-vision-edge-mobile-devices/) | [edge_ondevice/05](../edge_ondevice/05-llama-3-2-edge.md) |
| 海外 | Google: 端末制約に応じた蒸留（特許） | クラウド ASR / NLU / TTS → 端末制約に応じて選んだ生徒（サイズは実施例ごと） | 教師との精度差 1% 以内で配備（実施例） | 遅延改善・帯域削減（数値なし） | [US11990121B2](https://patents.google.com/patent/US11990121B2) | [edge_ondevice/10](../edge_ondevice/10-google-patent-distilling-to-target-device.md) |
| 国内 | PFN: 自律稼働デバイス向け VLM の基盤 | PLaMo 2 31B（2T トークン事前学習）→ 剪定 8B を 500B トークンで蒸留再学習（約 1/4） | JMMLU 0.572（スクラッチ 8B）→ 0.635、前世代 100B に匹敵 | 学習計算量はスクラッチ 8B の約 1/5。推論は vLLM + INT4 / FP8 KV（数値 —） | [arXiv 2509.04897](https://arxiv.org/abs/2509.04897) | [japan_cases/02](../japan_cases/02-pfn-plamo2-pruning-distillation.md) |
| 国内 | デンソーテン: 車載器・スマホの RAG 検索 | ruri-v3-130m → ruri-v3-70m（約 1/2、100M 以下） | JMTEB 検索 nDCG@10 66.38 → 67.73 | — | [NLP2026 P1-4](https://www.anlp.jp/proceedings/annual_meeting/2026/pdf_dir/P1-4.pdf) | [japan_cases/index](../japan_cases/index.md) |
| 国内 | Sakana AI: スマホで動く日本語 SLM（TinySwallow） | Qwen2.5-32B-Instruct 32B → Qwen2.5-1.5B 1.5B（約 1/20、TAID） | 日本語平均 0.402（Qwen2.5-1.5B は 0.372）、MT-Bench 4.05（Phi-3-mini → TinyLlama 実験） | iPhone（Q5 量子化）で 19.89 tok/s | [arXiv 2501.16937](https://arxiv.org/abs/2501.16937) / [Sakana](https://sakana.ai/taid-jp/) | [japan_cases/01](../japan_cases/01-sakana-taid-tinyswallow.md) |
| 国内 | 富士通: スマホ・工場機械向け（1bit 量子化と併用） | Takane → 約 1/100 規模（1bit 量子化 QEP） | メモリ最大 94% 減、精度維持率 89%（ベンダー申告） | 推論 11 倍速（CRM 実証値の再掲） | [EE Times Japan](https://eetimes.itmedia.co.jp/ee/articles/2509/10/news027.html) | [edge_ondevice/09](../edge_ondevice/09-fujitsu-takane-quantization-distillation.md) |

## 目的 4: AI エージェント・tool calling の小型化（海外のみ）

| 事業者・用途 | 教師 → 生徒（モデル / パラメータ数） | 成果（指標） | 成果（実行時間） | 資料 | 詳細レポート |
|---|---|---|---|---|---|
| AWS Bedrock Model Distillation: function calling | Llama 3.1 405B → Llama 3.2 3B（約 1/135。GA の教師は Llama 3.3 70B） | BFCL v2 simple 0.478 → 0.826、multiple 0.586 → 0.828 | 遅延 −72%（Llama 3.2 3B vs 3.1 405B、Artificial Analysis の引用） | [AWS Blog](https://aws.amazon.com/blogs/machine-learning/amazon-bedrock-model-distillation-boost-function-calling-accuracy-while-reducing-cost-and-latency/) | [enterprise_workflows/07](../enterprise_workflows/07-aws-bedrock-function-calling-distillation.md) |
| NVIDIA Data Flywheel: エージェントの tool calling | Llama-3.3-70B-Instruct（本番ログ）→ Llama-3.2-1B-Instruct（約 1/70） | 70B の tool calling 精度の 98%（絶対値なし） | 推論 GPU 2 枚 → 1 枚。遅延・コストは記載なし | [NVIDIA Blog](https://developer.nvidia.com/blog/build-efficient-ai-agents-through-model-distillation-with-nvidias-data-flywheel-blueprint) | [enterprise_workflows/08](../enterprise_workflows/08-nvidia-data-flywheel-tool-calling.md) |
| NVIDIA 金融ワークフロー: ニュース見出し分類 | Llama-3.3-70B / Nemotron 49B → Llama-3.2-1B / 3B、Llama-3.1-8B（LoRA） | 1B: 5,000 件で 0.29 → 25,000 件で 0.90、3B: 10,000 件で 0.89 | — | [NVIDIA Blog](https://developer.nvidia.com/blog/build-efficient-financial-data-workflows-with-ai-model-distillation/) | [enterprise_workflows/09](../enterprise_workflows/09-nvidia-financial-distillation.md) |
| Salesforce xLAM（APIGen）: function calling モデル | DeepSeek-V2-Chat 236B / Mixtral-8x22B（データ生成）→ DeepSeek-Coder 1.3B / 7B | BFCL で 7B が最先端、複数の GPT-4 系を上回る | — | [arXiv 2406.18518](https://arxiv.org/abs/2406.18518) | [enterprise_workflows/18](../enterprise_workflows/18-apigen-xlam-function-calling-data.md) |
| Instacart: クエリ理解 | フロンティア LLM（非公開、オフライン RAG 強化）→ Llama-3-8B（LoRA） | ロングテールの不満 −50%。生徒は 8B で「小型化」より自社配信への置換 | A100 で約 700ms → LoRA 統合（−30%）+ H100 で約 300ms | [Instacart](https://company.instacart.com/tech-innovation/building-the-intent-engine-how-instacart-is-revamping-query-understanding-with-llms) | [search_recsys/09](../search_recsys/09-instacart-intent-engine.md) |
| Microsoft: エージェント生成例で生徒を学習（特許） | 教師言語モデル → 生徒言語モデル（サイズ非限定） | 出願公開（数値なし） | — | [US20250322255A1](https://patents.google.com/patent/US20250322255A1) | [enterprise_workflows/16](../enterprise_workflows/16-microsoft-patent-agent-generated-student-training.md) |

> 国内では tool calling 向けの蒸留事例は確認できませんでした（[japan_cases/index](../japan_cases/index.md) の仮説 H6）。

## 目的 5: 安全・ガードレール（海外のみ）

| 事業者・用途 | 教師 → 生徒（モデル / パラメータ数） | 成果（指標） | 成果（実行時間） | 資料 | 詳細レポート |
|---|---|---|---|---|---|
| CONSCENDI: バーチャルアシスタントのガードレール | GPT-4（対照データ生成）→ ada / babbage / curie / davinci、llama-2-70b-chat | GPT-4 を精度で上回る。1 リクエスト 0.0086 ドル → 0.0001 ドル（ada、86 倍安価） | 2.94 秒 → 0.11 秒（表の値、約 27 倍高速。本文は「2〜4 倍速く最大約 200 倍安い」） | [arXiv 2304.14364](https://arxiv.org/abs/2304.14364) | [enterprise_workflows/11](../enterprise_workflows/11-conscendi-guardrail-distillation.md) |
| 医療 LLM の黒箱蒸留リスク（攻撃研究） | Meditron-7B（API のみ、48,000 問合せ）→ LLaMA-3 8B（LoRA rank 8） | 危険応答率 教師 66% → 代理 86%（整合は移らない）。費用約 12 ドル | 学習 A100 40GB × 1 で約 16 GPU 時間 | [arXiv 2512.09403](https://arxiv.org/abs/2512.09403v1) | [enterprise_workflows/12](../enterprise_workflows/12-blackbox-distillation-medical-safety.md) |

## 目的 6: 商用 SLM・公開モデルの製造（モデル提供者側）

| 地域 | 事業者 | 教師 → 生徒（モデル / パラメータ数） | 成果（指標） | 成果（実行時間） | 資料 | 詳細レポート |
|---|---|---|---|---|---|---|
| 海外 | Mistral / Liquid AI / DeepSeek / Google Gemma / Meta | 各社の大型モデル → 小型モデル（例: DeepSeek-R1 671B → Qwen / Llama 1.5B〜70B） | API・ライセンスで収益化 | — | — | [distillation_platforms/15](../distillation_platforms/15-distillation-business-landscape-japan-vs-overseas.md) / [open_distilled_models/index](../open_distilled_models/index.md) |
| 海外 | Alibaba DistilQwen2.5（公開モデル系列） | Qwen2.5-14B / 32B / 72B（白箱、上位 10 logit）+ Qwen-max / GPT-4o（黒箱）→ Qwen2.5-0.5B / 1.5B / 3B / 7B | 公開モデル 4 サイズ | logit 生成は素朴な実装の 3〜5 倍速 | [arXiv DistilQwen2.5](../distillation_platforms/08-distilqwen25-alibaba-pai.md) | [distillation_platforms/08](../distillation_platforms/08-distilqwen25-alibaba-pai.md) |
| 国内 | SB Intuitions: Sarashina mini | Sarashina 460B → Sarashina mini（サイズ非公開、黒箱） | コールセンター自動応答・営業支援向け API（2025-11-28〜）。数値なし | — | — | [japan_cases/10](../japan_cases/10-non-distillation-lightweight-llms.md) |
| 国内 | ABEJA: ABEJA Qwen2.5-7B | ABEJA Qwen2.5-32B-Japanese 32B → Qwen2.5-7B-Instruct 7B（約 1/4.6、白箱 logit KL + ChatVector） | Japanese MT-Bench 7.26（同条件 CPT 7.21、元 7B 6.86） | 学習は H100 × 64。トークン数・学習時間は非公開 | [Hugging Face](https://huggingface.co/abeja/ABEJA-Qwen2.5-7b-Japanese-v0.1) / [技術ブログ](https://tech-blog.abeja.asia/entry/geniac2-distillation-pipeline-parallel) | [japan_cases/04](../japan_cases/04-abeja-geniac-qwen25-7b-distillation.md) / [11](../japan_cases/11-abeja-nemo-distillation-pipeline-parallel.md) |
| 国内 | Lightblue: R1-Distill-7B-Japanese | DeepSeek-R1-Distill-Llama-70B → DeepSeek-R1-Distill-Qwen-7B（約 1/10、黒箱 SFT） | gsm8k-ja 62% → 70%、日本語で思考する割合 48% → 94% | 学習 8 × L20 で 10 分未満 | [Lightblue](https://huggingface.co/lightblue/DeepSeek-R1-Distill-Qwen-7B-Japanese) | [japan_cases/05](../japan_cases/05-cyberagent-lightblue-r1-distill-japanese.md) |
| 国内 | サイバーエージェント / ELYZA / rinna: 日本語推論モデル | DeepSeek による蒸留済み R1-Distill-Qwen 14B / 32B への追加学習（CA）、DeepSeek-R1 / Qwen2.5-72B の探索結果 → 32B / 7B（ELYZA）、R1-Distill-Qwen-32B の ChatVector → bakeneko-32b（rinna） | ELYZA-Thinking-32B: MATH-500 0.8515、Japanese MT-Bench 9.55。rinna: Japanese MT-Bench 7.39 → 8.58 | — | [CA](https://huggingface.co/cyberagent/DeepSeek-R1-Distill-Qwen-14B-Japanese) | [japan_cases/05](../japan_cases/05-cyberagent-lightblue-r1-distill-japanese.md) / [12](../japan_cases/12-elyza-rinna-r1-japanese-reasoning-models.md) |
| 国内 | Kotoba Technologies: 日本語音声認識（Kotoba-Whisper） | whisper-large-v3 1,550M → kotoba-whisper 756M（約 1/2） | CER 14.9 → 11.6（ドメイン内で教師超え） | 6.3 倍速。長文はチャンク分割で OpenAI 逐次実装の最大 9 倍高速。学習データ 1,253 時間（v1）/ 約 1 万時間（v2） | [Hugging Face](https://huggingface.co/kotoba-tech/kotoba-whisper-v2.0) | [japan_cases/06](../japan_cases/06-kotoba-whisper-speech-distillation.md) |

## 実行時間の読み方

| 実行時間の記載の種類 | 主な事例 |
|---|---|
| 推論レイテンシの絶対値あり | Tencent（100 → 10ms）、AliExpress（46,800 → 132ms / 100 件）、Meituan MSD（35 → 37.2ms）、ByteDance（1,600 → 870ms）、LivePerson（12ms）、Convirza（約 0.1 秒）、Alibaba SQL 補完（384 → 148ms）、Amazon 経費（0.3 → 1.5 docs/s）、npj 医療（2.34 → 0.535 秒）、CONSCENDI（2.94 → 0.11 秒）、Instacart（700 → 300ms）、Phi Silica（230ms）、Sakana（19.89 tok/s）、Meta（19.2 → 50.2 tok/s）、LINE ヤフー（18.8 → 1.8ms、非蒸留） |
| 倍率・資源量のみ | LinkedIn（75 倍超）、Amazon 関連度（50 倍）、Stanford（12 倍）、Bedrock（−72%）、NVIDIA（GPU 2 → 1 枚）、JD.com（1 桁削減）、NAVER（−5.58%、QPS +18%）、富士通（11 倍）、Kotoba（6.3 倍）、Apple AFM（TTFT −37.5%） |
| 学習時間のみ | Taobao（7B 学習 10 時間）、Lightblue（10 分未満）、医療攻撃研究（約 16 GPU 時間）、PFN（計算量 1/5） |
| 記載なし | Walmart、Pinterest、Meituan 関連度、NTT 東日本、ビズリーチ、JDD、デンソーテン、Gemini Nano、SAP / Google / Microsoft 特許 ほか |

- **レイテンシ削減の幅は 2.6 倍（Alibaba SQL 補完）〜350 倍（AliExpress）**。生徒を BERT 級（100M 前後）まで落とした検索・広告の事例が最も大きく、7B → 3B のような LLM 同士の蒸留は 2〜3 倍にとどまります。
- **「追加レイテンシ」型の事例**（Meituan MSD +2.2ms、Etsy 10ms 未満、DoorDash ほぼゼロ）は、教師 LLM をオンラインから外し、生徒を既存パイプラインに足す構成です。
- **国内事例で実行時間を公表しているのは富士通（11 倍速）、Kotoba（6.3 倍速）、Sakana（19.89 tok/s）、Lightblue（学習 10 分未満）、LINE ヤフー（1.8ms、非蒸留）の 5 件**で、業務データを使った NTT 東日本・ビズリーチ・JDD は時間を報告していません。

## 限界

- 本ページは [01](01-distillation-use-cases-by-purpose.md) の再編であり、新規の検索は行っていません。
- 実行時間は原典の計測条件（GPU 種別・バッチサイズ・系列長・量子化）がそれぞれ異なるため、行をまたいだ比較はできません。
- パラメータ数の「約 1/N」は本ページの計算値で、原典に明示のない行では教師・生徒の公称サイズから求めています。MoE の教師は総パラメータ数で表記しています。
- Convirza と Grab は各詳細レポートで「蒸留ではない」と判定された事例ですが、01 との対応を保つため注記付きで残しています。
