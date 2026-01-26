// ============================================
// SLIME COMPANION SYSTEM
// ============================================
// A modular add-on for the Mystic Forest Walker game
// Adds: Monster Store event, Purchasable Slime Companion, Slime Upgrades
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
// SLIME COMPANION STATE
// ============================================
const slimeCompanionState = {
    // Companion slime
    slime: null,
    slimeOwned: false,
    slimeHealth: 0,
    slimeMaxHealth: 0,
    slimeHealthBar: null,
    slimeHealthBarBg: null,
    
    // Slime upgrades - reduced costs for attack/health, added swords
    upgrades: {
        attackSpeed: { level: 0, maxLevel: 10, baseCost: 20, costMult: 1.2 },  // Cheaper!
        health: { level: 0, maxLevel: 12, baseCost: 20, costMult: 1.15 },       // Cheaper!
        swords: { level: 0, maxLevel: 8, baseCost: 50, costMult: 1.8 },         // NEW - same as player
        heal: { level: 0, maxLevel: 1, baseCost: 100, costMult: 1 }             // Slightly cheaper
    },
    
    // Slime behavior
    slimeTarget: null,
    slimeWanderAngle: 0,
    slimeAttackCooldown: 0,
    slimeProjectiles: [],
    slimeSwords: [],  // NEW - orbital swords for slime
    healCooldown: 0,
    healMaxCooldown: 60 * 60, // 1 minute at 60fps
    
    // Monster Store
    monsterStore: null,
    storeSlimes: [],
    storeShopkeeper: null,
    storeMenuOpen: false,
    
    // Slime purchase cost
    slimeCost: 500
};

// ============================================
// HELPER FUNCTION - Check if monster store is active
// Call this from shouldSpawnEncounter() in main game
// ============================================
function isMonsterStoreActive() {
    return slimeCompanionState.monsterStore !== null;
}

// ============================================
// TEXTURE GENERATORS
// ============================================

