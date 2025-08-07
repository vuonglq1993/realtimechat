import { useEffect, useState } from 'react';
import axios from 'axios';

const UserList = ({ user, onSelectUser }) => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      const res = await axios.get('http://localhost:5001/api/users', {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setUsers(res.data.filter((u) => u._id !== user._id));
    };
    fetch();
  }, []);

  return (
    <div style={{ width: '25%', borderRight: '1px solid gray', padding: 10 }}>
      <h3>Users</h3>
      {users.map((u) => (
        <div key={u._id} onClick={() => onSelectUser(u)} style={{ padding: 5, cursor: 'pointer' }}>
          {u.username}
        </div>
      ))}
    </div>
  );
};

export default UserList;
