from getpass import getpass

from werkzeug.security import generate_password_hash

from db import get_connection


def main():
    full_name = input("Admin full name: ").strip()
    email = input("Admin email: ").strip().lower()
    phone = input("Phone (optional): ").strip()
    password = getpass("Password: ")

    if not full_name or not email or len(password) < 8:
        print("Name and email are required, and the password must be at least 8 characters.")
        return

    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute("SELECT id FROM users WHERE email = %s", (email,))
        if cur.fetchone():
            print("An account with this email already exists.")
            return

        cur.execute(
            """
            INSERT INTO users (full_name, email, password_hash, phone, role)
            VALUES (%s, %s, %s, %s, 'admin')
            """,
            (full_name, email, generate_password_hash(password), phone),
        )
        conn.commit()
        print("Admin account created successfully.")
    except Exception as e:
        conn.rollback()
        print("Could not create admin:", e)
    finally:
        conn.close()


if __name__ == "__main__":
    main()