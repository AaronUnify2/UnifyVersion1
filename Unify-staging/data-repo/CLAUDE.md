# Unify-data — private

Aaron's personal data for the Unify app: `data/unify.json`. It is personal and
private. Never copy its contents, or text from it, into a public repository,
a public page, a commit message elsewhere, or anything published — including
the public Unify repository.

The app (AaronUnify2/Unify) writes this file itself. Edit it by hand only
when Aaron asks, and then:

- keep the shape in the app's `SPEC.md`;
- when changing a record, set its `updatedAt` and the changed fields in
  `fieldsAt` to the current time, or the app's merge may bring back the old
  value from a device's copy;
- to remove a record, delete it and add its id to `deleted` with the current
  time, for the same reason;
- write it back as `JSON.stringify(data, null, 2) + '\n'`
  (`json.dumps(data, indent=2, ensure_ascii=False) + '\n'`).

Commit straight to `main` and push. Never ask Aaron for his GitHub token, and
never write one anywhere.
