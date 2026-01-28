// ============================================
// SLIME COMPANION SYSTEM (Multi-Companion)
// ============================================
// A modular add-on for the Mystic Forest Walker game
// Adds: Monster Store event, Multiple Purchasable Slime Companions, Slime Upgrades
//
// REQUIRED: Include this script AFTER the main game script in Forest2.html
// Add: <script src="slime-companion.js"></script> before </body>
//
// INTEGRATION NEEDED in Forest2.html:
// 1. Call initSlimeCompanion() in init()
// 2. Call updateSlimeCompanion() in animate() loop
// 3. Call resetSlimeCompanion() in restartGame()
// 4. Add isMonsterStoreActive() check to shouldSpawnEncounter()
// ============================================

// ============================================
// COMPANION COLOR PALETTE
// ============================================
const COMPANION_COLORS = [
    { name: 'Blue', primary: '#3498db', glow: 'rgba(52, 152, 219, 0.3)', icon: '🔵' },
    { name: 'Green', primary: '#2ecc71', glow: 'rgba(46, 204, 113, 0.3)', icon: '🟢' },
    { name: 'Purple', primary: '#9b59b6', glow: 'rgba(155, 89, 182, 0.3)', icon: '🟣' },
    { name: 'Orange', primary: '#e67e22', glow: 'rgba(230, 126, 34, 0.3)', icon: '🟠' },
    { name: 'Pink', primary: '#e91e63', glow: 'rgba(233, 30, 99, 0.3)', icon: '🩷' },
    { name: 'Cyan', primary: '#00bcd4', glow: 'rgba(0, 188, 212, 0.3)', icon: '🩵' },
    { name: 'Yellow', primary: '#f1c40f', glow: 'rgba(241, 196, 15, 0.3)', icon: '🟡' },
    { name: 'Red', primary: '#e74c3c', glow: 'rgba(231, 76, 60, 0.3)', icon: '🔴' },
    { name: 'Teal', primary: '#1abc9c', glow: 'rgba(26, 188, 156, 0.3)', icon: '💠' },
    { name: 'Indigo', primary: '#5c6bc0', glow: 'rgba(92, 107, 192, 0.3)', icon: '🔮' }
];

// ============================================
// SLIME COMPANION STATE
// ============================================
const slimeCompanionState = {
    // Array of companion objects
    companions: [],
    
    // Monster Store
    monsterStore: null,
    storeSlimes: [],
    storeShopkeeper: null,
    storeMenuOpen: false,
    storeVisitCount: 0, // Track how many times player has visited
    
    // Base slime cost (increases with each purchase)
    baseSlimeCost: 250,
    
    // Investment system - gold left with shopkeeper
    investedGold: 0,
    
    // Cached textures
    slimeSwordTexture: null
};

// ============================================
// MONSTER STORE STORY DIALOGUE
// ============================================
const STORE_DIALOGUE = {
    // When the store first appears in the forest
    storeAppears: [
        'A peculiar shop has appeared! Wild slimes seem to be protesting around it...',
        'The strange shop has materialized again... The wild slimes have gathered in even greater numbers, oozing angrily.',
        'That mysterious tree... it found you again. A mob of feral slimes surrounds it, gurgling what sounds like chants.'
    ],
    // When the shopkeeper greets you
    shopkeeperGreeting: [
        '"Ah, a visitor of REFINEMENT! Pay no mind to these... peasant slimes. They crawled here from some uncultured slime pool to protest my establishment. Jealousy, I say! Pure jealousy!"',
        '"You return! I knew you were a person of DISTINGUISHED taste. These rabble outside? Common muck from the bog. MY slimes have PEDIGREE. Seventeen generations of selective breeding! They wouldn\'t understand..."',
        '"My dear friend! Come, come - away from those... creatures. *shudders* Do you know they don\'t even have PAPERS? No lineage documentation whatsoever! Meanwhile, MY specimens can trace their ancestry back to the Royal Slime Pools of the Old Kingdom. But alas, the masses always resent their betters, don\'t they?"'
    ],
    // When leaving the store
    shopkeeperFarewell: [
        '"Do visit again! And don\'t let those gutter-slimes touch you on the way out. One never knows what diseases fester in an unrefined slime pool. Hmph!"',
        '"Until next time, my cultured friend! Remember - a pedigree slime is not merely a companion, it is a STATEMENT. A statement that says \'I refuse to associate with common ooze.\' Toodle-oo!"',
        '"Farewell, dear patron! Together, we shall show this forest what TRUE slime excellence looks like. Let the bog-dwellers gurgle in protest - they shall never know the joy of a PROPER gelatinous companion. Hehehehe!"'
    ],
    // Default for visits 4+
    defaultGreeting: '"Ah, my most ESTEEMED customer returns! The unwashed slimes outside have been particularly rowdy today. Unionizing, I suspect. How dreadfully common of them."',
    defaultFarewell: '"Ta-ta for now! Do keep your pedigree slimes away from any wild pools - we wouldn\'t want them picking up any... *whispers* ...lower-class habits."'
};

// ============================================
// HELPER FUNCTIONS
// ============================================
function isMonsterStoreActive() {
    return slimeCompanionState.monsterStore !== null;
}

function getNextCompanionCost() {
    const numOwned = slimeCompanionState.companions.length;
    return Math.floor(slimeCompanionState.baseSlimeCost * Math.pow(2, numOwned));
}

function getNextCompanionColor() {
    const numOwned = slimeCompanionState.companions.length;
    return COMPANION_COLORS[numOwned % COMPANION_COLORS.length];
}

function createDefaultUpgrades() {
    return {
        attackSpeed: { level: 0, maxLevel: 10, baseCost: 20, costMult: 2 },
        health: { level: 0, maxLevel: 12, baseCost: 20, costMult: 2 },
        swords: { level: 0, maxLevel: 8, baseCost: 50, costMult: 2 },
        heal: { level: 0, maxLevel: 3, baseCost: 100, costMult: 2 },
        armor: { level: 0, maxLevel: 1, baseCost: 5000, costMult: 1 }
    };
}

// ============================================
// TEXTURE GENERATORS
// ============================================

