import os
import sys
from sqlalchemy import text
from app.core.database import engine, Base
import app.models.models

def rebuild_db():
    with engine.connect() as conn:
        print("Checking if 'duration' column exists in 'lectures' table...")
        try:
            conn.execute(text("ALTER TABLE lectures ADD COLUMN duration INT NOT NULL DEFAULT 0;"))
            conn.commit()
            print("Successfully added 'duration' column to 'lectures'.")
        except Exception as e:
            if "Duplicate column name" in str(e):
                print("'duration' column already exists.")
            else:
                print(f"Error altering table: {e}")
                
    print("Creating new tables if they don't exist...")
    Base.metadata.create_all(bind=engine)
    print("Database rebuild complete!")

if __name__ == "__main__":
    rebuild_db()