// Companion Slime - Blue, 50% bigger than enemy slimes, with glow
function createCompanionSlimeTexture() {
    return createPixelTexture(48, 48, (ctx, w, h) => {
        // Outer glow
        ctx.fillStyle = 'rgba(52, 152, 219, 0.3)';
        ctx.beginPath();
        ctx.ellipse(24, 30, 22, 16, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Body - bright blue
        ctx.fillStyle = '#3498db';
        ctx.beginPath();
        ctx.ellipse(24, 30, 18, 13, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Highlight - lighter blue
        ctx.fillStyle = '#5dade2';
        ctx.beginPath();
        ctx.ellipse(24, 27, 14, 9, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Top highlight
        ctx.fillStyle = '#85c1e9';
        ctx.beginPath();
        ctx.ellipse(24, 24, 8, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Eyes - friendly look
        ctx.fillStyle = '#fff';
        ctx.fillRect(16, 24, 7, 7);
        ctx.fillRect(28, 24, 7, 7);
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(19, 27, 3, 3);
        ctx.fillRect(31, 27, 3, 3);
        
        // Happy blush marks
        ctx.fillStyle = 'rgba(231, 76, 60, 0.4)';
        ctx.fillRect(12, 30, 4, 3);
        ctx.fillRect(34, 30, 4, 3);
        
        // Shine
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.fillRect(14, 20, 4, 4);
    });
}

// Slime projectile - small blue orb
function createSlimeProjectileTexture() {
    return createPixelTexture(12, 12, (ctx, w, h) => {
        ctx.fillStyle = 'rgba(52, 152, 219, 0.5)';
        ctx.beginPath();
        ctx.arc(6, 6, 6, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#3498db';
        ctx.beginPath();
        ctx.arc(6, 6, 4, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#fff';
        ctx.fillRect(3, 3, 2, 2);
    });
}

// Slime sword - smaller blue-tinted sword
function createSlimeSwordTexture() {
    return createPixelTexture(12, 24, (ctx, w, h) => {
        // Blade - blue tinted steel
        ctx.fillStyle = '#a8d8ea';
        ctx.fillRect(4, 0, 4, 15);
        
        // Blade shine
        ctx.fillStyle = '#d4f1f9';
        ctx.fillRect(5, 0, 2, 14);
        
        // Guard - blue gem
        ctx.fillStyle = '#3498db';
        ctx.fillRect(1, 15, 10, 2);
        
        // Handle
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(4, 17, 4, 6);
        
        // Pommel - blue
        ctx.fillStyle = '#3498db';
        ctx.fillRect(3, 22, 6, 2);
    });
}

// Dead Tree for Monster Store
function createDeadTreeTexture() {
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

// Shopkeeper - purple slime with hat and monocle
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
// MONSTER STORE SYSTEM
// ============================================

function shouldSpawnMonsterStore() {
    if (slimeCompanionState.monsterStore) return false;
    if (encounterState.currentEncounter) return false;
    if (gameState.bosses.length > 0) return false;
    if (encounterState.inCloudArena) return false;
    if (encounterState.cloudPortal) return false;
    
    const level = gameState.player.level;
    if (level < 5) return false; // Monster store starts at level 5
    
    return true; // Probability handled by main spawn logic
}

function spawnMonsterStore() {
    console.log('Spawning Monster Store!');
    
    const angle = Math.random() * Math.PI * 2;
    const dist = CONFIG.enemySpawnRadius * 1.5;
    
    const x = gameState.player.position.x + Math.cos(angle) * dist;
    const z = gameState.player.position.z + Math.sin(angle) * dist;
    
    const treeTexture = createDeadTreeTexture();
    const treeMaterial = new THREE.SpriteMaterial({
        map: treeTexture,
        transparent: true
    });
    const treeSprite = new THREE.Sprite(treeMaterial);
    treeSprite.scale.set(12, 18, 1);
    treeSprite.position.set(x, 9, z);
    scene.add(treeSprite);
    
    const slimes = [];
    for (let i = 0; i < 30; i++) {
        const slimeAngle = (i / 30) * Math.PI * 2 + Math.random() * 0.3;
        const slimeDist = 8 + Math.random() * 8;
        const sx = x + Math.cos(slimeAngle) * slimeDist;
        const sz = z + Math.sin(slimeAngle) * slimeDist;
        
        const slimeTexture = createSlimeTexture();
        const slimeMaterial = new THREE.SpriteMaterial({
            map: slimeTexture,
            transparent: true
        });
        const slimeSprite = new THREE.Sprite(slimeMaterial);
        slimeSprite.scale.set(2.5, 2.5, 1);
        slimeSprite.position.set(sx, 1.25, sz);
        scene.add(slimeSprite);
        
        const baseHealth = CONFIG.enemyBaseHealth * 0.5 * (1 + gameState.player.level * 0.2);
        const slime = {
            sprite: slimeSprite,
            health: baseHealth,
            maxHealth: baseHealth,
            damage: CONFIG.enemyBaseDamage * 0.5 * (1 + gameState.player.level * 0.15),
            speed: 0.025 + Math.random() * 0.01,
            attackCooldown: 0,
            hitFlash: 0,
            isStoreSlime: true
        };
        slimes.push(slime);
    }
    
    slimeCompanionState.storeSlimes = slimes;
    slimeCompanionState.monsterStore = {
        tree: treeSprite,
        position: new THREE.Vector3(x, 0, z),
        complete: false,
        shopkeeperSpawned: false,
        rewardGiven: false
    };
    
    gameState.targetCameraZoom = 2.0;
}

function updateMonsterStore() {
    if (!slimeCompanionState.monsterStore) return;
    
    const store = slimeCompanionState.monsterStore;
    
    if (gameState.dialogueTimer <= 0) {
        for (let i = slimeCompanionState.storeSlimes.length - 1; i >= 0; i--) {
            const slime = slimeCompanionState.storeSlimes[i];
            
            let targetPos = gameState.player.position;
            
            const dx = targetPos.x - slime.sprite.position.x;
            const dz = targetPos.z - slime.sprite.position.z;
            const dist = Math.sqrt(dx * dx + dz * dz);
            
            if (dist > 1.5) {
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
    
    if (slimeCompanionState.storeSlimes.length === 0 && !store.complete) {
        store.complete = true;
        onMonsterStoreComplete();
    }
    
    if (store.shopkeeperSpawned && slimeCompanionState.storeShopkeeper && !store.rewardGiven) {
        updateShopkeeper();
    }
    
    // Timer-based cleanup after store is closed
    if (store.rewardGiven && store.cleanupTimer !== undefined) {
        store.cleanupTimer--;
        if (store.cleanupTimer <= 0) {
            cleanupMonsterStore();
            return;
        }
    }
    
    const dx = gameState.player.position.x - store.position.x;
    const dz = gameState.player.position.z - store.position.z;
    const dist = Math.sqrt(dx * dx + dz * dz);
    
    // Distance-based cleanup (only after reward given)
    if (dist > CONFIG.renderDistance * 2 && store.rewardGiven) {
        cleanupMonsterStore();
    }
}

function onMonsterStoreComplete() {
    console.log('Monster Store slimes defeated!');
    
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
    
    showDialogue('🎩 MERCHANT', '"Well well! A customer! Come closer, brave adventurer... I have something SPECIAL for you!"');
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
    
    // Hide store menu if somehow still open
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

let slimeSwordTexture = null;

function createSlimeStoreUI() {
    slimeSwordTexture = createSlimeSwordTexture();
    
    const storeMenu = document.createElement('div');
    storeMenu.id = 'slimeStoreMenu';
    storeMenu.innerHTML = `
        <div id="slimeStoreContent">
            <h2>🏪 MONSTER STORE</h2>
            <div id="storeGoldDisplay">💰 <span id="storeGoldAmount">0</span></div>
            <div id="slimeStoreItems">
                <div class="store-item" id="store-slime">
                    <div class="store-icon">🔵</div>
                    <div class="store-info">
                        <div class="store-name">Slime Companion</div>
                        <div class="store-desc">A friendly slime that fights by your side!</div>
                        <div class="store-status" id="slime-status">Not Owned</div>
                    </div>
                    <button class="store-btn" id="buySlimeBtn" data-action="buySlime">
                        <span class="cost">💰 500</span>
                    </button>
                </div>
                
                <div class="store-item upgrade-item-store" id="store-attackSpeed">
                    <div class="store-icon">⚡</div>
                    <div class="store-info">
                        <div class="store-name">Attack Speed</div>
                        <div class="store-desc">Faster slime attacks</div>
                        <div class="store-level">Level: <span class="lvl">0</span>/10</div>
                    </div>
                    <button class="store-btn" data-action="upgradeAttackSpeed">
                        <span class="cost">💰 20</span>
                    </button>
                </div>
                
                <div class="store-item upgrade-item-store" id="store-health">
                    <div class="store-icon">❤️</div>
                    <div class="store-info">
                        <div class="store-name">Slime Health</div>
                        <div class="store-desc">+5% max health per level</div>
                        <div class="store-level">Level: <span class="lvl">0</span>/12</div>
                    </div>
                    <button class="store-btn" data-action="upgradeHealth">
                        <span class="cost">💰 20</span>
                    </button>
                </div>
                
                <div class="store-item upgrade-item-store" id="store-swords">
                    <div class="store-icon">⚔️</div>
                    <div class="store-info">
                        <div class="store-name">Slime Swords</div>
                        <div class="store-desc">Orbiting blades around your slime</div>
                        <div class="store-level">Level: <span class="lvl">0</span>/8</div>
                    </div>
                    <button class="store-btn" data-action="upgradeSwords">
                        <span class="cost">💰 50</span>
                    </button>
                </div>
                
                <div class="store-item upgrade-item-store" id="store-heal">
                    <div class="store-icon">💚</div>
                    <div class="store-info">
                        <div class="store-name">Heal Ability</div>
                        <div class="store-desc">Auto-heal you & slime every minute</div>
                        <div class="store-level">Level: <span class="lvl">0</span>/1</div>
                    </div>
                    <button class="store-btn" data-action="upgradeHeal">
                        <span class="cost">💰 100</span>
                    </button>
                </div>
            </div>
            <button id="closeSlimeStore">CLOSE STORE</button>
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
            background: rgba(0,0,0,0.9);
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 600;
            pointer-events: auto;
        }
        
        #slimeStoreContent {
            background: linear-gradient(180deg, #1a472a, #0d2818);
            border: 4px solid #27ae60;
            border-radius: 16px;
            padding: 20px;
            max-width: 360px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 0 30px rgba(39,174,96,0.5);
        }
        
        #slimeStoreContent h2 {
            color: #2ecc71;
            text-align: center;
            margin-bottom: 10px;
            font-size: 16px;
            text-shadow: 0 0 10px #27ae60;
            font-family: 'Press Start 2P', cursive;
        }
        
        #storeGoldDisplay {
            text-align: center;
            color: #f1c40f;
            font-size: 14px;
            font-family: 'Press Start 2P', cursive;
            margin-bottom: 15px;
            text-shadow: 0 0 10px rgba(241, 196, 15, 0.5);
        }
        
        .store-item {
            display: flex;
            align-items: center;
            background: rgba(0,0,0,0.4);
            border: 2px solid #1e8449;
            border-radius: 8px;
            padding: 10px;
            margin-bottom: 12px;
            gap: 10px;
        }
        
        .store-item.owned { border-color: #3498db; background: rgba(52, 152, 219, 0.2); }
        .store-item.maxed { border-color: #f39c12; opacity: 0.7; }
        .store-item.locked { opacity: 0.5; }
        
        .store-icon { font-size: 28px; width: 40px; text-align: center; }
        .store-info { flex: 1; }
        .store-name { color: #fff; font-size: 10px; margin-bottom: 2px; font-family: 'Press Start 2P', cursive; }
        .store-desc { color: #7f8c8d; font-size: 7px; margin-bottom: 4px; font-family: 'Press Start 2P', cursive; }
        .store-status, .store-level { color: #3498db; font-size: 8px; font-family: 'Press Start 2P', cursive; }
        
        .store-btn {
            background: linear-gradient(180deg, #27ae60, #1e8449);
            border: 2px solid #2ecc71;
            border-radius: 6px;
            padding: 8px 12px;
            color: #fff;
            font-family: 'Press Start 2P', cursive;
            font-size: 8px;
            cursor: pointer;
            pointer-events: auto;
            min-width: 70px;
        }
        
        .store-btn:disabled { background: #555; border-color: #666; color: #888; cursor: not-allowed; }
        .store-btn:not(:disabled):active { transform: scale(0.95); }
        
        #closeSlimeStore {
            width: 100%;
            margin-top: 15px;
            padding: 12px;
            background: linear-gradient(180deg, #8e44ad, #6c3483);
            border: 2px solid #9b59b6;
            border-radius: 8px;
            color: #fff;
            font-family: 'Press Start 2P', cursive;
            font-size: 12px;
            cursor: pointer;
            pointer-events: auto;
        }
        
        #closeSlimeStore:active { transform: scale(0.98); }
        
        #slimeHealthContainer {
            position: fixed;
            pointer-events: none;
            z-index: 50;
            display: none;
        }
        
        #slimeHealthContainer.active { display: block; }
        
        .slime-health-bar {
            width: 60px;
            height: 8px;
            background: #333;
            border: 2px solid #222;
            border-radius: 4px;
            overflow: hidden;
        }
        
        .slime-health-fill {
            height: 100%;
            background: linear-gradient(180deg, #3498db, #2980b9);
            transition: width 0.2s;
        }
        
        #healIndicator {
            position: absolute;
            bottom: 200px;
            right: 30px;
            width: 40px;
            height: 40px;
            background: radial-gradient(circle at 30% 30%, #2ecc71, #1e8449);
            border: 2px solid #27ae60;
            border-radius: 50%;
            display: none;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            color: #fff;
            pointer-events: none;
            opacity: 0.5;
        }
        
        #healIndicator.ready {
            opacity: 1;
            box-shadow: 0 0 10px rgba(46,204,113,0.7);
            animation: healPulse 1.5s ease-in-out infinite;
        }
        
        #healIndicator.active { display: flex; }
        
        @keyframes healPulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
        }
    `;
    
    document.head.appendChild(styles);
    document.getElementById('ui').appendChild(storeMenu);
    
    const healthContainer = document.createElement('div');
    healthContainer.id = 'slimeHealthContainer';
    healthContainer.innerHTML = `
        <div class="slime-health-bar">
            <div class="slime-health-fill" id="slimeHealthFill"></div>
        </div>
    `;
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
    
    document.querySelectorAll('.store-btn').forEach(btn => {
        const action = btn.dataset.action;
        btn.addEventListener('click', () => handleStoreAction(action));
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            handleStoreAction(action);
        });
    });
}

function handleStoreAction(action) {
    switch(action) {
        case 'buySlime': purchaseSlime(); break;
        case 'upgradeAttackSpeed': purchaseSlimeUpgrade('attackSpeed'); break;
        case 'upgradeHealth': purchaseSlimeUpgrade('health'); break;
        case 'upgradeSwords': purchaseSlimeUpgrade('swords'); break;
        case 'upgradeHeal': purchaseSlimeUpgrade('heal'); break;
    }
}

function openSlimeStore() {
    slimeCompanionState.storeMenuOpen = true;
    gameState.menuOpen = true;
    document.getElementById('slimeStoreMenu').style.display = 'flex';
    updateSlimeStoreUI();
}

function closeSlimeStore() {
    slimeCompanionState.storeMenuOpen = false;
    gameState.menuOpen = false;
    document.getElementById('slimeStoreMenu').style.display = 'none';
    
    // Start cleanup timer (30 seconds at 60fps)
    if (slimeCompanionState.monsterStore) {
        slimeCompanionState.monsterStore.cleanupTimer = 30 * 60;
    }
    
    showDialogue('🎩 MERCHANT', '"Come back anytime! ...If you can find me again, that is! Hehehehe!"');
}

function updateSlimeStoreUI() {
    const state = slimeCompanionState;
    
    // Update gold display
    const goldDisplay = document.getElementById('storeGoldAmount');
    if (goldDisplay) {
        goldDisplay.textContent = gameState.player.gold;
    }
    
    const slimeItem = document.getElementById('store-slime');
    const slimeBtn = document.getElementById('buySlimeBtn');
    const slimeStatus = document.getElementById('slime-status');
    
    if (state.slimeOwned) {
        slimeItem.classList.add('owned');
        slimeStatus.textContent = 'Owned ✓';
        slimeBtn.disabled = true;
        slimeBtn.querySelector('.cost').textContent = 'OWNED';
    } else {
        slimeItem.classList.remove('owned');
        slimeStatus.textContent = 'Not Owned';
        slimeBtn.disabled = gameState.player.gold < state.slimeCost;
        slimeBtn.querySelector('.cost').textContent = '💰 ' + state.slimeCost;
    }
    
    updateStoreUpgradeItem('attackSpeed', 'store-attackSpeed');
    updateStoreUpgradeItem('health', 'store-health');
    updateStoreUpgradeItem('swords', 'store-swords');
    updateStoreUpgradeItem('heal', 'store-heal');
}

function updateStoreUpgradeItem(upgradeKey, elementId) {
    const state = slimeCompanionState;
    const upgrade = state.upgrades[upgradeKey];
    const item = document.getElementById(elementId);
    const btn = item.querySelector('.store-btn');
    const lvlSpan = item.querySelector('.lvl');
    const costSpan = btn.querySelector('.cost');
    
    lvlSpan.textContent = upgrade.level;
    
    if (!state.slimeOwned) {
        item.classList.add('locked');
        item.classList.remove('maxed');
        btn.disabled = true;
        costSpan.textContent = 'NEED SLIME';
        return;
    }
    
    item.classList.remove('locked');
    
    if (upgrade.level >= upgrade.maxLevel) {
        item.classList.add('maxed');
        btn.disabled = true;
        costSpan.textContent = 'MAX';
    } else {
        item.classList.remove('maxed');
        const cost = getSlimeUpgradeCost(upgradeKey);
        costSpan.textContent = '💰 ' + cost;
        btn.disabled = gameState.player.gold < cost;
    }
}

function getSlimeUpgradeCost(upgradeKey) {
    const upgrade = slimeCompanionState.upgrades[upgradeKey];
    return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMult, upgrade.level));
}

function purchaseSlime() {
    const state = slimeCompanionState;
    
    if (state.slimeOwned || gameState.player.gold < state.slimeCost) return;
    
    gameState.player.gold -= state.slimeCost;
    state.slimeOwned = true;
    
    spawnCompanionSlime();
    
    updateUI();
    updateSlimeStoreUI();
    showReward('🔵 SLIME COMPANION ACQUIRED!');
}

function purchaseSlimeUpgrade(upgradeKey) {
    const state = slimeCompanionState;
    const upgrade = state.upgrades[upgradeKey];
    
    if (!state.slimeOwned) return;
    if (upgrade.level >= upgrade.maxLevel) return;
    
    const cost = getSlimeUpgradeCost(upgradeKey);
    if (gameState.player.gold < cost) return;
    
    gameState.player.gold -= cost;
    upgrade.level++;
    
    if (upgradeKey === 'health' && state.slime) {
        updateSlimeMaxHealth();
    }
    
    if (upgradeKey === 'swords') {
        updateSlimeSwordCount();
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
        heal: '💚 HEAL ABILITY'
    };
    showReward(upgradeNames[upgradeKey] + ' UPGRADED!');
}

// ============================================
// COMPANION SLIME SYSTEM
// ============================================

function spawnCompanionSlime() {
    const state = slimeCompanionState;
    
    const texture = createCompanionSlimeTexture();
    const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true
    });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(3.75, 3.75, 1);
    
    const angle = Math.random() * Math.PI * 2;
    const dist = 3;
    sprite.position.set(
        gameState.player.position.x + Math.cos(angle) * dist,
        1.875,
        gameState.player.position.z + Math.sin(angle) * dist
    );
    
    scene.add(sprite);
    
    state.slime = sprite;
    state.slimeWanderAngle = Math.random() * Math.PI * 2;
    
    updateSlimeMaxHealth();
    state.slimeHealth = state.slimeMaxHealth;
    
    document.getElementById('slimeHealthContainer').classList.add('active');
    
    if (state.upgrades.heal.level > 0) {
        document.getElementById('healIndicator').classList.add('active');
    }
    
    updateSlimeSwordCount();
}

function updateSlimeMaxHealth() {
    const state = slimeCompanionState;
    const healthPercent = 0.5 + (state.upgrades.health.level * 0.05);
    state.slimeMaxHealth = gameState.player.maxHealth * healthPercent;
    
    if (state.slimeHealth > state.slimeMaxHealth) {
        state.slimeHealth = state.slimeMaxHealth;
    }
}

// ============================================
// SLIME SWORDS SYSTEM
// ============================================

function updateSlimeSwordCount() {
    const state = slimeCompanionState;
    const targetCount = state.upgrades.swords.level;
    
    while (state.slimeSwords.length > targetCount) {
        const sword = state.slimeSwords.pop();
        scene.remove(sword.sprite);
    }
    
    while (state.slimeSwords.length < targetCount) {
        const material = new THREE.SpriteMaterial({ 
            map: slimeSwordTexture, 
            transparent: true 
        });
        const sprite = new THREE.Sprite(material);
        sprite.scale.set(0.9, 1.8, 1);
        
        const sword = {
            sprite,
            angle: (state.slimeSwords.length / targetCount) * Math.PI * 2,
            hitCooldowns: new Map()
        };
        
        scene.add(sprite);
        state.slimeSwords.push(sword);
    }
    
    state.slimeSwords.forEach((sword, i) => {
        sword.angle = (i / state.slimeSwords.length) * Math.PI * 2;
    });
}

function updateSlimeSwords() {
    const state = slimeCompanionState;
    
    if (state.slimeSwords.length === 0 || !state.slime || state.slimeHealth <= 0) return;
    
    const orbitRadius = 2;
    const orbitSpeed = 0.04;
    const swordDamage = CONFIG.projectileBaseDamage * (1 + gameState.player.level * 0.25) * 1.0;
    
    state.slimeSwords.forEach((sword, i) => {
        sword.angle += orbitSpeed;
        
        const x = state.slime.position.x + Math.cos(sword.angle) * orbitRadius;
        const z = state.slime.position.z + Math.sin(sword.angle) * orbitRadius;
        
        sword.sprite.position.set(x, 1.2, z);
        sword.sprite.material.rotation = -sword.angle + Math.PI / 2;
        
        // Check enemies
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
                    
                    if (enemy.health <= 0) {
                        spawnXPOrb(enemy.sprite.position.clone(), enemy.type.xp);
                        if (Math.random() < enemy.type.goldChance && enemy.type.gold > 0) {
                            spawnGoldOrb(enemy.sprite.position.clone(), enemy.type.gold);
                        }
                        scene.remove(enemy.sprite);
                        const idx = gameState.enemies.indexOf(enemy);
                        if (idx > -1) gameState.enemies.splice(idx, 1);
                        gameState.kills++;
                        document.getElementById('kills').textContent = gameState.kills;
                    }
                }
            }
        }
        
        // Check store slimes
        for (const storeSlime of state.storeSlimes) {
            const dx = sword.sprite.position.x - storeSlime.sprite.position.x;
            const dz = sword.sprite.position.z - storeSlime.sprite.position.z;
            const dist = Math.sqrt(dx * dx + dz * dz);
            
            if (dist < 1.2) {
                const lastHit = sword.hitCooldowns.get(storeSlime) || 0;
                const now = Date.now();
                
                if (now - lastHit > 500) {
                    damageStoreSlime(storeSlime, swordDamage);
                    sword.hitCooldowns.set(storeSlime, now);
                }
            }
        }
        
        // Check encounter guards
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
                    
                    if (guard.health <= 0) {
                        scene.remove(guard.sprite);
                        spawnXPOrb(guard.sprite.position.clone(), 30);
                        if (Math.random() < 0.5) {
                            spawnGoldOrb(guard.sprite.position.clone(), 15);
                        }
                        const idx = encounterState.encounterGuards.indexOf(guard);
                        if (idx > -1) encounterState.encounterGuards.splice(idx, 1);
                        gameState.kills++;
                        document.getElementById('kills').textContent = gameState.kills;
                    }
                }
            }
        }
        
        // Check forest cloud sprites
        if (encounterState.forestCloudSprites) {
            for (const cloudSprite of encounterState.forestCloudSprites) {
                const dx = sword.sprite.position.x - cloudSprite.sprite.position.x;
                const dz = sword.sprite.position.z - cloudSprite.sprite.position.z;
                const dist = Math.sqrt(dx * dx + dz * dz);
                
                if (dist < 1.5) {
                    const lastHit = sword.hitCooldowns.get(cloudSprite) || 0;
                    const now = Date.now();
                    
                    if (now - lastHit > 500) {
                        cloudSprite.health -= swordDamage;
                        cloudSprite.hitFlash = 10;
                        sword.hitCooldowns.set(cloudSprite, now);
                    }
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
        
        // Cleanup
        for (const [target, time] of sword.hitCooldowns) {
            if (!gameState.enemies.includes(target) && 
                !gameState.bosses.includes(target) && 
                !encounterState.encounterGuards.includes(target) &&
                !state.storeSlimes.includes(target) &&
                !(encounterState.forestCloudSprites && encounterState.forestCloudSprites.includes(target))) {
                sword.hitCooldowns.delete(target);
            }
        }
    });
}

function updateCompanionSlime() {
    const state = slimeCompanionState;
    
    if (!state.slimeOwned || !state.slime) return;
    if (state.slimeHealth <= 0) return;
    if (gameState.dialogueTimer > 0) return;
    
    const slime = state.slime;
    const playerPos = gameState.player.position;
    
    const dx = playerPos.x - slime.position.x;
    const dz = playerPos.z - slime.position.z;
    const distToPlayer = Math.sqrt(dx * dx + dz * dz);
    
    const maxDist = 7.5;
    const moveSpeed = CONFIG.playerSpeed * 0.9;
    
    let nearestEnemy = null;
    let nearestDist = Infinity;
    const attackRange = 8 * 0.6;
    
    for (const enemy of gameState.enemies) {
        const edx = enemy.sprite.position.x - slime.position.x;
        const edz = enemy.sprite.position.z - slime.position.z;
        const eDist = Math.sqrt(edx * edx + edz * edz);
        if (eDist < nearestDist) {
            nearestDist = eDist;
            nearestEnemy = enemy;
        }
    }
    
    for (const storeSlime of state.storeSlimes) {
        const edx = storeSlime.sprite.position.x - slime.position.x;
        const edz = storeSlime.sprite.position.z - slime.position.z;
        const eDist = Math.sqrt(edx * edx + edz * edz);
        if (eDist < nearestDist) {
            nearestDist = eDist;
            nearestEnemy = storeSlime;
        }
    }
    
    for (const guard of encounterState.encounterGuards) {
        const edx = guard.sprite.position.x - slime.position.x;
        const edz = guard.sprite.position.z - slime.position.z;
        const eDist = Math.sqrt(edx * edx + edz * edz);
        if (eDist < nearestDist) {
            nearestDist = eDist;
            nearestEnemy = guard;
        }
    }
    
    // Target forest cloud sprites
    if (encounterState.forestCloudSprites) {
        for (const cloudSprite of encounterState.forestCloudSprites) {
            const edx = cloudSprite.sprite.position.x - slime.position.x;
            const edz = cloudSprite.sprite.position.z - slime.position.z;
            const eDist = Math.sqrt(edx * edx + edz * edz);
            if (eDist < nearestDist) {
                nearestDist = eDist;
                nearestEnemy = cloudSprite;
            }
        }
    }
    
    if (distToPlayer > maxDist) {
        slime.position.x += (dx / distToPlayer) * moveSpeed;
        slime.position.z += (dz / distToPlayer) * moveSpeed;
    } else if (nearestEnemy && nearestDist < attackRange * 1.5) {
        const edx = nearestEnemy.sprite.position.x - slime.position.x;
        const edz = nearestEnemy.sprite.position.z - slime.position.z;
        const eDist = Math.sqrt(edx * edx + edz * edz);
        
        const newX = slime.position.x + (edx / eDist) * moveSpeed * 0.5;
        const newZ = slime.position.z + (edz / eDist) * moveSpeed * 0.5;
        const newDistToPlayer = Math.sqrt(
            Math.pow(playerPos.x - newX, 2) + 
            Math.pow(playerPos.z - newZ, 2)
        );
        
        if (newDistToPlayer <= maxDist) {
            slime.position.x = newX;
            slime.position.z = newZ;
        }
    } else {
        state.slimeWanderAngle += (Math.random() - 0.5) * 0.2;
        
        const wanderX = slime.position.x + Math.cos(state.slimeWanderAngle) * moveSpeed * 0.3;
        const wanderZ = slime.position.z + Math.sin(state.slimeWanderAngle) * moveSpeed * 0.3;
        
        const wanderDistToPlayer = Math.sqrt(
            Math.pow(playerPos.x - wanderX, 2) + 
            Math.pow(playerPos.z - wanderZ, 2)
        );
        
        if (wanderDistToPlayer <= maxDist) {
            slime.position.x = wanderX;
            slime.position.z = wanderZ;
        } else {
            state.slimeWanderAngle = Math.atan2(dz, dx) + (Math.random() - 0.5) * 1;
        }
    }
    
    state.slimeAttackCooldown = Math.max(0, state.slimeAttackCooldown - 1);
    
    if (nearestEnemy && nearestDist <= attackRange && state.slimeAttackCooldown <= 0) {
        fireSlimeProjectile(nearestEnemy);
        
        const baseCooldown = 90;
        const speedReduction = 1 - (state.upgrades.attackSpeed.level * 0.07);
        state.slimeAttackCooldown = Math.floor(baseCooldown * speedReduction);
    }
    
    updateSlimeProjectiles();
    updateSlimeSwords();
    
    if (state.upgrades.heal.level > 0) {
        state.healCooldown = Math.max(0, state.healCooldown - 1);
        
        const indicator = document.getElementById('healIndicator');
        if (state.healCooldown <= 0) {
            indicator.classList.add('ready');
            performHeal();
            state.healCooldown = state.healMaxCooldown;
            indicator.classList.remove('ready');
        }
    }
    
    updateSlimeHealthBar();
}

function fireSlimeProjectile(target) {
    const state = slimeCompanionState;
    const slime = state.slime;
    
    const texture = createSlimeProjectileTexture();
    const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true
    });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(1.5, 1.5, 1);
    sprite.position.copy(slime.position);
    sprite.position.y = 1.5;
    
    const dx = target.sprite.position.x - slime.position.x;
    const dz = target.sprite.position.z - slime.position.z;
    const dist = Math.sqrt(dx * dx + dz * dz);
    
    const projectile = {
        sprite,
        velocity: new THREE.Vector3(
            (dx / dist) * 0.35,
            0,
            (dz / dist) * 0.35
        ),
        life: 120,
        damage: CONFIG.projectileBaseDamage * 0.75 * (1 + gameState.player.level * 0.25)
    };
    
    scene.add(sprite);
    state.slimeProjectiles.push(projectile);
}

