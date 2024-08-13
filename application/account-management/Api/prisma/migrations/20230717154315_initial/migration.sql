CREATE SCHEMA IF NOT EXISTS auth;

CREATE OR REPLACE FUNCTION auth.jwt() RETURNS jsonb AS $$
  BEGIN
    IF current_setting('request.jwt.claims', true) IS NULL THEN
      RETURN '{}'::jsonb;
    END IF;
    RETURN current_setting('request.jwt.claims', true)::jsonb;
  END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION auth.uid() RETURNS text AS $$
  BEGIN
    IF auth.jwt() ->> 'sub' IS NULL THEN
      RETURN NULL;
    END IF;
    RETURN auth.jwt() ->> 'sub';
  END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION auth.bypass_rls_policy() RETURNS boolean AS $$
  BEGIN
    IF current_setting('app.bypass_rls', TRUE) IS NULL THEN
      RETURN FALSE;
    END IF;
    RETURN current_setting('app.bypass_rls', TRUE)::text = 'on';
  END;
$$ LANGUAGE plpgsql;

CREATE SCHEMA IF NOT EXISTS util;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE OR REPLACE FUNCTION util.uuid(prefix text) RETURNS text AS $$
BEGIN
    RETURN concat(prefix, gen_random_uuid());
END;
$$ LANGUAGE PLPGSQL VOLATILE;
