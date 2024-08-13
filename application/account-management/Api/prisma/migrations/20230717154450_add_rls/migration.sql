-- Enable Row Level Security
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Authenticator" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Email" ENABLE ROW LEVEL SECURITY;

-- Force Row Level Security for table owners
ALTER TABLE "User" FORCE ROW LEVEL SECURITY;
ALTER TABLE "Authenticator" FORCE ROW LEVEL SECURITY;
ALTER TABLE "Email" FORCE ROW LEVEL SECURITY;

-- Create Row Level Security Policies
CREATE POLICY "user_update_own_details"
    ON "User" FOR ALL
    USING (auth.uid() = "id");

CREATE POLICY "user_update_own_authenticators"
    ON "Authenticator" FOR ALL
    USING (auth.uid() = "userId");

CREATE POLICY "user_update_own_emails"
    ON "Email" FOR ALL
    USING (auth.uid() = "userId");

-- Create Policies to bypass RLS (optional)
CREATE POLICY "bypass_rls_policy_users"
    ON "User"
    USING (auth.bypass_rls_policy());

CREATE POLICY "bypass_rls_policy_authenticators"
    ON "Authenticator"
    USING (auth.bypass_rls_policy());

CREATE POLICY "bypass_rls_policy_emails"
    ON "Email"
    USING (auth.bypass_rls_policy());
