# Migration notes

The canonical save is `medifin-save-case01-v2` and requires `caseId = case01`, `caseIdentity = toy-kingdom-anderson` and `schemaVersion = 2`. A compatible old Toy Kingdom save under `medifin-case02-v1` is copied into a fresh Case 01 state and the legacy key is removed. The old Case 01 Nam Phát key is never read as Toy Kingdom; malformed or incompatible saves reset safely. Restart removes only the canonical Toy Kingdom save.
