// Module 2: Interrogation (Ten Questions) - Structured Clinical Interview

const INTERROGATION_SECTIONS = [
    {
        id: 'chills-fever',
        title: '1. Chills and Fever',
        description: 'Temperature regulation and exterior patterns',
        fields: [
            {
                id: 'fever_present',
                label: 'Fever',
                type: 'select',
                options: ['None', 'Slight', 'Moderate', 'High', 'Intermittent', 'Low-grade chronic'],
                weight: 0.7
            },
            {
                id: 'chills_present',
                label: 'Chills',
                type: 'select',
                options: ['None', 'Aversion to cold', 'Feeling of cold', 'Severe chills'],
                weight: 0.7
            },
            {
                id: 'fever_timing',
                label: 'Fever Pattern',
                type: 'select',
                options: ['Not applicable', 'Afternoon/evening', 'Morning', 'Night', 'Tidal fever', 'Constant'],
                weight: 0.6
            },
            {
                id: 'sweating_with_fever',
                label: 'Sweating with Fever',
                type: 'select',
                options: ['No sweating', 'Sweating relieves fever', 'Sweating without relief', 'Night sweats'],
                weight: 0.6
            }
        ]
    },
    {
        id: 'perspiration',
        title: '2. Perspiration',
        description: 'Sweating patterns and characteristics',
        fields: [
            {
                id: 'sweating_pattern',
                label: 'Sweating Pattern',
                type: 'select',
                options: ['Normal', 'No sweating', 'Spontaneous sweating', 'Night sweats', 'Excessive sweating', 'Sweating on exertion'],
                weight: 0.7
            },
            {
                id: 'sweating_timing',
                label: 'When Does Sweating Occur',
                type: 'multiselect',
                options: ['During day', 'At night', 'With activity', 'At rest', 'Head/upper body only', 'Whole body'],
                weight: 0.6
            },
            {
                id: 'sweat_quality',
                label: 'Quality of Sweat',
                type: 'select',
                options: ['Normal', 'Sticky/greasy', 'Profuse/watery', 'Slight', 'Cold sweat', 'Smelly'],
                weight: 0.5
            }
        ]
    },
    {
        id: 'head-body',
        title: '3. Head and Body',
        description: 'Head sensations, dizziness, and body aches',
        fields: [
            {
                id: 'headache',
                label: 'Headache',
                type: 'select',
                options: ['None', 'Occasional', 'Frequent', 'Chronic', 'Severe'],
                weight: 0.6
            },
            {
                id: 'headache_location',
                label: 'Headache Location',
                type: 'multiselect',
                options: ['Temples', 'Forehead', 'Top of head', 'Occiput', 'One-sided', 'Whole head', 'Behind eyes'],
                weight: 0.7
            },
            {
                id: 'headache_quality',
                label: 'Headache Quality',
                type: 'multiselect',
                options: ['Dull ache', 'Throbbing', 'Stabbing', 'Heavy/pressure', 'Distending', 'Empty feeling'],
                weight: 0.7
            },
            {
                id: 'dizziness',
                label: 'Dizziness/Vertigo',
                type: 'select',
                options: ['None', 'Occasional lightheadedness', 'Frequent dizziness', 'Vertigo (spinning)', 'On standing', 'Constant'],
                weight: 0.7
            },
            {
                id: 'body_aches',
                label: 'Body Aches',
                type: 'multiselect',
                options: ['None', 'Shoulders', 'Back', 'Limbs', 'Joints', 'Muscles', 'Generalized'],
                weight: 0.6
            },
            {
                id: 'heaviness',
                label: 'Feeling of Heaviness',
                type: 'select',
                options: ['None', 'Slight', 'Moderate', 'Severe', 'Head heavy', 'Body heavy', 'Limbs heavy'],
                weight: 0.6
            }
        ]
    },
    {
        id: 'stools-urine',
        title: '4. Stools and Urine',
        description: 'Bowel and bladder function',
        fields: [
            {
                id: 'bowel_frequency',
                label: 'Bowel Movement Frequency',
                type: 'select',
                options: ['1-2 times daily', '3+ times daily', 'Every 2-3 days', 'Less than twice weekly', 'Irregular'],
                weight: 0.7
            },
            {
                id: 'stool_consistency',
                label: 'Stool Consistency',
                type: 'select',
                options: ['Normal/formed', 'Loose/watery', 'Dry/hard', 'First hard then loose', 'Undigested food'],
                weight: 0.8
            },
            {
                id: 'stool_characteristics',
                label: 'Stool Characteristics',
                type: 'multiselect',
                options: ['Normal color', 'Dark/black', 'Pale', 'Greasy/sticky', 'Mucus', 'Blood', 'Foul smelling'],
                weight: 0.7
            },
            {
                id: 'bowel_sensations',
                label: 'Bowel Sensations',
                type: 'multiselect',
                options: ['Normal', 'Incomplete evacuation', 'Urgency', 'Pain/cramping', 'Burning', 'Bloating before BM'],
                weight: 0.6
            },
            {
                id: 'urination_frequency',
                label: 'Urination Frequency',
                type: 'select',
                options: ['Normal (4-7x/day)', 'Frequent (8+/day)', 'Infrequent (1-3x/day)', 'Night urination (2+)', 'Urgent'],
                weight: 0.7
            },
            {
                id: 'urine_characteristics',
                label: 'Urine Characteristics',
                type: 'multiselect',
                options: ['Normal/clear', 'Dark/concentrated', 'Pale/copious', 'Cloudy', 'Scanty', 'Strong odor', 'Burning'],
                weight: 0.7
            }
        ]
    },
    {
        id: 'thirst-appetite',
        title: '5. Thirst and Appetite',
        description: 'Food and fluid intake patterns',
        fields: [
            {
                id: 'thirst',
                label: 'Thirst',
                type: 'select',
                options: ['Normal', 'No thirst', 'Thirsty but drinks little', 'Very thirsty with large drinks', 'Prefers warm drinks', 'Prefers cold drinks', 'Dry mouth no desire to drink'],
                weight: 0.8
            },
            {
                id: 'appetite',
                label: 'Appetite',
                type: 'select',
                options: ['Normal', 'No appetite', 'Poor appetite', 'Excessive hunger', 'Hungry but can\'t eat much', 'Hungry soon after eating'],
                weight: 0.7
            },
            {
                id: 'taste',
                label: 'Taste in Mouth',
                type: 'multiselect',
                options: ['Normal', 'Bitter', 'Sweet/sticky', 'Sour', 'Bland/no taste', 'Metallic', 'Salty'],
                weight: 0.6
            },
            {
                id: 'food_preferences',
                label: 'Food Preferences/Aversions',
                type: 'multiselect',
                options: ['Prefers warm food', 'Prefers cold food', 'Craves sweet', 'Craves salty', 'Craves sour', 'Aversion to greasy foods'],
                weight: 0.5
            }
        ]
    },
    {
        id: 'chest-abdomen',
        title: '6. Chest and Abdomen',
        description: 'Sensations and discomfort in torso',
        fields: [
            {
                id: 'chest_sensations',
                label: 'Chest Sensations',
                type: 'multiselect',
                options: ['None', 'Tightness', 'Oppression/fullness', 'Pain', 'Palpitations', 'Distension'],
                weight: 0.7
            },
            {
                id: 'breathing',
                label: 'Breathing',
                type: 'select',
                options: ['Normal', 'Shortness of breath on exertion', 'Shortness of breath at rest', 'Difficulty inhaling', 'Difficulty exhaling', 'Wheezing'],
                weight: 0.7
            },
            {
                id: 'abdominal_sensations',
                label: 'Abdominal Sensations',
                type: 'multiselect',
                options: ['None', 'Distension/bloating', 'Pain', 'Fullness after eating', 'Cold sensation', 'Burning', 'Gurgling sounds'],
                weight: 0.7
            },
            {
                id: 'abdominal_pain_quality',
                label: 'If Abdominal Pain - Quality',
                type: 'multiselect',
                options: ['Not applicable', 'Dull ache', 'Sharp/stabbing', 'Cramping', 'Better with pressure', 'Worse with pressure', 'Better with warmth'],
                weight: 0.7
            },
            {
                id: 'epigastric_sensations',
                label: 'Epigastric (Upper Abdomen) Sensations',
                type: 'multiselect',
                options: ['None', 'Fullness', 'Pain', 'Burning', 'Acid reflux', 'Nausea'],
                weight: 0.6
            }
        ]
    },
    {
        id: 'hearing-ears',
        title: '7. Hearing and Ears',
        description: 'Ear and hearing issues',
        fields: [
            {
                id: 'hearing',
                label: 'Hearing',
                type: 'select',
                options: ['Normal', 'Slight hearing loss', 'Significant hearing loss', 'Sudden hearing loss', 'Gradual decline'],
                weight: 0.6
            },
            {
                id: 'tinnitus',
                label: 'Tinnitus (Ear Ringing)',
                type: 'select',
                options: ['None', 'Occasional', 'Frequent', 'Constant', 'High-pitched', 'Low-pitched/rumbling'],
                weight: 0.7
            },
            {
                id: 'ear_sensations',
                label: 'Ear Sensations',
                type: 'multiselect',
                options: ['None', 'Fullness/blocked', 'Pain', 'Itching', 'Discharge', 'Sensitivity to sound'],
                weight: 0.5
            }
        ]
    },
    {
        id: 'sleep',
        title: '8. Sleep',
        description: 'Sleep quality and patterns',
        fields: [
            {
                id: 'sleep_quality',
                label: 'Sleep Quality',
                type: 'select',
                options: ['Good/restful', 'Light/easily disturbed', 'Poor quality', 'Difficulty falling asleep', 'Difficulty staying asleep', 'Wakes early'],
                weight: 0.7
            },
            {
                id: 'sleep_duration',
                label: 'Sleep Duration',
                type: 'select',
                options: ['7-8 hours', 'Less than 6 hours', 'More than 9 hours', 'Varies greatly'],
                weight: 0.5
            },
            {
                id: 'sleep_issues',
                label: 'Sleep Issues',
                type: 'multiselect',
                options: ['None', 'Dream-disturbed sleep', 'Nightmares', 'Sleep talking', 'Restless legs', 'Night sweats', 'Need to urinate'],
                weight: 0.6
            },
            {
                id: 'waking_feeling',
                label: 'Feeling Upon Waking',
                type: 'select',
                options: ['Refreshed', 'Tired/unrefreshed', 'Groggy/heavy', 'Anxious', 'Stiff/achy'],
                weight: 0.5
            }
        ]
    },
    {
        id: 'emotional-mental',
        title: '9. Emotions and Mental State',
        description: 'Emotional and psychological patterns',
        fields: [
            {
                id: 'mood',
                label: 'General Mood',
                type: 'multiselect',
                options: ['Stable', 'Irritable', 'Anxious/worried', 'Sad/depressed', 'Frustrated', 'Angry', 'Fearful', 'Restless'],
                weight: 0.7
            },
            {
                id: 'stress_response',
                label: 'Response to Stress',
                type: 'multiselect',
                options: ['Handles well', 'Becomes anxious', 'Becomes angry', 'Withdraws', 'Physical symptoms', 'Sleep issues'],
                weight: 0.6
            },
            {
                id: 'thinking',
                label: 'Thinking/Concentration',
                type: 'multiselect',
                options: ['Clear', 'Poor concentration', 'Foggy/unclear', 'Overthinking', 'Poor memory', 'Scattered thoughts'],
                weight: 0.6
            },
            {
                id: 'emotional_triggers',
                label: 'What Affects Your Emotions Most',
                type: 'multiselect',
                options: ['Work stress', 'Relationship issues', 'Financial concerns', 'Health worries', 'Family matters', 'Seasonal changes'],
                weight: 0.4
            }
        ]
    },
    {
        id: 'energy-vitality',
        title: '10. Energy and Vitality',
        description: 'Overall energy levels and patterns',
        fields: [
            {
                id: 'energy_level',
                label: 'Overall Energy Level',
                type: 'select',
                options: ['Good/strong', 'Moderate', 'Low/fatigued', 'Varies greatly', 'Exhausted'],
                weight: 0.8
            },
            {
                id: 'energy_pattern',
                label: 'Energy Pattern During Day',
                type: 'select',
                options: ['Consistent', 'Worse in morning', 'Worse in afternoon', 'Worse in evening', 'Crashes after meals', 'Better after rest'],
                weight: 0.7
            },
            {
                id: 'physical_capacity',
                label: 'Physical Capacity',
                type: 'select',
                options: ['Normal activity', 'Reduced stamina', 'Easily fatigued', 'Weak limbs', 'Needs frequent rest', 'Cannot do usual activities'],
                weight: 0.7
            },
            {
                id: 'voice_strength',
                label: 'Voice Strength',
                type: 'select',
                options: ['Strong', 'Normal', 'Weak/soft', 'Gets tired with talking', 'Hoarse'],
                weight: 0.6
            },
            {
                id: 'recovery',
                label: 'Recovery from Illness/Exertion',
                type: 'select',
                options: ['Quick recovery', 'Normal recovery', 'Slow recovery', 'Very slow recovery', 'Frequent relapses'],
                weight: 0.6
            }
        ]
    },
    {
        id: 'pain-sensations',
        title: 'Additional: Pain and Sensations',
        description: 'Location and quality of pain or discomfort',
        fields: [
            {
                id: 'pain_locations',
                label: 'Pain Locations',
                type: 'multiselect',
                options: ['None', 'Head', 'Neck', 'Shoulders', 'Back', 'Chest', 'Abdomen', 'Hips', 'Knees', 'Ankles', 'Hands', 'Feet'],
                weight: 0.5
            },
            {
                id: 'pain_quality',
                label: 'Pain Quality',
                type: 'multiselect',
                options: ['Not applicable', 'Dull ache', 'Sharp/stabbing', 'Burning', 'Heavy', 'Distending', 'Fixed location', 'Moving pain'],
                weight: 0.7
            },
            {
                id: 'pain_triggers',
                label: 'What Affects Pain',
                type: 'multiselect',
                options: ['Not applicable', 'Better with rest', 'Worse with activity', 'Better with movement', 'Better with warmth', 'Better with cold', 'Better with pressure', 'Worse with pressure'],
                weight: 0.6
            }
        ]
    },
    {
        id: 'womens-health',
        title: 'Additional: Women\'s Health',
        description: 'Menstrual and reproductive health (if applicable)',
        fields: [
            {
                id: 'applicable',
                label: 'Is this section applicable?',
                type: 'select',
                options: ['Not applicable', 'Yes - premenopausal', 'Yes - postmenopausal', 'Yes - pregnant'],
                weight: 0.0
            },
            {
                id: 'cycle_regularity',
                label: 'Menstrual Cycle Regularity',
                type: 'select',
                options: ['Not applicable', 'Regular', 'Irregular', 'Early', 'Late', 'Amenorrhea (absent)'],
                weight: 0.7
            },
            {
                id: 'flow_quality',
                label: 'Menstrual Flow',
                type: 'multiselect',
                options: ['Not applicable', 'Normal', 'Scanty', 'Heavy', 'Clots', 'Dark blood', 'Pale blood', 'Prolonged'],
                weight: 0.7
            },
            {
                id: 'cycle_symptoms',
                label: 'Menstrual Symptoms',
                type: 'multiselect',
                options: ['Not applicable', 'None', 'Cramping', 'Breast tenderness', 'Mood changes', 'Headaches', 'Fatigue', 'Bloating'],
                weight: 0.6
            },
            {
                id: 'pms_timing',
                label: 'PMS Symptoms Timing',
                type: 'select',
                options: ['Not applicable', 'None', 'Week before', 'Few days before', 'During period', 'Throughout cycle'],
                weight: 0.5
            }
        ]
    }
];

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = INTERROGATION_SECTIONS;
}