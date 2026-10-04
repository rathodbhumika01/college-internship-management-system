import os
import time
from datetime import datetime, timedelta, timezone
from functools import wraps

import jwt
from dotenv import load_dotenv
from flask import Flask, jsonify, request, g
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash

from db import get_connection

load_dotenv()

JWT_SECRET = os.getenv("JWT_SECRET")
if not JWT_SECRET or len(JWT_SECRET) < 32:
    raise RuntimeError("JWT_SECRET is missing or too short. Add a 64 character value to backend/.env")

TOKEN_HOURS = 8
MIN_PASSWORD_LENGTH = 8

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 1024 * 1024  # 1 MB is plenty for this API

ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(",")
    if origin.strip()
]
CORS(app, origins=ALLOWED_ORIGINS)


@app.after_request
def add_security_headers(response):
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Cache-Control"] = "no-store"
    return response


@app.errorhandler(404)
def not_found(_e):
    return jsonify({"success": False, "error": "Not found."}), 404


@app.errorhandler(405)
def wrong_method(_e):
    return jsonify({"success": False, "error": "Method not allowed."}), 405


@app.errorhandler(413)
def too_large(_e):
    return jsonify({"success": False, "error": "Request is too large."}), 413


# ---------------------------------------------------------------------------
# Login tokens and role checks
# ---------------------------------------------------------------------------

