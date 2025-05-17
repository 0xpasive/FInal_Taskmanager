import { useState, useEffect } from 'react';
import TeamCard from '../TeamComponents/TeamCard';
import { teamAPI } from '../utils/apiTeam';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const MyTeam = () => {
  const [teams, setTeams] = useState([]);
  const [newTeamName, setNewTeamName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [invitations, setInvitations] = useState([]);
 

  const fetchTeams = async () => {
    setIsLoading(true);
    try {
      const data = await teamAPI.getTeams();
      setTeams(data);
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInvitations = async () => {
    setIsLoading(true);
    try {
      const data = await teamAPI.getInvitations();
      
      setInvitations(data);
    } catch(error) {
      console.error('Error fetching invitations', error);
      setInvitations([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
    fetchInvitations();
  }, []);

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;
    
    await teamAPI.createTeam(newTeamName);
    setNewTeamName('');
    fetchTeams();
  };

  const handleAcceptInvitation = async (teamId) => {
    try {
      await teamAPI.acceptInvitation(teamId);
      fetchInvitations();
      fetchTeams(); // Refresh teams list as user is now part of a new team
      toast.success("Accepted!")
    } catch (error) {
      console.error('Error accepting invitation:', error);
    } finally {
      
    }
  };

  const handleRejectInvitation = async (teamId) => {
    try {
      await teamAPI.declineInvitation(teamId);
      
      toast.success("Rejected");
      await Promise.all([fetchInvitations(), fetchTeams()]);
    
    } catch (error) {
      console.error('Error declining invitation:', error);
    } finally {
      
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading teams...</p>
      </div>
    );
  }

  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">My Teams</h1>
        <p className="text-gray-600">Create and manage your teams</p>
      </header>

      {/* Invitations Section */}
      {invitations.map(invitation => (
  <div key={invitation._id} className="mb-4 last:mb-0 p-4 border border-gray-200 rounded-lg shadow-sm bg-white">
    <p className="text-gray-700 mb-3">
      You've been invited to join <span className="font-semibold text-gray-900">{invitation.name}</span> by <span className="font-semibold text-gray-900">{invitation.createdBy.fullname}</span>
    </p>
    <div className="flex gap-2">
      <button
        onClick={() => handleAcceptInvitation(invitation._id)}
        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
      >
        Accept
      </button>
      <button
        onClick={() => handleRejectInvitation(invitation._id)}
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
      >
        Reject
      </button>
    </div>
  </div>
))}

      <div className="mb-8">
        <form onSubmit={handleCreateTeam} className="flex gap-3">
          <input
            type="text"
            value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value)}
            placeholder="Enter team name"
            className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
          >
            Create Team
          </button>
        </form>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {teams.length > 0 ? (
          teams.map(team => (
            <TeamCard 
              key={team._id} 
              team={team} 
              userId={user.id}
              onUpdate={fetchTeams}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-10">
            <p className="text-gray-500">You haven't created any teams yet.</p>
          </div>
        )}
      </div>

      
      
    </div>
  );
};

export default MyTeam;