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
    arenaCompleted: false,
    savedForestPosition: null,
    pendingArenaExit: false,
    
    // Saved environment for arena restoration
    savedGroundMaterial: null,
    savedFogColor: null,
    
    // Guaranteed encounter queue (level-triggered)
    guaranteedEncounterQueue: [],
    
    // Textures (initialized on load)
    textures: {}
};

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
        minLevel: 4,
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
        
        minLevel: 4,
        maxLevel: 999,
        spawnWeight: 1,
        
        npc: null, // No NPC, interact with structure
        
        onComplete: 'interactWithStructure',
        interactionRange: 3,
        completionDialogue: {
            speaker: '🪨 STONE',
            text: '"Ahh, sweet relief! That sword was such a pain in my side. Take it, please! It\'s all yours!"'
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
                text: '"I was trying to summon a handsome wizard for... um... companionship... and instead I summoned twenty dogmatic buddhists!"'
            },
            rewardOnContact: true
        },
        
        onComplete: 'spawnNPC'
    }
};

// ============================================
// CLOUD ARENA CONFIGURATION
// ============================================
const CLOUD_ARENA_CONFIG = {
    minLevel: 5,
    maxLevel: 9,
    spawnChance: 0.03,
    
    // Arena enemies
    bossCount: 3,
    bossHealthMultiplier: 0.5, // Reduced for early access
    
    enemyCount: 60,
    enemyHealthMultiplier: 3,
    
    // Rewards
    goldReward: 1000,
    
    cameraZoom: 2.5
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
    "The princess in the tower window after rescue? That's actually her sister. She's not into you.",
    "Only a fool laughs at the mighty dragon.",
    "Sir Cowardice the Lame invented the brilliant tactic of standing beyond the evil tree's range.",
    "Legend says with 8 orbiting swords, a hero could survive while standing perfectly still. Of course, no one's ever tried it.",
    "Those 'wizards' are actually Dogmatic Buddhists.",
    "The forest seems dangerous, but most inhabitants are peaceful and kind.",
    "Why do monsters carry gold? Legend speaks of an underground monster only shop.",
    "Orbiting swords are great for the forest, impractical for bathing. Some heroes stab their swords into stones just to wash in peace.",
    "The skeletons? Fallen heroes who drank lots of milk. The ghosts? Heroes' who didn't drink enough milk.",
    "The little green forest people are called goblins. But NEVER let them hear you call them that.",
    "In a pinch, slimes can be used as a tasty food source or a surprisingly effective girlfriend.",
    "In a pinch, slimes can be used as a tasty food source or a surprisingly effective hat.",
    "While trolls may seem dangerous there have been zero recorded deaths.",
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

// ============================================
// TEXTURE INITIALIZATION
// ============================================
function initEncounterTextures() {
    console.log('Initializing encounter textures...');
    
    encounterState.textures = {
        // Encounter structures
        princessTower: createPrincessTowerTexture(),
        swordInStone: createSwordInStoneTexture(),
        witchHut: createWitchHutTexture(),
        
        // NPCs
        princess: createPrincessTexture(),
        witch: createWitchTexture(),
        goldenSkeleton: createGoldenSkeletonTexture(),
        
        // Effects
        heart: createHeartTexture(),
        
        // Treasure chests
        treasureChest: createTreasureChestTexture(),
        openChest: createOpenChestTexture(),
        
        // Cloud arena
        beanstalk: createBeanstalkPortalTexture(),
        portalParticle: createPortalParticleTexture(),
        cloudGround: createCloudGroundTexture(),
        cloudSprite: createCloudSpriteTexture(),
        skyGiant: createSkyGiantTexture()
    };
    
    console.log('Encounter textures initialized.');
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
function shouldSpawnEncounter() {
    if (encounterState.currentEncounter) return false;
    if (gameState.bosses.length > 0) return false;
    if (encounterState.cloudPortal) return false;
    if (encounterState.inCloudArena) return false;
    if (typeof isMonsterStoreActive === 'function' && isMonsterStoreActive()) return false;
    
    const level = gameState.player.level;
    
    // Check for guaranteed encounters first
    if (hasGuaranteedEncounter()) {
        return true;
    }
    
    // Normal spawn check
    if (level < 4) return false;
    
    const spawnChance = getEncounterSpawnChance(level);
    return Math.random() < spawnChance;
}

function shouldSpawnPortal() {
    if (encounterState.inCloudArena) return false;
    if (encounterState.cloudPortal) return false;
    if (encounterState.arenaCompleted) return false;
    if (gameState.bosses.length > 0) return false;
    if (encounterState.currentEncounter) return false;
    if (typeof isMonsterStoreActive === 'function' && isMonsterStoreActive()) return false;
    
    const level = gameState.player.level;
    if (level < CLOUD_ARENA_CONFIG.minLevel || level > CLOUD_ARENA_CONFIG.maxLevel) return false;
    
    return Math.random() < CLOUD_ARENA_CONFIG.spawnChance;
}

function shouldSpawnChest() {
    if (encounterState.treasureChests.length >= TREASURE_CHEST_CONFIG.maxChests) return false;
    return Math.random() < TREASURE_CHEST_CONFIG.spawnChance;
}

// ============================================
// ENCOUNTER SPAWNING
// ============================================
function spawnEncounter() {
    let template;
    
    // Check for guaranteed encounter
    if (hasGuaranteedEncounter()) {
        const key = getNextGuaranteedEncounter();
        template = ENCOUNTER_TEMPLATES[key];
        console.log('Spawning guaranteed encounter:', key);
    } else {
        // Random encounter selection
        const available = getAvailableEncounters(gameState.player.level);
        if (available.length === 0) return;
        
        const index = Math.floor(Math.random() * available.length);
        template = available[index];
        console.log('Spawning random encounter:', template.name);
    }
    
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
            // Use our custom texture (golden skeleton)
            guardTexture = encounterState.textures[template.guards.type];
            guardScale = [2.5, 4];
        } else {
            // Use enemy texture from enemies.js
            const enemyType = enemyTypes.find(t => t.name === template.guards.type);
            if (enemyType) {
                guardTexture = enemyType.texture();
                guardScale = enemyType.scale;
            } else {
                // Fallback to goblin
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
        }
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
                showDialogue('💕 PRINCESS', '"My hero! Please accept this gift as thanks for saving me!"');
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
    }
    
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
        scene.remove(guard.sprite);
        const idx = encounterState.encounterGuards.indexOf(guard);
        if (idx > -1) encounterState.encounterGuards.splice(idx, 1);
        gameState.kills++;
        document.getElementById('kills').textContent = gameState.kills;
    }
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
    const angle = Math.random() * Math.PI * 2;
    const dist = CONFIG.enemySpawnRadius * 1.2;
    
    const x = gameState.player.position.x + Math.cos(angle) * dist;
    const z = gameState.player.position.z + Math.sin(angle) * dist;
    
    const material = new THREE.SpriteMaterial({
        map: encounterState.textures.beanstalk,
        transparent: true
    });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(10, 15, 1);
    sprite.position.set(x, 7.5, z);
    scene.add(sprite);
    
    encounterState.cloudPortal = {
        sprite,
        position: new THREE.Vector3(x, 0, z),
        particleTimer: 0
    };
    
    showDialogue('☁️ MYSTERIOUS PORTAL', 'A magical beanstalk has appeared! It leads to the clouds above. Walk into the portal if you dare face the Sky Giants!');
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
}

