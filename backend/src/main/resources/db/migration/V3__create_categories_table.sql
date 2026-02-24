CREATE TYPE category_type AS ENUM ('INCOME', 'EXPENSE');

CREATE TABLE categories (
                            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                            name VARCHAR(100) NOT NULL,
                            type category_type NOT NULL,
                            color VARCHAR(7),
                            icon VARCHAR(50),
                            is_default BOOLEAN NOT NULL DEFAULT false,
                            created_at TIMESTAMP NOT NULL DEFAULT now()
);