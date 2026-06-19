Save this as **`notes/MERN/MERN-Setup.md`**.

# 🚀 MERN Stack Setup Guide (React + Node.js + MongoDB + Tailwind CSS)

## Project Structure

```text
NotesSaver/
│
├── backend/
│
├── frontend/
│
└── notes/
```

---

# Step 1: Create React App with Vite

```bash
npm create vite@latest frontend -- --template react
```

Move into frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start development server:

```bash
npm run dev
```

Default URL:

```text
http://localhost:5173
```

---

# Step 2: Install Tailwind CSS

Install packages:

```bash
npm install tailwindcss @tailwindcss/vite
```

---

## Configure Vite

Open:

```text
frontend/vite.config.js
```

Update:

```javascript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
});
```

---

## Configure CSS

Open:

```text
src/index.css
```

Replace everything with:

```css
@import "tailwindcss";
```

---

## Test Tailwind

Open:

```text
src/App.jsx
```

```jsx
function App() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <h1 className="text-5xl font-bold text-blue-500">
        Tailwind Working 🚀
      </h1>
    </div>
  );
}

export default App;
```

Run:

```bash
npm run dev
```

---

# Step 3: Create Backend

Go back to root folder:

```bash
mkdir backend
cd backend
```

Initialize Node Project:

```bash
npm init -y
```

---

# Step 4: Install Backend Packages

```bash
npm install express mongoose cors dotenv
```

Development dependency:

```bash
npm install -D nodemon
```

---

# Step 5: Backend Folder Structure

```text
backend/
│
├── config/
│   └── db.js
│
├── controllers/
│
├── middleware/
│
├── models/
│
├── routes/
│
├── .env
│
├── package.json
│
└── server.js
```

---

# Step 6: MongoDB Atlas Setup

Create free cluster.

Copy connection string:

```text
mongodb+srv://username:password@cluster.mongodb.net/notesdb
```

---

## Create .env

```env
PORT=5000

MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/notesdb
```

---

# Step 7: MongoDB Connection

Create:

```text
backend/config/db.js
```

```javascript
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
```

---

# Step 8: Express Server

Create:

```text
backend/server.js
```

```javascript
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./config/db");

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api", (req, res) => {
  res.send("Notes Saver API Running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server Running On Port ${PORT}`);
});
```

---

# Step 9: Update package.json

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

Run backend:

```bash
npm run dev
```

Expected:

```text
MongoDB Connected
Server Running On Port 5000
```

---

# Step 10: Configure Vite Proxy

Open:

```text
frontend/vite.config.js
```

```javascript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],

  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});
```

---

# Why Use Proxy?

Frontend:

```text
http://localhost:5173
```

Backend:

```text
http://localhost:5000
```

Without proxy:

```javascript
axios.get("http://localhost:5000/api");
```

With proxy:

```javascript
axios.get("/api");
```

Benefits:

* Avoid CORS issues
* Cleaner API calls
* Easier deployment
* Better development workflow

---

# Step 11: Install Axios

```bash
cd frontend

npm install axios
```

---

# API Service

Create:

```text
src/services/api.js
```

```javascript
import axios from "axios";

const api = axios.create({
  baseURL: "/api",
});

export default api;
```

Usage:

```javascript
import api from "./services/api";

const getData = async () => {
  const res = await api.get("/");
  console.log(res.data);
};
```

---

# Final Architecture

```text
Browser
   │
   ▼
React + Vite
localhost:5173
   │
   ▼
Vite Proxy
   │
   ▼
Express Server
localhost:5000
   │
   ▼
MongoDB Atlas
```

---

# Installation Commands Summary

## Frontend

```bash
npm create vite@latest frontend -- --template react

cd frontend

npm install

npm install axios

npm install tailwindcss @tailwindcss/vite
```

## Backend

```bash
mkdir backend

cd backend

npm init -y

npm install express mongoose cors dotenv

npm install -D nodemon
```

---

# Quick Revision

```text
React     → Frontend UI

Vite      → Development Server

Tailwind  → Styling

Express   → Backend Server

MongoDB   → Database

Mongoose  → MongoDB ODM

Axios     → API Requests

Proxy     → Forward Requests to Backend
```

After saving, open the file in VS Code and press **Ctrl + Shift + V** for a clean, readable study guide.