function createCompanionSlimeTexture(colorInfo) {
    return createPixelTexture(48, 48, (ctx, w, h) => {
        // Outer glow
        ctx.fillStyle = colorInfo.glow;
        ctx.beginPath();
        ctx.ellipse(24, 30, 22, 16, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Body
        ctx.fillStyle = colorInfo.primary;
        ctx.beginPath();
        ctx.ellipse(24, 30, 18, 13, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Highlight
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.beginPath();
        ctx.ellipse(18, 24, 6, 4, -0.3, 0, Math.PI * 2);
        ctx.fill();
        
        // Eyes
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.ellipse(18, 30, 5, 5, 0, 0, Math.PI * 2);
        ctx.ellipse(30, 30, 5, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Pupils
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.ellipse(19, 30, 2.5, 2.5, 0, 0, Math.PI * 2);
        ctx.ellipse(31, 30, 2.5, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();
    });
}

function createSlimeSwordTexture() {
    return createPixelTexture(24, 24, (ctx, w, h) => {
        // Blade
        ctx.fillStyle = '#87CEEB';
        ctx.beginPath();
        ctx.moveTo(12, 2);
        ctx.lineTo(16, 16);
        ctx.lineTo(12, 14);
        ctx.lineTo(8, 16);
        ctx.closePath();
        ctx.fill();
        
        // Blade highlight
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.beginPath();
        ctx.moveTo(12, 3);
        ctx.lineTo(13, 12);
        ctx.lineTo(12, 11);
        ctx.closePath();
        ctx.fill();
        
        // Guard
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(8, 15, 8, 3);
        
        // Handle
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(10, 18, 4, 5);
    });
}

function createStoreSlimeTexture() {
    return createPixelTexture(32, 32, (ctx, w, h) => {
        // Body
        ctx.fillStyle = '#27ae60';
        ctx.beginPath();
        ctx.ellipse(16, 20, 14, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Highlight
        ctx.fillStyle = '#2ecc71';
        ctx.beginPath();
        ctx.ellipse(16, 18, 10, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Eyes
        ctx.fillStyle = '#fff';
        ctx.fillRect(10, 16, 5, 5);
        ctx.fillRect(18, 16, 5, 5);
        ctx.fillStyle = '#000';
        ctx.fillRect(12, 18, 2, 2);
        ctx.fillRect(20, 18, 2, 2);
        
        // Shine
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fillRect(8, 14, 3, 3);
    });
}

function createMonsterStoreTexture() {
    return createPixelTexture(64, 96, (ctx, w, h) => {
        ctx.fillStyle = '#3d2817';
        ctx.fillRect(24, 30, 16, 66);
        
        ctx.fillStyle = '#2c1810';
        ctx.fillRect(28, 35, 3, 60);
        ctx.fillRect(35, 40, 2, 50);
        
        ctx.fillStyle = '#0d0d0d';
        ctx.beginPath();
        ctx.ellipse(32, 75, 10, 15, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#2c1810';
        ctx.strokeStyle = '#2c1810';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(32, 75, 11, 16, 0, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.fillStyle = '#3d2817';
        ctx.fillRect(10, 20, 18, 5);
        ctx.fillRect(6, 15, 10, 4);
        ctx.fillRect(2, 10, 8, 3);
        ctx.fillRect(36, 25, 20, 5);
        ctx.fillRect(48, 18, 12, 4);
        ctx.fillRect(54, 12, 8, 3);
        ctx.fillRect(20, 8, 24, 6);
        ctx.fillRect(28, 2, 8, 8);
        
        ctx.fillStyle = '#2c1810';
        ctx.fillRect(22, 28, 6, 4);
        ctx.fillRect(36, 28, 6, 4);
        
        ctx.fillStyle = '#1e5631';
        ctx.fillRect(24, 88, 4, 4);
        ctx.fillRect(34, 86, 3, 3);
        ctx.fillRect(20, 32, 3, 3);
        
        ctx.fillStyle = '#9b59b6';
        ctx.fillRect(28, 70, 3, 3);
        ctx.fillRect(35, 70, 3, 3);
    });
}

function createShopkeeperTexture() {
    return createPixelTexture(48, 56, (ctx, w, h) => {
        ctx.fillStyle = '#8e44ad';
        ctx.beginPath();
        ctx.ellipse(24, 38, 20, 16, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#9b59b6';
        ctx.beginPath();
        ctx.ellipse(24, 35, 16, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(14, 8, 20, 16);
        ctx.fillRect(10, 22, 28, 5);
        
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(14, 18, 20, 3);
        
        ctx.fillStyle = '#fff';
        ctx.fillRect(16, 30, 8, 8);
        ctx.fillRect(28, 30, 8, 8);
        
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(20, 33, 3, 4);
        ctx.fillRect(32, 33, 3, 4);
        
        ctx.strokeStyle = '#f1c40f';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(32, 34, 6, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(36, 38, 2, 8);
        ctx.fillRect(36, 44, 6, 2);
        
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(18, 42, 6, 3);
        ctx.fillRect(28, 42, 6, 3);
        ctx.fillRect(24, 43, 4, 2);
        
        ctx.fillStyle = '#6c3483';
        ctx.fillRect(20, 46, 12, 3);
        
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fillRect(14, 28, 4, 4);
    });
}

// ============================================
// MONSTER STORE
// ============================================

function shouldSpawnMonsterStore() {
    if (slimeCompanionState.monsterStore) return false;
    if (encounterState.currentEncounter) return false;
    if (encounterState.cloudPortal) return false;
    if (encounterState.inCloudArena) return false;
    if (gameState.bosses.length > 0) return false;
    if (gameState.player.level < 5) return false;
    return true;
}

function spawnMonsterStore() {
    const angle = Math.random() * Math.PI * 2;
    const dist = CONFIG.enemySpawnRadius * 1.2;
    const x = gameState.player.position.x + Math.cos(angle) * dist;
    const z = gameState.player.position.z + Math.sin(angle) * dist;
    
    const treeTexture = createMonsterStoreTexture();
    const treeMaterial = new THREE.SpriteMaterial({
        map: treeTexture,
        transparent: true
    });
    const tree = new THREE.Sprite(treeMaterial);
    tree.scale.set(12, 18, 1);
    tree.position.set(x, 9, z);
    scene.add(tree);
    
    slimeCompanionState.monsterStore = {
        tree,
        position: new THREE.Vector3(x, 0, z),
        guardsDefeated: false,
        shopkeeperSpawned: false,
        rewardGiven: false,
        cleanupTimer: 0
    };
    
    // Spawn guard slimes
    const slimeTexture = createStoreSlimeTexture();
    const numGuards = 5;
    
    for (let i = 0; i < numGuards; i++) {
        const guardAngle = (i / numGuards) * Math.PI * 2;
        const guardDist = 6 + Math.random() * 3;
        const gx = x + Math.cos(guardAngle) * guardDist;
        const gz = z + Math.sin(guardAngle) * guardDist;
        
        const material = new THREE.SpriteMaterial({
            map: slimeTexture,
            transparent: true
        });
        const sprite = new THREE.Sprite(material);
        sprite.scale.set(2.5, 2.5, 1);
        sprite.position.set(gx, 1.25, gz);
        scene.add(sprite);
        
        const baseHealth = CONFIG.enemyBaseHealth * (1 + gameState.player.level * 0.2);
        slimeCompanionState.storeSlimes.push({
            sprite,
            health: baseHealth,
            maxHealth: baseHealth,
            damage: CONFIG.enemyBaseDamage * (1 + gameState.player.level * 0.15),
            speed: 0.04,
            attackCooldown: 0,
            hitFlash: 0
        });
    }
    
    gameState.targetCameraZoom = 2.5;
    
    // Story dialogue based on visit count
    const visitNum = slimeCompanionState.storeVisitCount;
    const storeMessage = visitNum < 3 ? STORE_DIALOGUE.storeAppears[visitNum] : STORE_DIALOGUE.storeAppears[2];
    showDialogue('🌳 MONSTER STORE', storeMessage);
}

function updateMonsterStore() {
    const store = slimeCompanionState.monsterStore;
    if (!store) return;
    
    if (store.cleanupTimer > 0) {
        store.cleanupTimer--;
        if (store.cleanupTimer <= 0) {
            cleanupMonsterStore();
            return;
        }
    }
    
    if (!store.guardsDefeated && slimeCompanionState.storeSlimes.length === 0) {
        store.guardsDefeated = true;
        spawnShopkeeper();
    }
    
    if (!store.guardsDefeated && gameState.dialogueTimer <= 0) {
        updateStoreGuards();
    }
    
    if (store.shopkeeperSpawned && !store.rewardGiven) {
        updateShopkeeper();
    }
    
    // Cleanup if player walks far away after shopping
    const dx = gameState.player.position.x - store.position.x;
    const dz = gameState.player.position.z - store.position.z;
    const dist = Math.sqrt(dx * dx + dz * dz);
    
    if (dist > CONFIG.renderDistance * 2 && store.rewardGiven) {
        cleanupMonsterStore();
    }
}

function updateStoreGuards() {
    const store = slimeCompanionState.monsterStore;
    
    for (const slime of slimeCompanionState.storeSlimes) {
        const dx = gameState.player.position.x - slime.sprite.position.x;
        const dz = gameState.player.position.z - slime.sprite.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        
        if (dist > 2) {
            slime.sprite.position.x += (dx / dist) * slime.speed;
            slime.sprite.position.z += (dz / dist) * slime.speed;
        } else if (slime.attackCooldown <= 0) {
            takeDamage(slime.damage);
            slime.attackCooldown = 60;
        }
        
        slime.attackCooldown = Math.max(0, slime.attackCooldown - 1);
        
        if (slime.hitFlash > 0) {
            slime.hitFlash--;
            slime.sprite.material.color.setHex(slime.hitFlash % 4 < 2 ? 0xffffff : 0xff0000);
        } else {
            slime.sprite.material.color.setHex(0xffffff);
        }
    }
}

function spawnShopkeeper() {
    const store = slimeCompanionState.monsterStore;
    
    const shopkeeperTexture = createShopkeeperTexture();
    const shopkeeperMaterial = new THREE.SpriteMaterial({
        map: shopkeeperTexture,
        transparent: true
    });
    const shopkeeper = new THREE.Sprite(shopkeeperMaterial);
    shopkeeper.scale.set(4, 4.5, 1);
    shopkeeper.position.copy(store.position);
    shopkeeper.position.y = 2.25;
    scene.add(shopkeeper);
    
    slimeCompanionState.storeShopkeeper = shopkeeper;
    store.shopkeeperSpawned = true;
    
    // Story dialogue based on visit count
    const visitNum = slimeCompanionState.storeVisitCount;
    const greeting = visitNum < 3 ? STORE_DIALOGUE.shopkeeperGreeting[visitNum] : STORE_DIALOGUE.defaultGreeting;
    showDialogue('🎩 MERCHANT', greeting);
}

function updateShopkeeper() {
    const store = slimeCompanionState.monsterStore;
    const shopkeeper = slimeCompanionState.storeShopkeeper;
    
    if (!shopkeeper || store.rewardGiven) return;
    
    const dx = gameState.player.position.x - shopkeeper.position.x;
    const dz = gameState.player.position.z - shopkeeper.position.z;
    const dist = Math.sqrt(dx * dx + dz * dz);
    
    if (dist > 2.5) {
        shopkeeper.position.x += (dx / dist) * 0.05;
        shopkeeper.position.z += (dz / dist) * 0.05;
    } else if (!store.rewardGiven) {
        store.rewardGiven = true;
        gameState.targetCameraZoom = 1;
        openSlimeStore();
    }
}

function cleanupMonsterStore() {
    const store = slimeCompanionState.monsterStore;
    if (!store) return;
    
    console.log('Cleaning up Monster Store');
    
    slimeCompanionState.storeMenuOpen = false;
    const storeMenu = document.getElementById('slimeStoreMenu');
    if (storeMenu) {
        storeMenu.style.display = 'none';
    }
    
    if (store.tree) {
        scene.remove(store.tree);
    }
    
    slimeCompanionState.storeSlimes.forEach(s => scene.remove(s.sprite));
    slimeCompanionState.storeSlimes = [];
    
    if (slimeCompanionState.storeShopkeeper) {
        scene.remove(slimeCompanionState.storeShopkeeper);
        slimeCompanionState.storeShopkeeper = null;
    }
    
    slimeCompanionState.monsterStore = null;
}

function damageStoreSlime(slime, damage) {
    slime.health -= damage;
    slime.hitFlash = 10;
    
    if (slime.health <= 0) {
        scene.remove(slime.sprite);
        const idx = slimeCompanionState.storeSlimes.indexOf(slime);
        if (idx > -1) {
            slimeCompanionState.storeSlimes.splice(idx, 1);
        }
        
        spawnXPOrb(slime.sprite.position.clone(), 10);
        if (Math.random() < 0.15) {
            spawnGoldOrb(slime.sprite.position.clone(), 10);
        }
        
        gameState.kills++;
        document.getElementById('kills').textContent = gameState.kills;
        
        return true;
    }
    return false;
}

// ============================================
// SLIME STORE UI
// ============================================

function createSlimeStoreUI() {
    slimeCompanionState.slimeSwordTexture = createSlimeSwordTexture();
    
    const storeMenu = document.createElement('div');
    storeMenu.id = 'slimeStoreMenu';
    storeMenu.innerHTML = `
        <div id="slimeStoreContent">
            <div id="storeHeader">
                <button id="closeSlimeStoreTop">✕</button>
                <h2>🏪 MONSTER STORE</h2>
                <div id="storeGoldDisplay">💰 <span id="storeGoldAmount">0</span></div>
            </div>
            <div id="slimeStoreItems">
                <!-- Dynamic content will be inserted here -->
            </div>
            <div id="storeFooter">
                <button id="closeSlimeStore">CLOSE STORE</button>
            </div>
        </div>
    `;
    
    const styles = document.createElement('style');
    styles.textContent = `
        #slimeStoreMenu {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.85);
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 600;
            pointer-events: auto;
        }
        
        #slimeStoreContent {
            background: linear-gradient(180deg, #2c2c54, #1a1a2e);
            border: 4px solid #6c5ce7;
            border-radius: 16px;
            max-width: 360px;
            width: 90%;
            max-height: 85vh;
            display: flex;
            flex-direction: column;
            box-shadow: 0 0 30px rgba(108,92,231,0.5);
        }
        
        #storeHeader {
            position: relative;
            padding: 15px 20px 10px 20px;
            border-bottom: 2px solid #6c5ce7;
            flex-shrink: 0;
        }
        
        #closeSlimeStoreTop {
            position: absolute;
            top: 10px;
            right: 10px;
            width: 30px;
            height: 30px;
            background: linear-gradient(180deg, #c0392b, #96281b);
            border: 2px solid #e74c3c;
            border-radius: 50%;
            color: #fff;
            font-size: 16px;
            font-family: Arial, sans-serif;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            line-height: 1;
        }
        
        #closeSlimeStoreTop:active {
            transform: scale(0.9);
        }
        
        #slimeStoreContent h2 {
            color: #ffd700;
            text-align: center;
            margin-bottom: 10px;
            font-size: 14px;
            text-shadow: 0 0 10px #ffd700;
            font-family: 'Press Start 2P', cursive;
        }
        
        #storeGoldDisplay {
            text-align: center;
            color: #f1c40f;
            font-size: 12px;
            font-family: 'Press Start 2P', cursive;
            text-shadow: 0 0 10px rgba(241, 196, 15, 0.5);
        }
        
        #slimeStoreItems {
            flex: 1;
            overflow-y: auto;
            overflow-x: hidden;
            padding: 15px 20px;
            -webkit-overflow-scrolling: touch;
            overscroll-behavior: contain;
            scrollbar-width: thin;
            scrollbar-color: #6c5ce7 #1a1a2e;
            touch-action: pan-y;
        }
        
        #slimeStoreItems::-webkit-scrollbar {
            width: 8px;
        }
        
        #slimeStoreItems::-webkit-scrollbar-track {
            background: #1a1a2e;
            border-radius: 4px;
        }
        
        #slimeStoreItems::-webkit-scrollbar-thumb {
            background: #6c5ce7;
            border-radius: 4px;
        }
        
        #slimeStoreItems::-webkit-scrollbar-thumb:hover {
            background: #8b7cf7;
        }
        
        #storeFooter {
            padding: 10px 20px 15px 20px;
            border-top: 2px solid #6c5ce7;
            flex-shrink: 0;
        }
        
        .store-item {
            display: flex;
            align-items: center;
            background: rgba(0,0,0,0.3);
            border: 2px solid #444;
            border-radius: 8px;
            padding: 10px;
            margin-bottom: 12px;
            gap: 10px;
        }
        
        .store-item.owned {
            border-color: #6c5ce7;
            background: rgba(108,92,231,0.15);
        }
        
        .store-item.locked {
            opacity: 0.5;
        }
        
        .store-item.maxed {
            border-color: #27ae60;
            opacity: 0.7;
        }
        
        .store-icon {
            font-size: 28px;
            width: 40px;
            text-align: center;
        }
        
        .store-info {
            flex: 1;
        }
        
        .store-name {
            color: #fff;
            font-size: 10px;
            font-family: 'Press Start 2P', cursive;
            margin-bottom: 2px;
        }
        
        .store-desc {
            color: #888;
            font-size: 7px;
            font-family: 'Press Start 2P', cursive;
            margin-bottom: 4px;
        }
        
        .store-status, .store-level {
            color: #9b59b6;
            font-size: 8px;
            font-family: 'Press Start 2P', cursive;
        }
        
        .store-btn {
            background: linear-gradient(180deg, #f39c12, #d68910);
            border: 2px solid #ffd700;
            border-radius: 6px;
            color: #fff;
            padding: 8px 12px;
            font-size: 8px;
            font-family: 'Press Start 2P', cursive;
            cursor: pointer;
            pointer-events: auto;
            min-width: 70px;
        }
        
        .store-btn:disabled {
            background: #555;
            border-color: #666;
            color: #888;
            cursor: not-allowed;
        }
        
        .store-btn:not(:disabled):active {
            transform: scale(0.95);
        }
        
        #closeSlimeStore {
            width: 100%;
            margin-top: 15px;
            background: linear-gradient(180deg, #c0392b, #96281b);
            border: 2px solid #e74c3c;
            border-radius: 8px;
            color: #fff;
            padding: 12px;
            font-size: 12px;
            font-family: 'Press Start 2P', cursive;
            cursor: pointer;
            pointer-events: auto;
        }
        
        #closeSlimeStore:active {
            transform: scale(0.98);
        }
        
        .companion-section {
            border: 2px solid #6c5ce7;
            border-radius: 8px;
            padding: 10px;
            margin-bottom: 15px;
            background: rgba(108,92,231,0.1);
        }
        
        .companion-header {
            color: #bb8fce;
            font-size: 10px;
            font-family: 'Press Start 2P', cursive;
            margin-bottom: 10px;
            text-align: center;
        }
        
        #slimeHealthContainer {
            position: fixed;
            bottom: 200px;
            left: 10px;
            display: none;
            flex-direction: column;
            gap: 5px;
            z-index: 100;
        }
        
        #slimeHealthContainer.active {
            display: flex;
        }
        
        .slime-health-bar {
            width: 100px;
            height: 10px;
            background: #333;
            border: 2px solid #222;
            border-radius: 2px;
            overflow: hidden;
        }
        
        .slime-health-fill {
            height: 100%;
            background: linear-gradient(180deg, #3498db, #2980b9);
            transition: width 0.3s;
        }
        
        .slime-health-label {
            color: #fff;
            font-size: 7px;
            font-family: 'Press Start 2P', cursive;
        }
        
        #healIndicator {
            position: fixed;
            bottom: 260px;
            left: 10px;
            font-size: 20px;
            display: none;
            opacity: 0.5;
        }
        
        #healIndicator.active {
            display: block;
        }
        
        #healIndicator.ready {
            opacity: 1;
            animation: pulse 1s infinite;
        }
        
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
        }
    `;
    
    document.head.appendChild(styles);
    document.getElementById('ui').appendChild(storeMenu);
    
    const healthContainer = document.createElement('div');
    healthContainer.id = 'slimeHealthContainer';
    document.body.appendChild(healthContainer);
    
    const healIndicator = document.createElement('div');
    healIndicator.id = 'healIndicator';
    healIndicator.textContent = '💚';
    document.getElementById('ui').appendChild(healIndicator);
    
    setupSlimeStoreEvents();
}

function setupSlimeStoreEvents() {
    document.getElementById('closeSlimeStore').addEventListener('click', closeSlimeStore);
    document.getElementById('closeSlimeStore').addEventListener('touchstart', (e) => {
        e.preventDefault();
        closeSlimeStore();
    });
    
    document.getElementById('closeSlimeStoreTop').addEventListener('click', closeSlimeStore);
    document.getElementById('closeSlimeStoreTop').addEventListener('touchstart', (e) => {
        e.preventDefault();
        closeSlimeStore();
    });
}

function rebuildStoreUI() {
    const state = slimeCompanionState;
    const itemsContainer = document.getElementById('slimeStoreItems');
    
    // Clear existing items
    itemsContainer.innerHTML = '';
    
    // Add "Buy New Companion" option
    const nextColor = getNextCompanionColor();
    const nextCost = getNextCompanionCost();
    const companionNum = state.companions.length + 1;
    
    const buySection = document.createElement('div');
    buySection.className = 'store-item';
    buySection.id = 'store-buyCompanion';
    buySection.innerHTML = `
        <div class="store-icon">${nextColor.icon}</div>
        <div class="store-info">
            <div class="store-name">${state.companions.length === 0 ? 'Slime Companion' : 'New Companion #' + companionNum}</div>
            <div class="store-desc">${state.companions.length === 0 ? 'A friendly slime that fights by your side!' : nextColor.name + ' slime to join your team!'}</div>
        </div>
        <button class="store-btn" id="buyCompanionBtn">
            <span class="cost">💰 ${nextCost}</span>
        </button>
    `;
    itemsContainer.appendChild(buySection);
    
    // Setup buy button
    const buyBtn = document.getElementById('buyCompanionBtn');
    buyBtn.addEventListener('click', purchaseCompanion);
    buyBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        purchaseCompanion();
    });
    
    // Add upgrade sections for each owned companion
    state.companions.forEach((companion, index) => {
        const section = document.createElement('div');
        section.className = 'companion-section';
        section.style.borderColor = companion.color.primary;
        section.innerHTML = `
            <div class="companion-header" style="color: ${companion.color.primary}">
                ${companion.color.icon} ${companion.color.name} Slime #${index + 1}
            </div>
            <div class="companion-upgrades" id="companion-${index}-upgrades">
                ${createUpgradeItemHTML(index, 'attackSpeed', '⚡', 'Attack Speed', 'Faster slime attacks')}
                ${createUpgradeItemHTML(index, 'health', '❤️', 'Slime Health', '+5% max health per level')}
                ${createUpgradeItemHTML(index, 'swords', '⚔️', 'Slime Swords', 'Orbiting blades around slime')}
                ${createUpgradeItemHTML(index, 'heal', '💚', 'Heal Ability', 'Heals faster: 60s→50s→40s')}
                ${createUpgradeItemHTML(index, 'armor', '🛡️', 'Slime Armor', '10x health boost!')}
            </div>
        `;
        itemsContainer.appendChild(section);
        
        // Setup upgrade buttons for this companion
        ['attackSpeed', 'health', 'swords', 'heal', 'armor'].forEach(upgradeKey => {
            const btn = document.getElementById(`companion-${index}-${upgradeKey}-btn`);
            if (btn) {
                btn.addEventListener('click', () => purchaseCompanionUpgrade(index, upgradeKey));
                btn.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    purchaseCompanionUpgrade(index, upgradeKey);
                });
            }
        });
    });
    
    // Add Investment Section
    const investSection = document.createElement('div');
    investSection.className = 'companion-section';
    investSection.style.borderColor = '#f1c40f';
    const pendingReturn = state.investedGold * 10;
    investSection.innerHTML = `
        <div class="companion-header" style="color: #f1c40f">
            💰 INVEST IN THE STORE 💰
        </div>
        <div class="store-item" style="border-color: #f1c40f;">
            <div class="store-icon">🏦</div>
            <div class="store-info">
                <div class="store-name">Leave Gold</div>
                <div class="store-desc">Get 10x back next visit!</div>
                <div class="store-level" id="investedDisplay">Invested: 💰 ${state.investedGold}${state.investedGold > 0 ? ' → Returns: 💰 ' + pendingReturn : ''}</div>
            </div>
            <button class="store-btn" id="investBtn" style="background: linear-gradient(180deg, #f1c40f, #d4ac0d);">
                <span class="cost">+ 💰 100</span>
            </button>
        </div>
    `;
    itemsContainer.appendChild(investSection);
    
    // Setup invest button
    const investBtn = document.getElementById('investBtn');
    investBtn.addEventListener('click', investGold);
    investBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        investGold();
    });
    
    updateSlimeStoreUI();
}

function createUpgradeItemHTML(companionIndex, upgradeKey, icon, name, desc) {
    const maxLevels = {
        attackSpeed: 10,
        health: 12,
        swords: 8,
        heal: 3,
        armor: 1
    };
    return `
        <div class="store-item upgrade-item-store" id="companion-${companionIndex}-${upgradeKey}">
            <div class="store-icon">${icon}</div>
            <div class="store-info">
                <div class="store-name">${name}</div>
                <div class="store-desc">${desc}</div>
                <div class="store-level">Level: <span class="lvl">0</span>/${maxLevels[upgradeKey] || 1}</div>
            </div>
            <button class="store-btn" id="companion-${companionIndex}-${upgradeKey}-btn">
                <span class="cost">💰 0</span>
            </button>
        </div>
    `;
}

function openSlimeStore() {
    slimeCompanionState.storeMenuOpen = true;
    gameState.menuOpen = true;
    
    // Pay out investment (10x return!)
    if (slimeCompanionState.investedGold > 0) {
        const payout = slimeCompanionState.investedGold * 10;
        gameState.player.gold += payout;
        updateUI();
        showReward(`💰 INVESTMENT RETURN: +${payout} GOLD!`);
        slimeCompanionState.investedGold = 0;
    }
    
    rebuildStoreUI();
    document.getElementById('slimeStoreMenu').style.display = 'flex';
}

function closeSlimeStore() {
    slimeCompanionState.storeMenuOpen = false;
    gameState.menuOpen = false;
    document.getElementById('slimeStoreMenu').style.display = 'none';
    
    if (slimeCompanionState.monsterStore) {
        slimeCompanionState.monsterStore.cleanupTimer = 30 * 60;
    }
    
    // Story dialogue based on visit count
    const visitNum = slimeCompanionState.storeVisitCount;
    const farewell = visitNum < 3 ? STORE_DIALOGUE.shopkeeperFarewell[visitNum] : STORE_DIALOGUE.defaultFarewell;
    showDialogue('🎩 MERCHANT', farewell);
    
    // Increment visit count after showing dialogue
    slimeCompanionState.storeVisitCount++;
}

function updateSlimeStoreUI() {
    const state = slimeCompanionState;
    
    // Update gold display
    const goldDisplay = document.getElementById('storeGoldAmount');
    if (goldDisplay) {
        goldDisplay.textContent = gameState.player.gold;
    }
    
    // Update buy button
    const buyBtn = document.getElementById('buyCompanionBtn');
    if (buyBtn) {
        const cost = getNextCompanionCost();
        buyBtn.disabled = gameState.player.gold < cost;
        buyBtn.querySelector('.cost').textContent = '💰 ' + cost;
    }
    
    // Update each companion's upgrades
    state.companions.forEach((companion, index) => {
        ['attackSpeed', 'health', 'swords', 'heal', 'armor'].forEach(upgradeKey => {
            updateCompanionUpgradeItem(index, upgradeKey);
        });
    });
    
    // Update invest button
    const investBtn = document.getElementById('investBtn');
    if (investBtn) {
        investBtn.disabled = gameState.player.gold < 100;
    }
    
    // Update invested display
    const investedDisplay = document.getElementById('investedDisplay');
    if (investedDisplay) {
        const pendingReturn = state.investedGold * 10;
        if (state.investedGold > 0) {
            investedDisplay.textContent = 'Invested: 💰 ' + state.investedGold + ' → Returns: 💰 ' + pendingReturn;
        } else {
            investedDisplay.textContent = 'Invested: 💰 0';
        }
    }
}

function updateCompanionUpgradeItem(companionIndex, upgradeKey) {
    const state = slimeCompanionState;
    const companion = state.companions[companionIndex];
    if (!companion) return;
    
    const upgrade = companion.upgrades[upgradeKey];
    const item = document.getElementById(`companion-${companionIndex}-${upgradeKey}`);
    if (!item) return;
    
    const btn = item.querySelector('.store-btn');
    const lvlSpan = item.querySelector('.lvl');
    const costSpan = btn.querySelector('.cost');
    
    lvlSpan.textContent = upgrade.level;
    
    if (upgrade.level >= upgrade.maxLevel) {
        item.classList.add('maxed');
        btn.disabled = true;
        costSpan.textContent = 'MAX';
    } else {
        item.classList.remove('maxed');
        const cost = getCompanionUpgradeCost(companionIndex, upgradeKey);
        costSpan.textContent = '💰 ' + cost;
        btn.disabled = gameState.player.gold < cost;
    }
}

function getCompanionUpgradeCost(companionIndex, upgradeKey) {
    const companion = slimeCompanionState.companions[companionIndex];
    if (!companion) return 999999;
    const upgrade = companion.upgrades[upgradeKey];
    
    return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMult, upgrade.level));
}

function purchaseCompanion() {
    const state = slimeCompanionState;
    const cost = getNextCompanionCost();
    
    if (gameState.player.gold < cost) return;
    
    gameState.player.gold -= cost;
    
    const colorInfo = getNextCompanionColor();
    const companionIndex = state.companions.length;
    
    // Create companion object
    const companion = {
        id: companionIndex,
        color: colorInfo,
        sprite: null,
        health: 0,
        maxHealth: 0,
        upgrades: createDefaultUpgrades(),
        swords: [],
        projectiles: [],
        wanderAngle: Math.random() * Math.PI * 2,
        attackCooldown: 0,
        healCooldown: 0,
        target: null
    };
    
    state.companions.push(companion);
    
    spawnCompanionSlime(companionIndex);
    
    updateUI();
    rebuildStoreUI();
    showReward(`${colorInfo.icon} ${colorInfo.name.toUpperCase()} SLIME ACQUIRED!`);
}

function purchaseCompanionUpgrade(companionIndex, upgradeKey) {
    const state = slimeCompanionState;
    const companion = state.companions[companionIndex];
    if (!companion) return;
    
    const upgrade = companion.upgrades[upgradeKey];
    if (upgrade.level >= upgrade.maxLevel) return;
    
    const cost = getCompanionUpgradeCost(companionIndex, upgradeKey);
    if (gameState.player.gold < cost) return;
    
    gameState.player.gold -= cost;
    upgrade.level++;
    
    if (upgradeKey === 'health' || upgradeKey === 'armor') {
        updateCompanionMaxHealth(companionIndex);
        // If armor purchased, also heal to new max
        if (upgradeKey === 'armor') {
            companion.health = companion.maxHealth;
        }
    }
    
    if (upgradeKey === 'swords') {
        updateCompanionSwordCount(companionIndex);
    }
    
    if (upgradeKey === 'heal') {
        document.getElementById('healIndicator').classList.add('active');
    }
    
    updateUI();
    updateSlimeStoreUI();
    
    const upgradeNames = {
        attackSpeed: '⚡ ATTACK SPEED',
        health: '❤️ SLIME HEALTH',
        swords: '⚔️ SLIME SWORDS',
        heal: '💚 HEAL ABILITY',
        armor: '🛡️ SLIME ARMOR'
    };
    showReward(`${companion.color.icon} ${upgradeNames[upgradeKey]} UPGRADED!`);
}

function investGold() {
    const investAmount = 100;
    
    if (gameState.player.gold < investAmount) return;
    
    gameState.player.gold -= investAmount;
    slimeCompanionState.investedGold += investAmount;
    
    const projectedReturn = slimeCompanionState.investedGold * 10;
    
    updateUI();
    updateSlimeStoreUI();
    
    showReward(`💰 TOTAL: ${slimeCompanionState.investedGold} → RETURNS: ${projectedReturn}!`);
}

// ============================================
// COMPANION SLIME SYSTEM
// ============================================

function spawnCompanionSlime(companionIndex) {
    const state = slimeCompanionState;
    const companion = state.companions[companionIndex];
    if (!companion) return;
    
    const texture = createCompanionSlimeTexture(companion.color);
    const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true
    });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(3.75, 3.75, 1);
    
    const angle = Math.random() * Math.PI * 2;
    const dist = 3 + companionIndex * 0.5; // Slight offset for each companion
    sprite.position.set(
        gameState.player.position.x + Math.cos(angle) * dist,
        1.875,
        gameState.player.position.z + Math.sin(angle) * dist
    );
    
    scene.add(sprite);
    
    companion.sprite = sprite;
    
    updateCompanionMaxHealth(companionIndex);
    companion.health = companion.maxHealth;
    
    updateCompanionSwordCount(companionIndex);
    updateHealthBarsUI();
}

function updateCompanionMaxHealth(companionIndex) {
    const companion = slimeCompanionState.companions[companionIndex];
    if (!companion) return;
    
    const healthPercent = 0.5 + (companion.upgrades.health.level * 0.05);
    let maxHealth = gameState.player.maxHealth * healthPercent;
    
    // Armor upgrade gives 10x health
    if (companion.upgrades.armor && companion.upgrades.armor.level > 0) {
        maxHealth *= 10;
    }
    
    companion.maxHealth = maxHealth;
    
    if (companion.health > companion.maxHealth) {
        companion.health = companion.maxHealth;
    }
}

function updateHealthBarsUI() {
    const state = slimeCompanionState;
    const container = document.getElementById('slimeHealthContainer');
    
    if (state.companions.length === 0) {
        container.classList.remove('active');
        return;
    }
    
    container.classList.add('active');
    container.innerHTML = '';
    
    state.companions.forEach((companion, index) => {
        if (companion.health <= 0) return;
        
        const healthPercent = (companion.health / companion.maxHealth) * 100;
        const bar = document.createElement('div');
        bar.innerHTML = `
            <div class="slime-health-label" style="color: ${companion.color.primary}">${companion.color.icon} #${index + 1}</div>
            <div class="slime-health-bar">
                <div class="slime-health-fill" style="width: ${healthPercent}%; background: linear-gradient(180deg, ${companion.color.primary}, ${companion.color.primary}99);"></div>
            </div>
        `;
        container.appendChild(bar);
    });
}

// ============================================
// SLIME SWORDS SYSTEM
// ============================================

function updateCompanionSwordCount(companionIndex) {
    const state = slimeCompanionState;
    const companion = state.companions[companionIndex];
    if (!companion) return;
    
    const targetCount = companion.upgrades.swords.level;
    
    // Remove excess swords
    while (companion.swords.length > targetCount) {
        const sword = companion.swords.pop();
        scene.remove(sword.sprite);
    }
    
    // Add new swords
    while (companion.swords.length < targetCount) {
        const material = new THREE.SpriteMaterial({
            map: state.slimeSwordTexture,
            transparent: true
        });
        const sprite = new THREE.Sprite(material);
        sprite.scale.set(1.8, 1.8, 1);
        scene.add(sprite);
        
        companion.swords.push({
            sprite,
            angle: (companion.swords.length / targetCount) * Math.PI * 2,
            hitCooldowns: new Map()
        });
    }
    
    // Redistribute angles
    companion.swords.forEach((sword, i) => {
        sword.angle = (i / companion.swords.length) * Math.PI * 2;
    });
}

function updateCompanionSwords(companionIndex) {
    const state = slimeCompanionState;
    const companion = state.companions[companionIndex];
    if (!companion || !companion.sprite || companion.health <= 0) return;
    
    const orbitRadius = 2.5;
    const orbitSpeed = 0.04;
    const swordDamage = CONFIG.projectileBaseDamage * (1 + gameState.player.level * 0.2);
    
    companion.swords.forEach(sword => {
        sword.angle += orbitSpeed;
        
        sword.sprite.position.x = companion.sprite.position.x + Math.cos(sword.angle) * orbitRadius;
        sword.sprite.position.z = companion.sprite.position.z + Math.sin(sword.angle) * orbitRadius;
        sword.sprite.position.y = companion.sprite.position.y;
        
        sword.sprite.material.rotation = sword.angle + Math.PI / 2;
        
        // Check collisions with enemies
        for (const enemy of gameState.enemies) {
            const dx = sword.sprite.position.x - enemy.sprite.position.x;
            const dz = sword.sprite.position.z - enemy.sprite.position.z;
            const dist = Math.sqrt(dx * dx + dz * dz);
            
            if (dist < 1.2) {
                const lastHit = sword.hitCooldowns.get(enemy) || 0;
                const now = Date.now();
                
                if (now - lastHit > 500) {
                    enemy.health -= swordDamage;
                    enemy.hitFlash = 10;
                    sword.hitCooldowns.set(enemy, now);
                }
            }
        }
        
        // Check bosses
        for (const boss of gameState.bosses) {
            const dx = sword.sprite.position.x - boss.sprite.position.x;
            const dz = sword.sprite.position.z - boss.sprite.position.z;
            const dist = Math.sqrt(dx * dx + dz * dz);
            
            if (dist < 4) {
                const lastHit = sword.hitCooldowns.get(boss) || 0;
                const now = Date.now();
                
                if (now - lastHit > 500) {
                    boss.health -= swordDamage;
                    boss.hitFlash = 10;
                    sword.hitCooldowns.set(boss, now);
                }
            }
        }
        
        // Check encounter guards
        if (encounterState && encounterState.encounterGuards) {
            for (const guard of encounterState.encounterGuards) {
                const dx = sword.sprite.position.x - guard.sprite.position.x;
                const dz = sword.sprite.position.z - guard.sprite.position.z;
                const dist = Math.sqrt(dx * dx + dz * dz);
                
                if (dist < 1.2) {
                    const lastHit = sword.hitCooldowns.get(guard) || 0;
                    const now = Date.now();
                    
                    if (now - lastHit > 500) {
                        guard.health -= swordDamage;
                        guard.hitFlash = 10;
                        sword.hitCooldowns.set(guard, now);
                    }
                }
            }
        }
        
        // Cleanup dead targets from cooldown map
        for (const [target, time] of sword.hitCooldowns) {
            if (!gameState.enemies.includes(target) && 
                !gameState.bosses.includes(target) && 
                !(encounterState && encounterState.encounterGuards && encounterState.encounterGuards.includes(target))) {
                sword.hitCooldowns.delete(target);
            }
        }
    });
}

// ============================================
// COMPANION UPDATE LOOP
// ============================================

function updateCompanionSlime() {
    const state = slimeCompanionState;
    
    if (state.companions.length === 0) return;
    if (gameState.dialogueTimer > 0) return;
    
    state.companions.forEach((companion, index) => {
        if (!companion.sprite || companion.health <= 0) return;
        
        // Movement AI
        updateCompanionMovement(index);
        
        // Combat
        updateCompanionCombat(index);
        
        // Swords
        updateCompanionSwords(index);
        
        // Heal ability
        updateCompanionHeal(index);
    });
    
    // Update health bars
    updateHealthBarsUI();
}

function updateCompanionMovement(companionIndex) {
    const companion = slimeCompanionState.companions[companionIndex];
    if (!companion || !companion.sprite) return;
    
    const dx = gameState.player.position.x - companion.sprite.position.x;
    const dz = gameState.player.position.z - companion.sprite.position.z;
    const distToPlayer = Math.sqrt(dx * dx + dz * dz);
    
    const followDist = 4 + companionIndex * 0.5;
    const speed = 0.08;
    
    // Find nearest enemy
    let nearestEnemy = null;
    let nearestDist = 15;
    
    for (const enemy of gameState.enemies) {
        const ex = enemy.sprite.position.x - companion.sprite.position.x;
        const ez = enemy.sprite.position.z - companion.sprite.position.z;
        const eDist = Math.sqrt(ex * ex + ez * ez);
        
        if (eDist < nearestDist) {
            nearestDist = eDist;
            nearestEnemy = enemy;
        }
    }
    
    // Check bosses too
    for (const boss of gameState.bosses) {
        const bx = boss.sprite.position.x - companion.sprite.position.x;
        const bz = boss.sprite.position.z - companion.sprite.position.z;
        const bDist = Math.sqrt(bx * bx + bz * bz);
        
        if (bDist < nearestDist) {
            nearestDist = bDist;
            nearestEnemy = boss;
        }
    }
    
    companion.target = nearestEnemy;
    
    if (distToPlayer > followDist + 5) {
        // Too far from player - return
        companion.sprite.position.x += (dx / distToPlayer) * speed * 1.5;
        companion.sprite.position.z += (dz / distToPlayer) * speed * 1.5;
    } else if (nearestEnemy && nearestDist < 12) {
        // Chase enemy
        const ex = nearestEnemy.sprite.position.x - companion.sprite.position.x;
        const ez = nearestEnemy.sprite.position.z - companion.sprite.position.z;
        
        if (nearestDist > 5) {
            companion.sprite.position.x += (ex / nearestDist) * speed;
            companion.sprite.position.z += (ez / nearestDist) * speed;
        }
    } else if (distToPlayer > followDist) {
        // Follow player
        companion.sprite.position.x += (dx / distToPlayer) * speed * 0.5;
        companion.sprite.position.z += (dz / distToPlayer) * speed * 0.5;
    } else {
        // Wander near player
        companion.wanderAngle += (Math.random() - 0.5) * 0.1;
        companion.sprite.position.x += Math.cos(companion.wanderAngle) * speed * 0.2;
        companion.sprite.position.z += Math.sin(companion.wanderAngle) * speed * 0.2;
    }
}

function updateCompanionCombat(companionIndex) {
    const companion = slimeCompanionState.companions[companionIndex];
    if (!companion || !companion.sprite) return;
    
    companion.attackCooldown = Math.max(0, companion.attackCooldown - 1);
    
    // Update projectiles
    for (let i = companion.projectiles.length - 1; i >= 0; i--) {
        const proj = companion.projectiles[i];
        
        proj.sprite.position.x += proj.vx;
        proj.sprite.position.z += proj.vz;
        proj.life--;
        
        let hit = false;
        
        // Check enemies
        for (const enemy of gameState.enemies) {
            const dx = proj.sprite.position.x - enemy.sprite.position.x;
            const dz = proj.sprite.position.z - enemy.sprite.position.z;
            const dist = Math.sqrt(dx * dx + dz * dz);
            
            if (dist < 1.5) {
                enemy.health -= proj.damage;
                enemy.hitFlash = 10;
                hit = true;
                break;
            }
        }
        
        // Check bosses
        if (!hit) {
            for (const boss of gameState.bosses) {
                const dx = proj.sprite.position.x - boss.sprite.position.x;
                const dz = proj.sprite.position.z - boss.sprite.position.z;
                const dist = Math.sqrt(dx * dx + dz * dz);
                
                if (dist < 4) {
                    boss.health -= proj.damage;
                    boss.hitFlash = 10;
                    hit = true;
                    break;
                }
            }
        }
        
        if (hit || proj.life <= 0) {
            scene.remove(proj.sprite);
            companion.projectiles.splice(i, 1);
        }
    }
    
    // Shoot at target
    if (companion.target && companion.attackCooldown <= 0) {
        const tx = companion.target.sprite.position.x - companion.sprite.position.x;
        const tz = companion.target.sprite.position.z - companion.sprite.position.z;
        const dist = Math.sqrt(tx * tx + tz * tz);
        
        if (dist < 12) {
            fireCompanionProjectile(companionIndex, tx / dist, tz / dist);
            
            const baseAttackCooldown = 45;
            const speedBonus = companion.upgrades.attackSpeed.level * 0.08;
            companion.attackCooldown = Math.floor(baseAttackCooldown * (1 - speedBonus));
        }
    }
}

function fireCompanionProjectile(companionIndex, dirX, dirZ) {
    const companion = slimeCompanionState.companions[companionIndex];
    if (!companion || !companion.sprite) return;
    
    const projTexture = createPixelTexture(16, 16, (ctx, w, h) => {
        ctx.fillStyle = companion.color.glow;
        ctx.beginPath();
        ctx.arc(8, 8, 7, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = companion.color.primary;
        ctx.beginPath();
        ctx.arc(8, 8, 5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.beginPath();
        ctx.arc(6, 6, 2, 0, Math.PI * 2);
        ctx.fill();
    });
    
    const material = new THREE.SpriteMaterial({
        map: projTexture,
        transparent: true
    });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(1.2, 1.2, 1);
    sprite.position.copy(companion.sprite.position);
    scene.add(sprite);
    
    const speed = 0.35;
    const damage = CONFIG.projectileBaseDamage * (1 + gameState.player.level * 0.15) * 0.6;
    
    companion.projectiles.push({
        sprite,
        vx: dirX * speed,
        vz: dirZ * speed,
        damage,
        life: 120
    });
}

function updateCompanionHeal(companionIndex) {
    const companion = slimeCompanionState.companions[companionIndex];
    if (!companion) return;
    
    if (companion.upgrades.heal.level === 0) return;
    
    companion.healCooldown = Math.max(0, companion.healCooldown - 1);
    
    // Check if any companion has heal ready
    const anyHealReady = slimeCompanionState.companions.some(c => 
        c.upgrades.heal.level > 0 && c.healCooldown <= 0 && c.health > 0
    );
    
    const healIndicator = document.getElementById('healIndicator');
    if (anyHealReady) {
        healIndicator.classList.add('ready');
    } else {
        healIndicator.classList.remove('ready');
    }
    
    if (companion.healCooldown <= 0 && companion.health > 0) {
        // Heal player
        const healAmount = gameState.player.maxHealth * 0.15;
        gameState.player.health = Math.min(gameState.player.maxHealth, gameState.player.health + healAmount);
        updateUI();
        
        // Heal this companion
        companion.health = Math.min(companion.maxHealth, companion.health + companion.maxHealth * 0.2);
        
        // Cooldown based on heal level: 60s, 50s, 40s
        const healCooldowns = [60, 50, 40]; // seconds per level
        const cooldownSeconds = healCooldowns[Math.min(companion.upgrades.heal.level - 1, 2)];
        companion.healCooldown = cooldownSeconds * 60; // convert to frames
        
        showReward(`${companion.color.icon} HEAL! +${Math.floor(healAmount)} HP`);
    }
}

function damageCompanion(companionIndex, damage) {
    const companion = slimeCompanionState.companions[companionIndex];
    if (!companion || companion.health <= 0) return;
    
    companion.health -= damage;
    
    if (companion.health <= 0) {
        companion.health = 0;
        
        // Remove sprite
        if (companion.sprite) {
            scene.remove(companion.sprite);
        }
        
        // Remove swords
        companion.swords.forEach(s => scene.remove(s.sprite));
        companion.swords = [];
        
        // Remove projectiles
        companion.projectiles.forEach(p => scene.remove(p.sprite));
        companion.projectiles = [];
        
        showDialogue('💀 COMPANION LOST', `Your ${companion.color.name} slime has fallen in battle!`);
    }
    
    updateHealthBarsUI();
}

// ============================================
// INITIALIZATION
// ============================================

function initSlimeCompanion() {
    console.log('Initializing Multi-Companion Slime System...');
    createSlimeStoreUI();
}

function updateSlimeCompanion() {
    if (slimeCompanionState.monsterStore) {
        updateMonsterStore();
    }
    
    updateCompanionSlime();
}

function resetSlimeCompanion() {
    console.log('Resetting Slime Companion System...');
    
    const state = slimeCompanionState;
    
    cleanupMonsterStore();
    
    // Remove all companions
    state.companions.forEach(companion => {
        if (companion.sprite) {
            scene.remove(companion.sprite);
        }
        companion.swords.forEach(s => scene.remove(s.sprite));
        companion.projectiles.forEach(p => scene.remove(p.sprite));
    });
    
    state.companions = [];
    state.storeMenuOpen = false;
    state.investedGold = 0; // Reset investment
    state.storeVisitCount = 0; // Reset story progress
    
    document.getElementById('slimeHealthContainer').classList.remove('active');
    document.getElementById('slimeHealthContainer').innerHTML = '';
    document.getElementById('healIndicator').classList.remove('active');
    document.getElementById('healIndicator').classList.remove('ready');
    document.getElementById('slimeStoreMenu').style.display = 'none';
}

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSlimeCompanion);
} else {
    initSlimeCompanion();
}

console.log('Multi-Companion Slime System loaded!');
