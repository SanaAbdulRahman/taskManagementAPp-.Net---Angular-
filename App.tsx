import React, { useState, useEffect } from 'react';
import { Task, TaskStatus, Priority, ColumnDef } from './types';
import { TaskCard } from './components/TaskCard';
import { TaskModal } from './components/TaskModal';
import { NotificationsView } from './components/NotificationsView';
import { Layout, Plus, Search, Bell, User, Settings, Menu } from 'lucide-react';

const COLUMNS: ColumnDef[] = [
  { id: TaskStatus.TODO, title: 'To Do', color: 'bg-slate-500' },
  { id: TaskStatus.IN_PROGRESS, title: 'In Progress', color: 'bg-indigo-500' },
  { id: TaskStatus.REVIEW, title: 'Review', color: 'bg-orange-500' },
  { id: TaskStatus.DONE, title: 'Done', color: 'bg-green-500' },
];

const INITIAL_TASKS: Task[] = [
  {
    id: '1',
    title: 'Research Competitors',
    description: 'Analyze top 3 competitors in the SaaS market regarding pricing and features.',
    status: TaskStatus.IN_PROGRESS,
    priority: Priority.HIGH,
    createdAt: Date.now(),
    dueDate: '2023-12-25',
    subtasks: [
      { id: 's1', title: 'Identify top 3 competitors', completed: true },
      { id: 's2', title: 'Create comparison matrix', completed: false },
    ],
    tags: ['Strategy']
  },
  {
    id: '2',
    title: 'Update Landing Page',
    description: 'Refresh the hero section with new copy and illustrations.',
    status: TaskStatus.TODO,
    priority: Priority.MEDIUM,
    createdAt: Date.now(),
    subtasks: [],
    tags: ['Design']
  }
];

type Tab = 'dashboard' | 'notifications' | 'settings';

function App() {
  // State
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('taskflow-tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  // Effects
  useEffect(() => {
    localStorage.setItem('taskflow-tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Handlers
  const handleSaveTask = (task: Task) => {
    if (editingTask) {
      setTasks(prev => prev.map(t => t.id === task.id ? task : t));
    } else {
      setTasks(prev => [...prev, task]);
    }
    setEditingTask(null);
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const openNewTaskModal = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const openEditTaskModal = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const moveTask = (task: Task, direction: 'forward' | 'back') => {
    const currentIndex = COLUMNS.findIndex(c => c.id === task.status);
    let newIndex = direction === 'forward' ? currentIndex + 1 : currentIndex - 1;
    
    if (newIndex >= 0 && newIndex < COLUMNS.length) {
      const newStatus = COLUMNS[newIndex].id;
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
    }
  };

  // Filtering
  const filteredTasks = tasks.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const urgentCount = tasks.filter(t => t.priority === Priority.URGENT && t.status !== TaskStatus.DONE).length;

  return (
    <div className="flex h-screen bg-slate-50">
      
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-0'} bg-slate-900 text-white transition-all duration-300 ease-in-out overflow-hidden flex flex-col flex-shrink-0 z-20`}>
        <div className="p-6 flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
            <Layout size={18} className="text-white" />
          </div>
          <h1 className="font-bold text-xl tracking-tight">TaskFlow</h1>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-slate-800 text-indigo-300' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <Layout size={20} />
            <span>Dashboard</span>
          </button>
          <button 
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'notifications' ? 'bg-slate-800 text-indigo-300' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <Bell size={20} />
            <span>Notifications</span>
            {urgentCount > 0 && (
              <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {urgentCount}
              </span>
            )}
          </button>
           <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'settings' ? 'bg-slate-800 text-indigo-300' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <Settings size={20} />
            <span>Settings</span>
          </button>
        </nav>

        <div className="p-6 border-t border-slate-800">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700">
            <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">
              JD
            </div>
            <div>
              <p className="text-sm font-medium text-white">John Doe</p>
              <p className="text-xs text-slate-400">Product Manager</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500">
              <Menu size={20} />
            </button>
            <div className="relative hidden md:block">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text"
                placeholder="Search tasks..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-full bg-slate-100 text-slate-700 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none w-64 transition-all focus:w-80"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
             <button 
               onClick={openNewTaskModal}
               className="hidden md:flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-lg shadow-indigo-200 hover:shadow-indigo-300 active:scale-95"
             >
               <Plus size={18} />
               New Task
             </button>
             <button onClick={openNewTaskModal} className="md:hidden p-2 bg-indigo-600 text-white rounded-full shadow-lg">
               <Plus size={20} />
             </button>
          </div>
        </header>

        {/* Dynamic Content Area */}
        <main className="flex-1 overflow-hidden relative">
          {activeTab === 'dashboard' && (
            <div className="h-full overflow-x-auto overflow-y-hidden p-6">
              <div className="flex h-full gap-6 min-w-[1000px]">
                {COLUMNS.map(col => (
                  <div key={col.id} className="flex-1 flex flex-col min-w-[280px] max-w-[350px]">
                    <div className="flex items-center justify-between mb-4 px-1">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${col.color}`} />
                        <h2 className="font-semibold text-slate-700">{col.title}</h2>
                        <span className="text-xs text-slate-400 font-medium bg-slate-100 px-2 py-0.5 rounded-full">
                          {filteredTasks.filter(t => t.status === col.id).length}
                        </span>
                      </div>
                      <button className="text-slate-400 hover:text-slate-600">
                        <Plus size={18} onClick={openNewTaskModal} />
                      </button>
                    </div>

                    <div className="flex-1 bg-slate-100/50 rounded-2xl p-3 overflow-y-auto space-y-3 border border-slate-200/60">
                      {filteredTasks
                        .filter(task => task.status === col.id)
                        .map(task => (
                          <TaskCard 
                            key={task.id} 
                            task={task} 
                            onEdit={openEditTaskModal} 
                            onMove={moveTask}
                          />
                        ))
                      }
                      {filteredTasks.filter(task => task.status === col.id).length === 0 && (
                        <div className="h-32 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                          <p className="text-sm">No tasks</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
             <div className="h-full overflow-y-auto bg-slate-50">
                <NotificationsView tasks={tasks} />
             </div>
          )}

          {activeTab === 'settings' && (
            <div className="flex items-center justify-center h-full text-slate-400">
              <div className="text-center">
                <Settings size={48} className="mx-auto mb-4 opacity-50" />
                <p>Settings panel coming soon.</p>
              </div>
            </div>
          )}
        </main>

      </div>

      {/* Modal */}
      <TaskModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingTask(null); }} 
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
        task={editingTask}
      />
    </div>
  );
}

export default App;