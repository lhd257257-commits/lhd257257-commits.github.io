# 数据来源与授权说明

## 1. 数据

本页面使用 **PUBG 公开比赛数据**：圈层/红区来自聚合 SQL 快照，死亡热区来自完整 Kaggle 死亡 CSV 的独立聚合。数据来源与处理链如下：

1. **Kaggle 数据集**
   - 名称：PUBG Match Deaths and Statistics
   - 地址：https://www.kaggle.com/datasets/skihikingkevin/pubg-match-deaths
   - 页面标注许可：**CC0: Public Domain**
   - 原始数据规模：约 720,000 场比赛、6500 万条死亡记录、约 20GB
   - 本项目下载的实际档案：约 **4.4GB zip**，其中 5 个死亡 CSV 约 **9.75GB**
   - 本项目实际聚合的死亡权重：**64,586,279**

2. **聚合 SQL 快照**
   - 仓库：https://github.com/zcyoop/pubg_data_analysis
   - 文件：`pubg.sql`
   - 本项目使用其中的 `first_circle`、`zc_lastpoisoncircle`、`zk_redzone` 三张聚合表的数值，重新解析为 `data/atlas.json`
   - **没有复制该仓库的代码、页面或图片**

3. **参考仓库**
   - https://github.com/KaiserW/pubg-data
   - 该仓库已归档，且**没有 LICENSE 文件**；本项目没有复制其代码、地图图片、音乐或 notebook 输出

4. **死亡热区处理**
   - 使用 DuckDB 分块读取 5 个 `kill_match_stats_final_*.csv`
   - 按 `map × time × killed_by × victim_position_x/y` 聚合到 100×100 网格
   - 输出 `data/deaths.json`（约 3.1MB）
   - 没有上传原始 CSV，也没有把 20GB 数据塞进浏览器

## 2. 数值与地图

- 页面中的热区是**聚合计数**，不是原始玩家轨迹，也不是实时对局数据。
- 死亡热区是 100×100 网格；死因是关键词分类，不是官方武器分类。
- “权重”是聚合表中的计数；由于聚合口径无法完全核验，页面不把它解释为精确玩家数。
- 底图是**原创示意地图**，只使用 0—1000 坐标空间、网格、分区编号和抽象地形；**没有使用 PUBG 官方地图素材**。
- 页面没有使用 PUBG Logo、角色、武器图标或音乐。

## 3. 风险

- Kaggle 页面标为 CC0，但数据描述称其抓取自 `pubg.op.gg`，可能涉及第三方 TOS；商用前应做进一步法律审查。
- PUBG 名称、地图名称与相关商标归其权利人；本项目使用仅用于识别数据域，不代表官方或获得授权。
- 聚合 SQL 仓库未见 LICENSE；本项目只使用数值事实并做了独立解析；公开发布前建议联系作者确认。
- 2018 年数据存在版本过时与低分段种子偏差；不能作为当前战术结论或商业决策依据。

## 4. 使用建议

- 研究/教学/个人作品集使用；
- 公开发布时保留本说明、标注非官方、不要使用官方地图/音乐/Logo；
- 商用前取得数据、商标与地图素材的必要授权；
- 如需精确报点或实时分析，接入官方/授权数据源。
