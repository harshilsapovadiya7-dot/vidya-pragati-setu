/**
 * Converts an array of objects to CSV string
 */
export function convertToCsv(data: Record<string, any>[]): string {
  if (!data || data.length === 0) {
    return '';
  }

  // Collect all unique keys from all objects to ensure comprehensive headers
  const headerSet = new Set<string>();
  data.forEach((item) => {
    Object.keys(item).forEach((key) => headerSet.add(key));
  });
  const headers = Array.from(headerSet);

  const escapeValue = (val: any): string => {
    if (val === null || val === undefined) {
      return '""';
    }

    if (val instanceof Date) {
      return `"${val.toISOString()}"`;
    }

    if (typeof val === 'object') {
      const strVal = JSON.stringify(val).replace(/"/g, '""');
      return `"${strVal}"`;
    }

    const strVal = String(val).replace(/"/g, '""');
    return `"${strVal}"`;
  };

  const headerRow = headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(',');

  const rows = data.map((item) => {
    return headers.map((header) => escapeValue(item[header])).join(',');
  });

  return [headerRow, ...rows].join('\r\n');
}

export default convertToCsv;
