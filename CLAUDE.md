# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
npm start          # Start development server at http://localhost:3000
npm test           # Run tests in interactive watch mode
npm run build      # Build for production to /build folder
```

## Architecture

This is a single-page React application for tracking gym workouts, built with Create React App. The entire application logic resides in `src/App.js` as a single component (`GymTracker`).

### Key Concepts

- **Routines**: Templates for workouts containing exercise names, sets, and reps
- **Workouts**: Completed training sessions with actual weight/reps data for each set
- **Progress**: Analytics view showing max weight and volume trends per exercise

### Data Storage

All data persists in browser localStorage with these keys:
- `gym-routines` - Array of routine objects
- `gym-workouts` - Array of completed workout objects
- `gym-darkmode` - Theme preference boolean

### State Management

Uses React useState hooks for all state. Key state variables:
- `routines` / `workouts` - Main data arrays
- `editingRoutine` - Currently edited routine (null when not editing)
- `selectedRoutine` - Active workout being recorded
- `activeTab` - Current view ('routines' | 'workout' | 'progress')

### Styling

Uses Tailwind CSS with a dynamic `theme` object for dark/light mode support. Theme properties are applied inline via template literals.

### Export/Import

Supports JSON export (full backup) and CSV export (workouts only for spreadsheet analysis).
