import React from 'react';

const ProfileButton = ({ user, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
    >
      {user?.avatar ? (
        <img src={user.avatar} alt="Profile" className="h-full w-full rounded-full object-cover" />
      ) : (
        <span className="font-medium">
          {user?.fullname?.split(' ').map(n => n[0]).join('')}
        </span>
      )}
    </button>
  );
};

export default ProfileButton;