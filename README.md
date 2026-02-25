# Maruti Flex Dashboard

This repository contains a MERN stack application with authentication, a home page, and a new order form. The front-end is built with React (Create React App) and Bootstrap for responsive styling. The back-end uses Express, MongoDB (Atlas), and JWT for authentication.

## Structure

```
/ (workspace root)
├── backend
│   ├── config
│   │   └── db.js
│   ├── middleware
│   │   └── auth.js
│   ├── models
│   │   └── User.js
│   ├── routes
│   │   └── auth.js
│   ├── server.js
│   ├── package.json
│   └── .env
└── frontend
    ├── public
    ├── src
    │   ├── components
    │   │   └── NavBar.js
    │   ├── context
    │   │   └── AuthContext.js
    │   ├── pages
    │   │   ├── Home.js
    │   │   ├── Login.js
    │   │   └── NewOrder.js
    │   ├── App.js
    │   └── index.js
    └── package.json
```

## Getting Started

### Backend

1. Open a terminal in the `backend` folder.
2. Install dependencies: `npm install` (already done).
3. Create a `.env` file if needed with:
   ```env
   MONGO_URI=<your mongo connection string>
   JWT_SECRET=<some secret>
   ```
   (By default the example connection string in the requirements is used.)
4. Start the server:
   ```sh
   npm run dev
   ```
   The server listens on port 5000 by default.

### Frontend

1. Open a terminal in the `frontend` folder.
2. Install dependencies (already installed): `npm install`.
3. Start React development server:
   ```sh
   npm start
   ```
4. The app will open at `http://localhost:3000`.

### Usage

1. Access the login page and register a new account (registration endpoint is available).
2. After logging in, you will be redirected to the home page.
3. Navigate to "New Order" to fill out a professionally styled order form; submitted orders are saved in MongoDB.
4. View and manage previously submitted entries via the new "Orders" page. You can update or delete orders from the table.
5. The navigation bar is responsive and displays the user name with a dropdown showing user details and a logout button.

## Notes

- Authentication tokens are stored in `localStorage` and sent to the backend in the `x-auth-token` header.
- The backend uses MongoDB Atlas; replace the connection string in `.env` as needed.
- You can add additional menu items or pages by editing the React router and navigation component.
- Styling has been enhanced across all pages (headers, cards, tables, footer) for a modern, responsive dashboard.

## Production Build

To build the front-end for production, run `npm run build` in the `frontend` folder and serve the files from the backend (see `server.js`).

---

Happy hacking!