function updateSlimeProjectiles() {
    const state = slimeCompanionState;
    
    for (let i = state.slimeProjectiles.length - 1; i >= 0; i--) {
        const proj = state.slimeProjectiles[i];
        
        proj.sprite.position.add(proj.velocity);
        proj.life--;
        
        let hit = false;
        
        for (let j = gameState.enemies.length - 1; j >= 0; j--) {
            const enemy = gameState.enemies[j];
            const dx = enemy.sprite.position.x - proj.sprite.position.x;
            const dz = enemy.sprite.position.z - proj.sprite.position.z;
            const dist = Math.sqrt(dx * dx + dz * dz);
            
            if (dist < 1.5) {
                enemy.health -= proj.damage;
                enemy.hitFlash = 10;
                
                if (enemy.health <= 0) {
                    scene.remove(enemy.sprite);
                    spawnXPOrb(enemy.sprite.position.clone(), enemy.type.xp);
                    if (Math.random() < enemy.type.goldChance) {
                        spawnGoldOrb(enemy.sprite.position.clone(), enemy.type.gold);
                    }
                    gameState.enemies.splice(j, 1);
                    gameState.kills++;
                    document.getElementById('kills').textContent = gameState.kills;
                }
                
                hit = true;
                break;
            }
        }
        
        if (!hit) {
            for (const storeSlime of state.storeSlimes) {
                const dx = storeSlime.sprite.position.x - proj.sprite.position.x;
                const dz = storeSlime.sprite.position.z - proj.sprite.position.z;
                const dist = Math.sqrt(dx * dx + dz * dz);
                
                if (dist < 1.5) {
                    damageStoreSlime(storeSlime, proj.damage);
                    hit = true;
                    break;
                }
            }
        }
        
        if (!hit) {
            for (const guard of encounterState.encounterGuards) {
                const dx = guard.sprite.position.x - proj.sprite.position.x;
                const dz = guard.sprite.position.z - proj.sprite.position.z;
                const dist = Math.sqrt(dx * dx + dz * dz);
                
                if (dist < 1.5) {
                    guard.health -= proj.damage;
                    guard.hitFlash = 10;
                    
                    if (guard.health <= 0) {
                        scene.remove(guard.sprite);
                        spawnXPOrb(guard.sprite.position.clone(), 30);
                        if (Math.random() < 0.5) {
                            spawnGoldOrb(guard.sprite.position.clone(), 15);
                        }
                        const idx = encounterState.encounterGuards.indexOf(guard);
                        if (idx > -1) encounterState.encounterGuards.splice(idx, 1);
                        gameState.kills++;
                        document.getElementById('kills').textContent = gameState.kills;
                    }
                    
                    hit = true;
                    break;
                }
            }
        }
        
        // Check forest cloud sprites
        if (!hit && encounterState.forestCloudSprites) {
            for (const cloudSprite of encounterState.forestCloudSprites) {
                const dx = cloudSprite.sprite.position.x - proj.sprite.position.x;
                const dz = cloudSprite.sprite.position.z - proj.sprite.position.z;
                const dist = Math.sqrt(dx * dx + dz * dz);
                
                if (dist < 1.5) {
                    cloudSprite.health -= proj.damage;
                    cloudSprite.hitFlash = 10;
                    hit = true;
                    break;
                }
            }
        }
        
        if (hit || proj.life <= 0) {
            scene.remove(proj.sprite);
            state.slimeProjectiles.splice(i, 1);
        }
    }
}

