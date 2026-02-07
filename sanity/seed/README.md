# Sample Data Import

This folder contains minimal sample documents for the Museum Universe schema.

## Import (manual)
1) Ensure you are in the project root.
2) Run:

```bash
npx sanity dataset import sanity/seed/sample-data.ndjson production --replace
```

Notes:
- Use a different dataset name if you are not using `production`.
- `--replace` will overwrite documents with matching `_id` values.
- After import, open `/studio` and confirm all five types appear.
