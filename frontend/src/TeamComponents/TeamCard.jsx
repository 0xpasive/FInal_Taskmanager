import { useState } from 'react';
import AddMemberModal from './AddMemberModal';
import { teamAPI } from '../utils/apiTeam';
import { Plus, Trash2 } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const TeamCard = ({ team, onUpdate, userId }) => {
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [error, setError] = useState("");

  const isCreator = userId === team.createdBy._id;

  

  const handleDeleteTeam = async () => {
    try {
      await teamAPI.deleteTeam(team._id);
      onUpdate();
      toast.success("Team deleted successfully!"); // Optional: Success feedback
    } catch (error) {
      console.error("Failed to delete team:", error);
      
      // Check if the error is due to unauthorized access (403)
      if (error.response?.status === 404) {
        setError("You don't have permission to delete this team.");
        toast.error("You don't have permission to delete this team."); // Optional
      } else {
        setError("Failed to delete team. Please try again.");
        toast.error("Failed to delete team. Please try again."); // Optional
      }
    } finally {
      setShowDeleteModal(false); // Close modal after action
    }
  };
  const handleRemoveMember = async (userIdToRemove) => {
  try {
    const updatedTeam = await teamAPI.removeMember(team._id, userIdToRemove);

    // Optionally update the local state (if you have team members in state)
    onUpdate(); // update with latest data from backend

    toast.success("member removed sucessfully")
  } catch (error) {
    console.error("Error removing member:", error);
    toast.error("Only leader can remove member");
  }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4">
      {/* Team Name and Delete Button */}
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold text-gray-800">{team.name}</h3>
        <div className="flex items-center gap-2">
          
          {isCreator && (
  <button 
    onClick={() => setShowDeleteModal(true)}
    className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
  >
    <Trash2 size={20} />
  </button>
)}
         
        </div>
      </div>

      {/* Members Header and Add Button */}
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-sm font-medium text-gray-500">Members:</h4>
        {isCreator && (
  <button 
    onClick={() => setIsAddMemberOpen(true)}
    className="p-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
  >
    <Plus size={16} />
  </button>
)}
      </div>

      {/* Members List */}
            <div className="space-y-4">
        {/* Verified Members */}
        <div>
          <h5 className="text-sm text-green-600 font-medium mb-1">Verified Members:</h5>
          <ul className="space-y-2">
            {team.members.filter(m => m.isVerified).map(member => {
              const isCreator = member.user._id === team.createdBy._id;
              return (
                <li key={member._id} className="py-2 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className={`text-gray-700 ${isCreator ? 'font-semibold text-blue-600' : ''}`}>
                      {member.user.fullname}
                    </span>
                  </div>
                  {isCreator ? (
                    <span className="bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full">
                      Leader
                    </span>
                  ) : (
                    
                    <button
                      onClick={() => handleRemoveMember(member.user._id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

  {/* Non-Verified Members */}
        {team.members.some(m => !m.isVerified) && (
  <div>
    <h5 className="text-sm text-yellow-600 font-medium mb-1">Pending Members</h5>
    <ul className="space-y-2">
      {team.members.filter(m => !m.isVerified).map(member => (
        <li key={member._id} className="py-2 flex justify-between items-center">
          <span className="text-gray-700">{member.user.fullname}</span>
          <button
            onClick={() => handleRemoveMember(member.user._id)}
            className="text-red-500 hover:text-red-700 text-sm"
          >
            Remove
          </button>
        </li>
      ))}
    </ul>
  </div>
)}
</div>


      <AddMemberModal
        isOpen={isAddMemberOpen}
        onClose={() => setIsAddMemberOpen(false)}
        teamId={team._id}
        onSuccess={onUpdate}
      />
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setError(""); // Clear error when closing modal
        }}
        onConfirm={handleDeleteTeam}
        message={`Are you sure you want to delete "${team.name}" permanently? This action cannot be undone.`}
      />
    </div>
  );
};

export default TeamCard;