import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Signup from "./pages/signup";
import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import CreateEvent from "./pages/CreateEvent";
import Events from "./pages/events";
import EventDetails from "./pages/eventDetails";
import MyEvents from "./pages/myEvents";
import EventRegistrations from "./pages/eventRegistrations";
import MyBookmarks from "./pages/myBookmarks";
import Profile from "./pages/profile";
import Notifications from "./pages/notifications";
import AdminDashboard from "./pages/adminDashboard";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-event" element={<CreateEvent />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/:id" element={<EventDetails />} />
        <Route path="/my-events" element={<MyEvents />} />
        <Route path="/events/:id/registrations" element={<EventRegistrations />} />
        <Route path="/my-bookmarks" element={<MyBookmarks />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;