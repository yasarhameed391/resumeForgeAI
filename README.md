# ResumeForge AI

AI-powered resume builder that tailors your resume to job descriptions using local AI (Ollama). Keep all your experience, get ATS-optimized.

## Features

- **Upload Resume** - Support for PDF and DOCX files with text extraction
- **Job Description** - Paste any job description
- **ATS Optimization** - Keywords naturally incorporated into your existing experience
- **Cover Letter** - Professional cover letter based on your actual resume
- **Download** - Export as PDF or DOCX
- **No Fabrication** - Keeps ALL your original experience, no made-up details

## Tech Stack

- **Frontend**: React + Tailwind CSS + TypeScript
- **Backend**: Node.js + Express + TypeScript
- **Database**: MongoDB (Mongoose)
- **AI**: Ollama (llama3.2) - runs locally, no API keys needed

## Prerequisites

1. **Node.js** (v18+)
2. **MongoDB** - Running locally or cloud instance
3. **Ollama** - For local AI

## Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/yasarhameed391/resumeForgeAI.git
cd resumeForgeAI
```

### 2. Install Dependencies

```bash
# Backend
cd server && npm install

# Frontend
cd ../client && npm install
```

### 3. Start Services

**Terminal 1 - Backend** (Port 3001):
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend** (Port 5173):
```bash
cd client
npm run dev
```

### 4. Open App

Navigate to: http://localhost:5173

## Setup Ollama

If Ollama isn't running:

```bash
# Start Ollama
ollama serve

# Pull model (one-time)
ollama pull llama3.2
```

## Setup MongoDB

**Local:**
```bash
# Start MongoDB
mongod --dbpath /path/to/data
```

**Or use connection string:**
```bash
export MONGODB_URI=mongodb://localhost:27017/resume-tailor
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|------------|
| POST | `/api/resumes/upload` | Upload resume |
| POST | `/api/jobs` | Create job description |
| POST | `/api/ats/analyze` | ATS analysis |
| POST | `/api/prompts/run` | Run AI prompt |
| POST | `/api/download/docx` | Download DOCX |
| POST | `/api/download/pdf` | Download PDF |
| GET | `/api-docs` | Swagger docs |

## Usage Flow

1. Click **Get Started**
2. Upload your master resume (PDF/DOCX)
3. Select action (ATS Resume + Cover Letter)
4. Paste job description
5. Click **Generate**
6. Download results as PDF or DOCX

## Project Structure

```
resumeForgeAI/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── services/  # API calls
│   │   └── types/    # TypeScript types
│   └── package.json
├── server/                # Express backend
│   ├── src/
│   │   ├── controllers/  # Route handlers
│   │   ├── services/    # Business logic
│   │   ├── models/      # MongoDB schemas
│   │   └── routes/     # API routes
│   └── package.json
├── SPEC.md              # Full specification
└── README.md
```

## Environment Variables

**Server:**
```bash
PORT=3001
MONGODB_URI=mongodb://localhost:27017/resume-tailor
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
```

## License

MIT