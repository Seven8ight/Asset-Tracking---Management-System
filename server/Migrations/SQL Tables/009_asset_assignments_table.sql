CREATE TABLE asset_assignments(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id UUID REFERENCES departments(id) ON DELETE CASCADE NOT NULL,
    asset_id UUID REFERENCES individual_asset(id) ON DELETE CASCADE NOT NULL UNIQUE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    assigned_at TIMESTAMP DEFAULT NOW(),
    returned_at TIMESTAMP
);