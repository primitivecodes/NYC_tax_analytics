# NYC Taxi Trip Dashboard

**Team 20**
1.Elvis Shimwa
2.Premier Ufitinema
3.Colombe Nyituriki Igihozo
**structure**

nyc-taxi-dashboard/

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
    

## Overview

This project is a **fullstack application** for analyzing New York City Taxi Trips using the raw NYC Taxi Trip dataset (`train.csv`).  

The **backend** cleans, validates, and enriches the dataset, stores it in a MySQL database, and exposes APIs for querying.  
The **frontend** provides a dashboard to explore urban mobility patterns and key insights interactively.

---

## Features

### Backend

* Data ingestion and cleaning (validates timestamps, coordinates, trip duration)  
* Derived features: `trip_distance`, `average_speed`, `hour_of_day`, `day_of_week`  
* Stores valid trips in MySQL, logs excluded/suspicious rows in `excluded_records.json`  
* REST APIs:
  * `GET /trips` – fetch trips with optional filters (`vendor_id`, `day_of_week`, `hour_of_day`, `min_distance`, `max_distance`)  
  * `GET /trips/:id` – fetch a trip by ID  
  * `GET /trips/stats` – total trips, average distance, average duration  
  * `GET /trips/top?metric=<metric>&k=<number>` – top-k trips by a metric (`average_speed`, `trip_distance`)  
  * `GET /trips/anomalies` – fetch trips marked as anomalies (`is_suspect=1`)  

### Frontend

* Interactive dashboard to explore trip data  
* Filtering and sorting options for time, distance, and vendor  
* Charts and tables summarizing trip patterns  

![Dashboard Example]([./screenshots/dashboard.png](https://drive.google.com/file/d/1TNEw3uOepleaD1y7y6piaZNORBZ1cPEL/view?usp=sharing))  
*Example of the main dashboard view.*

**Video Walkthrough**
video link

---

**Key Findings**
**Peak Hours:** Taxi demand peaks during morning and evening rush hours

**Vendor Distribution: **Vendor 1 and 2 show different operational patterns

**Trip Duration:** Majority of trips are short-distance (under 30 minutes)

**Passenger Patterns:** Single passengers constitute the majority of trips

**Custom Algorithm Implementation**

**We implemented a custom duration categorization algorithm that:**

Processes raw trip duration in seconds

Categorizes into Short (<10min), Medium (10-30min), Long (>30min)

Handles edge cases and invalid data

Provides real-time distribution analysis


## Tech Stack

* **Backend:** Node.js, Express.js  
* **Database:** MySQL  
* **Frontend:** HTML, CSS, JavaScript  
* **Data Processing:** Node.js with `csv-parser`  

---
 Complete Installation Guide
