# 07 Strategy Card Game AI Competition 総説 (2018–2022)

## メタ情報

- **タイトル**: *Summarizing Strategy Card Game AI Competition*
- **著者**: Jakub Kowalski, Radosław Miernik
- **arXiv ID**: 2305.11814（cs.AI）、投稿 2023-05-19（v1）／ 2023-07-07（v2）
- **発表**: IEEE Conference on Games (CoG) 2023
- **対象**: Legends of Code and Magic (LOCM) を基盤とした5年間の AI 競技会の総括

## 概要

研究・アルゴリズム開発の支援を目的に設計された小規模 CCG である LOCM に基づく、**5年間の AI 競技会の総説**。LOCM は CodinGame の Community Contests、IEEE CEC / IEEE CoG における **Strategy Card Game AI Competition** で使用された。game tree search・ニューラルネット・評価関数・CCG deckbuilding など複数論文で用いられてきた。本論文はルール・運営史・参加者と手法の一覧・競技会運営の一般的助言を提示。COG 2022 版が最後の開催だが、ゲーム自体はオンライン leaderboard arena で継続プレイ可能とする。

## 手法の核心（= 競技会運営とエコシステムの総括）

> ⚠️ 以下の運営ディテール（LOCM 1.2/1.5 のルール差分、参加チーム数、手法三分類）は本文 PDF に記載と想定されるが abstract では未確認。確証は要 PDF。

- **5年間（2018–2022）の運営総括（abstract で確認）**: CodinGame コミュニティコンテスト、CEC、CoG で開催。最終回が COG 2022。
- **LOCM のルール変遷**: 複数バージョン（一般に 1.2 と 1.5 が知られる）が存在し、対戦/ドラフトの仕様改訂が行われたとされるが、各版の具体差分は abstract に記載なし。
- **毎試合カードセット生成による hardcode 封じ**: LOCM の設計思想として、各試合ごとにカードプール/ドラフトを生成し固定デッキの暗記・ハードコードを無効化する狙いがあると広く理解される。abstract は "designed with the goal of supporting research" に留まり明示はない（断定は PDF 確認後が妥当）。
- **参加チームと手法分類**: abstract は "a listing of the participant and their approaches" を述べるが、チーム数（22 か否か）や、ルールベース/探索/深層 RL の三分類の内訳は abstract では確認できない。

## 主要な結果

- **手法の系譜（年別優勝者）**: 変遷は **Coac → Chad → DrainPower → ByteRL**。最終 2022 年版の優勝が ByteRL である点は 06 の COG 2022 主張と整合。ただし各年とエージェント名の正確な対応は abstract では裏取りできず⚠️本文要確認。傾向としては初期の探索/ルールベース・ヒューリスティック優勢から、最終的に深層 RL ベースの ByteRL が制覇という「探索 → RL」のシフトが読み取れる。
- **エコシステムの継続**: COG 2022 で公式競技会は終了したが、オンライン leaderboard arena で継続利用可能。

## Pokémon TCG AI Battle Challenge への示唆

- **手法選択の地図**: CCG AI の手法スペクトラム（ルールベース/探索・game tree search/評価関数/深層 RL/deckbuilding 特化）を5年分の実戦結果とともに俯瞰できる唯一の「手法選択マップ」。PTCG の初手として、どの系統から着手すべきかの優先順位付けに直接使える。
- **「暗記を封じると RL が勝つ」転換点**: 固定デッキ・固定状況の暗記が無効化される設計下では、汎化能力を持つ深層 RL（ByteRL）が最終的に優位に立った。PTCG が多様な構築・状況を扱うなら、ハードコード/ヒューリスティック単体は頭打ちになり汎化学習が効く公算が高い。
- **評価設計の教訓**: 毎試合のカードセット生成（暗記封じ）、複数バージョン運用、leaderboard arena による継続評価といった工夫は、PTCG のリーク防止・過学習防止・公平評価に転用できる。「評価環境を固定化しすぎない」ことが、暗記でなく戦略を測る鍵。

## 限界・注意

- 本論文は総説（survey/retrospective）であり新規アルゴリズム提案ではない。手法の優劣は各年の参加者プール・ルール版に依存。
- 参加チーム数・手法三分類・年別優勝者の厳密対応・LOCM バージョン差分は abstract では未確認（本文 PDF 裏取り必須）。
- 優勝が「最も均衡的・頑健」を意味しないことは 08 が示す通り。競技会順位とゲーム理論的頑健性を同一視しない。

## 出典

- Kowalski & Miernik. *Summarizing Strategy Card Game AI Competition.* arXiv:2305.11814, IEEE CoG 2023. https://arxiv.org/abs/2305.11814
