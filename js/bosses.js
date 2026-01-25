// ============================================
// BOSS SYSTEM
// ============================================

// Note: Requires createPixelTexture() function from main file

// ============================================
// BOSS SPRITE TEXTURES
// ============================================
function createDragonTexture() {
    return createPixelTexture(96, 80, (ctx, w, h) => {
        // Body
        ctx.fillStyle = '#8b0000';
        ctx.beginPath();
        ctx.ellipse(48, 50, 30, 20, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Body scales
        ctx.fillStyle = '#a52a2a';
        for (let i = 0; i < 5; i++) {
            ctx.fillRect(30 + i * 8, 45, 6, 10);
        }
        
        // Neck
        ctx.fillStyle = '#8b0000';
        ctx.fillRect(55, 30, 15, 25);
        
        // Head
        ctx.fillStyle = '#a52a2a';
        ctx.fillRect(50, 15, 30, 22);
        ctx.fillRect(70, 20, 15, 12);
        
        // Horns
        ctx.fillStyle = '#2c2c2c';
        ctx.fillRect(52, 8, 6, 12);
        ctx.fillRect(68, 8, 6, 12);
        
        // Eye
        ctx.fillStyle = '#ffff00';
        ctx.fillRect(72, 22, 8, 6);
        ctx.fillStyle = '#000';
        ctx.fillRect(76, 24, 3, 3);
        
        // Nostril smoke
        ctx.fillStyle = '#ff6600';
        ctx.fillRect(82, 26, 4, 4);
        
        // Wings
        ctx.fillStyle = '#6b0000';
        // Left wing
        ctx.beginPath();
        ctx.moveTo(35, 35);
        ctx.lineTo(5, 15);
        ctx.lineTo(10, 35);
        ctx.lineTo(5, 50);
        ctx.lineTo(35, 50);
        ctx.fill();
        
        // Wing membrane lines
        ctx.fillStyle = '#4a0000';
        ctx.fillRect(10, 25, 20, 2);
        ctx.fillRect(12, 35, 18, 2);
        ctx.fillRect(10, 45, 20, 2);
        
        // Tail
        ctx.fillStyle = '#8b0000';
        ctx.fillRect(10, 50, 25, 10);
        ctx.fillRect(2, 48, 12, 8);
        
        // Tail spike
        ctx.fillStyle = '#2c2c2c';
        ctx.beginPath();
        ctx.moveTo(2, 48);
        ctx.lineTo(-5, 52);
        ctx.lineTo(2, 56);
        ctx.fill();
        
        // Legs
        ctx.fillStyle = '#6b0000';
        ctx.fillRect(35, 65, 10, 15);
        ctx.fillRect(55, 65, 10, 15);
        
        // Claws
        ctx.fillStyle = '#2c2c2c';
        ctx.fillRect(33, 77, 4, 3);
        ctx.fillRect(38, 77, 4, 3);
        ctx.fillRect(43, 77, 4, 3);
        ctx.fillRect(53, 77, 4, 3);
        ctx.fillRect(58, 77, 4, 3);
        ctx.fillRect(63, 77, 4, 3);
        
        // Belly
        ctx.fillStyle = '#d4a574';
        ctx.beginPath();
        ctx.ellipse(48, 55, 18, 12, 0, 0, Math.PI);
        ctx.fill();
    });
}

function createTrollTexture() {
    return createPixelTexture(64, 96, (ctx, w, h) => {
        // Body
        ctx.fillStyle = '#556b2f';
        ctx.fillRect(12, 35, 40, 45);
        
        // Body texture
        ctx.fillStyle = '#4a5f28';
        for (let i = 0; i < 8; i++) {
            ctx.fillRect(15 + (i % 4) * 10, 40 + Math.floor(i / 4) * 20, 6, 6);
        }
        
        // Head
        ctx.fillStyle = '#6b8e23';
        ctx.fillRect(14, 8, 36, 32);
        
        // Brow ridge
        ctx.fillStyle = '#556b2f';
        ctx.fillRect(14, 14, 36, 8);
        
        // Eyes
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(18, 18, 10, 8);
        ctx.fillRect(36, 18, 10, 8);
        ctx.fillStyle = '#000';
        ctx.fillRect(22, 20, 4, 4);
        ctx.fillRect(40, 20, 4, 4);
        
        // Nose
        ctx.fillStyle = '#4a5f28';
        ctx.fillRect(28, 24, 8, 10);
        
        // Mouth with tusks
        ctx.fillStyle = '#3d4a1f';
        ctx.fillRect(20, 32, 24, 6);
        ctx.fillStyle = '#fffff0';
        ctx.fillRect(22, 30, 5, 8);
        ctx.fillRect(37, 30, 5, 8);
        
        // Ears
        ctx.fillStyle = '#6b8e23';
        ctx.fillRect(8, 15, 8, 14);
        ctx.fillRect(48, 15, 8, 14);
        
        // Arms
        ctx.fillStyle = '#6b8e23';
        ctx.fillRect(0, 38, 14, 35);
        ctx.fillRect(50, 38, 14, 35);
        
        // Hands
        ctx.fillStyle = '#556b2f';
        ctx.fillRect(-2, 70, 14, 12);
        ctx.fillRect(52, 70, 14, 12);
        
        // Legs
        ctx.fillStyle = '#556b2f';
        ctx.fillRect(14, 78, 14, 18);
        ctx.fillRect(36, 78, 14, 18);
        
        // Feet
        ctx.fillStyle = '#4a5f28';
        ctx.fillRect(10, 92, 18, 4);
        ctx.fillRect(36, 92, 18, 4);
        
        // Loincloth
        ctx.fillStyle = '#8b4513';
        ctx.fillRect(14, 75, 36, 10);
    });
}

function createEvilTreeTexture() {
    return createPixelTexture(80, 112, (ctx, w, h) => {
        // Main trunk
        ctx.fillStyle = '#2c1810';
        ctx.fillRect(28, 50, 24, 62);
        
        // Trunk texture/bark
        ctx.fillStyle = '#1a0f0a';
        ctx.fillRect(30, 55, 4, 50);
        ctx.fillRect(38, 52, 3, 55);
        ctx.fillRect(46, 58, 4, 48);
        
        // Roots
        ctx.fillStyle = '#2c1810';
        ctx.fillRect(18, 100, 15, 12);
        ctx.fillRect(47, 100, 15, 12);
        ctx.fillRect(10, 105, 12, 7);
        ctx.fillRect(58, 105, 12, 7);
        
        // Face area (darker)
        ctx.fillStyle = '#1a0f0a';
        ctx.fillRect(30, 55, 20, 30);
        
        // Evil eyes
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(32, 60, 7, 7);
        ctx.fillRect(42, 60, 7, 7);
        
        // Glowing pupils
        ctx.fillStyle = '#ffff00';
        ctx.fillRect(34, 62, 3, 3);
        ctx.fillRect(44, 62, 3, 3);
        
        // Evil mouth
        ctx.fillStyle = '#0a0505';
        ctx.fillRect(33, 74, 14, 8);
        
        // Teeth
        ctx.fillStyle = '#8b7355';
        ctx.fillRect(35, 74, 3, 4);
        ctx.fillRect(40, 74, 3, 4);
        ctx.fillRect(37, 78, 3, 4);
        ctx.fillRect(42, 78, 3, 4);
        
        // Branch arms
        ctx.fillStyle = '#2c1810';
        // Left arm
        ctx.fillRect(8, 45, 22, 10);
        ctx.fillRect(4, 35, 10, 14);
        ctx.fillRect(0, 28, 8, 12);
        
        // Left fingers
        ctx.fillRect(-4, 22, 6, 10);
        ctx.fillRect(2, 20, 5, 8);
        ctx.fillRect(8, 25, 5, 8);
        
        // Right arm
        ctx.fillRect(50, 45, 22, 10);
        ctx.fillRect(66, 35, 10, 14);
        ctx.fillRect(72, 28, 8, 12);
        
        // Right fingers
        ctx.fillRect(78, 22, 6, 10);
        ctx.fillRect(73, 20, 5, 8);
        ctx.fillRect(67, 25, 5, 8);
        
        // Crown/top branches
        ctx.fillStyle = '#1a3d1a';
        ctx.beginPath();
        ctx.moveTo(40, 0);
        ctx.lineTo(20, 30);
        ctx.lineTo(30, 28);
        ctx.lineTo(15, 50);
        ctx.lineTo(65, 50);
        ctx.lineTo(50, 28);
        ctx.lineTo(60, 30);
        ctx.closePath();
        ctx.fill();
        
        // Darker foliage spots
        ctx.fillStyle = '#0f2b0f';
        ctx.fillRect(25, 35, 8, 8);
        ctx.fillRect(42, 32, 10, 10);
        ctx.fillRect(32, 20, 6, 8);
        ctx.fillRect(22, 15, 8, 6);
        ctx.fillRect(48, 18, 7, 7);
        
        // Glowing magical spots
        ctx.fillStyle = '#9b59b6';
        ctx.fillRect(28, 38, 3, 3);
        ctx.fillRect(48, 35, 3, 3);
        ctx.fillRect(38, 25, 3, 3);
    });
}

function createTrollClubTexture() {
    return createPixelTexture(20, 48, (ctx, w, h) => {
        // Handle
        ctx.fillStyle = '#8b4513';
        ctx.fillRect(8, 20, 6, 28);
        
        // Handle wrap
        ctx.fillStyle = '#654321';
        ctx.fillRect(8, 25, 6, 4);
        ctx.fillRect(8, 35, 6, 4);
        
        // Club head
        ctx.fillStyle = '#5d4037';
        ctx.beginPath();
        ctx.ellipse(10, 12, 10, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Spikes/bumps
        ctx.fillStyle = '#4a3728';
        ctx.fillRect(2, 8, 5, 5);
        ctx.fillRect(14, 6, 5, 5);
        ctx.fillRect(6, 2, 5, 5);
        ctx.fillRect(12, 14, 4, 4);
        ctx.fillRect(3, 15, 4, 4);
    });
}

function createBossFireballTexture() {
    return createPixelTexture(32, 32, (ctx, w, h) => {
        // Outer flame
        ctx.fillStyle = '#ff4500';
        ctx.beginPath();
        ctx.arc(16, 16, 15, 0, Math.PI * 2);
        ctx.fill();
        
        // Mid flame
        ctx.fillStyle = '#ff6600';
        ctx.beginPath();
        ctx.arc(16, 16, 11, 0, Math.PI * 2);
        ctx.fill();
        
        // Inner flame
        ctx.fillStyle = '#ffaa00';
        ctx.beginPath();
        ctx.arc(16, 16, 7, 0, Math.PI * 2);
        ctx.fill();
        
        // Core
        ctx.fillStyle = '#ffff00';
        ctx.beginPath();
        ctx.arc(16, 16, 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Hot center
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(16, 16, 2, 0, Math.PI * 2);
        ctx.fill();
    });
}

function createTreeMagicTexture() {
    return createPixelTexture(24, 24, (ctx, w, h) => {
        // Outer magic
        ctx.fillStyle = '#9b59b6';
        ctx.beginPath();
        ctx.arc(12, 12, 11, 0, Math.PI * 2);
        ctx.fill();
        
        // Inner swirl
        ctx.fillStyle = '#8e44ad';
        ctx.beginPath();
        ctx.arc(12, 12, 8, 0, Math.PI * 2);
        ctx.fill();
        
        // Core
        ctx.fillStyle = '#bb8fce';
        ctx.beginPath();
        ctx.arc(12, 12, 5, 0, Math.PI * 2);
        ctx.fill();
        
        // Sparkle
        ctx.fillStyle = '#fff';
        ctx.fillRect(10, 10, 4, 4);
    });
}

// ============================================
// BOSS TYPE DEFINITIONS
// ============================================

// Boss textures - initialized lazily to avoid dependency issues
let bossTextures = null;

function initBossTextures() {
    if (bossTextures) return; // Already initialized
    console.log('Initializing boss textures...');
    bossTextures = {
        dragon: createDragonTexture(),
        troll: createTrollTexture(),
        evilTree: createEvilTreeTexture(),
        trollClub: createTrollClubTexture(),
        fireball: createBossFireballTexture(),
        treeMagic: createTreeMagicTexture()
    };
}

// Boss type definitions
const bossTypes = [
    { 
        name: 'dragon', 
        texture: 'dragon',
        scale: [12, 10], 
        speed: 0.1,
        behavior: 'chase_shoot',
        attackCooldown: 100,
        xpMultiplier: 0.8,
        goldDrop: 360
    },
    { 
        name: 'troll', 
        texture: 'troll',
        scale: [8, 12], 
        speed: 0.035,
        behavior: 'chase_club',
        clubDamageMultiplier: 2,
        xpMultiplier: 0.8,
        goldDrop: 80
    },
    { 
        name: 'evilTree', 
        texture: 'evilTree',
        scale: [10, 14], 
        speed: 0,
        behavior: 'stationary_magic',
        attackCooldown: 90,
        boomCooldown: 400,
        xpMultiplier: 0.8,
        goldDrop: 220
    }
];

function getBossHealth() {
    // 100 hits to kill based on current player damage
    const playerDamage = CONFIG.projectileBaseDamage * (1 + gameState.player.level * 0.5);
    return playerDamage * 80;
}

function getBossDamage() {
    return CONFIG.enemyBaseDamage * (2 + gameState.player.level * 0.3);
}

function shouldSpawnBoss() {
    if (gameState.bosses.length > 0) return false; // Only one boss at a time
    if (gameState.encounter) return false; // No boss during encounters
    
    const level = gameState.player.level;
    if (level < 4) return false; // No bosses before level 4
    
    // Spawn chance increases with level
    // Level 4: ~1% chance per spawn check
    // Level 9+: ~7.5% chance per spawn check
    const baseChance = 0.01;
    const levelBonus = Math.min((level - 4) * 0.0125, 0.065);
    const spawnChance = baseChance + levelBonus;
    
    return Math.random() < spawnChance;
}

function spawnBoss() {
    // Ensure textures are initialized
    initBossTextures();
    
    console.log('Spawning boss!');
    const angle = Math.random() * Math.PI * 2;
    const dist = CONFIG.enemySpawnRadius * 1.2;
    
    const x = gameState.player.position.x + Math.cos(angle) * dist;
    const z = gameState.player.position.z + Math.sin(angle) * dist;

    const typeIndex = Math.floor(Math.random() * bossTypes.length);
    const type = bossTypes[typeIndex];

    const material = new THREE.SpriteMaterial({ 
        map: bossTextures[type.texture], 
        transparent: true 
    });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(type.scale[0], type.scale[1], 1);
    sprite.position.set(x, type.scale[1] / 2, z);

    const boss = {
        sprite,
        type,
        health: getBossHealth(),
        maxHealth: getBossHealth(),
        damage: getBossDamage(),
        attackTimer: 0,
        boomTimer: type.boomCooldown || 0,
        hitFlash: 0,
        projectiles: [],
        club: null,
        clubAngle: 0
    };

    // Create troll's club
    if (type.behavior === 'chase_club') {
        const clubMaterial = new THREE.SpriteMaterial({
            map: bossTextures.trollClub,
            transparent: true
        });
        const clubSprite = new THREE.Sprite(clubMaterial);
        clubSprite.scale.set(2.5, 6, 1);
        scene.add(clubSprite);
        boss.club = clubSprite;
    }

    scene.add(sprite);
    gameState.bosses.push(boss);
    gameState.bossActive = true;
    gameState.targetCameraZoom = 1.8; // Zoom out camera
}

function updateBosses() {
    // Pause during dialogue
    if (gameState.dialogueTimer > 0) return;
    
    const playerDamage = CONFIG.projectileBaseDamage * (1 + gameState.player.level * 0.5);
    
    for (let i = gameState.bosses.length - 1; i >= 0; i--) {
        const boss = gameState.bosses[i];
        const type = boss.type;
        
        const dx = gameState.player.position.x - boss.sprite.position.x;
        const dz = gameState.player.position.z - boss.sprite.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);

        // Movement based on behavior
        if (type.speed > 0 && dist > 3) {
            boss.sprite.position.x += (dx / dist) * type.speed;
            boss.sprite.position.z += (dz / dist) * type.speed;
        }

        // Behavior-specific updates
        if (type.behavior === 'chase_shoot') {
            // Dragon shoots fireballs
            boss.attackTimer++;
            if (boss.attackTimer >= type.attackCooldown) {
                shootBossProjectile(boss, 'fireball', dx, dz, dist);
                boss.attackTimer = 0;
            }
        } else if (type.behavior === 'chase_club') {
            // Troll has orbiting club
            boss.clubAngle += 0.05;
            const clubRadius = 5;
            const clubX = boss.sprite.position.x + Math.cos(boss.clubAngle) * clubRadius;
            const clubZ = boss.sprite.position.z + Math.sin(boss.clubAngle) * clubRadius;
            boss.club.position.set(clubX, 3, clubZ);
            boss.club.material.rotation = -boss.clubAngle;
            
            // Club damages player
            const clubDx = gameState.player.position.x - clubX;
            const clubDz = gameState.player.position.z - clubZ;
            const clubDist = Math.sqrt(clubDx * clubDx + clubDz * clubDz);
            if (clubDist < 2.5) {
                takeDamage(boss.damage * type.clubDamageMultiplier);
            }
            
            // Club damages regular enemies
            for (const enemy of gameState.enemies) {
                const eDx = enemy.sprite.position.x - clubX;
                const eDz = enemy.sprite.position.z - clubZ;
                const eDist = Math.sqrt(eDx * eDx + eDz * eDz);
                if (eDist < 2.5) {
                    enemy.health -= playerDamage * 2;
                    enemy.hitFlash = 10;
                }
            }
        } else if (type.behavior === 'stationary_magic') {
            // Evil tree shoots magic and occasionally booms
            boss.attackTimer++;
            boss.boomTimer++;
            
            if (boss.attackTimer >= type.attackCooldown && dist < 30) {
                shootBossProjectile(boss, 'treeMagic', dx, dz, dist);
                boss.attackTimer = 0;
            }
            
            if (boss.boomTimer >= type.boomCooldown) {
                fireBossBoom(boss);
                boss.boomTimer = 0;
            }
        }

        // Contact damage for melee bosses
        if (dist < 4 && type.speed > 0) {
            takeDamage(boss.damage * 0.5);
        }

        // Hit flash effect
        if (boss.hitFlash > 0) {
            boss.hitFlash--;
            boss.sprite.material.color.setHex(boss.hitFlash % 4 < 2 ? 0xffffff : 0xff0000);
        } else {
            boss.sprite.material.color.setHex(0xffffff);
        }

        // Update boss projectiles
        updateBossProjectiles(boss);

        // Check if boss is dead
        if (boss.health <= 0) {
            // Drop massive XP
            const xpNeeded = CONFIG.baseXpToLevel * Math.pow(1.5, gameState.player.level - 1);
            const xpDrop = Math.floor(xpNeeded * type.xpMultiplier);
            
            // Drop multiple XP orbs for visual effect
            for (let j = 0; j < 10; j++) {
                const orbPos = boss.sprite.position.clone();
                orbPos.x += (Math.random() - 0.5) * 4;
                orbPos.z += (Math.random() - 0.5) * 4;
                spawnXPOrb(orbPos, Math.floor(xpDrop / 10));
            }
            
            // Drop gold
            for (let j = 0; j < 5; j++) {
                const goldPos = boss.sprite.position.clone();
                goldPos.x += (Math.random() - 0.5) * 3;
                goldPos.z += (Math.random() - 0.5) * 3;
                spawnGoldOrb(goldPos, Math.floor(type.goldDrop / 5));
            }
            
            // Clean up
            scene.remove(boss.sprite);
            if (boss.club) scene.remove(boss.club);
            boss.projectiles.forEach(p => scene.remove(p.sprite));
            gameState.bosses.splice(i, 1);
            gameState.kills++;
            document.getElementById('kills').textContent = gameState.kills;
            
            if (gameState.bosses.length === 0) {
                gameState.bossActive = false;
                gameState.targetCameraZoom = 1; // Reset camera
            }
        }

        // Remove boss if too far (player ran away)
        if (dist > CONFIG.renderDistance * 2.5) {
            scene.remove(boss.sprite);
            if (boss.club) scene.remove(boss.club);
            boss.projectiles.forEach(p => scene.remove(p.sprite));
            gameState.bosses.splice(i, 1);
            
            if (gameState.bosses.length === 0) {
                gameState.bossActive = false;
                gameState.targetCameraZoom = 1;
            }
        }
    }
    
    // Clean up dead enemies from boss attacks
    for (let i = gameState.enemies.length - 1; i >= 0; i--) {
        const enemy = gameState.enemies[i];
        if (enemy.health <= 0) {
            spawnXPOrb(enemy.sprite.position.clone(), enemy.type.xp);
            if (Math.random() < enemy.type.goldChance && enemy.type.gold > 0) {
                spawnGoldOrb(enemy.sprite.position.clone(), enemy.type.gold);
            }
            scene.remove(enemy.sprite);
            gameState.enemies.splice(i, 1);
            gameState.kills++;
            document.getElementById('kills').textContent = gameState.kills;
        }
    }
}

function shootBossProjectile(boss, type, dx, dz, dist) {
    const material = new THREE.SpriteMaterial({
        map: bossTextures[type],
        transparent: true,
        blending: THREE.AdditiveBlending
    });
    
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(2.5, 2.5, 1);
    sprite.position.copy(boss.sprite.position);
    sprite.position.y = 2;
    
    const projectile = {
        sprite,
        direction: new THREE.Vector3(dx / dist, 0, dz / dist),
        speed: 0.2,
        damage: boss.damage,
        life: 300,
        type
    };
    
    scene.add(sprite);
    boss.projectiles.push(projectile);
}

function fireBossBoom(boss) {
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        
        const material = new THREE.SpriteMaterial({
            map: bossTextures.treeMagic,
            transparent: true,
            blending: THREE.AdditiveBlending
        });
        
        const sprite = new THREE.Sprite(material);
        sprite.scale.set(3, 3, 1);
        sprite.position.copy(boss.sprite.position);
        sprite.position.y = 4;
        
        const projectile = {
            sprite,
            direction: new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle)),
            speed: 0.25,
            damage: boss.damage * 1.5,
            life: 200,
            type: 'boom'
        };
        
        scene.add(sprite);
        boss.projectiles.push(projectile);
    }
}

