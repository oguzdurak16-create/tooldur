export function parseLocalizedNumber(value: string): number {
    return parseFloat(String(value ?? '').replace(',', '.').trim());
  }
  
  export function formatSmartNumber(
    value: number,
    locale = 'tr-TR',
    maxFractionDigits = 10
  ): string {
    if (!Number.isFinite(value)) return '';
  
    if (value !== 0 && (Math.abs(value) < 0.000001 || Math.abs(value) > 999999999)) {
      return value.toExponential(6);
    }
  
    return new Intl.NumberFormat(locale, {
      maximumFractionDigits: maxFractionDigits,
      minimumFractionDigits: 0,
    }).format(value);
  }
  
  export function formatCompactNumber(
    value: number,
    locale = 'tr-TR',
    maxFractionDigits = 6
  ): string {
    if (!Number.isFinite(value)) return '';
  
    if (value !== 0 && (Math.abs(value) < 0.0001 || Math.abs(value) > 999999)) {
      return value.toExponential(4);
    }
  
    return new Intl.NumberFormat(locale, {
      maximumFractionDigits: maxFractionDigits,
    }).format(value);
  }
  
  export async function copyTextSafe(text: string) {
    if (!text) return false;
  
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }