create TYPE IF NOT EXISTS asset_status AS ENUM('open','in use','broken','repaired')

CREATE TABLE individual_asset(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id UUID REFERENCES departments(id) ON DELETE CASCADE NOT NULL
    asset_id UUID REFERENCES assets(id) ON DELETE CASCADE NOT NULL,
    assigned asset_status DEFAULT 'open' NOT NULL,
    is_repaired TEXT DEFAULT TRUE NOT NULL,
    is_broken BOOLEAN DEFAULT FALSE NOT NULL,
);