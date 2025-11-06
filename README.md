# TCM Clinical Decision Support System (CDSS)

A comprehensive web-based clinical decision support system for Traditional Chinese Medicine practitioners.

## Features

- **Module 1: Systematic Observation (Looking)** - Complete implementation
- Real-time pattern analysis based on Maciocia's diagnostic criteria
- 20+ common TCM patterns with weighted scoring
- Patient management system
- Visit tracking and documentation

## Technology Stack

- **Backend**: Python Flask API
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Database**: SQLite
- **Deployment**: Cloudflare Pages + Workers

## Local Development

### Backend
```bash
cd backend
pip install -r requirements.txt
python run.py
```

Backend runs on http://localhost:5000

### Frontend
Open `frontend/index.html` in a browser or serve with a local server.

## Deployment

Deployed to Cloudflare Pages: https://tcmcdss.pages.dev

## Pattern Knowledge Base

Includes 20 most common patterns:
- Spleen-Qi Deficiency
- Kidney-Yang Deficiency
- Liver-Qi Stagnation
- Blood Deficiency
- Yin Deficiency with Empty Heat
- And 15 more...

## License

Proprietary - All rights reserved
# Cloudflare deployment with D1
## D1 Database Enabled

