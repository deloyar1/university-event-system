# University Event Management System

A web application that helps university students discover, bookmark, and register for campus events that match their interests — and helps organizers publish events and track registrations.

**Live app:** https://university-event-system-24640.web.app

Built as a course project for **Web and Mobile Application Development Sessional**, Department of CSE, Hajee Mohammad Danesh Science and Technology University.

---

## Features

- **Authentication** — email/password sign up and login with role selection (Student / Organizer)
- **Event Management** — organizers create events with title, description, date, time, venue, and category
- **Student Discovery** — search by title, filter by category, bookmark events for later
- **Personalized Recommendations** — events matching a student's selected interests are highlighted and ranked first
- **Registration** — students register for events with one click; organizers can view who has registered
- **Notifications** — in-app notifications for registration confirmation and new events matching a student's interests
- **Role-based security** — enforced with Firestore Security Rules, not just client-side checks (e.g. only organizers can create events; only students can register)

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite |
| Routing | react-router-dom |
| Backend / Database | Firebase Authentication + Cloud Firestore |
| Hosting | Firebase Hosting |

## Project Structure

```
src/
├── components/
│   └── Navbar.jsx
├── firebase/
│   └── config.js
├── pages/
│   ├── signup.jsx
│   ├── login.jsx
│   ├── dashboard.jsx
│   ├── CreateEvent.jsx
│   ├── events.jsx
│   ├── eventDetails.jsx
│   ├── myEvents.jsx
│   ├── eventRegistrations.jsx
│   ├── myBookmarks.jsx
│   ├── profile.jsx
│   └── notifications.jsx
├── App.jsx
└── main.jsx
```

## Getting Started

```bash
# install dependencies
npm install

# run the dev server
npm run dev

# build for production
npm run build

# deploy to Firebase Hosting
firebase deploy
```

You will need your own Firebase project and to add its config to `src/firebase/config.js`.

## Documentation

Full project documentation is in the [`docs`](./docs) folder:

- **Software Requirements Specification (SRS)** — full requirements, use cases, and diagrams (system context, use case, activity, sequence, ER, data flow)
- **Coding Documentation** — technology stack, project structure, data model, module-by-module code walkthrough, and the Firestore Security Rules
- **Test Report** — manual test cases across authentication, event management, discovery, recommendation, notifications, and security, with pass/fail results

## Known Limitations

- No UI yet for organizers to edit or delete an event after creation
- Login error messages show the raw Firebase error rather than a friendlier message
- Notifications are in-app only (no email/SMS/push)
- Admin role (user management) is specified in the SRS but not yet implemented

## Author

Deloyar Hossain & Abdur Rahman