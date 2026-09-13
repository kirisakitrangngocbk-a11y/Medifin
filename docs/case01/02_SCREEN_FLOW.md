# Case 01 screen flow

`0 → 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11 → 12`

Screen 2 requires exactly 3 of 7 dossiers; four stay locked. Screen 3 requires exactly 2 of 7 questions. Screen 5 requires exactly 1 of 7 questions. Screen 6 requires one diagnosis and 1–3 citable evidence when any is available; if none is available, an unsupported diagnosis can still continue. Screen 7 chooses one treatment, screen 8 one timing, screen 9 exactly three priorities. Screen 10 confirms each of seven factual updates in order. Screen 11 confirms reassessment once.

The evidence name opens a keyboard-accessible modal. The modal has a separate “Dùng làm bằng chứng” / “Bỏ chọn” action. Reading does not select. The notebook can be opened from any later screen, but selection actions exist only while diagnosing or reassessing.

The menu is the initial view after every reload. It exposes playable Case 01 and a genuinely disabled Case 02 Incoming card. The canonical save is `medifin-save-case01-v2`; an old Toy Kingdom `case02` save is migrated only when its identity is compatible. An old Nam Phát save is discarded/ignored and never loaded as Toy Kingdom.