function performHeal() {
    const state = slimeCompanionState;
    
    const playerHealAmount = gameState.player.maxHealth * 0.15;
    gameState.player.health = Math.min(
        gameState.player.maxHealth,
        gameState.player.health + playerHealAmount
    );
    
    if (state.slime && state.slimeHealth > 0) {
        const slimeHealAmount = state.slimeMaxHealth * 0.40;
        state.slimeHealth = Math.min(
            state.slimeMaxHealth,
            state.slimeHealth + slimeHealAmount
        );
    }
    
    updateUI();
    showReward('💚 HEALED!');
}

function updateSlimeHealthBar() {
    const state = slimeCompanionState;
    const container = document.getElementById('slimeHealthContainer');
    
    if (!state.slimeOwned || !state.slime || state.slimeHealth <= 0) {
        container.classList.remove('active');
        return;
    }
    
    const slimePos = state.slime.position.clone();
    slimePos.y += 2.5;
    
    const screenPos = slimePos.project(camera);
    
    const x = (screenPos.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-screenPos.y * 0.5 + 0.5) * window.innerHeight;
    
    if (screenPos.z > 1 || x < 0 || x > window.innerWidth || y < 0 || y > window.innerHeight) {
        container.classList.remove('active');
        return;
    }
    
    // Clear any inline display style and use class
    container.style.display = '';
    container.classList.add('active');
    container.style.left = (x - 30) + 'px';
    container.style.top = y + 'px';
    
    const healthPercent = (state.slimeHealth / state.slimeMaxHealth) * 100;
    document.getElementById('slimeHealthFill').style.width = healthPercent + '%';
}

