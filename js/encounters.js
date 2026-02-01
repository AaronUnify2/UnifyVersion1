// ============================================
// ENCOUNTER SYSTEM
// ============================================
// Modular encounter system for Mystic Forest Walker
// Handles: Princess Tower, Sword in Stone, Witch Hut, Cloud Arena, Treasure Chests
//
// REQUIRED: Include this script AFTER enemies.js in Forest2.html
// Add: <script src="js/encounters.js"></script>
//
// INTEGRATION NEEDED in Forest2.html:
// 1. Call initEncounterSystem() in init()
// 2. Call updateEncounterSystem() in animate() loop
// 3. Call resetEncounterSystem() in restartGame()
// ============================================

// ============================================
// PIXEL TEXTURE HELPER (needed for texture creation)
// ============================================
function createPixelTexture(width, height, drawFunc) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    drawFunc(ctx, width, height);
    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    return texture;
}

// ============================================
// ENCOUNTER SYSTEM STATE
// ============================================
const encounterState = {
    // Current active encounter
    currentEncounter: null,
    encounterGuards: [],
    
    // Treasure chests
    treasureChests: [],
    
    // Cloud Arena
    cloudPortal: null,
    portalParticles: [],
    inCloudArena: false,
    arenaBosses: [],
    arenaEnemies: [],
    arenaStage: 0, // 0=Cloud Sprites, 1=Giant Troll, 2=Ghost Trio, 3=completed
    savedForestPosition: null,
    pendingArenaExit: false,
    
    // Giant Troll specific (stage 1)
    trollClubs: [],
    trollProjectiles: [],
    
    // Arena decorations (clouds and grass)
    arenaDecorations: [],
    
    // Ghost stage tracking (stage 2)
    ghostDefeated: false,
    
    // Forest cloud sprites (spawn when portal appears)
    forestCloudSprites: [],
    
    // ===========================================
    // SEQUENTIAL STORY SYSTEM
    // ===========================================
    // Master story progression tracker
    storyStage: 0,
    
    // Dharma wheel wizards (for Dharmachakra encounter)
    wizardWheels: [], // Orbiting wheels on wizards
    
    // Player's dharma wheel (reward from completing Dharmachakra)
    playerDharmaWheel: null,
    
    // Bonus swords from Land Giant (3 swords on outer ring)
    bonusSwords: [], // Array of 3 sword sprites
    hasBonusSwords: false,
    
    // Land Giant boss (for Sword in Stone Act 3)
    landGiant: null,
    
    // Saved environment for arena restoration
    savedGroundMaterial: null,
    savedFogColor: null,
    
    // Guaranteed encounter queue (level-triggered) - legacy, kept for compatibility
    guaranteedEncounterQueue: [],
    
    // Textures (initialized on load)
    textures: {}
};

// ===========================================
// STORY SEQUENCE DEFINITION
// ===========================================
// The fixed order of story events in the game
// Each entry is either:
//   - A string: the encounter template name to spawn
//   - 'cloudPortal': spawns the cloud portal (player enters for arena stages)
//   - 'monsterStore': spawns the monster store
const STORY_SEQUENCE = [
    'swordInStone',        // 0: Act 1 - Goblin's Ambition
    'boss_troll',          // 1: Troll Boss
    'princessTower',       // 2: Princess Tower
    'boss_tree',           // 3: Evil Tree Boss
    'monsterStore',        // 4: Monster Store
    'boss_dragon',         // 5: Dragon Boss
    'witchHut',            // 6: Witch's Cottage
    'boss_troll',          // 7: Troll Boss
    'swordInStoneAct2',    // 8: Act 2 - The Bribe (Missing Sword)
    'boss_tree',           // 9: Evil Tree Boss
    'dharmachakra',        // 10: Dogmatic Buddhists
    'boss_dragon',         // 11: Dragon Boss
    'monsterStore',        // 12: Monster Store
    'boss_troll',          // 13: Troll Boss
    'swordInStoneAct3',    // 14: Act 3 - Land Giant Boss
    'boss_tree',           // 15: Evil Tree Boss
    'cloudPortal',         // 16: Cloud Portal (leads to Sky Giant Pets - Stage 0)
    'boss_dragon',         // 17: Dragon Boss
    'cloudPortal',         // 18: Cloud Portal (leads to Giant Troll - Stage 1)
    'boss_troll',          // 19: Troll Boss
    'monsterStore',        // 20: Monster Store
    'boss_tree',           // 21: Evil Tree Boss
    'cloudPortal',         // 22: Cloud Portal (leads to Ghost Trio - Stage 2)
    'storyComplete'        // 23: Story complete - return to random encounters
];

// ============================================
// ENCOUNTER TEMPLATE DEFINITIONS
// ============================================
const ENCOUNTER_TEMPLATES = {
    princessTower: {
        name: 'princessTower',
        displayName: 'Princess Tower',
        textureKey: 'princessTower',
        scale: [8, 16],
        
        // Guard configuration - references enemy types from enemies.js
        guards: {
            type: 'goldenSkeleton', // Custom texture, not from enemies.js
            count: 15,
            healthMultiplier: 2,
            customTexture: true // Indicates we use our own texture
        },
        
        cameraZoom: 2.5,
        
        // Reward configuration
        reward: {
            type: 'upgrade',
            upgrade: 'magnet',
            text: '🧲 MAGNET UPGRADED!'
        },
        
        // Level requirements
        minLevel: 5,
        maxLevel: 999,
        
        // Base spawn weight (higher = more common)
        spawnWeight: 1,
        
        // NPC configuration
        npc: {
            textureKey: 'princess',
            scale: [2.5, 4],
            walksToPlayer: true,
            dialogue: null, // Princess shows heart instead
            rewardOnContact: true
        },
        
        // Completion behavior
        onComplete: 'spawnNPC'
    },
    
    swordInStone: {
        name: 'swordInStone',
        displayName: 'Sword in Stone',
        textureKey: 'swordInStone',
        scale: [6, 8],
        
        guards: {
            type: 'goblin', // Uses goblin from enemies.js
            count: 20,
            healthMultiplier: 1,
            customTexture: false
        },
        
        cameraZoom: 2.2,
        
        reward: {
            type: 'upgrade',
            upgrade: 'swords',
            text: '⚔️ SWORD ADDED!'
        },
        
        minLevel: 5,
        maxLevel: 999,
        spawnWeight: 1,
        
        npc: null, // No NPC, interact with structure
        
        onComplete: 'interactWithStructure',
        interactionRange: 3,
        
        // Act 1: The Goblin's Ambition
        spawnDialogue: {
            speaker: '🗡️ GOBLINS',
            text: '"Legend says: pull sword, become King! ...We not sure what happens next, but must be good!"'
        },
        completionDialogue: {
            speaker: '🪨 STONE',
            text: 'The sword slides out effortlessly. In the distance, goblin jaws drop in unison.'
        }
    },
    
    swordInStoneAct2: {
        name: 'swordInStoneAct2',
        displayName: 'The Empty Stone',
        textureKey: 'emptyStone',
        scale: [6, 8],
        
        guards: {
            type: 'goblin',
            count: 15,
            healthMultiplier: 1,
            customTexture: false
        },
        
        cameraZoom: 2.2,
        
        reward: {
            type: 'gold',
            amount: 150,
            text: '💰 +150 GOLD (The goblin\'s bribe!)'
        },
        
        minLevel: 5,
        maxLevel: 999,
        spawnWeight: 0, // Only spawns via story sequence
        
        npc: null,
        
        onComplete: 'interactWithStructure',
        interactionRange: 3,
        
        // Act 2: The Bribe
        spawnDialogue: {
            speaker: '🗡️ GOBLINS',
            text: '"Sword gone! Big Boss gonna be so mad! Quick - put shinies around rock! Maybe Giant think \'ooh nice spot\' and put sword back!"'
        },
        completionDialogue: {
            speaker: '🗡️ GOBLIN',
            text: '"...You think this work?" The goblins exchange uncertain glances, then scatter into the forest.'
        }
    },
    
    swordInStoneAct3: {
        name: 'swordInStoneAct3',
        displayName: 'The Land Giant',
        textureKey: 'emptyStone',
        scale: [6, 8],
        
        guards: {
            type: 'goblin',
            count: 10,
            healthMultiplier: 1,
            customTexture: false
        },
        
        cameraZoom: 3.0,
        
        reward: {
            type: 'bonusSwords',
            text: '⚔️ THE GIANT\'S POWER SPLITS INTO THREE BLADES!'
        },
        
        minLevel: 5,
        maxLevel: 999,
        spawnWeight: 0, // Only spawns via story sequence
        
        npc: null,
        
        onComplete: 'spawnLandGiant',
        
        // Act 3: The Date
        spawnDialogue: {
            speaker: '👹 LAND GIANT',
            text: '"At last! My date with the lovely princess of the tow— WAIT. YOU. You have MY sword! I put that there for ROMANCE! This was going to be the most important night of my— RAAAGH!"'
        },
        victoryDialogue: {
            speaker: '👹 LAND GIANT',
            text: '"Defeated... and stood up... She said she\'d be here... something about \'practicing her magic first\'... This is the worst date ever..."'
        }
    },
    
    witchHut: {
        name: 'witchHut',
        displayName: 'Witch Hut',
        textureKey: 'witchHut',
        scale: [10, 12],
        
        guards: {
            type: 'wizard', // Uses wizard from enemies.js
            count: 20,
            healthMultiplier: 1,
            customTexture: false
        },
        
        cameraZoom: 2.3,
        
        reward: {
            type: 'upgrade',
            upgrade: 'boom',
            text: '💥 BOOM UPGRADED!'
        },
        
        minLevel: 4,
        maxLevel: 999,
        spawnWeight: 1,
        
        npc: {
            textureKey: 'witch',
            scale: [2.5, 4.5],
            walksToPlayer: true,
            spawnOffset: { x: 8, z: 3 },
            dialogue: {
                speaker: '🧙‍♀️ WITCH',
                text: '"Remember me? I tried to summon a handsome wizard for companionship and instead summoned a group of dogmatic buddhists!"'
            },
            rewardOnContact: true
        },
        
        onComplete: 'spawnNPC'
    },
    
    dharmachakra: {
        name: 'dharmachakra',
        displayName: 'Dharmachakra Shrine',
        textureKey: 'dharmachakraShrine',
        scale: [12, 14],
        
        guards: {
            type: 'dharmaWizard', // Custom super-powered wizards
            count: 20,
            healthMultiplier: 3, // Super powered
            customTexture: true,
            hasOrbitingWheel: true // Special property for dharma wheels
        },
        
        cameraZoom: 2.8,
        
        reward: {
            type: 'dharmaWheel', // Special reward type
            text: '☸️ DHARMA WHEEL ACQUIRED!'
        },
        
        minLevel: 4,
        maxLevel: 999,
        spawnWeight: 1,
        
        npc: null, // No NPC, just the shrine
        
        // Custom completion behavior
        onComplete: 'grantDharmaWheel',
        
        // Dogmatic Buddhist dialogue options (shown randomly during combat)
        combatDialogues: [
            '"It is an UNDENIABLE FACT that Buddha has risen!"',
            '"To be enlightened is to NEVER question Buddha\'s teachings!"',
            '"ENLIGHTENMENT OR ELSE!"',
            '"The Eightfold Path is the ONLY path! All other paths lead to SUFFERING!"',
            '"Have you accepted the Four Noble Truths into your heart?!"',
            '"Buddha WILL return, and he will NOT be pleased with you!"',
            '"Your karma is about to get VERY negative!"',
            '"We didn\'t choose the monastic life, the monastic life chose US!"',
            '"...but I\'m not a dog!"'
        ]
    }
};

// ============================================
// CLOUD ARENA CONFIGURATION (3 STAGES)
// ============================================
const CLOUD_ARENA_CONFIG = {
    // Stage 0: Cloud Sprites + Sky Giants
    stage0: {
        name: 'Cloud Sprites',
        bossCount: 3,
        bossHealthMultiplier: 0.5,
        enemyCount: 60,
        enemyHealthMultiplier: 3,
        bossGoldDrop: 100,
        enemyGoldDrop: 10,
        goldReward: 200,
        cameraZoom: 2.5,
        introDialogue: {
            title: '⚔️ CLOUD ARENA',
            text: 'Defeat all the Sky Giants and their minions to claim your reward!'
        },
        winDialogue: {
            title: '🏆 VICTORY!',
            text: 'You have defeated the Sky Giants! Your surprise slaughter of the clouds was a great success!'
        },
        portalColor: 0x87ceeb, // Light blue
        fogColor: 0x87ceeb
    },
    
    // Stage 1: Giant Troll (revenge for his pets)
    stage1: {
        name: 'Giant Troll',
        trollHealthMultiplier: 2.0, // Really beefy
        trollGoldDrop: 1000,
        goldReward: 1000,
        cameraZoom: 3.5, // Zoom way out for the huge troll
        clubCount: 4,
        clubSpeeds: [0.02, 0.035, 0.025, 0.03], // Varying speeds
        clubDamage: 2.0, // Multiplier
        projectileCooldown: 120,
        introDialogue: {
            title: '😡 GIANT TROLL',
            text: '"YOU KILLED MY CLOUD PETS! NOW IT\'S TIME TO DIE!"'
        },
        winDialogue: {
            title: '🏆 VICTORY!',
            text: 'The Giant Troll has been slain! His dying words were mostly just angry grunting.'
        },
        portalColor: 0x4a4a4a, // Dark gray
        fogColor: 0x6b5b4f // Brownish fog
    },
    
    // Stage 2: Ghost Trio (the final reckoning)
    stage2: {
        name: 'Ghost Trio',
        ghostHealthMultiplier: 1.5,
        skeletonHealthMultiplier: 1.8,
        slimeHealthMultiplier: 2.0,
        bossGoldDrop: 500, // Each boss drops 500
        goldReward: 1500,
        cameraZoom: 3.0,
        introDialogue: {
            title: '👻 THE HAUNTING',
            text: 'The ghost of the giant has returned for vengeance, alongside his skeleton, and his... slime.'
        },
        ghostDeathDialogue: {
            title: '💀 DYING GHOST',
            text: '"You have defeated me... now I will never get to enact my evil plans. This was a morally justified slaying."'
        },
        winDialogue: {
            title: '🏆 FINAL VICTORY!',
            text: 'Congratulations! You have defeated the Giant and thwarted his evil plan. Which you were aware of?'
        },
        portalColor: 0x9932cc, // Dark purple
        fogColor: 0x2d1b4e // Spooky purple fog
    },
    
    // Forest cloud sprites that spawn with portal (stage 0 only)
    forestCloudSpriteCount: 20
};

// ============================================
// TREASURE CHEST CONFIGURATION
// ============================================
const TREASURE_CHEST_CONFIG = {
    maxChests: 5,
    spawnChance: 0.08,
    goldMin: 15,
    goldMax: 50
};

// Fun facts for treasure chests
const FUN_FACTS = [
    "The princess in the tower window after rescue? That's actually her sister. ",
    "Only a fool laughs at the mighty dragon.",
    "Sir Cowardice the Lame invented the brilliant tactic of standing beyond the evil tree's range.",
    "Legend says with 8 orbiting swords, a hero could survive while standing perfectly still. Of course, no one's ever tried it.",
    "Those 'wizards' are actually Dogmatic Buddhists.",
    "The forest seems dangerous, but most inhabitants are peaceful and kind.",
    "Why do monsters carry gold? Legend speaks of an underground monster only shop.",
    "Orbiting swords are great for the forest, impractical for dating.",
    "The skeletons? Fallen heroes who drank lots of milk. The ghosts? Heroes' who didn't drink enough milk.",
    "The little green forest people are called goblins. But NEVER let them hear you call them that.",
    "In a pinch, slimes can be used as a surprisingly effective food source.",
    "In a pinch, slimes can be used as a surprisingly effective hat.",
    "While trolls may seem dangerous there have been zero recorded deaths.",
    "In a pinch, slimes can be used as a surprisingly effective girlfriend.",
    "In a pinch, slimes can be used as a surprisingly effective moisturiser.",
    "What happens in the sky is exempt from standard morality.",
    "The evil tree may be dangerous but at least he makes oxygen.",
    "In a pinch, slimes can be used as a surprisingly effective sidekick.",
    "In a pinch, slimes can be used as a surprisingly effective roommate.",
    "A person with good kharma can wield Buddha\'s secret weapon.",
    "The evil tree may be dangerous but at least he makes oxygen.",
    "The most important thing in the forest is to have a goal otherwise you just run around fighting enemies."
];

// ============================================
// LEVEL-BASED SPAWN PROBABILITY
// ============================================
function getEncounterSpawnChance(playerLevel) {
    if (playerLevel < 4) return 0;
    
    const baseChance = 0.01;
    const levelBonus = Math.min((playerLevel - 4) * 0.0125, 0.065);
    return baseChance + levelBonus;
}

function getAvailableEncounters(playerLevel) {
    const available = [];
    for (const key in ENCOUNTER_TEMPLATES) {
        const template = ENCOUNTER_TEMPLATES[key];
        if (playerLevel >= template.minLevel && playerLevel <= template.maxLevel) {
            // Add multiple times based on spawn weight
            for (let i = 0; i < template.spawnWeight; i++) {
                available.push(template);
            }
        }
    }
    return available;
}

// ============================================
// GUARANTEED ENCOUNTER SYSTEM
// ============================================
function queueGuaranteedEncounter(encounterKey) {
    if (ENCOUNTER_TEMPLATES[encounterKey]) {
        encounterState.guaranteedEncounterQueue.push(encounterKey);
        console.log('Queued guaranteed encounter:', encounterKey);
    }
}

function hasGuaranteedEncounter() {
    return encounterState.guaranteedEncounterQueue.length > 0;
}

function getNextGuaranteedEncounter() {
    return encounterState.guaranteedEncounterQueue.shift();
}

