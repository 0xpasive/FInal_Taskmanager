import { useState, useEffect } from 'react';
import TeamCard from '../TeamComponents/TeamCard';
import { teamAPI } from '../utils/apiTeam';

const MyTeam = () => {
  const [teams, setTeams] = useState([]);
  const [newTeamName, setNewTeamName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

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

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;
    
    await teamAPI.createTeam(newTeamName);
    setNewTeamName('');
    fetchTeams();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading teams...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">My Teams</h1>
        <p className="text-gray-600">Create and manage your teams</p>
      </header>

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