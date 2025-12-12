import sqlite3

# Connect to the database
conn = sqlite3.connect('student_assignment.db')
cursor = conn.cursor()

# Get all tables
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = cursor.fetchall()

print("=" * 60)
print("DATABASE STATUS CHECK")
print("=" * 60)
print(f"\nDatabase file: student_assignment.db")
print(f"Number of tables: {len(tables)}\n")

if tables:
    print("Tables in database:")
    for table in tables:
        table_name = table[0]
        print(f"\n  📋 {table_name}")
        
        # Get row count for each table
        cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
        count = cursor.fetchone()[0]
        print(f"     Rows: {count}")
        
        # Get column info
        cursor.execute(f"PRAGMA table_info({table_name})")
        columns = cursor.fetchall()
        print(f"     Columns: {', '.join([col[1] for col in columns])}")
else:
    print("⚠️  No tables found in database!")
    print("\n💡 You need to run: python init_db.py")

print("\n" + "=" * 60)
conn.close()
