# Task Management Frontend (Kazam Assignment)

This is the frontend service for the Task Management System, providing a user-friendly interface to manage tasks efficiently. The frontend is built using React.js with modern UI libraries.


## Table of contents

- [Project Features](#features)
- [Technologies Used](#technologies-used)
- [Folder Structure](#folder-structure)
- [Installation](#installation)
- [API Endpoints](#api-endpoints)
- [Middlewares](#middlewares)
- [How to Use](#how-to-use)
- [Future Enhancements](#future-enhancements)
- [Additional Features implementetion](#additional-features-implementetion)
- [Contact](#contact)



## Features
- User authentication (JWT-based login and registration)
- Task creation, updating, and deletion
- Task status tracking
- Responsive UI for better user experience.

## Technologies Used

- **React.js**: Frontend framework.
- **Axios**: API requests.
- **Context API**: for managing user data (external store globally).
- **framer-motion**: UI motion effects.
- **jwt-decode**: For jwt authentication.
- **lodash**: Decounce implementation for search.
- **socket.io-client**: Socket implementation for real time.
- **tailwind** - UI library used.
- **react-toastify** - Notification handler.


## Folder Structure

```bash
├── assets/                     # Handles user assets
├── component/
│   ├── Navbar.tsx              # Navbar component
│   ├── ProtectedRoutes.tsx     # Handles protected routes
├── context/
│   ├── AuthContext.tsx         # Handles user context data
├── lib/
│   ├──utils.ts                 # tailwind utils
├── page/
│   ├── DashboardPage.tsx       # dashboard page
│   ├── LoginPage.tsx           # Login page
│   ├── ProfilePage.tsx         # Profile Page
│   ├── SignupPage.tsx          # Signup Page
├── ui/
│   ├── aurora-background.tsx   # ui background 
├── utils/
│   ├── socket.ts               # handles socket
├── .env                        # Environment variables
├── App.tsx                     # App logic 
├── App.css                     # App css styles
├── index.css                   # Index css file
├── main.tsx                    # project main file
└── package.json                # Dependencies and scripts
```





## Installation

1. **Clone the repository:**
   ```sh
   git clone https://github.com/AbhishekOraonDev/TaskManagement_Frontend.git
   ```

2. **Navigate to the project directory:**
   ```sh
   cd <folder_name_if_exists> 
   ```

3. **Install dependencies:**
   ```sh
   npm install
   ```

4. **Create a `.env` file and add environment variables:**
   ```env
      VITE_BASE_URL=<YOUR_SERVER_URL>
   ```

5. **Start the development server:**
   ```sh
   npm run dev
   ```



## How to Use

1. Sign up or log in to access the dashboard.

2. Create new tasks by clicking the plus icon

3. Update task details or delete tasks as needed.

4. Track task status and progress in real time

5. Log out to invalidate your token and clear the session.



## Contributing
Contributions are welcome! Please follow these steps:

1. Fork the repository

2. Create a new branch (`git checkout -b feature-branch`)

3. Commit your changes (`git commit -m "Add new feature"`)

4. Push to the branch (`git push origin feature-branch`)

5. Open a Pull Request


## Future Enhancements

1. Implementation of role-based access control (RBAC) for admin-level operations.

2. Add caching.


 

## Contact
For any queries or issues, reach out to **[Abhishek Oraon](https://github.com/AbhishekOraonDev)**.

---
**Happy Coding! 🚀**

