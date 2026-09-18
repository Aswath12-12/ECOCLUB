import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  PlusCircle,
  Edit2,
  Trash2,
  Award,
  Loader2,
  Calendar,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { activityService } from '../../services/services';
import { Modal } from '../../components/common/Modal';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Alert } from '../../components/common/Alert';
import { StatusBadge } from '../../components/common/Badge';

export const AdminActivities = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weekFilter, setWeekFilter] = useState('');
  const [alert, setAlert] = useState(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ open: false, activity: null });

  const [form, setForm] = useState({
    name: '',
    description: '',
    maxMarks: 10,
    date: new Date().toISOString().split('T')[0],
    weekNumber: 1
  });

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const res = await activityService.getActivities({
        weekNumber: weekFilter || undefined
      });
      if (res.success) {
        setActivities(res.data.activities);
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to load activities' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [weekFilter]);

  const openAddModal = () => {
    setEditingActivity(null);
    setForm({
      name: '',
      description: '',
      maxMarks: 10,
      date: new Date().toISOString().split('T')[0],
      weekNumber: 1
    });
    setModalOpen(true);
  };

  const openEditModal = (activity) => {
    setEditingActivity(activity);
    setForm({
      name: activity.name,
      description: activity.description || '',
      maxMarks: activity.maxMarks || 10,
      date: activity.date ? new Date(activity.date).toISOString().split('T')[0] : '',
      weekNumber: activity.weekNumber || 1
    });
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setAlert(null);

    try {
      if (editingActivity) {
        const res = await activityService.updateActivity(editingActivity._id, form);
        if (res.success) {
          setAlert({ type: 'success', message: 'Activity updated successfully!' });
          setModalOpen(false);
          fetchActivities();
        }
      } else {
        const res = await activityService.createActivity(form);
        if (res.success) {
          setAlert({ type: 'success', message: 'Activity added successfully!' });
          setModalOpen(false);
          fetchActivities();
        }
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.message });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.activity) return;
    try {
      const res = await activityService.deleteActivity(deleteModal.activity._id);
      if (res.success) {
        setAlert({ type: 'success', message: 'Activity deleted successfully' });
        setDeleteModal({ open: false, activity: null });
        fetchActivities();
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.message });
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Weekly Eco Activities
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Define eco drives, campaigns, quizzes, and maximum participation marks per week.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-eco-600 hover:bg-eco-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Activity</span>
        </button>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {/* Filter Bar */}
      <div className="flex items-center justify-between bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-700">Filter by Week:</span>
          <select
            value={weekFilter}
            onChange={(e) => setWeekFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-hidden"
          >
            <option value="">All Weeks</option>
            <option value="1">Week 1</option>
            <option value="2">Week 2</option>
            <option value="3">Week 3</option>
            <option value="4">Week 4</option>
            <option value="5">Week 5</option>
          </select>
        </div>

        <span className="text-xs font-semibold text-slate-400">
          {activities.length} activit{activities.length === 1 ? 'y' : 'ies'}
        </span>
      </div>

      {/* Activities Grid */}
      {loading ? (
        <LoadingSpinner message="Loading activities..." />
      ) : activities.length === 0 ? (
        <EmptyState
          title="No activities recorded"
          description="Create your first EcoClub weekly activity to start scoring student participation."
          action={
            <button
              onClick={openAddModal}
              className="px-4 py-2 bg-eco-600 text-white rounded-xl text-xs font-bold"
            >
              + Create Activity
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {activities.map((act) => (
            <div
              key={act._id}
              className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-eco-50 text-eco-800 border border-eco-200">
                    Week {act.weekNumber}
                  </span>
                  <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-lg">
                    Max: {act.maxMarks} pts
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug">{act.name}</h3>
                <p className="text-xs text-slate-500 leading-relaxed min-h-[36px]">
                  {act.description || 'No description provided.'}
                </p>

                <p className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{act.date ? new Date(act.date).toLocaleDateString() : 'Date not set'}</span>
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <StatusBadge active={act.active} />
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(act)}
                    className="p-1.5 text-slate-500 hover:text-eco-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                    title="Edit Activity"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteModal({ open: true, activity: act })}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete Activity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Activity Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingActivity ? 'Edit Activity' : 'Add Weekly Activity'}
        subtitle="Activities are used for awarding participation marks to student houses"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Activity Name *
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Tree Plantation Drive"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-eco-500 rounded-xl text-xs font-medium outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Week Number *
              </label>
              <input
                type="number"
                min="1"
                required
                value={form.weekNumber}
                onChange={(e) => setForm({ ...form, weekNumber: parseInt(e.target.value, 10) || 1 })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-eco-500 rounded-xl text-xs font-medium outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Max Marks *
              </label>
              <input
                type="number"
                min="1"
                required
                value={form.maxMarks}
                onChange={(e) => setForm({ ...form, maxMarks: parseInt(e.target.value, 10) || 10 })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-eco-500 rounded-xl text-xs font-medium outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Event Date
            </label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-eco-500 rounded-xl text-xs font-medium outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Brief details about the environmental drive..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-eco-500 rounded-xl text-xs font-medium outline-hidden resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className="inline-flex items-center justify-center gap-2 px-5 py-2 bg-eco-600 hover:bg-eco-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs"
            >
              {formLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{editingActivity ? 'Save Changes' : 'Create Activity'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, activity: null })}
        onConfirm={handleDeleteConfirm}
        title="Delete Activity"
        message={`Are you sure you want to delete "${deleteModal.activity?.name}"?`}
        confirmText="Delete Activity"
        isDestructive={true}
      />
    </div>
  );
};
