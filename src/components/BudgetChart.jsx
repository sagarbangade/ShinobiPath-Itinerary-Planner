
import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const BudgetChart = ({ expenses, budget }) => {
  const totalExpenses = expenses.reduce(
    (sum, expense) => sum + parseFloat(expense.amount || 0),
    0
  );
  const remainingBudget = parseFloat(budget || 0) - totalExpenses;

  const data = {
    labels: ["Spent", "Remaining"],
    datasets: [
      {
        label: "Budget Overview",
        data: [totalExpenses, remainingBudget],
        backgroundColor: ["#FF6384", "#36A2EB"],
        borderColor: ["#FF6384", "#36A2EB"],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div style={{ width: "300px", height: "300px" }}>
      {" "}
      {/* Adjust size as needed */}
      <Pie data={data} />
    </div>
  );
};

export default BudgetChart;