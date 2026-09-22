/**
 * Triggers native browser download for sample CSV and Excel (.xlsx) templates from backend API
 */

const getApiBaseUrl = () => {
  return import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
};

export const downloadCSVTemplate = () => {
  const link = document.createElement('a');
  link.href = `${getApiBaseUrl()}/students/import/template/csv`;
  link.setAttribute('download', 'ecoclub_students_template.csv');
  link.setAttribute('target', '_blank');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const downloadExcelTemplate = () => {
  const link = document.createElement('a');
  link.href = `${getApiBaseUrl()}/students/import/template/excel`;
  link.setAttribute('download', 'ecoclub_students_template.xlsx');
  link.setAttribute('target', '_blank');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
