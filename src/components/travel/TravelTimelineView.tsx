import React, { useState } from 'react';
import { 
  Compass, 
  MapPin, 
  Plus, 
  Sparkles, 
  Calendar, 
  Navigation, 
  Check, 
  Trash2, 
  Edit3, 
  Luggage, 
  Car, 
  Plane, 
  Train, 
  Footprints, 
  Search, 
  X, 
  Loader2 
} from 'lucide-react';
import { TravelTrip, TransportMode, PackingItem } from '../../types';
import { formatRupiah, formatDateIndo } from '../../utils/formatters';
import confetti from 'canvas-confetti';

interface TravelTimelineViewProps {
  trips: TravelTrip[];
  onAddTrip: (trip: Omit<TravelTrip, 'id'>) => void;
  onUpdateTrip: (id: string, trip: Partial<TravelTrip>) => void;
  onDeleteTrip: (id: string) => void;
  onTogglePackingItem: (tripId: string, itemId: string) => void;
}

const transportIcons: Record<TransportMode, { icon: React.FC<{ className?: string }>; label: string; color: string }> = {
  motor: { icon: Navigation, label: 'Motor / Touring', color: 'text-amber-400 bg-amber-500/20' },
  car: { icon: Car, label: 'Mobil / Roadtrip', color: 'text-blue-400 bg-blue-500/20' },
  train: { icon: Train, label: 'Kereta Api', color: 'text-emerald-400 bg-emerald-500/20' },
  flight: { icon: Plane, label: 'Pesawat Terbang', color: 'text-sky-400 bg-sky-500/20' },
  walk: { icon: Footprints, label: 'Hiking / Jalan Kaki', color: 'text-purple-400 bg-purple-500/20' },
};