function damageCompanionSlime(damage) {
    const state = slimeCompanionState;
    
    if (!state.slimeOwned || !state.slime || state.slimeHealth <= 0) return;
    
    state.slimeHealth -= damage;
    
    state.slime.material.color.setHex(0xff0000);
    setTimeout(() => {
        if (state.slime) {
            state.slime.material.color.setHex(0xffffff);
        }
    }, 100);
    
    if (state.slimeHealth <= 0) {
        slimeDeath();
    }
}

function slimeDeath() {
    const state = slimeCompanionState;
    
    console.log('Companion slime has died!');
    
    // Remove slime sprite
    if (state.slime) {
        scene.remove(state.slime);
        state.slime = null;
    }
    
    // Clean up slime projectiles
    state.slimeProjectiles.forEach(p => scene.remove(p.sprite));
    state.slimeProjectiles = [];
    
    // Clean up slime swords
    state.slimeSwords.forEach(s => scene.remove(s.sprite));
    state.slimeSwords = [];
    
    // Reset ownership and health
    state.slimeOwned = false;
    state.slimeHealth = 0;
    state.slimeMaxHealth = 0;
    
    // Reset all upgrades
    state.upgrades = {
        attackSpeed: { level: 0, maxLevel: 10, baseCost: 20, costMult: 1.2 },
        health: { level: 0, maxLevel: 12, baseCost: 20, costMult: 1.15 },
        swords: { level: 0, maxLevel: 8, baseCost: 50, costMult: 1.8 },
        heal: { level: 0, maxLevel: 1, baseCost: 100, costMult: 1 }
    };
    
    // Hide UI elements using class
    const healthContainer = document.getElementById('slimeHealthContainer');
    if (healthContainer) {
        healthContainer.classList.remove('active');
    }
    
    const healIndicator = document.getElementById('healIndicator');
    if (healIndicator) {
        healIndicator.classList.remove('active');
        healIndicator.classList.remove('ready');
    }
    
    showDialogue('💔 SLIME', 'Your slime companion has fallen in battle... Visit the Monster Store to get a new one.');
}

