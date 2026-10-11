# Source recovery

The owner created `threebeat/Camp-Collector` as an empty repository. The game was recovered from its existing private Site at v12, commit `63856da45db5bd3d70ab3cfb85f7ea3e096ec1bd`.

`archives/v12-source-history.bundle` retains the original Git history, including the previously generated build outputs. To inspect that history with ordinary Git:

```sh
git clone archives/v12-source-history.bundle recovered-v12
```

The current source and future development live in this repository. `dist/` is generated and excluded from new source commits. No player saves or credentials were imported. `tests/fixtures/v6-save.json` is the pre-existing synthetic migration test fixture.

The existing Sites remote, project identifier, D1 binding, and access rules are preserved. The repository is public because that is the repository the owner supplied; the game deployment remains private.
