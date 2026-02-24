CREATE TYPE account_type AS ENUM ('CHECKING', 'SAVINGS', 'WALLET', 'CREDIT_CARD', 'INVESTMENT');

CREATE TABLE accounts (
                          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                          name VARCHAR(100) NOT NULL,
                          type account_type NOT NULL,
                          balance NUMERIC(15,2) NOT NULL DEFAULT 0.00,
                          currency VARCHAR(3) NOT NULL DEFAULT 'BRL',
                          created_at TIMESTAMP NOT NULL DEFAULT now(),
                          updated_at TIMESTAMP NOT NULL DEFAULT now()
);