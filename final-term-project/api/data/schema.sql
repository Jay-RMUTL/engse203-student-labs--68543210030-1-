CREATE TABLE IF NOT EXISTS print_shops (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    building TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS print_jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT NOT NULL,
    file_name TEXT NOT NULL,
    pages INTEGER NOT NULL CHECK (pages BETWEEN 1 AND 200),
    copies INTEGER NOT NULL CHECK (copies BETWEEN 1 AND 20),
    color_mode TEXT NOT NULL,
    shop_id INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'queued',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (shop_id) REFERENCES print_shops(id)
);