# 🛒 Dynamic Pricing Dashboard for Perishable Goods

A smart pricing engine for grocery retailers that dynamically adjusts prices of perishable items based on expiry, inventory, and demand. The goal is to **reduce food waste**, **boost sales**, and **optimize stock** using a rule-based discounting system with optional machine learning integration.

Inspired by modern solutions like **Wasteless**, this system is tailored for markets like **Walmart India** or local grocery chains with POS systems.

---

## 📌 Project Objective

Traditional grocery stores lose profits due to rigid static pricing for items that are close to expiry or overstocked. This project builds a **real-time pricing dashboard** to:

- Monitor inventory and expiry in real-time
- Apply **dynamic discounts** using priority rules
- Improve turnover of near-expiry items
- Reduce food waste and markdown loss
- Increase profit per square foot

---

## 🧠 Core Features

✅ **Rule-Based Discount Engine**  
✅ **Real-Time Inventory View**  
✅ **Sales Velocity Insights**  
✅ **Priority-Based Rule Application**  
✅ **XGBoost ML Model for Price Prediction (Optional)**  
✅ **Streamlit Frontend for Interactive Dashboard**  
✅ **CSV-Based or Real Inventory API Support**

---

## ⚙️ Dynamic Pricing Rules Engine

This rule engine determines the final price of each item based on the first matched condition, **in order of priority**.

| Priority | Rule Name        | Condition                | Factor             | Discount |
|----------|------------------|--------------------------|---------------------|----------|
| 1        | Critical Expiry   | `daysToExpiry <= 1`      | Expiry Date         | 50%      |
| 2        | Near Expiry       | `daysToExpiry <= 3`      | Expiry Date         | 25%      |
| 3        | High Stock        | `stock > 150`            | Inventory Level     | 15%      |
| 4        | Low Demand        | `salesVelocity < 5`      | Sales Rate          | 10%      |

📌 **Rule Application Logic**:

- Rules are applied in **priority order**
- **Only one discount** is applied per product (no stacking)
- If no rule matches, the price remains unchanged

---

## 📊 Sample Product Analysis

| Product         | Stock | Expiry | Sales Velocity | Rule Applied      | Final Discount |
|-----------------|--------|--------|----------------|-------------------|----------------|
| Milk Carton     | 80     | 1 day  | 120/day        | Critical Expiry    | 50%            |
| Lettuce         | 200    | 6 days | 4/day          | High Stock         | 15%            |
| Greek Yogurt    | 40     | 2 days | 2/day          | Near Expiry        | 25%            |
| Almond Butter   | 500    | 12 days| 3/day          | High Stock         | 15%            |
| Ice Cream       | 40     | 14 days| 3/day          | Low Demand         | 10%            |
| Tenderloin      | 72     | 4 days | 2960/day       | No Match (High Demand) | 0%         |

---

## 🧮 Dataset Structure (CSV)

The system reads a CSV with the following columns:

| Column Name      | Description                          |
|------------------|--------------------------------------|
| Product          | Name of the item                     |
| Category         | Department or item category          |
| Stock            | Current inventory count              |
| Expiry           | Days left until expiry               |
| Original Price   | Base price of the product            |
| Current Price    | Discounted price (after rule)        |
| Discount         | Percentage discount applied          |
| Sales Velocity   | Units sold per day                   |

---

## 🤖 Machine Learning (Optional XGBoost Model)

- Uses XGBoost Regressor to predict ideal discount percentage based on:
  - Stock
  - Expiry days
  - Sales velocity
  - Category encoding

This adds an **AI-driven layer** that can complement rule-based discounts or override them based on accuracy.

---

## 📦 Tech Stack

- **Python** (Data logic, backend)
- **Pandas / NumPy** (Data manipulation)
- **XGBoost** (ML model)
- **Streamlit** (Frontend dashboard)
- **Matplotlib / Seaborn** (Visualization)
- **CSV** or live data APIs (Inventory input)

---

## 📹 Demo

▶️ [Watch the Demo Video](https://youtube.com/shorts/kuSozW6AmcE?feature=share)

---

## 🚀 Getting Started

1. **Clone this repo** 
    https://github.com/adityajadhav2004/zesta-smart-stock

```bash
git clone 
cd perishable-pricing-dashboard
```

2. **Install dependencies**

```bash
pip install -r requirements.txt
```

3. **Run the dashboard**

```bash
streamlit run scripts/xgboost_pricing_model.py
```

4. **Upload your inventory CSV** or connect to your inventory API.

---

## 📝 Customization

- Edit the rules in the pricing engine to fit your store's needs.
- Integrate with your POS or inventory system for real-time updates.
- Extend the ML model with more features for better accuracy.

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## 📄 License

MIT License. See `LICENSE` file for details.