def make_token(user_id, role):
    payload = {
        "uid": user_id,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(hours=TOKEN_HOURS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")


def require_auth(*roles):
    """Only lets a request in if it carries a valid token, and (when roles are given) the right role.
    The id and role used by the routes always come from here, never from the request body."""

    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            header = request.headers.get("Authorization", "")
            if not header.startswith("Bearer "):
                return jsonify({"success": False, "error": "Please log in first."}), 401

            try:
                payload = jwt.decode(header[7:], JWT_SECRET, algorithms=["HS256"])
                user_id = int(payload["uid"])
            except jwt.ExpiredSignatureError:
                return jsonify({"success": False, "error": "Your session has expired. Please log in again."}), 401
            except (jwt.InvalidTokenError, KeyError, ValueError, TypeError):
                return jsonify({"success": False, "error": "Invalid login. Please log in again."}), 401

            # the database is the source of truth for role and status
            conn = get_connection()
            try:
                cur = conn.cursor()
                cur.execute("SELECT role, status FROM users WHERE id = %s", (user_id,))
                row = cur.fetchone()
            finally:
                conn.close()

            if not row or row[1] != "active":
                return jsonify({"success": False, "error": "This account is not active."}), 401

            g.user_id = user_id
            g.role = row[0]

            if roles and g.role not in roles:
                return jsonify({"success": False, "error": "You do not have permission to do this."}), 403

            return fn(*args, **kwargs)

        return wrapper

    return decorator


# Simple protection against password guessing: 5 wrong tries, then 10 minutes pause
FAILED_LOGINS = {}
MAX_FAILED_LOGINS = 5
LOCK_SECONDS = 600


def login_key(email):
    return f"{request.remote_addr}|{email}"


def is_locked(key):
    now = time.time()
    recent = [t for t in FAILED_LOGINS.get(key, []) if now - t < LOCK_SECONDS]
    FAILED_LOGINS[key] = recent
    return len(recent) >= MAX_FAILED_LOGINS


@app.route("/")
def home():
    return jsonify({"message": "College Internship Management System API is running"})


@app.route("/api/health")
def health():
    return jsonify({"status": "success", "message": "Backend is working"})


# ---------------------------------------------------------------------------
# Small helpers
# ---------------------------------------------------------------------------

def iso(v):
    return v.isoformat() if v else None


def to_int_or_none(v):
    if v is None or v == "":
        return None
    return int(v)


def to_text_or_none(v):
    v = v.strip() if isinstance(v, str) else v
    return v or None


def to_list(v):
    """Accepts a list of strings, or one string with items on separate lines."""
    if v is None:
        return []
    if isinstance(v, str):
        v = v.splitlines()
    return [str(x).strip() for x in v if str(x).strip()]


# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------

@app.route("/api/auth/register/student", methods=["POST"])
def register_student():
    data = request.get_json(silent=True) or {}

    full_name = (data.get("full_name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    phone = (data.get("phone") or "").strip()
    department = (data.get("department") or "").strip()

    if not full_name or not email or not department:
        return jsonify({"success": False, "error": "Name, email and department are required."}), 400
    if "@" not in email or "." not in email:
        return jsonify({"success": False, "error": "Please enter a valid email address."}), 400
    if len(password) < MIN_PASSWORD_LENGTH:
        return jsonify({"success": False, "error": f"Password must be at least {MIN_PASSWORD_LENGTH} characters."}), 400

    try:
        gpa = float(data.get("gpa"))
    except (TypeError, ValueError):
        return jsonify({"success": False, "error": "Please enter a valid GPA."}), 400
    if gpa < 0 or gpa > 10:
        return jsonify({"success": False, "error": "GPA must be between 0 and 10."}), 400

    conn = get_connection()
    try:
        cur = conn.cursor()

        cur.execute("SELECT id FROM users WHERE email = %s", (email,))
        if cur.fetchone():
            return jsonify({"success": False, "error": "An account with this email already exists."}), 409

        cur.execute(
            """
            INSERT INTO users (full_name, email, password_hash, phone, role)
            VALUES (%s, %s, %s, %s, 'student')
            RETURNING id
            """,
            (full_name, email, generate_password_hash(password), phone),
        )
        user_id = cur.fetchone()[0]

        cur.execute(
            "INSERT INTO students (user_id, department, gpa) VALUES (%s, %s, %s)",
            (user_id, department, gpa),
        )
        conn.commit()
    except Exception as e:
        conn.rollback()
        print("Register error:", e)
        return jsonify({"success": False, "error": "Something went wrong. Please try again."}), 500
    finally:
        conn.close()

    return jsonify({"success": True, "message": "Student account created successfully."}), 201


@app.route("/api/auth/register/faculty", methods=["POST"])
def register_faculty():
    data = request.get_json(silent=True) or {}

    full_name = (data.get("full_name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    phone = (data.get("phone") or "").strip()
    department = (data.get("department") or "").strip()
    designation = (data.get("designation") or "").strip()

    if not full_name or not email or not department or not designation:
        return jsonify({"success": False, "error": "Name, email, department and designation are required."}), 400
    if "@" not in email or "." not in email:
        return jsonify({"success": False, "error": "Please enter a valid email address."}), 400
    if len(password) < MIN_PASSWORD_LENGTH:
        return jsonify({"success": False, "error": f"Password must be at least {MIN_PASSWORD_LENGTH} characters."}), 400

    conn = get_connection()
    try:
        cur = conn.cursor()

        cur.execute("SELECT id FROM users WHERE email = %s", (email,))
        if cur.fetchone():
            return jsonify({"success": False, "error": "An account with this email already exists."}), 409

        cur.execute(
            """
            INSERT INTO users (full_name, email, password_hash, phone, role)
            VALUES (%s, %s, %s, %s, 'faculty')
            RETURNING id
            """,
            (full_name, email, generate_password_hash(password), phone),
        )
        user_id = cur.fetchone()[0]

        cur.execute(
            "INSERT INTO faculty (user_id, department, designation) VALUES (%s, %s, %s)",
            (user_id, department, designation),
        )
        conn.commit()
    except Exception as e:
        conn.rollback()
        print("Faculty register error:", e)
        return jsonify({"success": False, "error": "Something went wrong. Please try again."}), 500
    finally:
        conn.close()

    return jsonify({"success": True, "message": "Faculty account created successfully."}), 201


@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}

    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    role = data.get("role") or ""

    if not email or not password or not role:
        return jsonify({"success": False, "error": "Email, password and role are required."}), 400

    key = login_key(email)
    if is_locked(key):
        return jsonify({"success": False, "error": "Too many failed attempts. Please try again in 10 minutes."}), 429

    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute(
            "SELECT id, full_name, email, password_hash, phone, role, status FROM users WHERE email = %s",
            (email,),
        )
        row = cur.fetchone()

        if not row or row[5] != role or not check_password_hash(row[3], password):
            FAILED_LOGINS.setdefault(key, []).append(time.time())
            return jsonify({"success": False, "error": "Invalid email, password or role."}), 401

        if row[6] != "active":
            return jsonify({"success": False, "error": "This account has been deactivated."}), 403

        user = {
            "id": row[0],
            "name": row[1],
            "email": row[2],
            "phone": row[4],
            "role": row[5],
        }

        if role == "student":
            cur.execute("SELECT department, gpa FROM students WHERE user_id = %s", (row[0],))
            extra = cur.fetchone()
            if extra:
                user["department"] = extra[0]
                user["gpa"] = float(extra[1]) if extra[1] is not None else None
        elif role == "faculty":
            cur.execute("SELECT department, designation FROM faculty WHERE user_id = %s", (row[0],))
            extra = cur.fetchone()
            if extra:
                user["department"] = extra[0]
                user["designation"] = extra[1]
    finally:
        conn.close()

    FAILED_LOGINS.pop(key, None)
    user["token"] = make_token(row[0], row[5])
    return jsonify({"success": True, "user": user, "message": "Login successful."})


# ---------------------------------------------------------------------------
# Companies
# ---------------------------------------------------------------------------

COMPANY_COLUMNS = "id, name, reg_number, location, industry, contact_person, contact_email, contact_phone, website, status"


def company_row(r):
    return {
        "id": r[0],
        "name": r[1],
        "reg_number": r[2],
        "location": r[3],
        "industry": r[4],
        "contact_person": r[5],
        "contact_email": r[6],
        "contact_phone": r[7],
        "website": r[8],
        "status": r[9],
    }


@app.route("/api/companies", methods=["GET"])
@require_auth("student", "faculty", "admin")
def list_companies():
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute(f"SELECT {COMPANY_COLUMNS} FROM companies ORDER BY id")
        rows = cur.fetchall()
    finally:
        conn.close()
    return jsonify({"success": True, "companies": [company_row(r) for r in rows]})


@app.route("/api/companies", methods=["POST"])
@require_auth("admin")
def add_company():
    data = request.get_json(silent=True) or {}

    name = (data.get("name") or "").strip()
    reg_number = (data.get("reg_number") or "").strip()
    if not name or not reg_number:
        return jsonify({"success": False, "error": "Company name and registration number are required."}), 400

    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute("SELECT id FROM companies WHERE reg_number = %s", (reg_number,))
        if cur.fetchone():
            return jsonify({"success": False, "error": "A company with this registration number already exists."}), 409

        cur.execute(
            f"""
            INSERT INTO companies (name, reg_number, location, industry, contact_person, contact_email, contact_phone, website)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING {COMPANY_COLUMNS}
            """,
            (
                name,
                reg_number,
                (data.get("location") or "").strip(),
                (data.get("industry") or "").strip(),
                (data.get("contact_person") or "").strip(),
                (data.get("contact_email") or "").strip(),
                (data.get("contact_phone") or "").strip(),
                (data.get("website") or "").strip(),
            ),
        )
        company = company_row(cur.fetchone())
        conn.commit()
    except Exception as e:
        conn.rollback()
        print("Add company error:", e)
        return jsonify({"success": False, "error": "Something went wrong. Please try again."}), 500
    finally:
        conn.close()

    return jsonify({"success": True, "company": company}), 201


@app.route("/api/companies/<int:company_id>/status", methods=["PATCH"])
@require_auth("admin")
def set_company_status(company_id):
    data = request.get_json(silent=True) or {}
    status = data.get("status")
    if status not in ("active", "archived"):
        return jsonify({"success": False, "error": "Status must be active or archived."}), 400

    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute("UPDATE companies SET status = %s WHERE id = %s", (status, company_id))
        if cur.rowcount == 0:
            return jsonify({"success": False, "error": "Company not found."}), 404
        conn.commit()
    finally:
        conn.close()

    return jsonify({"success": True, "message": "Company updated."})


# ---------------------------------------------------------------------------
# Internships
# ---------------------------------------------------------------------------

INTERNSHIP_SELECT = """
    SELECT i.id, i.company_id, c.name, i.posted_by, u.full_name, i.title, i.description,
           i.domain, i.duration_weeks, i.stipend, i.location, i.work_mode,
           i.start_date, i.end_date, i.application_deadline, i.status, i.created_at,
           i.skills, i.responsibilities, i.eligibility, c.industry
    FROM internships i
    JOIN companies c ON c.id = i.company_id
    LEFT JOIN users u ON u.id = i.posted_by
"""

WORK_MODES = ("Remote", "Hybrid", "On-site")
INTERNSHIP_STATUSES = ("pending_approval", "approved", "rejected", "closed", "archived")


def internship_row(r):
    return {
        "id": r[0],
        "company_id": r[1],
        "company_name": r[2],
        "posted_by": r[3],
        "posted_by_name": r[4],
        "title": r[5],
        "description": r[6],
        "domain": r[7],
        "duration_weeks": r[8],
        "stipend": r[9],
        "location": r[10],
        "work_mode": r[11],
        "start_date": iso(r[12]),
        "end_date": iso(r[13]),
        "application_deadline": iso(r[14]),
        "status": r[15],
        "created_at": iso(r[16]),
        "skills": r[17] or [],
        "responsibilities": r[18] or [],
        "eligibility": r[19],
        "company_industry": r[20],
    }


@app.route("/api/internships", methods=["POST"])
@require_auth("faculty")
def add_internship():
    data = request.get_json(silent=True) or {}

    title = (data.get("title") or "").strip()
    if not title or not data.get("company_id"):
        return jsonify({"success": False, "error": "Title and company_id are required."}), 400

    try:
        company_id = int(data["company_id"])
        duration_weeks = to_int_or_none(data.get("duration_weeks"))
        stipend = to_int_or_none(data.get("stipend"))
    except (ValueError, TypeError):
        return jsonify({"success": False, "error": "company_id, duration_weeks and stipend must be numbers."}), 400

    if duration_weeks is not None and not (4 <= duration_weeks <= 26):
        return jsonify({"success": False, "error": "Duration must be between 4 and 26 weeks."}), 400
    if stipend is not None and stipend < 0:
        return jsonify({"success": False, "error": "Stipend cannot be negative."}), 400

    work_mode = to_text_or_none(data.get("work_mode"))
    if work_mode is not None and work_mode not in WORK_MODES:
        return jsonify({"success": False, "error": "Work mode must be Remote, Hybrid or On-site."}), 400

    conn = get_connection()
    try:
        cur = conn.cursor()

        cur.execute("SELECT status FROM companies WHERE id = %s", (company_id,))
        company = cur.fetchone()
        if not company:
            return jsonify({"success": False, "error": "Company not found."}), 404
        if company[0] != "active":
            return jsonify({"success": False, "error": "This company is archived."}), 400

        cur.execute(
            """
            INSERT INTO internships
              (company_id, posted_by, title, description, domain, duration_weeks, stipend,
               location, work_mode, start_date, end_date, application_deadline,
               skills, responsibilities, eligibility, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'pending_approval')
            RETURNING id
            """,
            (
                company_id,
                g.user_id,
                title,
                to_text_or_none(data.get("description")),
                to_text_or_none(data.get("domain")),
                duration_weeks,
                stipend if stipend is not None else 0,
                to_text_or_none(data.get("location")),
                work_mode,
                to_text_or_none(data.get("start_date")),
                to_text_or_none(data.get("end_date")),
                to_text_or_none(data.get("application_deadline")),
                to_list(data.get("skills")),
                to_list(data.get("responsibilities")),
                to_text_or_none(data.get("eligibility")),
            ),
        )
        new_id = cur.fetchone()[0]
        cur.execute(INTERNSHIP_SELECT + " WHERE i.id = %s", (new_id,))
        internship = internship_row(cur.fetchone())
        conn.commit()
    except Exception as e:
        conn.rollback()
        print("Add internship error:", e)
        return jsonify({"success": False, "error": "Something went wrong. Please try again."}), 500
    finally:
        conn.close()

    return jsonify({"success": True, "internship": internship}), 201


@app.route("/api/internships", methods=["GET"])
@require_auth("student", "faculty", "admin")
def list_internships():
    # ?status=approved (default) | pending_approval | rejected | closed | archived | all
    status = request.args.get("status", "approved")
    if status not in ("all",) + INTERNSHIP_STATUSES:
        return jsonify({"success": False, "error": "Invalid status filter."}), 400

    # students can only ever see approved internships
    if g.role == "student":
        status = "approved"

    conn = get_connection()
    try:
        cur = conn.cursor()
        if status == "all":
            cur.execute(INTERNSHIP_SELECT + " ORDER BY i.created_at DESC")
        else:
            cur.execute(INTERNSHIP_SELECT + " WHERE i.status = %s ORDER BY i.created_at DESC", (status,))
        rows = cur.fetchall()
    finally:
        conn.close()

    return jsonify({"success": True, "internships": [internship_row(r) for r in rows]})


@app.route("/api/internships/<int:internship_id>/status", methods=["PATCH"])
@require_auth("faculty", "admin")
def set_internship_status(internship_id):
    data = request.get_json(silent=True) or {}
    status = data.get("status")
    if status not in INTERNSHIP_STATUSES:
        return jsonify({"success": False, "error": "Invalid status."}), 400

    conn = get_connection()
    try:
        cur = conn.cursor()

        if g.role == "faculty":
            # faculty can only close or archive internships they posted themselves
            if status not in ("closed", "archived"):
                return jsonify({"success": False, "error": "Only the admin can approve or reject internships."}), 403
            cur.execute("SELECT posted_by FROM internships WHERE id = %s", (internship_id,))
            row = cur.fetchone()
            if not row or row[0] != g.user_id:
                return jsonify({"success": False, "error": "Internship not found."}), 404

        cur.execute("UPDATE internships SET status = %s WHERE id = %s", (status, internship_id))
        if cur.rowcount == 0:
            return jsonify({"success": False, "error": "Internship not found."}), 404
        conn.commit()
    finally:
        conn.close()

    return jsonify({"success": True, "message": f"Internship {status}."})


# ---------------------------------------------------------------------------
# Applications
# ---------------------------------------------------------------------------

APPLICATION_SELECT = """
    SELECT a.id, a.student_id, u.full_name, u.email, s.department, s.gpa,
           a.internship_id, i.title, c.name, a.resume_filename, a.cover_letter,
           a.qualifications, a.status, a.applied_at, a.faculty_feedback
    FROM applications a
    JOIN students s ON s.user_id = a.student_id
    JOIN users u ON u.id = s.user_id
    JOIN internships i ON i.id = a.internship_id
    JOIN companies c ON c.id = i.company_id
"""

APPLICATION_STATUSES = ("pending", "shortlisted", "rejected", "accepted", "withdrawn")

STATUS_NOTES = {
    "pending": "Application marked as pending review.",
    "shortlisted": "Candidate shortlisted for interview round.",
    "rejected": "Application not selected for this position.",
    "accepted": "Candidate selected and internship offer extended.",
    "withdrawn": "Application withdrawn by student.",
}


def application_row(r, timeline):
    return {
        "id": r[0],
        "student_id": r[1],
        "student_name": r[2],
        "student_email": r[3],
        "student_department": r[4],
        "student_gpa": float(r[5]) if r[5] is not None else None,
        "internship_id": r[6],
        "internship_title": r[7],
        "company_name": r[8],
        "resume_filename": r[9],
        "cover_letter": r[10],
        "qualifications": r[11],
        "status": r[12],
        "applied_date": r[13].date().isoformat() if r[13] else None,
        "faculty_feedback": r[14],
        "timeline": timeline,
    }


def load_timelines(cur, application_ids):
    result = {i: [] for i in application_ids}
    if not application_ids:
        return result
    cur.execute(
        """
        SELECT application_id, status, note, created_at
        FROM application_timeline
        WHERE application_id = ANY(%s)
        ORDER BY created_at, id
        """,
        (list(application_ids),),
    )
    for app_id, status, note, created_at in cur.fetchall():
        result[app_id].append({"status": status, "date": created_at.date().isoformat(), "note": note})
    return result


def fetch_applications(cur, where="", params=()):
    cur.execute(APPLICATION_SELECT + where + " ORDER BY a.applied_at DESC", params)
    rows = cur.fetchall()
    timelines = load_timelines(cur, [r[0] for r in rows])
    return [application_row(r, timelines[r[0]]) for r in rows]


@app.route("/api/applications", methods=["POST"])
@require_auth("student")
def apply_for_internship():
    data = request.get_json(silent=True) or {}

    try:
        internship_id = int(data.get("internship_id"))
    except (TypeError, ValueError):
        return jsonify({"success": False, "error": "internship_id is required."}), 400

    student_id = g.user_id

    resume_filename = to_text_or_none(data.get("resume_filename"))
    if resume_filename and not resume_filename.lower().endswith(".pdf"):
        return jsonify({"success": False, "error": "Resume must be a PDF file."}), 400

    conn = get_connection()
    try:
        cur = conn.cursor()

        cur.execute("SELECT 1 FROM students WHERE user_id = %s", (student_id,))
        if not cur.fetchone():
            return jsonify({"success": False, "error": "Only students can apply for internships."}), 403

        cur.execute(
            "SELECT status, application_deadline < CURRENT_DATE FROM internships WHERE id = %s",
            (internship_id,),
        )
        internship = cur.fetchone()
        if not internship:
            return jsonify({"success": False, "error": "Internship not found."}), 404
        if internship[0] != "approved":
            return jsonify({"success": False, "error": "This internship is not open for applications."}), 400
        if internship[1]:
            return jsonify({"success": False, "error": "The application deadline for this internship has passed."}), 400

        cur.execute(
            "SELECT id, status FROM applications WHERE student_id = %s AND internship_id = %s",
            (student_id, internship_id),
        )
        existing = cur.fetchone()

        if existing and existing[1] != "withdrawn":
            return jsonify({"success": False, "error": "You have already applied for this internship."}), 409

        if existing:
            application_id = existing[0]
            cur.execute(
                """
                UPDATE applications
                SET status = 'pending', resume_filename = %s, cover_letter = %s,
                    qualifications = %s, faculty_feedback = NULL, applied_at = CURRENT_TIMESTAMP
                WHERE id = %s
                """,
                (resume_filename, to_text_or_none(data.get("cover_letter")),
                 to_text_or_none(data.get("qualifications")), application_id),
            )
        else:
            cur.execute(
                """
                INSERT INTO applications (student_id, internship_id, resume_filename, cover_letter, qualifications)
                VALUES (%s, %s, %s, %s, %s)
                RETURNING id
                """,
                (student_id, internship_id, resume_filename,
                 to_text_or_none(data.get("cover_letter")), to_text_or_none(data.get("qualifications"))),
            )
            application_id = cur.fetchone()[0]

        cur.execute(
            "INSERT INTO application_timeline (application_id, status, note) VALUES (%s, 'submitted', %s)",
            (application_id, "Application submitted successfully."),
        )
        application = fetch_applications(cur, " WHERE a.id = %s", (application_id,))[0]
        conn.commit()
    except Exception as e:
        conn.rollback()
        print("Apply error:", e)
        return jsonify({"success": False, "error": "Something went wrong. Please try again."}), 500
    finally:
        conn.close()

    return jsonify({"success": True, "application": application}), 201


@app.route("/api/applications", methods=["GET"])
@require_auth("student", "faculty", "admin")
def list_applications():
    # students only ever get their own applications; faculty and admin can filter
    # optional filters: ?student_id=2  and/or  ?internship_id=1
    conditions, params = [], []

    if g.role == "student":
        conditions.append("a.student_id = %s")
        params.append(g.user_id)
        filters = (("internship_id", "a.internship_id"),)
    else:
        filters = (("student_id", "a.student_id"), ("internship_id", "a.internship_id"))

    for field, column in filters:
        value = request.args.get(field)
        if value:
            if not value.isdigit():
                return jsonify({"success": False, "error": f"{field} must be a number."}), 400
            conditions.append(f"{column} = %s")
            params.append(int(value))
    where = (" WHERE " + " AND ".join(conditions)) if conditions else ""

    conn = get_connection()
    try:
        cur = conn.cursor()
        applications = fetch_applications(cur, where, tuple(params))
    finally:
        conn.close()

    return jsonify({"success": True, "applications": applications})


@app.route("/api/applications/<int:application_id>/status", methods=["PATCH"])
@require_auth("student", "faculty", "admin")
def set_application_status(application_id):
    data = request.get_json(silent=True) or {}
    status = data.get("status")
    if status not in APPLICATION_STATUSES:
        return jsonify({"success": False, "error": "Invalid status."}), 400
    feedback = to_text_or_none(data.get("feedback"))

    # a student can only withdraw their own application
    if g.role == "student" and status != "withdrawn":
        return jsonify({"success": False, "error": "You do not have permission to do this."}), 403

    conn = get_connection()
    try:
        cur = conn.cursor()

        if g.role == "student":
            cur.execute("SELECT student_id FROM applications WHERE id = %s", (application_id,))
            row = cur.fetchone()
            if not row or row[0] != g.user_id:
                return jsonify({"success": False, "error": "Application not found."}), 404

        cur.execute(
            "UPDATE applications SET status = %s, faculty_feedback = COALESCE(%s, faculty_feedback) WHERE id = %s",
            (status, feedback, application_id),
        )
        if cur.rowcount == 0:
            return jsonify({"success": False, "error": "Application not found."}), 404
        cur.execute(
            "INSERT INTO application_timeline (application_id, status, note) VALUES (%s, %s, %s)",
            (application_id, status, feedback or STATUS_NOTES[status]),
        )
        conn.commit()
    except Exception as e:
        conn.rollback()
        print("Application status error:", e)
        return jsonify({"success": False, "error": "Something went wrong. Please try again."}), 500
    finally:
        conn.close()

    return jsonify({"success": True, "message": f"Application {status}."})


# ---------------------------------------------------------------------------
# Interviews
# ---------------------------------------------------------------------------

INTERVIEW_SELECT = """
    SELECT iv.id, iv.application_id, a.student_id, u.full_name, u.email,
           a.internship_id, i.title, c.name, iv.interview_date, iv.interview_time,
           iv.interviewer, iv.status, iv.result, iv.comments, iv.feedback,
           iv.scheduled_by, iv.created_at
    FROM interviews iv
    JOIN applications a ON a.id = iv.application_id
    JOIN users u ON u.id = a.student_id
    JOIN internships i ON i.id = a.internship_id
    JOIN companies c ON c.id = i.company_id
"""


def interview_row(r):
    return {
        "id": r[0],
        "application_id": r[1],
        "student_id": r[2],
        "student_name": r[3],
        "student_email": r[4],
        "internship_id": r[5],
        "internship_title": r[6],
        "company_name": r[7],
        "date": r[8].isoformat(),
        "time": r[9].strftime("%H:%M"),
        "interviewer": r[10],
        "status": r[11],
        "result": r[12],
        "comments": r[13],
        "feedback": r[14],
        "faculty_id": r[15],
        "created_at": iso(r[16]),
    }


def parse_interview_time(date_text, time_text):
    """Returns a datetime, or None if the date or time is not valid."""
    try:
        return datetime.strptime(f"{date_text} {time_text[:5]}", "%Y-%m-%d %H:%M")
    except (ValueError, TypeError):
        return None


@app.route("/api/interviews", methods=["POST"])
@require_auth("faculty")
def schedule_interview():
    data = request.get_json(silent=True) or {}

    try:
        application_id = int(data.get("application_id"))
    except (TypeError, ValueError):
        return jsonify({"success": False, "error": "application_id is required."}), 400

    date_text = to_text_or_none(data.get("date"))
    time_text = to_text_or_none(data.get("time"))
    when = parse_interview_time(date_text, time_text) if date_text and time_text else None
    if not when:
        return jsonify({"success": False, "error": "Please give a valid interview date and time."}), 400
    if when < datetime.now() + timedelta(hours=24):
        return jsonify({"success": False, "error": "Interviews require at least 24 hours advance notice."}), 400

    conn = get_connection()
    try:
        cur = conn.cursor()

        cur.execute("SELECT status FROM applications WHERE id = %s", (application_id,))
        application = cur.fetchone()
        if not application:
            return jsonify({"success": False, "error": "Application not found."}), 404
        if application[0] not in ("pending", "shortlisted"):
            return jsonify({"success": False, "error": "Interviews can only be scheduled for pending or shortlisted applications."}), 400

        cur.execute(
            """
            INSERT INTO interviews (application_id, scheduled_by, interview_date, interview_time, interviewer, comments)
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING id
            """,
            (application_id, g.user_id, date_text, time_text,
             to_text_or_none(data.get("interviewer")), to_text_or_none(data.get("comments"))),
        )
        new_id = cur.fetchone()[0]
        cur.execute(INTERVIEW_SELECT + " WHERE iv.id = %s", (new_id,))
        interview = interview_row(cur.fetchone())
        conn.commit()
    except Exception as e:
        conn.rollback()
        print("Schedule interview error:", e)
        return jsonify({"success": False, "error": "Something went wrong. Please try again."}), 500
    finally:
        conn.close()

    return jsonify({"success": True, "interview": interview}), 201


@app.route("/api/interviews", methods=["GET"])
@require_auth("student", "faculty", "admin")
def list_interviews():
    # students only ever get their own interviews; faculty and admin can filter
    # optional filters: ?student_id=2  and/or  ?application_id=1
    conditions, params = [], []

    if g.role == "student":
        conditions.append("a.student_id = %s")
        params.append(g.user_id)
        filters = (("application_id", "iv.application_id"),)
    else:
        filters = (("student_id", "a.student_id"), ("application_id", "iv.application_id"))

    for field, column in filters:
        value = request.args.get(field)
        if value:
            if not value.isdigit():
                return jsonify({"success": False, "error": f"{field} must be a number."}), 400
            conditions.append(f"{column} = %s")
            params.append(int(value))
    where = (" WHERE " + " AND ".join(conditions)) if conditions else ""

    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute(INTERVIEW_SELECT + where + " ORDER BY iv.interview_date, iv.interview_time", tuple(params))
        interviews = [interview_row(r) for r in cur.fetchall()]
    finally:
        conn.close()

    return jsonify({"success": True, "interviews": interviews})


@app.route("/api/interviews/<int:interview_id>", methods=["PATCH"])
@require_auth("faculty")
def update_interview(interview_id):
    # One action at a time: reschedule (date + time), cancel (status), or result (+ feedback)
    data = request.get_json(silent=True) or {}

    new_date = to_text_or_none(data.get("date"))
    new_time = to_text_or_none(data.get("time"))
    result = data.get("result")

    if new_date or new_time:
        when = parse_interview_time(new_date, new_time) if new_date and new_time else None
        if not when:
            return jsonify({"success": False, "error": "Please give a valid date and time to reschedule."}), 400
        if when < datetime.now() + timedelta(hours=24):
            return jsonify({"success": False, "error": "Rescheduling requires at least 24 hours advance notice."}), 400
        sql = "UPDATE interviews SET interview_date = %s, interview_time = %s, status = 'rescheduled' WHERE id = %s"
        params = (new_date, new_time, interview_id)
    elif data.get("status") == "cancelled":
        sql = "UPDATE interviews SET status = 'cancelled' WHERE id = %s"
        params = (interview_id,)
    elif result:
        if result not in ("selected", "rejected", "on_hold"):
            return jsonify({"success": False, "error": "Result must be selected, rejected or on_hold."}), 400
        sql = "UPDATE interviews SET result = %s, feedback = %s, status = 'completed' WHERE id = %s"
        params = (result, to_text_or_none(data.get("feedback")), interview_id)
    else:
        return jsonify({"success": False, "error": "Nothing to update."}), 400

    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute(sql, params)
        if cur.rowcount == 0:
            return jsonify({"success": False, "error": "Interview not found."}), 404
        conn.commit()
    except Exception as e:
        conn.rollback()
        print("Update interview error:", e)
        return jsonify({"success": False, "error": "Something went wrong. Please try again."}), 500
    finally:
        conn.close()

    return jsonify({"success": True, "message": "Interview updated."})


# ---------------------------------------------------------------------------
# Students and Faculty (read) + account status
# ---------------------------------------------------------------------------

@app.route("/api/students", methods=["GET"])
@require_auth("faculty", "admin")
def list_students():
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute(
            """
            SELECT u.id, u.full_name, u.email, u.phone, s.department, s.gpa, u.status,
                   (SELECT c.name
                    FROM applications a
                    JOIN internships i ON i.id = a.internship_id
                    JOIN companies c ON c.id = i.company_id
                    WHERE a.student_id = u.id AND a.status = 'accepted'
                    ORDER BY a.applied_at DESC LIMIT 1) AS placed_company
            FROM users u
            JOIN students s ON s.user_id = u.id
            ORDER BY u.id
            """
        )
        rows = cur.fetchall()
    finally:
        conn.close()

    students = [
        {
            "id": r[0],
            "user_id": r[0],
            "name": r[1],
            "email": r[2],
            "phone": r[3] or "",
            "department": r[4],
            "gpa": float(r[5]) if r[5] is not None else 0,
            "status": r[6],
            "placed": r[7] is not None,
            "placed_company": r[7],
        }
        for r in rows
    ]
    return jsonify({"success": True, "students": students})


@app.route("/api/faculty", methods=["GET"])
@require_auth("faculty", "admin")
def list_faculty():
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute(
            """
            SELECT u.id, u.full_name, u.email, u.phone, f.department, f.designation, u.status
            FROM users u
            JOIN faculty f ON f.user_id = u.id
            ORDER BY u.id
            """
        )
        rows = cur.fetchall()
    finally:
        conn.close()

    faculty = [
        {
            "id": r[0],
            "user_id": r[0],
            "name": r[1],
            "email": r[2],
            "phone": r[3] or "",
            "department": r[4],
            "designation": r[5],
            "status": r[6],
        }
        for r in rows
    ]
    return jsonify({"success": True, "faculty": faculty})


@app.route("/api/users/<int:user_id>/status", methods=["PATCH"])
@require_auth("admin")
def set_user_status(user_id):
    data = request.get_json(silent=True) or {}
    status = data.get("status")
    if status not in ("active", "deactivated"):
        return jsonify({"success": False, "error": "Status must be active or deactivated."}), 400

    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute("SELECT role FROM users WHERE id = %s", (user_id,))
        row = cur.fetchone()
        if not row:
            return jsonify({"success": False, "error": "User not found."}), 404
        if row[0] == "admin":
            return jsonify({"success": False, "error": "Admin accounts cannot be deactivated here."}), 403
        cur.execute("UPDATE users SET status = %s WHERE id = %s", (status, user_id))
        conn.commit()
    finally:
        conn.close()

    return jsonify({"success": True, "message": f"Account {status}."})


# ---------------------------------------------------------------------------
# Evaluations (faculty), student feedback and system feedback
# ---------------------------------------------------------------------------

def rating(v):
    """Returns an int from 1 to 5, or None if it is not valid."""
    try:
        n = int(v)
    except (TypeError, ValueError):
        return None
    return n if 1 <= n <= 5 else None


def find_application(cur, student_id, internship_id):
    cur.execute(
        "SELECT id, status FROM applications WHERE student_id = %s AND internship_id = %s",
        (student_id, internship_id),
    )
    return cur.fetchone()


EVALUATION_SELECT = """
    SELECT f.id, a.student_id, su.full_name, a.internship_id, i.title, c.name,
           f.faculty_id, fu.full_name,
           f.technical_skills, f.soft_skills, f.punctuality, f.responsibility,
           f.teamwork, f.learning_ability, f.comments, f.hire_likelihood, f.created_at
    FROM feedback f
    JOIN applications a ON a.id = f.application_id
    JOIN users su ON su.id = a.student_id
    JOIN internships i ON i.id = a.internship_id
    JOIN companies c ON c.id = i.company_id
    LEFT JOIN users fu ON fu.id = f.faculty_id
"""


def evaluation_row(r):
    scores = [x for x in r[8:14] if x is not None]
    return {
        "id": r[0],
        "student_id": r[1],
        "student_name": r[2],
        "internship_id": r[3],
        "internship_title": r[4],
        "company_name": r[5],
        "faculty_id": r[6],
        "faculty_name": r[7] or "Faculty",
        "technical_skills": r[8],
        "soft_skills": r[9],
        "punctuality": r[10],
        "responsibility": r[11],
        "teamwork": r[12],
        "learning_ability": r[13],
        "average_score": round(sum(scores) / len(scores), 1) if scores else 0,
        "comments": r[14] or "",
        "hire_likelihood": r[15] or "moderate",
        "created_at": iso(r[16]),
    }


@app.route("/api/evaluations", methods=["POST"])
@require_auth("faculty")
def add_evaluation():
    data = request.get_json(silent=True) or {}

    try:
        student_id = int(data.get("student_id"))
        internship_id = int(data.get("internship_id"))
    except (TypeError, ValueError):
        return jsonify({"success": False, "error": "student_id and internship_id are required."}), 400

    fields = ("technical_skills", "soft_skills", "punctuality", "responsibility", "teamwork", "learning_ability")
    scores = {name: rating(data.get(name)) for name in fields}
    if any(v is None for v in scores.values()):
        return jsonify({"success": False, "error": "Every rating must be between 1 and 5."}), 400

    hire = data.get("hire_likelihood")
    if hire not in ("high", "moderate", "low"):
        return jsonify({"success": False, "error": "Hire likelihood must be high, moderate or low."}), 400

    conn = get_connection()
    try:
        cur = conn.cursor()

        application = find_application(cur, student_id, internship_id)
        if not application:
            return jsonify({"success": False, "error": "This student has not applied for this internship."}), 404
        if application[1] != "accepted":
            return jsonify({"success": False, "error": "Evaluations can only be given for accepted applications."}), 400

        cur.execute(
            """
            INSERT INTO feedback (application_id, faculty_id, technical_skills, soft_skills, punctuality,
                                  responsibility, teamwork, learning_ability, comments, hire_likelihood)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
            """,
            (application[0], g.user_id, scores["technical_skills"], scores["soft_skills"],
             scores["punctuality"], scores["responsibility"], scores["teamwork"],
             scores["learning_ability"], to_text_or_none(data.get("comments")), hire),
        )
        new_id = cur.fetchone()[0]
        cur.execute(EVALUATION_SELECT + " WHERE f.id = %s", (new_id,))
        evaluation = evaluation_row(cur.fetchone())
        conn.commit()
    except Exception as e:
        conn.rollback()
        print("Add evaluation error:", e)
        return jsonify({"success": False, "error": "Something went wrong. Please try again."}), 500
    finally:
        conn.close()

    return jsonify({"success": True, "evaluation": evaluation}), 201


@app.route("/api/evaluations", methods=["GET"])
@require_auth("student", "faculty", "admin")
def list_evaluations():
    conn = get_connection()
    try:
        cur = conn.cursor()
        if g.role == "student":
            cur.execute(EVALUATION_SELECT + " WHERE a.student_id = %s ORDER BY f.created_at DESC", (g.user_id,))
        else:
            student_id = request.args.get("student_id")
            if student_id:
                if not student_id.isdigit():
                    return jsonify({"success": False, "error": "student_id must be a number."}), 400
                cur.execute(EVALUATION_SELECT + " WHERE a.student_id = %s ORDER BY f.created_at DESC", (int(student_id),))
            else:
                cur.execute(EVALUATION_SELECT + " ORDER BY f.created_at DESC")
        evaluations = [evaluation_row(r) for r in cur.fetchall()]
    finally:
        conn.close()

    return jsonify({"success": True, "evaluations": evaluations})


STUDENT_FEEDBACK_SELECT = """
    SELECT sf.id, a.student_id, su.full_name, a.internship_id, i.company_id, c.name,
           sf.company_culture, sf.mentorship_quality, sf.technical_learning,
           sf.work_environment, sf.overall_experience, sf.comments, sf.created_at
    FROM student_feedback sf
    JOIN applications a ON a.id = sf.application_id
    JOIN users su ON su.id = a.student_id
    JOIN internships i ON i.id = a.internship_id
    JOIN companies c ON c.id = i.company_id
"""


def student_feedback_row(r):
    return {
        "id": r[0],
        "student_id": r[1],
        "student_name": r[2],
        "internship_id": r[3],
        "company_id": r[4],
        "company_name": r[5],
        "company_culture": r[6],
        "mentorship_quality": r[7],
        "technical_learning": r[8],
        "work_environment": r[9],
        "overall_experience": r[10],
        "average_rating": round(sum(r[6:11]) / 5, 1),
        "comments": r[11] or "",
        "submitted_at": iso(r[12]),
    }


@app.route("/api/student-feedback", methods=["POST"])
@require_auth("student")
def add_student_feedback():
    data = request.get_json(silent=True) or {}

    try:
        internship_id = int(data.get("internship_id"))
    except (TypeError, ValueError):
        return jsonify({"success": False, "error": "internship_id is required."}), 400

    fields = ("company_culture", "mentorship_quality", "technical_learning", "work_environment", "overall_experience")
    scores = {name: rating(data.get(name)) for name in fields}
    if any(v is None for v in scores.values()):
        return jsonify({"success": False, "error": "Every rating must be between 1 and 5."}), 400

    conn = get_connection()
    try:
        cur = conn.cursor()

        application = find_application(cur, g.user_id, internship_id)
        if not application:
            return jsonify({"success": False, "error": "You have not applied for this internship."}), 404
        if application[1] != "accepted":
            return jsonify({"success": False, "error": "Feedback can only be given for internships you were accepted for."}), 400

        cur.execute("SELECT 1 FROM student_feedback WHERE application_id = %s", (application[0],))
        if cur.fetchone():
            return jsonify({"success": False, "error": "You have already given feedback for this internship."}), 409

        cur.execute(
            """
            INSERT INTO student_feedback (application_id, company_culture, mentorship_quality,
                                          technical_learning, work_environment, overall_experience, comments)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING id
            """,
            (application[0], scores["company_culture"], scores["mentorship_quality"],
             scores["technical_learning"], scores["work_environment"], scores["overall_experience"],
             to_text_or_none(data.get("comments"))),
        )
        new_id = cur.fetchone()[0]
        cur.execute(STUDENT_FEEDBACK_SELECT + " WHERE sf.id = %s", (new_id,))
        feedback = student_feedback_row(cur.fetchone())
        conn.commit()
    except Exception as e:
        conn.rollback()
        print("Add student feedback error:", e)
        return jsonify({"success": False, "error": "Something went wrong. Please try again."}), 500
    finally:
        conn.close()

    return jsonify({"success": True, "feedback": feedback}), 201


@app.route("/api/student-feedback", methods=["GET"])
@require_auth("student", "faculty", "admin")
def list_student_feedback():
    conn = get_connection()
    try:
        cur = conn.cursor()
        if g.role == "student":
            cur.execute(STUDENT_FEEDBACK_SELECT + " WHERE a.student_id = %s ORDER BY sf.created_at DESC", (g.user_id,))
        else:
            student_id = request.args.get("student_id")
            if student_id:
                if not student_id.isdigit():
                    return jsonify({"success": False, "error": "student_id must be a number."}), 400
                cur.execute(STUDENT_FEEDBACK_SELECT + " WHERE a.student_id = %s ORDER BY sf.created_at DESC", (int(student_id),))
            else:
                cur.execute(STUDENT_FEEDBACK_SELECT + " ORDER BY sf.created_at DESC")
        feedback = [student_feedback_row(r) for r in cur.fetchall()]
    finally:
        conn.close()

    return jsonify({"success": True, "feedback": feedback})


@app.route("/api/system-feedback", methods=["POST"])
@require_auth("student", "faculty", "admin")
def add_system_feedback():
    data = request.get_json(silent=True) or {}

    feedback_type = data.get("feedback_type")
    if feedback_type not in ("feature_request", "bug_report", "suggestion", "other"):
        return jsonify({"success": False, "error": "Invalid feedback type."}), 400
    description = (data.get("description") or "").strip()
    if not description:
        return jsonify({"success": False, "error": "Please enter a description for your feedback."}), 400
    if len(description) > 2000:
        return jsonify({"success": False, "error": "Feedback is too long (2000 characters at most)."}), 400

    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO system_feedback (user_id, feedback_type, description) VALUES (%s, %s, %s)",
            (g.user_id, feedback_type, description),
        )
        conn.commit()
    except Exception as e:
        conn.rollback()
        print("Add system feedback error:", e)
        return jsonify({"success": False, "error": "Something went wrong. Please try again."}), 500
    finally:
        conn.close()

    return jsonify({"success": True, "message": "Feedback received."}), 201


@app.route("/api/system-feedback", methods=["GET"])
@require_auth("admin")
def list_system_feedback():
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute(
            """
            SELECT sf.id, sf.user_id, u.full_name, u.role, sf.feedback_type, sf.description, sf.status, sf.created_at
            FROM system_feedback sf
            LEFT JOIN users u ON u.id = sf.user_id
            ORDER BY sf.created_at DESC
            """
        )
        rows = cur.fetchall()
    finally:
        conn.close()

    feedback = [
        {
            "id": r[0],
            "user_id": r[1],
            "user_name": r[2] or "Guest User",
            "user_role": r[3] or "student",
            "feedback_type": r[4],
            "description": r[5],
            "status": r[6],
            "submitted_at": iso(r[7]),
        }
        for r in rows
    ]
    return jsonify({"success": True, "feedback": feedback})


if __name__ == "__main__":
    app.run(debug=True, port=5000)
