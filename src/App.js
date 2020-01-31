import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API = 'https://acme-users-api-rev.herokuapp.com/api';

const fetchUser = async () => {
	const storage = window.localStorage;
	const userId = storage.getItem('userId');
	if (userId) {
		try {
			return (await axios.get(`${API}/users/detail/${userId}`)).data;
		} catch (ex) {
			storage.removeItem('userId');
			return fetchUser();
		}
	}
	const user = (await axios.get(`${API}/users/random`)).data;
	storage.setItem('userId', user.id);
	return user;
};

function App() {
	const [ user, setUser ] = useState({});

	useEffect(() => {
		fetchUser().then((user) => setUser(user));
	}, []);

	console.log(user);

	return (
		<div className="App">
			<header className="App-header">
				<img src={user.avatar} alt="user avatar" />
				<div>{`Welcome ${user.fullName}`}</div>
				<button>Change User</button>
			</header>
		</div>
	);
}

export default App;
