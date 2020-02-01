import React, { useState, useEffect } from 'react';
import moment from 'moment';
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
	const [ vacations, setVacations ] = useState({});
	const [ favCompanies, setFavCompanies ] = useState({});

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
	const view = params.view;

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
						<a href={'#view=companies'}>Following Companies</a>
						<p>{`You are following ${favCompanies.length} companies.`}</p>
					</div>
				</nav>
			</div>
		);
	};

	const Notes = ({ notes }) => {
		const [ newNote, setNewNote ] = useState('');

		return (
			<div>
				<h2>Notes</h2>
				<ul>
					{notes.length ? (
						notes.map((note) => {
							return (
								<li key={note.id} className={note.archived ? '' : 'archived'}>
									{note.text}
									<button onClick={() => toggleArchive(note)}>
										{note.archived ? 'Archive' : 'Un-archive'}
									</button>
									<button onClick={() => deleteNote(note)}>Delete</button>
								</li>
							);
						})
					) : null}
				</ul>
				<form onSubmit={(ev) => createNote(ev, newNote)}>
					<input type="text" value={newNote} onChange={(ev) => setNewNote(ev.target.value)} />
					<input type="submit" />
				</form>
			</div>
		);
	};

	const createNote = (ev, newNote) => {
		ev.preventDefault();
		axios
			.post(`${API}/users/${user.id}/notes`, { archived: false, text: newNote })
			.then((_note) => setNotes([ ...notes, _note.data ]));
	};

	const toggleArchive = (note) => {
		axios
			.put(`${API}/users/${user.id}/notes/${note.id}`, { archived: !note.archived, text: note.text })
			.then(() => setNotes([ ...notes ]));
	};

	const deleteNote = (note) => {
		axios
			.delete(`${API}/users/${user.id}/notes/${note.id}`)
			.then(() => setNotes(notes.filter((_note) => _note.id !== note.id)));
	};

	const Vacations = ({ vacations }) => {
		const [ newStartDate, setNewStartDate ] = useState('');
		const [ newEndDate, setNewEndDate ] = useState('');

		return (
			<div>
				<h2>Vacations</h2>
				<ul>
					{vacations.length ? (
						vacations.map((vacation) => {
							return (
								<li key={vacation.id}>
									{`${moment(vacation.startDate).format('ddd DD/MM/YY')}
                     - ${moment(vacation.endDate).format('ddd DD/MM/YY')}
                     (${moment(vacation.endDate).diff(vacation.startDate, 'days')} days) `}
									<button onClick={() => deleteVacation(vacation)}>Delete</button>
								</li>
							);
						})
					) : null}
				</ul>
				<form onSubmit={(ev) => createVacation(ev, newStartDate, newEndDate)}>
					<input type="date" value={newStartDate} onChange={(ev) => setNewStartDate(ev.target.value)} />
					<input type="date" value={newEndDate} onChange={(ev) => setNewEndDate(ev.target.value)} />
					<input type="submit" />
				</form>
			</div>
		);
	};

	const createVacation = (ev, newStartDate, newEndDate) => {
		ev.preventDefault();
		axios
			.post(`${API}/users/${user.id}/vacations`, { startDate: newStartDate, endDate: newEndDate })
			.then((_vacation) => setVacations([ ...vacations, _vacation.data ]));
	};

	const deleteVacation = (vacation) => {
		axios
			.delete(`${API}/users/${user.id}/vacations/${vacation.id}`)
			.then(() => setVacations(vacations.filter((_vacation) => _vacation.id !== vacation.id)));
	};

	const FavCompanies = ({ favCompanies }) => {
		const [ newFavCo, setNewFavCo ] = useState({});

		return (
			<div>
				<h2>Followed Companies</h2>
				<ul>
					{favCompanies.length ? (
						favCompanies.map((company) => {
							return <li key={company.id}>{company.id}</li>;
						})
					) : null}
				</ul>
			</div>
		);
	};

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
			{view === 'companies' && <FavCompanies favCompanies={favCompanies} />}
		</div>
	);
}

export default App;
