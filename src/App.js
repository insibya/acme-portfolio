import React, { useState, useEffect } from 'react';
import axios from 'axios';
import qs from 'qs';
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

	const changeUser = () => {
		window.localStorage.removeItem('userId');
		fetchUser().then((user) => setUser(user));
	};

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

	const getHash = () => {
		return window.location.hash.slice(1);
	};
	const [ params, setParams ] = useState(qs.parse(getHash()));

	useEffect(() => {
		window.addEventListener('hashchange', () => {
			setParams(qs.parse(getHash()));
		});
		setParams(qs.parse(getHash()));
	}, []);

	const view = params.view;
	return (
		<div className="App">
			<header className="App-header">
				<img src={user.avatar} alt="user avatar" />
				<div>{`Welcome, ${user.fullName}!`}</div>
				<button onClick={changeUser}>Change User</button>
			</header>
			<nav>
				<div>
					<a href={`#user=${user.id}&view=notes`} className={view === 'notes' ? 'selected' : ''}>
						Notes
					</a>
					<p>{`You have ${notes.length} notes.`}</p>
				</div>
				<div>
					<a href={`#user=${user.id}&view=vacations`} className={view === 'vacations' ? 'selected' : ''}>
						Vacations
					</a>
					<p>{`You have ${vacations.length} vacations.`}</p>
				</div>
				<div>
					<a
						href={`#user=${user.id}&view=followedcompanies`}
						className={view === 'followedcompanies' ? 'selected' : ''}
					>
						Following Companies
					</a>
					<p>{`You are following ${favCompanies.length} companies.`}</p>
				</div>
			</nav>
		</div>
	);
}

export default App;
