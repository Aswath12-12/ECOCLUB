import React, { useState } from 'react';
import { Upload, FileSpreadsheet, Download, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Alert } from '../common/Alert';
import { studentService } from '../../services/services';
import { downloadCSVTemplate } from '../../utils/templateGenerators';

export const ImportPreviewModal = ({ isOpen, onClose, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [alert, setAlert] = useState(null);

  const resetState = () => {
    setFile(null);
    setIsParsing(false);
    setIsImporting(false);
    setPreviewData(null);
    setAlert(null);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreviewData(null);
      setAlert(null);
    }
  };

  const handleUploadAndPreview = async () => {
    if (!file) {
      setAlert({ type: 'error', message: 'Please select a CSV or Excel file to preview.' });
      return;
    }

    const ext = file.name.split('.').pop().toLowerCase();
    const formData = new FormData();
    formData.append('file', file);

    setIsParsing(true);
    setAlert(null);

    try {
      let res;
      if (ext === 'csv') {
        res = await studentService.previewCSV(formData);
      } else if (ext === 'xlsx' || ext === 'xls') {
        res = await studentService.previewExcel(formData);
      } else {
        throw new Error('Unsupported file format. Please upload .csv or .xlsx');
      }

      if (res.success && res.data) {
        setPreviewData(res.data);
      } else {
        throw new Error(res.message || 'Failed to parse file.');
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.message });
    } finally {
      setIsParsing(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!previewData || !previewData.preview) return;

    const validStudents = previewData.preview
      .filter((row) => row.isValid)
      .map((row) => ({
        rollNo: row.rollNo,
        name: row.name,
        email: row.email,
        phone: row.phone,
        department: row.department,
        year: row.year,
        className: row.className,
        houseId: row.houseId
      }));

    if (validStudents.length === 0) {
      setAlert({ type: 'error', message: 'No valid rows available to import.' });
      return;
    }

    setIsImporting(true);
    setAlert(null);

    try {
      const res = await studentService.confirmImport(validStudents);
      if (res.success) {
        onSuccess(res.message || `Imported ${validStudents.length} students successfully.`);
        handleClose();
      } else {
        throw new Error(res.message || 'Failed to import students.');
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.message });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Bulk Student Import (CSV / Excel)"
      subtitle="Upload student spreadsheet, validate rows, and preview before committing to database."
      maxWidth="max-w-4xl"
    >
      <div className="space-y-5">
        {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

        {/* Step 1: Upload or Download Template */}
        {!previewData && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-4 bg-eco-50/70 border border-eco-200/80 rounded-2xl gap-3">
              <div>
                <p className="text-sm font-semibold text-eco-900">Need the formatted column template?</p>
                <p className="text-xs text-eco-700">Columns: RollNo, Name, Email, Phone, Department, Year, Class, House</p>
              </div>
              <button
                type="button"
                onClick={downloadCSVTemplate}
                className="inline-flex items-center justify-center gap-2 px-3.5 py-2 bg-white border border-eco-300 text-eco-800 rounded-xl text-xs font-semibold hover:bg-eco-100/50 transition-colors shadow-xs shrink-0 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Template (.csv)</span>
              </button>
            </div>

            <div className="border-2 border-dashed border-slate-200 hover:border-eco-400 rounded-2xl p-6 sm:p-8 text-center transition-colors bg-slate-50/50">
              <input
                type="file"
                id="bulk-import-file"
                accept=".csv, .xlsx, .xls"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="bulk-import-file"
                className="cursor-pointer flex flex-col items-center justify-center space-y-3"
              >
                <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-slate-200 flex items-center justify-center text-eco-600">
                  <FileSpreadsheet className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-slate-700 hover:text-eco-600">
                    {file ? file.name : 'Click to select CSV or Excel (.xlsx) file'}
                  </span>
                  <p className="text-xs text-slate-400 mt-1">Maximum file size: 10MB</p>
                </div>
              </label>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                disabled={!file || isParsing}
                onClick={handleUploadAndPreview}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-eco-600 text-white rounded-xl text-sm font-semibold hover:bg-eco-700 disabled:opacity-50 transition-all shadow-xs cursor-pointer"
              >
                {isParsing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                <span>Parse & Preview Records</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Preview & Validation Table */}
        {previewData && (
          <div className="space-y-4">
            {/* Stats Summary Bar */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-center">
              <div>
                <p className="text-xs text-slate-500 font-medium">Total Rows</p>
                <p className="text-lg sm:text-xl font-bold text-slate-800">{previewData.totalRows}</p>
              </div>
              <div>
                <p className="text-xs text-emerald-600 font-medium">Valid Ready</p>
                <p className="text-lg sm:text-xl font-bold text-emerald-600">{previewData.validCount}</p>
              </div>
              <div>
                <p className="text-xs text-rose-600 font-medium">Errors / Skipped</p>
                <p className="text-lg sm:text-xl font-bold text-rose-600">{previewData.invalidCount}</p>
              </div>
            </div>

            {/* Preview Records List */}
            <div className="max-h-[380px] overflow-y-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 uppercase sticky top-0 border-b border-slate-200 font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Row</th>
                    <th className="py-2.5 px-3">Roll No</th>
                    <th className="py-2.5 px-3">Name</th>
                    <th className="py-2.5 px-3 hidden sm:table-cell">Dept / Class</th>
                    <th className="py-2.5 px-3">House</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {previewData.preview.map((row) => (
                    <tr
                      key={row.rowNumber}
                      className={row.isValid ? 'hover:bg-slate-50/70' : 'bg-rose-50/40 hover:bg-rose-50/70'}
                    >
                      <td className="py-2.5 px-3 font-mono text-slate-400">#{row.rowNumber}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">{row.rollNo || '—'}</td>
                      <td className="py-2.5 px-3 text-slate-700">{row.name || '—'}</td>
                      <td className="py-2.5 px-3 text-slate-600 hidden sm:table-cell">
                        {row.department} {row.year}-{row.className}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-medium text-slate-700">{row.houseName || row.houseInput || '—'}</span>
                      </td>
                      <td className="py-2.5 px-3">
                        {row.isValid ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Valid
                          </span>
                        ) : (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 text-rose-600 font-medium">
                              <AlertCircle className="w-3.5 h-3.5" /> Error
                            </span>
                            <div className="text-[10px] text-rose-700 font-normal">
                              {row.errors.join(', ')}
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPreviewData(null)}
                className="w-full sm:w-auto px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Re-upload Different File
              </button>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 sm:flex-none px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={previewData.validCount === 0 || isImporting}
                  onClick={handleConfirmImport}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-eco-600 text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-eco-700 disabled:opacity-50 transition-all shadow-xs cursor-pointer"
                >
                  {isImporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>Confirm & Import ({previewData.validCount}) Students</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
