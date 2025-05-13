// src/components/Sidebar.jsx
import { useState } from "react";
import { UserPlus, ChevronLeft, ChevronRight } from "lucide-react";

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`bg-white border-r transition-all duration-300 ${
        collapsed ? "w-16" : "w-64"
      } p-4 relative`}
    >
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-5 bg-white border rounded-full p-1 shadow"
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {!collapsed && (
        <>
          <h2 className="text-lg font-medium mb-4">Team</h2>
          <ul className="space-y-2 text-sm">
            <li className="flex justify-between">
              <span>John Doe</span>
              <span className="text-green-500">Online</span>
            </li>
            <li className="flex justify-between">
              <span>Jane Smith</span>
              <span className="text-gray-400">Offline</span>
            </li>
          </ul>
          <button className="mt-4 flex items-center gap-2 text-blue-600 hover:underline">
            <UserPlus className="w-4 h-4" />
            Invite Member
          </button>
        </>
      )}
    </aside>
  );
}