// ============================================
// AGGRO SYSTEM
// ============================================

function getSlimeAggroTarget(enemyPosition, isBoss) {
    const state = slimeCompanionState;
    
    if (!state.slimeOwned || !state.slime || state.slimeHealth <= 0) {
        return gameState.player.position;
    }
    
    if (isBoss) {
        return gameState.player.position;
    }
    
    const playerDx = gameState.player.position.x - enemyPosition.x;
    const playerDz = gameState.player.position.z - enemyPosition.z;
    const playerDist = Math.sqrt(playerDx * playerDx + playerDz * playerDz);
    
    const slimeDx = state.slime.position.x - enemyPosition.x;
    const slimeDz = state.slime.position.z - enemyPosition.z;
    const slimeDist = Math.sqrt(slimeDx * slimeDx + slimeDz * slimeDz);
    
    if (slimeDist < playerDist && Math.random() < 0.5) {
        return state.slime.position;
    }
    
    return gameState.player.position;
}

function checkSlimeCollision(attackerPosition, attackRange) {
    const state = slimeCompanionState;
    
    if (!state.slimeOwned || !state.slime || state.slimeHealth <= 0) {
        return false;
    }
    
    attackRange = attackRange || 1.5;
    
    const dx = state.slime.position.x - attackerPosition.x;
    const dz = state.slime.position.z - attackerPosition.z;
    const dist = Math.sqrt(dx * dx + dz * dz);
    
    return dist < attackRange;
}

