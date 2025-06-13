import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
import xgboost as xgb
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime, timedelta
import requests
import io

def fetch_and_analyze_data():
    """Fetch the Walmart dataset and perform comprehensive analysis"""
    
    # Fetch data from the provided URL
    url = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/fake_walmart_perishables-UORL8ted18NnF2LnlqaTSVJQfO9ODV.csv"
    
    try:
        response = requests.get(url)
        response.raise_for_status()
        
        # Read CSV data
        df = pd.read_csv(io.StringIO(response.text))
        print("✅ Data fetched successfully!")
        print(f"Dataset shape: {df.shape}")
        
    except Exception as e:
        print(f"❌ Error fetching data: {e}")
        return None, None
    
    # Data Analysis
    print("\n" + "="*50)
    print("📊 DATASET ANALYSIS")
    print("="*50)
    
    # Basic info
    print("\n🔍 Dataset Info:")
    print(df.info())
    
    print("\n📈 Statistical Summary:")
    print(df.describe())
    
    # Check for missing values
    print("\n❓ Missing Values:")
    missing_values = df.isnull().sum()
    print(missing_values[missing_values > 0])
    
    # Data type corrections
    print("\n🔧 Fixing data types...")
    
    # Convert date column
    df['Date'] = pd.to_datetime(df['Date'])
    
    # Convert numeric columns
    numeric_columns = ['Weekly_Sales', 'Temperature', 'Fuel_Price', 'CPI', 
                      'Unemployment', 'Days_to_Expiry', 'Category_Avg_Price', 'Optimal_Price']
    
    for col in numeric_columns:
        df[col] = pd.to_numeric(df[col], errors='coerce')
    
    # Convert integer columns
    integer_columns = ['Store', 'Dept', 'Holiday_Flag', 'Current_Stock']
    for col in integer_columns:
        df[col] = pd.to_numeric(df[col], errors='coerce').astype('Int64')
    
    print("✅ Data types fixed!")
    
    # Remove any rows with missing critical values
    df = df.dropna(subset=['Optimal_Price', 'Days_to_Expiry', 'Current_Stock'])
    
    print(f"📊 Final dataset shape after cleaning: {df.shape}")
    
    # Analysis insights
    print("\n" + "="*50)
    print("🎯 KEY INSIGHTS")
    print("="*50)
    
    # Expiry analysis
    expiry_stats = df['Days_to_Expiry'].describe()
    print(f"\n⏰ Days to Expiry Analysis:")
    print(f"   • Average days to expiry: {expiry_stats['mean']:.1f}")
    print(f"   • Items expiring in ≤2 days: {len(df[df['Days_to_Expiry'] <= 2])}")
    print(f"   • Items expiring in ≤7 days: {len(df[df['Days_to_Expiry'] <= 7])}")
    
    # Price analysis
    price_stats = df['Optimal_Price'].describe()
    print(f"\n💰 Price Analysis:")
    print(f"   • Average optimal price: ${price_stats['mean']:.2f}")
    print(f"   • Price range: ${price_stats['min']:.2f} - ${price_stats['max']:.2f}")
    
    # Stock analysis
    stock_stats = df['Current_Stock'].describe()
    print(f"\n📦 Stock Analysis:")
    print(f"   • Average stock level: {stock_stats['mean']:.0f} units")
    print(f"   • Low stock items (<50): {len(df[df['Current_Stock'] < 50])}")
    
    # Department analysis
    dept_analysis = df.groupby('Dept').agg({
        'Optimal_Price': 'mean',
        'Days_to_Expiry': 'mean',
        'Weekly_Sales': 'mean'
    }).round(2)
    print(f"\n🏪 Department Analysis:")
    print(dept_analysis)
    
    return df, {
        'total_items': len(df),
        'perishable_items': len(df),
        'near_expiry': len(df[df['Days_to_Expiry'] <= 2]),
        'avg_shelf_life': df['Days_to_Expiry'].mean(),
        'departments': df['Dept'].nunique(),
        'stores': df['Store'].nunique(),
        'avg_price': df['Optimal_Price'].mean(),
        'price_range': [df['Optimal_Price'].min(), df['Optimal_Price'].max()]
    }

