// ============================================
// ENEMY SYSTEM
// ============================================

// Note: Requires createPixelTexture() function from main file

// ============================================
// ENEMY SPRITE TEXTURES
// ============================================
function createSlimeTexture() {
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

function createSkeletonTexture() {
    return createPixelTexture(32, 48, (ctx, w, h) => {
        // Skull
        ctx.fillStyle = '#ecf0f1';
        ctx.fillRect(10, 2, 12, 14);
        ctx.fillRect(8, 6, 16, 8);
        
        // Eyes
        ctx.fillStyle = '#c0392b';
        ctx.fillRect(11, 7, 4, 4);
        ctx.fillRect(17, 7, 4, 4);
        ctx.fillStyle = '#000';
        ctx.fillRect(12, 8, 2, 2);
        ctx.fillRect(18, 8, 2, 2);
        
        // Nose
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(15, 11, 2, 3);
        
        // Teeth
        ctx.fillStyle = '#bdc3c7';
        ctx.fillRect(12, 14, 8, 2);
        
        // Spine
        ctx.fillStyle = '#ecf0f1';
        ctx.fillRect(14, 16, 4, 20);
        
        // Ribs
        ctx.fillStyle = '#bdc3c7';
        for (let i = 0; i < 4; i++) {
            ctx.fillRect(8, 18 + i * 4, 16, 2);
        }
        
        // Arms
        ctx.fillRect(4, 18, 4, 14);
        ctx.fillRect(24, 18, 4, 14);
        
        // Legs
        ctx.fillRect(10, 36, 4, 12);
        ctx.fillRect(18, 36, 4, 12);
    });
}

function createGoblinTexture() {
    return createPixelTexture(32, 40, (ctx, w, h) => {
        // Body
        ctx.fillStyle = '#6b8e23';
        ctx.fillRect(8, 16, 16, 16);
        
        // Head
        ctx.fillStyle = '#7cba3d';
        ctx.fillRect(6, 4, 20, 14);
        
        // Ears
        ctx.fillStyle = '#6b8e23';
        ctx.fillRect(2, 6, 6, 8);
        ctx.fillRect(24, 6, 6, 8);
        
        // Eyes
        ctx.fillStyle = '#ff0';
        ctx.fillRect(10, 8, 4, 4);
        ctx.fillRect(18, 8, 4, 4);
        ctx.fillStyle = '#000';
        ctx.fillRect(11, 9, 2, 2);
        ctx.fillRect(19, 9, 2, 2);
        
        // Nose
        ctx.fillStyle = '#5a7a1e';
        ctx.fillRect(14, 11, 4, 4);
        
        // Mouth
        ctx.fillStyle = '#8b0000';
        ctx.fillRect(12, 15, 8, 2);
        
        // Legs
        ctx.fillStyle = '#6b8e23';
        ctx.fillRect(10, 32, 4, 8);
        ctx.fillRect(18, 32, 4, 8);
        
        // Arms
        ctx.fillRect(4, 18, 4, 10);
        ctx.fillRect(24, 18, 4, 10);
    });
}

function createGhostTexture() {
    return createPixelTexture(32, 40, (ctx, w, h) => {
        // Body
        ctx.fillStyle = 'rgba(200, 220, 255, 0.8)';
        ctx.beginPath();
        ctx.ellipse(16, 16, 12, 14, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Tail
        ctx.fillRect(6, 24, 20, 10);
        for (let i = 0; i < 4; i++) {
            ctx.fillRect(6 + i * 6, 34, 4, 6);
        }
        
        // Eyes
        ctx.fillStyle = '#000';
        ctx.fillRect(9, 12, 5, 6);
        ctx.fillRect(18, 12, 5, 6);
        
        // Glow
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.fillRect(10, 8, 4, 3);
        ctx.fillRect(19, 8, 4, 3);
    });
}

function createBatTexture() {
    return createPixelTexture(40, 24, (ctx, w, h) => {
        // Body
        ctx.fillStyle = '#2c2c54';
        ctx.beginPath();
        ctx.ellipse(20, 14, 8, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Wings
        ctx.fillStyle = '#40407a';
        // Left wing
        ctx.beginPath();
        ctx.moveTo(12, 14);
        ctx.lineTo(2, 6);
        ctx.lineTo(4, 16);
        ctx.lineTo(12, 18);
        ctx.fill();
        
        // Right wing
        ctx.beginPath();
        ctx.moveTo(28, 14);
        ctx.lineTo(38, 6);
        ctx.lineTo(36, 16);
        ctx.lineTo(28, 18);
        ctx.fill();
        
        // Eyes
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(16, 11, 3, 3);
        ctx.fillRect(21, 11, 3, 3);
        
        // Ears
        ctx.fillStyle = '#2c2c54';
        ctx.fillRect(14, 4, 4, 6);
        ctx.fillRect(22, 4, 4, 6);
    });
}

function createWizardTexture() {
    return createPixelTexture(32, 48, (ctx, w, h) => {
        // Robe
        ctx.fillStyle = '#4a235a';
        ctx.fillRect(8, 20, 16, 22);
        ctx.fillRect(6, 42, 20, 6);
        
        // Face
        ctx.fillStyle = '#fad7a0';
        ctx.fillRect(10, 14, 12, 10);
        
        // Hat
        ctx.fillStyle = '#6c3483';
        ctx.fillRect(6, 10, 20, 6);
        ctx.fillRect(10, 2, 12, 10);
        ctx.fillRect(14, 0, 4, 4);
        
        // Star on hat
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(14, 4, 4, 4);
        
        // Eyes
        ctx.fillStyle = '#9b59b6';
        ctx.fillRect(12, 16, 3, 3);
        ctx.fillRect(17, 16, 3, 3);
        
        // Beard
        ctx.fillStyle = '#bdc3c7';
        ctx.fillRect(10, 22, 12, 8);
        ctx.fillRect(12, 30, 8, 4);
        ctx.fillRect(14, 34, 4, 2);
        
        // Staff
        ctx.fillStyle = '#8b4513';
        ctx.fillRect(26, 10, 3, 38);
        ctx.fillStyle = '#9b59b6';
        ctx.fillRect(24, 6, 7, 6);
    });
}

// ============================================
// ENEMY TYPE DEFINITIONS
// ============================================

// Enemy type definitions with varied stats
const enemyTypes = [
    { name: 'slime', texture: createSlimeTexture, scale: [2.5, 2.5], speed: 0.025, healthMult: 0.5, damageMult: 0.5, xp: 10000, gold: 10000, goldChance: 0.99 },
    { name: 'goblin', texture: createGoblinTexture, scale: [2.5, 3.2], speed: 0.055, healthMult: 0.9, damageMult: 0.95, xp: 25, gold: 5, goldChance: 0.4 },
    { name: 'skeleton', texture: createSkeletonTexture, scale: [2.5, 4], speed: 0.038, healthMult: 1.8, damageMult: 1.05, xp: 30, gold: 8, goldChance: 0.5 },
    { name: 'ghost', texture: createGhostTexture, scale: [2.5, 3.2], speed: 0.1, healthMult: 3.4, damageMult: 1.2, xp: 35, gold: 10, goldChance: 0.3 },
    { name: 'bat', texture: createBatTexture, scale: [3, 2], speed: 0.17, healthMult: 0.4, damageMult: 1.6, xp: 100, gold: 3, goldChance: 0.5 },
    { name: 'wizard', texture: createWizardTexture, scale: [2.5, 4], speed: 0.028, healthMult: 5.0, damageMult: 3.4, xp: 55, gold: 20, goldChance: 0.7 }
];

function spawnEnemy() {
    if (gameState.enemies.length >= CONFIG.enemyMaxCount || gameState.isGameOver) return;

    const angle = Math.random() * Math.PI * 2;
    const dist = CONFIG.enemySpawnRadius * (0.7 + Math.random() * 0.3);
    
    const x = gameState.player.position.x + Math.cos(angle) * dist;
    const z = gameState.player.position.z + Math.sin(angle) * dist;

    // Select enemy type based on level
    const maxTypeIndex = Math.min(Math.floor(gameState.player.level / 2), enemyTypes.length - 1);
    const typeIndex = Math.floor(Math.random() * (maxTypeIndex + 1));
    const type = enemyTypes[typeIndex];

    const texture = type.texture();
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(type.scale[0], type.scale[1], 1);
    sprite.position.set(x, type.scale[1] / 2, z);

    // Random stat variations for each individual enemy
    // Health: ±30%, Damage: ±25%, Speed: ±20%
    const healthVariation = 0.7 + Math.random() * 0.6;
    const damageVariation = 0.75 + Math.random() * 0.5;
    const speedVariation = 0.8 + Math.random() * 0.4;

    const baseHealth = CONFIG.enemyBaseHealth * type.healthMult * (1 + gameState.player.level * 0.2);
    const baseDamage = CONFIG.enemyBaseDamage * type.damageMult * (1 + gameState.player.level * 0.15);

    const enemy = {
        sprite,
        type,
        health: baseHealth * healthVariation,
        maxHealth: baseHealth * healthVariation,
        damage: baseDamage * damageVariation,
        speed: type.speed * speedVariation,
        attackCooldown: 0,
        hitFlash: 0,
        // Track current target for slime aggro system
        currentTarget: null,
        targetIsSlime: false
    };

    scene.add(sprite);
    gameState.enemies.push(enemy);
}

function updateEnemies(delta) {
    // Pause during dialogue
    if (gameState.dialogueTimer > 0) return;
    
    for (let i = gameState.enemies.length - 1; i >= 0; i--) {
        const enemy = gameState.enemies[i];
        
        // Determine target - use slime aggro system if available
        let targetPos;
        let targetingSlime = false;
        
        if (typeof getSlimeAggroTarget === 'function') {
            targetPos = getSlimeAggroTarget(enemy.sprite.position, false);
            // Check if we're targeting the slime (not player)
            if (typeof slimeCompanionState !== 'undefined' && 
                slimeCompanionState.slime && 
                targetPos === slimeCompanionState.slime.position) {
                targetingSlime = true;
            }
        } else {
            targetPos = gameState.player.position;
        }
        
        enemy.targetIsSlime = targetingSlime;
        
        // Move towards target using individual speed
        const dx = targetPos.x - enemy.sprite.position.x;
        const dz = targetPos.z - enemy.sprite.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);

        if (dist > 1.5) {
            enemy.sprite.position.x += (dx / dist) * enemy.speed;
            enemy.sprite.position.z += (dz / dist) * enemy.speed;
        } else if (enemy.attackCooldown <= 0) {
            // Attack target
            if (targetingSlime && typeof damageCompanionSlime === 'function') {
                // Attack the companion slime
                damageCompanionSlime(enemy.damage);
            } else {
                // Attack player
                takeDamage(enemy.damage);
            }
            enemy.attackCooldown = 60;
        }

        enemy.attackCooldown = Math.max(0, enemy.attackCooldown - 1);

        // Hit flash effect
        if (enemy.hitFlash > 0) {
            enemy.hitFlash--;
            enemy.sprite.material.color.setHex(enemy.hitFlash % 4 < 2 ? 0xffffff : 0xff0000);
        } else {
            enemy.sprite.material.color.setHex(0xffffff);
        }

        // Remove if too far from PLAYER (not target)
        const playerDx = gameState.player.position.x - enemy.sprite.position.x;
        const playerDz = gameState.player.position.z - enemy.sprite.position.z;
        const playerDist = Math.sqrt(playerDx * playerDx + playerDz * playerDz);
        
        if (playerDist > CONFIG.renderDistance * 1.5) {
            scene.remove(enemy.sprite);
            gameState.enemies.splice(i, 1);
        }
    }
}
