# Class2.0 - Scheduling Made Easier

---

## 💡 What is Class2.0?

**Class2.0** is a system that intelligently assigns limited resources (rooms, teachers, time slots, etc.) based on priority, availability, and constraints using logic + basic AI.

---

## 🤔 Why Class2.0?

Manual scheduling in educational institutions is:

- Time-consuming ⏳
- Error-prone ❌
- Difficult to scale 📉

**Class2.0** solves this by:

- Automating timetable generation 
- Reducing clashes and allocation failures
- Providing a structured and efficient system
- Allowing each user to manage their own data independently

---

## 📊 Features Overview

### 🔐 Real Authentication System

- Secure login & signup
- OTPP based Email verification
- Password reset functionality

### 👤 User-Specific Data Isolation

- Each user sees only their own teachers, rooms, and classes

### 👩‍🏫 Teacher Management

- Add, view, and delete teachers
- Define available time slots

### 🚪 Room Management

- Add and manage room capacity and
- Delete rooms

### 📚 Class Management

- Assign subjects, student count, and priority levels
  
### ⚙️ Smart Schedule Generation

- Automatically allocates teachers and rooms
- Handles conflicts intelligently
  
### 📊 Analytics Dashboard

- Allocation vs failure visualization
- Teacher workload distribution charts

---

## 🛠️ Tech Stack Used

### 🎨 Frontend

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white)

### ⚙️ Backend

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)

### 🗄️ Database

![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Mongoose](https://img.shields.io/badge/Mongoose-880000?style=for-the-badge&logo=mongoose&logoColor=white)

### 🔐 Authentication

![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![Nodemailer](https://img.shields.io/badge/Nodemailer-009688?style=for-the-badge&logo=gmail&logoColor=white)

---

## 📂 Project Structure
```bash
Class2.0/
├───backend/
│   │   .env
│   │   allocationEngine.js
│   │   package-lock.json
│   │   package.json
│   │   server.js
│   │
│   ├───middleware/
│   │       protect.js
│   │
│   ├───models/
│   │       Class.js
│   │       Room.js
│   │       Teacher.js
│   │       User.js
│   │
│   ├───routes/
│   │       allocationRoutes.js
│   │       authRoutes.js
│   │       classRoutes.js
│   │       roomRoutes.js
│   │       teacherRoutes.js
│   │
│   └───utils/
│           sendEmail.js
│
└───frontend/
        index.html
        reset-password.html
        script.js
        style.css
```

---

## 📷 Snapshots
### Dashboard
![Screenshot](https://raw.githubusercontent.com/uxntani/GSC2026/refs/heads/main/readme_assets/dashboard.png)

### Profile Management
![Screenshot](https://raw.githubusercontent.com/uxntani/GSC2026/refs/heads/main/readme_assets/profile.png)

### Teacher Info
![Screenshot](https://raw.githubusercontent.com/uxntani/GSC2026/refs/heads/main/readme_assets/teacher.png)

### Room Info
![Screenshot](https://raw.githubusercontent.com/uxntani/GSC2026/refs/heads/main/readme_assets/room.png)

### Class Info
![Screenshot](https://raw.githubusercontent.com/uxntani/GSC2026/refs/heads/main/readme_assets/class.png)

### Toogle Theme (Dark)
![Screenshot](https://raw.githubusercontent.com/uxntani/GSC2026/refs/heads/main/readme_assets/dark.png)

### Generated Time Table
![Screenshot](https://raw.githubusercontent.com/uxntani/GSC2026/refs/heads/main/readme_assets/timetable.png)

### Analytics Dashboard
![Screenshot](https://raw.githubusercontent.com/uxntani/GSC2026/refs/heads/main/readme_assets/analytics.png)

### Signup Page
![Screenshot](https://raw.githubusercontent.com/uxntani/GSC2026/refs/heads/main/readme_assets/signup.png)

### Login Page
![Screenshot](https://raw.githubusercontent.com/uxntani/GSC2026/refs/heads/main/readme_assets/login.png)

### Forgot Password
![Screenshot](https://raw.githubusercontent.com/uxntani/GSC2026/refs/heads/main/readme_assets/forget.png)

---

## ⚙️ Wireframe Diagram
![Screenshot](https://raw.githubusercontent.com/uxntani/GSC2026/refs/heads/main/readme_assets/wireframe.png)

---

## 📶 Workflow Diagram
![Screenshot](https://raw.githubusercontent.com/uxntani/GSC2026/refs/heads/main/readme_assets/workflow.png)
