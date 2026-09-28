import React, { useState } from 'react';
import { Modal } from './Modal';
import { Database, Code, Network, Layers } from 'lucide-react';

interface DatabaseSchemaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DatabaseSchemaModal: React.FC<DatabaseSchemaModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'tables' | 'sql' | 'api' | 'architecture'>('tables');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="ADBMS Database Architecture & Schema Specification"
      subtitle="Relational mapping for PostgreSQL and Flask REST API integration"
      maxWidth="3xl"
    >
      <div className="space-y-4">
        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 gap-1 pb-1">
          <button
            onClick={() => setActiveTab('tables')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors ${
              activeTab === 'tables'
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database size={14} />
            Relational Tables (10)
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors ${
              activeTab === 'sql'
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Code size={14} />
            PostgreSQL DDL
          </button>
          <button
            onClick={() => setActiveTab('api')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors ${
              activeTab === 'api'
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Network size={14} />
            Flask REST API Routes
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors ${
              activeTab === 'architecture'
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers size={14} />
            3-Tier Architecture
          </button>
        </div>

        {/* Tab 1: Relational Tables */}
        {activeTab === 'tables' && (
          <div className="space-y-4 text-xs text-slate-700">
            <p className="text-slate-500">
              The project is structured according to 3NF relational normalization rules. Foreign key constraints ensure referential integrity across users, roles, and applications.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="border border-slate-200 rounded p-3 bg-slate-50/50">
                <span className="font-semibold text-slate-900 block mb-1">1. USERS</span>
                <p className="text-slate-600 mb-1">Stores core auth credentials and system roles.</p>
                <code className="text-[11px] block bg-white p-2 border rounded font-mono text-slate-800">
                  id (PK) · email (UNIQUE) · password_hash · role (ENUM: student, faculty, admin) · status · created_at
                </code>
              </div>

              <div className="border border-slate-200 rounded p-3 bg-slate-50/50">
                <span className="font-semibold text-slate-900 block mb-1">2. STUDENTS</span>
                <p className="text-slate-600 mb-1">Student academic profile and credentials.</p>
                <code className="text-[11px] block bg-white p-2 border rounded font-mono text-slate-800">
                  id (PK) · user_id (FK → users.id) · name · email · phone · department · gpa (NUMERIC 0.0-4.0) · resume_url
                </code>
              </div>

              <div className="border border-slate-200 rounded p-3 bg-slate-50/50">
                <span className="font-semibold text-slate-900 block mb-1">3. FACULTY</span>
                <p className="text-slate-600 mb-1">Internship supervisors & department coordinators.</p>
                <code className="text-[11px] block bg-white p-2 border rounded font-mono text-slate-800">
                  id (PK) · user_id (FK → users.id) · name · email · phone · department · designation · status
                </code>
              </div>

              <div className="border border-slate-200 rounded p-3 bg-slate-50/50">
                <span className="font-semibold text-slate-900 block mb-1">4. COMPANIES</span>
                <p className="text-slate-600 mb-1">Hiring partner organizations.</p>
                <code className="text-[11px] block bg-white p-2 border rounded font-mono text-slate-800">
                  id (PK) · name · reg_number (UNIQUE) · location · contact_person · contact_email · industry · status
                </code>
              </div>

              <div className="border border-slate-200 rounded p-3 bg-slate-50/50">
                <span className="font-semibold text-slate-900 block mb-1">5. INTERNSHIPS</span>
                <p className="text-slate-600 mb-1">Open internship positions posted by faculty.</p>
                <code className="text-[11px] block bg-white p-2 border rounded font-mono text-slate-800">
                  id (PK) · company_id (FK) · title · domain · duration_weeks · stipend · start_date · end_date · deadline · status
                </code>
              </div>

              <div className="border border-slate-200 rounded p-3 bg-slate-50/50">
                <span className="font-semibold text-slate-900 block mb-1">6. APPLICATIONS</span>
                <p className="text-slate-600 mb-1">Student submissions for active openings.</p>
                <code className="text-[11px] block bg-white p-2 border rounded font-mono text-slate-800">
                  id (PK) · student_id (FK) · internship_id (FK) · resume_file · cover_letter · status (pending, shortlisted, accepted, rejected, withdrawn)
                </code>
              </div>

              <div className="border border-slate-200 rounded p-3 bg-slate-50/50">
                <span className="font-semibold text-slate-900 block mb-1">7. INTERVIEWS</span>
                <p className="text-slate-600 mb-1">Scheduled technical & HR interview rounds.</p>
                <code className="text-[11px] block bg-white p-2 border rounded font-mono text-slate-800">
                  id (PK) · application_id (FK) · student_id (FK) · internship_id (FK) · date · time · interviewer · status · result
                </code>
              </div>

              <div className="border border-slate-200 rounded p-3 bg-slate-50/50">
                <span className="font-semibold text-slate-900 block mb-1">8. EVALUATIONS</span>
                <p className="text-slate-600 mb-1">Faculty assessment upon internship completion.</p>
                <code className="text-[11px] block bg-white p-2 border rounded font-mono text-slate-800">
                  id (PK) · student_id (FK) · internship_id (FK) · faculty_id (FK) · technical_skills (1-5) · soft_skills (1-5) · hire_likelihood
                </code>
              </div>

              <div className="border border-slate-200 rounded p-3 bg-slate-50/50">
                <span className="font-semibold text-slate-900 block mb-1">9. STUDENT_FEEDBACK</span>
                <p className="text-slate-600 mb-1">Student review of the company & mentorship.</p>
                <code className="text-[11px] block bg-white p-2 border rounded font-mono text-slate-800">
                  id (PK) · student_id (FK) · company_id (FK) · culture (1-5) · mentorship (1-5) · tech_learning (1-5) · comments
                </code>
              </div>

              <div className="border border-slate-200 rounded p-3 bg-slate-50/50">
                <span className="font-semibold text-slate-900 block mb-1">10. SYSTEM_FEEDBACK</span>
                <p className="text-slate-600 mb-1">Portal bug reports and feature requests.</p>
                <code className="text-[11px] block bg-white p-2 border rounded font-mono text-slate-800">
                  id (PK) · user_id (FK) · feedback_type (ENUM) · description · status · submitted_at
                </code>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: PostgreSQL DDL */}
        {activeTab === 'sql' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-500">
              Sample DDL scripts showing table creation and constraint definitions in PostgreSQL:
            </p>
            <pre className="bg-slate-900 text-slate-100 p-3 rounded text-[11px] font-mono overflow-x-auto max-h-[380px] leading-relaxed">
{`-- ADBMS Internship Portal Schema (PostgreSQL)
CREATE TYPE user_role AS ENUM ('student', 'faculty', 'admin');
CREATE TYPE app_status AS ENUM ('pending', 'shortlisted', 'rejected', 'accepted', 'withdrawn');
CREATE TYPE int_status AS ENUM ('pending_approval', 'approved', 'rejected', 'closed', 'archived');

CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE students (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    department VARCHAR(100) NOT NULL,
    gpa NUMERIC(3,2) CHECK (gpa >= 0.0 AND gpa <= 4.0),
    resume_filename VARCHAR(255),
    status VARCHAR(20) DEFAULT 'active'
);

CREATE TABLE companies (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    reg_number VARCHAR(50) UNIQUE NOT NULL,
    location VARCHAR(150) NOT NULL,
    contact_person VARCHAR(100),
    industry VARCHAR(100),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE internships (
    id VARCHAR(36) PRIMARY KEY,
    company_id VARCHAR(36) REFERENCES companies(id),
    title VARCHAR(150) NOT NULL,
    description TEXT,
    domain VARCHAR(80),
    duration VARCHAR(50),
    duration_weeks INTEGER CHECK (duration_weeks BETWEEN 4 AND 26),
    stipend NUMERIC(10,2),
    location VARCHAR(100),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    application_deadline DATE NOT NULL,
    status int_status DEFAULT 'pending_approval',
    CONSTRAINT chk_dates CHECK (start_date < end_date)
);

CREATE TABLE applications (
    id VARCHAR(36) PRIMARY KEY,
    student_id VARCHAR(36) REFERENCES students(id) ON DELETE CASCADE,
    internship_id VARCHAR(36) REFERENCES internships(id) ON DELETE CASCADE,
    resume_filename VARCHAR(255) NOT NULL,
    cover_letter TEXT,
    qualifications TEXT,
    status app_status DEFAULT 'pending',
    applied_date DATE DEFAULT CURRENT_DATE,
    CONSTRAINT uq_student_internship UNIQUE (student_id, internship_id)
);`}
            </pre>
          </div>
        )}

        {/* Tab 3: Flask REST API */}
        {activeTab === 'api' && (
          <div className="space-y-3 text-xs">
            <p className="text-slate-500">
              Future Flask Python backend endpoint architecture with standard HTTP verbs:
            </p>
            <div className="space-y-1.5 font-mono text-[11px]">
              <div className="p-2 border rounded bg-white flex items-center justify-between">
                <div><span className="text-blue-600 font-bold">POST</span> <span className="text-slate-800">/api/auth/register/student</span></div>
                <span className="text-slate-400 font-sans text-xs">Create new student user &amp; profile with GPA (0.00-10.00)</span>
              </div>
              <div className="p-2 border rounded bg-white flex items-center justify-between">
                <div><span className="text-blue-600 font-bold">POST</span> <span className="text-slate-800">/api/auth/register/faculty</span></div>
                <span className="text-slate-400 font-sans text-xs">Create new faculty coordinator user &amp; designation</span>
              </div>
              <div className="p-2 border rounded bg-white flex items-center justify-between">
                <div><span className="text-blue-600 font-bold">POST</span> <span className="text-slate-800">/api/auth/login</span></div>
                <span className="text-slate-400 font-sans text-xs">Authenticate user by role, returns JWT session token</span>
              </div>
              <div className="p-2 border rounded bg-white flex items-center justify-between">
                <div><span className="text-blue-600 font-bold">POST</span> <span className="text-slate-800">/api/auth/forgot-password</span></div>
                <span className="text-slate-400 font-sans text-xs">Dispatch password recovery link to institutional email</span>
              </div>
              <div className="p-2 border rounded bg-white flex items-center justify-between">
                <div><span className="text-emerald-600 font-bold">GET</span> <span className="text-slate-800">/api/students</span></div>
                <span className="text-slate-400 font-sans text-xs">Fetch list of registered students with GPA &amp; dept</span>
              </div>
              <div className="p-2 border rounded bg-white flex items-center justify-between">
                <div><span className="text-blue-600 font-bold">POST</span> <span className="text-slate-800">/api/internships</span></div>
                <span className="text-slate-400 font-sans text-xs">Faculty creates internship opening (start &lt; end, 4-26 wks)</span>
              </div>
              <div className="p-2 border rounded bg-white flex items-center justify-between">
                <div><span className="text-blue-600 font-bold">POST</span> <span className="text-slate-800">/api/applications</span></div>
                <span className="text-slate-400 font-sans text-xs">Student submits application (checks duplicate &amp; PDF limit)</span>
              </div>
              <div className="p-2 border rounded bg-white flex items-center justify-between">
                <div><span className="text-amber-600 font-bold">PUT</span> <span className="text-slate-800">/api/applications/:id</span></div>
                <span className="text-slate-400 font-sans text-xs">Faculty changes status (shortlist / accept / reject)</span>
              </div>
              <div className="p-2 border rounded bg-white flex items-center justify-between">
                <div><span className="text-blue-600 font-bold">POST</span> <span className="text-slate-800">/api/interviews</span></div>
                <span className="text-slate-400 font-sans text-xs">Faculty schedules student interview (&gt;=24h notice)</span>
              </div>
              <div className="p-2 border rounded bg-white flex items-center justify-between">
                <div><span className="text-blue-600 font-bold">POST</span> <span className="text-slate-800">/api/evaluations</span></div>
                <span className="text-slate-400 font-sans text-xs">Faculty submits final performance assessment (1-5 ratings)</span>
              </div>
              <div className="p-2 border rounded bg-white flex items-center justify-between">
                <div><span className="text-emerald-600 font-bold">GET</span> <span className="text-slate-800">/api/reports</span></div>
                <span className="text-slate-400 font-sans text-xs">Generates placement rate, stipend averages, and stats</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Architecture */}
        {activeTab === 'architecture' && (
          <div className="space-y-3 text-xs text-slate-700">
            <div className="p-3 border rounded bg-slate-50">
              <span className="font-semibold text-slate-900 block mb-1">Three-Tier Architecture:</span>
              <ol className="list-decimal pl-5 space-y-1.5 text-slate-600">
                <li><strong className="text-slate-800">Presentation Tier (Current App):</strong> React + TypeScript + Tailwind CSS with responsive views for Student, Faculty, and Admin.</li>
                <li><strong className="text-slate-800">Application Tier (Next Phase):</strong> Python Flask REST API with Flask-JWT-Extended, Marshmallow validation schemas, and business logic routing.</li>
                <li><strong className="text-slate-800">Data Tier (Database):</strong> PostgreSQL relational database hosted on Cloud SQL / local server, enforcing constraints, foreign keys, triggers, and indices.</li>
              </ol>
            </div>
            <div className="p-3 border rounded bg-white">
              <span className="font-semibold text-slate-900 block mb-1">Key Relational Concepts Applied:</span>
              <ul className="list-disc pl-5 space-y-1 text-slate-600">
                <li>3NF Normalization eliminating redundancy between Users, Students, and Faculty.</li>
                <li>Composite uniqueness constraint on `(student_id, internship_id)` to forbid duplicate applications.</li>
                <li>Check constraints for GPA bounds (0.0 to 4.0) and internship timeline (start_date &lt; end_date, 4 to 26 weeks).</li>
                <li>Foreign Key cascade rules for student account deactivation or application cancellation.</li>
              </ul>
            </div>
          </div>
        )}

        <div className="pt-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
          >
            Close Schema Preview
          </button>
        </div>
      </div>
    </Modal>
  );
};