// ============================================
// ENCOUNTER TEXTURE GENERATORS
// ============================================
function createPrincessTowerTexture() {
    return createPixelTexture(64, 128, (ctx, w, h) => {
        // Tower base
        ctx.fillStyle = '#5d6d7e';
        ctx.fillRect(12, 40, 40, 88);
        
        // Stone texture
        ctx.fillStyle = '#4a5568';
        for (let y = 0; y < 11; y++) {
            for (let x = 0; x < 5; x++) {
                const offset = y % 2 === 0 ? 0 : 4;
                ctx.fillRect(12 + x * 8 + offset, 40 + y * 8, 7, 7);
            }
        }
        
        // Tower top / battlements
        ctx.fillStyle = '#5d6d7e';
        ctx.fillRect(8, 32, 48, 12);
        for (let i = 0; i < 6; i++) {
            ctx.fillRect(8 + i * 8, 24, 6, 10);
        }
        
        // Window
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(24, 50, 16, 24);
        ctx.fillStyle = '#85c1e9';
        ctx.fillRect(26, 52, 12, 20);
        
        // Window bars
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(31, 52, 2, 20);
        ctx.fillRect(26, 60, 12, 2);
        
        // Princess in window
        ctx.fillStyle = '#fad7a0';
        ctx.fillRect(28, 56, 8, 8);
        ctx.fillStyle = '#f4d03f';
        ctx.fillRect(27, 53, 10, 5);
        ctx.fillRect(26, 56, 3, 8);
        ctx.fillRect(35, 56, 3, 8);
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(28, 51, 8, 3);
        ctx.fillRect(29, 49, 2, 3);
        ctx.fillRect(33, 49, 2, 3);
        ctx.fillStyle = '#3498db';
        ctx.fillRect(29, 58, 2, 2);
        ctx.fillRect(33, 58, 2, 2);
        
        // Door
        ctx.fillStyle = '#8b4513';
        ctx.fillRect(24, 100, 16, 28);
        ctx.fillStyle = '#5d4037';
        ctx.fillRect(26, 102, 12, 24);
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(34, 114, 3, 3);
        
        // Flag pole
        ctx.fillStyle = '#8b4513';
        ctx.fillRect(30, 0, 4, 28);
        
        // Flag
        ctx.fillStyle = '#e91e63';
        ctx.fillRect(34, 2, 20, 14);
        ctx.fillStyle = '#fff';
        ctx.fillRect(38, 6, 4, 6);
        ctx.fillRect(44, 6, 4, 6);
    });
}

function createPrincessTexture() {
    return createPixelTexture(32, 48, (ctx, w, h) => {
        // Dress
        ctx.fillStyle = '#e91e63';
        ctx.fillRect(8, 20, 16, 24);
        ctx.fillRect(4, 40, 24, 8);
        
        ctx.fillStyle = '#c2185b';
        ctx.fillRect(10, 24, 4, 16);
        ctx.fillRect(18, 24, 4, 16);
        
        // Face
        ctx.fillStyle = '#fad7a0';
        ctx.fillRect(10, 8, 12, 14);
        
        // Hair
        ctx.fillStyle = '#f4d03f';
        ctx.fillRect(8, 4, 16, 8);
        ctx.fillRect(6, 8, 4, 16);
        ctx.fillRect(22, 8, 4, 16);
        
        // Crown
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(10, 2, 12, 4);
        ctx.fillRect(11, 0, 3, 3);
        ctx.fillRect(15, -1, 2, 4);
        ctx.fillRect(18, 0, 3, 3);
        
        ctx.fillStyle = '#e91e63';
        ctx.fillRect(15, 0, 2, 2);
        
        // Eyes
        ctx.fillStyle = '#3498db';
        ctx.fillRect(12, 12, 3, 3);
        ctx.fillRect(17, 12, 3, 3);
        
        // Smile
        ctx.fillStyle = '#c2185b';
        ctx.fillRect(14, 18, 4, 2);
        
        // Arms
        ctx.fillStyle = '#fad7a0';
        ctx.fillRect(4, 22, 4, 10);
        ctx.fillRect(24, 22, 4, 10);
    });
}

function createGoldenSkeletonTexture() {
    return createPixelTexture(32, 48, (ctx, w, h) => {
        // Skull
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(10, 2, 12, 14);
        ctx.fillRect(8, 6, 16, 8);
        
        // Eyes
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(11, 7, 4, 4);
        ctx.fillRect(17, 7, 4, 4);
        ctx.fillStyle = '#000';
        ctx.fillRect(12, 8, 2, 2);
        ctx.fillRect(18, 8, 2, 2);
        
        // Nose
        ctx.fillStyle = '#b8860b';
        ctx.fillRect(15, 11, 2, 3);
        
        // Teeth
        ctx.fillStyle = '#fff';
        ctx.fillRect(12, 14, 8, 2);
        
        // Spine
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(14, 16, 4, 20);
        
        // Ribs
        ctx.fillStyle = '#daa520';
        for (let i = 0; i < 4; i++) {
            ctx.fillRect(8, 18 + i * 4, 16, 2);
        }
        
        // Arms
        ctx.fillRect(4, 18, 4, 14);
        ctx.fillRect(24, 18, 4, 14);
        
        // Legs
        ctx.fillRect(10, 36, 4, 12);
        ctx.fillRect(18, 36, 4, 12);
        
        // Crown
        ctx.fillStyle = '#fff';
        ctx.fillRect(10, 0, 12, 3);
        ctx.fillRect(12, -2, 2, 3);
        ctx.fillRect(18, -2, 2, 3);
    });
}

