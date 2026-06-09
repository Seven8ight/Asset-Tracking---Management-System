CREATE TABLE role_permissions(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE NOT NULL,
    role_id UUID REFERENCES role(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);