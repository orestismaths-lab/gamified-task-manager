import { Task, Member } from '@/types';
import { format, parseISO } from 'date-fns';

export function exportToCSV(tasks: Task[], members: Member[]): void {
  const headers = ['Title', 'Description', 'Owner', 'Priority', 'Due Date', 'Tags', 'Status', 'Created', 'Updated'];
  const rows = tasks.map(task => {
    const owner = members.find(m => m.id === task.ownerId);
    return [
      task.title,
      task.description || '',
      owner?.name || '',
      task.priority,
      task.dueDate ? format(parseISO(task.dueDate), 'dd/MM/yyyy') : '',
      task.tags.join('; '),
      task.completed ? 'Completed' : 'Active',
      format(parseISO(task.createdAt), 'dd/MM/yyyy HH:mm'),
      format(parseISO(task.updatedAt), 'dd/MM/yyyy HH:mm'),
    ];
  });

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `tasks-export-${format(new Date(), 'yyyy-MM-dd')}.csv`;
  link.click();
}

export function exportToJSON(tasks: Task[], members: Member[]): void {
  const data = {
    exportDate: new Date().toISOString(),
    tasks,
    members,
  };
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `tasks-export-${format(new Date(), 'yyyy-MM-dd')}.json`;
  link.click();
}

export function printTasks(tasks: Task[], members: Member[]): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const ownerMap = new Map(members.map(m => [m.id, m.name]));
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Task List - ${format(new Date(), 'dd/MM/yyyy')}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { color: #7c3aed; }
        .task { margin: 15px 0; padding: 10px; border: 1px solid #ddd; border-radius: 8px; }
        .task.completed { background: #f0f0f0; opacity: 0.7; }
        .task-title { font-weight: bold; font-size: 1.1em; }
        .task-meta { color: #666; font-size: 0.9em; margin-top: 5px; }
        .priority { padding: 2px 8px; border-radius: 4px; font-size: 0.8em; }
        .priority-high { background: #fee2e2; color: #991b1b; }
        .priority-medium { background: #fed7aa; color: #9a3412; }
        .priority-low { background: #dbeafe; color: #1e40af; }
        @media print {
          body { padding: 0; }
          .task { page-break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <h1>Task List - ${format(new Date(), 'dd/MM/yyyy')}</h1>
      <p>Total Tasks: ${tasks.length} | Completed: ${tasks.filter(t => t.completed).length} | Active: ${tasks.filter(t => !t.completed).length}</p>
      ${tasks.map(task => `
        <div class="task ${task.completed ? 'completed' : ''}">
          <div class="task-title">${task.completed ? '✓' : '○'} ${task.title}</div>
          ${task.description ? `<div>${task.description}</div>` : ''}
          <div class="task-meta">
            Owner: ${ownerMap.get(task.ownerId) || 'Unknown'} | 
            Priority: <span class="priority priority-${task.priority}">${task.priority}</span> | 
            ${task.dueDate ? `Due: ${format(parseISO(task.dueDate), 'dd/MM/yyyy')} | ` : ''}
            Tags: ${task.tags.join(', ') || 'None'}
          </div>
        </div>
      `).join('')}
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 250);
}

