import { useState } from 'react';
import AddMemberModal from './AddMemberModal';
import { teamAPI } from '../utils/apiTeam';

const TeamCard = ({ team, onUpdate }) => {
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);

  const handleRemoveMember = async (userId) => {
    await teamAPI.removeMember(team._id, userId);
    onUpdate();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold text-gray-800">{team.name}</h3>
        <button 
          onClick={() => setIsAddMemberOpen(true)}
          className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
        >
          Add Member
        </button>
      </div>
      
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-500">Members:</h4>
        {team.members.length > 0 ? (
         <ul>
         {team.members.map(member => {
           const isCreator = member._id === team.createdBy;
       
           return (
             <li key={member._id} className="py-2 flex justify-between items-center">
               <div className="flex items-center gap-2">
                 <span
                   className={`text-gray-700 ${isCreator ? 'font-semibold text-blue-600' : ''}`}
                 >
                   {member.fullname}
                 </span>
       
                 
               </div>
               {isCreator && (
                   <span className="bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full">
                     Leader
                   </span>
                 )}
               {!isCreator && (
                 <button
                   onClick={() => handleRemoveMember(member._id)}
                   className="text-red-500 hover:text-red-700 text-sm"
                 >
                   Remove
                 </button>
               )}
             </li>
           );
         })}
       </ul>
       
        ) : (
          <p className="text-gray-400 italic">No members yet</p>
        )}
      </div>

      <AddMemberModal
        isOpen={isAddMemberOpen}
        onClose={() => setIsAddMemberOpen(false)}
        teamId={team._id}
        onSuccess={onUpdate}
      />
    </div>
  );
};

export default TeamCard;