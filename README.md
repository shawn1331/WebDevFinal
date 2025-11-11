# WebDevFinal
Intro. to Web Development Final Project

# 🎮 Connect 4 Final Project Proposal

## Overview
For my final project, I will build an interactive **Connect 4 web game** using **HTML, CSS, and JavaScript** for the front-end and a **C# Minimal API** for the back-end.  
Players will be able to create or join game lobbies, drag and drop their pieces to play, and compete either locally or online through the hosted API.

This project interests me because it combines **game logic**, **UI design**, and **API development** — all key skills we’ve learned in Intro to Web Development. I also enjoy making games that feel polished and user-friendly, and Connect 4 is a great challenge to showcase JavaScript modules, DOM manipulation, drag-and-drop, and async API calls.

---

## Project Features
- Multi-page website with shared header, nav, and footer
- Lobby page with filters to search/join games
- Drag-and-drop gameplay board
- Persistent data stored through a custom C# backend API
- External API integration (RandomUser.me for player avatars)
- Responsive design using CSS Grid and Flexbox
- Hosted API on the cloud (Render or Railway)

---

## Technical Requirements Checklist
✅ **HTML:** forms, inputs, select, reset, submit, img, links, lists, figure, sections, asides, nav  
✅ **CSS:** selectors, transitions, hover, nth-child, flex/grid layout, variables, accessible color contrast  
✅ **JavaScript:** modules, map/filter, DOM manipulation, event listeners, async/await, querystrings, localStorage  
✅ **Functional:** multi-page site, filter bar, external API call, drag-and-drop, shared layout  
✅ **Server:** custom C# backend API hosted online

---

## Project Goals
- Meet **all technical, functional, and server requirements** in the final-project rubric.  
- Design a responsive and accessible UI that works on desktop and mobile.  
- Organize JavaScript code into **UI**, **Domain**, and **Service** modules.  
- Host my C# API online so that other players can connect to games.

---

## 🗓️ Project Schedule & User-Story Tasks

# 🎮 Connect 4 Final Project — Accelerated Task Plan (Server-Authoritative Architecture)

## ✅ Completed — Nov 08 (10%) & Nov 12 (30%)
- [x] *A developer can open the ConnectFour solution and see linked projects (Api, Core, Tests).*
- [x] *A developer can run the API locally and view Swagger or a Hello World endpoint.*
- [x] *A developer can confirm Core is referenced correctly and compiles.*
- [x] *A user can navigate between index.html, play.html, and profile.html using a shared header and footer.*
- [x] *A user can view the finished CSS layout with variables, hover states, grid/flexbox, and accessible colors.*
- [x] *A developer has documented API endpoint contracts and Core folder structure in the README.*

---

## Nov 15 (50%) — Core Game Engine Foundations
- [ ] *A developer can implement the Core domain models (`Board`, `Game`, `Player`, `Cell`, `WinLine`).*
- [ ] *A developer can implement the `GameService` structure with `CreateGame`, `JoinGame`, `ApplyMove`, and `GetState` methods.*
- [ ] *A developer can write the gravity logic that finds the lowest empty row in a column.*
- [ ] *A developer can write the `WinChecker` to detect horizontal, vertical, and both diagonal four-in-a-row sequences.*
- [ ] *A developer can verify these Core methods with xUnit tests for gravity, invalid moves, and basic win cases.*
- [ ] *A developer can confirm all tests pass using `dotnet test`.*

---

## Nov 19 (65%) — API Integration & Validation
- [ ] *A developer can connect API endpoints (`/rooms`, `/join`, `/state`, `/move`) to Core’s GameService.*
- [ ] *A developer can add per-game locking in API to prevent double moves.*
- [ ] *A developer can implement token-based player validation (hostToken, guestToken).*
- [ ] *A developer can test endpoints in Swagger/Postman to confirm valid and invalid move responses.*
- [ ] *A user can play a test game entirely through the API using JSON calls.*

---

## Nov 22 (75%) — Front-End Connection to API
- [ ] *A user can create and join games from the front-end lobby using real API calls.*
- [ ] *A user can drag a chip and see it reflected in both browsers via API state.*
- [ ] *A user can filter game rooms by size, ranked/casual, or host name using a filter bar.*
- [ ] *A user can see random opponent avatars fetched from RandomUser.me.*
- [ ] *A developer can handle all async/await calls in JS through a clean `service.js` layer.*

---

## Nov 25 (85%) — Deployment & Persistence
- [ ] *A developer can deploy the API to a cloud service (Render, Railway, or Azure).*
- [ ] *A user can join a game using a shared URL with `?gameId` and `token` query parameters.*
- [ ] *A developer can add simple persistence (JSON file or SQLite) to save finished games.*
- [ ] *A user can view a profile page showing total wins/losses retrieved from the API.*
- [ ] *A developer can ensure the site is responsive and accessible on mobile.*

---

## Dec 03 (95%) — Game Polish & Error Handling
- [ ] *A user can see an end-game message or animation showing the winner or draw.*
- [ ] *A user can start a new game from the play page after a match ends.*
- [ ] *A developer can add friendly error messages for invalid moves or lost connections.*
- [ ] *A developer can verify keyboard accessibility for column selection and dropping chips.*
- [ ] *A developer can finalize README mapping every rubric requirement to file locations.*

---

## Dec 10 (100%) — Submission & Demo
- [ ] *A user can watch a short demo video showing lobby creation, gameplay, and results.*
- [ ] *A developer can push final code to GitHub and confirm `alexmickelson` is added as collaborator.*
- [ ] *A developer can update the README with final deployment URLs and confirm all rubric boxes are checked.*

---

## Summary
By following this week-by-week checklist, I’ll deliver a professional-grade Connect 4 game that demonstrates mastery of **front-end design**, **JavaScript logic**, and **C# API development** — fully aligned with the final-project requirements.