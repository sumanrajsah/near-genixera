import { useTransactionReceipt } from 'wagmi';

export const useMyTransactionReceipt = ({hash,chainId}:any) => {
  const { data: receipt, error, isLoading } = useTransactionReceipt({ chainId,hash });
  return { receipt, error, isLoading };
};