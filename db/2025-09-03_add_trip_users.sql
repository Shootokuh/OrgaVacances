CREATE TABLE IF NOT EXISTS trip_users (
    trip_id INTEGER NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'viewer',
    PRIMARY KEY (trip_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_trip_users_user_id ON trip_users(user_id);
CREATE INDEX IF NOT EXISTS idx_trip_users_trip_id ON trip_users(trip_id);
