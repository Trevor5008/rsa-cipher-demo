<div align="center">
  <h1>🎓 RSA Learning Lab 🔐</h1>
  <p><em>An Interactive Educational Tool for Understanding RSA Encryption</em></p>
  
  ![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
  ![Educational](https://img.shields.io/badge/type-educational-green.svg)
  ![Student-Focused](https://img.shields.io/badge/focus-students-orange.svg)
</div>

## 📚 About

**RSA Learning Lab** is a student-focused educational application designed to help learners understand RSA encryption through interactive, step-by-step demonstrations. Originally built as a classroom exercise tool, it's being redesigned with a focus on progressive learning, visual explanations, and hands-on experimentation.

### 🎯 Educational Goals

- **Demystify RSA Encryption** - Break down complex cryptographic concepts into digestible steps
- **Visual Learning** - Use diagrams, animations, and interactive elements to explain mathematical concepts
- **Hands-on Practice** - Allow students to experiment with different parameters and see real-time results
- **Progressive Learning** - Guide students through concepts from basic to advanced
- **Mistake-Friendly Environment** - Encourage experimentation with helpful feedback and explanations

## 🚀 Current Status & Roadmap

### ✅ **Phase 1: Foundation (Completed)**
- Basic RSA encryption/decryption functionality
- Key generation with prime number validation
- Environment configuration for development/production
- Core backend API with Flask

### 🔄 **Phase 2: Student-Focused Redesign (In Progress)**
- **Educational Onboarding** - Welcome screen with learning objectives
- **Step-by-Step Interface** - Replace modal-heavy design with guided learning flow
- **Concept Explanations** - Add educational content before each section
- **Visual Learning Aids** - Mathematical formulas, diagrams, and interactive elements
- **Progress Tracking** - Show students where they are in the learning journey

### 📋 **Phase 3: Advanced Learning Features (Planned)**
- **Interactive Tutorial Mode** - Guided walkthrough for first-time users
- **Animated Demonstrations** - Visual explanations of the RSA algorithm
- **Practice Exercises** - Built-in quizzes and challenges
- **Comparison Tools** - Side-by-side analysis of different key sizes and messages
- **Export/Print Functionality** - Save work for assignments and reports

## 🛠️ Built With

  +  ![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
  +  ![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white)
  +  ![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
  +  ![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
  +  ![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
  +  ![SymPy](https://img.shields.io/badge/SymPy-3B5526?style=for-the-badge&logo=sympy&logoColor=white)

## 📖 Table of Contents

- [About](#-about)
- [Current Status & Roadmap](#-current-status--roadmap)
- [Getting Started](#-getting-started)
- [Educational Features](#-educational-features)
- [Development Setup](#-development-setup)
- [Contributing](#-contributing)
- [License](#-license)

## 🎓 Educational Features

### Current Learning Features
- **Interactive Key Generation** - Students can generate RSA key pairs with different prime number sizes
- **Real-time Validation** - Immediate feedback on prime number validity and key compatibility
- **Step-by-step Encryption/Decryption** - Watch the RSA process unfold with detailed explanations
- **Visual Key Display** - Large numbers formatted for easy reading and understanding

### Planned Learning Enhancements
- **📚 Interactive Tutorial** - Guided walkthrough for first-time users
- **🔍 Concept Explanations** - "What is RSA?" and "Why does this work?" sections
- **📊 Visual Learning Aids** - Mathematical formulas, diagrams, and animations
- **🎯 Practice Exercises** - Built-in challenges and quizzes
- **📈 Progress Tracking** - Show learning journey and completed concepts
- **🔬 Experimentation Tools** - Compare different key sizes and message lengths

## 🚀 Getting Started

### For Students
1. **Visit the live demo** (coming soon) or follow the setup instructions below
2. **Start with the tutorial** to understand RSA concepts
3. **Generate your first key pair** and experiment with encryption
4. **Try different parameters** to see how they affect security and performance

### For Educators
1. **Set up the application** using the development setup below
2. **Customize the learning content** for your curriculum
3. **Use in classroom demonstrations** or assign as student projects
4. **Export student work** for grading and assessment

## 🛠️ Development Setup

### Prerequisites
- Python 3.8+ 
- Node.js 16+
- Git

### Installation

1. **Clone the repository**
   ```sh
   git clone https://github.com/Trevor5008/rsa-cipher-demo.git
   cd rsa-cipher-demo
   ```

2. **Backend Setup (Flask)**
   ```sh
   # Create and activate virtual environment
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   
   # Install dependencies
   pip install -r requirements.txt
   ```

3. **Frontend Setup (React/Vite)**
   ```sh
   cd frontend
   npm install
   ```

4. **Environment Configuration**
   ```sh
   # Create .env file in frontend directory
   cd frontend
   echo "VITE_PROD_API_BASE_URL=https://rsa-cipher-demo-72f57f0cf894.herokuapp.com" > .env
   echo "VITE_LOCAL_API_BASE_URL=http://127.0.0.1:5000" >> .env
   ```

5. **Run the Application**
   ```sh
   # Terminal 1: Start backend
   source venv/bin/activate
   python app.py
   
   # Terminal 2: Start frontend
   cd frontend
   npm run dev
   ```

6. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://127.0.0.1:5000

## 🎯 Learning Objectives

After using this tool, students will understand:
- **What RSA encryption is** and why it's important
- **How prime numbers** are used in cryptography
- **The mathematical process** of key generation, encryption, and decryption
- **The relationship between key size** and security
- **Real-world applications** of RSA encryption

## 🔧 Technical Architecture

### Backend (Flask)
- **RSA Algorithm Implementation** - Pure Python implementation using SymPy
- **Prime Number Generation** - Cryptographically secure prime generation
- **Key Validation** - Mathematical validation of key pairs
- **RESTful API** - Clean endpoints for frontend communication

### Frontend (React/Vite)
- **Student-Focused UI** - Designed for learning and experimentation
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Real-time Feedback** - Immediate validation and error handling
- **Educational Content** - Integrated learning materials and explanations

## 🤝 Contributing

We welcome contributions from educators, students, and developers! Here are some ways you can help:

### For Educators
- **Content Review** - Help improve educational explanations and examples
- **Curriculum Integration** - Suggest how to integrate with existing courses
- **Student Feedback** - Share insights from classroom usage

### For Developers
- **Feature Development** - Implement new educational features
- **UI/UX Improvements** - Enhance the student learning experience
- **Bug Fixes** - Help maintain code quality and reliability
- **Documentation** - Improve setup instructions and code comments

### For Students
- **User Testing** - Try the application and report issues
- **Feature Requests** - Suggest improvements for learning
- **Content Contributions** - Help write explanations and examples

### Getting Started with Contributions
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Educational Community** - Thanks to educators who provided feedback on the learning experience
- **Open Source Libraries** - Built with amazing tools like React, Flask, and SymPy
- **Students** - Your feedback drives the continuous improvement of this tool

---

<div align="center">
  <p><strong>🎓 Happy Learning! 🔐</strong></p>
  <p><em>Making cryptography accessible, one student at a time.</em></p>
</div>
