import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const BudgetChart = ({ expenses, budget, activities }) => { // Add activities prop
  const totalExpenses = expenses.reduce(
    (sum, expense) => sum + parseFloat(expense.amount || 0),
    0
  );

  // Calculate total activity costs
  const totalActivityCosts = (activities || []).reduce(
    (sum, activity) => sum + parseFloat(activity.cost || 0),
    0
  );

  // Include activity costs in the total spent
  const totalSpent = totalExpenses + totalActivityCosts;

  const remainingBudget = parseFloat(budget || 0) - totalSpent;

  const data = {
    labels: ["Spent", "Remaining"],
    datasets: [
      {
        label: "Budget Overview",
        data: [totalSpent, remainingBudget], // Use totalSpent
        backgroundColor: ["#FF6384", "#36A2EB"],
        borderColor: ["#FF6384", "#36A2EB"],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div style={{ width: "300px", height: "300px" }}>
      <Pie data={data} />
    </div>
  );
};

export default BudgetChart;