function enterCloudArena() {
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
    
    scene.fog.color.setHex(0x87ceeb);
    renderer.setClearColor(0x87ceeb);
    
    gameState.player.position.set(0, 0, 0);
    playerGroup.position.set(0, 0, 0);
    
    gameState.targetCameraZoom = CLOUD_ARENA_CONFIG.cameraZoom;
    
    spawnArenaEnemies();
    
    showDialogue('⚔️ CLOUD ARENA', 'Defeat all the Sky Giants and their minions to claim your reward!');
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

function spawnArenaEnemies() {
    // Spawn Sky Giant bosses
    for (let i = 0; i < CLOUD_ARENA_CONFIG.bossCount; i++) {
        const angle = (i / CLOUD_ARENA_CONFIG.bossCount) * Math.PI * 2;
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
        
        const bossHealth = getBossHealth() * CLOUD_ARENA_CONFIG.bossHealthMultiplier;
        const boss = {
            sprite,
            health: bossHealth,
            maxHealth: bossHealth,
            damage: getBossDamage(),
            speed: 0.03,
            hitFlash: 0,
            isArenaBoss: true
        };
        
        encounterState.arenaBosses.push(boss);
    }
    
    // Spawn cloud sprites
    for (let i = 0; i < CLOUD_ARENA_CONFIG.enemyCount; i++) {
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
        
        const baseHealth = CONFIG.enemyBaseHealth * (1 + gameState.player.level * 0.2) * CLOUD_ARENA_CONFIG.enemyHealthMultiplier;
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

function updateCloudArena() {
    if (!encounterState.inCloudArena) return;
    if (gameState.dialogueTimer > 0) return;
    
    // Update arena bosses
    for (let i = encounterState.arenaBosses.length - 1; i >= 0; i--) {
        const boss = encounterState.arenaBosses[i];
        
        const dx = gameState.player.position.x - boss.sprite.position.x;
        const dz = gameState.player.position.z - boss.sprite.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        
        if (dist > 4) {
            boss.sprite.position.x += (dx / dist) * boss.speed;
            boss.sprite.position.z += (dz / dist) * boss.speed;
        } else {
            takeDamage(boss.damage * 0.02);
        }
        
        if (boss.hitFlash > 0) {
            boss.hitFlash--;
            boss.sprite.material.color.setHex(boss.hitFlash % 4 < 2 ? 0xffffff : 0xff0000);
        } else {
            boss.sprite.material.color.setHex(0xffffff);
        }
        
        if (boss.health <= 0) {
            for (let j = 0; j < 5; j++) {
                const orbPos = boss.sprite.position.clone();
                orbPos.x += (Math.random() - 0.5) * 3;
                orbPos.z += (Math.random() - 0.5) * 3;
                spawnXPOrb(orbPos, 100);
            }
            
            scene.remove(boss.sprite);
            encounterState.arenaBosses.splice(i, 1);
        }
    }
    
    // Update arena enemies
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
            spawnXPOrb(enemy.sprite.position.clone(), 20);
            scene.remove(enemy.sprite);
            encounterState.arenaEnemies.splice(i, 1);
        }
    }
    
    // Check victory
    if (encounterState.arenaBosses.length === 0 && encounterState.arenaEnemies.length === 0) {
        winCloudArena();
    }
    
    updateArenaBossDisplay();
}

function updateArenaBossDisplay() {
    const bossBar = document.getElementById('bossHealthBar');
    if (encounterState.arenaBosses.length > 0) {
        bossBar.classList.add('active');
        document.getElementById('bossName').textContent = '☁️ SKY GIANTS (' + encounterState.arenaBosses.length + ' remaining)';
        
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
    encounterState.arenaCompleted = true;
    
    gameState.player.gold += CLOUD_ARENA_CONFIG.goldReward;
    document.getElementById('goldNum').textContent = gameState.player.gold;
    
    showReward(`☁️ CLOUD ARENA COMPLETE! +${CLOUD_ARENA_CONFIG.goldReward} GOLD`);
    
    encounterState.pendingArenaExit = true;
    
    showDialogue('🏆 VICTORY!', 'You have defeated the Sky Giants! Your surprise slaughter of the clouds was a great success, you are victorious and wealthy!');
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
    initEncounterTextures();
}

function updateEncounterSystem() {
    // Update current encounter
    updateEncounter();
    
    // Update treasure chests
    updateTreasureChests();
    
    // Update cloud portal
    updateCloudPortal();
    
    // Update cloud arena
    if (encounterState.inCloudArena) {
        updateCloudArena();
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
    
    // Cleanup portal
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
    
    // Reset state
    encounterState.currentEncounter = null;
    encounterState.encounterGuards = [];
    encounterState.cloudPortal = null;
    encounterState.portalParticles = [];
    encounterState.inCloudArena = false;
    encounterState.arenaCompleted = false;
    encounterState.savedForestPosition = null;
    encounterState.pendingArenaExit = false;
    encounterState.guaranteedEncounterQueue = [];
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