// ============================================
// INTEGRATION FUNCTIONS
// ============================================

function initSlimeCompanion() {
    console.log('Initializing Slime Companion System...');
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
    
    if (state.slime) {
        scene.remove(state.slime);
        state.slime = null;
    }
    
    state.slimeProjectiles.forEach(p => scene.remove(p.sprite));
    state.slimeProjectiles = [];
    
    state.slimeSwords.forEach(s => scene.remove(s.sprite));
    state.slimeSwords = [];
    
    state.slimeOwned = false;
    state.slimeHealth = 0;
    state.slimeMaxHealth = 0;
    state.slimeTarget = null;
    state.slimeWanderAngle = 0;
    state.slimeAttackCooldown = 0;
    state.healCooldown = 0;
    state.storeMenuOpen = false;
    
    state.upgrades = {
        attackSpeed: { level: 0, maxLevel: 10, baseCost: 20, costMult: 1.2 },
        health: { level: 0, maxLevel: 12, baseCost: 20, costMult: 1.15 },
        swords: { level: 0, maxLevel: 8, baseCost: 50, costMult: 1.8 },
        heal: { level: 0, maxLevel: 1, baseCost: 100, costMult: 1 }
    };
    
    document.getElementById('slimeHealthContainer').classList.remove('active');
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

console.log('Slime Companion System loaded!');
