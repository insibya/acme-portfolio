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
	const [ notes, setNotes ] = useState({});
	const [ newNote, setNewNote ] = useState('');
	const [ vacations, setVacations ] = useState({});
	const [ newStartDate, setNewStartDate ] = useState('');
	const [ newEndDate, setNewEndDate ] = useState('');
	const [ favCompanies, setFavCompanies ] = useState({});
	const [ newFavCo, setNewFavCo ] = useState({});

	useEffect(() => {
		fetchUser().then((user) => setUser(user));
	}, []);

	useEffect(
		() => {
			if (user.id) {
				axios.get(`${API}/users/${user.id}/notes`).then((notes) => setNotes(notes.data));
			}
		},
		[ user.id ]
	);

	useEffect(
		() => {
			if (user.id) {
				axios.get(`${API}/users/${user.id}/vacations`).then((vacations) => setVacations(vacations.data));
			}
		},
		[ user.id ]
	);

	useEffect(
		() => {
			if (user.id) {
				axios
					.get(`${API}/users/${user.id}/followingCompanies`)
					.then((companies) => setFavCompanies(companies.data));
			}
		},
		[ user.id ]
	);

	const changeUser = () => {
		window.localStorage.removeItem('userId');
		fetchUser().then((user) => setUser(user));
	};

	return (
		<div className="App">
			<header className="App-header">
				<img src={user.avatar} alt="user avatar" />
				<div>{`Welcome, ${user.fullName}!`}</div>
				<button onClick={changeUser}>Change User</button>
			</header>
			<nav>
				<div>
					<h2>Notes</h2>
					<p>{`You have ${notes.length} notes.`}</p>
				</div>
				<div>
					<h2>Vacations</h2>
					<p>{`You have ${vacations.length} vacations.`}</p>
				</div>
				<div>
					<h2>Following Companies</h2>
					<p>{`You are following ${favCompanies.length} companies.`}</p>
				</div>
			</nav>
		</div>
	);
}

export default App;
