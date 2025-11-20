import React, { useState, useEffect } from 'react';
import { Task, TaskStatus, Priority, Subtask } from '../types';
import { X, Sparkles, Plus, Trash2, Loader2, Check } from 'lucide-react';
import { generateSubtasks, suggestPriority } from '../services/geminiService';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  task?: Task | null;
}

export const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onSave, onDelete, task }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>(TaskStatus.TODO);
  const [priority, setPriority] = useState<Priority>(Priority.MEDIUM);
  const [dueDate, setDueDate] = useState('');
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [isAIWorking, setIsAIWorking] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setStatus(task.status);
      setPriority(task.priority);
      setDueDate(task.dueDate || '');
      setSubtasks(task.subtasks);
    } else {
      resetForm();
    }
  }, [task, isOpen]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setStatus(TaskStatus.TODO);
    setPriority(Priority.MEDIUM);
    setDueDate('');
    setSubtasks([]);
  };

  const handleSave = () => {
    if (!title.trim()) return;
    const newTask: Task = {
      id: task?.id || crypto.randomUUID(),
      title,
      description,
      status,
      priority,
      dueDate: dueDate || undefined,
      subtasks,
      createdAt: task?.createdAt || Date.now(),
      tags: task?.tags || []
    };
    onSave(newTask);
    onClose();
  };

  const handleAISubtasks = async () => {
    if (!title) return;
    setIsAIWorking(true);
    try {
      const suggestions = await generateSubtasks(title, description);
      const newSubtasks = suggestions.map(s => ({
        id: crypto.randomUUID(),
        title: s.title,
        completed: false
      }));
      setSubtasks(prev => [...prev, ...newSubtasks]);
    } catch (e) {
      alert("AI is currently unavailable. Please try again.");
    } finally {
      setIsAIWorking(false);
    }
  };

  const handleAIPriority = async () => {
    if (!title) return;
    setIsAIWorking(true);
    try {
      const result = await suggestPriority(title, dueDate);
      setPriority(result.priority as Priority);
      // Optional: Show reason in a toast or tooltip, but for now just setting it
    } catch (e) {
      console.error(e);
    } finally {
      setIsAIWorking(false);
    }
  }

  const toggleSubtask = (id: string) => {
    setSubtasks(prev => prev.map(st => st.id === id ? { ...st, completed: !st.completed } : st));
  };

  const deleteSubtask = (id: string) => {
    setSubtasks(prev => prev.filter(st => st.id !== id));
  };

  const addEmptySubtask = () => {
    setSubtasks(prev => [...prev, { id: crypto.randomUUID(), title: '', completed: false }]);
  };

  const updateSubtaskTitle = (id: string, val: string) => {
    setSubtasks(prev => prev.map(st => st.id === id ? { ...st, title: val } : st));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-2xl sticky top-0 z-10">
          <h2 className="text-xl font-bold text-slate-800">{task ? 'Edit Task' : 'New Task'}</h2>
          <div className="flex items-center gap-2">
            {task && onDelete && (
              <button onClick={() => { onDelete(task.id); onClose(); }} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors">
                <Trash2 size={20} />
              </button>
            )}
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          
          {/* Main Inputs */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
              <input 
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g., Redesign Homepage" 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-lg font-medium placeholder:text-slate-300"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Status</label>
                <select 
                  value={status}
                  onChange={e => setStatus(e.target.value as TaskStatus)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-700 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none bg-white"
                >
                  {Object.values(TaskStatus).map(s => (
                    <option key={s} value={s}>{s.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex justify-between">
                  Priority
                  <button 
                    onClick={handleAIPriority}
                    disabled={isAIWorking || !title}
                    className="text-indigo-600 hover:text-indigo-700 disabled:opacity-50 flex items-center gap-1 text-[10px] font-bold"
                  >
                    <Sparkles size={10} /> AI AUTO
                  </button>
                </label>
                <select 
                  value={priority}
                  onChange={e => setPriority(e.target.value as Priority)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-700 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none bg-white"
                >
                  {Object.values(Priority).map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Due Date</label>
                <input 
                  type="date" 
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-700 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea 
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
                placeholder="Add more details..." 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all resize-none text-slate-600"
              />
            </div>
          </div>

          {/* Subtasks Section */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
             <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  Subtasks
                  <span className="text-xs font-normal text-slate-400 px-2 py-0.5 bg-slate-200 rounded-full">
                    {subtasks.filter(s => s.completed).length}/{subtasks.length}
                  </span>
                </h3>
                <button 
                  onClick={handleAISubtasks}
                  disabled={isAIWorking || !title}
                  className="flex items-center gap-2 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-full transition-colors disabled:opacity-50"
                >
                  {isAIWorking ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                  Gemini Breakdown
                </button>
             </div>

             <div className="space-y-2">
               {subtasks.map(st => (
                 <div key={st.id} className="flex items-center gap-3 group">
                    <button 
                      onClick={() => toggleSubtask(st.id)}
                      className={`flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-colors ${st.completed ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300 hover:border-indigo-400 text-transparent'}`}
                    >
                      <Check size={12} strokeWidth={3} />
                    </button>
                    <input 
                      value={st.title}
                      onChange={(e) => updateSubtaskTitle(st.id, e.target.value)}
                      className={`flex-1 bg-transparent border-none outline-none text-sm ${st.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}
                      placeholder="Subtask item"
                    />
                    <button onClick={() => deleteSubtask(st.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      <X size={16} />
                    </button>
                 </div>
               ))}
               <button onClick={addEmptySubtask} className="flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 mt-2 pl-1">
                 <Plus size={16} /> Add step
               </button>
             </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-white rounded-b-2xl sticky bottom-0">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-lg shadow-indigo-200 transition-all hover:shadow-indigo-300 active:scale-95">
            Save Task
          </button>
        </div>

      </div>
    </div>
  );
};
