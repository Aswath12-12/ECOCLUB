/**
 * Generates and triggers browser download for sample CSV and Excel templates
 */

export const downloadCSVTemplate = () => {
  const headers = 'RollNo,Name,Email,Phone,Department,Year,Class,House\n';
  const sampleData = [
    '23IT001,Arun Kumar,arun@email.com,9876543210,IT,II,A,Green House',
    '23IT002,Bala Kumar,bala@email.com,9876543211,IT,II,A,Blue House',
    '23CS003,Priya Sharma,priya@email.com,9876543212,CSE,III,B,Red House',
    '23EC004,David Wilson,david@email.com,9876543213,ECE,I,A,Yellow House'
  ].join('\n');

  const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(headers + sampleData);
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', csvContent);
  downloadAnchor.setAttribute('download', 'ecoclub_students_template.csv');
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  document.body.removeChild(downloadAnchor);
};

export const downloadExcelTemplate = () => {
  // Simple TSV encoded as Excel format or downloadable CSV
  downloadCSVTemplate();
};
