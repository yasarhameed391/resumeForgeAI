# AI Resume Tailoring App - Specification

## Project Overview
- **Name**: ResumeTailor AI
- **Type**: Full-stack web application
- **Core Functionality**: Upload resume & job description, analyze ATS compatibility, and AI-tailor resume using local Ollama model
- **Target Users**: Job seekers optimizing their resumes for ATS systems

## Tech Stack
- **Backend**: Node.js + Express + TypeScript
- **Database**: MongoDB with Mongoose
- **Frontend**: React + Tailwind CSS + TypeScript
- **AI**: Ollama with Mistral (local)
- **File Parsing**: pdf-parse, mammoth (DOCX)

## Architecture

### Backend Structure
```
server/
├── src/
│   ├── controllers/      # Request handlers
│   ├── services/       # Business logic
│   ├── models/        # MongoDB schemas
│   ├── routes/        # API routes
│   ├── middleware/   # Auth, validation
│   ├── utils/        # Helpers
│   └── types/        # TypeScript types
├── package.json
└── tsconfig.json
```

### Frontend Structure
```
client/
├── src/
│   ├── components/    # React components
│   ├── pages/         # Page components
│   ├── hooks/         # Custom hooks
│   ├── services/     # API calls
│   └── types/         # TypeScript types
├── package.json
└── tailwind.config.js
```

## Database Schema

### Resume Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  fileName: String,
  fileType: String, // 'pdf' | 'docx'
  content: String, // Extracted text
  createdAt: Date,
  updatedAt: Date
}
```

### JobDescription Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  title: String,
  company: String,
  content: String, // Full JD text
  extractedKeywords: String[],
  createdAt: Date
}
```

### ATSReport Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  resumeId: ObjectId,
  jobId: ObjectId,
  score: Number,
  matchedKeywords: String[],
  missingKeywords: String[],
  suggestions: String[],
  beforeTailoring: Boolean,
  tailoredResume: String | null,
  tailoredScore: Number | null,
  saved: Boolean,
  createdAt: Date
}
```

## API Endpoints

### Resume APIs
- `POST /api/resumes/upload` - Upload resume (PDF/DOCX)
- `GET /api/resumes` - List user resumes
- `GET /api/resumes/:id` - Get resume by ID
- `DELETE /api/resumes/:id` - Delete resume

### Job Description APIs
- `POST /api/jobs/upload` - Upload job description
- `GET /api/jobs` - List user job descriptions
- `GET /api/jobs/:id` - Get job by ID

### ATS Analysis APIs
- `POST /api/ats/analyze` - Analyze resume vs job
- `GET /api/ats/:id` - Get ATS report
- `GET /api/ats/history` - Get analysis history

### Tailoring APIs
- `POST /api/ats/tailor` - Tailor resume with AI
- `POST /api/ats/save` - Save tailored resume (score >= 90)

## Features

### 1. Resume Upload
- Accept PDF and DOCX files
- Extract text using pdf-parse (PDF) and mammoth (DOCX)
- Store extracted content in MongoDB
- Show preview of extracted text

### 2. Job Description Upload
- Accept text input or copy-paste JD
- Extract keywords using frequency analysis
- Store in MongoDB

### 3. ATS Analysis
- **Keyword Matching Score**: (matched / total keywords) * 100
- **Missing Keywords**: Keywords in JD but not in resume
- **Suggestions**: Recommendations to improve match
- Save report to MongoDB

### 4. Before Tailoring Display
- Show current ATS score
- Display matched/missing keywords
- Show suggestions

### 5. Tailoring Flow
1. User sees Before ATS score
2. User clicks "Tailor Resume"
3. Confirmation modal appears
4. On confirm: Call Ollama API
   - Prompt: "Given this resume and job description, rewrite the resume to better match the job requirements. Keep the same structure and do not fabricate experience. Resume: {resume} Job Description: {jd}"
5. Display tailored resume

### 6. After Comparison
- Recalculate ATS score with tailored resume
- Show Before vs After comparison
- Score improvement indicator

### 7. Save Condition
- Only allow save if tailored ATS score >= 90
- Show error if score < 90
- Save to MongoDB when condition met

## Frontend Pages

### 1. Home/Upload Page
- Two upload sections side by side
- Resume upload dropzone
- Job description textarea
- "Analyze" button

### 2. Dashboard/Results Page
- ATS Score gauge (0-100)
- Matched keywords list
- Missing keywords list
- Suggestions list
- "Tailor Resume" button
- History sidebar

### 3. Comparison Page
- Side-by-side Before/After
- Diff highlighting
- Score comparison
- Save/Discard buttons

## UI/UX Design

### Color Palette
- **Primary**: #6366f1 (Indigo-500)
- **Secondary**: #8b5cf6 (Violet-500)
- **Background**: #0f172a (Slate-900)
- **Surface**: #1e293b (Slate-800)
- **Text**: #f8fafc (Slate-50)
- **Success**: #22c55e (Green-500)
- **Warning**: #f59e0b (Amber-500)
- **Error**: #ef4444 (Red-500)

### Typography
- **Font**: Inter (headings), system-ui (body)
- **Headings**: Bold, tracking-tight
- **Body**: Regular, 16px base

### Components
- Card-based layout
- Rounded corners (12px)
- Subtle shadows
- Smooth transitions
- Loading states with spinners

## Acceptance Criteria

1. User can upload PDF/DOCX resume and extract text
2. User can input job description and extract keywords
3. ATS analysis shows score, matched/missing keywords
4. User can view "Before" ATS score
5. User can trigger AI tailoring with confirmation
6. Tailored resume shows without fabricating experience
7. "After" ATS score is calculated and displayed
8. Save is only enabled when score >= 90
9. All data persisted to MongoDB
10. History viewable in sidebar

## Performance Optimizations
- Lazy load React components
- Debounce keyword extraction
- Cache ATS calculations
- Use React Query for data fetching
- Compress stored text if needed