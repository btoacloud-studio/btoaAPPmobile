/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { TabType, NusaLifeAppState, PasswordItem, NoteItem, TodoItem, FinanceTransaction, TravelTrip, UserProfile } from './types';
import { loadAppState, saveAppState, resetAppState } from './utils/storage';
import { MobileShell } from './components/common/MobileShell';
import { Header } from './components/common/Header';
import { BottomNav } from './components/common/BottomNav';
import { AIAssistantModal } from './components/common/AIAssistantModal';

import { DashboardView } from './components/dashboard/DashboardView';
import { PasswordCloudView } from './components/passwords/PasswordCloudView';
import { NotesTodosView } from './components/notes/NotesTodosView';
import { FinanceView } from './components/finance/FinanceView';
import { TravelTimelineView } from './components/travel/TravelTimelineView';
import { ProfileSettingsView } from './components/profile/ProfileSettingsView';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
  const [appState, setAppState] = useState<NusaLifeAppState>(() => loadAppState());
  const [isAIOpen, setIsAIOpen] = useState(false);

  // Sync state changes with localStorage
  useEffect(() => {
    saveAppState(appState);
  }, [appState]);

  // Tab switching with scroll to top
  const handleSelectTab = (tab: TabType) => {
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Quick Action Handler from Dashboard
  const handleQuickAdd = (type: 'transaction' | 'todo' | 'password' | 'trip') => {
    if (type === 'transaction') setCurrentTab('finance');
    else if (type === 'todo') setCurrentTab('notes');
    else if (type === 'password') setCurrentTab('passwords');
    else if (type === 'trip') setCurrentTab('travel');
  };

  // Update Habit
  const handleUpdateHabit = (habitId: string, delta: number) => {
    setAppState((prev) => ({
      ...prev,
      habits: prev.habits.map((h) => {
        if (h.id !== habitId) return h;
        const newCurrent = Math.min(h.current + delta * 100, h.target * 2);
        return {
          ...h,
          current: newCurrent,
          completed: newCurrent >= h.target,
        };
      }),
    }));
  };

  // Password Handlers
  const handleAddPassword = (item: Omit<PasswordItem, 'id' | 'updatedAt'>) => {
    const newItem: PasswordItem = {
      ...item,
      id: `pwd-${Date.now()}`,
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    setAppState((prev) => ({
      ...prev,
      passwords: [newItem, ...prev.passwords],
    }));
  };

  const handleUpdatePassword = (id: string, updated: Partial<PasswordItem>) => {
    setAppState((prev) => ({
      ...prev,
      passwords: prev.passwords.map((p) => (p.id === id ? { ...p, ...updated, updatedAt: new Date().toISOString().slice(0, 10) } : p)),
    }));
  };

  const handleDeletePassword = (id: string) => {
    setAppState((prev) => ({
      ...prev,
      passwords: prev.passwords.filter((p) => p.id !== id),
    }));
  };

  const handleToggleFavoritePassword = (id: string) => {
    setAppState((prev) => ({
      ...prev,
      passwords: prev.passwords.map((p) => (p.id === id ? { ...p, isFavorite: !p.isFavorite } : p)),
    }));
  };

  const handleUnlockVault = () => {
    setAppState((prev) => ({
      ...prev,
      profile: { ...prev.profile, isVaultLocked: false },
    }));
  };

  const handleLockVault = () => {
    setAppState((prev) => ({
      ...prev,
      profile: { ...prev.profile, isVaultLocked: true },
    }));
  };

  // Notes Handlers
  const handleAddNote = (note: Omit<NoteItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newNote: NoteItem = {
      ...note,
      id: `note-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setAppState((prev) => ({
      ...prev,
      notes: [newNote, ...prev.notes],
    }));
  };

  const handleUpdateNote = (id: string, note: Partial<NoteItem>) => {
    setAppState((prev) => ({
      ...prev,
      notes: prev.notes.map((n) => (n.id === id ? { ...n, ...note, updatedAt: new Date().toISOString() } : n)),
    }));
  };

  const handleDeleteNote = (id: string) => {
    setAppState((prev) => ({
      ...prev,
      notes: prev.notes.filter((n) => n.id !== id),
    }));
  };

  const handleTogglePinNote = (id: string) => {
    setAppState((prev) => ({
      ...prev,
      notes: prev.notes.map((n) => (n.id === id ? { ...n, isPinned: !n.isPinned } : n)),
    }));
  };

  // To-Do Handlers
  const handleAddTodo = (todo: Omit<TodoItem, 'id' | 'createdAt'>) => {
    const newTodo: TodoItem = {
      ...todo,
      id: `td-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setAppState((prev) => ({
      ...prev,
      todos: [newTodo, ...prev.todos],
    }));
  };

  const handleUpdateTodo = (id: string, todo: Partial<TodoItem>) => {
    setAppState((prev) => ({
      ...prev,
      todos: prev.todos.map((t) => (t.id === id ? { ...t, ...todo } : t)),
    }));
  };

  const handleDeleteTodo = (id: string) => {
    setAppState((prev) => ({
      ...prev,
      todos: prev.todos.filter((t) => t.id !== id),
    }));
  };

  const handleToggleTodoComplete = (id: string) => {
    setAppState((prev) => ({
      ...prev,
      todos: prev.todos.map((t) => (t.id === id ? { ...t, isCompleted: !t.isCompleted } : t)),
    }));
  };

  const handleToggleSubtask = (todoId: string, subtaskId: string) => {
    setAppState((prev) => ({
      ...prev,
      todos: prev.todos.map((t) => {
        if (t.id !== todoId) return t;
        const updatedSubtasks = t.subtasks.map((st) => (st.id === subtaskId ? { ...st, done: !st.done } : st));
        const allDone = updatedSubtasks.length > 0 && updatedSubtasks.every((st) => st.done);
        return {
          ...t,
          subtasks: updatedSubtasks,
          isCompleted: allDone ? true : t.isCompleted,
        };
      }),
    }));
  };

  // Finance Handlers
  const handleAddTransaction = (trx: Omit<FinanceTransaction, 'id'>) => {
    const newTrx: FinanceTransaction = {
      ...trx,
      id: `trx-${Date.now()}`,
    };
    setAppState((prev) => ({
      ...prev,
      transactions: [newTrx, ...prev.transactions],
    }));
  };

  const handleDeleteTransaction = (id: string) => {
    setAppState((prev) => ({
      ...prev,
      transactions: prev.transactions.filter((t) => t.id !== id),
    }));
  };

  // Travel Handlers
  const handleAddTrip = (trip: Omit<TravelTrip, 'id'>) => {
    const newTrip: TravelTrip = {
      ...trip,
      id: `trip-${Date.now()}`,
    };
    setAppState((prev) => ({
      ...prev,
      trips: [newTrip, ...prev.trips],
    }));
  };

  const handleUpdateTrip = (id: string, trip: Partial<TravelTrip>) => {
    setAppState((prev) => ({
      ...prev,
      trips: prev.trips.map((t) => (t.id === id ? { ...t, ...trip } : t)),
    }));
  };

  const handleDeleteTrip = (id: string) => {
    setAppState((prev) => ({
      ...prev,
      trips: prev.trips.filter((t) => t.id !== id),
    }));
  };

  const handleTogglePackingItem = (tripId: string, itemId: string) => {
    setAppState((prev) => ({
      ...prev,
      trips: prev.trips.map((t) => {
        if (t.id !== tripId) return t;
        return {
          ...t,
          packingList: t.packingList.map((p) => (p.id === itemId ? { ...p, packed: !p.packed } : p)),
        };
      }),
    }));
  };

  // Profile & System Handlers
  const handleUpdateProfile = (updated: Partial<UserProfile>) => {
    setAppState((prev) => ({
      ...prev,
      profile: { ...prev.profile, ...updated },
    }));
  };

  const handleResetData = () => {
    const fresh = resetAppState();
    setAppState(fresh);
  };

  const handleImportData = (imported: NusaLifeAppState) => {
    setAppState(imported);
    saveAppState(imported);
  };

  const pendingTasksCount = appState.todos.filter((t) => !t.isCompleted).length;

  return (
    <MobileShell>
      {/* Dynamic Header */}
      <Header
        currentTab={currentTab}
        profile={appState.profile}
        onOpenAI={() => setIsAIOpen(true)}
        onSelectTab={handleSelectTab}
      />

      {/* Main View Router */}
      <div className="pt-2">
        {currentTab === 'dashboard' && (
          <DashboardView
            state={appState}
            onSelectTab={handleSelectTab}
            onOpenAI={() => setIsAIOpen(true)}
            onUpdateHabit={handleUpdateHabit}
            onQuickAdd={handleQuickAdd}
          />
        )}

        {currentTab === 'passwords' && (
          <PasswordCloudView
            passwords={appState.passwords}
            isLocked={appState.profile.isVaultLocked}
            pinCode={appState.profile.pinCode}
            isBiometricEnabled={appState.profile.isBiometricEnabled}
            onUnlock={handleUnlockVault}
            onLock={handleLockVault}
            onAddPassword={handleAddPassword}
            onUpdatePassword={handleUpdatePassword}
            onDeletePassword={handleDeletePassword}
            onToggleFavorite={handleToggleFavoritePassword}
          />
        )}

        {currentTab === 'notes' && (
          <NotesTodosView
            notes={appState.notes}
            todos={appState.todos}
            onAddNote={handleAddNote}
            onUpdateNote={handleUpdateNote}
            onDeleteNote={handleDeleteNote}
            onTogglePinNote={handleTogglePinNote}
            onAddTodo={handleAddTodo}
            onUpdateTodo={handleUpdateTodo}
            onDeleteTodo={handleDeleteTodo}
            onToggleTodoComplete={handleToggleTodoComplete}
            onToggleSubtask={handleToggleSubtask}
          />
        )}

        {currentTab === 'finance' && (
          <FinanceView
            transactions={appState.transactions}
            onAddTransaction={handleAddTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            onOpenAI={() => setIsAIOpen(true)}
          />
        )}

        {currentTab === 'travel' && (
          <TravelTimelineView
            trips={appState.trips}
            onAddTrip={handleAddTrip}
            onUpdateTrip={handleUpdateTrip}
            onDeleteTrip={handleDeleteTrip}
            onTogglePackingItem={handleTogglePackingItem}
          />
        )}

        {currentTab === 'profile' && (
          <ProfileSettingsView
            profile={appState.profile}
            appState={appState}
            onUpdateProfile={handleUpdateProfile}
            onResetData={handleResetData}
            onImportData={handleImportData}
            onLockVault={handleLockVault}
          />
        )}
      </div>

      {/* Persistent Bottom Navigation Dock */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        pendingTasksCount={pendingTasksCount}
        vaultLocked={appState.profile.isVaultLocked}
      />

      {/* AI Assistant Modal */}
      <AIAssistantModal
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
        appState={appState}
      />
    </MobileShell>
  );
}
