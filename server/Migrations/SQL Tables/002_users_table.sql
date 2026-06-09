CREATE TABLE users(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    oauth BOOLEAN DEFAULT FALSE,
    oauth_provider TEXT,
    department_id UUID REFERENCES departments(id) ON DELETE CASCADE NOT NULL
);