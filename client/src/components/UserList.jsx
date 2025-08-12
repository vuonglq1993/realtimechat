import { useEffect, useState } from 'react';
import axios from 'axios';

const UserList = ({ user, onSelectUser, unreadCounts }) => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get('http://localhost:5001/api/users', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setUsers(res.data.filter((u) => u._id !== user._id));
      } catch (err) {
        console.error('❌ Failed to fetch users:', err);
      }
    };
    fetchUsers();
  }, [user]);

  return (
    <div style={{ width: '25%', borderRight: '1px solid gray', padding: 10 }}>
      <h3>Users</h3>
      {users.map((u) => (
        <div
          key={u._id}
          onClick={() => onSelectUser(u)}
          style={{
            padding: '8px',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #ddd',
          }}
        >
          <span>{u.username}</span>
          {unreadCounts?.[u._id] > 0 && (
            <span
              style={{
                background: 'red',
                color: 'white',
                borderRadius: '50%',
                padding: '2px 6px',
                fontSize: '12px',
                minWidth: '20px',
                textAlign: 'center',
              }}
            >
              {unreadCounts[u._id]}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

export default UserList;
