# SDD progress

- Current repo: TrendAnalysisComponent (`/Users/libo/Documents/github/TrendAnalysisComponent`) on `main`
- Historical: implemented against dosiv-v2 `feat/data-item-trend` (branch discarded) and `/Users/libo/Documents/gitlab/data-item-trend` (directory removed)
- Plan: `docs/superpowers/plans/2026-09-06-data-item-trend.md`

- Repo: dosiv-v2 on feat/data-item-trend
- Package repo: /Users/libo/Documents/gitlab/data-item-trend


Task 1: complete (commits 4b825dc..b2d1777, review clean)
Task 1 minors: no .gitignore; smoke test omits RESERVE_DECIMAL; TDD RED was import miss not assertion fail; style.css export unbuilt

Task 2: complete (commits b2d1777..ecef49f, review clean)
Task 2 minors: applyPreset now unused; TIME_PRESETS test labels only; 2h preset not wired to DEFAULT_WINDOW_MS

Task 3: complete (commits ecef49f..cc05ba9, review clean)
Task 3 minors: kpiCode fallback untested; empty collectKpiId; no String(); pointName/unit always undefined; dead kpiCode in last fallback

Task 4: complete (commits cc05ba9..df75217, review clean after Important fix)

Task 5: complete (commits df75217..4de689a, review clean)
Task 5 minors: empty-series hide-threshold test; single series only in extra tests; themeTokens override untested

Task 6: complete (commits 4de689a..9436fcd, review clean)
Task 6 minors: setTrendRequest(undefined); install ignores app; empty tags still POST; rows without tag dropped

Task 7: complete (commits 9436fcd..0ea908f, review clean)
Task 7 minors: setOption merge; datetime drops seconds; NaN on empty input; chart untested; no resize

Task 8: complete (commits 0ea908f..55a6939, review clean after checkbox fix)

Task 9: complete (commits 55a6939..80f57dd, review clean after cap+race fix)

Task 10: complete (commits 80f57dd..ff2500e, review clean after Important fixes)

Task 11: complete (package 44388e0, host 6cee43b)

Task 11: complete (commits c798d14..6cee43b, review clean)
Task 11 nits: Xplat-Token only on busout prefix; empty token headers; file: needs dist build

Task 12: complete (commits 6cee43b..aa7b27a, review clean)
Task 12 nits: signal items still have 分析; no X button; pointCode dash fallback