export const TravelTimelineView: React.FC<TravelTimelineViewProps> = ({
  trips,
  onAddTrip,
  onUpdateTrip,
  onDeleteTrip,
  onTogglePackingItem,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAIPlannerOpen, setIsAIPlannerOpen] = useState(false);

  // Form State
  const [editingTrip, setEditingTrip] = useState<TravelTrip | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDestination, setFormDestination] = useState('');
  const [formLocationTag, setFormLocationTag] = useState('');
  const [formCoverEmoji, setFormCoverEmoji] = useState('🛵');
  const [formTransport, setFormTransport] = useState<TransportMode>('motor');
  const [formStartDate, setFormStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [formEndDate, setFormEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [formDistanceKm, setFormDistanceKm] = useState(150);
  const [formTotalCost, setFormTotalCost] = useState(500000);
  const [formStatus, setFormStatus] = useState<'completed' | 'ongoing' | 'planned'>('completed');
  const [formHighlights, setFormHighlights] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formPackingItems, setFormPackingItems] = useState<string[]>(['Jaket', 'Powerbank', 'Kamera']);

  // AI Planner Form State
  const [aiDestination, setAiDestination] = useState('Dieng Plateau');
  const [aiDuration, setAiDuration] = useState('3 Hari 2 Malam');
  const [aiBudget, setAiBudget] = useState('Rp 1.200.000');
  const [aiStyle, setAiStyle] = useState('Touring Motor Santai & Kuliner');
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [aiGeneratedResult, setAiGeneratedResult] = useState<any>(null);

  // Summary Metrics
  const totalKm = trips.reduce((sum, t) => sum + t.distanceKm, 0);
  const totalSpent = trips.reduce((sum, t) => sum + t.totalCost, 0);
  const completedTripsCount = trips.filter((t) => t.status === 'completed').length;

  const openAddModal = () => {
    setEditingTrip(null);
    setFormTitle('');
    setFormDestination('');
    setFormLocationTag('Indonesia');
    setFormCoverEmoji('🛵');
    setFormTransport('motor');
    setFormStartDate(new Date().toISOString().slice(0, 10));
    setFormEndDate(new Date().toISOString().slice(0, 10));
    setFormDistanceKm(150);
    setFormTotalCost(500000);
    setFormStatus('planned');
    setFormHighlights('');
    setFormNotes('');
    setFormPackingItems(['Jaket Windproof', 'Powerbank', 'Obat Pribadi']);
    setIsAddModalOpen(true);
  };

  const openEditModal = (t: TravelTrip) => {
    setEditingTrip(t);
    setFormTitle(t.title);
    setFormDestination(t.destination);
    setFormLocationTag(t.locationTag);
    setFormCoverEmoji(t.coverEmoji);
    setFormTransport(t.transportMode);
    setFormStartDate(t.startDate);
    setFormEndDate(t.endDate);
    setFormDistanceKm(t.distanceKm);
    setFormTotalCost(t.totalCost);
    setFormStatus(t.status);
    setFormHighlights(t.highlights.join('\n'));
    setFormNotes(t.notes);
    setFormPackingItems(t.packingList.map((p) => p.item));
    setIsAddModalOpen(true);
  };

  const handleSaveTrip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formDestination) return;

    const parsedHighlights = formHighlights
      .split('\n')
      .map((h) => h.trim())
      .filter(Boolean);

    const packingList: PackingItem[] = formPackingItems
      .filter((p) => p.trim().length > 0)
      .map((p, idx) => ({
        id: `pk-${Date.now()}-${idx}`,
        item: p.trim(),
        packed: false,
      }));

    if (editingTrip) {
      onUpdateTrip(editingTrip.id, {
        title: formTitle,
        destination: formDestination,
        locationTag: formLocationTag,
        coverEmoji: formCoverEmoji,
        transportMode: formTransport,
        startDate: formStartDate,
        endDate: formEndDate,
        distanceKm: formDistanceKm,
        totalCost: formTotalCost,
        status: formStatus,
        highlights: parsedHighlights,
        notes: formNotes,
        packingList: packingList.length > 0 ? packingList : editingTrip.packingList,
      });
    } else {
      onAddTrip({
        title: formTitle,
        destination: formDestination,
        locationTag: formLocationTag,
        coverEmoji: formCoverEmoji,
        transportMode: formTransport,
        startDate: formStartDate,
        endDate: formEndDate,
        distanceKm: formDistanceKm,
        totalCost: formTotalCost,
        status: formStatus,
        highlights: parsedHighlights,
        notes: formNotes,
        packingList,
      });
      confetti({ particleCount: 40, spread: 60 });
    }

    setIsAddModalOpen(false);
  };

  // AI Planner Generator
  const handleGenerateAIItinerary = async () => {
    if (!aiDestination.trim()) return;
    setIsGeneratingPlan(true);
    try {
      const res = await fetch('/api/ai/travel-planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: aiDestination,
          duration: aiDuration,
          budget: aiBudget,
          style: aiStyle,
        }),
      });
      const data = await res.json();
      if (data.plan) {
        setAiGeneratedResult(data.plan);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const applyAIPlanToNewTrip = () => {
    if (!aiGeneratedResult) return;
    setFormTitle(aiGeneratedResult.title || `Trip ke ${aiDestination}`);
    setFormDestination(aiDestination);
    setFormLocationTag('Indonesia');
    setFormCoverEmoji('🏝️');
    setFormTransport('car');
    setFormHighlights((aiGeneratedResult.highlights || []).join('\n'));
    setFormNotes(`${aiGeneratedResult.summary || ''}\n\nTips: ${(aiGeneratedResult.tips || []).join(', ')}`);
    setFormStatus('planned');
    setIsAIPlannerOpen(false);
    setIsAddModalOpen(true);
  };

  // Filtered Trips
  const filtered = trips.filter((t) => {
    const q = searchQuery.toLowerCase();
    return (
      t.title.toLowerCase().includes(q) ||
      t.destination.toLowerCase().includes(q) ||
      t.locationTag.toLowerCase().includes(q) ||
      t.notes.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4 pb-24 text-slate-100 animate-in fade-in duration-300">
      
      {/* 1. Hero Travel Stats Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-950/80 via-slate-900 to-slate-950 p-4 border border-amber-500/30 shadow-xl">
        <div className="flex items-center justify-between text-xs text-amber-400 font-medium mb-1">
          <span className="flex items-center gap-1.5">
            <Compass className="w-4 h-4" />
            <span>Linimasa Petualangan & Travel</span>
          </span>
          <button
            onClick={() => setIsAIPlannerOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold border border-amber-500/40 text-[10px] transition active:scale-95"
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>AI Itinerary Planner</span>
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-3 pt-2 text-center">
          <div className="bg-slate-900/80 rounded-xl p-2 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Jarak Total</span>
            <span className="text-base font-extrabold text-amber-400">{totalKm} km</span>
          </div>
          <div className="bg-slate-900/80 rounded-xl p-2 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Destinasi</span>
            <span className="text-base font-extrabold text-emerald-400">{completedTripsCount} Selesai</span>
          </div>
          <div className="bg-slate-900/80 rounded-xl p-2 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Biaya Total</span>
            <span className="text-sm font-extrabold text-slate-200">{formatRupiah(totalSpent)}</span>
          </div>
        </div>
      </div>

      {/* 2. Search & Add Button */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari tempat, kota, atau catatan perjalanan..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
          />
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow transition active:scale-95 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Trip</span>
        </button>
      </div>

      {/* 3. Vertical Timeline of Trips */}
      <div className="space-y-4 relative before:absolute before:inset-0 before:left-4 before:w-0.5 before:bg-slate-800 before:z-0">
        {filtered.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 relative z-10">
            <Compass className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-300">Belum ada catatan perjalanan</p>
            <p className="text-xs text-slate-500 mt-1">Mulai log petualangan Anda atau buat rencana dengan AI.</p>
          </div>
        ) : (
          filtered.map((trip) => {
            const transportConfig = transportIcons[trip.transportMode] || transportIcons.motor;
            const Icon = transportConfig.icon;

            const statusBadges = {
              completed: { label: 'Selesai', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
              ongoing: { label: 'Sedang Jalan', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse' },
              planned: { label: 'Direncanakan', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
            }[trip.status];

            const packedCount = trip.packingList.filter((p) => p.packed).length;

            return (
              <div key={trip.id} className="relative z-10 pl-8">
                {/* Timeline node icon */}
                <div className="absolute -left-0.5 top-3 w-8 h-8 rounded-full bg-slate-900 border-2 border-amber-500 flex items-center justify-center text-sm shadow-md">
                  {trip.coverEmoji || '🛵'}
                </div>

                {/* Trip Card */}
                <div className="bg-slate-900/95 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 shadow-lg transition space-y-3">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] px-2 py-0.2 rounded-full font-bold border ${statusBadges.color}`}>
                          {statusBadges.label}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-slate-400">
                          <MapPin className="w-3 h-3 text-amber-400" />
                          {trip.locationTag}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white mt-1 leading-snug">
                        {trip.title}
                      </h4>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(trip)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200"
                        title="Edit Trip"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteTrip(trip.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400"
                        title="Hapus Trip"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Trip Details Pill Strip */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-950/80 border border-slate-800/80 rounded-xl p-2 text-center text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Moda</span>
                      <span className="font-semibold text-slate-200 flex items-center justify-center gap-1 text-[11px]">
                        <Icon className="w-3 h-3 text-amber-400" />
                        {transportConfig.label.split('/')[0]}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Jarak</span>
                      <span className="font-semibold text-amber-400">{trip.distanceKm} km</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Total Biaya</span>
                      <span className="font-semibold text-emerald-400">{formatRupiah(trip.totalCost)}</span>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>
                      {formatDateIndo(trip.startDate)} - {formatDateIndo(trip.endDate)}
                    </span>
                  </div>

                  {/* Highlights */}
                  {trip.highlights && trip.highlights.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Highlight Spot
                      </span>
                      <ul className="space-y-0.5 text-xs text-slate-300 list-disc list-inside">
                        {trip.highlights.map((h, i) => (
                          <li key={i} className="leading-relaxed">
                            {h}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Packing List Checklist */}
                  {trip.packingList && trip.packingList.length > 0 && (
                    <div className="pt-2 border-t border-slate-800/80">
                      <div className="flex items-center justify-between text-[11px] text-slate-300 font-semibold mb-1.5">
                        <span className="flex items-center gap-1">
                          <Luggage className="w-3.5 h-3.5 text-amber-400" />
                          <span>Daftar Barang Bawaan ({packedCount}/{trip.packingList.length})</span>
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {trip.packingList.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => onTogglePackingItem(trip.id, item.id)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium flex items-center gap-1.5 transition ${
                              item.packed
                                ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300'
                                : 'bg-slate-800 border border-slate-700 text-slate-300'
                            }`}
                          >
                            <span
                              className={`w-3 h-3 rounded-full flex items-center justify-center border ${
                                item.packed ? 'bg-emerald-500 border-emerald-500 text-slate-900' : 'border-slate-500'
                              }`}
                            >
                              {item.packed && <Check className="w-2 h-2 stroke-[3]" />}
                            </span>
                            <span className={item.packed ? 'line-through opacity-80' : ''}>
                              {item.item}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {trip.notes && (
                    <p className="text-xs text-slate-400 italic bg-slate-950/40 p-2 rounded-xl border border-slate-800">
                      "{trip.notes}"
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ADD / EDIT TRIP MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-t-3xl sm:rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Compass className="w-4 h-4 text-amber-400" />
                <span>{editingTrip ? 'Edit Log Perjalanan' : 'Catat Trip Baru'}</span>
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTrip} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Judul Perjalanan *</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Solo Touring Dieng Negeri di Atas Awan"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Destinasi Utama *</label>
                  <input
                    type="text"
                    required
                    placeholder="Dieng, Bromo, Bali..."
                    value={formDestination}
                    onChange={(e) => setFormDestination(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Provinsi / Wilayah</label>
                  <input
                    type="text"
                    placeholder="Jawa Tengah, Indonesia"
                    value={formLocationTag}
                    onChange={(e) => setFormLocationTag(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Emoji Cover</label>
                  <input
                    type="text"
                    value={formCoverEmoji}
                    onChange={(e) => setFormCoverEmoji(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-center text-base text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Moda Transport</label>
                  <select
                    value={formTransport}
                    onChange={(e) => setFormTransport(e.target.value as TransportMode)}
                    className="w-full px-2 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="motor">🛵 Motor</option>
                    <option value="car">🚗 Mobil</option>
                    <option value="train">🚆 Kereta</option>
                    <option value="flight">✈️ Pesawat</option>
                    <option value="walk">🚶 Hiking</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-2 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="completed">Selesai</option>
                    <option value="ongoing">Sedang Jalan</option>
                    <option value="planned">Direncanakan</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Tgl Berangkat</label>
                  <input
                    type="date"
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Tgl Pulang</label>
                  <input
                    type="date"
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Estimasi Jarak (KM)</label>
                  <input
                    type="number"
                    value={formDistanceKm}
                    onChange={(e) => setFormDistanceKm(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Total Biaya (Rp)</label>
                  <input
                    type="number"
                    value={formTotalCost}
                    onChange={(e) => setFormTotalCost(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Spot Highlight (1 per baris)</label>
                <textarea
                  rows={2}
                  placeholder="Kawah Sikidang&#10;Sunrise Bukit Sikunir&#10;Candi Arjuna"
                  value={formHighlights}
                  onChange={(e) => setFormHighlights(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Catatan & Tips</label>
                <textarea
                  rows={2}
                  placeholder="Bawa jaket hangat suhu 5°C, isi bensin penuh..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-1/2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow"
                >
                  Simpan Trip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI ITINERARY PLANNER MODAL */}
      {isAIPlannerOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-t-3xl sm:rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>AI Travel Itinerary Generator</span>
              </h3>
              <button onClick={() => setIsAIPlannerOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Destinasi yang Ingin Dituju</label>
                <input
                  type="text"
                  value={aiDestination}
                  onChange={(e) => setAiDestination(e.target.value)}
                  placeholder="Misal: Labuan Bajo, Danau Toba, Ubud Bali, Dieng..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Durasi</label>
                  <input
                    type="text"
                    value={aiDuration}
                    onChange={(e) => setAiDuration(e.target.value)}
                    placeholder="3 Hari 2 Malam"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Budget Target</label>
                  <input
                    type="text"
                    value={aiBudget}
                    onChange={(e) => setAiBudget(e.target.value)}
                    placeholder="Rp 1.500.000"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Gaya Perjalanan</label>
                <input
                  type="text"
                  value={aiStyle}
                  onChange={(e) => setAiStyle(e.target.value)}
                  placeholder="Backpacker, Roadtrip Motor, Liburan Keluarga, Healing Santai"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="button"
                onClick={handleGenerateAIItinerary}
                disabled={!aiDestination.trim() || isGeneratingPlan}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 text-white font-bold transition flex items-center justify-center gap-2 shadow disabled:opacity-50"
              >
                {isGeneratingPlan ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span>{isGeneratingPlan ? 'Merancang Itinerary...' : 'Buat Rencana Perjalanan'}</span>
              </button>

              {/* AI Result Card */}
              {aiGeneratedResult && (
                <div className="bg-slate-950 border border-amber-500/40 rounded-xl p-3.5 space-y-2 mt-3 animate-in fade-in">
                  <h4 className="font-bold text-amber-300 text-sm">
                    {aiGeneratedResult.title}
                  </h4>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    {aiGeneratedResult.summary}
                  </p>

                  {aiGeneratedResult.highlights && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        Rencana Harian:
                      </span>
                      <ul className="list-disc list-inside text-slate-300 space-y-0.5 text-xs">
                        {aiGeneratedResult.highlights.map((h: string, i: number) => (
                          <li key={i}>{h}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {aiGeneratedResult.tips && (
                    <p className="text-[11px] text-amber-400/90 italic">
                      💡 Tips: {aiGeneratedResult.tips.join(' • ')}
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={applyAIPlanToNewTrip}
                    className="w-full mt-2 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow"
                  >
                    Terapkan & Simpan ke Linimasa
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
