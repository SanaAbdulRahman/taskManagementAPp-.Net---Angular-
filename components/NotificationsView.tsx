import React from 'react';
import { Task, Priority, TaskStatus } from '../types';
import { Bell, AlertCircle, Info, Clock, CheckCircle2 } from 'lucide-react';

interface NotificationsViewProps {
  tasks: Task[];
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({ tasks }) => {
  const urgentTasks = tasks.filter(t => t.priority === Priority.URGENT && t.status !== TaskStatus.DONE);
  const dueSoonTasks = tasks.filter(t => {
    if (!t.dueDate || t.status === TaskStatus.DONE) return false;
    const due = new Date(t.dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 3;
  });
  
  // Sort urgent tasks by creation date (newest first is usually better, but tasks don't change much here)
  
  return (
    <div className="max-w-3xl mx-auto w-full p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
            <h2 className="text-2xl font-bold text-slate-800">Notifications</h2>
            <p className="text-slate-500 text-sm">Stay updated with your project activity</p>
        </div>
        <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium px-4 py-2 bg-indigo-50 rounded-lg transition-colors">
            Mark all as read
        </button>
      </div>
      
      <div className="space-y-4">
        {/* System Welcome */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex gap-4 transition-all hover:shadow-md items-start">
            <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
                <Info size={20} />
            </div>
            <div className="flex-1">
                <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-slate-800 text-sm">Welcome to TaskFlow AI</h3>
                    <span className="text-xs text-slate-400 whitespace-nowrap">Just now</span>
                </div>
                <p className="text-slate-600 text-sm mt-1">
                    Your workspace is ready. Try creating a new task and use the Gemini AI button to break it down into subtasks automatically.
                </p>
            </div>
        </div>

        {/* Urgent Tasks */}
        {urgentTasks.map(task => (
            <div key={`urgent-${task.id}`} className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-l-red-500 border-y border-r border-slate-200 flex gap-4 transition-all hover:shadow-md items-start">
                <div className="flex-shrink-0 w-10 h-10 bg-red-50 text-red-500 rounded-full flex items-center justify-center">
                    <AlertCircle size={20} />
                </div>
                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-slate-800 text-sm">Urgent Attention Required</h3>
                        <span className="text-xs text-slate-400 whitespace-nowrap">Priority Alert</span>
                    </div>
                    <p className="text-slate-600 text-sm mt-1">
                        Task <span className="font-medium text-slate-900">"{task.title}"</span> is marked as Urgent. Please review it immediately.
                    </p>
                </div>
            </div>
        ))}

        {/* Due Soon */}
        {dueSoonTasks.map(task => (
             <div key={`due-${task.id}`} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex gap-4 transition-all hover:shadow-md items-start">
                <div className="flex-shrink-0 w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center">
                    <Clock size={20} />
                </div>
                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-slate-800 text-sm">Approaching Deadline</h3>
                        <span className="text-xs text-slate-400 whitespace-nowrap">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Soon'}</span>
                    </div>
                    <p className="text-slate-600 text-sm mt-1">
                        Task <span className="font-medium text-slate-900">"{task.title}"</span> is due soon.
                    </p>
                </div>
            </div>
        ))}

         {/* Empty State if no real notifications */}
         {urgentTasks.length === 0 && dueSoonTasks.length === 0 && (
            <div className="py-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                    <Bell size={24} className="text-slate-400" />
                </div>
                <h3 className="text-slate-900 font-medium">All caught up!</h3>
                <p className="text-slate-500 text-sm mt-1">No new alerts or deadlines at the moment.</p>
            </div>
         )}
      </div>
    </div>
  );
};