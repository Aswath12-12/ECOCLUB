import React, { useState, useEffect } from 'react';
import { Home, Edit3, Users, Trophy, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import { houseService } from '../../services/services';
import { RankBadge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Alert } from '../../components/common/Alert';
import { getHouseTheme } from '../../utils/constants';

export const AdminHouses = () => {
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  // Rename modal state
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [editingHouse, setEditingHouse] = useState(null);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newColor, setNewColor] = useState('#10B981');
  const [saving, setSaving] = useState(false);

  const fetchHouses = async () => {
    try {
      setLoading(true);
      const res = await houseService.getHouses();
      if (res.success) {
        setHouses(res.data.houses);
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to load houses' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHouses();
  }, []);

  const openRenameModal = (house) => {
    setEditingHouse(house);
    setNewName(house.name);
    setNewDesc(house.description || '');
    setNewColor(house.colorCode || '#10B981');
    setRenameModalOpen(true);
  };

  const handleSaveRename = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setSaving(true);
    setAlert(null);

    try {
      const res = await houseService.updateHouse(editingHouse._id, {
        name: newName.trim(),
        description: newDesc.trim(),
        colorCode: newColor
      });

      if (res.success) {
        setAlert({
          type: 'success',
          message: `House renamed successfully to "${newName.trim()}". Changes are live across the system!`
        });
        setRenameModalOpen(false);
        fetchHouses();
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading the 4 EcoClub Houses..." />;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            House Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Manage the four core EcoClub houses. Rename houses dynamically to update rankings and dashboards.
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-eco-50 border border-eco-200 text-eco-800 rounded-xl text-xs font-bold self-start sm:self-auto">
          <Sparkles className="w-3.5 h-3.5 text-eco-600" />
          <span>4-House Architecture Fixed</span>
        </div>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {/* 4 House Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {houses.map((house) => {
          const theme = getHouseTheme(house.code);

          return (
            <div
              key={house._id}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden"
            >
              {/* Accent Color Stripe */}
              <div
                className="absolute top-0 left-0 right-0 h-2"
                style={{ backgroundColor: house.colorCode || theme.barFill }}
              />

              <div className="space-y-4 pt-1">
                {/* Header: Name, Code & Current Rank */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black tracking-wider uppercase text-slate-400">
                      Code: {house.code}
                    </span>
                    <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-tight">
                      {house.name}
                    </h2>
                  </div>
                  <RankBadge rank={house.rank} rankText={house.rankText} />
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 min-h-[36px] leading-relaxed">
                  {house.description || 'No description provided.'}
                </p>

                {/* Stats row */}
                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white shadow-xs border border-slate-200 flex items-center justify-center text-slate-600">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase">Members</p>
                      <p className="text-sm font-black text-slate-900">{house.studentCount} Students</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white shadow-xs border border-slate-200 flex items-center justify-center text-amber-500">
                      <Trophy className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase">Total Points</p>
                      <p className="text-sm font-black text-slate-900">{house.totalPoints} Points</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button: Rename */}
              <div className="pt-5 border-t border-slate-100 mt-4 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => openRenameModal(house)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-eco-600 hover:text-white rounded-xl text-xs font-bold text-slate-700 transition-all cursor-pointer shadow-xs"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Rename House</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Rename House Modal */}
      <Modal
        isOpen={renameModalOpen}
        onClose={() => setRenameModalOpen(false)}
        title="Rename House"
        subtitle={`Renaming ${editingHouse?.name} (${editingHouse?.code})`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSaveRename} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              House Name *
            </label>
            <input
              type="text"
              required
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Evergreen House"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-eco-500 rounded-xl text-sm font-bold text-slate-800 outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Mission / Description
            </label>
            <textarea
              rows={3}
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="What this house represents..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-eco-500 rounded-xl text-xs font-medium text-slate-800 outline-hidden resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Theme Hex Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer p-0.5"
              />
              <input
                type="text"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold"
              />
            </div>
          </div>

          <p className="text-[11px] text-slate-400">
            Note: Renaming this house updates student profiles, leaderboards, certificates, and reports immediately.
          </p>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setRenameModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 px-5 py-2 bg-eco-600 hover:bg-eco-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
