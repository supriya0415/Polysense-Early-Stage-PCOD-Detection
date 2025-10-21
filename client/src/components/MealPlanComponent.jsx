import React, { useState } from "react";

const MealPlanComponent = ({ pcodProbability }) => {
  const [loading, setLoading] = useState(false);
  const [mealPlan, setMealPlan] = useState(null);
  const [showPlan, setShowPlan] = useState(false);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [dietPreferences, setDietPreferences] = useState({
    dietType: "vegetarian",
    cuisinePreference: "indian",
    allergies: "",
    strictDiet: "moderate",
    mealFrequency: "3",
    caloriePreference: "moderate",
    sugarLimit: "moderate",
    additionalRequirements: ""
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDietPreferences(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const startQuestionnaire = () => {
    setShowQuestionnaire(true);
  };

  const generateMealPlan = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const apiKey = "AIzaSyAgxszMrnza8NwJhpxzoyIBjUsgnWF3lac";
      const endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

      const prompt = `
      Generate a structured 7-day meal plan for managing PCOD symptoms based on a PCOD probability of ${pcodProbability}%.

      User's dietary preferences:
      - Diet type: ${dietPreferences.dietType}
      - Cuisine preference: ${dietPreferences.cuisinePreference}
      - Allergies/intolerances: ${dietPreferences.allergies || "None"}
      - Diet strictness: ${dietPreferences.strictDiet}
      - Meals per day: ${dietPreferences.mealFrequency}
      - Calorie preference: ${dietPreferences.caloriePreference}
      - Sugar limitation: ${dietPreferences.sugarLimit}
      - Additional requirements: ${dietPreferences.additionalRequirements || "None"}
      
      First, write a brief paragraph about the benefits of this meal plan for PCOD management.
      
      Then, provide a meal plan in JSON format exactly as follows with no additional text, comments, or explanation:
      
      [
        {
          "day": "Day 1",
          "breakfast": "Detailed breakfast description with specific foods",
          "lunch": "Detailed lunch description with specific foods",
          "dinner": "Detailed dinner description with specific foods"${dietPreferences.mealFrequency === "5" ? ',\n          "snacks": "Morning and evening snack options"' : ''}
        },
        {
          "day": "Day 2",
          "breakfast": "Detailed breakfast description with specific foods",
          "lunch": "Detailed lunch description with specific foods",
          "dinner": "Detailed dinner description with specific foods"${dietPreferences.mealFrequency === "5" ? ',\n          "snacks": "Morning and evening snack options"' : ''}
        },
        ... and so on for all 7 days
      ]
      
      Remember to focus on foods that help balance hormones, reduce inflammation, and manage insulin resistance with specific meals rich in fiber, low glycemic index, and anti-inflammatory properties.`;

      const requestBody = {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      };

      const response = await fetch(`${endpoint}?key=${apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      const planContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (planContent) {
        setMealPlan(planContent);
        setShowPlan(true);
        setShowQuestionnaire(false);
      } else {
        setMealPlan(generateFallbackMealPlan());
        setShowPlan(true);
        setShowQuestionnaire(false);
      }
    } catch (error) {
      console.error("Error generating meal plan:", error);
      setMealPlan(generateFallbackMealPlan());
      setShowPlan(true);
      setShowQuestionnaire(false);
    } finally {
      setLoading(false);
    }
  };

  const generateFallbackMealPlan = () => {
    const dietType = dietPreferences.dietType;
    const mealFrequency = dietPreferences.mealFrequency;

    const mealOptions = {
      vegetarian: {
        breakfasts: [
          "Oatmeal with nuts and berries",
          "Greek yogurt with flaxseeds and fruits",
          "Spinach and mushroom omelet with whole grain toast",
          "Quinoa breakfast bowl with nuts and seeds",
          "Vegetable upma with sprouts",
          "Avocado toast with cherry tomatoes",
          "Whole grain pancakes with fruit compote"
        ],
        lunches: [
          "Lentil soup with mixed vegetables and whole grain bread",
          "Quinoa salad with roasted vegetables",
          "Chickpea curry with brown rice",
          "Stuffed bell peppers with beans and vegetables",
          "Whole grain wrap with hummus and vegetables",
          "Greek salad with feta cheese and olive oil dressing",
          "Vegetable and tofu stir-fry with brown rice"
        ],
        dinners: [
          "Baked eggplant with tomato sauce and a side salad",
          "Zucchini noodles with lentil bolognese",
          "Vegetable and chickpea curry with brown rice",
          "Stuffed portobello mushrooms with quinoa",
          "Bean and vegetable soup with whole grain bread",
          "Spinach and paneer curry with millet",
          "Roasted vegetable Buddha bowl with tahini dressing"
        ],
        snacks: [
          "Apple slices with almond butter",
          "Handful of mixed nuts and seeds",
          "Carrot sticks with hummus",
          "Greek yogurt with berries",
          "Roasted chickpeas",
          "Cottage cheese with cucumber slices",
          "Homemade energy balls with dates and nuts"
        ]
      }
    };

    const fallbackDays = [];

    for (let day = 1; day <= 7; day++) {
      fallbackDays.push({
        day: `Day ${day}`,
        breakfast: mealOptions[dietType].breakfasts[day - 1],
        lunch: mealOptions[dietType].lunches[day - 1],
        dinner: mealOptions[dietType].dinners[day - 1],
        snacks: mealFrequency === "5" ? mealOptions[dietType].snacks[day - 1] : undefined
      });
    }

    const intro = `This meal plan is designed to help manage PCOD symptoms through balanced nutrition. It focuses on anti-inflammatory foods, stable blood sugar levels, and hormone balance.`;

    return {
      introduction: intro,
      mealPlan: fallbackDays
    };
  };

  const renderMealPlanTable = (plan) => {
    try {
      let introduction = "";
      let mealPlanData = [];

      if (plan.introduction && plan.mealPlan) {
        introduction = plan.introduction;
        mealPlanData = plan.mealPlan;
      } else {
        const jsonMatch = plan.match(/\[\s*\{[\s\S]*\}\s*\]/);

        if (jsonMatch) {
          const introEndIndex = plan.indexOf(jsonMatch[0]);
          if (introEndIndex > 0) {
            introduction = plan.substring(0, introEndIndex).trim();
          }

          try {
            mealPlanData = JSON.parse(jsonMatch[0]);
          } catch (error) {
            console.error("Failed to parse JSON from response", error);
          }
        }

        if (!mealPlanData.length) {
          const dayRegex = /day\s+(\d+)[\s\S]*?breakfast:\s*([\s\S]*?)(?=lunch:|$)[\s\S]*?lunch:\s*([\s\S]*?)(?=dinner:|$)[\s\S]*?dinner:\s*([\s\S]*?)(?=(?:snacks?:|day|$))/gi;
          let match;
          const extractedData = [];

          while ((match = dayRegex.exec(plan)) !== null) {
            const dayData = {
              day: `Day ${match[1]}`,
              breakfast: match[2]?.trim() || "Not specified",
              lunch: match[3]?.trim() || "Not specified",
              dinner: match[4]?.trim() || "Not specified"
            };

            if (dietPreferences.mealFrequency === "5") {
              const snackMatch = plan.match(new RegExp(`day\\s+${match[1]}[\\s\\S]*?snacks?:\\s*([\\s\\S]*?)(?=day|$)`, 'i'));
              if (snackMatch) {
                dayData.snacks = snackMatch[1]?.trim() || "";
              }
            }

            extractedData.push(dayData);
          }

          if (extractedData.length > 0) {
            mealPlanData = extractedData;

            if (!introduction) {
              const introMatch = plan.match(/^([\s\S]*?)(?=day\s+1|$)/i);
              if (introMatch) {
                introduction = introMatch[1]?.trim() || "";
              }
            }
          }
        }
      }

      if (!mealPlanData.length) {
        const fallbackPlan = generateFallbackMealPlan();
        return renderMealPlanTable(fallbackPlan);
      }

      mealPlanData.sort((a, b) => {
        const dayNumA = parseInt(a.day.match(/\d+/)[0]);
        const dayNumB = parseInt(b.day.match(/\d+/)[0]);
        return dayNumA - dayNumB;
      });

      return (
        <div className="space-y-6">
          {introduction && (
            <div className="bg-pink-50 p-6 rounded-lg shadow-md border border-pink-200">
              <h2 className="text-xl font-semibold text-pink-700 mb-3">Introduction</h2>
              <p className="text-gray-700">{introduction}</p>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg shadow-lg overflow-hidden">
              <thead className="bg-pink-200">
                <tr>
                  <th className="py-4 px-6 text-left text-pink-800 font-bold">Day</th>
                  <th className="py-4 px-6 text-left text-pink-800 font-bold">Breakfast</th>
                  <th className="py-4 px-6 text-left text-pink-800 font-bold">Lunch</th>
                  <th className="py-4 px-6 text-left text-pink-800 font-bold">Dinner</th>
                  {dietPreferences.mealFrequency === "5" && (
                    <th className="py-4 px-6 text-left text-pink-800 font-bold">Snacks</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {mealPlanData.map((day, index) => (
                  <tr
                    key={day.day || `day-${index}`}
                    className={`${
                      index % 2 === 0 ? "bg-pink-50" : "bg-white"
                    } hover:bg-pink-100 transition-colors duration-300`}
                  >
                    <td className="py-4 px-6 border-t border-pink-100 font-medium text-pink-700">{day.day || `Day ${index + 1}`}</td>
                    <td className="py-4 px-6 border-t border-pink-100 text-gray-700">{day.breakfast || "Not specified"}</td>
                    <td className="py-4 px-6 border-t border-pink-100 text-gray-700">{day.lunch || "Not specified"}</td>
                    <td className="py-4 px-6 border-t border-pink-100 text-gray-700">{day.dinner || "Not specified"}</td>
                    {dietPreferences.mealFrequency === "5" && (
                      <td className="py-4 px-6 border-t border-pink-100 text-gray-700">{day.snacks || "Not specified"}</td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    } catch (error) {
      console.error("Error rendering meal plan:", error);

      const fallbackPlan = generateFallbackMealPlan();

      if (JSON.stringify(plan) === JSON.stringify(fallbackPlan)) {
        return (
          <div className="bg-pink-50 p-6 rounded-lg shadow-md border border-pink-200">
            <h2 className="text-xl font-semibold text-pink-700 mb-3">Your Meal Plan</h2>
            <p className="text-gray-700 mb-4">We encountered an issue displaying your meal plan in the proper format.</p>
            <p className="text-gray-700">Please try generating a new plan or contact support if the issue persists.</p>
          </div>
        );
      } else {
        return renderMealPlanTable(fallbackPlan);
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-xl border-2 border-pink-300 p-6">
      <h2 className="text-2xl font-bold text-pink-700 mb-4 text-center">
        7-Day PCOD-Friendly Meal Plan
      </h2>

      <div className="text-gray-700 mb-6">
        <p className="mb-4">
          Nutrition plays a crucial role in managing PCOD symptoms. Based on your PCOD probability of {pcodProbability}%, we can generate a customized meal plan that helps:
        </p>

        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Balance hormones naturally</li>
          <li>Reduce inflammation</li>
          <li>Stabilize blood sugar levels</li>
          <li>Support weight management</li>
        </ul>
      </div>

      {!showPlan && !showQuestionnaire && (
        <div className="text-center">
          <button
            onClick={startQuestionnaire}
            className="px-8 py-3 bg-pink-600 text-white rounded-full hover:bg-pink-700 transition-all duration-300 shadow-lg text-md font-semibold border-2 border-pink-300 flex items-center justify-center mx-auto"
          >
            Create Personalized Meal Plan
          </button>
        </div>
      )}

      {showQuestionnaire && (
        <div className="bg-pink-50 p-6 rounded-lg shadow-md border border-pink-200 mt-4">
          <h3 className="text-xl font-bold text-pink-700 mb-4">Personalize Your Meal Plan</h3>
          <form onSubmit={generateMealPlan} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Diet Type</label>
                <select 
                  name="dietType"
                  value={dietPreferences.dietType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  required
                >
                  <option value="vegetarian">Vegetarian</option>
                  <option value="vegan">Vegan</option>
                  <option value="non-vegetarian">Non-Vegetarian</option>
                  <option value="pescatarian">Pescatarian</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">Cuisine Preference</label>
                <select 
                  name="cuisinePreference"
                  value={dietPreferences.cuisinePreference}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  required
                >
                  <option value="indian">Indian</option>
                  <option value="mediterranean">Mediterranean</option>
                  <option value="asian">Asian</option>
                  <option value="continental">Continental</option>
                  <option value="mixed">Mixed</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">Diet Strictness</label>
                <select 
                  name="strictDiet"
                  value={dietPreferences.strictDiet}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  required
                >
                  <option value="strict">Strict (Closely follow the plan)</option>
                  <option value="moderate">Moderate (Some flexibility)</option>
                  <option value="flexible">Flexible (General guidelines)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">Meals Per Day</label>
                <select 
                  name="mealFrequency"
                  value={dietPreferences.mealFrequency}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  required
                >
                  <option value="3">3 meals per day</option>
                  <option value="5">5 meals per day (including snacks)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">Calorie Preference</label>
                <select 
                  name="caloriePreference"
                  value={dietPreferences.caloriePreference}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  required
                >
                  <option value="low">Low-Calorie (Weight loss focused)</option>
                  <option value="moderate">Moderate-Calorie (Balanced)</option>
                  <option value="high">High-Calorie (Weight gain focused)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">Sugar Limitation</label>
                <select 
                  name="sugarLimit"
                  value={dietPreferences.sugarLimit}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  required
                >
                  <option value="strict">Strict (Very low sugar)</option>
                  <option value="moderate">Moderate (Limited sugar)</option>
                  <option value="flexible">Flexible (Some natural sugars allowed)</option>
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-gray-700 font-medium mb-2">Allergies/Intolerances</label>
                <input 
                  type="text"
                  name="allergies"
                  value={dietPreferences.allergies}
                  onChange={handleInputChange}
                  placeholder="E.g., dairy, nuts, gluten (leave blank if none)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-gray-700 font-medium mb-2">Additional Requirements</label>
                <textarea 
                  name="additionalRequirements"
                  value={dietPreferences.additionalRequirements}
                  onChange={handleInputChange}
                  placeholder="Any other dietary preferences or restrictions?"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent h-24"
                ></textarea>
              </div>
            </div>
            
            <div className="flex justify-center space-x-4 mt-6">
              <button
                type="button"
                onClick={() => setShowQuestionnaire(false)}
                className="px-6 py-2 bg-gray-500 text-white rounded-full hover:bg-gray-600 transition-all duration-300 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-pink-600 text-white rounded-full hover:bg-pink-700 transition-all duration-300 shadow-lg text-md font-semibold border-2 border-pink-300 flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </>
                ) : (
                  "Generate Meal Plan"
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {showPlan && mealPlan && (
        <div className="mt-4">
          <h3 className="text-xl font-bold text-pink-700 mb-4 text-center">Your Personalized PCOD-Friendly Meal Plan</h3>
          {renderMealPlanTable(mealPlan)}
          <div className="mt-6 text-center">
            <button
              onClick={() => window.print()}
              className="px-6 py-2 mr-4 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-all duration-300 text-sm font-medium"
            >
              Print Meal Plan
            </button>
            <button
              onClick={() => {
                setShowPlan(false);
                setMealPlan(null);
              }}
              className="px-6 py-2 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition-all duration-300 text-sm font-medium"
            >
              Create Another Plan
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MealPlanComponent;
