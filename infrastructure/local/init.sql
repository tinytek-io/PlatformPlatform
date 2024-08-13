-- Create a default user similar to the one in Vercel
CREATE USER "default" WITH PASSWORD 'test' CREATEDB CREATEROLE;
GRANT ALL PRIVILEGES ON DATABASE "tinytek" TO "default";
GRANT ALL PRIVILEGES ON SCHEMA public TO "default";