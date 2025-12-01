import { useMutation, useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { toast } from 'sonner-native';
import { queryKeys } from './query-keys';
import { handleError } from './utils';
import { supabase } from '@/lib/supabase/client';
import { Debt, DebtPayment, DebtSummary, DebtCategory } from '@/lib/types/debt';

/**
 * Fetch all debts, optionally filtered by search query
 * Returns debts sorted by interest rate (highest first - Avalanche method)
 */
export function useDebts(
  search?: string,
  options?: Omit<UseQueryOptions<Debt[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.debts.list(search),
    queryFn: async () => {
      let query = supabase.from('debts').select('*').order('interest_rate', { ascending: false });

      if (search && search.trim()) {
        query = query.or(`name.ilike.%${search}%,category.ilike.%${search}%`);
      }

      const { data, error } = await query;

      if (error) throw new Error(error.message);
      return data as Debt[];
    },
    ...options,
  });
}

/**
 * Fetch a single debt by ID
 */
export function useDebt(
  id: string,
  options?: Omit<UseQueryOptions<Debt | null, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.debts.detail(id),
    queryFn: async () => {
      const { data, error } = await supabase.from('debts').select('*').eq('id', id).single();

      if (error) throw new Error(error.message);
      return data as Debt;
    },
    enabled: !!id,
    ...options,
  });
}

/**
 * Fetch debt summary statistics
 */
export function useDebtSummary(
  options?: Omit<UseQueryOptions<DebtSummary, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.debts.summary(),
    queryFn: async () => {
      const { data: debts, error } = await supabase
        .from('debts')
        .select('*')
        .eq('status', 'active');

      if (error) throw new Error(error.message);

      const summary: DebtSummary = {
        total_balance: 0,
        total_original_balance: 0,
        total_minimum_payment: 0,
        total_interest_paid: 0,
        debt_count: debts?.length || 0,
        highest_rate_debt: null,
      };

      if (debts && debts.length > 0) {
        let highestRate = -1;

        for (const debt of debts) {
          summary.total_balance += Number(debt.current_balance);
          summary.total_original_balance += Number(debt.original_balance);
          summary.total_minimum_payment += Number(debt.minimum_payment);

          if (Number(debt.interest_rate) > highestRate) {
            highestRate = Number(debt.interest_rate);
            summary.highest_rate_debt = debt as Debt;
          }
        }
      }

      return summary;
    },
    ...options,
  });
}

/**
 * Fetch payment history for a specific debt
 */
export function useDebtPayments(
  debtId: string,
  options?: Omit<UseQueryOptions<DebtPayment[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.debts.payments(debtId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('debt_payments')
        .select('*')
        .eq('debt_id', debtId)
        .order('payment_date', { ascending: false });

      if (error) throw new Error(error.message);
      return data as DebtPayment[];
    },
    enabled: !!debtId,
    ...options,
  });
}

interface CreateDebtPayload {
  name: string;
  category: DebtCategory;
  current_balance: number;
  interest_rate: number;
  minimum_payment: number;
  due_date?: number;
}

/**
 * Create a new debt
 */
export function useCreateDebt() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateDebtPayload) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('debts')
        .insert({
          account_id: user.id,
          name: payload.name,
          category: payload.category,
          current_balance: payload.current_balance,
          original_balance: payload.current_balance,
          interest_rate: payload.interest_rate,
          minimum_payment: payload.minimum_payment,
          due_date: payload.due_date || 1,
          status: 'active',
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data as Debt;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.debts.all });
      // toast.success('Debt added successfully');
    },
    onError: (err: any) => handleError(err, 'Failed to add debt'),
  });
}

interface UpdateDebtPayload {
  id: string;
  name?: string;
  category?: DebtCategory;
  current_balance?: number;
  interest_rate?: number;
  minimum_payment?: number;
  due_date?: number;
}

/**
 * Update an existing debt
 */
export function useUpdateDebt() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: UpdateDebtPayload) => {
      const { data, error } = await supabase
        .from('debts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data as Debt;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: queryKeys.debts.all });
      qc.invalidateQueries({ queryKey: queryKeys.debts.detail(data.id) });
      // toast.success('Debt updated successfully');
    },
    onError: (err: any) => handleError(err, 'Failed to update debt'),
  });
}

/**
 * Delete a debt
 */
export function useDeleteDebt() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('debts').delete().eq('id', id);

      if (error) throw new Error(error.message);
      return id;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.debts.all });
      // toast.success('Debt deleted successfully');
    },
    onError: (err: any) => handleError(err, 'Failed to delete debt'),
  });
}

/**
 * Fetch debts that are due today (based on due_date matching today's day of month)
 * Excludes debts that already have a payment recorded today
 */
export function usePaymentsDue() {
  const today = new Date();
  const dayOfMonth = today.getDate();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
  const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();

  return useQuery({
    queryKey: queryKeys.debts.paymentsDue(),
    queryFn: async () => {
      // Get debts due today
      const { data: debts, error: debtsError } = await supabase
        .from('debts')
        .select('*')
        .eq('status', 'active')
        .eq('due_date', dayOfMonth);

      if (debtsError) throw new Error(debtsError.message);
      if (!debts || debts.length === 0) return [];

      // Get payments made today for these debts
      const debtIds = debts.map((d) => d.id);
      const { data: payments, error: paymentsError } = await supabase
        .from('debt_payments')
        .select('debt_id')
        .in('debt_id', debtIds)
        .gte('payment_date', todayStart)
        .lt('payment_date', todayEnd);

      if (paymentsError) throw new Error(paymentsError.message);

      // Filter out debts that already have a payment today
      const paidDebtIds = new Set(payments?.map((p) => p.debt_id) || []);
      const unpaidDebts = debts.filter((d) => !paidDebtIds.has(d.id));

      return unpaidDebts as Debt[];
    },
  });
}

/**
 * Get Set of debt IDs that have been paid today
 */
export function useTodaysPaidDebtIds() {
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
  const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();

  return useQuery({
    queryKey: queryKeys.debts.paidToday(),
    queryFn: async () => {
      const { data: payments, error } = await supabase
        .from('debt_payments')
        .select('debt_id')
        .gte('payment_date', todayStart)
        .lt('payment_date', todayEnd);

      if (error) throw new Error(error.message);

      return new Set(payments?.map((p) => p.debt_id) || []);
    },
  });
}

interface RecordPaymentPayload {
  debt_id: string;
  amount: number;
}

interface RecordPaymentResult {
  payment: DebtPayment;
  debt_paid_off: boolean;
}

/**
 * Record a payment for a debt
 * Uses edge function for atomic transaction (updates payment + debt balance)
 */
export function useRecordPayment() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: RecordPaymentPayload): Promise<RecordPaymentResult> => {
      // Use edge function for atomic operation
      const { data, error } = await supabase.functions.invoke('record-payment', {
        body: payload,
      });

      if (error) throw new Error(error.message);
      if (!data.success) throw new Error(data.error || 'Failed to record payment');

      return {
        payment: data.data as DebtPayment,
        debt_paid_off: data.debt_paid_off ?? false,
      };
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: queryKeys.debts.all });
      qc.invalidateQueries({ queryKey: queryKeys.debts.detail(data.payment.debt_id) });
      qc.invalidateQueries({ queryKey: queryKeys.debts.payments(data.payment.debt_id) });
    },
    onError: (err: any) => handleError(err, 'Failed to record payment'),
  });
}
