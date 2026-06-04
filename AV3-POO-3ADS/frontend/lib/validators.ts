export function isValidString(text: string): boolean {
  if (!text) return false;
  if (text.length === 0) return false;

  // Não pode começar nem terminar com espaços
  if (text !== text.trim()) return false;

  // Must contain at least one letter or number
  const temAlfanumerico = /[\p{L}\p{N}]/u.test(text);
  if (!temAlfanumerico) return false;

  // No control characters
  if (/[\x00-\x1F\x7F]/.test(text)) return false;

  return true;
}

export function formatCEP(value: string) {
  return value
    .replace(/\D/g, "")
    .replace(/^(\d{5})(\d)/, "$1-$2")
    .slice(0, 9);
}

export function formatPhone(value: string) {
  const numbers = value.replace(/\D/g, "");
  if (numbers.length <= 10) {
    return numbers.replace(/^(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3").trim().replace(/-$/, "");
  }
  return numbers.replace(/^(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3").trim().replace(/-$/, "").slice(0, 15);
}

export const UFS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", 
  "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];
