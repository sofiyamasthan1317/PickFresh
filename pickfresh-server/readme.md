---

# 📦 PickFresh Backend (Node.js + MongoDB)

## 🚀 Project Setup

### 1. Install dependencies

```bash
npm install
```

---

## ▶️ How to Run the Project

### Step 1: Start MongoDB (Local Database)

```bash
mongod --dbpath "D:\mongodb-data"
```

> ⚠️ Keep this terminal open (MongoDB must be running)

---

### Step 2: Start Backend Server

```bash
node server.js
```

OR (recommended):

```bash
nodemon server.js
```

---

## 🌐 Server URL

```bash
http://localhost:5000
```

---

## 📘 Swagger API Docs

```bash
http://localhost:5000/api-docs
```

Use this to:

* Test APIs
* Send requests (GET, POST)
* View request/response structure

---

## 🗄️ MongoDB Connection

```js
mongoose.connect("mongodb://127.0.0.1:27017/pickfresh")
```

* Database name: `pickfresh`
* Runs locally on port `27017`

---

## 📁 Project Structure

```
pickfresh-server/
│
├── server.js
├── config/
│   └── swagger.js
├── routes/
│   └── productRoute.js
├── controllers/
│   └── productController.js
├── models/
│   └── productModel.js
```

---

## 🔁 Daily Workflow

### Every time you start working:

1. Start MongoDB:

   ```bash
   mongod --dbpath "D:\mongodb-data"
   ```

2. Start backend:

   ```bash
   nodemon server.js
   ```

3. Open Swagger:

   ```
   http://localhost:5000/api-docs
   ```

---

## ⚠️ Common Errors & Fixes

### ❌ Cannot GET /api/products

👉 Route not connected
✔️ Fix:

```js
app.use("/api/products", productRoutes);
```

---

### ❌ Cannot find module './routes/productRoute'

👉 File path or name wrong
✔️ Fix:

* Check folder structure
* Check file name spelling

---

### ❌ buffering timed out after 10000ms

👉 MongoDB not connected
✔️ Fix:

* Start `mongod`
* Add mongoose connection

---

### ❌ app is not defined

👉 `app` used before initialization
✔️ Fix:

```js
const app = express();
```

---

## ☁️ Deployment (Future)

* Local MongoDB → ❌ not used
* Use **MongoDB Atlas (Cloud DB)** ✅
* Replace connection string:

```js
mongoose.connect("your-atlas-url")
```
