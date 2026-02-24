CREATE TYPE installment_status AS ENUM ('PENDING', 'COMPLETED', 'CANCELLED');

CREATE TABLE installment_groups (
                                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                                    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
                                    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
                                    description VARCHAR(255) NOT NULL,
                                    total_amount NUMERIC(15,2) NOT NULL,
                                    installment_count INT NOT NULL,
                                    start_date DATE NOT NULL,
                                    notes TEXT,
                                    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE installments (
                              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                              group_id UUID NOT NULL REFERENCES installment_groups(id) ON DELETE CASCADE,
                              transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
                              installment_number INT NOT NULL,
                              amount NUMERIC(15,2) NOT NULL,
                              due_date DATE NOT NULL,
                              status installment_status NOT NULL DEFAULT 'PENDING',
                              created_at TIMESTAMP NOT NULL DEFAULT now(),
                              updated_at TIMESTAMP NOT NULL DEFAULT now()
);