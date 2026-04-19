<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project
- React + TypeScript (Vite)
- Styling: Tailwind CSS

## Code style
- Prefer small, typed helpers and pure functions.
- Use `localStorage` for persistence (no backend).
- Keep UI components simple (no heavy component libraries).

## Domain
- POS MVP: item has `name`, `sellPrice`, `rawCost`.
- HPP per item = `rawCost`.
- Margin = `sellPrice - rawCost`.
