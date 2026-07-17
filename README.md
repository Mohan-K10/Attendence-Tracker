# Attendance Tracker 🎯

A sleek, modern, and gamified React web application designed to help students track their daily college attendance intuitively. 

Unlike traditional attendance portals that start you at 100% and stress you out when you miss a class, this tracker treats your semester like a game—you start at 0% and grind your way to a perfect score by showing up!

## ✨ Key Features

- **Gamified "Semester Progression" Score:** Built on a custom `+/-` mathematical rule, this score starts at exactly 0.000%. Every class you attend adds to your score, and every class you miss penalizes you equally. Watch your progress build over the entire semester!
- **Standard Academic Percentage:** For those who prefer the classic metric, view your standard `(Attended / Total Held) * 100` percentage right alongside your progression score.
- **Customizable Daily Classes:** Not every day has a standard 6-class schedule. You can dynamically change the total number of classes held on any specific day right from the logging interface, and the math automatically scales to preserve perfect accuracy.
- **Smart Holiday Calendar:** An interactive built-in calendar to log official holidays or fests. Flagged dates are safely excluded from all attendance math.
- **Privacy First (Local Storage):** Completely serverless! Your attendance history, custom settings, and holiday data are persistently and safely stored directly within your browser's local storage.
- **Responsive Dark UI:** A stunning, premium dark-mode interface optimized perfectly for both desktop monitors and mobile screens.

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/attendance-tracker.git
```

2. Navigate to the project directory:
```bash
cd attendance-tracker
```

3. Install the dependencies:
```bash
npm install
```

4. Start the development server:
```bash
npm run dev
```

The application will spin up locally on your browser. 

## 🛠️ Built With
- **React.js** (Frontend UI)
- **Vite** (Build Tool)
- **Vanilla CSS** (Custom Styling & Glassmorphism Aesthetics)

## 🤝 Contributing
Contributions, issues, and feature requests are always welcome! Feel free to check the issues page.
