import React, { useState } from "react";

const WorkoutPlanComponent = ({ pcodProbability }) => {
  const [loading, setLoading] = useState(false);
  const [workoutPlan, setWorkoutPlan] = useState(null);
  const [showPlan, setShowPlan] = useState(false);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [workoutPreferences, setWorkoutPreferences] = useState({
    fitnessLevel: "beginner",
    workoutDuration: "30",
    workoutFrequency: "3-4",
    workoutType: "mixed",
    workoutIntensity: "moderate",
    healthIssues: "",
    workoutLocation: "home",
    equipmentAccess: "minimal",
    specificGoals: "weight_management",
    additionalNotes: ""
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setWorkoutPreferences(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const startQuestionnaire = () => {
    setShowQuestionnaire(true);
  };

  const generateWorkoutPlan = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const apiKey = "AIzaSyBbRt9MNgYFRmQv_Ch1JBSdnXDaEZHhmSI";
      const endpoint =
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

      // Create a personalized prompt based on user preferences
      const prompt = `
Generate a structured 7-day workout plan for managing PCOD symptoms based on a PCOD probability of ${pcodProbability}% and the following user preferences:

User's workout preferences:
- Fitness level: ${workoutPreferences.fitnessLevel}
- Preferred workout duration: ${workoutPreferences.workoutDuration} minutes
- Workout frequency: ${workoutPreferences.workoutFrequency} days per week
- Preferred workout type: ${workoutPreferences.workoutType}
- Preferred intensity: ${workoutPreferences.workoutIntensity}
- Health issues/limitations: ${workoutPreferences.healthIssues || "None"}
- Workout location: ${workoutPreferences.workoutLocation}
- Equipment access: ${workoutPreferences.equipmentAccess}
- Specific goals: ${workoutPreferences.specificGoals.replace(/_/g, " ")}
- Additional notes: ${workoutPreferences.additionalNotes || "None"}

Output the plan as a JSON array with each day structured exactly as follows (make sure this is valid JSON with no extra text before or after):
[
  {
    "day": "Day 1",
    "type": "Type of exercise (e.g., Cardio, Yoga, Strength)",
    "duration": "Duration in minutes",
    "intensity": "Low/Moderate/High",
    "exercises": "List of specific exercises"
  },
  {
    "day": "Day 2",
    "type": "Type of exercise",
    "duration": "Duration in minutes",
    "intensity": "Intensity level",
    "exercises": "List of specific exercises"
  }
  ... and so on for 7 days
]

Focus on exercises that help with hormone balance, stress reduction, improved insulin sensitivity, and weight management. Ensure the plan is tailored to the user's preferences and limitations.`;

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
        try {
          // Clean the response - remove any markdown code blocks and trim whitespace
          const cleanedContent = planContent
            .replace(/```json|```/g, "")
            .trim();
          
          // Try to parse the JSON
          let parsedPlan;
          try {
            parsedPlan = JSON.parse(cleanedContent);
          } catch (jsonError) {
            // If direct parsing fails, try to extract JSON from the content
            const jsonMatch = cleanedContent.match(/\[\s*\{.*\}\s*\]/s);
            if (jsonMatch) {
              parsedPlan = JSON.parse(jsonMatch[0]);
            } else {
              throw new Error("Could not extract valid JSON from response");
            }
          }
          
          // Validate that we have a proper array with all required fields
          if (Array.isArray(parsedPlan) && parsedPlan.length > 0) {
            // Ensure all days have the required fields
            const validatedPlan = parsedPlan.map((day, index) => ({
              day: day.day || `Day ${index + 1}`,
              type: day.type || "Mixed",
              duration: day.duration || `${workoutPreferences.workoutDuration} minutes`,
              intensity: day.intensity || workoutPreferences.workoutIntensity,
              exercises: day.exercises || "Rest day"
            }));
            
            setWorkoutPlan(validatedPlan);
            setShowPlan(true);
            setShowQuestionnaire(false);
          } else {
            throw new Error("Response did not contain a valid workout plan array");
          }
        } catch (parseError) {
          console.error("Error parsing JSON workout plan:", parseError);
          
          // If JSON parsing fails, create a fallback workout plan
          const fallbackPlan = generateFallbackWorkoutPlan();
          setWorkoutPlan(fallbackPlan);
          setShowPlan(true);
          setShowQuestionnaire(false);
        }
      } else {
        throw new Error("No content received from API");
      }
    } catch (error) {
      console.error("Error generating workout plan:", error);
      
      // Generate a fallback plan if there's any error
      const fallbackPlan = generateFallbackWorkoutPlan();
      setWorkoutPlan(fallbackPlan);
      setShowPlan(true);
      setShowQuestionnaire(false);
    } finally {
      setLoading(false);
    }
  };

  // Create a fallback workout plan in case the API fails
  const generateFallbackWorkoutPlan = () => {
    const intensityLevel = workoutPreferences.workoutIntensity;
    const workoutType = workoutPreferences.workoutType;
    const duration = workoutPreferences.workoutDuration;
    
    const fallbackPlans = {
      // Day templates based on workout type
      cardio: [
        { day: "Day 1", type: "Cardio", duration: `${duration} minutes`, intensity: intensityLevel, exercises: "Walking, light jogging, or cycling" },
        { day: "Day 2", type: "Rest/Stretching", duration: "15 minutes", intensity: "Low", exercises: "Light stretching and yoga" },
        { day: "Day 3", type: "Cardio", duration: `${duration} minutes`, intensity: intensityLevel, exercises: "Swimming or elliptical training" },
        { day: "Day 4", type: "Active Recovery", duration: "20 minutes", intensity: "Low", exercises: "Walking and mobility exercises" },
        { day: "Day 5", type: "Cardio", duration: `${duration} minutes`, intensity: intensityLevel, exercises: "Brisk walking or cycling" },
        { day: "Day 6", type: "Cardio", duration: `${duration} minutes`, intensity: "Low to Moderate", exercises: "Dancing or low-impact aerobics" },
        { day: "Day 7", type: "Rest", duration: "0 minutes", intensity: "None", exercises: "Complete rest day" }
      ],
      strength: [
        { day: "Day 1", type: "Strength Training", duration: `${duration} minutes`, intensity: intensityLevel, exercises: "Lower body: Squats, lunges, glute bridges" },
        { day: "Day 2", type: "Rest/Light Cardio", duration: "15 minutes", intensity: "Low", exercises: "Light walking or stretching" },
        { day: "Day 3", type: "Strength Training", duration: `${duration} minutes`, intensity: intensityLevel, exercises: "Upper body: Push-ups, rows, shoulder presses" },
        { day: "Day 4", type: "Active Recovery", duration: "20 minutes", intensity: "Low", exercises: "Gentle yoga" },
        { day: "Day 5", type: "Strength Training", duration: `${duration} minutes`, intensity: intensityLevel, exercises: "Core: Planks, bird-dogs, dead bugs" },
        { day: "Day 6", type: "Strength Training", duration: `${duration} minutes`, intensity: intensityLevel, exercises: "Full body: Bodyweight circuit" },
        { day: "Day 7", type: "Rest", duration: "0 minutes", intensity: "None", exercises: "Complete rest day" }
      ],
      yoga: [
        { day: "Day 1", type: "Yoga", duration: `${duration} minutes`, intensity: "Low to Moderate", exercises: "Gentle flow yoga focusing on hip openers" },
        { day: "Day 2", type: "Yoga", duration: `${duration} minutes`, intensity: "Low", exercises: "Yin yoga and meditation" },
        { day: "Day 3", type: "Rest/Meditation", duration: "15 minutes", intensity: "Low", exercises: "Breathing exercises and meditation" },
        { day: "Day 4", type: "Yoga", duration: `${duration} minutes`, intensity: "Moderate", exercises: "Vinyasa flow with core focus" },
        { day: "Day 5", type: "Yoga", duration: `${duration} minutes`, intensity: "Low", exercises: "Restorative yoga with props" },
        { day: "Day 6", type: "Yoga", duration: `${duration} minutes`, intensity: "Moderate", exercises: "Power yoga" },
        { day: "Day 7", type: "Gentle Stretching", duration: "15 minutes", intensity: "Low", exercises: "Full body stretching" }
      ],
      mixed: [
        { day: "Day 1", type: "Cardio", duration: `${duration} minutes`, intensity: intensityLevel, exercises: "Walking, jogging, or cycling" },
        { day: "Day 2", type: "Strength Training", duration: `${duration} minutes`, intensity: intensityLevel, exercises: "Lower body strength exercises" },
        { day: "Day 3", type: "Rest/Active Recovery", duration: "15 minutes", intensity: "Low", exercises: "Light stretching or walking" },
        { day: "Day 4", type: "Yoga/Flexibility", duration: `${duration} minutes`, intensity: "Low to Moderate", exercises: "Yoga flow focusing on flexibility" },
        { day: "Day 5", type: "Strength Training", duration: `${duration} minutes`, intensity: intensityLevel, exercises: "Upper body and core exercises" },
        { day: "Day 6", type: "Cardio", duration: `${duration} minutes`, intensity: intensityLevel, exercises: "HIIT or steady state cardio (based on preference)" },
        { day: "Day 7", type: "Rest", duration: "0 minutes", intensity: "None", exercises: "Complete rest day" }
      ]
    };
    
    return fallbackPlans[workoutType] || fallbackPlans.mixed;
  };

  const renderWorkoutPlanTable = (plan) => {
    if (!plan || !Array.isArray(plan)) return null;

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg shadow-lg overflow-hidden">
          <thead className="bg-purple-200">
            <tr>
              <th className="py-4 px-6 text-left text-purple-800 font-bold">Day</th>
              <th className="py-4 px-6 text-left text-purple-800 font-bold">Type</th>
              <th className="py-4 px-6 text-left text-purple-800 font-bold">Duration</th>
              <th className="py-4 px-6 text-left text-purple-800 font-bold">Intensity</th>
              <th className="py-4 px-6 text-left text-purple-800 font-bold">Exercises</th>
            </tr>
          </thead>
          <tbody>
            {plan.map((day, index) => (
              <tr
                key={day.day}
                className={`${
                  index % 2 === 0 ? "bg-purple-50" : "bg-white"
                } hover:bg-purple-100 transition-colors duration-300`}
              >
                <td className="py-4 px-6 border-t border-purple-100 font-medium text-purple-700">{day.day}</td>
                <td className="py-4 px-6 border-t border-purple-100 text-gray-700">{day.type}</td>
                <td className="py-4 px-6 border-t border-purple-100 text-gray-700">{day.duration}</td>
                <td className="py-4 px-6 border-t border-purple-100 text-gray-700">{day.intensity || "Moderate"}</td>
                <td className="py-4 px-6 border-t border-purple-100 text-gray-700">{day.exercises}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-xl border-2 border-purple-300 p-6">
      <h2 className="text-2xl font-bold text-purple-700 mb-4 text-center">
        7-Day PCOD-Friendly Workout Plan
      </h2>

      <div className="text-gray-700 mb-6">
        <p className="mb-4">
          Regular exercise is crucial for managing PCOD symptoms. Based on your PCOD probability of {pcodProbability}%, we can generate a customized workout plan that helps:
        </p>

        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Improve insulin sensitivity</li>
          <li>Balance hormones naturally</li>
          <li>Reduce stress levels</li>
          <li>Support weight management</li>
        </ul>
      </div>

      {!showPlan && !showQuestionnaire && (
        <div className="text-center">
          <button
            onClick={startQuestionnaire}
            className="px-8 py-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-all duration-300 shadow-lg text-md font-semibold border-2 border-purple-300 flex items-center justify-center mx-auto"
          >
            Create Personalized Workout Plan
          </button>
        </div>
      )}

      {showQuestionnaire && (
        <div className="bg-purple-50 p-6 rounded-lg shadow-md border border-purple-200 mt-4">
          <h3 className="text-xl font-bold text-purple-700 mb-4">Personalize Your Workout Plan</h3>
          <form onSubmit={generateWorkoutPlan} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Fitness Level</label>
                <select 
                  name="fitnessLevel"
                  value={workoutPreferences.fitnessLevel}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                >
                  <option value="beginner">Beginner (New to exercise)</option>
                  <option value="intermediate">Intermediate (Some experience)</option>
                  <option value="advanced">Advanced (Regularly exercise)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">Workout Duration (per session)</label>
                <select 
                  name="workoutDuration"
                  value={workoutPreferences.workoutDuration}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                >
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">60 minutes</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">Workout Frequency</label>
                <select 
                  name="workoutFrequency"
                  value={workoutPreferences.workoutFrequency}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                >
                  <option value="2-3">2-3 days per week</option>
                  <option value="3-4">3-4 days per week</option>
                  <option value="5-6">5-6 days per week</option>
                  <option value="daily">Daily</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">Workout Type</label>
                <select 
                  name="workoutType"
                  value={workoutPreferences.workoutType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                >
                  <option value="cardio">Mostly Cardio</option>
                  <option value="strength">Mostly Strength</option>
                  <option value="yoga">Mostly Yoga/Flexibility</option>
                  <option value="mixed">Mixed (Balanced approach)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">Workout Intensity</label>
                <select 
                  name="workoutIntensity"
                  value={workoutPreferences.workoutIntensity}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                >
                  <option value="low">Low intensity</option>
                  <option value="moderate">Moderate intensity</option>
                  <option value="high">High intensity</option>
                  <option value="variable">Variable (mix of intensities)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">Workout Location</label>
                <select 
                  name="workoutLocation"
                  value={workoutPreferences.workoutLocation}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                >
                  <option value="home">Home workouts</option>
                  <option value="gym">Gym workouts</option>
                  <option value="outdoors">Outdoor workouts</option>
                  <option value="mixed">Mixed locations</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">Equipment Access</label>
                <select 
                  name="equipmentAccess"
                  value={workoutPreferences.equipmentAccess}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                >
                  <option value="none">No equipment</option>
                  <option value="minimal">Minimal equipment (resistance bands, light weights)</option>
                  <option value="moderate">Moderate equipment (dumbbells, kettlebells)</option>
                  <option value="full">Full gym equipment</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">Specific Goals</label>
                <select 
                  name="specificGoals"
                  value={workoutPreferences.specificGoals}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                >
                  <option value="weight_management">Weight management</option>
                  <option value="hormone_balance">Hormone balance</option>
                  <option value="stress_reduction">Stress reduction</option>
                  <option value="insulin_sensitivity">Improve insulin sensitivity</option>
                  <option value="overall_fitness">Overall fitness</option>
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-gray-700 font-medium mb-2">Health Issues or Limitations</label>
                <input 
                  type="text"
                  name="healthIssues"
                  value={workoutPreferences.healthIssues}
                  onChange={handleInputChange}
                  placeholder="E.g., knee problems, back pain, pregnancy (leave blank if none)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-gray-700 font-medium mb-2">Additional Notes</label>
                <textarea 
                  name="additionalNotes"
                  value={workoutPreferences.additionalNotes}
                  onChange={handleInputChange}
                  placeholder="Any other preferences or requirements for your workout plan?"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent h-24"
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
                className="px-8 py-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-all duration-300 shadow-lg text-md font-semibold border-2 border-purple-300 flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Generating...
                  </>
                ) : (
                  "Generate Workout Plan"
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {showPlan && workoutPlan && (
        <div className="mt-4">
          <h3 className="text-xl font-bold text-purple-700 mb-4 text-center">Your Personalized PCOD-Friendly Workout Plan</h3>
          {renderWorkoutPlanTable(workoutPlan)}
          <div className="mt-6 text-center">
            <button
              onClick={() => window.print()}
              className="px-6 py-2 mr-4 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-all duration-300 text-sm font-medium"
            >
              Print Workout Plan
            </button>
            <button
              onClick={() => {
                setShowPlan(false);
                setWorkoutPlan(null);
              }}
              className="px-6 py-2 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition-all duration-300 text-sm font-medium"
            >
              Create Another Plan
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutPlanComponent;