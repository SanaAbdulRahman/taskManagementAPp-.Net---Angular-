import React from 'react';
import { Task, Priority, TaskStatus } from '../types';
import { Calendar, ChevronRight, MoreHorizontal, AlertCircle, CheckCircle2 } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onMove: (task: Task, direction: 'forward' | 'back') => void;
}

const priorityColors: Record<Priority, string> = {
  [Priority.LOW]: 'bg-blue-100 text-blue-700 border-blue-200',
  [Priority.MEDIUM]: 'bg-slate-100 text-slate-700 border-slate-200',
  [Priority.HIGH]: 'bg-orange-100 text-orange-700 border-orange-200',
  [Priority.URGENT]: 'bg-red-100 text-red-700 border-red-200',
};

export const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onMove }) => {
  const completedSubtasks = task.subtasks.filter(st => st.completed).length;
  const totalSubtasks = task.subtasks.length;
  const progress = totalSubtasks === 0 ? 0 : (completedSubtasks / totalSubtasks) * 100;

  return (
    <div className="group bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all duration-200 relative">
      <div className="flex justify-between items-start mb-2">
        <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${priorityColors[task.priority]}`}>
          {task.priority}
        </span>
        <button 
          onClick={() => onEdit(task)}
          className="text-slate-400 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <MoreHorizontal size={16} />
        </button>
      </div>
      
      <h3 className="font-semibold text-slate-800 mb-1 truncate cursor-pointer" onClick={() => onEdit(task)}>
        {task.title}
      </h3>
      
      <p className="text-slate-500 text-sm mb-3 line-clamp-2 min-h-[20px]">
        {task.description || "No description provided."}
      </p>

      {totalSubtasks > 0 && (
        <div className="mb-3">
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-500 rounded-full transition-all duration-500" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-2">
        <div className="flex items-center space-x-2 text-xs text-slate-400">
          {task.dueDate && (
            <div className="flex items-center text-slate-500">
              <Calendar size={12} className="mr-1" />
              <span>{new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
            </div>
          )}
          {totalSubtasks > 0 && (
             <div className="flex items-center" title={`${completedSubtasks}/${totalSubtasks} subtasks`}>
                <CheckCircle2 size={12} className="mr-1" />
                <span>{completedSubtasks}/{totalSubtasks}</span>
             </div>
          )}
        </div>
        
        <div className="flex space-x-1">
           {task.status !== TaskStatus.TODO && (
             <button 
               onClick={(e) => { e.stopPropagation(); onMove(task, 'back'); }}
               className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600"
               title="Move Back"
             >
               <ChevronRight size={16} className="rotate-180" />
             </button>
           )}
           {task.status !== TaskStatus.DONE && (
             <button 
               onClick={(e) => { e.stopPropagation(); onMove(task, 'forward'); }}
               className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-indigo-600"
               title="Move Forward"
             >
               <ChevronRight size={16} />
             </button>
           )}
        </div>
      </div>
    </div>
  );
};
