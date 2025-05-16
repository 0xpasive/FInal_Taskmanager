// components/InvitationModal.jsx
import React from 'react';
import { Dialog } from '@headlessui/react';
import { X } from 'lucide-react';

const InvitationModal = ({ team, onAccept, onReject }) => {
  return (
    <Dialog open={true} onClose={() => {}} className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen bg-black bg-opacity-40">
        <Dialog.Panel className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-lg font-semibold text-gray-800">
              Team Invitation
            </Dialog.Title>
            <X className="cursor-pointer" onClick={() => onReject(team._id)} />
          </div>

          <p className="mb-4">
            You've been invited to join <strong>{team.name}</strong>.
          </p>

          <div className="flex justify-end gap-2">
            <button
              onClick={() => onReject(team._id)}
              className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-100"
            >
              Reject
            </button>
            <button
              onClick={() => onAccept(team._id)}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Accept
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default InvitationModal;
