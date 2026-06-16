DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_type
        WHERE typname = 'asset_status'
    ) THEN
        CREATE TYPE asset_status AS ENUM (
            'open',
            'in use',
            'broken',
            'repaired'
        );
    END IF;
END$$;

CREATE TABLE individual_asset(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id UUID REFERENCES departments(id) ON DELETE CASCADE NOT NULL,
    asset_id UUID REFERENCES asset(id) ON DELETE CASCADE NOT NULL,
    assigned asset_status NOT NULL DEFAULT 'open',
    is_repaired BOOLEAN NOT NULL DEFAULT FALSE,
    is_broken BOOLEAN NOT NULL DEFAULT FALSE 
);