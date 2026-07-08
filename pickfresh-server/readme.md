# 📦 PickFresh Backend (Node.js + Express + MongoDB)

## 🚀 Project Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd pickfresh-server
```

### 2. Install dependencies

```bash
npm install
```

---

## ⚙️ Environment Variables

Create a `.env` file inside the `pickfresh-server` directory.

Example:

```env
MONGO_URI=your_mongodb_connection_string
PORT=5000
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
NODE_ENV=development
CLIENT_URL=http://localhost:5173
RATE_LIMIT_MAX=200
RESEND_API_KEY=your_resend_api_key
STRIPE_SECRET=your_stripe_secret
```

> **Important:** Never commit your `.env` file to GitHub.

---

## ▶️ Run the Project

### Development

```bash
npm run dev
```

### Production

```bash
npm start
```

---

## 🌐 Local Server

```text
http://localhost:5000
```

---

## 📘 Swagger API Documentation

```text
http://localhost:5000/api-docs
```

Swagger allows you to:

- Test API endpoints
- View request/response schemas
- Verify backend functionality

---

## 🗄️ Database

This project uses **MongoDB Atlas** as the cloud database.

Configure the connection using the `MONGO_URI` environment variable.

Example:

```text
mongodb://<username>:<password>@<cluster-address>/pickfresh?retryWrites=true&w=majority
```

---

## 📁 Project Structure

```text
pickfresh-server/
│
├── config/
├── controllers/
├── middleware/
├── models/
├── routes/
├── uploads/
├── utils/
├── server.js
├── package.json
└── README.md
```

---

## 🔁 Development Workflow

1. Configure the `.env` file.
2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open Swagger:

```text
http://localhost:5000/api-docs
```

---

## ⚠️ Common Issues

### MongoDB Connection Failed

- Verify `MONGO_URI` is correct.
- Ensure your MongoDB Atlas cluster is running.
- Check that your current IP address is allowed in Atlas Network Access.
- Verify your database username and password.

---

### Port Already in Use

Change the port in your `.env` file:

```env
PORT=5001
```

or stop the process using the current port.

---

### Missing Environment Variables

Ensure all required variables are present in your `.env` file before starting the server.

---

## ☁️ Production Deployment

### Backend

- **Platform:** Render

### Database

- **MongoDB Atlas**

### API Documentation

- Swagger available at:

```text
https://your-render-url.onrender.com/api-docs
```

---

## 🛠️ Tech Stack

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- Socket.IO
- JWT Authentication
- Swagger
- Multer
- Stripe
- Helmet
- Express Rate Limit

---

## 📄 License

This project is intended for educational and portfolio purposes.
