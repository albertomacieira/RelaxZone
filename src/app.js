const path = require("path");
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");

const { API_PREFIX, APP_NAME } = require("./config/constants");
const { getPool } = require("./db/pool");

const authRoutes = require("./modules/auth/auth.routes");
const usersRoutes = require("./modules/users/users.routes");
const servicesRoutes = require("./modules/services/services.routes");
const bookingsRoutes = require("./modules/bookings/bookings.routes");
const adminRoutes = require("./modules/admin/admin.routes");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

// Views
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// PÁGINAS PÚBLICAS
app.get("/", (req, res) => res.render("pages/login", { title: APP_NAME }));
app.get("/login", (req, res) => res.render("pages/login", { title: `${APP_NAME} · Login` }));
app.get("/home", (req, res) => res.render("pages/home", { title: `${APP_NAME} · Home` }));
app.get("/register", (req, res) => res.render("pages/register", { title: `${APP_NAME} · Register` }));
app.get("/profile", (req, res) => res.render("pages/profile", { title: `${APP_NAME} · Profile` }));
app.get("/services", (req, res) => res.render("pages/services", { title: `${APP_NAME} · Services` }));


// PÁGINAS ADMIN (3 páginas)
app.get("/admin", (req, res) => res.render("pages/admin/index", { title: `${APP_NAME} · Admin Dashboard` }));
app.get("/admin/users", (req, res) => res.render("pages/admin/users", { title: `${APP_NAME} · Admin · Users` }));
app.get("/admin/services", (req, res) => res.render("pages/admin/services", { title: `${APP_NAME} · Admin · Services` }));
app.get("/admin/bookings", (req, res) => res.render("pages/admin/bookings", { title: `${APP_NAME} · Admin · Bookings` }));

// HEALTH (alinhado com API_PREFIX)
app.get(`${API_PREFIX}/health`, async (req, res, next) => {
  try {
    const pool = getPool();
    const rows = await pool.query("SELECT 1 AS ok");
    res.json({ ok: true, db: rows[0].ok });
  } catch (err) {
    next(err);
  }
});

// API
app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/users`, usersRoutes);
app.use(`${API_PREFIX}/services`, servicesRoutes);
app.use(`${API_PREFIX}/bookings`, bookingsRoutes);
app.use(`${API_PREFIX}/admin`, adminRoutes);

// Error handler (sempre no fim)
app.use(errorHandler);

module.exports = app;


