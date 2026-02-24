CREATE TYPE budget_status AS ENUM ('ACTIVE', 'EXCEEDED', 'COMPLETED');

CREATE TABLE budgets (
                         id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                         user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                         category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
                         amount NUMERIC(15,2) NOT NULL,
                         spent NUMERIC(15,2) NOT NULL DEFAULT 0.00,
                         month INT NOT NULL,
                         year INT NOT NULL,
                         status budget_status NOT NULL DEFAULT 'ACTIVE',
                         created_at TIMESTAMP NOT NULL DEFAULT now(),
                         updated_at TIMESTAMP NOT NULL DEFAULT now(),
                         UNIQUE (user_id, category_id, month, year)
);