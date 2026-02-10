# Project-Tracker

## Description
Project Tracker is a web-based project management application that helps teams organize projects, assign tasks, track contributions, and monitor deadlines efficiently.  
The system supports role-based access for project leaders and team members, ensuring proper task ownership and accountability.

It is designed as a lightweight frontend-only application using browser localStorage for data persistence, making it easy to run without any backend setup.

## Features
- User authentication (Login & Signup)
- Project creation and management
- Role-based access (Leader & Member)
- Task assignment with:
  - Priority levels
  - Due dates
  - Minimum required working hours
- Task status tracking (Pending, Completed, Overdue)
- Contribution (work hours) logging
- Validation to prevent task completion without minimum hours
- Early / Late task submission detection
- Leader-only task deletion

## User Roles
### Project Leader
- Create and manage projects
- Assign tasks to team members
- Set deadlines, priorities, and minimum hours
- Delete tasks if required
- Monitor task completion status

### Team Member
- View assigned tasks
- Log work hours for tasks
- Mark tasks as completed after meeting required hours
- Track remaining time before deadlines

## Technologies Used
- HTML5
- CSS
- JavaScript
- LocalStorage