def prepare_features(df):
    """Prepare features for XGBoost model"""
    
    print("\n" + "="*50)
    print("🔧 FEATURE ENGINEERING")
    print("="*50)
    
    # Create a copy for feature engineering
    df_features = df.copy()
    
    # Extract date features
    df_features['Year'] = df_features['Date'].dt.year
    df_features['Month'] = df_features['Date'].dt.month
    df_features['Day'] = df_features['Date'].dt.day
    df_features['DayOfWeek'] = df_features['Date'].dt.dayofweek
    
    # Create urgency categories
    df_features['Urgency_Level'] = pd.cut(df_features['Days_to_Expiry'], 
                                         bins=[0, 1, 3, 7, float('inf')], 
                                         labels=['Critical', 'High', 'Medium', 'Low'])
    
    # Create stock level categories
    df_features['Stock_Level'] = pd.cut(df_features['Current_Stock'], 
                                       bins=[0, 50, 100, 200, float('inf')], 
                                       labels=['Low', 'Medium', 'High', 'Very_High'])
    
    # Price-to-category ratio
    df_features['Price_to_Category_Ratio'] = df_features['Optimal_Price'] / df_features['Category_Avg_Price']
    
    # Sales velocity (sales per day approximation)
    df_features['Sales_Velocity'] = df_features['Weekly_Sales'] / 7
    
    # Inventory turnover indicator
    df_features['Inventory_Pressure'] = df_features['Current_Stock'] / (df_features['Sales_Velocity'] + 1)
    
    print("✅ Feature engineering completed!")
    print(f"   • Added date features: Year, Month, Day, DayOfWeek")
    print(f"   • Added urgency levels: {df_features['Urgency_Level'].value_counts().to_dict()}")
    print(f"   • Added stock levels: {df_features['Stock_Level'].value_counts().to_dict()}")
    
    return df_features

def train_xgboost_model(df):
    """Train XGBoost model for price prediction"""
    
    print("\n" + "="*50)
    print("🤖 XGBOOST MODEL TRAINING")
    print("="*50)
    
    # Prepare features
    df_features = prepare_features(df)
    
    # Select features for training
    feature_columns = [
        'Store', 'Dept', 'Weekly_Sales', 'Holiday_Flag', 'Temperature',
        'Fuel_Price', 'CPI', 'Unemployment', 'Days_to_Expiry', 'Current_Stock',
        'Category_Avg_Price', 'Year', 'Month', 'Day', 'DayOfWeek',
        'Price_to_Category_Ratio', 'Sales_Velocity', 'Inventory_Pressure'
    ]
    
    # Prepare data
    X = df_features[feature_columns].copy()
    y = df_features['Optimal_Price'].copy()
    
    # Handle any remaining missing values
    X = X.fillna(X.mean())
    
    print(f"📊 Training data shape: {X.shape}")
    print(f"🎯 Target variable range: ${y.min():.2f} - ${y.max():.2f}")
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Train XGBoost model
    print("\n🚀 Training XGBoost model...")
    
    model = xgb.XGBRegressor(
        n_estimators=100,
        max_depth=6,
        learning_rate=0.1,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
        n_jobs=-1
    )
    
    model.fit(X_train, y_train)
    
    # Make predictions
    y_pred_train = model.predict(X_train)
    y_pred_test = model.predict(X_test)
    
    # Calculate metrics
    train_rmse = np.sqrt(mean_squared_error(y_train, y_pred_train))
    test_rmse = np.sqrt(mean_squared_error(y_test, y_pred_test))
    train_r2 = r2_score(y_train, y_pred_train)
    test_r2 = r2_score(y_test, y_pred_test)
    test_mae = mean_absolute_error(y_test, y_pred_test)
    
    print("\n📈 Model Performance:")
    print(f"   • Training RMSE: ${train_rmse:.2f}")
    print(f"   • Testing RMSE: ${test_rmse:.2f}")
    print(f"   • Training R²: {train_r2:.3f}")
    print(f"   • Testing R²: {test_r2:.3f}")
    print(f"   • Testing MAE: ${test_mae:.2f}")
    
    # Feature importance
    feature_importance = pd.DataFrame({
        'feature': feature_columns,
        'importance': model.feature_importances_
    }).sort_values('importance', ascending=False)
    
    print("\n🔍 Top 10 Most Important Features:")
    for idx, row in feature_importance.head(10).iterrows():
        print(f"   • {row['feature']}: {row['importance']:.3f}")
    
    return model, feature_columns, {
        'train_rmse': train_rmse,
        'test_rmse': test_rmse,
        'train_r2': train_r2,
        'test_r2': test_r2,
        'test_mae': test_mae,
        'feature_importance': feature_importance
    }

