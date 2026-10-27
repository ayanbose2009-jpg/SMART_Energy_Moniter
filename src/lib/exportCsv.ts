/** The backend builds the CSV from the database; this just triggers the download. */
export function exportCsv(){const a=document.createElement('a');a.href='/api/export.csv';a.download='enerwise-report.csv';a.click()}
