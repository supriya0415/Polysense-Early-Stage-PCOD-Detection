import os
import joblib
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS

# Initialize the Flask application
app = Flask(__name__)
# Enable Cross-Origin Resource Sharing (CORS) for all routes
CORS(app)

# --- Load pre-trained model, scaler, and imputer ---
try:
    MODEL_PATH = 'model/pcos_svm_model.pkl'
    SCALER_PATH = 'model/scaler.pkl'
    IMPUTER_PATH = 'model/imputer.pkl'

    model = joblib.load(MODEL_PATH)
    scaler = joblib.load(SCALER_PATH)
    imputer = joblib.load(IMPUTER_PATH)
except FileNotFoundError as e:
    raise FileNotFoundError(
        f"Error loading model files: {e}. Please ensure model, scaler, and imputer are in the 'model' folder."
    )

# --- Define feature names and mappings ---

# These names MUST EXACTLY match the keys in the JSON sent from the frontend.
FEATURE_NAMES = [
    "Age (yrs)", "Weight (Kg)", "Height(Cm)", "BMI", "Blood Group", "Cycle(R/I)", "Cycle length(days)",
    "Marriage Status (Yrs)", "Pregnant(Y/N)", "No. of aborptions", "Weight gain(Y/N)", "hair growth(Y/N)",
    "Skin darkening (Y/N)", "Hair loss(Y/N)", "Pimples(Y/N)", "Fast food (Y/N)", "Reg.Exercise(Y/N)"
]

# Mappings to convert categorical text data into numbers for the model
blood_group_mapping = {
    "A+": 11, "A-": 12, "B+": 13, "B-": 14, "O+": 15, "O-": 16, "AB+": 17, "AB-": 18
}
yn_mapping = {"Y": 1, "N": 0}
cycle_mapping = {"R": 2, "I": 4} # Regular/Irregular cycle mapping

@app.route('/')
def home():
    """A simple route to confirm the API is running."""
    return "PCOS Prediction Model API is running!"

@app.route('/predict', methods=['POST'])
def predict():
    """Receives patient data, processes it, and returns a PCOS prediction."""
    print("\n--- PREDICT ENDPOINT WAS HIT! ---")
    try:
        data = request.get_json()
        print("--- RECEIVED DATA: ---", data)
        if not data:
            return jsonify({'error': 'No input data provided'}), 400

        input_data = []
        # --- Process features in the correct order ---
        for feature in FEATURE_NAMES:
            value = data.get(feature)

            if value is None:
                return jsonify({"error": f"Missing required feature: '{feature}'"}), 400

            # Convert feature values from text to numbers based on mappings
            if feature == "Blood Group":
                input_data.append(blood_group_mapping.get(str(value).upper(), 0))
            elif feature == "Cycle(R/I)":
                input_data.append(cycle_mapping.get(str(value).upper(), 0))
            elif feature in ["Pregnant(Y/N)", "Weight gain(Y/N)", "hair growth(Y/N)", "Skin darkening (Y/N)", "Hair loss(Y/N)", "Pimples(Y/N)", "Fast food (Y/N)", "Reg.Exercise(Y/N)"]:
                input_data.append(yn_mapping.get(str(value).upper(), 0))
            else:
                # For all other features, convert to a float
                input_data.append(float(value))

        # --- Prepare data for the model ---
        # Convert list to a NumPy array and reshape it for a single prediction
        input_array = np.array(input_data).reshape(1, -1)

        # Apply the same imputer and scaler that were used during model training
        input_imputed = imputer.transform(input_array)
        input_scaled = scaler.transform(input_imputed)

        # --- Make a prediction ---
        prediction_val = model.predict(input_scaled)[0]
        result_text = "PCOS likely" if prediction_val == 1 else "PCOS unlikely"

        return jsonify({'prediction': result_text})

    except (ValueError, TypeError) as e:
        # Handle errors from invalid data types (e.g., sending text for age)
        return jsonify({'error': f"Invalid data format. Please check your inputs. Details: {str(e)}"}), 400
    except Exception as e:
        # A general catch-all for any other unexpected errors
        print(f"An unexpected error occurred: {e}") # Log the full error for debugging
        return jsonify({'error': f"An unexpected server error occurred: {str(e)}"}), 500


if __name__ == '__main__':
    # Set debug=True for development, which provides detailed error pages.
    # Should be set to False in a production environment.
    app.run(debug=True, port=5000)