CREATE TABLE asset_assignments(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id UUID REFERENCES department(id) ON DELETE CASCADE NOT NULL,
    asset_id UUID REFERENCES asset(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    assigned_at TIMESTAMP DEFAULT NOW(),
    returned_at TIMESTAMP
);