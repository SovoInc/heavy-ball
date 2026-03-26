pub struct AchievementDef {
    pub name: &'static str,
    pub display_name: &'static str,
    pub description: &'static str,
    pub category: &'static str,
    pub score: i64,
    pub total: Option<f64>,
}

pub const FIRST_FINISH: &str = "first_finish";
pub const SPEED_DEMON: &str = "speed_demon";
pub const BOX_SMASHER: &str = "box_smasher";
pub const POWER_COLLECTOR: &str = "power_collector";
pub const COMPLETIONIST: &str = "completionist";
pub const NO_FALL: &str = "no_fall";
pub const FIRE_MAXED: &str = "fire_maxed";
pub const ICE_MAXED: &str = "ice_maxed";
pub const GETTING_STARTED: &str = "getting_started";
pub const HALFWAY_THERE: &str = "halfway_there";
pub const PERSISTENT: &str = "persistent";
pub const DEMOLITION_EXPERT: &str = "demolition_expert";
pub const TEMPERED: &str = "tempered";

pub const ACHIEVEMENTS: &[AchievementDef] = &[
    AchievementDef {
        name: FIRST_FINISH,
        display_name: "First Finish",
        description: "Complete any level.",
        category: "Beginner",
        score: 10,
        total: None,
    },
    AchievementDef {
        name: GETTING_STARTED,
        display_name: "Getting Started",
        description: "Complete 10 levels.",
        category: "Bronze",
        score: 15,
        total: Some(10.0),
    },
    AchievementDef {
        name: SPEED_DEMON,
        display_name: "Speed Demon",
        description: "Complete any level in under 10 seconds.",
        category: "Gold",
        score: 100,
        total: Some(10000.0),
    },
    AchievementDef {
        name: BOX_SMASHER,
        display_name: "Box Smasher",
        description: "Break 50 boxes total across all levels.",
        category: "Bronze",
        score: 25,
        total: Some(50.0),
    },
    AchievementDef {
        name: DEMOLITION_EXPERT,
        display_name: "Demolition Expert",
        description: "Break 200 boxes total across all levels.",
        category: "Gold",
        score: 75,
        total: Some(200.0),
    },
    AchievementDef {
        name: POWER_COLLECTOR,
        display_name: "Power Collector",
        description: "Collect 25 power-ups total across all levels.",
        category: "Bronze",
        score: 25,
        total: Some(25.0),
    },
    AchievementDef {
        name: HALFWAY_THERE,
        display_name: "Halfway There",
        description: "Complete 50 levels.",
        category: "Silver",
        score: 50,
        total: Some(50.0),
    },
    AchievementDef {
        name: COMPLETIONIST,
        display_name: "Completionist",
        description: "Complete all 100 levels.",
        category: "Diamond",
        score: 150,
        total: Some(100.0),
    },
    AchievementDef {
        name: NO_FALL,
        display_name: "No Fall",
        description: "Complete a level without falling.",
        category: "Silver",
        score: 50,
        total: None,
    },
    AchievementDef {
        name: PERSISTENT,
        display_name: "Persistent",
        description: "Fall 100 times total across all levels.",
        category: "Bronze",
        score: 25,
        total: Some(100.0),
    },
    AchievementDef {
        name: FIRE_MAXED,
        display_name: "Overheated",
        description: "Reach maximum fire buildup in a single level.",
        category: "Silver",
        score: 50,
        total: None,
    },
    AchievementDef {
        name: ICE_MAXED,
        display_name: "Frozen Solid",
        description: "Get frozen by reaching maximum ice buildup.",
        category: "Silver",
        score: 50,
        total: None,
    },
    AchievementDef {
        name: TEMPERED,
        display_name: "Tempered",
        description: "Max out both fire and ice buildup in the same level.",
        category: "Gold",
        score: 100,
        total: None,
    },
];
