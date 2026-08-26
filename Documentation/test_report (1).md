# University Event System — Test Report

**Project:** University Event System
**Testing type:** Manual functional testing (Integration + Unit level flows)
**Tested by:** Deloyar Hossain
**Date:** _______________

Legend: ✅ Pass | ❌ Fail | ⬜ Not tested yet | ➖ N/A

---

## 1. Authentication

| # | Test case | Result | Notes |
|---|---|---|---|
| 1.1 | Signup as Student → Firestore user doc created with role=student | ✅ | |
| 1.2 | Signup as Organizer → Firestore user doc created with role=organizer | ✅ | |
| 1.3 | Login with correct email/password → redirects to /dashboard | ✅ | |
| 1.4 | Login with wrong password → shows error message | ✅ | Shows raw Firebase error text — works but not user-friendly |

## 2. Event Management

| # | Test case | Result | Notes |
|---|---|---|---|
| 2.1 | Organizer can create event → saved in Firestore with correct fields | ✅ | |
| 2.2 | Student cannot create event (blocked by security rules) | ✅ | |
| 2.3 | All Events page lists every event with correct details | ✅ | |
| 2.4 | Event Details page loads single event correctly | ✅ | |
| 2.5 | My Events shows only that organizer's own events | ✅ | |
| 2.6 | Event Registrations page lists correct registered students | ✅ | |

## 3. Student Discovery

| # | Test case | Result | Notes |
|---|---|---|---|
| 3.1 | Search by event title filters results correctly | ✅ | |
| 3.2 | Category filter narrows results correctly | ✅ | |
| 3.3 | Bookmark button saves to Firestore and updates UI | ✅ | |
| 3.4 | My Bookmarks page shows saved events | ✅ | |

## 4. Recommendation & Notifications

| # | Test case | Result | Notes |
|---|---|---|---|
| 4.1 | Events matching student interest show "Recommended" badge | ✅ | |
| 4.2 | Student registering for event creates a notification | ✅ | |
| 4.3 | New event matching student interest notifies that student | ✅ | |
| 4.4 | Notifications page lists notifications and "Mark as read" works | ✅ | |

## 5. Security

| # | Test case | Result | Notes |
|---|---|---|---|
| 5.1 | Organizer cannot register for events (blocked) | ✅ | |
| 5.2 | Student cannot edit/delete another organizer's event | ➖ | No edit/delete UI built yet |
| 5.3 | Logged-out user can view events but not create/register | ✅ | Create Event form is still visible when logged out (no route-level redirect), but submit is correctly blocked by both client-side check and Firestore rules. Recommend adding a redirect-to-login guard as a future improvement. |

## 6. Admin Role

| # | Test case | Result | Notes |
|---|---|---|---|
| 6.1 | Signup as Admin → Firestore user doc created with role=admin | ✅ | |
| 6.2 | Admin Dashboard lists all registered users with name, email, role | ✅ | |
| 6.3 | Admin can delete any event, regardless of which organizer created it | ✅ | Verified against updated Firestore rules allowing getUserRole() == "admin" |
| 6.4 | Admin can send a broadcast notification to every user | ✅ | Recipient confirmed to receive it on their Notifications page |
| 6.5 | Non-admin user (student/organizer) visiting /admin-dashboard sees "Access denied" | ✅ | Client-side role check; also protected at the Firestore rules layer |

## 7. Navigation

| # | Test case | Result | Notes |
|---|---|---|---|
| 7.1 | Navbar links route correctly (logged in & logged out states) | ✅ | |
| 7.2 | Logout clears session and redirects to /login | ✅ | |
| 7.3 | Navbar shows "Admin Dashboard" link only when the logged-in user's role is admin | ✅ | |

---

## Summary

- **Total test cases:** 25
- **Passed:** 24
- **Not tested yet:** 0
- **N/A:** 1
- **Failed:** 0

## Known issues / Future improvements

- Login error message shows raw Firebase error text (e.g. `Firebase: Error (auth/invalid-credential).`) instead of a user-friendly message.
- No edit/delete UI for events yet (organizer cannot modify or remove an event after creation).
- Protected pages (e.g. Create Event) do not redirect logged-out users to the login page automatically; the form is visible but submission is correctly blocked by both client-side checks and Firestore security rules.
