import React, { useState } from 'react';
import { 
  CheckSquare, 
  FileText, 
  Search, 
  Plus, 
  Pin, 
  Trash2, 
  Edit3, 
  Calendar, 
  Sparkles, 
  CheckCircle2, 
  Circle, 
  Clock, 
  AlertCircle, 
  Tag, 
  X, 
  Copy, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Loader2 
} from 'lucide-react';
import { NoteItem, TodoItem, NoteCategory, PriorityLevel } from '../../types';
import { formatDateIndo } from '../../utils/formatters';
import confetti from 'canvas-confetti';

interface NotesTodosViewProps {
  notes: NoteItem[];
  todos: TodoItem[];
  onAddNote: (note: Omit<NoteItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateNote: (id: string, note: Partial<NoteItem>) => void;
  onDeleteNote: (id: string) => void;
  onTogglePinNote: (id: string) => void;
  onAddTodo: (todo: Omit<TodoItem, 'id' | 'createdAt'>) => void;
  onUpdateTodo: (id: string, todo: Partial<TodoItem>) => void;
  onDeleteTodo: (id: string) => void;
  onToggleTodoComplete: (id: string) => void;
  onToggleSubtask: (todoId: string, subtaskId: string) => void;
}

const NOTE_COLORS = [
  { label: 'Yellow', value: '#FEF3C7', textClass: 'text-amber-950', bgClass: 'bg-amber-100/90' },
  { label: 'Indigo', value: '#E0E7FF', textClass: 'text-indigo-950', bgClass: 'bg-indigo-100/90' },
  { label: 'Green', value: '#DCFCE7', textClass: 'text-emerald-950', bgClass: 'bg-emerald-100/90' },
  { label: 'Rose', value: '#FFE4E6', textClass: 'text-rose-950', bgClass: 'bg-rose-100/90' },
  { label: 'Dark', value: '#1E293B', textClass: 'text-slate-100', bgClass: 'bg-slate-800/90' },
];

export const NotesTodosView: React.FC<NotesTodosViewProps> = ({
  notes,
  todos,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
  onTogglePinNote,
  onAddTodo,
  onUpdateTodo,
  onDeleteTodo,
  onToggleTodoComplete,
  onToggleSubtask,
}) => {
  const [activeTab, setActiveTab] = useState<'todos' | 'notes'>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [todoFilter, setTodoFilter] = useState<'all' | 'urgent' | 'completed'>('all');
  const [copiedNoteId, setCopiedNoteId] = useState<string | null>(null);
  const [expandedTodoIds, setExpandedTodoIds] = useState<Record<string, boolean>>({});

  // Note Modal State
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<NoteItem | null>(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteCategory, setNoteCategory] = useState<NoteCategory>('Ide');
  const [noteColor, setNoteColor] = useState('#FEF3C7');
  const [noteTags, setNoteTags] = useState('');

  // Todo Modal State
  const [isTodoModalOpen, setIsTodoModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<TodoItem | null>(null);
  const [todoTitle, setTodoTitle] = useState('');
  const [todoPriority, setTodoPriority] = useState<PriorityLevel>('Sedang');
  const [todoDueDate, setTodoDueDate] = useState(new Date().toISOString().slice(0, 10));
  const [todoCategory, setTodoCategory] = useState('Kerja');
  const [todoSubtaskInputs, setTodoSubtaskInputs] = useState<string[]>(['']);
  const [isGeneratingSubtasks, setIsGeneratingSubtasks] = useState(false);

  // Notes actions
  const openAddNote = () => {
    setEditingNote(null);
    setNoteTitle('');
    setNoteContent('');
    setNoteCategory('Ide');
    setNoteColor('#FEF3C7');
    setNoteTags('');
    setIsNoteModalOpen(true);
  };

  const openEditNote = (n: NoteItem) => {
    setEditingNote(n);
    setNoteTitle(n.title);
    setNoteContent(n.content);
    setNoteCategory(n.category);
    setNoteColor(n.color);
    setNoteTags(n.tags.join(', '));
    setIsNoteModalOpen(true);
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim()) return;

    const parsedTags = noteTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    if (editingNote) {
      onUpdateNote(editingNote.id, {
        title: noteTitle,
        content: noteContent,
        category: noteCategory,
        color: noteColor,
        tags: parsedTags,
      });
    } else {
      onAddNote({
        title: noteTitle,
        content: noteContent,
        category: noteCategory,
        color: noteColor,
        isPinned: false,
        tags: parsedTags,
      });
    }
    setIsNoteModalOpen(false);
  };

  const handleCopyNote = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedNoteId(id);
    setTimeout(() => setCopiedNoteId(null), 2000);
  };

