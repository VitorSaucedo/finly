import { useState, useEffect } from "react";
import { accountService } from "../services/accountService";
import type { AccountResponse, AccountRequest } from "../types/account";

export const useAccounts = () => {
  const [accounts, setAccounts] = useState<AccountResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await accountService.findAll();
      setAccounts(data);
    } catch {
      setError("Failed to load accounts");
    } finally {
      setLoading(false);
    }
  };

  const create = async (data: AccountRequest) => {
    const account = await accountService.create(data);
    setAccounts((prev) => [...prev, account]);
    return account;
  };

  const update = async (id: string, data: AccountRequest) => {
    const account = await accountService.update(id, data);
    setAccounts((prev) => prev.map((a) => (a.id === id ? account : a)));
    return account;
  };

  const remove = async (id: string) => {
    await accountService.delete(id);
    setAccounts((prev) => prev.filter((a) => a.id !== id));
  };

  useEffect(() => {
    fetchAll();
  }, []);

  return {
    accounts,
    loading,
    error,
    create,
    update,
    remove,
    refetch: fetchAll,
  };
};
