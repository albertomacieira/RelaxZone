# Relax Zone

Monolithic Express application that serves both a JSON API and Pug-rendered pages for the Relax Zone platform.

## Structure

```
relax-zone/
├─ src/
│  ├─ server.js
│  ├─ app.js
│  ├─ config/
│  ├─ db/
│  ├─ middlewares/
│  ├─ utils/
│  ├─ modules/
│  ├─ views/
│  └─ public/
├─ tests/
├─ .env
└─ package.json
```

## Scripts

- `npm run dev` – start the server with nodemon.
- `npm start` – start the server in production mode.

## Environment

Copy `.env` and adjust database credentials and JWT secrets before running the server.

Data base is on \db\backups\relax_zone_backup.zip