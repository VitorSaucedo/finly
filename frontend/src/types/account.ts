export type AccountType =
  | "CHECKING"
  | "SAVINGS"
  | "WALLET"
  | "CREDIT_CARD"
  | "INVESTMENT";

export interface AccountResponse {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  createdAt: string;
}

export interface AccountRequest {
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
}
