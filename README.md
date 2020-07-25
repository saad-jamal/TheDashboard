# TheDashboard
This github repository represents the re-build of TheDashboard. A data analysis tool used to display eye and simulator data of a Boeing 737NG. The application uses Angular on the Front-End combined with HTML Canvas to create a visualization of key simulator data variables, overlayed with eye fixations of a given pilot, synchronized with over the shoulder video data.
## Installation Instructions
Clone the application on Git, or simply download the zipfile off of Github. Navigate to the directory on terminal and type 'npm install'. This will install all dependencies. In order to start the application type 'npm start'. Using the browser of your choice, navigate to http://localhost:4200 where the application is hosted.
## Required Data
The application takes in simulator data, which should have eye-tracking data alongside it. It also requires over-the-shoulder mp4 file. It can also load up a file of event-markers. This is a CSV where each row has a time, message, and color. These events will show up on the slider bar and will alert the user and pause play-back at select times.

---

This application was developed by NASA Ames in conjunction with the Department of Data Science at UC Berkeley.