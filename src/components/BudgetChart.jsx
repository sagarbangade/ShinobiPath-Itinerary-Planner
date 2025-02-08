import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const BudgetChart = ({ expenses, budget, activities }) => {
  const totalExpenses = expenses.reduce(
    (sum, expense) => sum + parseFloat(expense.amount || 0),
    0
  );

  const totalActivityCosts = (activities || []).reduce(
    (sum, activity) => sum + parseFloat(activity.cost || 0),
    0
  );

  const totalSpent = totalExpenses + totalActivityCosts;
  const remainingBudget = parseFloat(budget || 0) - totalSpent;

  const data = {
    labels: ["Remaining", "Expenses", "Activities"],
    datasets: [
      {
        label: "",
        data: [remainingBudget, totalExpenses, totalActivityCosts],
        backgroundColor: [
          "rgba(54, 162, 235, 0.2)",
          "rgba(255, 99, 132, 0.2)",
          "rgba(255, 206, 86, 0.2)",
        ],
        borderColor: [
          "rgba(54, 162, 235, 1)",
          "rgba(255, 99, 132, 1)",
          "rgba(255, 206, 86, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          maxWidth: "400px",
          margin: "auto",
        }}
      >
        <Doughnut
          data={data}
          options={{ maintainAspectRatio: false, responsive: true }}
        />
      </div>
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            maxWidth: "400px",
            margin: "auto",
            gap: "10px",
            fontSize: "14px",
          }}
        >
          <p>Budget: {budget}</p>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            maxWidth: "400px",
            margin: "auto",
            gap: "10px",
            fontSize: "12px",
          }}
        >
          <p>Remaining: {remainingBudget}</p>
          <p>Expenses: {totalExpenses}</p>
          <p>Activity Costs: {totalActivityCosts}</p>
        </div>
      </div>
    </div>
  );
};

export default BudgetChart;
