# Tooldur project-directory privacy hardening

Status: **STAGED ON A NON-PRODUCTION BRANCH. NOTHING DEPLOYS AUTOMATICALLY.**

## Why

Authenticated users can currently read all rows in public.pm_kullanici_profiller,
including email addresses. The member search autocomplete depends on that access.
A direct RLS lockdown would break name/email invitation search.

## Change set

- Frontend member search requests the public.pm_directory_search RPC with the
  active project ID and entered query.
- RPC is SECURITY INVOKER. A private SECURITY DEFINER implementation checks
  auth.uid() and verifies the requester owns the project before returning
  at most ten matching users.
- Query length between 3 and 80 characters is enforced server side.
- A private RLS helper lets users read their own PM record, colleagues belonging
  to a shared project, and inviters whose invitation is pending.
- The existing frontend search is retained ONLY as a temporary missing-RPC fallback
  for the release ordering; it should be removed after the DB migration is verified.

## Safe release order

1. Review the SQL function owner/security settings and inspect existing RLS.
2. Merge frontend changes, run CI and deploy production. With the RPC absent,
   the old search code path still works (PGRST202 fallback).
3. Take a database schema backup and a snapshot of current pm_profil_select.
4. Execute pm-directory-hardening.sql in Supabase SQL Editor as a single transaction.
5. Test with real, consenting accounts: owner search, invitation, member view,
   ordinary account privacy, administrator/forum use, and anonymous denial.
6. Inspect database advisors and runtime errors.
7. Remove the legacy fallback from the frontend in a separate release.
8. If the member search breaks, run pm-directory-rollback.sql; it restores the
   old wide-read policy, so the privacy regression must be addressed promptly.

## Limitations / security residuals

- An authorized project owner may still enumerate names and matching email
  addresses through multiple searches. Consider rate limits, minimum-length
  changes, blind email invitations, and privacy consent before broad public use.
- A 2-character query returns no RPC results. Keep typing 3+ characters.
- Tests require real project owner, member, outsider and invitation sessions.
  PostgreSQL GUC impersonation tests are not a substitute for live-client tests.
- Private SECURITY DEFINER functions must remain in the non-exposed schema.
  Their execution grants and function owner must be reviewed before release.
- Existing tool data, current schema functions, and production deployment are
  not changed by staging this branch.
- This is deliberately a manual SQL patch under docs/security, not an
  automatically executed migration.

## Manual files

- pm-directory-hardening.sql — controlled production cutover
- pm-directory-rollback.sql — restore previous read permission if needed
