[![Express CI](https://github.com/mohamedfares186/Authentication-System/actions/workflows/main.yml/badge.svg)](https://github.com/mohamedfares186/Authentication-System/actions/workflows/main.yml)

## 📚 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [Continuous Integration](#continuous-integration)
- [License](#license)

# 🛡️ Auth API System (Node.js + Express + MongoDB)

A secure and production-ready authentication system built with **Node.js**, **Express**, and **MongoDB**, featuring full CI integration, robust testing, and modern security practices.

---

## 📌 Features

- 🔐 **User Registration & Login**
- 📧 **Email Verification**
- 🔁 **Refresh Tokens & Logout**
- 🔑 **Password Reset (via Email)**
- 🧪 **Unit & Integration Tests** (with Jest & Supertest)
- 🧱 **Rate Limiting** (against brute-force attacks)
- 🔒 **Password Hashing with bcryptjs**
- 📮 **Email Service using Nodemailer**
- 📄 **Environment Variable Protection** using GitHub Secrets
- 🔁 **Nodemon for Dev Server**
- 🧼 **Linting with ESLint**
- ✅ **CI/CD with GitHub Actions**

---

## 🧰 Tech Stack

| Tool                   | Purpose                    |
|------------------------|----------------------------|
| **Node.js**            | Runtime                    |
| **Express.js**         | Web framework              |
| **MongoDB + Mongoose** | Database and ORM           |
| **bcryptjs**           | Password hashing           |
| **jsonwebtoken**       | Auth tokens                |
| **Nodemailer**         | Email services             |
| **express-rate-limit** | Throttle requests          |
| **Jest**               | Testing framework          |
| **Supertest**          | HTTP assertions            |
| **nodemailer-mock**    | Email mocking during tests |
| **ESLint**             | Code linting               |
| **Nodemon**            | Auto-restarting server     |
| **GitHub Actions**     | CI pipeline                |
| **GitHub Secrets**     | Secure env management      |

---

## 🚀 Getting Started

### 🧩 Prerequisites

- Node.js ≥ 18
- MongoDB URI (e.g. from [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- A Gmail or SMTP provider account for email

---

### ⚙️ Installation

```bash
git clone https://github.com/mohamedfares186/Authentication-System.git
cd Authentication-System
npm install
```

---

### Running the development server

```
npm run dev
```

---

### Make sure your `.env` file looks like this:
```
PORT=5000
MONGODB_URL=your_db_url
ACCESS_TOKEN_SECRET=your_secret
REFRESH_TOKEN_SECRET=your_refresh_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
CLIENT_URL=http://localhost:3000
```

---

### 🧪 Testing

```
npm test
```

---

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙌 Acknowledgements

Big thanks to open-source maintainers and the dev community for continuous inspiration and learning.

---