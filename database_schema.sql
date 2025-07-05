-- First, drop existing tables to remove foreign key constraints
DROP TABLE IF EXISTS lobbies;
DROP TABLE IF EXISTS users;

-- Create USERS table with self-generated UUID (no reference to auth.users)
CREATE TABLE users (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  elo integer default 1000,
  created_at timestamp with time zone default timezone('utc', now())
);

-- Create LOBBIES table with name column
CREATE TABLE lobbies (
  id uuid primary key default gen_random_uuid(),
  host_id uuid references users(id) on delete cascade,
  guest_id uuid references users(id) on delete set null,
  name text not null,
  is_private boolean not null default false,
  password text,
  status text not null default 'waiting',
  created_at timestamp with time zone default timezone('utc', now())
);

-- Add indexes for better performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_lobbies_status ON lobbies(status);
CREATE INDEX idx_lobbies_host_id ON lobbies(host_id); 