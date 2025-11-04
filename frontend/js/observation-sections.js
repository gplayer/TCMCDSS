// Observation Sections Configuration
// Defines all sections of Module 1 in clinical order

const OBSERVATION_SECTIONS = [
    {
        id: 'posture',
        title: 'Posture & Movement',
        icon: '🚶',
        fields: [
            {
                type: 'radio',
                name: 'overall_posture',
                label: 'Overall Posture',
                required: true,
                options: [
                    { value: 'upright', label: 'Upright, balanced, stable' },
                    { value: 'chest_forward', label: 'Chest and stomach projected forward' },
                    { value: 'stooped', label: 'Stooped/bent forward' },
                    { value: 'slumped', label: 'Slumped, shoulders rounded' },
                    { value: 'guarded', label: 'Guarded/protective posture' },
                    { value: 'tense', label: 'Tense, contracted' }
                ]
            },
            {
                type: 'radio',
                name: 'head_position',
                label: 'Head Position',
                options: [
                    { value: 'normal', label: 'Normal/centered' },
                    { value: 'leaning', label: 'Leaning to one side' },
                    { value: 'tilted_back', label: 'Tilted backwards' },
                    { value: 'rigid', label: 'Held rigidly' }
                ]
            }
        ]
    },
    {
        id: 'gait',
        title: 'Gait & Movement',
        icon: '👣',
        fields: [
            {
                type: 'radio',
                name: 'gait_pattern',
                label: 'Gait Pattern',
                required: true,
                options: [
                    { value: 'steady', label: 'Steady, normal gait' },
                    { value: 'festination', label: 'Festination (leaning forward, quick small steps)' },
                    { value: 'unstable', label: 'Unstable (raising leg high, dropping suddenly)' },
                    { value: 'staggering', label: 'Staggering (swaying side to side)' },
                    { value: 'shuffling', label: 'Shuffling (not lifting feet)' },
                    { value: 'limping', label: 'Limping/favoring one side' }
                ]
            },
            {
                type: 'radio',
                name: 'movement_quality',
                label: 'Movement Quality',
                options: [
                    { value: 'fluid', label: 'Fluid, balanced, harmonious' },
                    { value: 'restless', label: 'Restless, fidgety' },
                    { value: 'slow', label: 'Slow, sluggish' },
                    { value: 'stiff', label: 'Stiff, rigid' },
                    { value: 'quick', label: 'Quick, lively' }
                ]
            }
        ]
    },
    {
        id: 'body_type',
        title: 'Body Type & Constitution',
        icon: '👤',
        fields: [
            {
                type: 'radio',
                name: 'build',
                label: 'Overall Build',
                required: true,
                options: [
                    { value: 'robust', label: 'Robust (strong, large muscles)' },
                    { value: 'normal', label: 'Normal/Balanced' },
                    { value: 'thin', label: 'Thin (small frame)' },
                    { value: 'overweight', label: 'Overweight (loose muscles)' },
                    { value: 'compact', label: 'Compact (small skeleton, solid)' }
                ]
            },
            {
                type: 'radio',
                name: 'yin_yang_type',
                label: 'Yin-Yang Constitutional Type',
                options: [
                    { value: 'yang_abundant', label: 'Yang Abundant: Strong, assertive, likes cool' },
                    { value: 'yin_abundant', label: 'Yin Abundant: Quiet, prefers warmth' },
                    { value: 'yang_deficient', label: 'Yang Deficient: Pale, slow, cold' },
                    { value: 'yin_deficient', label: 'Yin Deficient: Thin, restless, red cheeks' },
                    { value: 'balanced', label: 'Balanced' }
                ]
            }
        ]
    },
    {
        id: 'shen',
        title: 'Shen (Spirit)',
        icon: '✨',
        fields: [
            {
                type: 'radio',
                name: 'overall',
                label: 'Overall Spirit Assessment',
                required: true,
                options: [
                    { value: 'strong', label: 'Strong Shen: Lively, bright eyes, clear, responsive' },
                    { value: 'weak', label: 'Weak Shen: Dull eyes, low energy, slow' },
                    { value: 'false', label: 'False Shen: Sudden improvement in severe illness ⚠️' }
                ]
            },
            {
                type: 'radio',
                name: 'eyes_luster',
                label: 'Eye Luster',
                options: [
                    { value: 'bright', label: 'Bright/Sparkling' },
                    { value: 'normal', label: 'Normal' },
                    { value: 'dull', label: 'Dull' },
                    { value: 'lifeless', label: 'Lifeless' }
                ]
            }
        ]
    },
    {
        id: 'complexion',
        title: 'Face & Complexion',
        icon: '👨',
        fields: [
            {
                type: 'radio',
                name: 'primary_color',
                label: 'Primary Facial Color',
                required: true,
                options: [
                    { value: 'normal', label: 'Normal (healthy)' },
                    { value: 'pale', label: 'White/Pale' },
                    { value: 'yellow', label: 'Yellow' },
                    { value: 'red', label: 'Red' },
                    { value: 'bluish', label: 'Bluish/Greenish' },
                    { value: 'purple', label: 'Purple' },
                    { value: 'dark', label: 'Dark/Black' }
                ]
            },
            {
                type: 'radio',
                name: 'shade',
                label: 'Shade/Quality (if not normal)',
                options: [
                    { value: 'bright', label: 'Bright' },
                    { value: 'dull', label: 'Dull' },
                    { value: 'sallow', label: 'Sallow' },
                    { value: 'malar_flush', label: 'Malar flush only' }
                ]
            },
            {
                type: 'radio',
                name: 'luster',
                label: 'Facial Luster',
                options: [
                    { value: 'shiny', label: 'Shiny/Lustrous' },
                    { value: 'normal', label: 'Normal' },
                    { value: 'dull', label: 'Dull' },
                    { value: 'withered', label: 'Withered/Very dry' }
                ]
            }
        ]
    },
    {
        id: 'tongue',
        title: 'Tongue Examination ⭐',
        icon: '👅',
        fields: [
            {
                type: 'radio',
                name: 'body_color',
                label: 'Tongue Body Color',
                required: true,
                options: [
                    { value: 'pale_red', label: 'Pale-Red (Normal)' },
                    { value: 'pale', label: 'Pale' },
                    { value: 'red', label: 'Red' },
                    { value: 'dark_red', label: 'Dark Red' },
                    { value: 'purple', label: 'Purple' },
                    { value: 'blue', label: 'Blue' }
                ]
            },
            {
                type: 'radio',
                name: 'body_shape',
                label: 'Tongue Body Shape',
                options: [
                    { value: 'normal', label: 'Normal' },
                    { value: 'thin', label: 'Thin' },
                    { value: 'swollen', label: 'Swollen' }
                ]
            },
            {
                type: 'checkbox',
                name: 'features',
                label: 'Special Features (check all that apply)',
                options: [
                    { value: 'tooth_marked', label: 'Tooth-marked edges' },
                    { value: 'cracks', label: 'Cracks' },
                    { value: 'red_points', label: 'Red points' },
                    { value: 'purple_spots', label: 'Purple spots' },
                    { value: 'red_sides', label: 'Red sides' },
                    { value: 'red_tip', label: 'Red tip' },
                    { value: 'red_center', label: 'Red center' }
                ]
            },
            {
                type: 'radio',
                name: 'moisture',
                label: 'Tongue Moisture',
                options: [
                    { value: 'normal', label: 'Normal moisture' },
                    { value: 'dry', label: 'Dry' },
                    { value: 'wet', label: 'Wet' },
                    { value: 'very_wet', label: 'Excessively wet' }
                ]
            },
            {
                type: 'radio',
                name: 'coating_thickness',
                label: 'Coating Thickness',
                required: true,
                options: [
                    { value: 'none', label: 'No coating' },
                    { value: 'thin', label: 'Thin coating' },
                    { value: 'thick', label: 'Thick coating' },
                    { value: 'peeled', label: 'Partially peeled' }
                ]
            },
            {
                type: 'radio',
                name: 'coating_color',
                label: 'Coating Color',
                options: [
                    { value: 'white', label: 'White' },
                    { value: 'yellow', label: 'Yellow' },
                    { value: 'gray', label: 'Gray' },
                    { value: 'brown', label: 'Brown' },
                    { value: 'black', label: 'Black' }
                ]
            },
            {
                type: 'radio',
                name: 'coating_quality',
                label: 'Coating Quality',
                options: [
                    { value: 'normal', label: 'Normal' },
                    { value: 'greasy', label: 'Sticky/Greasy' },
                    { value: 'dry', label: 'Dry' }
                ]
            },
            {
                type: 'textarea',
                name: 'notes',
                label: 'Additional Tongue Observations'
            }
        ]
    },
    {
        id: 'eyes',
        title: 'Eyes',
        icon: '👁️',
        fields: [
            {
                type: 'radio',
                name: 'sclera_color',
                label: 'Sclera Color',
                options: [
                    { value: 'white', label: 'White/Clear (normal)' },
                    { value: 'red', label: 'Red/Bloodshot' },
                    { value: 'yellow', label: 'Yellow (jaundice)' },
                    { value: 'dark', label: 'Dark/Dull' }
                ]
            },
            {
                type: 'checkbox',
                name: 'features',
                label: 'Eye Features',
                options: [
                    { value: 'dry', label: 'Dry eyes' },
                    { value: 'discharge', label: 'Excessive tearing/discharge' },
                    { value: 'swollen_lids', label: 'Swollen eyelids' },
                    { value: 'dark_circles', label: 'Dark circles/eye bags' }
                ]
            }
        ]
    },
    {
        id: 'ears_nose',
        title: 'Ears & Nose',
        icon: '👂',
        fields: [
            {
                type: 'radio',
                name: 'ear_color',
                label: 'Ear Color (if visible)',
                options: [
                    { value: 'normal', label: 'Normal' },
                    { value: 'pale', label: 'Pale' },
                    { value: 'red', label: 'Red' },
                    { value: 'yellow', label: 'Yellow' },
                    { value: 'dark', label: 'Dark/Purple' }
                ]
            },
            {
                type: 'radio',
                name: 'nose_color',
                label: 'Nose Color',
                options: [
                    { value: 'normal', label: 'Normal' },
                    { value: 'pale', label: 'Pale' },
                    { value: 'red', label: 'Red' },
                    { value: 'yellow', label: 'Yellow' }
                ]
            }
        ]
    },
    {
        id: 'hair_nails',
        title: 'Hair & Nails',
        icon: '💅',
        fields: [
            {
                type: 'radio',
                name: 'hair_quality',
                label: 'Hair Quality',
                options: [
                    { value: 'normal', label: 'Normal (lustrous, strong)' },
                    { value: 'dry', label: 'Dry, brittle' },
                    { value: 'greasy', label: 'Greasy/oily' },
                    { value: 'withered', label: 'Withered' }
                ]
            },
            {
                type: 'radio',
                name: 'nail_color',
                label: 'Nail Color',
                options: [
                    { value: 'pink', label: 'Healthy pink' },
                    { value: 'pale', label: 'Pale-white' },
                    { value: 'red', label: 'Red' },
                    { value: 'purple', label: 'Blue/Purple' },
                    { value: 'yellow', label: 'Yellow' }
                ]
            },
            {
                type: 'checkbox',
                name: 'nail_features',
                label: 'Nail Features',
                options: [
                    { value: 'ridged', label: 'Ridged (longitudinal)' },
                    { value: 'brittle', label: 'Thin, brittle' },
                    { value: 'thick', label: 'Thickened' }
                ]
            }
        ]
    },
    {
        id: 'hands_arms',
        title: 'Hands & Arms',
        icon: '🤚',
        fields: [
            {
                type: 'radio',
                name: 'hand_color',
                label: 'Hand Color',
                options: [
                    { value: 'pink', label: 'Healthy pink' },
                    { value: 'pale', label: 'Pale' },
                    { value: 'red', label: 'Red (dorsum or palms)' },
                    { value: 'purple', label: 'Blue/Purple' }
                ]
            },
            {
                type: 'radio',
                name: 'hand_temperature',
                label: 'Hand Temperature',
                required: true,
                options: [
                    { value: 'warm', label: 'Warm (normal)' },
                    { value: 'cold', label: 'Cold hands' },
                    { value: 'hot', label: 'Hot hands' },
                    { value: 'hot_palms', label: 'Hot palms specifically' },
                    { value: 'clammy', label: 'Clammy/sweaty palms' }
                ]
            }
        ]
    },
    {
        id: 'legs_feet',
        title: 'Legs & Feet',
        icon: '🦵',
        fields: [
            {
                type: 'radio',
                name: 'foot_temperature',
                label: 'Foot Temperature',
                required: true,
                options: [
                    { value: 'warm', label: 'Warm (normal)' },
                    { value: 'cold', label: 'Cold feet/legs' },
                    { value: 'hot', label: 'Hot feet/soles' }
                ]
            },
            {
                type: 'checkbox',
                name: 'features',
                label: 'Leg/Foot Features',
                options: [
                    { value: 'swelling', label: 'Swelling/Edema' },
                    { value: 'varicose', label: 'Varicose veins' }
                ]
            }
        ]
    },
    {
        id: 'skin',
        title: 'Skin Overall',
        icon: '🩹',
        fields: [
            {
                type: 'radio',
                name: 'texture',
                label: 'Skin Texture',
                options: [
                    { value: 'normal', label: 'Smooth, appropriate moisture' },
                    { value: 'dry', label: 'Dry, rough' },
                    { value: 'greasy', label: 'Moist, greasy, puffy' },
                    { value: 'oily', label: 'Oily' }
                ]
            },
            {
                type: 'checkbox',
                name: 'lesions',
                label: 'Visible Skin Lesions/Rashes',
                options: [
                    { value: 'none', label: 'Clear skin' },
                    { value: 'rash', label: 'Red rash/patches' },
                    { value: 'papules', label: 'Papules (raised bumps)' },
                    { value: 'vesicles', label: 'Vesicles (fluid-filled)' }
                ]
            }
        ]
    }
];