  // Todo actions
  const openAddTodo = () => {
    setEditingTodo(null);
    setTodoTitle('');
    setTodoPriority('Sedang');
    setTodoDueDate(new Date().toISOString().slice(0, 10));
    setTodoCategory('Kerja');
    setTodoSubtaskInputs(['']);
    setIsTodoModalOpen(true);
  };

  const openEditTodo = (t: TodoItem) => {
    setEditingTodo(t);
    setTodoTitle(t.title);
    setTodoPriority(t.priority);
    setTodoDueDate(t.dueDate);
    setTodoCategory(t.category);
    setTodoSubtaskInputs(t.subtasks.length > 0 ? t.subtasks.map((s) => s.text) : ['']);
    setIsTodoModalOpen(true);
  };

  const handleSaveTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!todoTitle.trim()) return;

    const subtasks = todoSubtaskInputs
      .filter((s) => s.trim().length > 0)
      .map((s, idx) => ({
        id: `st-${Date.now()}-${idx}`,
        text: s.trim(),
        done: false,
      }));

    if (editingTodo) {
      onUpdateTodo(editingTodo.id, {
        title: todoTitle,
        priority: todoPriority,
        dueDate: todoDueDate,
        category: todoCategory,
        subtasks: subtasks.length > 0 ? subtasks : editingTodo.subtasks,
      });
    } else {
      onAddTodo({
        title: todoTitle,
        isCompleted: false,
        priority: todoPriority,
        dueDate: todoDueDate,
        category: todoCategory,
        subtasks,
      });
    }
    setIsTodoModalOpen(false);
  };

  const handleToggleTask = (id: string, currentlyCompleted: boolean) => {
    onToggleTodoComplete(id);
    if (!currentlyCompleted) {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.7 },
      });
    }
  };

  const toggleExpandTodo = (id: string) => {
    setExpandedTodoIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // AI Breakdown generator
  const handleAIBreakdown = async () => {
    if (!todoTitle.trim()) return;
    setIsGeneratingSubtasks(true);
    try {
      const res = await fetch('/api/ai/breakdown-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskTitle: todoTitle, taskCategory: todoCategory }),
      });
      const data = await res.json();
      if (data.subtasks && Array.isArray(data.subtasks)) {
        setTodoSubtaskInputs(data.subtasks);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingSubtasks(false);
    }
  };

  // Filtered Todos
  const filteredTodos = todos.filter((t) => {
    const matchSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
    if (todoFilter === 'urgent') return matchSearch && t.priority === 'Tinggi' && !t.isCompleted;
    if (todoFilter === 'completed') return matchSearch && t.isCompleted;
    return matchSearch;
  });

  // Filtered Notes
  const filteredNotes = notes
    .filter((n) => {
      const matchSearch =
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchSearch;
    })
    .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));

  const completedCount = todos.filter((t) => t.isCompleted).length;

  return (
    <div className="space-y-4 pb-24 text-slate-100 animate-in fade-in duration-300">
      
      {/* Top Tab Switcher Pill */}
      <div className="bg-slate-900/90 border border-slate-800 p-1 rounded-2xl flex items-center shadow-md">
        <button
          onClick={() => setActiveTab('todos')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${
            activeTab === 'todos'
              ? 'bg-blue-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>Daftar Tugas ({todos.length - completedCount})</span>
        </button>

        <button
          onClick={() => setActiveTab('notes')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${
            activeTab === 'notes'
              ? 'bg-amber-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Catatan Digital ({notes.length})</span>
        </button>
      </div>

      {/* Search & Actions Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={activeTab === 'todos' ? 'Cari tugas...' : 'Cari catatan & tags...'}
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        {activeTab === 'todos' ? (
          <button
            onClick={openAddTodo}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow transition active:scale-95 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Tugas Baru</span>
          </button>
        ) : (
          <button
            onClick={openAddNote}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow transition active:scale-95 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Catatan Baru</span>
          </button>
        )}
      </div>

      {/* SUB-VIEW 1: TO-DO LIST */}
      {activeTab === 'todos' && (
        <div className="space-y-3">
          {/* Filter Chips */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setTodoFilter('all')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                todoFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Semua ({todos.length})
            </button>
            <button
              onClick={() => setTodoFilter('urgent')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                todoFilter === 'urgent'
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Prioritas Tinggi
            </button>
            <button
              onClick={() => setTodoFilter('completed')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                todoFilter === 'completed'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Selesai ({completedCount})
            </button>
          </div>

          {/* List of Tasks */}
          <div className="space-y-2.5">
            {filteredTodos.length === 0 ? (
              <div className="text-center py-12 bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
                <CheckSquare className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-300">Tidak ada tugas dalam kategori ini</p>
                <p className="text-xs text-slate-500 mt-1">Tekan tombol 'Tugas Baru' untuk menambah checklist.</p>
              </div>
            ) : (
              filteredTodos.map((todo) => {
                const isExpanded = expandedTodoIds[todo.id] || false;
                const hasSubtasks = todo.subtasks && todo.subtasks.length > 0;
                const doneSubtasks = hasSubtasks ? todo.subtasks.filter((s) => s.done).length : 0;

                const priorityStyles = {
                  Tinggi: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
                  Sedang: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
                  Rendah: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
                }[todo.priority];

                return (
                  <div
                    key={todo.id}
                    className={`bg-slate-900/90 border rounded-2xl p-3.5 transition shadow-md ${
                      todo.isCompleted
                        ? 'border-slate-800/60 opacity-60'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2.5">
                      <button
                        onClick={() => handleToggleTask(todo.id, todo.isCompleted)}
                        className="mt-0.5 text-slate-400 hover:text-emerald-400 transition"
                      >
                        {todo.isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </button>

                      <div className="flex-1">
                        <h4
                          className={`text-xs sm:text-sm font-semibold text-slate-100 ${
                            todo.isCompleted ? 'line-through text-slate-400' : ''
                          }`}
                        >
                          {todo.title}
                        </h4>

                        <div className="flex items-center flex-wrap gap-2 mt-1.5 text-[10px] text-slate-400">
                          <span className={`px-1.5 py-0.5 rounded font-bold border ${priorityStyles}`}>
                            {todo.priority}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-500" />
                            {formatDateIndo(todo.dueDate)}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                            {todo.category}
                          </span>

                          {hasSubtasks && (
                            <button
                              onClick={() => toggleExpandTodo(todo.id)}
                              className="text-blue-400 hover:text-blue-300 flex items-center gap-0.5 ml-auto font-medium"
                            >
                              <span>
                                {doneSubtasks}/{todo.subtasks.length} Sub-tugas
                              </span>
                              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditTodo(todo)}
                          className="p-1 rounded-lg text-slate-400 hover:text-slate-200"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteTodo(todo.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Subtasks Accordion */}
                    {hasSubtasks && isExpanded && (
                      <div className="mt-3 pt-2.5 border-t border-slate-800/80 space-y-1.5 pl-6">
                        {todo.subtasks.map((st) => (
                          <div
                            key={st.id}
                            onClick={() => onToggleSubtask(todo.id, st.id)}
                            className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none py-0.5"
                          >
                            <span
                              className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${
                                st.done
                                  ? 'bg-emerald-500 border-emerald-500 text-slate-900'
                                  : 'border-slate-600 bg-slate-800'
                              }`}
                            >
                              {st.done && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                            </span>
                            <span className={st.done ? 'line-through text-slate-500' : ''}>
                              {st.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: NOTES */}
      {activeTab === 'notes' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredNotes.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
              <FileText className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-300">Belum ada catatan</p>
              <p className="text-xs text-slate-500 mt-1">Buat catatan ide, rencana sprint, atau wishlist Anda.</p>
            </div>
          ) : (
            filteredNotes.map((note) => {
              const isDarkColor = note.color === '#1E293B';
              return (
                <div
                  key={note.id}
                  style={{ backgroundColor: note.color }}
                  className={`rounded-2xl p-4 shadow-md transition relative flex flex-col justify-between ${
                    isDarkColor ? 'text-slate-100 border border-slate-700' : 'text-slate-900'
                  }`}
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="text-sm font-bold leading-snug line-clamp-2">
                        {note.title}
                      </h4>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onTogglePinNote(note.id)}
                          className={`p-1 rounded-lg transition ${
                            note.isPinned ? 'text-amber-700' : 'text-slate-500 hover:text-slate-800'
                          }`}
                          title={note.isPinned ? 'Lepas Pin' : 'Pin Catatan'}
                        >
                          <Pin className={`w-3.5 h-3.5 ${note.isPinned ? 'fill-amber-600' : ''}`} />
                        </button>
                        <button
                          onClick={() => openEditNote(note)}
                          className="p-1 rounded-lg text-slate-600 hover:text-slate-900"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteNote(note.id)}
                          className="p-1 rounded-lg text-slate-600 hover:text-rose-700"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Content */}
                    <p className="text-xs leading-relaxed whitespace-pre-line opacity-90 mb-3">
                      {note.content}
                    </p>
                  </div>

                  {/* Footer with Tags & Copy */}
                  <div className="pt-2 border-t border-black/10 flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="font-bold px-1.5 py-0.5 rounded bg-black/10">
                        {note.category}
                      </span>
                      {note.tags.map((tg, idx) => (
                        <span key={idx} className="opacity-75">
                          #{tg}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={() => handleCopyNote(note.content, note.id)}
                      className="p-1 rounded bg-black/10 hover:bg-black/20 transition"
                      title="Salin Konten"
                    >
                      {copiedNoteId === note.id ? (
                        <Check className="w-3 h-3 text-emerald-800" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ADD/EDIT NOTE MODAL */}
      {isNoteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-t-3xl sm:rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                <span>{editingNote ? 'Edit Catatan' : 'Buat Catatan Baru'}</span>
              </h3>
              <button onClick={() => setIsNoteModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNote} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Judul Catatan *</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Ide Project, Catatan Rapat..."
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Isi Catatan</label>
                <textarea
                  rows={4}
                  placeholder="Tuliskan ide atau rincian di sini..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Kategori</label>
                  <select
                    value={noteCategory}
                    onChange={(e) => setNoteCategory(e.target.value as NoteCategory)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Ide">Ide</option>
                    <option value="Kerja">Kerja</option>
                    <option value="Pribadi">Pribadi</option>
                    <option value="Belanja">Belanja</option>
                    <option value="Belajar">Belajar</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Tags (Pisahkan koma)</label>
                  <input
                    type="text"
                    placeholder="Tech, Desain, Target"
                    value={noteTags}
                    onChange={(e) => setNoteTags(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1.5">Warna Kartu</label>
                <div className="flex items-center gap-2">
                  {NOTE_COLORS.map((col) => (
                    <button
                      key={col.value}
                      type="button"
                      onClick={() => setNoteColor(col.value)}
                      style={{ backgroundColor: col.value }}
                      className={`w-7 h-7 rounded-full border-2 transition ${
                        noteColor === col.value ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-80'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsNoteModalOpen(false)}
                  className="w-1/2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow"
                >
                  Simpan Catatan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD/EDIT TODO MODAL WITH AI BREAKDOWN */}
      {isTodoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-t-3xl sm:rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-blue-400" />
                <span>{editingTodo ? 'Edit Tugas' : 'Tambah Tugas Baru'}</span>
              </h3>
              <button onClick={() => setIsTodoModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTodo} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Judul Tugas / Aktivitas *</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Selesaikan laporan Q3, Servis motor..."
                  value={todoTitle}
                  onChange={(e) => setTodoTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Prioritas</label>
                  <select
                    value={todoPriority}
                    onChange={(e) => setTodoPriority(e.target.value as PriorityLevel)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Tinggi">🔴 Tinggi</option>
                    <option value="Sedang">🟡 Sedang</option>
                    <option value="Rendah">🔵 Rendah</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Tenggat Waktu</label>
                  <input
                    type="date"
                    value={todoDueDate}
                    onChange={(e) => setTodoDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Kategori Tugas</label>
                <input
                  type="text"
                  placeholder="Kerja, Pribadi, Finansial, Travel..."
                  value={todoCategory}
                  onChange={(e) => setTodoCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Subtasks with AI Trigger */}
              <div className="space-y-2 pt-1 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">Sub-tugas / Checklist</label>
                  <button
                    type="button"
                    onClick={handleAIBreakdown}
                    disabled={!todoTitle.trim() || isGeneratingSubtasks}
                    className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold disabled:opacity-40"
                  >
                    {isGeneratingSubtasks ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Sparkles className="w-3 h-3 text-blue-400" />
                    )}
                    <span>✨ AI Pecah Tugas</span>
                  </button>
                </div>

                {todoSubtaskInputs.map((input, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder={`Langkah ${idx + 1}`}
                      value={input}
                      onChange={(e) => {
                        const next = [...todoSubtaskInputs];
                        next[idx] = e.target.value;
                        setTodoSubtaskInputs(next);
                      }}
                      className="flex-1 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                    {todoSubtaskInputs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          setTodoSubtaskInputs(todoSubtaskInputs.filter((_, i) => i !== idx));
                        }}
                        className="text-slate-500 hover:text-rose-400"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => setTodoSubtaskInputs([...todoSubtaskInputs, ''])}
                  className="text-xs text-blue-400 hover:underline flex items-center gap-1 mt-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Tambah Sub-tugas</span>
                </button>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsTodoModalOpen(false)}
                  className="w-1/2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow"
                >
                  Simpan Tugas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
