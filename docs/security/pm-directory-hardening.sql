-- MANUAL DEPLOYMENT ONLY. Do not run before the matching Tooldur frontend is live.
-- Phase 1: deploy the frontend branch with its legacy fallback.
-- Phase 2: execute this SQL in one transaction and test owner/member/invite flows.
-- Phase 3: remove the frontend compatibility fallback in a later release.
-- No user profile data is modified.

BEGIN;

CREATE SCHEMA IF NOT EXISTS tool_private;
REVOKE ALL ON SCHEMA tool_private FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA tool_private TO authenticated;

-- Private helper: RLS-related lookups must not recurse through other RLS policies.
-- The definer MUST be the trusted database owner. Caller identity is checked
-- against auth.uid() inside the function. The private schema is not exposed.
CREATE OR REPLACE FUNCTION tool_private.pm_can_see_profile(p_uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT (SELECT auth.uid()) IS NOT NULL AND (
    p_uid = (SELECT auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.pm_projeler p
      WHERE (
        p.sahip_uid = p_uid
        OR EXISTS (
          SELECT 1 FROM public.pm_proje_uyeler target_membership
          WHERE target_membership.proje_id = p.id AND target_membership.user_id = p_uid
        )
      )
      AND (
        p.sahip_uid = (SELECT auth.uid())
        OR EXISTS (
          SELECT 1 FROM public.pm_proje_uyeler own_membership
          WHERE own_membership.proje_id = p.id
            AND own_membership.user_id = (SELECT auth.uid())
        )
      )
    )
    OR EXISTS (
      SELECT 1
      FROM public.pm_projeler p
      JOIN public.pm_davetler invite ON invite.proje_id = p.id
      JOIN auth.users recipient ON recipient.id = (SELECT auth.uid())
      WHERE p.sahip_uid = p_uid
        AND lower(invite.email) = lower(recipient.email)
    )
  );
$$;

-- Limit candidate lookup to the owner of the project being edited.
-- A project owner may search matching directory records, not download
-- the complete directory in one request; further rate limiting is advised.
CREATE OR REPLACE FUNCTION tool_private.pm_directory_lookup(
  p_proje_id uuid,
  p_query text
)
RETURNS TABLE(uid uuid, display_name text, email text, photo_url text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT person.uid, person.display_name, person.email, person.photo_url
  FROM public.pm_kullanici_profiller person
  WHERE (SELECT auth.uid()) IS NOT NULL
    AND char_length(trim(coalesce(p_query, ''))) BETWEEN 3 AND 80
    AND EXISTS (
      SELECT 1 FROM public.pm_projeler p
      WHERE p.id = p_proje_id
        AND p.sahip_uid = (SELECT auth.uid())
    )
    AND (
      position(lower(trim(p_query)) IN lower(coalesce(person.display_name, ''))) > 0
      OR lower(person.email) = lower(trim(p_query))
    )
  ORDER BY person.display_name NULLS LAST, person.uid
  LIMIT 10;
$$;

REVOKE ALL ON FUNCTION tool_private.pm_can_see_profile(uuid)
  FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION tool_private.pm_directory_lookup(uuid,text)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION tool_private.pm_can_see_profile(uuid)
  TO authenticated;
GRANT EXECUTE ON FUNCTION tool_private.pm_directory_lookup(uuid,text)
  TO authenticated;

-- The public RPC is SECURITY INVOKER. It delegates to a private, checked
-- function. This avoids publishing a SECURITY DEFINER endpoint.
CREATE OR REPLACE FUNCTION public.pm_directory_search(
  p_proje_id uuid,
  p_query text
)
RETURNS TABLE(uid uuid, display_name text, email text, photo_url text)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT * FROM tool_private.pm_directory_lookup(p_proje_id, p_query);
$$;

REVOKE ALL ON FUNCTION public.pm_directory_search(uuid,text)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.pm_directory_search(uuid,text)
  TO authenticated;

DO $preflight$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'pm_kullanici_profiller'
      AND policyname = 'pm_profil_select'
      AND cmd = 'SELECT'
      AND roles::text = '{authenticated}'
      AND qual = 'true'
  ) THEN
    RAISE EXCEPTION 'Unexpected pm profile RLS state. No changes made.';
  END IF;
END $preflight$;

ALTER POLICY pm_profil_select ON public.pm_kullanici_profiller
  TO authenticated
  USING (tool_private.pm_can_see_profile(uid));

DO $verify$
BEGIN
  IF has_function_privilege('anon','public.pm_directory_search(uuid,text)','EXECUTE')
     OR NOT has_function_privilege('authenticated','public.pm_directory_search(uuid,text)','EXECUTE')
  THEN
    RAISE EXCEPTION 'RPC role checks failed';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public'
      AND tablename='pm_kullanici_profiller' AND policyname='pm_profil_select'
      AND qual ILIKE '%pm_can_see_profile%'
  ) THEN
    RAISE EXCEPTION 'pm profile RLS validation failed';
  END IF;
END $verify$;

COMMIT;

-- POST-DEPLOY CHECKS (run separately using test accounts):
-- 1) Unauthenticated direct SELECT from both profile tables -> 0 rows.
-- 2) Ordinary user SELECT from pm_kullanici_profiller -> only own and shared-project records.
-- 3) Project owner opens project, searches for 3+ chars, and invites new user.
-- 4) Pending invitee sees inviter; after acceptance all team members appear.
-- 5) Non-owner call to pm_directory_search -> no candidate records.
-- 6) Admin/Forum and public tools continue to work.
-- 7) Supabase security advisors; Vercel runtime logs.
