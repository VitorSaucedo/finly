import { useState, useEffect } from "react";
import { transactionService } from "../services/transactionService";
import type {
  TransactionResponse,
  TransactionRequest,
  PageResponse,
} from "../types/transaction";
import type { TransactionParams } from "../services/transactionService";

export const useTransactions = (params: TransactionParams = {}) => {
  const [data, setData] = useState<PageResponse<TransactionResponse> | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = async (fetchParams: TransactionParams = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await transactionService.findAll({
        ...params,
        ...fetchParams,
      });
      setData(response);
    } catch {
      setError("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  const create = async (data: TransactionRequest) => {
    const transaction = await transactionService.create(data);
    await fetchAll();
    return transaction;
  };

  const update = async (id: string, data: TransactionRequest) => {
    const transaction = await transactionService.update(id, data);
    await fetchAll();
    return transaction;
  };

  const remove = async (id: string) => {
    await transactionService.delete(id);
    await fetchAll();
  };

  useEffect(() => {
    fetchAll();
  }, []);

  return { data, loading, error, create, update, remove, refetch: fetchAll };
};
