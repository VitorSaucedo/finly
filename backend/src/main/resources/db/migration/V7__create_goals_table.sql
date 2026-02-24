CREATE TYPE goal_status AS ENUM ('IN_PROGRESS', 'COMPLETED', 'CANCELLED');

CREATE TABLE goals (
                       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                       user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                       name VARCHAR(100) NOT NULL,
                       target_amount NUMERIC(15,2) NOT NULL,
                       current_amount NUMERIC(15,2) NOT NULL DEFAULT 0.00,
                       deadline DATE,
                       status goal_status NOT NULL DEFAULT 'IN_PROGRESS',
                       notes TEXT,
                       created_at TIMESTAMP NOT NULL DEFAULT now(),
                       updated_at TIMESTAMP NOT NULL DEFAULT now()
);