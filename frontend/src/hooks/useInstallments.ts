import { useState, useEffect } from "react";
import { installmentService } from "../services/installmentService";
import type {
  InstallmentGroupResponse,
  InstallmentRequest,
} from "../types/installment";
import type { PageResponse } from "../types/transaction";

export const useInstallments = () => {
  const [data, setData] =
    useState<PageResponse<InstallmentGroupResponse> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = async (page = 0, size = 10) => {
    try {
      setLoading(true);
      setError(null);
      const response = await installmentService.findAll(page, size);
      setData(response);
    } catch {
      setError("Failed to load installments");
    } finally {
      setLoading(false);
    }
  };

  const create = async (data: InstallmentRequest) => {
    const group = await installmentService.create(data);
    await fetchAll();
    return group;
  };

  const pay = async (installmentId: string) => {
    const installment = await installmentService.pay(installmentId);
    await fetchAll();
    return installment;
  };

  const cancel = async (groupId: string) => {
    await installmentService.cancel(groupId);
    await fetchAll();
  };

  useEffect(() => {
    fetchAll();
  }, []);

  return { data, loading, error, create, pay, cancel, refetch: fetchAll };
};
