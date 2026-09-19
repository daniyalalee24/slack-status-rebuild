# Slack "Set a Status" Modal Rebuild

This is a frontend feature rebuild of Slack's custom status modal, built using React and Tailwind CSS.

## 🚀 How to Run Locally

1. Clone the repository to your local machine.
2. Open a terminal and navigate into the project directory.
3. Install the dependencies:

```bash
npm install
Start the development server:
npm run dev
Open the local URL shown in the terminal.
🛠️ Guide for the Next Contributor

This section explains how the project is organized, where new features should be added, how to check changes, and which parts of the code require extra care.

📁 Project Structure

The main application code is inside src/.

src/
├── components/
│   └── StatusModal.jsx
├── App.jsx
├── App.css
├── index.css
└── main.jsx
App.jsx

App.jsx is responsible for the overall application state.

It handles:

Opening and closing the status modal
Storing the currently active status
Persisting the active status in localStorage
Displaying the active status outside the modal

The main application state is kept here so that the modal and the rest of the application can share the current status.

components/StatusModal.jsx

StatusModal.jsx contains the main feature logic and UI.

It handles:

Status text input
Emoji selection
Duration selection
Custom date/time selection
Saving a status
Recent statuses
Favorite statuses
Notification pause settings
Validation
Keyboard interactions
Modal and emoji-picker behavior

Most changes related directly to the "Set a Status" feature should be made here.

App.css and index.css

These files contain the global and application-level styling that is not handled directly through Tailwind utility classes.

main.jsx

This is the entry point for the React application. It mounts the App component.

🧩 Where a New Feature Should Go

For a new feature related to the status modal, the first place to look is:

src/components/StatusModal.jsx

For example:

A new status option → StatusModal.jsx
A new duration option → StatusModal.jsx
Changes to favorites or recent statuses → StatusModal.jsx
A new modal interaction → StatusModal.jsx

If a feature needs to affect the active status outside the modal, then App.jsx may also need to be updated.

If the feature only changes appearance, update the relevant JSX/Tailwind classes or the appropriate CSS file rather than adding new application state.

Before Adding a Feature

Check how the existing status data is structured:

{
  emoji: "🔴",
  text: "football",
  duration: "Today"
}

A new feature should work with this existing structure where possible rather than introducing a second format for statuses.

💾 Local Storage

The application uses localStorage to keep data after the page is refreshed.

The main keys are:

slack-active-status
slack-favorites
slack-recents

These keys are used for different purposes:

slack-active-status → currently active status
slack-favorites → saved favorite statuses
slack-recents → recently used statuses

If you change the structure of a stored status, make sure the code that reads the old data is updated as well. Otherwise, existing data in the browser can cause unexpected behavior.

⚠️ Fragile Parts
Local Storage Data

The status, favorites, and recent lists are stored directly in localStorage. This makes the feature convenient because data survives page refreshes, but it also means the application depends on the stored data having the expected structure.

Changing the status object or localStorage keys without updating all related code can cause errors or make previously saved statuses unusable.

Favorites and Recent Statuses

Favorites and Recent statuses are connected. Adding or removing a favorite can affect how the status appears in both lists.

When modifying this behavior, test both directions:

Add a recent status to Favorites
Remove a status from Favorites
Refresh the page
Check that both lists still contain the expected data
Duration and Expiration Logic

Duration values such as:

30 minutes
1 hour
4 hours
Today
This week

are converted into expiration times.

The expiration calculation depends on the user's current system time. Changes to the duration logic should therefore be tested with several different duration options rather than only one.

Custom date/time values also need extra care because they use a different format from the predefined duration options.

Modal Event Handling

The modal uses keyboard and mouse events for interactions such as:

Pressing Escape
Clicking outside the modal
Opening and closing the emoji picker

Changes to these event handlers can affect other parts of the modal. Make sure layered UI elements such as the emoji picker still close in the correct order.

✅ Checks Before Submitting Changes

There is currently no automated test suite in this project. The main automated checks are ESLint and the production build.

1. Install Dependencies
npm install
2. Run ESLint
npm run lint

A passing result should complete without ESLint errors.

3. Run the Production Build
npm run build

A passing result should complete successfully and generate the production build without compilation errors.

4. Run the Application
npm run dev

Then manually check the feature in the browser.

For status-related changes, verify:

The modal opens and closes correctly
A status can be saved
Empty statuses cannot be submitted
Emoji selection works
Duration selection works
Favorites work
Recent statuses work
Refreshing the page preserves saved data
Escape closes the correct UI layer
Clicking outside the modal behaves correctly

A change should not be considered complete until both the automated checks and relevant manual interactions pass.

⚖️ Comparison to the Original
The Improvement: Permanent Favorites ⭐

In the original Slack experience being recreated, custom statuses are primarily accessed through recent statuses. If a user has a specific status they use frequently, newer statuses can push it further down the list.

This version improves that workflow by introducing a dedicated Favorites system.

Users can click the star icon next to a recent status to permanently pin it to a Your Favorites list. This keeps frequently used statuses easily accessible instead of relying only on the Recent list.

Toggling the star keeps the Favorites and Recent lists synchronized.

What I Omitted and Why
Google Calendar Integration

The original feature includes a "Based on your Google Calendar" status option. I omitted this because it would require backend OAuth/API integration with Google's services, which is outside the scope of this frontend feature rebuild.

Workspace Admin Settings Sync

The original modal includes a link to "Edit suggestions for New Workspace", which connects to workspace-level admin settings.

I did not implement the corresponding admin settings panel because the project focuses on rebuilding the status modal rather than an entire workspace administration system.

⌨️ Standards Implemented
Keyboard Navigation & Accessibility

The modal automatically focuses the main input field when it opens.

The Escape key handles the UI in layers:

If the emoji picker is open, Escape closes the picker.
Otherwise, Escape closes the modal.
Failure States & Validation

Submitting an empty status is prevented by validation.

The Save button remains disabled when there is no status text, preventing an invalid submission.

Backdrop Dismissal

Clicking the dark overlay outside the modal dismisses the modal.

Dynamic Time Parsing

Duration selections such as 1 hour and 30 minutes are calculated using the user's current system time and displayed as an absolute expiration such as Until 10:30 PM.

🔄 Making Changes Safely

When adding a feature:

Identify whether the change belongs in App.jsx or StatusModal.jsx.
Reuse the existing status data structure where possible.
Check whether the feature needs to read or write localStorage.
Run npm run lint.
Run npm run build.
Start the application with npm run dev.
Manually test the affected feature and related interactions.
Test localStorage behavior if the change affects statuses, Favorites, or Recent items.

The most important areas to be careful with are localStorage, Favorites/Recent synchronization, duration calculations, and modal event handling, because changes to these areas can affect multiple parts of the feature.