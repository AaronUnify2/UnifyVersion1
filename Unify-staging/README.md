# Unify — staging copy (not for main)

A holding copy of the new Unify app while its own repositories are created.
It is **not** meant to be merged into `main`.

- `app/` → becomes the public **AaronUnify2/Unify** repository. Its `vendor/`
  folder is left out here: it is an exact copy of ProcessHub's `vendor/`
  (checksums in `app/VENDOR-README.md`).
- `data-repo/` → becomes the private **AaronUnify2/Unify-data** repository
  (an empty starting file — no personal data).

Once both repositories exist, the app goes there and this folder is deleted
from this branch.
