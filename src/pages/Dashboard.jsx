
import React, { useEffect, useState } from "react";
import {
  createBudget,
  createExpense,
  deleteExpense,
  fetchData,
  waait,
} from "../helper";

import { UserIcon, ClockIcon } from "@heroicons/react/24/solid";

// react router dom imports
import { Link, useLoaderData } from "react-router-dom";

// components import
import AddBudgetForm from "../components/AddBudgetForm";
import BudgetItem from "../components/BudgetItem";
import Table from "../components/Table";
import AddExpenseForm from "../components/AddExpenseForm";

// toastify imports
import { toast } from "react-toastify";
import Alert from "../components/Alert";

import problemSolving from "../assets/problemSolving.gif";

const API_BASE_URL = window.location.origin;

// loader
export async function dashboardLoader() {
  const budgets = await fetchData("budgets");
  const expenses = await fetchData("expenses");
  return { budgets, expenses };
}

// action
export async function dashboardAction({ request }) {
  await waait();
  const data = await request.formData();
  const { _action, ...values } = Object.fromEntries(data);

  if (_action === "createBudget") {
    try {
      // check if user has sufficient balance
      const user_details = await JSON.parse(
        localStorage.getItem("user_details")
      );
      if (
        parseFloat(await user_details.balance) >=
        parseFloat(values.newBudgetAmount)
      ) {
        // create budget
        createBudget({
          category_name: values.newBudget,
          category_limit: values.newBudgetAmount,
        });

        return toast.success("Your budget is created!");
      } else {
        return toast.error("Insufficient Balance");
      }
    } catch (e) {
      throw new Error("There was a problem creating your budget!");
    }
  } else if (_action === "createExpense") {
    try {
      let user_details = await JSON.parse(localStorage.getItem("user_details"));

      let initial_balance = await user_details.balance;
      let newExpenseAmount = await values.newExpenseAmount;

      if (parseFloat(initial_balance) >= parseFloat(newExpenseAmount)) {
        createExpense({
          expense_name: values.newExpense,
          expense_amount: values.newExpenseAmount,
          category_id: values.newExpenseBudget,
        });

        user_details.balance =
          parseFloat(user_details.balance) -
          parseFloat(values.newExpenseAmount);

        const updatedDetails = JSON.stringify(user_details);
        localStorage.setItem("user_details", updatedDetails);

        return toast.success(`${values.newExpense} added!`);
      } else {
        return toast.error("Insufficient Balance!");
      }
    } catch (e) {
      throw new Error("There was a problem adding your Expense!");
    }
  } else if (_action === "deleteExpense") {
    try {
      deleteExpense({
        key: "expenses",
        id: values.expenseId,
      });

      const user_details = await JSON.parse(
        localStorage.getItem("user_details")
      );
      user_details.balance =
        parseFloat(user_details.balance) + parseFloat(values.expenseAmt);

      const updatedDetails = JSON.stringify(user_details);
      localStorage.setItem("user_details", updatedDetails);

      return toast.success(`Expense deleted!`);
    } catch (e) {
      throw new Error("There was a problem deleting your Expense!");
    }
  }
}

const Dashboard = () => {
  const { budgets, expenses } = useLoaderData();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [balance, setBalance] = useState(0);
  const [zeroBalance, setZeroBalance] = useState(0);

  useEffect(() => {
    const fetchUserData = async () => {
      const userDetails = await JSON.parse(
        localStorage.getItem("user_details")
      );
      //const userID = await userDetails.id;
      const user_username = await userDetails.user_name;
      const userEmail = await userDetails.email;
      setBalance(parseFloat(await userDetails.balance));
      setUsername(user_username);
      setEmail(userEmail);
    };

    fetchUserData();
  }, []);
  // }, [username, balance]);

  const onSubmitZeroBalance = async (e) => {
    e.preventDefault();
    try {
      const body = { email, zeroBalance };
      // console.log(body);
      const response = await fetch(`${API_BASE_URL}/setzerobalance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (response.status === 200) {
        const data = await response.json();
        const message = await data.message;
        const newBalance = await data.zeroBalance;

        const user_details = await fetchData("user_details");
        const balance = await user_details.balance;
        user_details.balance = parseFloat(balance) + parseFloat(newBalance);
        localStorage.setItem("user_details", JSON.stringify(user_details));

        // eslint-disable-next-line no-restricted-globals
        location.reload(true);

        return toast.success(message);
      }
    } catch (error) {
      console.error(error.message);
    }
  };

  return (
    <>
      {username ? (
        <div className="dashboard">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            {balance <= 0 && <Alert type={"danger"} msg={"Low Balance!"} />}
            {balance <= 0 && (
              <div>
                <form
                  style={{
                    fontSize: "16px",
                  }}
                  onSubmit={onSubmitZeroBalance}
                >
                  <input
                    style={{ margin: "10px 0px" }}
                    type="numeric"
                    name="balance"
                    required
                    value={zeroBalance}
                    onChange={(e) => {
                      setZeroBalance(e.target.value);
                    }}
                    placeholder="Your Balance?"
                    aria-label="Your balance"
                    autoComplete="off"
                  />
                  <button className="btn btn--dark" type="submit">
                    <span>+ Balance</span>
                    <ClockIcon width={20} />
                  </button>
                </form>
              </div>
            )}
          </div>
          <h1>
            Welcome back, <span className="accent">{username}</span>
          </h1>
          <div className="grid-sm">
            {budgets && budgets.length > 0 ? (
              <div className="grid-lg">
                <div className="flex-lg">
                  <AddBudgetForm />
                  <AddExpenseForm budgets={budgets} />
                </div>
                <h2>Existing Categories</h2>
                <div className="budgets">
                  {budgets.map((budget) => (
                    <BudgetItem key={budget.category_id} budget={budget} />
                  ))}
                </div>
                {expenses && expenses.length > 0 && (
                  <div className="grid-md">
                    <h2>Recent Expenses</h2>
                    <Table
                      expenses={expenses
                        .sort(
                          (a, b) =>
                            parseInt(b.expense_created_at) -
                            parseInt(a.expense_created_at)
                        )
                        .slice(0, 8)}
                    />
                    {expenses.length > 8 && (
                      <Link to={"expenses"} className="btn btn--dark">
                        View all expenses
                      </Link>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="grid-sm">
                <p>Track your expenses by creating a category for expense.</p>
                <AddBudgetForm />
              </div>
            )}
          </div>
        </div>
      ) : (
      <div style={{height: "100%", width: "100%", display: "flex", flexDirection: "row", justifyContent: "space-around"}}>
        <div style={{height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", gap: "20px"}}>
          <div>
            <Link to={"/login"} className="btn btn--dark">
              <span>Login</span>
              <UserIcon width={20} />
            </Link>
          </div>
          <div>
            <Link to={"/register"} className="btn btn--dark">
              <span>Register</span>
              <UserIcon width={20} />
            </Link>
          </div>
        </div>
        <div>
          <img
            src={problemSolving}
            height={450}
            width={450}
            alt="Person"
          />
        </div>
      </div>
      )}
    </>
  );
};

export default Dashboard;
