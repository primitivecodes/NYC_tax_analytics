#  NYC Taxi Trip Dashboard

**Team 20**  
- Elvis Shimwa  
- Premier Ufitinema  
- Colombe Nyituriki Igihozo  



## Overview

The NYC Taxi Trip Dashboard is a fullstack web application designed to analyze and visualize New York City Taxi Trips using the raw dataset (`train.csv`).

- **Backend:** Processes, validates, and stores trip data in a MySQL database, providing REST APIs for analytics.  
- **Frontend:** Offers an interactive dashboard to explore urban mobility patterns and gain insights through filters, tables, and charts.



## Project Structure

├── backend/

│   ├── src/

│   │   ├── config/

│   │   │   └── database.js

│   │   ├── models/

│   │   │   ├── index.js

│   │   │   └── Trip.js

│   │   ├── routes/

│   │   │   ├── trips.js

│   │   │   └── stats.js

│   │   └── index.js

│   ├── .env

│   ├── .gitignore

│   └── package.json

└── frontend/

    ├── index.html
    
    ├── style.css
    
    └── script.js
    


yaml
Copy code



## Features

### Backend

**Data Cleaning & Validation:**  
- Validates timestamps, coordinates, and trip durations.

**Feature Engineering:**  
- Adds derived fields like `trip_distance`, `average_speed`, `hour_of_day`, and `day_of_week`.

**Database Integration:**  
- Stores valid trips in MySQL.  
- Logs invalid or suspicious entries in `excluded_records.json`.

**RESTful API Endpoints:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /trips | Fetch all trips (supports filters: vendor_id, day_of_week, hour_of_day, min_distance, max_distance) |
| GET | /trips/:id | Retrieve a trip by ID |
| GET | /trips/stats | View total trips, average distance, and duration |
| GET | /trips/top?metric=&k= | Get top-k trips by metric (average_speed, trip_distance) |
| GET | /trips/anomalies | Fetch trips marked as anomalies (`is_suspect=1`) |

### Frontend

- Clean, interactive dashboard built with HTML, CSS, and JavaScript  
- Filter and sort data by vendor, time, distance, or day  
- Visual charts and tables summarizing trip activity and distribution  

**UI/UX link**
https://www.figma.com/design/MNxvkzMAcIXcw16dpiB1mU/Untitled?node-id=0-1&m=dev&t=z303uzQrXc0rlYQV-1

## 📊Dashboard Example

**Example of the main dashboard interface.**  

🎥 Video Walkthrough: *[Add your demo video link here.](https://www.loom.com/share/14752e04a4c44373b11c9bcd0658527e)*



## Key Findings

- **Peak Hours:** Taxi demand is highest during morning (7–9 AM) and evening (5–8 PM).  
- **Vendor Distribution:** Vendors 1 and 2 show different performance trends.  
- **Trip Duration:** Most rides are short trips (< 30 minutes).  
- **Passenger Count:** Majority of trips are single-passenger rides.  



## Custom Algorithm

**Trip Duration Categorization Algorithm:**  

- Converts raw duration (seconds) into minutes  
- Categorizes trips into:
  - Short (< 10 min)  
  - Medium (10–30 min)  
  - Long (> 30 min)  
- Detects invalid data and edge cases  
- Enables real-time trip duration distribution analysis  



## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Node.js, Express.js |
| Database | MySQL |
| Frontend | HTML, CSS, JavaScript |
| Data Processing | Node.js with csv-parser |



## Installation Guide

Follow these steps to set up and run the project locally.

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/primitivecodes/NYC_tax_analytics.git
cd nyc-taxi-dashboard
2️⃣ Backend Setup
bash
Copy code
cd backend
npm install
Create a .env file:

ini
Copy code
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=nyc_taxi
PORT=5000
Start the backend server:

bash
Copy code
npm start
3️⃣ Database Configuration
Open MySQL and create the database:

sql
Copy code
CREATE DATABASE nyc_taxi;
Ensure .env credentials match your local setup.
Import train.csv via your ingestion script or API.

4️⃣ Frontend Setup
bash
Copy code
cd frontend
# Open index.html directly in browser or
npx serve
5️⃣ Access the Application
Frontend: http://localhost:3000 (or your live port)

Backend API: http://localhost:5000

🧩 Example API Usage
Fetch all trips:
GET http://localhost:5000/trips

Get top 5 longest trips:
GET http://localhost:5000/trips/top?metric=trip_distance&k=5

Get trip statistics:
GET http://localhost:5000/trips/stats

 Future Improvements
Add authentication and user roles

Integrate live trip streaming from NYC Open Data API

Add map visualization with trip routes

Enhance anomaly detection using machine learning

Deploy fullstack app to AWS, Render, or Vercel

👥= Contributors
Name	Role
Elvis Shimwa	Backend Developer & Data Processing
Premier Ufitinema	Fullstack Developer & Strategist
Colombe Nyituriki Igihozo	Frontend Developer & UI Designer

 License
This project is developed for educational and research purposes only.

© 2025 Team 20 — All rights reserved.




