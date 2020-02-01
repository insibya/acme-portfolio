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
		window.location.hash = '#view=home';
	};

	useEffect(
		() => {
			if (user.id) {
				axios.get(`${API}/users/${user.id}/notes`).then((notes) => setNotes(notes.data));
				axios.get(`${API}/users/${user.id}/vacations`).then((vacations) => setVacations(vacations.data));
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

	const Home = ({ notes, vacations, favCompanies }) => {
		return (
			<div>
				<h2>Home</h2>
				<nav>
					<div>
						<a href={'#view=notes'}>Notes</a>
						<p>{`You have ${notes.length} notes.`}</p>
					</div>
					<div>
						<a href={'#view=vacations'}>Vacations</a>
						<p>{`You have ${vacations.length} vacations.`}</p>
					</div>
					<div>
						<a href={'#view=followedcompanies'}>Following Companies</a>
						<p>{`You are following ${favCompanies.length} companies.`}</p>
					</div>
				</nav>
			</div>
		);
	};

	const Notes = ({ notes }) => {
		return (
			<div>
				<h2>Notes</h2>
				<ul>
					{notes.length ? (
						notes.map((note, idx) => {
							return <li key={idx}>{note.id}</li>;
						})
					) : null}
				</ul>
			</div>
		);
	};

	const Vacations = ({ vacations }) => {
		return (
			<div>
				<h2>Vacations</h2>
				<ul>
					{vacations.length ? (
						vacations.map((vacation, idx) => {
							return (
								<li key={idx}>
									{vacation.startDate} - {vacation.endDate}
								</li>
							);
						})
					) : null}
				</ul>
			</div>
		);
	};

	const FavCompanies = ({ favCompanies }) => {
		return (
			<div>
				<h2>Followed Companies</h2>
				<ul>
					{favCompanies.length ? (
						favCompanies.map((company, idx) => {
							return <li key={idx}>{company.id}</li>;
						})
					) : null}
				</ul>
			</div>
		);
	};

	const view = params.view;
	return (
		<div className="App">
			<header className="App-header">
				<img src={user.avatar} alt="user avatar" onClick={() => (window.location.hash = '#view=home')} />
				<div>{`Welcome, ${user.fullName}!`}</div>
				<button onClick={changeUser}>Change User</button>
			</header>
			{view === 'home' && <Home notes={notes} vacations={vacations} favCompanies={favCompanies} />}
			{view === 'notes' && <Notes notes={notes} />}
			{view === 'vacations' && <Vacations vacations={vacations} />}
			{view === 'followedcompanies' && <FavCompanies favCompanies={favCompanies} />}
		</div>
	);
}

export default App;
