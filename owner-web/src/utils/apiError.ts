export const getApiError = (err: unknown, fallback: string): string => {
  if (
    err !== null &&
    typeof err === 'object' &&
    'response' in err
  ) {
    const res = (err as { response: { data?: { message?: string } } }).response;
    if (res?.data?.message) return res.data.message;
  }
  return fallback;
};
