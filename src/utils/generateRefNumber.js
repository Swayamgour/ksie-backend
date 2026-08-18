// Generates human-readable reference numbers like AWB-20260818-4821, INV-20260818-0231
export const generateRefNumber = (prefix) => {
  const date = new Date();
  const stamp = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${stamp}-${random}`;
};
