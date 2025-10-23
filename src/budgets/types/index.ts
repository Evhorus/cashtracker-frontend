export interface Budget {
  id: string;
  name: string;
  amount: string;
  spent: string;
  category?: string;
  description?: string;
  expenses: Expense[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Expense {
  id: string;
  name: string;
  amount: string;
  date: Date;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  name?: string;
}

// export interface Budget {
//   id: string;
//   name: string;
//   amount: number;
//   spent: number;
//   category?: string;
//   createdAt: string;
// }

// export interface Expense {
//   id: string;
//   budgetId: string;
//   name: string;
//   amount: number;
//   category?: string;
//   description?: string;
//   date: string;
//   createdAt: string;
// }

// export interface User {
//   id: string;
//   email: string;
//   name?: string;
// }
