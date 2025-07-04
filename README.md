# Training-Room-Booking-VINSYS
Group 4: VINSYS Training Room Booking System
•	 Learners: 22, 6, 24, 9, 10, 23

Description: A web app for booking training rooms and resources.

Features:
o	Booking form (room, date, time).
o	Booking calendar view.
o	Admin dashboard for booking approvals.
o	User authentication.
o	Email confirmation for bookings.

AWS Services:
o	S3: Host React frontend (static site) and store resource images.
o	EC2: Host Node.js backend (t3.medium instance).
o	RDS: Store booking and user data (PostgreSQL, db.t3.medium instance).
o	SNS: Send booking confirmation emails.
o	Route 53: API routing.
•	Deliverable: Live booking system with 5 sample bookings and confirmations, hosted on S3 with a custom domain.
•	Success Criteria: Users can book rooms, admins can approve bookings, and 5 test email confirmations are sent.
