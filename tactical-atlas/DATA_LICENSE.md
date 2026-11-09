# Data licensing and provenance

This repository contains **aggregated** data, not raw match data.

## `data/deaths.json`

- Derived from the public Kaggle dataset **PUBG Match Deaths and Statistics**:
  https://www.kaggle.com/datasets/skihikingkevin/pubg-match-deaths
- The Kaggle dataset page labels the data **CC0: Public Domain**.
- The aggregation was performed independently with DuckDB:
  - 5 `kill_match_stats_final_*.csv` files
  - 64,586,279 death records
  - grouped into a 100×100 grid by map, time phase, and cause
- No player names or account IDs are included.
- The data description says it was scraped from `pubg.op.gg`; third-party TOS may apply.

## `data/atlas.json`

- Numeric aggregates for first circle / final circle / red zone.
- Derived from a public SQL snapshot:
  https://github.com/zcyoop/pubg_data_analysis/blob/master/pubg.sql
- That repository has **no LICENSE file**. Only numeric facts are used and re-parsed;
  no code, images, or page content were copied.
- If you republish this repository, confirm the data provenance or replace this file
  with independently computed aggregates.

## Screenshots and map

- `shots/` are screenshots of the original site in this repository.
- The map base is an original schematic; it does **not** use PUBG official map art,
  logo, music, characters, or weapon icons.
- PUBG and related names/trademarks belong to their respective owners. This project is
  an unofficial research/teaching/portfolio prototype, not an official product.

## Raw data

Raw 20GB Kaggle data, CSV chunks, zip files, and Kaggle credentials are intentionally
excluded from this repository. Do not commit them.
