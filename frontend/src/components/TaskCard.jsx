// src/components/TaskCard.jsx
export default function TaskCard({ task }) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
        <h3 className="font-semibold text-xl">{task.title}</h3>
        <p className="text-sm text-gray-500">Deadline: {task.deadline}</p>
        
        <div className="space-y-2">
          <div className="flex flex-col items-start space-y-1">
            <span className="bg-red-100 text-red-600 px-2 py-1 rounded">
              Severity: {task.severity}
            </span>
            <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
              Status: {task.status}
            </span>
            
          </div>
        </div>
      </div>
    );
  }
  