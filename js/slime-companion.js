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
    
    // Base slime cost (increases with each purchase)
    baseSlimeCost: 500,
    
    // Cached textures
    slimeSwordTexture: null
};

// ============================================
// HELPER FUNCTIONS
// ============================================
function isMonsterStoreActive() {
    return slimeCompanionState.monsterStore !== null;
}

function getNextCompanionCost() {
    const numOwned = slimeCompanionState.companions.length;
    return Math.floor(slimeCompanionState.baseSlimeCost * Math.pow(1.5, numOwned));
}

function getNextCompanionColor() {
    const numOwned = slimeCompanionState.companions.length;
    return COMPANION_COLORS[numOwned % COMPANION_COLORS.length];
}

function createDefaultUpgrades() {
    return {
        attackSpeed: { level: 0, maxLevel: 10, baseCost: 20, costMult: 1.2 },
        health: { level: 0, maxLevel: 12, baseCost: 20, costMult: 1.15 },
        swords: { level: 0, maxLevel: 8, baseCost: 50, costMult: 1.8 },
        heal: { level: 0, maxLevel: 1, baseCost: 100, costMult: 1 }
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
        
        // Happy mouth
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(24, 34, 5, 0.2, Math.PI - 0.2);
        ctx.stroke();
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
        ctx.fillStyle = '#27ae60';
        ctx.beginPath();
        ctx.ellipse(16, 20, 12, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.beginPath();
        ctx.ellipse(12, 16, 4, 3, -0.3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.ellipse(12, 20, 3, 3, 0, 0, Math.PI * 2);
        ctx.ellipse(20, 20, 3, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.ellipse(13, 20, 1.5, 1.5, 0, 0, Math.PI * 2);
        ctx.ellipse(21, 20, 1.5, 1.5, 0, 0, Math.PI * 2);
        ctx.fill();
    });
}

function createMonsterStoreTexture() {
    return createPixelTexture(96, 128, (ctx, w, h) => {
        // Tree trunk
        ctx.fillStyle = '#5d4e37';
        ctx.fillRect(38, 40, 20, 88);
        
        // Trunk texture
        ctx.fillStyle = '#4a3f2f';
        ctx.fillRect(42, 50, 4, 20);
        ctx.fillRect(50, 70, 4, 25);
        ctx.fillRect(44, 100, 3, 15);
        
        // Roots
        ctx.fillStyle = '#5d4e37';
        ctx.beginPath();
        ctx.moveTo(38, 128);
        ctx.quadraticCurveTo(25, 125, 20, 128);
        ctx.lineTo(38, 128);
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(58, 128);
        ctx.quadraticCurveTo(71, 125, 76, 128);
        ctx.lineTo(58, 128);
        ctx.fill();
        
        // Foliage layers
        const foliageColors = ['#1e8449', '#27ae60', '#2ecc71'];
        let y = 5;
        let size = 25;
        
        for (let i = 0; i < 3; i++) {
            ctx.fillStyle = foliageColors[i];
            ctx.beginPath();
            ctx.moveTo(48, y);
            ctx.lineTo(48 + size, y + 30);
            ctx.lineTo(48 - size, y + 30);
            ctx.closePath();
            ctx.fill();
            y += 20;
            size += 8;
        }
        
        // Store sign
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(25, 70, 46, 25);
        
        // Sign border
        ctx.strokeStyle = '#f1c40f';
        ctx.lineWidth = 2;
        ctx.strokeRect(26, 71, 44, 23);
        
        // "SHOP" text
        ctx.fillStyle = '#f1c40f';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('SHOP', 48, 86);
        
        // Hanging lanterns
        ctx.fillStyle = '#f39c12';
        ctx.beginPath();
        ctx.arc(25, 65, 5, 0, Math.PI * 2);
        ctx.arc(71, 65, 5, 0, Math.PI * 2);
        ctx.fill();
        
        // Lantern glow
        ctx.fillStyle = 'rgba(243, 156, 18, 0.4)';
        ctx.beginPath();
        ctx.arc(25, 65, 8, 0, Math.PI * 2);
        ctx.arc(71, 65, 8, 0, Math.PI * 2);
        ctx.fill();
    });
}

function createShopkeeperTexture() {
    return createPixelTexture(32, 36, (ctx, w, h) => {
        // Body/robe
        ctx.fillStyle = '#8e44ad';
        ctx.beginPath();
        ctx.moveTo(16, 14);
        ctx.lineTo(8, 36);
        ctx.lineTo(24, 36);
        ctx.closePath();
        ctx.fill();
        
        // Robe details
        ctx.fillStyle = '#9b59b6';
        ctx.beginPath();
        ctx.moveTo(16, 16);
        ctx.lineTo(12, 36);
        ctx.lineTo(20, 36);
        ctx.closePath();
        ctx.fill();
        
        // Face
        ctx.fillStyle = '#fad7a0';
        ctx.beginPath();
        ctx.ellipse(16, 12, 7, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Top hat
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(9, 0, 14, 4);
        ctx.fillRect(11, 4, 10, 6);
        
        // Hat band
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(11, 8, 10, 2);
        
        // Eyes
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.ellipse(13, 12, 1.5, 2, 0, 0, Math.PI * 2);
        ctx.ellipse(19, 12, 1.5, 2, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Monocle
        ctx.strokeStyle = '#f1c40f';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(19, 12, 3, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(22, 12);
        ctx.lineTo(26, 16);
        ctx.stroke();
        
        // Mustache
        ctx.fillStyle = '#5d4e37';
        ctx.beginPath();
        ctx.ellipse(13, 17, 3, 1.5, 0.3, 0, Math.PI * 2);
        ctx.ellipse(19, 17, 3, 1.5, -0.3, 0, Math.PI * 2);
        ctx.fill();
        
        // Smile
        ctx.strokeStyle = '#c0392b';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(16, 18, 2, 0.2, Math.PI - 0.2);
        ctx.stroke();
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
    tree.scale.set(12, 16, 1);
    tree.position.set(x, 8, z);
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
    showDialogue('🌳 MONSTER STORE', 'A peculiar shop has appeared! The slimes seem to be guarding it...');
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
            <h2>🏪 MONSTER STORE</h2>
            <div id="storeGoldDisplay">💰 <span id="storeGoldAmount">0</span></div>
            <div id="slimeStoreItems">
                <!-- Dynamic content will be inserted here -->
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
            max-height: 85vh;
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
            margin-bottom: 10px;
            gap: 10px;
        }
        
        .store-item.owned {
            border-color: #27ae60;
            background: rgba(39,174,96,0.2);
        }
        
        .store-item.locked {
            opacity: 0.5;
        }
        
        .store-item.maxed {
            border-color: #f1c40f;
            background: rgba(241,196,15,0.1);
        }
        
        .store-icon {
            font-size: 24px;
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
            margin-bottom: 4px;
        }
        
        .store-desc {
            color: #aaa;
            font-size: 8px;
            font-family: 'Press Start 2P', cursive;
        }
        
        .store-status, .store-level {
            color: #2ecc71;
            font-size: 8px;
            font-family: 'Press Start 2P', cursive;
            margin-top: 4px;
        }
        
        .store-btn {
            background: linear-gradient(180deg, #27ae60, #1e8449);
            border: 2px solid #2ecc71;
            border-radius: 6px;
            color: #fff;
            padding: 8px 12px;
            font-size: 9px;
            font-family: 'Press Start 2P', cursive;
            cursor: pointer;
            min-width: 80px;
        }
        
        .store-btn:disabled {
            background: #333;
            border-color: #555;
            color: #666;
            cursor: not-allowed;
        }
        
        .store-btn:not(:disabled):active {
            transform: scale(0.95);
        }
        
        #closeSlimeStore {
            width: 100%;
            background: linear-gradient(180deg, #c0392b, #922b21);
            border: 2px solid #e74c3c;
            border-radius: 8px;
            color: #fff;
            padding: 12px;
            font-size: 12px;
            font-family: 'Press Start 2P', cursive;
            cursor: pointer;
            margin-top: 15px;
        }
        
        .companion-section {
            border: 2px solid #3498db;
            border-radius: 8px;
            padding: 10px;
            margin-bottom: 15px;
            background: rgba(52,152,219,0.1);
        }
        
        .companion-header {
            color: #3498db;
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
                ${createUpgradeItemHTML(index, 'heal', '💚', 'Heal Ability', 'Auto-heal every minute')}
            </div>
        `;
        itemsContainer.appendChild(section);
        
        // Setup upgrade buttons for this companion
        ['attackSpeed', 'health', 'swords', 'heal'].forEach(upgradeKey => {
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
    
    updateSlimeStoreUI();
}

function createUpgradeItemHTML(companionIndex, upgradeKey, icon, name, desc) {
    return `
        <div class="store-item upgrade-item-store" id="companion-${companionIndex}-${upgradeKey}">
            <div class="store-icon">${icon}</div>
            <div class="store-info">
                <div class="store-name">${name}</div>
                <div class="store-desc">${desc}</div>
                <div class="store-level">Level: <span class="lvl">0</span>/${upgradeKey === 'heal' ? '1' : (upgradeKey === 'swords' ? '8' : (upgradeKey === 'health' ? '12' : '10'))}</div>
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
    
    showDialogue('🎩 MERCHANT', '"Come back anytime! ...If you can find me again, that is! Hehehehe!"');
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
        ['attackSpeed', 'health', 'swords', 'heal'].forEach(upgradeKey => {
            updateCompanionUpgradeItem(index, upgradeKey);
        });
    });
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
    
    if (upgradeKey === 'health') {
        updateCompanionMaxHealth(companionIndex);
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
        heal: '💚 HEAL ABILITY'
    };
    showReward(`${companion.color.icon} ${upgradeNames[upgradeKey]} UPGRADED!`);
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
    companion.maxHealth = gameState.player.maxHealth * healthPercent;
    
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
        
        companion.healCooldown = 60 * 60; // 1 minute
        
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
