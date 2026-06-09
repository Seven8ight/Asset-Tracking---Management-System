CREATE TABLE asset(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES assets(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    department_id UUID REFERENCES departments(id) ON DELETE CASCADE NOT NULL
);