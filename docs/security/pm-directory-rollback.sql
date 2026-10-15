-- EMERGENCY ROLLBACK for docs/security/pm-directory-hardening.sql
-- Restores the previous authenticated directory read policy.
-- CAUTION: this also restores broad visibility of users' PM profiles
-- to ALL signed-in accounts until a corrected policy is deployed.
-- Keep the RPC and private helper functions installed while the
-- frontend might still call public.pm_directory_search.

BEGIN;

DO $pre$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public'
      AND tablename='pm_kullanici_profiller'
      AND policyname='pm_profil_select'
      AND cmd='SELECT'
      AND qual ILIKE '%pm_can_see_profile%'
  ) THEN
    RAISE EXCEPTION 'Expected hardened policy not found; no rollback executed';
  END IF;
END $pre$;

ALTER POLICY pm_profil_select ON public.pm_kullanici_profiller
  TO authenticated USING (true);

COMMIT;

-- Perform a complete rollback only after the frontend has stopped
-- calling the RPC. DROP public.pm_directory_search before private
-- helper functions; do not drop prematurely.
