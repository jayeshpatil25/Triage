# HACKNAGPUR 2.0 - Patient Queue & Triage Optimizer 🏥

## Project Overview
This application is a **Real-time Patient Triage System** designed to optimize clinic flows under high load. It uses a hybrid Rule-based + ML scoring engine to dynamically prioritize patients based on severity, vital signs, and waiting time, preventing critical cases from being delayed while ensuring fairness.

## Key Features
- **Smart Triage Engine**: Calculates a priority score (0-100) based on:
  - **Symptoms**: Keyword analysis (e.g., "Chest Pain" = Critical).
  - **Vitals**: High fever (>39.5°C) or low SpO2 (<90%) triggers alerts.
  - **Age**: Pediatric (<5) and Geriatric (>70) adjustments.
  - **Wait Time**: Anti-starvation logic boosts score over time.
- **Dynamic Priority Queue**: The queue automatically re-sorts when new patients arrive or vitals change.
- **Real-Time Updates**: Instant synchronization across Doctor, Nurse, and Admin dashboards using Socket.io.
- **Mutation Handling (Stress Tests)**:
  - **Mutation A (Surge)**: Simulates 2x patient load.
  - **Mutation B (Staff Shortage)**: Adjusts resource allocation logic.

## Tech Stack
- **Frontend**: React (Vite), Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Real-time**: Socket.io

## How to Run
1. **Prerequisites**: Node.js, MongoDB installed and running.
2. **Start Backend**:
   ```bash
   cd server
   npm install
   # Run seed script to populate data (optional)
   node seed.js
   # Start server
   node index.js
   ```
3. **Start Frontend**:
   ```bash
   cd client
   npm install
   npm run dev
   ```
4. **Access the App**:
   - Open browser at `http://localhost:5173`

## Usage Guide
1. **Reception (Intake)**: Go to `/intake`. Fill in patient details (e.g., Name: Test, Symptoms: Chest Pain).
2. **Doctor View**: Go to `/`. You will see the patient appear instantly, prioritized by severity.
3. **Admin Controls**: Go to `/admin` to toggle simulated stress scenarios (Mutations).

## Project Structure
- `/client`: React Frontend
- `/server`: Node.js API & Logic
  - `/models`: MongoDB Schemas (Patient, Staff)
  - `/utils`: Triage Engine (`triageEngine.js`) & Queue Logic (`queueManager.js`)
