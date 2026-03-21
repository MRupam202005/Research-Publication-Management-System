# Research Publication Management System

A full-stack web application designed for researchers, librarians, and administrators to efficiently manage, track, and analyze research publications and author metrics. 

## 🚀 Features

### **Frontend (Next.js + Tailwind CSS)**
- **Modern User Interface**: Designed with the latest Tailwind CSS utilities, featuring beautiful gradient cards, frosted-glass surfaces, and smooth hover animations.
- **Dark/Light Mode**: Full system-level and manual theme toggling powered by `next-themes`.
- **Advanced Analytics Dashboard**: Visualizes research impact using Recharts:
  - Publications per year (Bar Chart)
  - Citations over time (Line Chart)
  - Top Authors by citation count (Bar Chart)
  - Most Cited Papers (Bar Chart)
- **Responsive Navigation**: Clean, accessible sidebar routing featuring `lucide-react` icons.
- **Loading States**: Skeleton loading animations provide a premium feel during data fetches.

### **Backend (Node.js + Express.js)**
- **Secure Authentication**: Role-based access control (Admin, Researcher) secured natively via robust JWT tokens.
- **Publication Management**: Full CRUD capabilities for research papers, including metadata tracking (DOI, Abstract, Journal/Conference IDs, PDF URLs).
- **Author Profiles**: Dedicated registry tracking ORCID IDs, dynamic university/department affiliations, and specific research interests.
- **Citation Tracking**: Intricate cross-referencing algorithms to track which papers cite each other, preventing duplicate circular dependencies.
- **Impact Metrics Calculation**: On-the-fly computational endpoints calculating:
  - **h-index**: The largest number *h* such that *h* publications have at least *h* citations.
  - **i10-index**: The number of publications with at least 10 citations.
  - **Total Citation Volume**.
  - **Self-Citation Detection**.

### **Database (PostgreSQL)**
- Relational data integrity enforced through strict `FOREIGN KEY` constraints and cascading deletes.
- Pre-configured `database/seed.sql` script available to instantly populate the platform with iconic Computer Science and AI researchers (Hinton, LeCun, Bengio) and historically significant deep learning papers.

---

## 🛠️ Tech Stack

**Frontend:**
- [Next.js](https://nextjs.org/) (React Framework)
- [Tailwind CSS](https://tailwindcss.com/) (Styling & Gradients)
- [Recharts](https://recharts.org/) (Data Visualization)
- [Lucide React](https://lucide.dev/) (SVG Icons)
- [Next-Themes](https://github.com/pacocoursey/next-themes) (Dark Mode functionality)
- Axios (API fetching)

**Backend:**
- [Node.js](https://nodejs.org/) & [Express](https://expressjs.com/)
- [PostgreSQL](https://www.postgresql.org/) (Relational DB)
- `pg` (Node Postgres Client)
- `jsonwebtoken` (Auth)
- `bcryptjs` (Password Hashing)

---

## ⚙️ Getting Started

### 1. Database Setup
Ensure PostgreSQL is installed and running locally. Create a database (default expected name: `research_db`).

Execute the initial schema definitions:
```bash
psql -U postgres -d your_db_name -f database/schema.sql
```

*(Optional)* Run the seed script to populate the database with demo AI/CS data:
```bash
psql -U postgres -d your_db_name -f database/seed.sql
```

### 2. Backend Configuration
Navigate to the `/backend` directory:
```bash
cd backend
npm install
```
Configure your `.env` variables (create a `.env` file in `/backend`):
```env
PORT=5000
DATABASE_URL=postgres://postgres:yourpassword@localhost:5432/your_db_name
JWT_SECRET=your_super_secret_jwt_key
```
Start the development server:
```bash
npm run dev
```

### 3. Frontend Configuration
Navigate to the `/frontend` directory:
```bash
cd frontend
npm install
```
Configure your `.env.local` variables:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```
Start the Next.js development server:
```bash
npm run dev
```

---

## 📖 Usage
Navigate to `http://localhost:3000` in your browser. 
If you used the `seed.sql` script, you can log in immediately using the demo credentials:
- **Email**: `admin@example.com`
- **Password**: `password123` *(default bcrypt hash)*
