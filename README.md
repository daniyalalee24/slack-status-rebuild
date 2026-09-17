# Slack "Set a Status" Modal Rebuild

This is a frontend feature rebuild of Slack's custom status modal, built using React and Tailwind CSS.

## 🚀 How to Run Locally

1. Clone the repository to your local machine.
2. Open your terminal and navigate into the project directory.
3. Install dependencies by running:

   ```bash
   npm install

   ```

## Start the local development server:

```bash
   npm run dev

```

## ⚖️ Comparison to the Original:

## The Improvement: Permanent Favorites (⭐)

1. In the original Slack application, custom statuses are saved to a volatile "Recent" list. If a user has a highly specific status they use frequently (e.g., "Deep Work — 2 hours"), it inevitably gets pushed off the Recent list by temporary, one-off statuses, forcing the user to retype it.

2. My version improves this UX by introducing a dedicated "Favorites" system. Users can click the star icon (⭐) next to any recent status to permanently pin it to a "Your Favorites" list. This protects important statuses from being overwritten by recency algorithms, allowing rapid, one-click access to recurring routines. Toggling the star safely moves the status between the Favorites and Recent lists.

## What I Omitted and Why:

1. Google Calendar Integration: The original feature includes a "Based on your Google Calendar" status option. I omitted this because it requires backend OAuth API integration with Google's services, which falls outside the scope of rebuilding a frontend UI component.

2. Workspace Admin Settings Sync: The original modal includes a link to "Edit suggestions for New Workspace" which routes to a global admin dashboard. I did not implement this routing or the corresponding admin settings panel, as the brief specifically constrained the scope to one feature (the modal itself), not the entire product.

## ⌨️ Standards Implemented:

1. Keyboard Navigation & Accessibility: The modal automatically focuses the main input field upon mounting. The Escape key intelligently handles layered state: pressing it closes the emoji picker if it is currently open, and closes the entire modal if the picker is closed.

2. Failure States & Validation: Attempting to submit an empty status triggers an inline validation check. It keeps the "Save" button disabled and safely rejects the submission rather than failing silently or causing application errors.

3. Backdrop Dismissal: Implementing standard modal UX behavior, clicking the dark overlay outside the modal window safely dismisses it.

4. Dynamic Time Parsing: Duration selections (e.g., "1 hour", "30 minutes") are dynamically calculated against the user's current system time and displayed within the input field as absolute expirations (e.g., "Until 10:30 PM"), exactly matching the original implementation.
