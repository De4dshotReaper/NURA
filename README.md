# Nura

### A calm patient companion for organizing the journey around a medical consultation.

Nura is a full-stack healthcare companion web application designed to help users organize health information before, during, and after medical consultations.

Instead of treating symptoms, prescriptions, lab reports, appointments, and follow-ups as disconnected records, Nura organizes them into **Health Episodes** — structured periods of care that preserve the complete story of a health concern.

> **Academic prototype:** Nura is an educational project and is not intended to diagnose medical conditions or replace professional medical advice.

---

## ✨ Features

### 🩺 Health Episodes
Create an episode when a new health concern begins and track its complete journey from initial symptoms to consultations and follow-ups.

Each episode maintains its own **Episode Story**, while the global Health Timeline preserves the user's longitudinal history.

### 📝 Pre-Consultation Preparation
Record:
- Symptoms
- Severity
- Duration

Nura can generate useful questions that the user may want to discuss during their consultation.

### 📅 Consultation Records
Record completed appointments including:
- Consultation notes
- Doctor and clinic information
- Appointment date and time
- Follow-up recommendations
- Related prescriptions
- Related laboratory reports

### 💊 Prescription Analysis
Upload a prescription image and Nura can extract structured medicine information such as:
- Medicine name
- Dosage
- Frequency
- Instructions

Nura can also provide general educational information about the extracted medicines.

### 🧪 Lab Report Explanation
Upload supported structured laboratory reports and Nura extracts measurable parameters, values, units, and report-provided reference ranges.

Results are presented in a more readable format while preserving the information contained in the original report.

### 💬 Context-Aware Consultation Questions
Questions for later consultations can use context from:
- Previous consultation
- Latest follow-up
- Explicitly linked prescriptions
- Explicitly linked laboratory reports

Each consultation preparation cycle remains separate.

### 🔄 Follow-up Tracking
Record changes after a consultation including:
- Recovery progress
- Current symptoms
- Medicine compliance
- Side effects
- Additional questions

### 🕒 Health Timeline
A longitudinal timeline combines persisted health events across episodes.

Individual Health Episodes also provide a scoped **Episode Story** containing only records explicitly associated with that episode.

---

## 🛠️ Tech Stack

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- Lucide Icons

### Backend
- Supabase
- PostgreSQL
- Supabase Authentication
- Row Level Security (RLS)
- Supabase Edge Functions
- TypeScript / Deno

### AI
- Google Gemini API

Gemini is accessed through server-side Supabase Edge Functions rather than directly from the browser.

### Deployment & Development
- Vercel
- Git
- GitHub

---

## 🏗️ Architecture
                              ┌─────────────────────┐
                         │        USER         │
                                └──────────┬──────────┘
                 │
                 \/
                    ┌───────────────────────────┐
                    │         FRONTEND          │
                    │                           │
                    │  React + TypeScript       │
                    │  Tailwind CSS + Vite      │
                    │                           │
                    │     Hosted on Vercel      │
                    └─────────────┬─────────────┘
                    │
                    ▼
                    ┌───────────────────────────┐
                    │          SUPABASE         │
                    │                           │
                    │  • Authentication         │
                    │  • PostgreSQL Database    │
                    │  • Row Level Security     │
                    │  • Edge Functions         │
                    └─────────────┬─────────────┘
                  │
                  ▼
                    ┌───────────────────────────┐
                    │       GOOGLE GEMINI       │
                    │                           │
                    │    AI Processing & OCR    │
                    └───────────────────────────┘

## 🔐 Data & Security

Nura uses Supabase Authentication and PostgreSQL Row Level Security to isolate user data.

AI requests are processed through server-side Edge Functions so private API credentials are not exposed in the frontend.

Health records are persisted in PostgreSQL and reused throughout the application rather than requiring repeated AI processing.

---

## 🚀 Running Locally

Clone the repository:

```bash
git clone <repository-url>
cd NURA
```

Install dependencies:

```bash
npm install
```

Configure the required frontend environment variables:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Start the development server:

```bash
npm run dev
```

---

## 🌐 Live Demo

Nura is deployed on Vercel:

https://nuraforhealth.vercel.app

---

## 🎓 Project Context

Nura was developed as a **College Engineering Project (CEP)** exploring how modern web technologies and generative AI can be combined to improve the organization and accessibility of information surrounding healthcare consultations.

The project focuses on patient-side information organization rather than diagnosis or treatment recommendation.

---

## ⚠️ Disclaimer

Nura is an academic and educational prototype.

It does not provide medical diagnoses, prescribe treatment, or replace consultation with a qualified healthcare professional. AI-generated information may contain errors and should not be used as the sole basis for medical decisions.