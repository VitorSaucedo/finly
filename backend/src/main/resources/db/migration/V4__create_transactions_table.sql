CREATE TYPE transaction_type AS ENUM ('INCOME', 'EXPENSE', 'TRANSFER');
CREATE TYPE transaction_status AS ENUM ('PENDING', 'COMPLETED', 'CANCELLED');

CREATE TABLE transactions (
                              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                              user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                              account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
                              category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
                              destination_account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
                              description VARCHAR(255) NOT NULL,
                              amount NUMERIC(15,2) NOT NULL,
                              type transaction_type NOT NULL,
                              status transaction_status NOT NULL DEFAULT 'COMPLETED',
                              transaction_date DATE NOT NULL,
                              notes TEXT,
                              created_at TIMESTAMP NOT NULL DEFAULT now(),
                              updated_at TIMESTAMP NOT NULL DEFAULT now()
);