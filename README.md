<div align="center">
  <h1>RSA Learning Lab</h1>
  <p><em>An Interactive Educational Tool for Understanding RSA Encryption</em></p>

  [![Version](https://img.shields.io/badge/version-2.1.0-blue.svg)](CHANGELOG.md)
  [![License: MIT](https://img.shields.io/badge/license-MIT-yellow.svg)](LICENSE)
  ![TypeScript](https://img.shields.io/badge/types-TypeScript-3178C6.svg?logo=typescript&logoColor=white)
  ![Educational](https://img.shields.io/badge/type-educational-green.svg)
  ![Student-Focused](https://img.shields.io/badge/focus-students-orange.svg)
  [![Last Commit](https://img.shields.io/github/last-commit/Trevor5008/rsa-cipher-demo.svg)](https://github.com/Trevor5008/rsa-cipher-demo/commits)
  [![Open Issues](https://img.shields.io/github/issues/Trevor5008/rsa-cipher-demo.svg)](https://github.com/Trevor5008/rsa-cipher-demo/issues)
</div>

## About

**RSA Learning Lab** is a student-focused educational application designed to help learners understand RSA encryption through interactive, step-by-step demonstrations. Originally built as a classroom exercise tool, it's being redesigned with a focus on progressive learning, visual explanations, and hands-on experimentation.

### Educational Goals

- **Demystify RSA Encryption** - Break down complex cryptographic concepts into digestible steps
- **Visual Learning** - Use diagrams, animations, and interactive elements to explain mathematical concepts
- **Hands-on Practice** - Allow students to experiment with different parameters and see real-time results
- **Progressive Learning** - Guide students through concepts from basic to advanced
- **Mistake-Friendly Environment** - Encourage experimentation with helpful feedback and explanations

## Table of Contents

- [About](#about)
- [Why Asymmetric Encryption Matters](#why-asymmetric-encryption-matters)
- [How the Learning Lab Maps to RSA](#how-the-learning-lab-maps-to-rsa)
- [Educational Security Boundary](#educational-security-boundary)
- [Built With](#built-with)
- [Current Status & Roadmap](#current-status--roadmap)
- [Educational Features](#educational-features)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Learning Objectives](#learning-objectives)
- [Technical Architecture](#technical-architecture)
- [Contributing](#contributing)
- [Changelog](#changelog)
- [License](#license)

For the complete learner-oriented explanation, including the mathematics, a worked example, real-world usage, production safeguards, and post-quantum context, read [RSA Foundations for Learners](docs/RSA-FOUNDATIONS.md). Its formulas are written in LaTeX and render as math on GitHub. New to the math? Start with its [reading paths](docs/RSA-FOUNDATIONS.md#how-to-read-this-guide) and [symbol glossary](docs/RSA-FOUNDATIONS.md#symbol-glossary).

## Why Asymmetric Encryption Matters

Symmetric encryption is efficient, but both participants need the same secret key. That creates the **key-distribution problem**: how do two people establish a shared secret while communicating over a network that an attacker may be observing?

Asymmetric cryptography gives each participant a related key pair:

- A **public key** that may be distributed openly.
- A **private key** that must remain secret.

RSA can illustrate two distinct uses of that key pair:

1. **Confidentiality:** encrypt with the recipient's public key and decrypt with the recipient's private key.
2. **Authenticity and integrity:** sign with the sender's private key and verify with the sender's public key.

Public-key operations are slower and more limited than symmetric encryption, so real systems are normally **hybrid**: asymmetric cryptography establishes trust or protects a small session secret, while a symmetric cipher protects the actual data.

## How the Learning Lab Maps to RSA

The lab exposes the values used in textbook RSA so learners can connect the interface to the mathematics:

| Learning Lab action | RSA concept |
| --- | --- |
| Choose or generate $p$ and $q$ | Select two distinct [prime numbers](docs/RSA-FOUNDATIONS.md#math-primes) |
| Enter the public exponent | Choose $e$ with $\gcd(e, \varphi(n)) = 1$ ([Step 3](docs/RSA-FOUNDATIONS.md#eq-public-exponent)) |
| Submit key data | Calculate $n = pq$ ([Step 1](docs/RSA-FOUNDATIONS.md#eq-modulus)), $\varphi(n) = (p - 1)(q - 1)$ ([Step 2](docs/RSA-FOUNDATIONS.md#eq-totient)), and the private exponent $d \equiv e^{-1} \pmod{\varphi(n)}$ ([Step 4](docs/RSA-FOUNDATIONS.md#eq-private-exponent)) |
| Encrypt text | Encode text as an integer $m$, then calculate $c = m^e \bmod n$ ([encrypt](docs/RSA-FOUNDATIONS.md#eq-encrypt)) |
| Decrypt ciphertext | Calculate $m = c^d \bmod n$ ([decrypt](docs/RSA-FOUNDATIONS.md#eq-decrypt)), then decode the integer |
| Change prime bit lengths | Observe how modulus size affects [message capacity](docs/RSA-FOUNDATIONS.md#eq-message-range) and computation |

The encoded message must satisfy $0 \le m < n$: it must be smaller than the modulus. This is why a message can be too large for the selected key even when it appears short to a person.

## Educational Security Boundary

> **Do not use this application to protect real secrets.**

RSA Learning Lab intentionally demonstrates **textbook RSA**. The current implementation performs raw modular exponentiation, converts ASCII text directly to an integer, generates example primes with Python's general-purpose `random` module, and defaults to an approximately 1024-bit modulus. It does not implement production encryption padding such as RSAES-OAEP, signature encoding such as RSASSA-PSS, cryptographically secure key generation, hardened private-key handling, or side-channel protections.

These limitations make the arithmetic easier to inspect, but textbook RSA is insecure in practice. Production software should use reviewed cryptographic libraries and complete, authenticated protocols.

## Built With

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white)
![SymPy](https://img.shields.io/badge/SymPy-3B5526?style=for-the-badge&logo=sympy&logoColor=white)

## Current Status & Roadmap

### Phase 1: Foundation (Completed)
- Basic RSA encryption/decryption functionality
- Key generation with prime number validation
- Environment configuration for development/production
- Core backend API with Flask
- Frontend migrated to TypeScript

### Phase 2: Student-Focused Redesign (In Progress)
- **Educational Onboarding** - Welcome screen with learning objectives
- **Step-by-Step Interface** - Replace modal-heavy design with guided learning flow
- **Concept Explanations** - Add educational content before each section
- **Visual Learning Aids** - Mathematical formulas, diagrams, and interactive elements
- **Progress Tracking** - Show students where they are in the learning journey

### Phase 3: Advanced Learning Features (Planned)
- **Interactive Tutorial Mode** - Guided walkthrough for first-time users
- **Animated Demonstrations** - Visual explanations of the RSA algorithm
- **Practice Exercises** - Built-in quizzes and challenges
- **Comparison Tools** - Side-by-side analysis of different key sizes and messages
- **Export/Print Functionality** - Save work for assignments and reports

## Educational Features

### Current Learning Features
- **Interactive Key Generation** - Students can generate RSA key pairs with different prime number sizes
- **Real-time Validation** - Immediate feedback on prime number validity and key compatibility
- **Step-by-step Encryption/Decryption** - Watch the RSA process unfold with detailed explanations
- **Visual Key Display** - Large numbers formatted for easy reading and understanding
- **RSA Foundations Guide** - Connect the demo to asymmetric encryption, hybrid systems, the RSA equations, and production limitations

### Planned Learning Enhancements
- **Interactive Tutorial** - Guided walkthrough for first-time users
- **Concept Explanations** - "What is RSA?" and "Why does this work?" sections
- **Visual Learning Aids** - Mathematical formulas, diagrams, and animations
- **Practice Exercises** - Built-in challenges and quizzes
- **Progress Tracking** - Show learning journey and completed concepts
- **Experimentation Tools** - Compare different key sizes and message lengths

## Getting Started

### For Students
1. **Visit the live demo** (coming soon) or follow the setup instructions below
2. **Read [RSA Foundations for Learners](docs/RSA-FOUNDATIONS.md)** to understand the purpose and vocabulary
3. **Generate your first key pair** and identify `p`, `q`, `n`, `e`, and `d`
4. **Encrypt and decrypt a short message** while matching each action to the equations
5. **Try different parameters** to observe message-size and computation limits, not to create production keys

### For Educators
1. **Set up the application** using the development setup below
2. **Customize the learning content** for your curriculum
3. **Use in classroom demonstrations** or assign as student projects
4. **Export student work** for grading and assessment

## Development Setup

### Prerequisites
- Python 3.8+
- Node.js 20.19+ (required by Vite 7)
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

   # Optional: install test dependencies and run the backend tests
   pip install -r requirements-dev.txt
   pytest
   ```

3. **Frontend Setup (React + TypeScript + Vite)**
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

### Frontend Scripts

Run these from the `frontend/` directory:

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server with hot reload |
| `npm run typecheck` | Type-check the project with `tsc -b` |
| `npm run lint` | Lint the TypeScript sources with ESLint |
| `npm run build` | Type-check, then build to `frontend/dist` (served by Flask) |
| `npm run preview` | Preview the production build locally |

## Learning Objectives

After using this tool, students will understand:
- **What RSA encryption is** and why it's important
- **Why public-key cryptography helps with key distribution**
- **How confidentiality differs from digital signatures**
- **Why real systems combine asymmetric and symmetric cryptography**
- **How prime numbers** are used in cryptography
- **The mathematical process** of key generation, encryption, and decryption
- **The relationship between key size** and security
- **Real-world applications** of RSA encryption
- **Why textbook RSA and this application are not production-safe**

## Technical Architecture

### Backend (Flask)
- **RSA Algorithm Implementation** - Pure Python implementation using SymPy
- **Example Prime Number Generation** - Educational prime generation using Python's general-purpose randomness; not suitable for real keys
- **Key Validation** - Mathematical validation of key pairs
- **RESTful API** - Clean endpoints for frontend communication
- **Teaching-Mode API** - `/teaching/keys`, `/teaching/encrypt`, and `/teaching/decrypt` return every intermediate value and a per-character trace for the learning UI; see [Teaching-Mode RSA API](docs/TEACHING-API.md)
- **Backend Tests** - `pytest` suite covering the teaching API and the legacy endpoints (`tests/`)

### Frontend (React + TypeScript + Vite)
- **Type-Safe Codebase** - Strict TypeScript, with typed API responses and component props
- **Student-Focused UI** - Designed for learning and experimentation
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Real-time Feedback** - Immediate validation and error handling

```
frontend/src/
├── components/   # UI components (modals, text output, icons)
├── hooks/        # State hooks (keys, text processing, modals, UI)
├── services/     # rsaAPI: typed client for the Flask API
├── types/        # Shared types (TextType, API response shapes)
├── App.tsx       # Root component
└── main.tsx      # Entry point
```

## Contributing

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
3. Make sure `pytest` passes at the repository root, and `npm run typecheck` and `npm run lint` pass in `frontend/`
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a history of notable changes.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **Educational Community** - Thanks to educators who provided feedback on the learning experience
- **Open Source Libraries** - Built with amazing tools like React, TypeScript, Flask, and SymPy
- **Students** - Your feedback drives the continuous improvement of this tool

---

<div align="center">
  <p><strong>Happy Learning!</strong></p>
  <p><em>Making cryptography accessible, one student at a time.</em></p>
</div>