function updateBossProjectiles(boss) {
    const playerDamage = CONFIG.projectileBaseDamage * (1 + gameState.player.level * 0.5);
    
    for (let i = boss.projectiles.length - 1; i >= 0; i--) {
        const proj = boss.projectiles[i];
        
        proj.sprite.position.x += proj.direction.x * proj.speed;
        proj.sprite.position.z += proj.direction.z * proj.speed;
        proj.life--;
        proj.sprite.material.rotation += 0.1;
        
        // Check hit player
        const dx = gameState.player.position.x - proj.sprite.position.x;
        const dz = gameState.player.position.z - proj.sprite.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        
        if (dist < 2) {
            takeDamage(proj.damage);
            scene.remove(proj.sprite);
            boss.projectiles.splice(i, 1);
            continue;
        }
        
        // Boss projectiles damage regular enemies
        for (const enemy of gameState.enemies) {
            const eDx = enemy.sprite.position.x - proj.sprite.position.x;
            const eDz = enemy.sprite.position.z - proj.sprite.position.z;
            const eDist = Math.sqrt(eDx * eDx + eDz * eDz);
            
            if (eDist < 1.5) {
                enemy.health -= playerDamage * 3;
                enemy.hitFlash = 10;
            }
        }
        
        if (proj.life <= 0) {
            scene.remove(proj.sprite);
            boss.projectiles.splice(i, 1);
        }
    }
}

function updateCameraZoom() {
    // Smoothly interpolate camera zoom
    const zoomSpeed = 0.02;
    gameState.cameraZoom += (gameState.targetCameraZoom - gameState.cameraZoom) * zoomSpeed;
    
    // Update boss health bar
    const bossBar = document.getElementById('bossHealthBar');
    if (gameState.bosses.length > 0) {
        const boss = gameState.bosses[0];
        bossBar.classList.add('active');
        
        const bossNames = {
            dragon: '🐉 DRAGON',
            troll: '👹 TROLL',
            evilTree: '🌳 EVIL TREE'
        };
        document.getElementById('bossName').textContent = bossNames[boss.type.name] || 'BOSS';
        
        const healthPercent = (boss.health / boss.maxHealth) * 100;
        document.getElementById('bossFill').style.width = Math.max(0, healthPercent) + '%';
    } else {
        bossBar.classList.remove('active');
    }
}
