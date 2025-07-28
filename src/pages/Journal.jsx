import React, { useState, useEffect } from "react";
import spendingData from "../data/spending_data.json";
import { v4 as uuidv4 } from "uuid";
import { useLocalStorage } from "react-use";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";

function Journal() {
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [records, setRecords] = useLocalStorage("spendingRecords", []);

  // State for managing categories
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [showCategoryManager, setShowCategoryManager] = useState(false);

  // Load categories when component first renders
  useEffect(() => {
    // Step 1: Get categories from localStorage if they exist
    const savedCategories = localStorage.getItem("customCategories");

    if (savedCategories) {
      // If we have saved categories, use them
      setCategories(JSON.parse(savedCategories));
    } else {
      // If no saved categories, use the default ones from spending_data.json
      const defaultCategories = spendingData.map((item) => item.category);
      setCategories(defaultCategories);
      // Save these default categories to localStorage for future use
      localStorage.setItem(
        "customCategories",
        JSON.stringify(defaultCategories)
      );
    }
  }, []); // Empty array means this runs only once when component loads

  // Function to add a new category
  function addNewCategory() {
    // Step 1: Check if user entered something
    if (!newCategory.trim()) {
      alert("Please enter a category name");
      return;
    }

    // Step 2: Check if category already exists (ignore case)
    const categoryExists = categories.some(
      (cat) => cat.toLowerCase() === newCategory.trim().toLowerCase()
    );

    if (categoryExists) {
      alert("This category already exists!");
      return;
    }

    // Step 3: Add the new category to our list
    const updatedCategories = [...categories, newCategory.trim()];
    setCategories(updatedCategories);

    // Step 4: Save to localStorage so it persists
    localStorage.setItem("customCategories", JSON.stringify(updatedCategories));

    // Step 5: Clear the input field
    setNewCategory("");

    alert(`"${newCategory.trim()}" has been added to your categories!`);
  }

  // Function to delete a category
  function deleteCategory(categoryToDelete) {
    // Step 1: Ask user to confirm
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${categoryToDelete}"?`
    );

    if (!confirmDelete) {
      return; // User clicked cancel
    }

    // Step 2: Remove the category from our list
    const updatedCategories = categories.filter(
      (cat) => cat !== categoryToDelete
    );
    setCategories(updatedCategories);

    // Step 3: Save updated list to localStorage
    localStorage.setItem("customCategories", JSON.stringify(updatedCategories));

    alert(`"${categoryToDelete}" has been deleted from your categories.`);
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (!date || !category || !amount) {
      alert("Please fill in all fields");
      return;
    }

    const newRecord = {
      id: uuidv4(),
      date,
      category,
      amount: parseFloat(amount),
    };

    // const updatedRecords = [...records, newRecord];
    setRecords([...records, newRecord]);
    // localStorage.setItem("spendingRecords", JSON.stringify(updatedRecords));

    // Reset form
    setDate("");
    setCategory("");
    setAmount("");
  }

  function handleDelete(id) {
    const filtered = records.filter((rec) => rec.id !== id);
    setRecords(filtered);
  }

  return (
    <div className="container">
      <h2>Spending Journal</h2>

      <div>
        <button
          type="button"
          onClick={() => setShowCategoryManager(!showCategoryManager)}
        >
          {showCategoryManager ? "Hide" : "Manage"} Categories
        </button>

        {showCategoryManager && (
          <div>
            <h4>Add New Category</h4>
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Enter new category name"
            />
            <button type="button" onClick={addNewCategory}>
              Add Category
            </button>

            <h4>Your Categories ({categories.length})</h4>
            <div>
              {categories.map((cat) => (
                <div key={cat}>
                  <span>{cat}</span>
                  <button type="button" onClick={() => deleteCategory(cat)}>
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Date: </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Category: </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Amount: </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>

        <button type="submit">Save Record</button>
      </form>

      <br />
      <hr />
      <br />

      <h3>Saved Records:</h3>
      <ul>
        {records?.map((rec) => (
          <li key={rec.id}>
            {rec.date} - {rec.category} - THB {rec.amount}{" "}
            <button className="delete-btn" onClick={() => handleDelete(rec.id)}>
              <RemoveCircleOutlineIcon />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Journal;
