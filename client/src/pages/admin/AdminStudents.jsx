import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Search,
  Filter,
  UserPlus,
  FileSpreadsheet,
  Edit2,
  ShieldAlert,
  Trash2,
  CheckCircle2,
  Loader2,
  X,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  CheckSquare,
  Square
} from 'lucide-react';
import { studentService, houseService } from '../../services/services';
import { HouseBadge, StatusBadge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';
import { ImportPreviewModal } from '../../components/import/ImportPreviewModal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Alert } from '../../components/common/Alert';
import { DEPARTMENTS, YEARS, CLASSES } from '../../utils/constants';

export const AdminStudents = () => {
  const location = useLocation();

  // State for student data & query
  const [students, setStudents] = useState([]);
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  // Filters
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState('');
  const [className, setClassName] = useState('');
  const [houseId, setHouseId] = useState('');
  const [isActiveFilter, setIsActiveFilter] = useState('');

  // Bulk Selection
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkHouseModal, setBulkHouseModal] = useState(false);
  const [selectedTargetHouse, setSelectedTargetHouse] = useState('');
  const [isBulkAssigning, setIsBulkAssigning] = useState(false);

  // Modals
  const [addEditModalOpen, setAddEditModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [confirmToggleModal, setConfirmToggleModal] = useState({ open: false, student: null });
  const [confirmDeleteModal, setConfirmDeleteModal] = useState({ open: false, student: null });
  const [confirmBulkDeleteModal, setConfirmBulkDeleteModal] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Single Student Form State
  const [form, setForm] = useState({
    rollNo: '',
    name: '',
    email: '',
    phone: '',
    department: 'IT',
    year: 'II',
    className: 'A',
    houseId: ''
  });
  const [formLoading, setFormLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  // Load houses once
  useEffect(() => {
    const fetchHouses = async () => {
      try {
        const res = await houseService.getHouses();
        if (res.success) {
          setHouses(res.data.houses);
          if (res.data.houses.length > 0) {
            setForm((prev) => ({ ...prev, houseId: res.data.houses[0]._id }));
            setSelectedTargetHouse(res.data.houses[0]._id);
          }
        }
      } catch (err) {
        console.error('Failed to load houses:', err);
      }
    };
    fetchHouses();
  }, []);

  // Check URL query actions (?action=add or ?action=import)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const action = params.get('action');
    if (action === 'add') {
      openAddModal();
    } else if (action === 'import') {
      setImportModalOpen(true);
    }
  }, [location.search]);

  // Fetch Students on query change
  const fetchStudents = async (targetPage = pagination.page) => {
    try {
      setLoading(true);
      const res = await studentService.getStudents({
        page: targetPage,
        limit: pagination.limit,
        search,
        department: department || undefined,
        year: year || undefined,
        className: className || undefined,
        houseId: houseId || undefined,
        isActive: isActiveFilter !== '' ? isActiveFilter : undefined
      });

      if (res.success) {
        setStudents(res.data.students);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to load students' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents(1);
    setSelectedIds([]);
  }, [search, department, year, className, houseId, isActiveFilter]);

  // Handle Form open / submit
  const openAddModal = () => {
    setEditingStudent(null);
    setForm({
      rollNo: '',
      name: '',
      email: '',
      phone: '',
      department: 'IT',
      year: 'II',
      className: 'A',
      houseId: houses[0]?._id || ''
    });
    setAddEditModalOpen(true);
  };

  const openEditModal = (student) => {
    setEditingStudent(student);
    setForm({
      rollNo: student.rollNo,
      name: student.name,
      email: student.email || '',
      phone: student.phone || '',
      department: student.department,
      year: student.year,
      className: student.className,
      houseId: student.houseId?._id || student.houseId || houses[0]?._id
    });
    setAddEditModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setAlert(null);

    try {
      if (editingStudent) {
        // Update student
        const res = await studentService.updateStudent(editingStudent._id, form);
        if (res.success) {
          setAlert({ type: 'success', message: 'Student updated successfully!' });
          setAddEditModalOpen(false);
          fetchStudents(pagination.page);
        }
      } else {
        // Create new student
        const res = await studentService.createStudent(form);
        if (res.success) {
          setAlert({
            type: 'success',
            message: 'Student created successfully with default password (eocsxcce)!'
          });
          setAddEditModalOpen(false);
          fetchStudents(1);
        }
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.message });
    } finally {
      setFormLoading(false);
    }
  };

  // Toggle student active status
  const handleToggleStatusConfirm = async () => {
    if (!confirmToggleModal.student) return;
    try {
      const res = await studentService.toggleStudentStatus(confirmToggleModal.student._id);
      if (res.success) {
        setAlert({ type: 'success', message: res.message });
        setConfirmToggleModal({ open: false, student: null });
        fetchStudents(pagination.page);
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.message });
    }
  };

  // Single Student Delete Handler
  const handleDeleteConfirm = async () => {
    if (!confirmDeleteModal.student) return;
    try {
      const res = await studentService.deleteStudent(confirmDeleteModal.student._id);
      if (res.success) {
        setAlert({ type: 'success', message: res.message });
        setConfirmDeleteModal({ open: false, student: null });
        fetchStudents(pagination.page);
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.message });
    }
  };

  // Bulk Delete Handler
  const handleBulkDeleteConfirm = async () => {
    if (selectedIds.length === 0) return;
    setIsBulkDeleting(true);
    try {
      const res = await studentService.bulkDeleteStudents(selectedIds);
      if (res.success) {
        setAlert({ type: 'success', message: res.message });
        setConfirmBulkDeleteModal(false);
        setSelectedIds([]);
        fetchStudents(pagination.page);
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.message });
    } finally {
      setIsBulkDeleting(false);
    }
  };

  // Bulk selection handlers
  const handleSelectAll = () => {
    if (selectedIds.length === students.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(students.map((s) => s._id));
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkAssignSubmit = async () => {
    if (!selectedTargetHouse || selectedIds.length === 0) return;
    setIsBulkAssigning(true);
    try {
      const res = await studentService.bulkAssignHouse(selectedIds, selectedTargetHouse);
      if (res.success) {
        setAlert({ type: 'success', message: res.message });
        setBulkHouseModal(false);
        setSelectedIds([]);
        fetchStudents(pagination.page);
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.message });
    } finally {
      setIsBulkAssigning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Student Management</h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Search, filter, assign houses, and bulk import students into EcoClub.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setImportModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-eco-600" />
            <span>Bulk Import</span>
          </button>

          <button
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-eco-600 hover:bg-eco-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {/* Search & Multi-Filter Control Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by roll number, name, or email..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:border-eco-500 outline-hidden transition-all text-slate-800"
          />
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-hidden"
          >
            <option value="">All Departments</option>
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-hidden"
          >
            <option value="">All Years</option>
            {YEARS.map((y) => (
              <option key={y} value={y}>
                Year {y}
              </option>
            ))}
          </select>

          <select
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            className="px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-hidden"
          >
            <option value="">All Classes</option>
            {CLASSES.map((c) => (
              <option key={c} value={c}>
                Class {c}
              </option>
            ))}
          </select>

          <select
            value={houseId}
            onChange={(e) => setHouseId(e.target.value)}
            className="px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-hidden"
          >
            <option value="">All Houses</option>
            {houses.map((h) => (
              <option key={h._id} value={h._id}>
                {h.name}
              </option>
            ))}
          </select>

          <select
            value={isActiveFilter}
            onChange={(e) => setIsActiveFilter(e.target.value)}
            className="px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-hidden"
          >
            <option value="">All Statuses</option>
            <option value="true">Active Only</option>
            <option value="false">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Bulk Action Bar (when students selected) */}
      {selectedIds.length > 0 && (
        <div className="bg-eco-50 border border-eco-200 p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-eco-700" />
            <span className="text-xs font-bold text-eco-900">
              {selectedIds.length} student{selectedIds.length > 1 ? 's' : ''} selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setBulkHouseModal(true)}
              className="px-3.5 py-1.5 bg-eco-600 hover:bg-eco-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              Assign House
            </button>
            <button
              onClick={() => setConfirmBulkDeleteModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected</span>
            </button>
          </div>
        </div>
      )}

      {/* Loading & Empty States */}
      {loading ? (
        <LoadingSpinner message="Fetching students..." />
      ) : students.length === 0 ? (
        <EmptyState
          title="No students found"
          description="Try modifying your search query or filter selection."
          action={
            <button
              onClick={openAddModal}
              className="px-4 py-2 bg-eco-600 text-white rounded-xl text-xs font-bold hover:bg-eco-700"
            >
              Add New Student
            </button>
          }
        />
      ) : (
        <>
          {/* ========================================================= */}
          {/* 1. DESKTOP VIEW: Table (Hidden on Mobile)                */}
          {/* ========================================================= */}
          <div className="hidden md:block bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-700 uppercase font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4 w-10">
                      <button
                        type="button"
                        onClick={handleSelectAll}
                        className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {selectedIds.length === students.length ? (
                          <CheckSquare className="w-4 h-4 text-eco-600" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </th>
                    <th className="py-3.5 px-4">Roll No</th>
                    <th className="py-3.5 px-4">Name</th>
                    <th className="py-3.5 px-4">Department & Year</th>
                    <th className="py-3.5 px-4">Assigned House</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((student) => {
                    const isSelected = selectedIds.includes(student._id);
                    return (
                      <tr
                        key={student._id}
                        className={`hover:bg-slate-50/70 transition-colors ${
                          isSelected ? 'bg-eco-50/40' : ''
                        }`}
                      >
                        <td className="py-3.5 px-4">
                          <button
                            type="button"
                            onClick={() => handleToggleSelect(student._id)}
                            className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-eco-600" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                          {student.rollNo}
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-slate-800">{student.name}</p>
                          <p className="text-[11px] text-slate-400">{student.email || 'No email'}</p>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-medium">
                          {student.department} &bull; Year {student.year} - Class {student.className}
                        </td>
                        <td className="py-3.5 px-4">
                          <HouseBadge house={student.houseId} />
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusBadge active={student.isActive} />
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => openEditModal(student)}
                              className="p-2 text-slate-600 hover:text-eco-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                              title="Edit Student"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setConfirmToggleModal({ open: true, student })}
                              className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-colors cursor-pointer"
                              title={student.isActive ? 'Deactivate' : 'Activate'}
                            >
                              <ShieldAlert className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setConfirmDeleteModal({ open: true, student })}
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                              title="Delete Student"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ========================================================= */}
          {/* 2. MOBILE VIEW: Responsive Cards (Hidden on Desktop)      */}
          {/* ========================================================= */}
          <div className="md:hidden space-y-3">
            {students.map((student) => {
              const isSelected = selectedIds.includes(student._id);
              return (
                <div
                  key={student._id}
                  className={`bg-white p-4 rounded-2xl border shadow-xs transition-all space-y-3 ${
                    isSelected ? 'border-eco-500 bg-eco-50/20' : 'border-slate-200/80'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2.5">
                      <button
                        type="button"
                        onClick={() => handleToggleSelect(student._id)}
                        className="mt-0.5 text-slate-400"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-5 h-5 text-eco-600" />
                        ) : (
                          <Square className="w-5 h-5" />
                        )}
                      </button>
                      <div>
                        <span className="font-mono text-xs font-bold text-eco-700">
                          {student.rollNo}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 leading-tight">
                          {student.name}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">
                          {student.department} - {student.year} {student.className}
                        </p>
                      </div>
                    </div>
                    <StatusBadge active={student.isActive} />
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div>
                      <HouseBadge house={student.houseId} />
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(student)}
                        className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setConfirmToggleModal({ open: true, student })}
                        className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
                          student.isActive
                            ? 'text-amber-700 bg-amber-50 hover:bg-amber-100'
                            : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                        }`}
                      >
                        {student.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => setConfirmDeleteModal({ open: true, student })}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                        title="Delete Student"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between pt-2 px-1">
            <p className="text-xs text-slate-500 font-medium">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              <span className="font-bold text-slate-800">{pagination.total}</span> students
            </p>

            <div className="flex items-center gap-1.5">
              <button
                disabled={pagination.page <= 1}
                onClick={() => fetchStudents(pagination.page - 1)}
                className="p-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold text-slate-700 px-2">
                {pagination.page} / {pagination.totalPages}
              </span>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchStudents(pagination.page + 1)}
                className="p-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}

      {/* Add / Edit Student Modal */}
      <Modal
        isOpen={addEditModalOpen}
        onClose={() => setAddEditModalOpen(false)}
        title={editingStudent ? 'Edit Student' : 'Add New Student'}
        subtitle={
          editingStudent
            ? `Update details for Roll No ${editingStudent.rollNo}`
            : 'Default password will be automatically set to eocsxcce'
        }
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Roll Number *
              </label>
              <input
                type="text"
                required
                disabled={!!editingStudent}
                value={form.rollNo}
                onChange={(e) => setForm({ ...form, rollNo: e.target.value })}
                placeholder="e.g. 23IT001"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-eco-500 outline-hidden disabled:bg-slate-100 disabled:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Student full name"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-eco-500 outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="student@ecoclub.org"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-eco-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="9876543210"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-eco-500 outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Dept *
              </label>
              <select
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                className="w-full px-2.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-hidden"
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Year *
              </label>
              <select
                value={form.year}
                onChange={(e) => setForm({ ...form, year: e.target.value })}
                className="w-full px-2.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-hidden"
              >
                {YEARS.map((y) => (
                  <option key={y} value={y}>
                    Year {y}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Class *
              </label>
              <select
                value={form.className}
                onChange={(e) => setForm({ ...form, className: e.target.value })}
                className="w-full px-2.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-hidden"
              >
                {CLASSES.map((c) => (
                  <option key={c} value={c}>
                    Class {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Assigned House *
            </label>
            <select
              required
              value={form.houseId}
              onChange={(e) => setForm({ ...form, houseId: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-hidden"
            >
              {houses.map((h) => (
                <option key={h._id} value={h._id}>
                  {h.name}
                </option>
              ))}
            </select>
          </div>

          {!editingStudent && (
            <div className="p-3.5 bg-eco-50 border border-eco-200 rounded-2xl text-xs text-eco-900 font-medium">
              💡 The student's default password will be{' '}
              <code className="font-bold text-eco-700">eocsxcce</code>. The student must change this
              password on first login.
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setAddEditModalOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-eco-600 hover:bg-eco-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
            >
              {formLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{editingStudent ? 'Save Changes' : 'Create Student'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Bulk Assign House Modal */}
      <Modal
        isOpen={bulkHouseModal}
        onClose={() => setBulkHouseModal(false)}
        title="Assign House to Selected Students"
        subtitle={`Select a target house for the ${selectedIds.length} chosen students`}
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Select Target House
            </label>
            <select
              value={selectedTargetHouse}
              onChange={(e) => setSelectedTargetHouse(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-hidden"
            >
              {houses.map((h) => (
                <option key={h._id} value={h._id}>
                  {h.name}
                </option>
              ))}
            </select>
          </div>

          <p className="text-xs text-slate-500">
            Note: Past awarded weekly marks preserve their original historical house for accurate
            historical rankings. Future marks will be credited to this new house.
          </p>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setBulkHouseModal(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isBulkAssigning}
              onClick={handleBulkAssignSubmit}
              className="inline-flex items-center justify-center gap-2 px-5 py-2 bg-eco-600 hover:bg-eco-700 text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              {isBulkAssigning && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Assign House</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* Confirmation Modal for Student Deactivation / Activation */}
      <ConfirmationModal
        isOpen={confirmToggleModal.open}
        onClose={() => setConfirmToggleModal({ open: false, student: null })}
        onConfirm={handleToggleStatusConfirm}
        title={`${confirmToggleModal.student?.isActive ? 'Deactivate' : 'Activate'} Student`}
        message={`Are you sure you want to ${
          confirmToggleModal.student?.isActive ? 'deactivate' : 'activate'
        } ${confirmToggleModal.student?.name} (${confirmToggleModal.student?.rollNo})?`}
        confirmText={confirmToggleModal.student?.isActive ? 'Deactivate' : 'Activate'}
        isDestructive={false}
      />

      {/* Confirmation Modal for Single Student Permanent Delete */}
      <ConfirmationModal
        isOpen={confirmDeleteModal.open}
        onClose={() => setConfirmDeleteModal({ open: false, student: null })}
        onConfirm={handleDeleteConfirm}
        title="Delete Student"
        message={`Are you sure you want to permanently delete ${confirmDeleteModal.student?.name} (${confirmDeleteModal.student?.rollNo})? All associated weekly marks and password requests will also be removed. This action cannot be undone.`}
        confirmText="Delete Student"
        isDestructive={true}
      />

      {/* Confirmation Modal for Bulk Student Delete */}
      <ConfirmationModal
        isOpen={confirmBulkDeleteModal}
        onClose={() => setConfirmBulkDeleteModal(false)}
        onConfirm={handleBulkDeleteConfirm}
        title="Delete Selected Students"
        message={`Are you sure you want to permanently delete ${selectedIds.length} selected student(s)? All associated weekly marks and password requests will also be removed. This action cannot be undone.`}
        confirmText="Delete Selected"
        isDestructive={true}
        isLoading={isBulkDeleting}
      />

      {/* CSV & Excel Bulk Import Modal */}
      <ImportPreviewModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onSuccess={(msg) => {
          setAlert({ type: 'success', message: msg });
          fetchStudents(1);
        }}
      />
    </div>
  );
};
