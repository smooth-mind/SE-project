# 🎓 SE Final Project: Intelligent Assignment Management System

A comprehensive assignment management platform with AI-powered auto-grading capabilities, featuring OCR text recognition for handwritten submissions and intelligent scoring using Google's Gemini AI.

## 🌟 Features

- **🔐 User Authentication**: Secure login/register system with JWT tokens
- **👥 Role-based Access**: Separate interfaces for teachers and students
- **📚 Class Management**: Create and manage classes with student enrollment
- **📝 Assignment Creation**: Upload task and solution files for assignments
- **📤 Student Submissions**: Support for both digital and handwritten submissions
- **🤖 AI Auto-Grading**: Intelligent scoring using Google Gemini AI
- **👁️ OCR Integration**: Text recognition for handwritten assignments
- **📊 Manual Scoring**: Teachers can manually set and override scores
- **⚡ Real-time Updates**: Live feedback and notifications

## 🛠️ Tech Stack

### Backend

- **Django 5.2.1** - Web framework
- **Django REST Framework** - API development
- **SQLite** - Database (development)
- **JWT Authentication** - Secure authentication

### Frontend

- **React 19** - Frontend framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Radix UI** - Component library
- **React Router** - Navigation

### AI/ML Services

- **Google Gemini AI** - Auto-grading intelligence
- **OCR Service** - Handwritten text recognition

## 📋 Prerequisites

Before setting up the application, ensure you have the following installed:

- **Python 3.8+** - [Download Python](https://python.org/downloads/)
- **Node.js 18+** - [Download Node.js](https://nodejs.org/)
- **Git** - [Download Git](https://git-scm.com/)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd se-final-project
```

### 2. Backend Setup (Django)

#### Install Python Dependencies

```bash
cd server
pip install -r requirements.txt
```

#### Environment Configuration

Create a `.env` file in the `server` directory (optional - default values are set):

```env
SECRET_KEY=your-secret-key-here
DEBUG=True
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent
OCR_PREDICTION_URL=your-ocr-service-url
```

#### Database Setup

```bash
# Apply migrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser
```

#### Run Django Server

```bash
python manage.py runserver
```

The backend will be available at `http://localhost:8000`

### 3. Frontend Setup (React)

#### Install Node Dependencies

```bash
cd client
npm install
```

#### Run Development Server

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## 🔧 Detailed Setup Instructions

### 🔑 Google Gemini AI Setup

1. **Create Google Cloud Account**

   - Go to [Google AI Studio](https://aistudio.google.com/)
   - Sign in with your Google account

2. **Generate API Key**

   - Navigate to "Get API Key" section
   - Create a new API key
   - Copy the generated key

3. **Configure in Application**
   - Update `GEMINI_API_KEY` in `server/server/settings.py`
   - Or set it in your `.env` file

### 📱 OCR Service Setup

The application requires an OCR service for handwritten text recognition. You have two options:

#### Option 1: Use Existing Deployed Service (Recommended)

The application is pre-configured with a deployed OCR service. No additional setup required.

#### Option 2: Deploy Your Own OCR Service

1. **Prepare OCR Model**

   - You'll need to deploy your own OCR text recognition service
   - The service should accept POST requests with image data
   - Expected request format: `{"image": "base64_encoded_image"}`
   - Expected response format: `{"pred": "extracted_text"}`

2. **Update Configuration**
   - Set `OCR_PREDICTION_URL` in settings to your deployed service URL
   - Example: `OCR_PREDICTION_URL = "https://your-ocr-service.com/predict"`

### 🗃️ Database Configuration

#### Development (SQLite - Default)

No additional setup required. SQLite database will be created automatically.

#### Production (PostgreSQL/MySQL)

Update `DATABASES` configuration in `server/server/settings.py`:

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'your_db_name',
        'USER': 'your_db_user',
        'PASSWORD': 'your_db_password',
        'HOST': 'your_db_host',
        'PORT': 'your_db_port',
    }
}
```

## 📦 Package Scripts

### Backend (Django)

```bash
cd server

# Install dependencies
pip install -r requirements.txt

# Database operations
python manage.py makemigrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run development server
python manage.py runserver

# Run on specific port
python manage.py runserver 8080
```

### Frontend (React)

```bash
cd client

# Install dependencies
npm install

# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 🎯 Usage Guide

### For Teachers

1. **Register/Login** as a teacher
2. **Create Classes** and share class codes with students
3. **Create Assignments** with task and solution files
4. **Auto-Grade Submissions** using the AI-powered grading system
5. **Manual Scoring**: Set scores manually using the score input field next to each submission
6. **Review and Adjust Scores** - Override AI scores or score ungraded submissions
7. **Reset Scores** for demo purposes (unmarks all submissions)

### For Students

1. **Register/Login** as a student
2. **Join Classes** using teacher-provided class codes
3. **View Assignments** and download task files
4. **Submit Work** (supports both digital files and handwritten submissions)
5. **Check Scores** after teacher grades assignments

### Key Features

#### Auto-Grading System

- Compares student submissions with provided solutions
- Uses Google Gemini AI for intelligent scoring
- **Smart Processing**: Only grades submissions that don't already have scores
- **Manual Override Protection**: Skips submissions that were manually scored
- Supports multiple file formats
- Handles both digital and handwritten submissions

#### OCR for Handwritten Work

- Automatically extracts text from handwritten submissions
- Improves grading accuracy for hand-drawn content
- Supports PNG image format for handwritten submissions

#### Score Management

- **Manual Scoring**: Enter scores directly using input fields next to each submission
- **AI Override**: Teachers can manually override auto-generated scores
- **Flexible Scoring**: Support for decimal scores (e.g., 7.5, 8.25) with 0.25 step increments
- **Real-time Updates**: Scores update immediately without page refresh
- **Validation**: Score inputs are validated against assignment maximum score
- **Reset Functionality**: Bulk reset all scores for demo purposes
- **Bulk Auto-grading**: Auto-grade multiple submissions simultaneously

## 🔒 Security Considerations

- Change default `SECRET_KEY` in production
- Set `DEBUG = False` in production
- Configure proper `ALLOWED_HOSTS`
- Use environment variables for sensitive data
- Implement proper CORS settings for production

## 🚀 Deployment

### Backend Deployment

1. Set environment variables for production
2. Configure database (PostgreSQL recommended)
3. Set up static file serving
4. Use WSGI server (Gunicorn recommended)

### Frontend Deployment

1. Build the React app: `npm run build`
2. Serve static files using Nginx or similar
3. Configure API base URL for production

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**

   - Ensure `CORS_ALLOW_ALL_ORIGINS = True` in development
   - Configure specific origins for production

2. **API Connection Issues**

   - Check if Django server is running on port 8000
   - Verify API base URL in frontend configuration

3. **File Upload Problems**

   - Ensure `MEDIA_ROOT` and `MEDIA_URL` are properly configured
   - Check file permissions

4. **Gemini API Errors**
   - Verify API key is correct and has sufficient quota
   - Check internet connectivity

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is part of an SE course final project. Please refer to your course guidelines for usage and distribution terms.

## 🆘 Support

For issues and questions:

1. Check the troubleshooting section above
2. Review Django and React documentation
3. Contact course instructors or TAs

---

**Happy Learning! 🎓✨**
