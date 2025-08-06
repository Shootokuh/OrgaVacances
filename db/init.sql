CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  google_id TEXT,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  password_hash TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE trips (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  destination TEXT,
  start_date DATE,
  end_date DATE,
  budget NUMERIC(10, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE activities (
  id SERIAL PRIMARY KEY,
  trip_id INTEGER REFERENCES trips(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME,          -- 🆕 heure de l’activité
  location TEXT,      -- 🆕 lieu de l’activité
  description TEXT
);

CREATE TABLE expenses (
  id SERIAL PRIMARY KEY,
  trip_id INTEGER REFERENCES trips(id),
  category VARCHAR(50),
  amount NUMERIC(10, 2),
  description TEXT,
  date DATE,
  paid_by VARCHAR(100)
);

CREATE TABLE checklistitems (
  id SERIAL PRIMARY KEY,
  trip_id INTEGER REFERENCES trips(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  is_checked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