def predict_optimal_price(model, feature_columns, product_data):
    """
    Predict optimal price for a given product
    
    Args:
        model: Trained XGBoost model
        feature_columns: List of feature column names
        product_data: Dictionary with product information
    
    Returns:
        Predicted optimal price
    """
    
    # Create DataFrame from product data
    df_pred = pd.DataFrame([product_data])
    
    # Add engineered features
    if 'Date' in df_pred.columns:
        df_pred['Date'] = pd.to_datetime(df_pred['Date'])
        df_pred['Year'] = df_pred['Date'].dt.year
        df_pred['Month'] = df_pred['Date'].dt.month
        df_pred['Day'] = df_pred['Date'].dt.day
        df_pred['DayOfWeek'] = df_pred['Date'].dt.dayofweek
    
    # Calculate engineered features
    if 'Category_Avg_Price' in df_pred.columns and 'Optimal_Price' in product_data:
        df_pred['Price_to_Category_Ratio'] = product_data.get('Optimal_Price', product_data['Category_Avg_Price']) / df_pred['Category_Avg_Price']
    else:
        df_pred['Price_to_Category_Ratio'] = 1.0
    
    if 'Weekly_Sales' in df_pred.columns:
        df_pred['Sales_Velocity'] = df_pred['Weekly_Sales'] / 7
    else:
        df_pred['Sales_Velocity'] = 10.0  # Default value
    
    if 'Current_Stock' in df_pred.columns and 'Sales_Velocity' in df_pred.columns:
        df_pred['Inventory_Pressure'] = df_pred['Current_Stock'] / (df_pred['Sales_Velocity'] + 1)
    else:
        df_pred['Inventory_Pressure'] = 10.0  # Default value
    
    # Select only the features used in training
    X_pred = df_pred[feature_columns].fillna(0)
    
    # Make prediction
    predicted_price = model.predict(X_pred)[0]
    
    return max(predicted_price, 0.01)  # Ensure positive price

def generate_pricing_recommendations(df, model, feature_columns):
    """Generate pricing recommendations for urgent items"""
    
    print("\n" + "="*50)
    print("💡 PRICING RECOMMENDATIONS")
    print("="*50)
    
    # Focus on items expiring soon
    urgent_items = df[df['Days_to_Expiry'] <= 3].copy()
    
    if len(urgent_items) == 0:
        print("✅ No urgent items found!")
        return []
    
    recommendations = []
    
    for idx, item in urgent_items.iterrows():
        # Current optimal price
        current_price = item['Optimal_Price']
        
        # Predict new price with reduced days to expiry
        item_data = item.to_dict()
        
        # Simulate different scenarios
        scenarios = [
            {'days': item['Days_to_Expiry'], 'label': 'Current'},
            {'days': max(1, item['Days_to_Expiry'] - 1), 'label': 'Tomorrow'},
            {'days': 1, 'label': 'Last Day'}
        ]
        
        scenario_prices = []
        for scenario in scenarios:
            item_data['Days_to_Expiry'] = scenario['days']
            predicted_price = predict_optimal_price(model, feature_columns, item_data)
            scenario_prices.append({
                'scenario': scenario['label'],
                'days': scenario['days'],
                'price': predicted_price,
                'discount': ((current_price - predicted_price) / current_price) * 100
            })
        
        recommendations.append({
            'store': item['Store'],
            'dept': item['Dept'],
            'current_price': current_price,
            'current_stock': item['Current_Stock'],
            'days_to_expiry': item['Days_to_Expiry'],
            'scenarios': scenario_prices
        })
    
    # Display recommendations
    print(f"\n🚨 Found {len(recommendations)} urgent items needing price adjustment:")
    
    for i, rec in enumerate(recommendations[:10]):  # Show top 10
        print(f"\n📦 Item {i+1}: Store {rec['store']}, Dept {rec['dept']}")
        print(f"   Current: ${rec['current_price']:.2f} | Stock: {rec['current_stock']} | Expires in: {rec['days_to_expiry']} days")
        
        for scenario in rec['scenarios']:
            if scenario['discount'] > 0:
                print(f"   {scenario['scenario']}: ${scenario['price']:.2f} ({scenario['discount']:.1f}% discount)")
            else:
                print(f"   {scenario['scenario']}: ${scenario['price']:.2f}")
    
    return recommendations

# Main execution function
def main():
    """Main function to run the complete analysis and model training"""
    
    print("🚀 Starting WastelessAI XGBoost Analysis...")
    print("="*60)
    
    # Step 1: Fetch and analyze data
    df, analysis_summary = fetch_and_analyze_data()
    
    if df is None:
        print("❌ Failed to fetch data. Exiting...")
        return None, None, None
    
    # Step 2: Train XGBoost model
    model, feature_columns, model_metrics = train_xgboost_model(df)
    
    # Step 3: Generate recommendations
    recommendations = generate_pricing_recommendations(df, model, feature_columns)
    
    # Step 4: Summary
    print("\n" + "="*60)
    print("✅ ANALYSIS COMPLETE!")
    print("="*60)
    print(f"📊 Dataset: {analysis_summary['total_items']} items analyzed")
    print(f"🎯 Model Performance: R² = {model_metrics['test_r2']:.3f}")
    print(f"💰 Average Price Prediction Error: ${model_metrics['test_mae']:.2f}")
    print(f"🚨 Urgent Items: {len(recommendations)} items need immediate attention")
    
    return model, feature_columns, {
        'data_summary': analysis_summary,
        'model_metrics': model_metrics,
        'recommendations': recommendations,
        'sample_data': df.head(10).to_dict('records')
    }

# Run the analysis
if __name__ == "__main__":
    model, features, results = main()