function createSwordInStoneTexture() {
    return createPixelTexture(48, 64, (ctx, w, h) => {
        // Stone base
        ctx.fillStyle = '#5d6d7e';
        ctx.beginPath();
        ctx.ellipse(24, 50, 22, 14, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Stone top
        ctx.fillStyle = '#6c7a89';
        ctx.beginPath();
        ctx.ellipse(24, 45, 18, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Stone texture
        ctx.fillStyle = '#4a5568';
        ctx.fillRect(12, 44, 6, 8);
        ctx.fillRect(28, 46, 8, 6);
        ctx.fillRect(18, 50, 5, 5);
        
        // Crack in stone
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(22, 40, 4, 20);
        
        // Sword blade
        ctx.fillStyle = '#bdc3c7';
        ctx.fillRect(21, 8, 6, 36);
        
        // Blade shine
        ctx.fillStyle = '#ecf0f1';
        ctx.fillRect(22, 10, 2, 32);
        
        // Blade edge
        ctx.fillStyle = '#95a5a6';
        ctx.fillRect(26, 10, 1, 32);
        
        // Sword tip
        ctx.fillStyle = '#bdc3c7';
        ctx.beginPath();
        ctx.moveTo(21, 8);
        ctx.lineTo(27, 8);
        ctx.lineTo(24, 0);
        ctx.fill();
        
        // Guard
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(14, 42, 20, 4);
        ctx.fillStyle = '#d4ac0d';
        ctx.fillRect(12, 43, 4, 2);
        ctx.fillRect(32, 43, 4, 2);
        
        // Handle
        ctx.fillStyle = '#8b4513';
        ctx.fillRect(21, 46, 6, 10);
        
        // Handle wrap
        ctx.fillStyle = '#654321';
        ctx.fillRect(21, 48, 6, 2);
        ctx.fillRect(21, 52, 6, 2);
        
        // Pommel
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(20, 55, 8, 5);
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(22, 56, 4, 3);
        
        // Glow effect
        ctx.fillStyle = 'rgba(241, 196, 15, 0.3)';
        ctx.beginPath();
        ctx.arc(24, 30, 15, 0, Math.PI * 2);
        ctx.fill();
    });
}

function createEmptyStoneTexture() {
    return createPixelTexture(48, 64, (ctx, w, h) => {
        // Gold piles around the stone (the goblin's bribe)
        ctx.fillStyle = '#ffd700';
        // Left pile
        ctx.beginPath();
        ctx.ellipse(8, 58, 6, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(10, 55, 4, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        // Right pile
        ctx.beginPath();
        ctx.ellipse(40, 58, 6, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(38, 55, 4, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        // Front pile
        ctx.beginPath();
        ctx.ellipse(24, 62, 5, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Individual coins
        ctx.fillStyle = '#ffec8b';
        ctx.fillRect(6, 56, 2, 2);
        ctx.fillRect(12, 57, 2, 2);
        ctx.fillRect(38, 56, 2, 2);
        ctx.fillRect(42, 58, 2, 2);
        ctx.fillRect(22, 60, 2, 2);
        ctx.fillRect(26, 61, 2, 2);
        
        // Stone base (same as original)
        ctx.fillStyle = '#5d6d7e';
        ctx.beginPath();
        ctx.ellipse(24, 50, 22, 14, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Stone top
        ctx.fillStyle = '#6c7a89';
        ctx.beginPath();
        ctx.ellipse(24, 45, 18, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Stone texture
        ctx.fillStyle = '#4a5568';
        ctx.fillRect(12, 44, 6, 8);
        ctx.fillRect(28, 46, 8, 6);
        ctx.fillRect(18, 50, 5, 5);
        
        // Empty hole where sword was (darker, deeper looking)
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(22, 40, 4, 12);
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(21, 40, 1, 12);
        ctx.fillRect(26, 40, 1, 12);
        
        // Sad crack lines radiating from hole
        ctx.fillStyle = '#4a5568';
        ctx.fillRect(18, 44, 4, 1);
        ctx.fillRect(26, 46, 4, 1);
        ctx.fillRect(20, 50, 2, 1);
        ctx.fillRect(26, 50, 3, 1);
        
        // Some moss (stone has been here a while)
        ctx.fillStyle = '#2d5a27';
        ctx.fillRect(8, 48, 3, 2);
        ctx.fillRect(35, 52, 4, 2);
        ctx.fillRect(14, 54, 2, 2);
    });
}

function createLandGiantTexture() {
    return createPixelTexture(64, 80, (ctx, w, h) => {
        // Body - earthy brown/green tones
        ctx.fillStyle = '#5a6b4a'; // Mossy brown-green
        ctx.beginPath();
        ctx.ellipse(32, 55, 25, 24, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Head
        ctx.fillStyle = '#6a7b5a';
        ctx.beginPath();
        ctx.ellipse(32, 25, 18, 16, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Arms
        ctx.fillStyle = '#4a5b3a';
        ctx.beginPath();
        ctx.ellipse(8, 50, 12, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(56, 50, 12, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Angry eyes (he's been stood up!)
        ctx.fillStyle = '#ff6600';
        ctx.fillRect(22, 20, 6, 6);
        ctx.fillRect(36, 20, 6, 6);
        
        // Angry eyebrows
        ctx.fillStyle = '#3a4a2a';
        ctx.beginPath();
        ctx.moveTo(20, 20);
        ctx.lineTo(30, 17);
        ctx.lineTo(30, 19);
        ctx.lineTo(20, 22);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(44, 20);
        ctx.lineTo(34, 17);
        ctx.lineTo(34, 19);
        ctx.lineTo(44, 22);
        ctx.fill();
        
        // Eye glow
        ctx.fillStyle = 'rgba(255, 102, 0, 0.5)';
        ctx.beginPath();
        ctx.arc(25, 23, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(39, 23, 6, 0, Math.PI * 2);
        ctx.fill();
        
        // Angry mouth
        ctx.fillStyle = '#2a3a1a';
        ctx.fillRect(26, 32, 12, 4);
        
        // Crown of branches/twigs (forest king!)
        ctx.fillStyle = '#4a3520';
        ctx.fillRect(20, 8, 3, 10);
        ctx.fillRect(29, 5, 3, 12);
        ctx.fillRect(38, 8, 3, 10);
        // Leaves on crown
        ctx.fillStyle = '#2d5a27';
        ctx.beginPath();
        ctx.ellipse(21, 6, 4, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(30, 3, 4, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(39, 6, 4, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Moss/vine details on body
        ctx.fillStyle = '#3d6a37';
        ctx.fillRect(15, 45, 4, 8);
        ctx.fillRect(45, 48, 5, 6);
        ctx.fillRect(28, 65, 8, 4);
    });
}

function createWitchHutTexture() {
    return createPixelTexture(80, 96, (ctx, w, h) => {
        // Hut base
        ctx.fillStyle = '#5d4037';
        ctx.fillRect(15, 50, 50, 46);
        
        // Wood planks
        ctx.fillStyle = '#4e342e';
        for (let i = 0; i < 5; i++) {
            ctx.fillRect(15, 50 + i * 10, 50, 2);
        }
        
        // Roof
        ctx.fillStyle = '#2c2c54';
        ctx.beginPath();
        ctx.moveTo(40, 5);
        ctx.lineTo(5, 55);
        ctx.lineTo(75, 55);
        ctx.closePath();
        ctx.fill();
        
        // Roof shingles
        ctx.fillStyle = '#1a1a3a';
        for (let row = 0; row < 5; row++) {
            for (let i = 0; i < 8 + row; i++) {
                const y = 15 + row * 10;
                const xStart = 15 - row * 5;
                ctx.fillRect(xStart + i * 8, y, 7, 8);
            }
        }
        
        // Chimney
        ctx.fillStyle = '#4a3728';
        ctx.fillRect(55, 15, 10, 30);
        // Smoke
        ctx.fillStyle = 'rgba(150, 150, 150, 0.6)';
        ctx.beginPath();
        ctx.arc(60, 10, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(58, 3, 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Door
        ctx.fillStyle = '#3e2723';
        ctx.fillRect(32, 65, 16, 31);
        ctx.fillStyle = '#5d4037';
        ctx.fillRect(34, 67, 12, 27);
        ctx.fillStyle = '#9b59b6';
        ctx.fillRect(42, 80, 3, 3);
        
        // Window
        ctx.fillStyle = '#1a1a3a';
        ctx.fillRect(20, 60, 10, 12);
        ctx.fillStyle = '#9b59b6';
        ctx.fillRect(21, 61, 8, 10);
        ctx.fillStyle = '#bb8fce';
        ctx.fillRect(23, 63, 4, 6);
        
        // Cauldron outside
        ctx.fillStyle = '#2c2c2c';
        ctx.beginPath();
        ctx.ellipse(70, 90, 8, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#27ae60';
        ctx.beginPath();
        ctx.arc(68, 86, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(72, 84, 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Mushrooms
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.ellipse(10, 92, 5, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#faf0e6';
        ctx.fillRect(9, 92, 3, 4);
        ctx.fillStyle = '#fff';
        ctx.fillRect(8, 90, 2, 2);
        ctx.fillRect(12, 89, 2, 2);
    });
}

function createWitchTexture() {
    return createPixelTexture(32, 56, (ctx, w, h) => {
        // Robe
        ctx.fillStyle = '#2c2c54';
        ctx.fillRect(8, 24, 16, 26);
        ctx.fillRect(4, 46, 24, 10);
        
        ctx.fillStyle = '#9b59b6';
        ctx.fillRect(8, 24, 16, 3);
        ctx.fillRect(4, 46, 24, 2);
        
        // Face
        ctx.fillStyle = '#a8e6cf';
        ctx.fillRect(10, 14, 12, 12);
        
        // Nose (pointy)
        ctx.fillStyle = '#7bc89c';
        ctx.fillRect(14, 18, 4, 6);
        ctx.fillRect(15, 24, 2, 2);
        
        // Eyes
        ctx.fillStyle = '#9b59b6';
        ctx.fillRect(11, 16, 4, 4);
        ctx.fillRect(17, 16, 4, 4);
        ctx.fillStyle = '#000';
        ctx.fillRect(12, 17, 2, 2);
        ctx.fillRect(18, 17, 2, 2);
        
        // Smile
        ctx.fillStyle = '#2c2c54';
        ctx.fillRect(12, 22, 8, 2);
        
        // Hat
        ctx.fillStyle = '#2c2c54';
        ctx.fillRect(6, 10, 20, 6);
        ctx.fillRect(10, 2, 12, 10);
        ctx.fillRect(13, -2, 6, 6);
        
        ctx.fillStyle = '#9b59b6';
        ctx.fillRect(10, 10, 12, 2);
        
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(14, 9, 4, 4);
        
        // Arms
        ctx.fillStyle = '#a8e6cf';
        ctx.fillRect(4, 26, 4, 12);
        ctx.fillRect(24, 26, 4, 12);
        
        // Broom
        ctx.fillStyle = '#8b4513';
        ctx.fillRect(26, 20, 3, 36);
        ctx.fillStyle = '#d4a574';
        ctx.fillRect(24, 50, 7, 6);
        ctx.fillStyle = '#c9a86c';
        for (let i = 0; i < 4; i++) {
            ctx.fillRect(24 + i * 2, 52, 1, 4);
        }
    });
}

function createHeartTexture() {
    return createPixelTexture(24, 24, (ctx, w, h) => {
        ctx.fillStyle = '#e91e63';
        ctx.beginPath();
        ctx.arc(8, 9, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(16, 9, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(2, 10);
        ctx.lineTo(12, 22);
        ctx.lineTo(22, 10);
        ctx.fill();
        
        ctx.fillStyle = '#f48fb1';
        ctx.beginPath();
        ctx.arc(7, 7, 2, 0, Math.PI * 2);
        ctx.fill();
    });
}

function createTreasureChestTexture() {
    return createPixelTexture(32, 28, (ctx, w, h) => {
        // Chest body
        ctx.fillStyle = '#8b4513';
        ctx.fillRect(2, 10, 28, 18);
        
        // Chest lid
        ctx.fillStyle = '#a0522d';
        ctx.fillRect(2, 4, 28, 8);
        ctx.fillRect(4, 2, 24, 4);
        
        // Wood grain
        ctx.fillStyle = '#6b3510';
        ctx.fillRect(4, 12, 24, 2);
        ctx.fillRect(4, 18, 24, 2);
        ctx.fillRect(4, 24, 24, 2);
        
        // Metal bands
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(0, 8, 32, 3);
        ctx.fillRect(0, 20, 32, 3);
        ctx.fillRect(14, 4, 4, 24);
        
        // Lock
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(13, 10, 6, 8);
        ctx.fillStyle = '#000';
        ctx.fillRect(15, 14, 2, 3);
        
        // Shine
        ctx.fillStyle = '#fff8dc';
        ctx.fillRect(2, 8, 4, 1);
        ctx.fillRect(2, 20, 4, 1);
        
        // Shadow
        ctx.fillStyle = '#5d3a1a';
        ctx.fillRect(2, 26, 28, 2);
    });
}

function createOpenChestTexture() {
    return createPixelTexture(32, 32, (ctx, w, h) => {
        // Open lid
        ctx.fillStyle = '#a0522d';
        ctx.fillRect(2, 0, 28, 6);
        ctx.fillRect(4, 4, 24, 8);
        
        ctx.fillStyle = '#6b3510';
        ctx.fillRect(6, 6, 20, 4);
        
        // Chest body
        ctx.fillStyle = '#8b4513';
        ctx.fillRect(2, 14, 28, 18);
        
        // Inside of chest
        ctx.fillStyle = '#3d2314';
        ctx.fillRect(4, 14, 24, 8);
        
        // Gold coins inside
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(10, 17, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(16, 16, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(22, 17, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(13, 19, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(19, 19, 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Metal bands
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(0, 22, 32, 3);
        ctx.fillRect(14, 14, 4, 18);
        
        // Shadow
        ctx.fillStyle = '#5d3a1a';
        ctx.fillRect(2, 30, 28, 2);
    });
}

// ============================================
// CLOUD ARENA TEXTURES
// ============================================
function createBeanstalkPortalTexture() {
    return createPixelTexture(64, 96, (ctx, w, h) => {
        // Blue swirling portal background
        const gradient = ctx.createRadialGradient(32, 60, 5, 32, 60, 30);
        gradient.addColorStop(0, '#00ffff');
        gradient.addColorStop(0.3, '#0088ff');
        gradient.addColorStop(0.6, '#0044aa');
        gradient.addColorStop(1, 'rgba(0, 20, 60, 0.8)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.ellipse(32, 60, 28, 35, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Portal ring glow
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.ellipse(32, 60, 28, 35, 0, 0, Math.PI * 2);
        ctx.stroke();
        
        // Inner glow ring
        ctx.strokeStyle = 'rgba(100, 200, 255, 0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(32, 60, 22, 28, 0, 0, Math.PI * 2);
        ctx.stroke();
        
        // Beanstalk main stem
        ctx.fillStyle = '#228B22';
        ctx.fillRect(28, 20, 8, 76);
        
        ctx.fillStyle = '#32CD32';
        ctx.fillRect(30, 20, 3, 76);
        
        ctx.fillStyle = '#006400';
        ctx.fillRect(34, 20, 2, 76);
        
        // Spiral vines
        ctx.fillStyle = '#228B22';
        for (let i = 0; i < 6; i++) {
            const y = 25 + i * 12;
            ctx.fillRect(20, y, 10, 4);
            ctx.fillRect(34, y + 6, 10, 4);
        }
        
        // Leaves
        ctx.fillStyle = '#32CD32';
        for (let i = 0; i < 6; i++) {
            const y = 22 + i * 12;
            ctx.beginPath();
            ctx.ellipse(16, y + 2, 6, 4, -0.3, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(48, y + 8, 6, 4, 0.3, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Top clouds
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.ellipse(32, 8, 18, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(22, 12, 10, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(42, 12, 10, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Magic sparkles
        ctx.fillStyle = '#00ffff';
        ctx.fillRect(15, 40, 3, 3);
        ctx.fillRect(46, 55, 3, 3);
        ctx.fillRect(12, 70, 3, 3);
        ctx.fillRect(50, 45, 3, 3);
        ctx.fillRect(20, 80, 2, 2);
        ctx.fillRect(44, 75, 2, 2);
    });
}

function createPortalParticleTexture() {
    return createPixelTexture(8, 8, (ctx, w, h) => {
        const gradient = ctx.createRadialGradient(4, 4, 0, 4, 4, 4);
        gradient.addColorStop(0, 'rgba(100, 200, 255, 1)');
        gradient.addColorStop(0.5, 'rgba(0, 150, 255, 0.8)');
        gradient.addColorStop(1, 'rgba(0, 100, 200, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 8, 8);
    });
}

function createCloudGroundTexture() {
    return createPixelTexture(128, 128, (ctx, w, h) => {
        ctx.fillStyle = '#e8f4ff';
        ctx.fillRect(0, 0, 128, 128);
        
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 20; i++) {
            const x = (i * 37) % 128;
            const y = (i * 53) % 128;
            const r = 15 + (i % 3) * 5;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.fillStyle = 'rgba(180, 200, 220, 0.3)';
        for (let i = 0; i < 15; i++) {
            const x = (i * 47 + 20) % 128;
            const y = (i * 61 + 30) % 128;
            ctx.beginPath();
            ctx.arc(x, y, 10, 0, Math.PI * 2);
            ctx.fill();
        }
    });
}

// Heavy cloud decoration (for arena border)
function createHeavyCloudTexture() {
    return createPixelTexture(64, 48, (ctx, w, h) => {
        // Dense white cloud
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(32, 30, 28, 18, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(16, 28, 16, 14, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(48, 28, 16, 14, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(32, 18, 20, 14, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(20, 20, 14, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(44, 20, 14, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.ellipse(28, 16, 10, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Shadow underneath
        ctx.fillStyle = 'rgba(200, 210, 230, 0.6)';
        ctx.beginPath();
        ctx.ellipse(32, 38, 24, 10, 0, 0, Math.PI * 2);
        ctx.fill();
    });
}

// Light wispy cloud (for inside arena)
function createLightCloudTexture() {
    return createPixelTexture(48, 32, (ctx, w, h) => {
        // Wispy transparent cloud
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.ellipse(24, 18, 20, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(12, 16, 10, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(36, 16, 10, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Even lighter wisps
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.ellipse(24, 12, 14, 8, 0, 0, Math.PI * 2);
        ctx.fill();
    });
}

// Cloud grass tuft (implies solid ground)
function createCloudGrassTexture() {
    return createPixelTexture(24, 20, (ctx, w, h) => {
        // Light blue-green grass blades
        ctx.fillStyle = '#a8d8ea';
        
        // Center blade (tallest)
        ctx.beginPath();
        ctx.moveTo(12, 18);
        ctx.lineTo(10, 4);
        ctx.lineTo(14, 4);
        ctx.closePath();
        ctx.fill();
        
        // Left blades
        ctx.beginPath();
        ctx.moveTo(6, 18);
        ctx.lineTo(3, 8);
        ctx.lineTo(7, 7);
        ctx.closePath();
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(9, 18);
        ctx.lineTo(6, 6);
        ctx.lineTo(10, 5);
        ctx.closePath();
        ctx.fill();
        
        // Right blades
        ctx.beginPath();
        ctx.moveTo(18, 18);
        ctx.lineTo(21, 8);
        ctx.lineTo(17, 7);
        ctx.closePath();
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(15, 18);
        ctx.lineTo(18, 6);
        ctx.lineTo(14, 5);
        ctx.closePath();
        ctx.fill();
        
        // Lighter highlights on some blades
        ctx.fillStyle = '#c8e8fa';
        ctx.beginPath();
        ctx.moveTo(12, 16);
        ctx.lineTo(11, 6);
        ctx.lineTo(13, 6);
        ctx.closePath();
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(6, 16);
        ctx.lineTo(4, 10);
        ctx.lineTo(6, 9);
        ctx.closePath();
        ctx.fill();
    });
}

function createCloudSpriteTexture() {
    return createPixelTexture(48, 24, (ctx, w, h) => {
        ctx.fillStyle = '#b0c4de';
        ctx.beginPath();
        ctx.ellipse(24, 14, 20, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(12, 12, 10, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(36, 12, 10, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(24, 8, 12, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Angry eyes
        ctx.fillStyle = '#4a4a6a';
        ctx.fillRect(16, 10, 4, 4);
        ctx.fillRect(28, 10, 4, 4);
        
        // Angry eyebrows
        ctx.fillStyle = '#2a2a4a';
        ctx.fillRect(14, 8, 6, 2);
        ctx.fillRect(28, 8, 6, 2);
    });
}

function createSkyGiantTexture() {
    return createPixelTexture(64, 80, (ctx, w, h) => {
        // Body
        ctx.fillStyle = '#6a7b8c';
        ctx.beginPath();
        ctx.ellipse(32, 55, 25, 24, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Head
        ctx.fillStyle = '#7a8b9c';
        ctx.beginPath();
        ctx.ellipse(32, 25, 18, 16, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Arms
        ctx.fillStyle = '#5a6b7c';
        ctx.beginPath();
        ctx.ellipse(8, 50, 12, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(56, 50, 12, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Glowing eyes
        ctx.fillStyle = '#ffff00';
        ctx.fillRect(22, 20, 6, 6);
        ctx.fillRect(36, 20, 6, 6);
        
        ctx.fillStyle = 'rgba(255, 255, 0, 0.5)';
        ctx.beginPath();
        ctx.arc(25, 23, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(39, 23, 6, 0, Math.PI * 2);
        ctx.fill();
        
        // Mouth
        ctx.fillStyle = '#3a4a5a';
        ctx.fillRect(26, 32, 12, 4);
        
        // Lightning crown
        ctx.fillStyle = '#ffff00';
        ctx.beginPath();
        ctx.moveTo(20, 12);
        ctx.lineTo(24, 4);
        ctx.lineTo(28, 12);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(28, 10);
        ctx.lineTo(32, 0);
        ctx.lineTo(36, 10);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(36, 12);
        ctx.lineTo(40, 4);
        ctx.lineTo(44, 12);
        ctx.fill();
    });
}

// Giant Troll (Stage 1) - Massive angry troll
function createGiantTrollTexture() {
    return createPixelTexture(96, 128, (ctx, w, h) => {
        // Massive body
        ctx.fillStyle = '#4a7c4a'; // Dark green
        ctx.beginPath();
        ctx.ellipse(48, 85, 40, 38, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Head
        ctx.fillStyle = '#5a8c5a';
        ctx.beginPath();
        ctx.ellipse(48, 35, 28, 26, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Angry eyebrows
        ctx.fillStyle = '#2a4c2a';
        ctx.fillRect(28, 22, 16, 6);
        ctx.fillRect(52, 22, 16, 6);
        
        // Glowing red angry eyes
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(32, 30, 10, 8);
        ctx.fillRect(54, 30, 10, 8);
        
        // Pupils
        ctx.fillStyle = '#000';
        ctx.fillRect(35, 32, 4, 4);
        ctx.fillRect(57, 32, 4, 4);
        
        // Huge tusks
        ctx.fillStyle = '#f0f0e0';
        ctx.beginPath();
        ctx.moveTo(30, 50);
        ctx.lineTo(24, 70);
        ctx.lineTo(34, 55);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(66, 50);
        ctx.lineTo(72, 70);
        ctx.lineTo(62, 55);
        ctx.fill();
        
        // Angry mouth
        ctx.fillStyle = '#2a2a2a';
        ctx.fillRect(36, 48, 24, 10);
        
        // Arms
        ctx.fillStyle = '#4a7c4a';
        ctx.beginPath();
        ctx.ellipse(10, 75, 16, 20, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(86, 75, 16, 20, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Legs
        ctx.fillStyle = '#3a6c3a';
        ctx.fillRect(28, 110, 16, 18);
        ctx.fillRect(52, 110, 16, 18);
    });
}

// Giant Troll Club
function createGiantClubTexture() {
    return createPixelTexture(24, 64, (ctx, w, h) => {
        // Handle
        ctx.fillStyle = '#6b4226';
        ctx.fillRect(9, 30, 6, 34);
        
        // Club head
        ctx.fillStyle = '#5a3a20';
        ctx.beginPath();
        ctx.ellipse(12, 16, 12, 18, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Spikes
        ctx.fillStyle = '#808080';
        ctx.beginPath();
        ctx.moveTo(4, 8);
        ctx.lineTo(0, 0);
        ctx.lineTo(8, 6);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(20, 8);
        ctx.lineTo(24, 0);
        ctx.lineTo(16, 6);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(12, 2);
        ctx.lineTo(12, -6);
        ctx.lineTo(14, 2);
        ctx.fill();
    });
}

// Troll projectile (rock)
function createTrollRockTexture() {
    return createPixelTexture(16, 16, (ctx, w, h) => {
        ctx.fillStyle = '#6a6a6a';
        ctx.beginPath();
        ctx.ellipse(8, 8, 7, 6, 0.2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#4a4a4a';
        ctx.fillRect(4, 5, 3, 3);
        ctx.fillRect(9, 8, 4, 3);
    });
}

// Giant Ghost (Stage 2) - Spirit of the Giant
function createGiantGhostTexture() {
    return createPixelTexture(80, 96, (ctx, w, h) => {
        // Ghostly body - translucent
        ctx.fillStyle = 'rgba(200, 220, 255, 0.7)';
        ctx.beginPath();
        ctx.ellipse(40, 50, 35, 40, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Wavy bottom
        for (let i = 0; i < 6; i++) {
            ctx.beginPath();
            ctx.ellipse(12 + i * 12, 88, 8, 10, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Spooky eyes
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.ellipse(28, 40, 8, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(52, 40, 8, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Glowing pupils
        ctx.fillStyle = '#00ffff';
        ctx.fillRect(26, 42, 4, 4);
        ctx.fillRect(50, 42, 4, 4);
        
        // Sad/angry mouth
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.ellipse(40, 65, 10, 8, 0, 0, Math.PI);
        ctx.fill();
        
        // Crown remnant (ethereal)
        ctx.fillStyle = 'rgba(255, 255, 100, 0.5)';
        ctx.beginPath();
        ctx.moveTo(24, 12);
        ctx.lineTo(28, 2);
        ctx.lineTo(32, 12);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(36, 10);
        ctx.lineTo(40, 0);
        ctx.lineTo(44, 10);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(48, 12);
        ctx.lineTo(52, 2);
        ctx.lineTo(56, 12);
        ctx.fill();
    });
}

// Giant Skeleton (Stage 2) - Body of the Giant
function createGiantSkeletonTexture() {
    return createPixelTexture(72, 96, (ctx, w, h) => {
        // Skull
        ctx.fillStyle = '#f5f5dc';
        ctx.beginPath();
        ctx.ellipse(36, 22, 22, 20, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Eye sockets
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.ellipse(28, 20, 6, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(44, 20, 6, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Red glowing eyes
        ctx.fillStyle = '#ff4444';
        ctx.fillRect(26, 20, 4, 4);
        ctx.fillRect(42, 20, 4, 4);
        
        // Nose hole
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.moveTo(36, 30);
        ctx.lineTo(32, 36);
        ctx.lineTo(40, 36);
        ctx.fill();
        
        // Teeth
        ctx.fillStyle = '#f5f5dc';
        ctx.fillRect(28, 38, 4, 6);
        ctx.fillRect(34, 38, 4, 6);
        ctx.fillRect(40, 38, 4, 6);
        
        // Spine/ribcage
        ctx.fillStyle = '#e8e8d0';
        ctx.fillRect(34, 46, 4, 30);
        
        // Ribs
        for (let i = 0; i < 4; i++) {
            ctx.fillRect(20, 50 + i * 7, 32, 3);
        }
        
        // Arms (bone)
        ctx.fillRect(8, 50, 8, 30);
        ctx.fillRect(56, 50, 8, 30);
        
        // Legs (bone)
        ctx.fillRect(24, 78, 8, 18);
        ctx.fillRect(40, 78, 8, 18);
    });
}

// Giant Slime (Stage 2) - The Giant's... bodily goos
function createGiantSlimeTexture() {
    return createPixelTexture(64, 48, (ctx, w, h) => {
        // Main blob - sick looking color
        ctx.fillStyle = '#8b0000'; // Dark red/blood
        ctx.beginPath();
        ctx.ellipse(32, 34, 30, 18, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Top bumps
        ctx.beginPath();
        ctx.ellipse(18, 20, 12, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(46, 22, 10, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Gross highlights
        ctx.fillStyle = '#a52a2a';
        ctx.beginPath();
        ctx.ellipse(24, 30, 8, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Yellow bits (bile?)
        ctx.fillStyle = '#9acd32';
        ctx.beginPath();
        ctx.ellipse(40, 36, 5, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Eyes (still has the giant's eyes somehow)
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.ellipse(22, 26, 5, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(42, 26, 5, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#000';
        ctx.fillRect(21, 26, 3, 4);
        ctx.fillRect(41, 26, 3, 4);
    });
}

// ============================================
// DHARMACHAKRA ENCOUNTER TEXTURES
// ============================================

// Dharmachakra Shrine - Big golden dharma wheel with lotus flowers
function createDharmachakraShrineTexture() {
    return createPixelTexture(80, 96, (ctx, w, h) => {
        // Base/altar
        ctx.fillStyle = '#d4af37'; // Gold
        ctx.fillRect(10, 70, 60, 26);
        ctx.fillStyle = '#b8960c';
        ctx.fillRect(15, 75, 50, 16);
        
        // Lotus flowers around base
        const lotusColors = ['#ff69b4', '#ff1493', '#ff69b4'];
        for (let i = 0; i < 3; i++) {
            ctx.fillStyle = lotusColors[i];
            // Left side
            ctx.beginPath();
            ctx.ellipse(8 + i * 8, 85, 5, 4, 0, 0, Math.PI * 2);
            ctx.fill();
            // Right side
            ctx.beginPath();
            ctx.ellipse(56 + i * 8, 85, 5, 4, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Dharma wheel (large, centered)
        const wheelX = 40, wheelY = 38, wheelR = 28;
        
        // Outer ring
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(wheelX, wheelY, wheelR, 0, Math.PI * 2);
        ctx.stroke();
        
        // Inner ring
        ctx.beginPath();
        ctx.arc(wheelX, wheelY, wheelR * 0.3, 0, Math.PI * 2);
        ctx.stroke();
        
        // 8 spokes
        ctx.lineWidth = 3;
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(wheelX + Math.cos(angle) * wheelR * 0.3, wheelY + Math.sin(angle) * wheelR * 0.3);
            ctx.lineTo(wheelX + Math.cos(angle) * wheelR, wheelY + Math.sin(angle) * wheelR);
            ctx.stroke();
        }
        
        // Center hub
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(wheelX, wheelY, 6, 0, Math.PI * 2);
        ctx.fill();
        
        // Glow effect
        ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
        ctx.beginPath();
        ctx.arc(wheelX, wheelY, wheelR + 6, 0, Math.PI * 2);
        ctx.fill();
    });
}

// Dharma Wizard - Golden wizard (same as wizard enemy but with golden robes)
function createDharmaWizardTexture() {
    return createPixelTexture(32, 48, (ctx, w, h) => {
        // Golden robes (body) - wizard-style triangular robe
        ctx.fillStyle = '#daa520'; // Goldenrod
        ctx.beginPath();
        ctx.moveTo(16, 16);
        ctx.lineTo(4, 46);
        ctx.lineTo(28, 46);
        ctx.closePath();
        ctx.fill();
        
        // Robe shading/detail
        ctx.fillStyle = '#b8860b';
        ctx.beginPath();
        ctx.moveTo(16, 20);
        ctx.lineTo(8, 46);
        ctx.lineTo(14, 46);
        ctx.closePath();
        ctx.fill();
        
        // Robe trim at bottom
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(4, 42, 24, 4);
        
        // Face
        ctx.fillStyle = '#e8beac';
        ctx.beginPath();
        ctx.ellipse(16, 12, 6, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Wizard hat (pointed, golden)
        ctx.fillStyle = '#daa520';
        ctx.beginPath();
        ctx.moveTo(16, -4);
        ctx.lineTo(6, 10);
        ctx.lineTo(26, 10);
        ctx.closePath();
        ctx.fill();
        
        // Hat brim
        ctx.fillStyle = '#b8860b';
        ctx.fillRect(4, 8, 24, 4);
        
        // Hat band with dharma symbol
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(6, 6, 20, 3);
        
        // Eyes (glowing with enlightenment)
        ctx.fillStyle = '#fff';
        ctx.fillRect(12, 10, 3, 4);
        ctx.fillRect(17, 10, 3, 4);
        ctx.fillStyle = '#4169e1'; // Blue pupils
        ctx.fillRect(13, 11, 2, 2);
        ctx.fillRect(18, 11, 2, 2);
        
        // Stern eyebrows
        ctx.fillStyle = '#654321';
        ctx.fillRect(11, 8, 4, 2);
        ctx.fillRect(17, 8, 4, 2);
        
        // Beard (wise wizard)
        ctx.fillStyle = '#808080';
        ctx.beginPath();
        ctx.moveTo(12, 16);
        ctx.lineTo(16, 24);
        ctx.lineTo(20, 16);
        ctx.closePath();
        ctx.fill();
        
        // Staff (held to the side)
        ctx.fillStyle = '#8b4513';
        ctx.fillRect(26, 10, 3, 36);
        
        // Staff orb (golden, glowing)
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(27, 8, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255, 215, 0, 0.5)';
        ctx.beginPath();
        ctx.arc(27, 8, 6, 0, Math.PI * 2);
        ctx.fill();
        
        // Sleeves
        ctx.fillStyle = '#daa520';
        ctx.fillRect(2, 20, 6, 10);
        ctx.fillRect(24, 20, 6, 10);
        
        // Hands
        ctx.fillStyle = '#e8beac';
        ctx.fillRect(3, 28, 4, 4);
        ctx.fillRect(25, 28, 4, 4);
    });
}

// Dharma Wheel - 8-spoked wheel (for wizards and player)
function createDharmaWheelTexture() {
    return createPixelTexture(32, 32, (ctx, w, h) => {
        const cx = 16, cy = 16, r = 14;
        
        // Glow
        ctx.fillStyle = 'rgba(255, 215, 0, 0.4)';
        ctx.beginPath();
        ctx.arc(cx, cy, r + 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Outer ring
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
        
        // Inner ring
        ctx.beginPath();
        ctx.arc(cx, cy, r * 0.35, 0, Math.PI * 2);
        ctx.stroke();
        
        // 8 spokes with pointed ends
        ctx.lineWidth = 2;
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const innerR = r * 0.35;
            
            // Main spoke
            ctx.beginPath();
            ctx.moveTo(cx + Math.cos(angle) * innerR, cy + Math.sin(angle) * innerR);
            ctx.lineTo(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
            ctx.stroke();
            
            // Pointed tip (spike)
            ctx.fillStyle = '#ffd700';
            ctx.beginPath();
            ctx.moveTo(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
            ctx.lineTo(cx + Math.cos(angle - 0.2) * (r - 3), cy + Math.sin(angle - 0.2) * (r - 3));
            ctx.lineTo(cx + Math.cos(angle + 0.2) * (r - 3), cy + Math.sin(angle + 0.2) * (r - 3));
            ctx.fill();
        }
        
        // Center hub
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(cx, cy, 4, 0, Math.PI * 2);
        ctx.fill();
    });
}

// Player's Dharma Wheel - Larger, more ornate
function createPlayerDharmaWheelTexture() {
    return createPixelTexture(48, 48, (ctx, w, h) => {
        const cx = 24, cy = 24, r = 20;
        
        // Strong glow
        ctx.fillStyle = 'rgba(255, 215, 0, 0.5)';
        ctx.beginPath();
        ctx.arc(cx, cy, r + 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Outer ring
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
        
        // Secondary ring
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, r * 0.7, 0, Math.PI * 2);
        ctx.stroke();
        
        // Inner ring
        ctx.beginPath();
        ctx.arc(cx, cy, r * 0.35, 0, Math.PI * 2);
        ctx.stroke();
        
        // 8 ornate spokes
        ctx.lineWidth = 3;
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const innerR = r * 0.35;
            
            // Main spoke
            ctx.beginPath();
            ctx.moveTo(cx + Math.cos(angle) * innerR, cy + Math.sin(angle) * innerR);
            ctx.lineTo(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
            ctx.stroke();
            
            // Large pointed spike
            ctx.fillStyle = '#ffd700';
            ctx.beginPath();
            ctx.moveTo(cx + Math.cos(angle) * (r + 4), cy + Math.sin(angle) * (r + 4));
            ctx.lineTo(cx + Math.cos(angle - 0.25) * (r - 4), cy + Math.sin(angle - 0.25) * (r - 4));
            ctx.lineTo(cx + Math.cos(angle + 0.25) * (r - 4), cy + Math.sin(angle + 0.25) * (r - 4));
            ctx.fill();
        }
        
        // Center hub with detail
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(cx, cy, 6, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#b8860b';
        ctx.beginPath();
        ctx.arc(cx, cy, 3, 0, Math.PI * 2);
        ctx.fill();
    });
}

// ============================================
// TEXTURE INITIALIZATION
// ============================================
function initEncounterTextures() {
    console.log('Initializing encounter textures...');
    
    encounterState.textures = {
        // Encounter structures
        princessTower: createPrincessTowerTexture(),
        swordInStone: createSwordInStoneTexture(),
        emptyStone: createEmptyStoneTexture(),
        witchHut: createWitchHutTexture(),
        
        // NPCs
        princess: createPrincessTexture(),
        witch: createWitchTexture(),
        goldenSkeleton: createGoldenSkeletonTexture(),
        
        // Bosses
        landGiant: createLandGiantTexture(),
        
        // Effects
        heart: createHeartTexture(),
        
        // Treasure chests
        treasureChest: createTreasureChestTexture(),
        openChest: createOpenChestTexture(),
        
        // Cloud arena - Stage 0
        beanstalk: createBeanstalkPortalTexture(),
        portalParticle: createPortalParticleTexture(),
        cloudGround: createCloudGroundTexture(),
        cloudSprite: createCloudSpriteTexture(),
        skyGiant: createSkyGiantTexture(),
        
        // Cloud arena - Stage 1 (Giant Troll)
        giantTroll: createGiantTrollTexture(),
        giantClub: createGiantClubTexture(),
        trollRock: createTrollRockTexture(),
        
        // Cloud arena - Stage 2 (Ghost Trio)
        giantGhost: createGiantGhostTexture(),
        giantSkeleton: createGiantSkeletonTexture(),
        giantSlime: createGiantSlimeTexture(),
        
        // Dharmachakra encounter
        dharmachakraShrine: createDharmachakraShrineTexture(),
        dharmaWizard: createDharmaWizardTexture(),
        dharmaWheel: createDharmaWheelTexture(),
        playerDharmaWheel: createPlayerDharmaWheelTexture()
    };
    
    console.log('Encounter textures initialized:', Object.keys(encounterState.textures).length, 'textures');
    if (typeof debug === 'function') {
        debug('Textures: ' + Object.keys(encounterState.textures).length);
        debug('Has princessTower: ' + !!encounterState.textures.princessTower);
        debug('Has beanstalk: ' + !!encounterState.textures.beanstalk);
    }
}

// ============================================
// HELPER: CHECK IF ENCOUNTER SYSTEM IS BUSY
// ============================================
function isEncounterSystemBusy() {
    return encounterState.currentEncounter !== null ||
           encounterState.cloudPortal !== null ||
           encounterState.inCloudArena ||
           (typeof isMonsterStoreActive === 'function' && isMonsterStoreActive());
}

// ============================================
// SPAWN CHECKS
// ============================================

// Check if ANY major event (boss or encounter) can spawn
function canSpawnMajorEvent() {
    if (encounterState.currentEncounter) {
        // Don't spam debug for this common case
        return false;
    }
    if (gameState.bosses.length > 0) return false;
    if (encounterState.cloudPortal) return false;
    if (encounterState.inCloudArena) return false;
    if (typeof isMonsterStoreActive === 'function' && isMonsterStoreActive()) return false;
    
    const level = gameState.player.level;
    if (level < 5) return false; // Major events start at level 5
    
    return true;
}

// Legacy function - now just checks if allowed (probability handled by main loop)
function shouldSpawnEncounter() {
    if (!canSpawnMajorEvent()) return false;
    
    // Check for guaranteed encounters
    if (hasGuaranteedEncounter()) {
        return true;
    }
    
    return true; // Probability handled by main spawn logic
}

// Check if portal can spawn (uses arenaStage, not level limits)
function shouldSpawnPortal() {
    if (encounterState.inCloudArena) {
        if (typeof debug === 'function') debug('Portal blocked: inArena');
        return false;
    }
    if (encounterState.cloudPortal) {
        if (typeof debug === 'function') debug('Portal blocked: portalExists');
        return false;
    }
    if (encounterState.arenaStage >= 3) {
        if (typeof debug === 'function') debug('Portal blocked: stage>=3');
        return false;
    }
    if (gameState.bosses.length > 0) {
        if (typeof debug === 'function') debug('Portal blocked: bossActive');
        return false;
    }
    if (encounterState.currentEncounter) {
        if (typeof debug === 'function') debug('Portal blocked: encounter active');
        return false;
    }
    if (typeof isMonsterStoreActive === 'function' && isMonsterStoreActive()) {
        if (typeof debug === 'function') debug('Portal blocked: store active');
        return false;
    }
    
    if (typeof debug === 'function') debug('Portal CAN spawn');
    return true;
}

function shouldSpawnChest() {
    if (encounterState.treasureChests.length >= TREASURE_CHEST_CONFIG.maxChests) return false;
    return Math.random() < TREASURE_CHEST_CONFIG.spawnChance;
}

// Special spawn function for Dharmachakra encounter
function spawnDharmachakraEncounter() {
    const template = ENCOUNTER_TEMPLATES.dharmachakra;
    
    // Calculate spawn position
    const angle = Math.random() * Math.PI * 2;
    const dist = CONFIG.enemySpawnRadius * 1.3;
    const x = gameState.player.position.x + Math.cos(angle) * dist;
    const z = gameState.player.position.z + Math.sin(angle) * dist;
    
    // Create shrine
    const material = new THREE.SpriteMaterial({
        map: encounterState.textures.dharmachakraShrine,
        transparent: true
    });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(template.scale[0], template.scale[1], 1);
    sprite.position.set(x, template.scale[1] / 2, z);
    scene.add(sprite);
    
    // Spawn dharma wizards with orbiting wheels
    const guards = [];
    encounterState.wizardWheels = [];
    
    for (let i = 0; i < template.guards.count; i++) {
        const guardAngle = (i / template.guards.count) * Math.PI * 2;
        const guardDist = 8 + Math.random() * 6;
        const gx = x + Math.cos(guardAngle) * guardDist;
        const gz = z + Math.sin(guardAngle) * guardDist;
        
        // Wizard sprite
        const guardMaterial = new THREE.SpriteMaterial({
            map: encounterState.textures.dharmaWizard,
            transparent: true
        });
        const guardSprite = new THREE.Sprite(guardMaterial);
        guardSprite.scale.set(3, 4.5, 1);
        guardSprite.position.set(gx, 2.25, gz);
        scene.add(guardSprite);
        
        const baseHealth = CONFIG.enemyBaseHealth * (1 + gameState.player.level * 0.2) * template.guards.healthMultiplier;
        const guard = {
            sprite: guardSprite,
            health: baseHealth,
            maxHealth: baseHealth,
            damage: CONFIG.enemyBaseDamage * (1 + gameState.player.level * 0.15) * 1.5,
            speed: 0.05,
            attackCooldown: 0,
            hitFlash: 0,
            dialogueCooldown: 0,
            isDharmaWizard: true
        };
        guards.push(guard);
        
        // Orbiting dharma wheel for this wizard
        const wheelMaterial = new THREE.SpriteMaterial({
            map: encounterState.textures.dharmaWheel,
            transparent: true
        });
        const wheelSprite = new THREE.Sprite(wheelMaterial);
        wheelSprite.scale.set(3, 3, 1);
        scene.add(wheelSprite);
        
        encounterState.wizardWheels.push({
            sprite: wheelSprite,
            owner: guard,
            angle: Math.random() * Math.PI * 2,
            speed: 0.04 + Math.random() * 0.02,
            radius: 4, // Further out than swords
            damage: CONFIG.enemyBaseDamage * (1 + gameState.player.level * 0.15)
        });
    }
    
    encounterState.encounterGuards = guards;
    
    encounterState.currentEncounter = {
        template,
        sprite,
        position: new THREE.Vector3(x, 0, z),
        guardsDefeated: false,
        npcSpawned: false,
        npc: null,
        rewardGiven: false,
        dharmaDialogueCount: 0 // Track number of combat dialogues shown (capped at 3)
    };
    
    gameState.targetCameraZoom = template.cameraZoom;
    
    // Show intro dialogue
    const randomDialogue = template.combatDialogues[Math.floor(Math.random() * template.combatDialogues.length)];
    showDialogue('☸️ DHARMACHAKRA SHRINE', `The Dogmatic Buddhists guard the sacred wheel! One of them shouts: ${randomDialogue}`);
    
    console.log('Spawned Dharmachakra encounter with', guards.length, 'dharma wizards');
}

// Spawn a specific encounter by key
function spawnSpecificEncounter(templateKey) {
    if (typeof debug === 'function') debug('spawnSpec: ' + templateKey);
    
    try {
        const template = ENCOUNTER_TEMPLATES[templateKey];
        if (!template) {
            if (typeof debug === 'function') debug('NO TEMPLATE: ' + templateKey);
            console.error('Unknown encounter template:', templateKey);
            return;
        }
        
        // Check texture exists
        if (!encounterState.textures[template.textureKey]) {
            if (typeof debug === 'function') debug('NO TEXTURE: ' + template.textureKey);
            return;
        }
        
        if (typeof debug === 'function') debug('Template+texture OK');
        
        // Calculate spawn position
        const angle = Math.random() * Math.PI * 2;
        const dist = CONFIG.enemySpawnRadius * 1.3;
        const x = gameState.player.position.x + Math.cos(angle) * dist;
        const z = gameState.player.position.z + Math.sin(angle) * dist;
        
        // Create main structure sprite
        const material = new THREE.SpriteMaterial({
            map: encounterState.textures[template.textureKey],
            transparent: true
        });
        const sprite = new THREE.Sprite(material);
        sprite.scale.set(template.scale[0], template.scale[1], 1);
        sprite.position.set(x, template.scale[1] / 2, z);
        scene.add(sprite);
    
    // Spawn guards
    const guards = [];
    for (let i = 0; i < template.guards.count; i++) {
        const guardAngle = (i / template.guards.count) * Math.PI * 2;
        const guardDist = 6 + Math.random() * 4;
        const gx = x + Math.cos(guardAngle) * guardDist;
        const gz = z + Math.sin(guardAngle) * guardDist;
        
        let guardTexture, guardScale;
        
        if (template.guards.customTexture) {
            guardTexture = encounterState.textures[template.guards.type];
            guardScale = [2.5, 4];
        } else {
            const enemyType = enemyTypes.find(t => t.name === template.guards.type);
            if (enemyType) {
                guardTexture = enemyType.texture();
                guardScale = enemyType.scale;
            } else {
                guardTexture = createGoblinTexture();
                guardScale = [2.5, 3.2];
            }
        }
        
        const guardMaterial = new THREE.SpriteMaterial({
            map: guardTexture,
            transparent: true
        });
        const guardSprite = new THREE.Sprite(guardMaterial);
        guardSprite.scale.set(guardScale[0], guardScale[1], 1);
        guardSprite.position.set(gx, guardScale[1] / 2, gz);
        scene.add(guardSprite);
        
        const baseHealth = CONFIG.enemyBaseHealth * (1 + gameState.player.level * 0.2) * template.guards.healthMultiplier;
        guards.push({
            sprite: guardSprite,
            health: baseHealth,
            maxHealth: baseHealth,
            damage: CONFIG.enemyBaseDamage * (1 + gameState.player.level * 0.15),
            speed: 0.06,
            attackCooldown: 0,
            hitFlash: 0
        });
    }
    
    encounterState.encounterGuards = guards;
    
    encounterState.currentEncounter = {
        template,
        sprite,
        position: new THREE.Vector3(x, 0, z),
        guardsDefeated: false,
        npcSpawned: false,
        npc: null,
        rewardGiven: false
    };
    
    gameState.targetCameraZoom = template.cameraZoom;
    
    console.log('Spawned specific encounter:', template.name);
    
    // Use spawn dialogue if available, otherwise use default
    if (template.spawnDialogue) {
        showDialogue(template.spawnDialogue.speaker, template.spawnDialogue.text);
    } else {
        showDialogue('⚔️ ' + template.displayName.toUpperCase(), `A ${template.displayName} has appeared! Defeat the guards to claim your reward!`);
    }
    
    } catch (error) {
        if (typeof debug === 'function') debug('spawnSpec ERROR: ' + error.message);
        console.error('Error in spawnSpecificEncounter:', error);
    }
}

// ============================================
// ENCOUNTER SPAWNING
// ============================================
// ===========================================
// STORY SEQUENCE SPAWNING SYSTEM
// ===========================================

// Get the current story event to spawn
function getCurrentStoryEvent() {
    if (encounterState.storyStage >= STORY_SEQUENCE.length) {
        return null; // Story complete
    }
    return STORY_SEQUENCE[encounterState.storyStage];
}

// Advance to the next story stage
function advanceStoryStage() {
    encounterState.storyStage++;
    console.log('Story advanced to stage:', encounterState.storyStage, 
                '- Next event:', getCurrentStoryEvent());
}

// Check if story is complete
function isStoryComplete() {
    return encounterState.storyStage >= STORY_SEQUENCE.length || 
           getCurrentStoryEvent() === 'storyComplete';
}

// Main story encounter spawn function
function spawnStoryEncounter() {
    const event = getCurrentStoryEvent();
    
    if (!event || event === 'storyComplete') {
        console.log('Story complete! Spawning random encounter instead.');
        spawnRandomEncounter();
        return;
    }
    
    console.log('Spawning story event:', event, '(Stage', encounterState.storyStage, ')');
    
    // Handle boss events
    if (event.startsWith('boss_')) {
        const bossType = event.replace('boss_', '');
        console.log('Spawning story boss:', bossType);
        
        if (typeof spawnSpecificBoss === 'function') {
            spawnSpecificBoss(bossType);
        } else if (typeof spawnBoss === 'function') {
            // Fallback to random boss spawn if specific spawn not available
            spawnBoss();
        } else {
            console.warn('Boss spawn not available, advancing story');
            advanceStoryStage();
        }
        return;
    }
    
    // Handle special event types
    if (event === 'cloudPortal') {
        spawnCloudPortal();
        return;
    }
    
    if (event === 'monsterStore') {
        if (typeof spawnMonsterStore === 'function') {
            spawnMonsterStore();
        } else {
            console.warn('Monster store not available, advancing story');
            advanceStoryStage();
        }
        return;
    }
    
    // Handle dharmachakra specially (has custom spawn logic)
    if (event === 'dharmachakra') {
        spawnDharmachakraEncounter();
        return;
    }
    
    // Standard encounter spawning
    const template = ENCOUNTER_TEMPLATES[event];
    if (!template) {
        console.error('Unknown encounter template:', event);
        advanceStoryStage();
        return;
    }
    
    spawnSpecificEncounter(event);
}

// ===========================================
// BOSS SPAWN AND DEFEAT HANDLING
// ===========================================

// Spawn a specific boss type (called from story sequence)
// This wrapper calls the actual boss spawn function from bosses.js
function spawnSpecificBoss(bossType) {
    console.log('Story boss spawn requested:', bossType);
    
    // If bosses.js has a spawnBossOfType function, use it
    if (typeof spawnBossOfType === 'function') {
        spawnBossOfType(bossType);
        return;
    }
    
    // Otherwise, try to use the bossTypes array and spawn manually
    if (typeof bossTypes !== 'undefined' && typeof spawnBossFromType === 'function') {
        const bossTypeObj = bossTypes.find(b => b.name === bossType);
        if (bossTypeObj) {
            spawnBossFromType(bossTypeObj);
            return;
        }
    }
    
    // Fallback: Just spawn a random boss
    if (typeof spawnBoss === 'function') {
        console.log('Falling back to random boss spawn');
        spawnBoss();
    } else {
        console.error('No boss spawn function available!');
        advanceStoryStage(); // Skip this boss
    }
}

// Called when a boss is defeated - advances story if current event is a boss
function onBossDefeated() {
    const currentEvent = getCurrentStoryEvent();
    
    // Only advance story if we're currently on a boss event
    if (currentEvent && currentEvent.startsWith('boss_')) {
        console.log('Boss defeated, advancing story from:', currentEvent);
        advanceStoryStage();
    }
}

// Expose globally so bosses.js can call it
window.onBossDefeated = onBossDefeated;
window.spawnSpecificBoss = spawnSpecificBoss;

// Spawn a random encounter (for after story is complete)
function spawnRandomEncounter() {
    const available = getAvailableEncounters(gameState.player.level);
    if (available.length === 0) return;
    
    const index = Math.floor(Math.random() * available.length);
    const template = available[index];
    console.log('Spawning random encounter:', template.name);
    
    // Calculate spawn position
    const angle = Math.random() * Math.PI * 2;
    const dist = CONFIG.enemySpawnRadius * 1.3;
    const x = gameState.player.position.x + Math.cos(angle) * dist;
    const z = gameState.player.position.z + Math.sin(angle) * dist;
    
    // Create main structure sprite
    const material = new THREE.SpriteMaterial({
        map: encounterState.textures[template.textureKey],
        transparent: true
    });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(template.scale[0], template.scale[1], 1);
    sprite.position.set(x, template.scale[1] / 2, z);
    scene.add(sprite);
    
    // Spawn guards
    const guards = [];
    for (let i = 0; i < template.guards.count; i++) {
        const guardAngle = (i / template.guards.count) * Math.PI * 2;
        const guardDist = 6 + Math.random() * 4;
        const gx = x + Math.cos(guardAngle) * guardDist;
        const gz = z + Math.sin(guardAngle) * guardDist;
        
        let guardTexture, guardScale;
        
        if (template.guards.customTexture) {
            guardTexture = encounterState.textures[template.guards.type];
            guardScale = [2.5, 4];
        } else {
            const enemyType = enemyTypes.find(t => t.name === template.guards.type);
            if (enemyType) {
                guardTexture = enemyType.texture();
                guardScale = enemyType.scale;
            } else {
                guardTexture = createGoblinTexture();
                guardScale = [2.5, 3.2];
            }
        }
        
        const guardMaterial = new THREE.SpriteMaterial({
            map: guardTexture,
            transparent: true
        });
        const guardSprite = new THREE.Sprite(guardMaterial);
        guardSprite.scale.set(guardScale[0], guardScale[1], 1);
        guardSprite.position.set(gx, guardScale[1] / 2, gz);
        scene.add(guardSprite);
        
        const baseHealth = CONFIG.enemyBaseHealth * (1 + gameState.player.level * 0.2);
        const guard = {
            sprite: guardSprite,
            health: baseHealth * template.guards.healthMultiplier,
            maxHealth: baseHealth * template.guards.healthMultiplier,
            damage: CONFIG.enemyBaseDamage * (1 + gameState.player.level * 0.15),
            speed: 0.04,
            attackCooldown: 0,
            hitFlash: 0,
            isGuard: true
        };
        guards.push(guard);
    }
    encounterState.encounterGuards = guards;
    
    // Create encounter state
    encounterState.currentEncounter = {
        template: template,
        sprite: sprite,
        position: new THREE.Vector3(x, 0, z),
        complete: false,
        rewardGiven: false,
        npc: null,
        heartEffect: null,
        cleanupTimer: undefined
    };
    
    gameState.targetCameraZoom = template.cameraZoom;
}

// Legacy function - now calls story spawn
function spawnEncounter() {
    spawnStoryEncounter();
}

// ============================================
// ENCOUNTER UPDATE
// ============================================
function updateEncounter() {
    if (!encounterState.currentEncounter) return;
    
    const enc = encounterState.currentEncounter;
    const template = enc.template;
    
    // Update guards (pause during dialogue)
    if (gameState.dialogueTimer <= 0) {
        for (let i = encounterState.encounterGuards.length - 1; i >= 0; i--) {
            const guard = encounterState.encounterGuards[i];
            
            const dx = gameState.player.position.x - guard.sprite.position.x;
            const dz = gameState.player.position.z - guard.sprite.position.z;
            const dist = Math.sqrt(dx * dx + dz * dz);
            
            // Move toward player
            if (dist > 1.5) {
                guard.sprite.position.x += (dx / dist) * guard.speed;
                guard.sprite.position.z += (dz / dist) * guard.speed;
            } else if (guard.attackCooldown <= 0) {
                takeDamage(guard.damage);
                guard.attackCooldown = 60;
            }
            
            guard.attackCooldown = Math.max(0, guard.attackCooldown - 1);
            
            // Hit flash
            if (guard.hitFlash > 0) {
                guard.hitFlash--;
                guard.sprite.material.color.setHex(guard.hitFlash % 4 < 2 ? 0xffffff : 0xff0000);
            } else {
                guard.sprite.material.color.setHex(0xffffff);
            }
            
            // Dharma wizard random combat dialogue (capped at 3 total)
            if (guard.isDharmaWizard && guard.dialogueCooldown !== undefined) {
                guard.dialogueCooldown = Math.max(0, guard.dialogueCooldown - 1);
                const dialogueCap = 3;
                const currentCount = enc.dharmaDialogueCount || 0;
                if (guard.dialogueCooldown <= 0 && Math.random() < 0.001 && gameState.dialogueTimer <= 0 && currentCount < dialogueCap) {
                    const dialogues = template.combatDialogues;
                    if (dialogues && dialogues.length > 0) {
                        const randomDialogue = dialogues[Math.floor(Math.random() * dialogues.length)];
                        showDialogue('☸️ DOGMATIC BUDDHIST', randomDialogue);
                        guard.dialogueCooldown = 600; // 10 seconds cooldown
                        enc.dharmaDialogueCount = currentCount + 1; // Increment dialogue counter
                    }
                }
            }
        }
        
        // Update wizard dharma wheels (orbit around their owners, damage player)
        updateWizardDharmaWheels();
    }
    
    // Check if all guards defeated
    if (encounterState.encounterGuards.length === 0 && !enc.complete) {
        enc.complete = true;
        onEncounterComplete(enc, template);
    }
    
    // Handle post-completion behavior
    if (enc.complete && !enc.rewardGiven) {
        updateEncounterPostComplete(enc, template);
    }
    
    // Update heart effect
    if (enc.heartEffect) {
        enc.heartEffect.position.y += 0.05;
        enc.heartEffect.material.opacity -= 0.01;
        if (enc.heartEffect.material.opacity <= 0) {
            scene.remove(enc.heartEffect);
            enc.heartEffect = null;
        }
    }
    
    // Cleanup logic
    const dx = gameState.player.position.x - enc.position.x;
    const dz = gameState.player.position.z - enc.position.z;
    const dist = Math.sqrt(dx * dx + dz * dz);
    
    // Timer-based cleanup
    if (enc.rewardGiven && enc.cleanupTimer !== undefined) {
        enc.cleanupTimer--;
        if (enc.cleanupTimer <= 0) {
            cleanupEncounter();
            return;
        }
    }
    
    // Distance-based cleanup (only if reward was given)
    if (dist > CONFIG.renderDistance * 3 && enc.rewardGiven) {
        cleanupEncounter();
    }
}

function onEncounterComplete(enc, template) {
    if (template.onComplete === 'spawnNPC' && template.npc) {
        // Spawn NPC
        const npcMaterial = new THREE.SpriteMaterial({
            map: encounterState.textures[template.npc.textureKey],
            transparent: true
        });
        const npc = new THREE.Sprite(npcMaterial);
        npc.scale.set(template.npc.scale[0], template.npc.scale[1], 1);
        npc.position.copy(enc.position);
        
        if (template.npc.spawnOffset) {
            npc.position.x += template.npc.spawnOffset.x;
            npc.position.z += template.npc.spawnOffset.z;
        }
        
        npc.position.y = template.npc.scale[1] / 2;
        scene.add(npc);
        enc.npc = npc;
    } else if (template.onComplete === 'interactWithStructure') {
        // Show dialogue hint
        showDialogue('✨ MAGICAL SWORD', 'Touch the stone to claim your reward!');
    } else if (template.onComplete === 'spawnLandGiant') {
        // Sword in Stone Act 3: Spawn the Land Giant boss
        spawnLandGiant();
    }
}

function updateEncounterPostComplete(enc, template) {
    if (template.npc && template.npc.walksToPlayer && enc.npc) {
        // NPC walks toward player
        const dx = gameState.player.position.x - enc.npc.position.x;
        const dz = gameState.player.position.z - enc.npc.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        
        if (dist > 2) {
            enc.npc.position.x += (dx / dist) * 0.06;
            enc.npc.position.z += (dz / dist) * 0.06;
        } else if (template.npc.rewardOnContact) {
            if (template.name === 'princessTower') {
                // Special case: princess shows heart
                spawnHeartEffect(enc.npc.position.clone());
                showDialogue('💕 PRINCESS', '"My attractive hero! Please accept this gift... I think I\'ll stay in this forest for a while. Maybe practice some magic...!"');
                
                // Advance story stage
                encounterState.storyEncounterStage = 1; // Next: Witch
            } else if (template.name === 'witchHut') {
                // Advance story stage after witch
                encounterState.storyEncounterStage = 2; // Next: Dharmachakra
                if (template.npc.dialogue) {
                    showDialogue(template.npc.dialogue.speaker, template.npc.dialogue.text);
                }
            } else if (template.npc.dialogue) {
                showDialogue(template.npc.dialogue.speaker, template.npc.dialogue.text);
            }
            giveEncounterReward(enc, template);
        }
    } else if (template.onComplete === 'interactWithStructure') {
        // Check if player is near structure
        const dx = gameState.player.position.x - enc.position.x;
        const dz = gameState.player.position.z - enc.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        
        if (dist < (template.interactionRange || 3)) {
            if (template.completionDialogue) {
                showDialogue(template.completionDialogue.speaker, template.completionDialogue.text);
            }
            giveEncounterReward(enc, template);
        }
    } else if (template.onComplete === 'grantDharmaWheel') {
        // Dharmachakra: approach shrine after defeating all wizards
        const dx = gameState.player.position.x - enc.position.x;
        const dz = gameState.player.position.z - enc.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        
        if (dist < 5) {
            giveEncounterReward(enc, template);
        }
    }
}

function spawnHeartEffect(position) {
    const material = new THREE.SpriteMaterial({
        map: encounterState.textures.heart,
        transparent: true
    });
    const heart = new THREE.Sprite(material);
    heart.scale.set(3, 3, 1);
    heart.position.copy(position);
    heart.position.y = 4;
    scene.add(heart);
    encounterState.currentEncounter.heartEffect = heart;
}

function giveEncounterReward(enc, template) {
    if (enc.rewardGiven) return;
    
    enc.rewardGiven = true;
    enc.cleanupTimer = 30 * 60; // 30 seconds at 60fps
    
    const reward = template.reward;
    
    if (reward.type === 'upgrade') {
        const upgrade = gameState.upgrades[reward.upgrade];
        if (upgrade.level < upgrade.maxLevel) {
            upgrade.level++;
            
            // Apply upgrade effects
            if (reward.upgrade === 'swords') {
                updateSwordCount();
            } else if (reward.upgrade === 'boom') {
                updateBoomIndicator();
                document.getElementById('boomCooldown').classList.add('active');
            }
            
            showReward(reward.text);
            updateUpgradeMenu();
        } else {
            // Already maxed - give gold
            const goldReward = 1000;
            gameState.player.gold += goldReward;
            document.getElementById('goldNum').textContent = gameState.player.gold;
            showReward(`💰 ${goldReward} GOLD (Upgrade already maxed!)`);
        }
    } else if (reward.type === 'gold') {
        // Gold reward type (used by Sword in Stone Act 2)
        const goldAmount = reward.amount || 100;
        gameState.player.gold += goldAmount;
        document.getElementById('goldNum').textContent = gameState.player.gold;
        showReward(reward.text);
    } else if (reward.type === 'dharmaWheel') {
        // Grant the dharma wheel to the player
        if (!gameState.hasDharmaWheel) {
            gameState.hasDharmaWheel = true;
            gameState.dharmaWheelAngle = 0;
            spawnPlayerDharmaWheel();
            showReward(reward.text);
            showDialogue('☸️ ENLIGHTENMENT', '"The Wheel of Dharma now orbits your being. Use it wisely... or don\'t. The Buddha has no strong opinions either way. "');
        } else {
            // Already have it - give gold
            const goldReward = 2000;
            gameState.player.gold += goldReward;
            document.getElementById('goldNum').textContent = gameState.player.gold;
            showReward(`💰 ${goldReward} GOLD (Already enlightened!)`);
        }
    } else if (reward.type === 'bonusSwords') {
        // Bonus swords from Land Giant - handled in onLandGiantDefeated
        // This case shouldn't normally be reached since the giant handles its own reward
        if (!gameState.hasBonusSwords) {
            spawnBonusSwords();
            showReward(reward.text);
        } else {
            // Already have them - give gold
            const goldReward = 2500;
            gameState.player.gold += goldReward;
            document.getElementById('goldNum').textContent = gameState.player.gold;
            showReward(`💰 ${goldReward} GOLD (Already have giant's blades!)`);
        }
    }
    
    // Advance story stage when encounter is completed
    advanceStoryStage();
    
    gameState.targetCameraZoom = 1;
}

function cleanupEncounter() {
    const enc = encounterState.currentEncounter;
    if (!enc) return;
    
    console.log('Cleaning up encounter:', enc.template.name);
    
    scene.remove(enc.sprite);
    if (enc.npc) scene.remove(enc.npc);
    if (enc.heartEffect) scene.remove(enc.heartEffect);
    
    // Clean up guards
    encounterState.encounterGuards.forEach(g => scene.remove(g.sprite));
    encounterState.encounterGuards = [];
    
    // Clean up wizard dharma wheels
    encounterState.wizardWheels.forEach(w => scene.remove(w.sprite));
    encounterState.wizardWheels = [];
    
    encounterState.currentEncounter = null;
    gameState.targetCameraZoom = 1;
    hideDialogue();
}

// ============================================
// GUARD DAMAGE (called from main game)
// ============================================
function damageEncounterGuard(guard, damage) {
    guard.health -= damage;
    guard.hitFlash = 10;
    
    if (guard.health <= 0) {
        // Drop XP and maybe gold
        spawnXPOrb(guard.sprite.position.clone(), 15);
        if (Math.random() < 0.3) {
            spawnGoldOrb(guard.sprite.position.clone(), 8);
        }
        
        // If this is a dharma wizard, remove their orbiting wheel
        if (guard.isDharmaWizard) {
            for (let i = encounterState.wizardWheels.length - 1; i >= 0; i--) {
                if (encounterState.wizardWheels[i].owner === guard) {
                    scene.remove(encounterState.wizardWheels[i].sprite);
                    encounterState.wizardWheels.splice(i, 1);
                    break;
                }
            }
        }
        
        scene.remove(guard.sprite);
        const idx = encounterState.encounterGuards.indexOf(guard);
        if (idx > -1) encounterState.encounterGuards.splice(idx, 1);
        gameState.kills++;
        document.getElementById('kills').textContent = gameState.kills;
    }
}

// ============================================
// WIZARD DHARMA WHEELS (orbit around dharma wizards)
// ============================================
function updateWizardDharmaWheels() {
    if (!encounterState || !encounterState.wizardWheels) return;
    
    for (let i = encounterState.wizardWheels.length - 1; i >= 0; i--) {
        const wheel = encounterState.wizardWheels[i];
        if (!wheel || !wheel.sprite) {
            encounterState.wizardWheels.splice(i, 1);
            continue;
        }
        
        // Check if owner still exists
        if (!wheel.owner || !wheel.owner.sprite || encounterState.encounterGuards.indexOf(wheel.owner) === -1) {
            scene.remove(wheel.sprite);
            encounterState.wizardWheels.splice(i, 1);
            continue;
        }
        
        // Orbit around owner
        wheel.angle += wheel.speed;
        wheel.sprite.position.x = wheel.owner.sprite.position.x + Math.cos(wheel.angle) * wheel.radius;
        wheel.sprite.position.z = wheel.owner.sprite.position.z + Math.sin(wheel.angle) * wheel.radius;
        wheel.sprite.position.y = 2;
        
        // Rotate the wheel sprite
        wheel.sprite.material.rotation = wheel.angle * 2;
        
        // Check collision with player
        const dx = gameState.player.position.x - wheel.sprite.position.x;
        const dz = gameState.player.position.z - wheel.sprite.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        
        if (dist < 2) {
            takeDamage(wheel.damage * 0.02);
        }
    }
}

// ============================================
// PLAYER DHARMA WHEEL (reward from Dharmachakra encounter)
// ============================================
function spawnPlayerDharmaWheel() {
    if (encounterState.playerDharmaWheel) return; // Already exists
    
    const material = new THREE.SpriteMaterial({
        map: encounterState.textures.playerDharmaWheel,
        transparent: true
    });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(4, 4, 1); // Larger and more impressive
    scene.add(sprite);
    
    encounterState.playerDharmaWheel = {
        sprite,
        angle: 0,
        radius: 5, // Orbits further out than swords
        speed: 0.03
    };
    gameState.hasDharmaWheel = true; // Use gameState for persistence
    
    console.log('Player dharma wheel spawned!');
}

function updatePlayerDharmaWheel() {
    // Early exit if not applicable
    if (!gameState || !gameState.hasDharmaWheel) return;
    if (!encounterState || !encounterState.playerDharmaWheel) return;
    if (!encounterState.playerDharmaWheel.sprite) return;
    
    const wheel = encounterState.playerDharmaWheel;
    
    // Orbit around player (further out than swords)
    wheel.angle += wheel.speed;
    wheel.sprite.position.x = gameState.player.position.x + Math.cos(wheel.angle) * wheel.radius;
    wheel.sprite.position.z = gameState.player.position.z + Math.sin(wheel.angle) * wheel.radius;
    wheel.sprite.position.y = 1.5;
    
    // Rotate the wheel sprite for visual effect
    wheel.sprite.material.rotation = wheel.angle * 3;
    
    // Deal damage to enemies (equivalent to 4 swords)
    const baseSwordDamage = CONFIG.projectileBaseDamage * (1 + gameState.player.level * 0.25);
    const wheelDamage = baseSwordDamage * 4; // 4x sword damage
    
    // Check collision with regular enemies
    for (const enemy of gameState.enemies) {
        const dx = enemy.sprite.position.x - wheel.sprite.position.x;
        const dz = enemy.sprite.position.z - wheel.sprite.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        
        if (dist < 2.5) {
            enemy.health -= wheelDamage * 0.02;
            enemy.hitFlash = 5;
        }
    }
    
    // Check collision with bosses
    for (const boss of gameState.bosses) {
        const dx = boss.sprite.position.x - wheel.sprite.position.x;
        const dz = boss.sprite.position.z - wheel.sprite.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        
        if (dist < 3) {
            boss.health -= wheelDamage * 0.02;
            boss.hitFlash = 5;
        }
    }
    
    // Check collision with encounter guards
    for (const guard of encounterState.encounterGuards) {
        const dx = guard.sprite.position.x - wheel.sprite.position.x;
        const dz = guard.sprite.position.z - wheel.sprite.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        
        if (dist < 2.5) {
            guard.health -= wheelDamage * 0.02;
            guard.hitFlash = 5;
        }
    }
    
    // Check collision with arena enemies
    for (const enemy of encounterState.arenaEnemies) {
        const dx = enemy.sprite.position.x - wheel.sprite.position.x;
        const dz = enemy.sprite.position.z - wheel.sprite.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        
        if (dist < 2.5) {
            enemy.health -= wheelDamage * 0.02;
            enemy.hitFlash = 5;
        }
    }
    
    // Check collision with arena bosses
    for (const boss of encounterState.arenaBosses) {
        const dx = boss.sprite.position.x - wheel.sprite.position.x;
        const dz = boss.sprite.position.z - wheel.sprite.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        
        if (dist < 3) {
            boss.health -= wheelDamage * 0.02;
            boss.hitFlash = 5;
        }
    }
    
    // Check collision with forest cloud sprites
    for (const enemy of encounterState.forestCloudSprites) {
        const dx = enemy.sprite.position.x - wheel.sprite.position.x;
        const dz = enemy.sprite.position.z - wheel.sprite.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        
        if (dist < 2.5) {
            enemy.health -= wheelDamage * 0.02;
            enemy.hitFlash = 5;
        }
    }
}

// ============================================
// BONUS SWORDS (reward from Land Giant)
// ============================================
// Creates a simple sword texture for the bonus swords
function createBonusSwordTexture() {
    return createPixelTexture(16, 32, (ctx, w, h) => {
        // Blade
        ctx.fillStyle = '#bdc3c7';
        ctx.fillRect(6, 0, 4, 24);
        
        // Blade shine
        ctx.fillStyle = '#ecf0f1';
        ctx.fillRect(7, 2, 2, 20);
        
        // Tip
        ctx.beginPath();
        ctx.moveTo(6, 0);
        ctx.lineTo(10, 0);
        ctx.lineTo(8, -4);
        ctx.fill();
        
        // Guard
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(2, 24, 12, 3);
        
        // Handle
        ctx.fillStyle = '#8b4513';
        ctx.fillRect(6, 27, 4, 5);
    });
}

function spawnBonusSwords() {
    if (encounterState.hasBonusSwords) return; // Already have them
    
    // Create texture once
    const swordTexture = createBonusSwordTexture();
    
    // Create 3 swords at South, East, West (North is reserved for Dharma Wheel)
    // Positions: S = PI/2 (90°), E = 0 (0°), W = PI (180°)
    // Dharma wheel is at N = -PI/2 (270° or -90°)
    const positions = [
        { name: 'South', angle: Math.PI / 2 },      // 90° - bottom
        { name: 'East', angle: 0 },                  // 0° - right  
        { name: 'West', angle: Math.PI }             // 180° - left
    ];
    
    encounterState.bonusSwords = [];
    
    for (const pos of positions) {
        const material = new THREE.SpriteMaterial({
            map: swordTexture,
            transparent: true
        });
        const sprite = new THREE.Sprite(material);
        sprite.scale.set(2, 4, 1);
        scene.add(sprite);
        
        encounterState.bonusSwords.push({
            sprite,
            baseAngle: pos.angle, // Fixed position relative to dharma wheel
            name: pos.name
        });
    }
    
    encounterState.hasBonusSwords = true;
    gameState.hasBonusSwords = true; // For persistence
    
    console.log('Bonus swords spawned!');
}

function updateBonusSwords() {
    if (!gameState || !gameState.hasBonusSwords) return;
    if (!encounterState || !encounterState.bonusSwords || encounterState.bonusSwords.length === 0) return;
    
    // Get the dharma wheel's current angle (or use a default rotation)
    let baseRotation = 0;
    if (encounterState.playerDharmaWheel) {
        baseRotation = encounterState.playerDharmaWheel.angle;
    } else {
        // If no dharma wheel, rotate independently
        baseRotation = Date.now() * 0.001; // Slow rotation
    }
    
    const radius = 5; // Same radius as dharma wheel
    const baseSwordDamage = CONFIG.projectileBaseDamage * (1 + gameState.player.level * 0.25);
    const swordDamage = baseSwordDamage * 1.5; // Each bonus sword does 1.5x damage
    
    for (const sword of encounterState.bonusSwords) {
        if (!sword.sprite) continue;
        
        // Calculate position - sword stays at fixed offset from dharma wheel rotation
        const angle = baseRotation + sword.baseAngle;
        sword.sprite.position.x = gameState.player.position.x + Math.cos(angle) * radius;
        sword.sprite.position.z = gameState.player.position.z + Math.sin(angle) * radius;
        sword.sprite.position.y = 1.5;
        
        // Rotate sword to point outward
        sword.sprite.material.rotation = angle + Math.PI / 2;
        
        // Check collision with enemies
        for (const enemy of gameState.enemies) {
            const dx = enemy.sprite.position.x - sword.sprite.position.x;
            const dz = enemy.sprite.position.z - sword.sprite.position.z;
            const dist = Math.sqrt(dx * dx + dz * dz);
            
            if (dist < 2) {
                enemy.health -= swordDamage * 0.02;
                enemy.hitFlash = 5;
            }
        }
        
        // Check collision with bosses
        for (const boss of gameState.bosses) {
            const dx = boss.sprite.position.x - sword.sprite.position.x;
            const dz = boss.sprite.position.z - sword.sprite.position.z;
            const dist = Math.sqrt(dx * dx + dz * dz);
            
            if (dist < 2.5) {
                boss.health -= swordDamage * 0.02;
                boss.hitFlash = 5;
            }
        }
        
        // Check collision with encounter guards
        for (const guard of encounterState.encounterGuards) {
            const dx = guard.sprite.position.x - sword.sprite.position.x;
            const dz = guard.sprite.position.z - sword.sprite.position.z;
            const dist = Math.sqrt(dx * dx + dz * dz);
            
            if (dist < 2) {
                guard.health -= swordDamage * 0.02;
                guard.hitFlash = 5;
            }
        }
        
        // Check collision with land giant
        if (encounterState.landGiant) {
            const dx = encounterState.landGiant.sprite.position.x - sword.sprite.position.x;
            const dz = encounterState.landGiant.sprite.position.z - sword.sprite.position.z;
            const dist = Math.sqrt(dx * dx + dz * dz);
            
            if (dist < 4) {
                encounterState.landGiant.health -= swordDamage * 0.02;
                encounterState.landGiant.hitFlash = 5;
            }
        }
    }
}

// ============================================
// LAND GIANT BOSS (Sword in Stone Act 3)
// ============================================
function spawnLandGiant() {
    if (encounterState.landGiant) return; // Already exists
    
    const enc = encounterState.currentEncounter;
    if (!enc) return;
    
    // Spawn near the stone
    const x = enc.position.x + (Math.random() - 0.5) * 10;
    const z = enc.position.z + (Math.random() - 0.5) * 10;
    
    const material = new THREE.SpriteMaterial({
        map: encounterState.textures.landGiant,
        transparent: true
    });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(12, 15, 1); // Big boss!
    sprite.position.set(x, 7.5, z);
    scene.add(sprite);
    
    const baseHealth = CONFIG.enemyBaseHealth * (1 + gameState.player.level * 0.3) * 15; // Very tanky
    
    encounterState.landGiant = {
        sprite,
        health: baseHealth,
        maxHealth: baseHealth,
        damage: CONFIG.enemyBaseDamage * (1 + gameState.player.level * 0.2) * 2,
        speed: 0.04, // Slow but menacing
        attackCooldown: 0,
        hitFlash: 0,
        stompCooldown: 0 // Special attack
    };
    
    // Show boss health bar
    document.getElementById('bossHealthBar').classList.add('active');
    document.getElementById('bossName').textContent = '👹 LAND GIANT';
    document.getElementById('bossFill').style.width = '100%';
    
    // Zoom out for boss fight
    gameState.targetCameraZoom = 3.5;
    
    console.log('Land Giant spawned!');
}

function updateLandGiant() {
    if (!encounterState.landGiant) return;
    
    const giant = encounterState.landGiant;
    
    // Move toward player
    const dx = gameState.player.position.x - giant.sprite.position.x;
    const dz = gameState.player.position.z - giant.sprite.position.z;
    const dist = Math.sqrt(dx * dx + dz * dz);
    
    if (dist > 4) {
        giant.sprite.position.x += (dx / dist) * giant.speed;
        giant.sprite.position.z += (dz / dist) * giant.speed;
    } else if (giant.attackCooldown <= 0) {
        // Melee attack
        takeDamage(giant.damage);
        giant.attackCooldown = 90;
    }
    
    giant.attackCooldown = Math.max(0, giant.attackCooldown - 1);
    
    // Hit flash
    if (giant.hitFlash > 0) {
        giant.hitFlash--;
        giant.sprite.material.color.setHex(giant.hitFlash % 4 < 2 ? 0xffffff : 0xff0000);
    } else {
        giant.sprite.material.color.setHex(0xffffff);
    }
    
    // Update boss health bar
    const healthPercent = (giant.health / giant.maxHealth) * 100;
    document.getElementById('bossFill').style.width = healthPercent + '%';
    
    // Check if defeated
    if (giant.health <= 0) {
        onLandGiantDefeated();
    }
}

function onLandGiantDefeated() {
    const giant = encounterState.landGiant;
    if (!giant) return;
    
    // Remove sprite
    scene.remove(giant.sprite);
    encounterState.landGiant = null;
    
    // Hide boss health bar
    document.getElementById('bossHealthBar').classList.remove('active');
    
    // Show victory dialogue
    const template = ENCOUNTER_TEMPLATES.swordInStoneAct3;
    showDialogue(template.victoryDialogue.speaker, template.victoryDialogue.text);
    
    // Grant bonus swords after dialogue
    setTimeout(() => {
        spawnBonusSwords();
        showReward(template.reward.text);
        
        // Mark encounter as complete
        if (encounterState.currentEncounter) {
            encounterState.currentEncounter.rewardGiven = true;
            encounterState.currentEncounter.cleanupTimer = 300;
        }
        
        // Advance the story stage
        advanceStoryStage();
    }, 2000);
    
    // Reset camera zoom
    gameState.targetCameraZoom = 1;
    
    // Drop gold
    for (let i = 0; i < 20; i++) {
        const goldX = giant.sprite.position.x + (Math.random() - 0.5) * 8;
        const goldZ = giant.sprite.position.z + (Math.random() - 0.5) * 8;
        spawnGoldOrb(new THREE.Vector3(goldX, 0, goldZ), 25);
    }
    
    gameState.kills++;
    document.getElementById('kills').textContent = gameState.kills;
    
    console.log('Land Giant defeated!');
}

// Check projectile hits against Land Giant
function checkLandGiantProjectileHit(projPos, damage) {
    if (!encounterState.landGiant) return false;
    
    const giant = encounterState.landGiant;
    const dx = projPos.x - giant.sprite.position.x;
    const dz = projPos.z - giant.sprite.position.z;
    const dist = Math.sqrt(dx * dx + dz * dz);
    
    if (dist < 5) {
        giant.health -= damage;
        giant.hitFlash = 10;
        return true;
    }
    
    return false;
}

// ============================================
// TREASURE CHEST SYSTEM
// ============================================
function spawnTreasureChest() {
    const angle = Math.random() * Math.PI * 2;
    const dist = 15 + Math.random() * 25;
    
    const x = gameState.player.position.x + Math.cos(angle) * dist;
    const z = gameState.player.position.z + Math.sin(angle) * dist;
    
    const material = new THREE.SpriteMaterial({
        map: encounterState.textures.treasureChest,
        transparent: true
    });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(2.5, 2.2, 1);
    sprite.position.set(x, 1.1, z);
    scene.add(sprite);
    
    const goldRange = TREASURE_CHEST_CONFIG.goldMax - TREASURE_CHEST_CONFIG.goldMin;
    const chest = {
        sprite,
        position: new THREE.Vector3(x, 0, z),
        opened: false,
        goldAmount: TREASURE_CHEST_CONFIG.goldMin + Math.floor(Math.random() * goldRange),
        factIndex: Math.floor(Math.random() * FUN_FACTS.length)
    };
    
    encounterState.treasureChests.push(chest);
}

function updateTreasureChests() {
    for (let i = encounterState.treasureChests.length - 1; i >= 0; i--) {
        const chest = encounterState.treasureChests[i];
        
        // Bob slightly
        chest.sprite.position.y = 1.1 + Math.sin(Date.now() * 0.002 + i) * 0.1;
        
        if (!chest.opened) {
            // Check player collision
            const dx = gameState.player.position.x - chest.position.x;
            const dz = gameState.player.position.z - chest.position.z;
            const dist = Math.sqrt(dx * dx + dz * dz);
            
            if (dist < 2) {
                openTreasureChest(chest);
            }
        }
        
        // Remove if too far
        const dx = gameState.player.position.x - chest.position.x;
        const dz = gameState.player.position.z - chest.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        
        if (dist > CONFIG.renderDistance * 2) {
            scene.remove(chest.sprite);
            encounterState.treasureChests.splice(i, 1);
        }
    }
}

function openTreasureChest(chest) {
    chest.opened = true;
    
    // Change texture
    chest.sprite.material.map = encounterState.textures.openChest;
    chest.sprite.material.needsUpdate = true;
    chest.sprite.scale.set(2.5, 2.5, 1);
    
    // Give gold
    gameState.player.gold += chest.goldAmount;
    document.getElementById('goldNum').textContent = gameState.player.gold;
    
    showReward(`💰 +${chest.goldAmount} GOLD`);
    
    // Show fun fact
    setTimeout(() => {
        showDialogue('📜 ANCIENT WISDOM', FUN_FACTS[chest.factIndex]);
    }, 500);
}

// ============================================
// CLOUD ARENA SYSTEM
// ============================================
function spawnCloudPortal() {
    if (typeof debug === 'function') debug('spawnCloudPortal called');
    
    try {
        const stage = encounterState.arenaStage;
        const stageConfig = CLOUD_ARENA_CONFIG['stage' + stage];
        
        if (typeof debug === 'function') debug('Portal stage=' + stage);
        
        // Check texture exists
        if (!encounterState.textures.beanstalk) {
            if (typeof debug === 'function') debug('NO TEXTURE: beanstalk');
            return;
        }
        
        const angle = Math.random() * Math.PI * 2;
        const dist = CONFIG.enemySpawnRadius * 1.2;
        
        const x = gameState.player.position.x + Math.cos(angle) * dist;
        const z = gameState.player.position.z + Math.sin(angle) * dist;
        
        const material = new THREE.SpriteMaterial({
            map: encounterState.textures.beanstalk,
            transparent: true
        });
        
        // Tint portal based on stage
        if (stage === 1) {
            material.color.setHex(0x808080); // Dark gray tint
        } else if (stage === 2) {
            material.color.setHex(0xaa66cc); // Purple tint
        }
        
        const sprite = new THREE.Sprite(material);
        sprite.scale.set(10, 15, 1);
        sprite.position.set(x, 7.5, z);
        scene.add(sprite);
        
        encounterState.cloudPortal = {
            sprite,
            position: new THREE.Vector3(x, 0, z),
            particleTimer: 0,
            stage: stage
        };
        
        // Only spawn forest cloud sprites for stage 0
        if (stage === 0) {
            spawnForestCloudSprites(x, z);
            showDialogue('☁️ MYSTERIOUS PORTAL', 'A magical beanstalk has appeared! Cloud sprites have descended from the sky. Walk into the portal if you dare face the Sky Giants!');
        } else if (stage === 1) {
            showDialogue('⚠️ DARK PORTAL', 'The beanstalk has returned... darker than before. Something angry awaits above.');
        } else if (stage === 2) {
            showDialogue('👻 HAUNTED PORTAL', 'An ethereal beanstalk has materialized. Ghostly wails echo from above...');
        }
        
        if (typeof debug === 'function') debug('Portal spawned OK');
    } catch (error) {
        if (typeof debug === 'function') debug('Portal ERROR: ' + error.message);
        console.error('Error in spawnCloudPortal:', error);
    }
}

// Spawn cloud sprites in the forest when portal appears
function spawnForestCloudSprites(portalX, portalZ) {
    for (let i = 0; i < CLOUD_ARENA_CONFIG.forestCloudSpriteCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 8 + Math.random() * 20; // Spread around portal
        const cx = portalX + Math.cos(angle) * dist;
        const cz = portalZ + Math.sin(angle) * dist;
        
        const material = new THREE.SpriteMaterial({
            map: encounterState.textures.cloudSprite,
            transparent: true
        });
        const sprite = new THREE.Sprite(material);
        sprite.scale.set(4, 2, 1);
        sprite.position.set(cx, 1.5, cz);
        scene.add(sprite);
        
        const baseHealth = CONFIG.enemyBaseHealth * (1 + gameState.player.level * 0.2) * 2;
        const enemy = {
            sprite,
            health: baseHealth,
            maxHealth: baseHealth,
            damage: CONFIG.enemyBaseDamage * (1 + gameState.player.level * 0.15),
            speed: 0.055,
            attackCooldown: 0,
            hitFlash: 0,
            isForestCloudSprite: true
        };
        
        encounterState.forestCloudSprites.push(enemy);
    }
}

function updateCloudPortal() {
    if (!encounterState.cloudPortal) return;
    if (encounterState.inCloudArena) return;
    
    const portal = encounterState.cloudPortal;
    
    // Bob
    portal.sprite.position.y = 7.5 + Math.sin(Date.now() * 0.002) * 0.5;
    
    // Spawn particles
    portal.particleTimer++;
    if (portal.particleTimer >= 5) {
        portal.particleTimer = 0;
        spawnPortalParticle(portal.position);
    }
    
    // Update particles
    for (let i = encounterState.portalParticles.length - 1; i >= 0; i--) {
        const p = encounterState.portalParticles[i];
        p.sprite.position.y += 0.08;
        p.sprite.position.x += Math.sin(Date.now() * 0.01 + p.offset) * 0.02;
        p.life--;
        p.sprite.material.opacity = p.life / 120;
        
        if (p.life <= 0) {
            scene.remove(p.sprite);
            encounterState.portalParticles.splice(i, 1);
        }
    }
    
    // Check player entry
    const dx = gameState.player.position.x - portal.position.x;
    const dz = gameState.player.position.z - portal.position.z;
    const dist = Math.sqrt(dx * dx + dz * dz);
    
    if (dist < 4 && gameState.dialogueTimer <= 0) {
        enterCloudArena();
    }
    
    // Remove if too far
    if (dist > CONFIG.renderDistance * 3) {
        cleanupPortal();
    }
}

function spawnPortalParticle(portalPos) {
    const material = new THREE.SpriteMaterial({
        map: encounterState.textures.portalParticle,
        transparent: true,
        blending: THREE.AdditiveBlending
    });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(1, 1, 1);
    sprite.position.set(
        portalPos.x + (Math.random() - 0.5) * 6,
        1 + Math.random() * 2,
        portalPos.z + (Math.random() - 0.5) * 6
    );
    scene.add(sprite);
    
    encounterState.portalParticles.push({
        sprite,
        life: 120,
        offset: Math.random() * Math.PI * 2
    });
}

function cleanupPortal() {
    if (encounterState.cloudPortal) {
        scene.remove(encounterState.cloudPortal.sprite);
        encounterState.cloudPortal = null;
    }
    
    for (const p of encounterState.portalParticles) {
        scene.remove(p.sprite);
    }
    encounterState.portalParticles = [];
    
    // Clean up forest cloud sprites
    for (const enemy of encounterState.forestCloudSprites) {
        scene.remove(enemy.sprite);
    }
    encounterState.forestCloudSprites = [];
}

// ============================================
// ARENA DECORATIONS (CLOUDS AND GRASS)
// ============================================
function spawnArenaDecorations() {
    // Clear any existing decorations
    for (const deco of encounterState.arenaDecorations) {
        scene.remove(deco);
    }
    encounterState.arenaDecorations = [];
    
    const arenaRadius = 50; // Main arena area
    const outerRadius = 90; // Heavy cloud border
    
    // Create textures
    const heavyCloudTexture = createHeavyCloudTexture();
    const lightCloudTexture = createLightCloudTexture();
    const grassTexture = createCloudGrassTexture();
    
    // Spawn HEAVY CLOUDS around the outer edge (arena border)
    const heavyCloudCount = 400;
    for (let i = 0; i < heavyCloudCount; i++) {
        const angle = (i / heavyCloudCount) * Math.PI * 2 + Math.random() * 0.3;
        const dist = arenaRadius + 10 + Math.random() * (outerRadius - arenaRadius - 10);
        const x = Math.cos(angle) * dist;
        const z = Math.sin(angle) * dist;
        
        const material = new THREE.SpriteMaterial({
            map: heavyCloudTexture,
            transparent: true,
            opacity: 0.85 + Math.random() * 0.15
        });
        const sprite = new THREE.Sprite(material);
        const scale = 8 + Math.random() * 6;
        sprite.scale.set(scale, scale * 0.75, 1);
        sprite.position.set(x, 1 + Math.random() * 3, z);
        scene.add(sprite);
        encounterState.arenaDecorations.push(sprite);
    }
    
    // Extra dense layer of heavy clouds at the very edge
    const edgeCloudCount = 300;
    for (let i = 0; i < edgeCloudCount; i++) {
        const angle = (i / edgeCloudCount) * Math.PI * 2 + Math.random() * 0.2;
        const dist = outerRadius - 5 + Math.random() * 15;
        const x = Math.cos(angle) * dist;
        const z = Math.sin(angle) * dist;
        
        const material = new THREE.SpriteMaterial({
            map: heavyCloudTexture,
            transparent: true,
            opacity: 0.9
        });
        const sprite = new THREE.Sprite(material);
        const scale = 10 + Math.random() * 8;
        sprite.scale.set(scale, scale * 0.75, 1);
        sprite.position.set(x, 2 + Math.random() * 4, z);
        scene.add(sprite);
        encounterState.arenaDecorations.push(sprite);
    }
    
    // Spawn LIGHT WISPY CLOUDS inside the arena
    const lightCloudCount = 400;
    for (let i = 0; i < lightCloudCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 10 + Math.random() * (arenaRadius - 15);
        const x = Math.cos(angle) * dist;
        const z = Math.sin(angle) * dist;
        
        const material = new THREE.SpriteMaterial({
            map: lightCloudTexture,
            transparent: true,
            opacity: 0.4 + Math.random() * 0.3
        });
        const sprite = new THREE.Sprite(material);
        const scale = 4 + Math.random() * 4;
        sprite.scale.set(scale, scale * 0.67, 1);
        sprite.position.set(x, 0.5 + Math.random() * 1.5, z);
        scene.add(sprite);
        encounterState.arenaDecorations.push(sprite);
    }
    
    // Spawn GRASS TUFTS scattered across the arena floor
    const grassCount = 80;
    for (let i = 0; i < grassCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 5 + Math.random() * (arenaRadius - 5);
        const x = Math.cos(angle) * dist;
        const z = Math.sin(angle) * dist;
        
        const material = new THREE.SpriteMaterial({
            map: grassTexture,
            transparent: true
        });
        const sprite = new THREE.Sprite(material);
        const scale = 1.5 + Math.random() * 1.5;
        sprite.scale.set(scale, scale * 0.83, 1);
        sprite.position.set(x, scale * 0.4, z);
        scene.add(sprite);
        encounterState.arenaDecorations.push(sprite);
    }
    
    // Add some grass clusters (2-3 tufts close together)
    const clusterCount = 50;
    for (let i = 0; i < clusterCount; i++) {
        const baseAngle = Math.random() * Math.PI * 2;
        const baseDist = 8 + Math.random() * (arenaRadius - 12);
        const baseX = Math.cos(baseAngle) * baseDist;
        const baseZ = Math.sin(baseAngle) * baseDist;
        
        // Spawn 2-3 grass tufts in a cluster
        const clusterSize = 2 + Math.floor(Math.random() * 2);
        for (let j = 0; j < clusterSize; j++) {
            const offsetX = (Math.random() - 0.5) * 3;
            const offsetZ = (Math.random() - 0.5) * 3;
            
            const material = new THREE.SpriteMaterial({
                map: grassTexture,
                transparent: true
            });
            const sprite = new THREE.Sprite(material);
            const scale = 1.2 + Math.random() * 1.0;
            sprite.scale.set(scale, scale * 0.83, 1);
            sprite.position.set(baseX + offsetX, scale * 0.4, baseZ + offsetZ);
            scene.add(sprite);
            encounterState.arenaDecorations.push(sprite);
        }
    }
    
    console.log('Arena decorations spawned:', encounterState.arenaDecorations.length);
}

function enterCloudArena() {
    const stage = encounterState.arenaStage;
    const stageConfig = CLOUD_ARENA_CONFIG['stage' + stage];
    
    encounterState.inCloudArena = true;
    encounterState.savedForestPosition = gameState.player.position.clone();
    
    cleanupPortal();
    clearForestEntities();
    
    // Save and change environment
    encounterState.savedGroundMaterial = ground.material;
    encounterState.savedFogColor = scene.fog.color.getHex();
    
    const cloudTexture = createCloudGroundTexture();
    cloudTexture.wrapS = THREE.RepeatWrapping;
    cloudTexture.wrapT = THREE.RepeatWrapping;
    cloudTexture.repeat.set(30, 30);
    ground.material = new THREE.MeshLambertMaterial({ map: cloudTexture });
    
    // Stage-specific fog color
    scene.fog.color.setHex(stageConfig.fogColor);
    renderer.setClearColor(stageConfig.fogColor);
    
    gameState.player.position.set(0, 0, 0);
    playerGroup.position.set(0, 0, 0);
    
    gameState.targetCameraZoom = stageConfig.cameraZoom;
    
    // Spawn arena decorations (clouds and grass)
    spawnArenaDecorations();
    
    // Stage-specific enemy spawning
    if (stage === 0) {
        spawnArenaStage0();
    } else if (stage === 1) {
        spawnArenaStage1();
    } else if (stage === 2) {
        spawnArenaStage2();
    }
    
    showDialogue(stageConfig.introDialogue.title, stageConfig.introDialogue.text);
}

function clearForestEntities() {
    // Clear enemies
    for (const enemy of gameState.enemies) {
        scene.remove(enemy.sprite);
    }
    gameState.enemies = [];
    
    // Clear bosses
    for (const boss of gameState.bosses) {
        scene.remove(boss.sprite);
        if (boss.club) scene.remove(boss.club);
        if (boss.projectiles) boss.projectiles.forEach(p => scene.remove(p.sprite));
    }
    gameState.bosses = [];
    gameState.bossActive = false;
    
    // Clear encounter
    if (encounterState.currentEncounter) {
        cleanupEncounter();
    }
    
    // Clear chests
    for (const chest of encounterState.treasureChests) {
        scene.remove(chest.sprite);
    }
    encounterState.treasureChests = [];
    
    // Clear chunks
    for (const [key, chunk] of gameState.chunks) {
        scene.remove(chunk);
    }
    gameState.chunks.clear();
}

// ============================================
// STAGE-SPECIFIC ARENA SPAWNING
// ============================================

// Stage 0: Cloud Sprites + Sky Giants (original)
function spawnArenaStage0() {
    const config = CLOUD_ARENA_CONFIG.stage0;
    
    // Spawn Sky Giant bosses
    for (let i = 0; i < config.bossCount; i++) {
        const angle = (i / config.bossCount) * Math.PI * 2;
        const dist = 25;
        const x = Math.cos(angle) * dist;
        const z = Math.sin(angle) * dist;
        
        const material = new THREE.SpriteMaterial({
            map: encounterState.textures.skyGiant,
            transparent: true
        });
        const sprite = new THREE.Sprite(material);
        sprite.scale.set(10, 12, 1);
        sprite.position.set(x, 6, z);
        scene.add(sprite);
        
        const bossHealth = getBossHealth() * config.bossHealthMultiplier;
        const boss = {
            sprite,
            health: bossHealth,
            maxHealth: bossHealth,
            damage: getBossDamage(),
            speed: 0.03,
            hitFlash: 0,
            isArenaBoss: true,
            bossType: 'skyGiant'
        };
        
        encounterState.arenaBosses.push(boss);
    }
    
    // Spawn cloud sprites
    for (let i = 0; i < config.enemyCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 10 + Math.random() * 30;
        const x = Math.cos(angle) * dist;
        const z = Math.sin(angle) * dist;
        
        const material = new THREE.SpriteMaterial({
            map: encounterState.textures.cloudSprite,
            transparent: true
        });
        const sprite = new THREE.Sprite(material);
        sprite.scale.set(4, 2, 1);
        sprite.position.set(x, 1.5, z);
        scene.add(sprite);
        
        const baseHealth = CONFIG.enemyBaseHealth * (1 + gameState.player.level * 0.2) * config.enemyHealthMultiplier;
        const enemy = {
            sprite,
            health: baseHealth,
            maxHealth: baseHealth,
            damage: CONFIG.enemyBaseDamage * (1 + gameState.player.level * 0.15),
            speed: 0.06,
            attackCooldown: 0,
            hitFlash: 0,
            isArenaEnemy: true
        };
        
        encounterState.arenaEnemies.push(enemy);
    }
}

// Stage 1: Giant Troll with orbiting clubs
function spawnArenaStage1() {
    const config = CLOUD_ARENA_CONFIG.stage1;
    
    // Spawn the MASSIVE troll at center
    const material = new THREE.SpriteMaterial({
        map: encounterState.textures.giantTroll,
        transparent: true
    });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(24, 32, 1); // HUGE
    sprite.position.set(0, 16, 30); // Start away from player
    scene.add(sprite);
    
    const bossHealth = getBossHealth() * config.trollHealthMultiplier * 2; // Extra beefy
    const troll = {
        sprite,
        health: bossHealth,
        maxHealth: bossHealth,
        damage: getBossDamage() * 1.5,
        speed: 0.025, // Slower but menacing
        hitFlash: 0,
        isArenaBoss: true,
        bossType: 'giantTroll',
        projectileCooldown: 0
    };
    
    encounterState.arenaBosses.push(troll);
    
    // Spawn orbiting clubs
    encounterState.trollClubs = [];
    for (let i = 0; i < config.clubCount; i++) {
        const clubMaterial = new THREE.SpriteMaterial({
            map: encounterState.textures.giantClub,
            transparent: true
        });
        const clubSprite = new THREE.Sprite(clubMaterial);
        clubSprite.scale.set(6, 16, 1); // Big clubs
        scene.add(clubSprite);
        
        encounterState.trollClubs.push({
            sprite: clubSprite,
            angle: (i / config.clubCount) * Math.PI * 2,
            speed: config.clubSpeeds[i],
            radius: 12 + i * 2, // Varying distances
            damage: getBossDamage() * config.clubDamage
        });
    }
    
    encounterState.trollProjectiles = [];
}

// Stage 2: Ghost Trio
function spawnArenaStage2() {
    const config = CLOUD_ARENA_CONFIG.stage2;
    encounterState.ghostDefeated = false;
    
    // Giant Ghost (spirit)
    const ghostMaterial = new THREE.SpriteMaterial({
        map: encounterState.textures.giantGhost,
        transparent: true
    });
    const ghostSprite = new THREE.Sprite(ghostMaterial);
    ghostSprite.scale.set(20, 24, 1);
    ghostSprite.position.set(0, 12, 35);
    scene.add(ghostSprite);
    
    const ghostHealth = getBossHealth() * config.ghostHealthMultiplier;
    encounterState.arenaBosses.push({
        sprite: ghostSprite,
        health: ghostHealth,
        maxHealth: ghostHealth,
        damage: getBossDamage(),
        speed: 0.04, // Floaty
        hitFlash: 0,
        isArenaBoss: true,
        bossType: 'giantGhost'
    });
    
    // Giant Skeleton (body)
    const skeleMaterial = new THREE.SpriteMaterial({
        map: encounterState.textures.giantSkeleton,
        transparent: true
    });
    const skeleSprite = new THREE.Sprite(skeleMaterial);
    skeleSprite.scale.set(18, 24, 1);
    skeleSprite.position.set(-25, 12, 25);
    scene.add(skeleSprite);
    
    const skeleHealth = getBossHealth() * config.skeletonHealthMultiplier;
    encounterState.arenaBosses.push({
        sprite: skeleSprite,
        health: skeleHealth,
        maxHealth: skeleHealth,
        damage: getBossDamage() * 1.2,
        speed: 0.03,
        hitFlash: 0,
        isArenaBoss: true,
        bossType: 'giantSkeleton'
    });
    
    // Giant Slime (bodily goos)
    const slimeMaterial = new THREE.SpriteMaterial({
        map: encounterState.textures.giantSlime,
        transparent: true
    });
    const slimeSprite = new THREE.Sprite(slimeMaterial);
    slimeSprite.scale.set(16, 12, 1);
    slimeSprite.position.set(25, 6, 25);
    scene.add(slimeSprite);
    
    const slimeHealth = getBossHealth() * config.slimeHealthMultiplier;
    encounterState.arenaBosses.push({
        sprite: slimeSprite,
        health: slimeHealth,
        maxHealth: slimeHealth,
        damage: getBossDamage() * 0.8,
        speed: 0.035,
        hitFlash: 0,
        isArenaBoss: true,
        bossType: 'giantSlime'
    });
}

function updateCloudArena() {
    if (!encounterState.inCloudArena) return;
    if (gameState.dialogueTimer > 0) return;
    
    const stage = encounterState.arenaStage;
    const stageConfig = CLOUD_ARENA_CONFIG['stage' + stage];
    
    // Update arena bosses
    for (let i = encounterState.arenaBosses.length - 1; i >= 0; i--) {
        const boss = encounterState.arenaBosses[i];
        
        const dx = gameState.player.position.x - boss.sprite.position.x;
        const dz = gameState.player.position.z - boss.sprite.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        
        // Movement
        if (dist > 4) {
            boss.sprite.position.x += (dx / dist) * boss.speed;
            boss.sprite.position.z += (dz / dist) * boss.speed;
        } else {
            takeDamage(boss.damage * 0.02);
        }
        
        // Hit flash
        if (boss.hitFlash > 0) {
            boss.hitFlash--;
            boss.sprite.material.color.setHex(boss.hitFlash % 4 < 2 ? 0xffffff : 0xff0000);
        } else {
            boss.sprite.material.color.setHex(0xffffff);
        }
        
        // Death handling
        if (boss.health <= 0) {
            // Stage-specific gold drops
            let goldDrop = 0;
            if (stage === 0) {
                goldDrop = stageConfig.bossGoldDrop;
            } else if (stage === 1) {
                goldDrop = stageConfig.trollGoldDrop;
            } else if (stage === 2) {
                goldDrop = stageConfig.bossGoldDrop;
                
                // Special dialogue when ghost dies
                if (boss.bossType === 'giantGhost' && !encounterState.ghostDefeated) {
                    encounterState.ghostDefeated = true;
                    showDialogue(
                        stageConfig.ghostDeathDialogue.title,
                        stageConfig.ghostDeathDialogue.text
                    );
                }
            }
            
            spawnGoldOrb(boss.sprite.position.clone(), goldDrop);
            scene.remove(boss.sprite);
            encounterState.arenaBosses.splice(i, 1);
        }
    }
    
    // Update arena enemies (stage 0 only)
    for (let i = encounterState.arenaEnemies.length - 1; i >= 0; i--) {
        const enemy = encounterState.arenaEnemies[i];
        
        const dx = gameState.player.position.x - enemy.sprite.position.x;
        const dz = gameState.player.position.z - enemy.sprite.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        
        if (dist > 1.5) {
            enemy.sprite.position.x += (dx / dist) * enemy.speed;
            enemy.sprite.position.z += (dz / dist) * enemy.speed;
        } else if (enemy.attackCooldown <= 0) {
            takeDamage(enemy.damage);
            enemy.attackCooldown = 60;
        }
        
        enemy.attackCooldown = Math.max(0, enemy.attackCooldown - 1);
        
        if (enemy.hitFlash > 0) {
            enemy.hitFlash--;
            enemy.sprite.material.color.setHex(enemy.hitFlash % 4 < 2 ? 0xffffff : 0xff0000);
        } else {
            enemy.sprite.material.color.setHex(0xffffff);
        }
        
        if (enemy.health <= 0) {
            spawnGoldOrb(enemy.sprite.position.clone(), stageConfig.enemyGoldDrop || 10);
            scene.remove(enemy.sprite);
            encounterState.arenaEnemies.splice(i, 1);
        }
    }
    
    // Stage 1: Update troll clubs and projectiles
    if (stage === 1) {
        updateTrollClubs();
        updateTrollProjectiles();
        
        // Troll shoots rocks
        if (encounterState.arenaBosses.length > 0) {
            const troll = encounterState.arenaBosses[0];
            if (troll.projectileCooldown !== undefined) {
                troll.projectileCooldown--;
                if (troll.projectileCooldown <= 0) {
                    fireTrollProjectile(troll);
                    troll.projectileCooldown = CLOUD_ARENA_CONFIG.stage1.projectileCooldown;
                }
            }
        }
    }
    
    // Check victory
    if (encounterState.arenaBosses.length === 0 && encounterState.arenaEnemies.length === 0) {
        winCloudArena();
    }
    
    updateArenaBossDisplay();
}

// Troll's orbiting clubs
function updateTrollClubs() {
    if (encounterState.arenaBosses.length === 0) return;
    const troll = encounterState.arenaBosses[0];
    
    for (const club of encounterState.trollClubs) {
        // Orbit around troll
        club.angle += club.speed;
        club.sprite.position.x = troll.sprite.position.x + Math.cos(club.angle) * club.radius;
        club.sprite.position.z = troll.sprite.position.z + Math.sin(club.angle) * club.radius;
        club.sprite.position.y = 8 + Math.sin(club.angle * 2) * 2; // Bob up and down
        
        // Rotate the club sprite
        club.sprite.material.rotation = club.angle + Math.PI / 2;
        
        // Check collision with player
        const dx = gameState.player.position.x - club.sprite.position.x;
        const dz = gameState.player.position.z - club.sprite.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        
        if (dist < 4) {
            takeDamage(club.damage * 0.03);
        }
    }
}

// Troll throws rocks
function fireTrollProjectile(troll) {
    const dx = gameState.player.position.x - troll.sprite.position.x;
    const dz = gameState.player.position.z - troll.sprite.position.z;
    const dist = Math.sqrt(dx * dx + dz * dz);
    
    const material = new THREE.SpriteMaterial({
        map: encounterState.textures.trollRock,
        transparent: true
    });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(4, 4, 1);
    sprite.position.copy(troll.sprite.position);
    sprite.position.y = 10;
    scene.add(sprite);
    
    encounterState.trollProjectiles.push({
        sprite,
        vx: (dx / dist) * 0.3,
        vz: (dz / dist) * 0.3,
        damage: troll.damage,
        life: 300
    });
}

function updateTrollProjectiles() {
    for (let i = encounterState.trollProjectiles.length - 1; i >= 0; i--) {
        const proj = encounterState.trollProjectiles[i];
        
        proj.sprite.position.x += proj.vx;
        proj.sprite.position.z += proj.vz;
        proj.life--;
        
        // Check collision with player
        const dx = gameState.player.position.x - proj.sprite.position.x;
        const dz = gameState.player.position.z - proj.sprite.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        
        if (dist < 2) {
            takeDamage(proj.damage);
            scene.remove(proj.sprite);
            encounterState.trollProjectiles.splice(i, 1);
            continue;
        }
        
        if (proj.life <= 0) {
            scene.remove(proj.sprite);
            encounterState.trollProjectiles.splice(i, 1);
        }
    }
}

function updateArenaBossDisplay() {
    const bossBar = document.getElementById('bossHealthBar');
    const stage = encounterState.arenaStage;
    
    if (encounterState.arenaBosses.length > 0) {
        bossBar.classList.add('active');
        
        // Stage-specific boss names
        let bossName = '';
        if (stage === 0) {
            bossName = '☁️ SKY GIANTS (' + encounterState.arenaBosses.length + ' remaining)';
        } else if (stage === 1) {
            bossName = '👹 GIANT TROLL';
        } else if (stage === 2) {
            const types = encounterState.arenaBosses.map(b => {
                if (b.bossType === 'giantGhost') return '👻';
                if (b.bossType === 'giantSkeleton') return '💀';
                if (b.bossType === 'giantSlime') return '🩸';
                return '?';
            }).join(' ');
            bossName = types + ' GHOST TRIO (' + encounterState.arenaBosses.length + ' remaining)';
        }
        
        document.getElementById('bossName').textContent = bossName;
        
        const totalHealth = encounterState.arenaBosses.reduce((sum, b) => sum + b.health, 0);
        const totalMaxHealth = encounterState.arenaBosses.reduce((sum, b) => sum + b.maxHealth, 0);
        const healthPercent = (totalHealth / totalMaxHealth) * 100;
        document.getElementById('bossFill').style.width = Math.max(0, healthPercent) + '%';
    } else if (encounterState.inCloudArena && encounterState.arenaEnemies.length > 0) {
        bossBar.classList.add('active');
        document.getElementById('bossName').textContent = '☁️ CLOUD SPRITES (' + encounterState.arenaEnemies.length + ' remaining)';
        document.getElementById('bossFill').style.width = '100%';
    } else if (!encounterState.inCloudArena) {
        // Don't hide - let bosses.js handle it when not in arena
    }
}

function winCloudArena() {
    const stage = encounterState.arenaStage;
    const stageConfig = CLOUD_ARENA_CONFIG['stage' + stage];
    
    // Advance to next stage
    encounterState.arenaStage++;
    
    // Give gold reward
    gameState.player.gold += stageConfig.goldReward;
    document.getElementById('goldNum').textContent = gameState.player.gold;
    
    showReward(`☁️ ${stageConfig.name.toUpperCase()} COMPLETE! +${stageConfig.goldReward} GOLD`);
    
    encounterState.pendingArenaExit = true;
    
    // Advance the main story when arena stage is complete
    advanceStoryStage();
    
    showDialogue(stageConfig.winDialogue.title, stageConfig.winDialogue.text);
}

function exitCloudArena() {
    encounterState.inCloudArena = false;
    
    ground.material = encounterState.savedGroundMaterial;
    scene.fog.color.setHex(encounterState.savedFogColor);
    renderer.setClearColor(encounterState.savedFogColor);
    
    if (encounterState.savedForestPosition) {
        gameState.player.position.copy(encounterState.savedForestPosition);
        playerGroup.position.copy(encounterState.savedForestPosition);
    }
    
    gameState.targetCameraZoom = 1;
    
    // Clear arena entities
    for (const boss of encounterState.arenaBosses) {
        scene.remove(boss.sprite);
    }
    encounterState.arenaBosses = [];
    
    for (const enemy of encounterState.arenaEnemies) {
        scene.remove(enemy.sprite);
    }
    encounterState.arenaEnemies = [];
    
    // Clear troll-specific entities (stage 1)
    for (const club of encounterState.trollClubs) {
        scene.remove(club.sprite);
    }
    encounterState.trollClubs = [];
    
    for (const proj of encounterState.trollProjectiles) {
        scene.remove(proj.sprite);
    }
    encounterState.trollProjectiles = [];
    
    // Clear arena decorations (clouds and grass)
    for (const deco of encounterState.arenaDecorations) {
        scene.remove(deco);
    }
    encounterState.arenaDecorations = [];
    
    // Regenerate forest
    updateChunks();
}

// Check arena projectile hits (called from main game)
function checkArenaProjectileHits(projPos, damage) {
    // Check arena bosses
    for (const boss of encounterState.arenaBosses) {
        const dx = projPos.x - boss.sprite.position.x;
        const dz = projPos.z - boss.sprite.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        
        if (dist < 5) {
            boss.health -= damage;
            boss.hitFlash = 10;
            return true;
        }
    }
    
    // Check arena enemies
    for (const enemy of encounterState.arenaEnemies) {
        const dx = projPos.x - enemy.sprite.position.x;
        const dz = projPos.z - enemy.sprite.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        
        if (dist < 2) {
            enemy.health -= damage;
            enemy.hitFlash = 10;
            return true;
        }
    }
    
    return false;
}

// ============================================
// INTEGRATION FUNCTIONS
// ============================================
function initEncounterSystem() {
    console.log('Initializing Encounter System...');
    if (typeof debug === 'function') debug('initEncounterSystem called');
    try {
        initEncounterTextures();
        if (typeof debug === 'function') debug('Textures initialized OK');
    } catch (error) {
        console.error('Error initializing encounter textures:', error);
        if (typeof debug === 'function') debug('TEXTURE ERROR: ' + error.message);
    }
}

function updateEncounterSystem() {
    try {
        // Update current encounter
        updateEncounter();
        
        // Update treasure chests
        updateTreasureChests();
        
        // Update cloud portal
        updateCloudPortal();
        
        // Update forest cloud sprites (in forest, near portal)
        if (encounterState && !encounterState.inCloudArena) {
            updateForestCloudSprites();
        }
        
        // Update cloud arena
        if (encounterState && encounterState.inCloudArena) {
            updateCloudArena();
        }
        
        // Update player's dharma wheel (if they have one)
        updatePlayerDharmaWheel();
        
        // Update bonus swords (if they have them)
        updateBonusSwords();
        
        // Update Land Giant boss (if active)
        updateLandGiant();
    } catch (error) {
        console.error('Error in updateEncounterSystem:', error);
        if (typeof debug === 'function') debug('ENC ERROR: ' + error.message);
    }
}

// Update forest cloud sprites that spawn when portal appears
function updateForestCloudSprites() {
    if (encounterState.forestCloudSprites.length === 0) return;
    if (gameState.dialogueTimer > 0) return;
    
    for (let i = encounterState.forestCloudSprites.length - 1; i >= 0; i--) {
        const enemy = encounterState.forestCloudSprites[i];
        
        const dx = gameState.player.position.x - enemy.sprite.position.x;
        const dz = gameState.player.position.z - enemy.sprite.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        
        // Move toward player
        if (dist > 1.5) {
            enemy.sprite.position.x += (dx / dist) * enemy.speed;
            enemy.sprite.position.z += (dz / dist) * enemy.speed;
        } else if (enemy.attackCooldown <= 0) {
            takeDamage(enemy.damage);
            enemy.attackCooldown = 60;
        }
        
        enemy.attackCooldown = Math.max(0, enemy.attackCooldown - 1);
        
        // Hit flash
        if (enemy.hitFlash > 0) {
            enemy.hitFlash--;
            enemy.sprite.material.color.setHex(enemy.hitFlash % 4 < 2 ? 0xffffff : 0xff0000);
        } else {
            enemy.sprite.material.color.setHex(0xffffff);
        }
        
        // Check death
        if (enemy.health <= 0) {
            // Drop gold only, no XP (forest sprites are stage 0)
            spawnGoldOrb(enemy.sprite.position.clone(), CLOUD_ARENA_CONFIG.stage0.enemyGoldDrop);
            scene.remove(enemy.sprite);
            encounterState.forestCloudSprites.splice(i, 1);
            gameState.kills++;
            document.getElementById('kills').textContent = gameState.kills;
        }
        
        // Remove if too far from player
        if (dist > CONFIG.renderDistance * 2) {
            scene.remove(enemy.sprite);
            encounterState.forestCloudSprites.splice(i, 1);
        }
    }
}

function resetEncounterSystem() {
    console.log('Resetting Encounter System...');
    
    // Cleanup encounter
    cleanupEncounter();
    
    // Cleanup chests
    for (const chest of encounterState.treasureChests) {
        scene.remove(chest.sprite);
    }
    encounterState.treasureChests = [];
    
    // Cleanup portal (this also cleans up forest cloud sprites)
    cleanupPortal();
    
    // Cleanup arena
    if (encounterState.inCloudArena) {
        ground.material = encounterState.savedGroundMaterial;
        scene.fog.color.setHex(encounterState.savedFogColor);
        renderer.setClearColor(encounterState.savedFogColor);
    }
    
    for (const boss of encounterState.arenaBosses) {
        scene.remove(boss.sprite);
    }
    encounterState.arenaBosses = [];
    
    for (const enemy of encounterState.arenaEnemies) {
        scene.remove(enemy.sprite);
    }
    encounterState.arenaEnemies = [];
    
    // Cleanup troll entities (stage 1)
    for (const club of encounterState.trollClubs) {
        scene.remove(club.sprite);
    }
    encounterState.trollClubs = [];
    
    for (const proj of encounterState.trollProjectiles) {
        scene.remove(proj.sprite);
    }
    encounterState.trollProjectiles = [];
    
    // Cleanup arena decorations
    for (const deco of encounterState.arenaDecorations) {
        scene.remove(deco);
    }
    encounterState.arenaDecorations = [];
    
    // Cleanup wizard dharma wheels
    for (const wheel of encounterState.wizardWheels) {
        scene.remove(wheel.sprite);
    }
    encounterState.wizardWheels = [];
    
    // Cleanup player dharma wheel
    if (encounterState.playerDharmaWheel) {
        scene.remove(encounterState.playerDharmaWheel.sprite);
        encounterState.playerDharmaWheel = null;
    }
    
    // Cleanup bonus swords
    for (const sword of encounterState.bonusSwords) {
        scene.remove(sword.sprite);
    }
    encounterState.bonusSwords = [];
    encounterState.hasBonusSwords = false;
    
    // Cleanup land giant
    if (encounterState.landGiant) {
        scene.remove(encounterState.landGiant.sprite);
        encounterState.landGiant = null;
    }
    
    // Reset state
    encounterState.currentEncounter = null;
    encounterState.encounterGuards = [];
    encounterState.cloudPortal = null;
    encounterState.portalParticles = [];
    encounterState.forestCloudSprites = [];
    encounterState.inCloudArena = false;
    encounterState.arenaStage = 0; // Reset to stage 0
    encounterState.storyStage = 0; // Reset story progression
    encounterState.ghostDefeated = false;
    encounterState.savedForestPosition = null;
    encounterState.pendingArenaExit = false;
    encounterState.guaranteedEncounterQueue = [];
    
    // Reset gameState flags
    if (typeof gameState !== 'undefined') {
        gameState.hasDharmaWheel = false;
        gameState.hasBonusSwords = false;
    }
}

// ===========================================
// MONSTER STORE STORY HOOK
// ===========================================
// Call this when the monster store closes to advance the story
function onMonsterStoreClosed() {
    console.log('Monster store closed, advancing story');
    advanceStoryStage();
}

// Check for pending arena exit (called when dialogue closes)
function checkPendingArenaExit() {
    if (encounterState.pendingArenaExit) {
        encounterState.pendingArenaExit = false;
        exitCloudArena();
        return true;
    }
    return false;
}

// ============================================
// EXPOSE FUNCTIONS GLOBALLY
// ============================================
// These need to be accessible from the main game file

console.log('Encounter System loaded!');
