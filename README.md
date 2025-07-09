# CashTracker - Frontend

**CashTracker** is a modern web application for managing personal or business budgets. The frontend is built with Next.js 15 and leverages a clean, responsive UI to help users create, track, and analyze their budgets and expenses.

> **Note:**  
> This project was developed based on the course [Full Stack Node.js React TS NestJS Next.js Creando Proyectos](https://www.udemy.com/course/curso-full-stack-nodejs-react-typescript-nestjs-nextjs/) by Juan Pablo De la Torre Valdez on Udemy, which covers building real-world full stack applications using Node.js, React, TypeScript, NestJS, and Next.js

## 🚀 Features

- **Budget Management:** Create, edit, and delete budgets.
- **Expense Tracking:** Add, view, and manage expenses for each budget.
- **Visual Analytics:** Progress bars and summary cards for quick insights.
- **Responsive Design:** Fully responsive for mobile and desktop.
- **Form Validation:** Robust validation using Zod.
- **Notifications:** Real-time feedback with react-toastify.

## 🛠️ Tech Stack

| Technology                 | Purpose                      |
| -------------------------- | ---------------------------- |
| Next.js 15                 | React framework (App Router) |
| Tailwind CSS               | Utility-first styling        |
| Zod                        | Schema validation            |
| react-circular-progressbar | Progress visualization       |
| react-toastify             | Toast notifications          |

## ⚡ Getting Started

Follow these steps to run the project locally:

1. **Clone the repository**

2. **Install dependencies**

3. **Configure environment variables**

Create a `.env.local` file at the root of the project with the following content:

4. **Run the development server**

The app will be available at [http://localhost:3000](http://localhost:3000).

## 📝 Scripts

| Command         | Description              |
| --------------- | ------------------------ |
| `npm run dev`   | Start development server |
| `npm run build` | Build for production     |
| `npm start`     | Start production server  |

## 📦 Environment Variables

| Variable          | Description                |
| ----------------- | -------------------------- |
| `API_URL`         | Backend API base URL       |
| `NEXT_PUBLIC_URL` | Frontend base URL (public) |

## 📣 Notes

- Make sure the backend API is running at the URL specified in `API_URL`.
- For best results, use Node.js 18+ and npm 9+.
- Customize the design and logic as needed for your use case.

## 🤝 Contributing

Feel free to open issues or submit pull requests to improve the project!

## 🖼️ License

This project is open source and available under the [MIT License](LICENSE).
