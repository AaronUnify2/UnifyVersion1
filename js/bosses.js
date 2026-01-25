// ============================================
// BOSS SYSTEM
// ============================================

// Boss type definitions
const bossTypes = [
    { 
        name: 'dragon', 
        texture: 'dragon',
        scale: [12, 10], 
        speed: 0.04,
        behavior: 'chase_shoot',
        attackCooldown: 120,
        xpMultiplier: 0.8,
        goldDrop: 100
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
        boomCooldown: 600,
        xpMultiplier: 0.8,
        goldDrop: 120
    }
];

function getBossHealth() {
    // 100 hits to kill based on current player damage
    const playerDamage = CONFIG.projectileBaseDamage * (1 + gameState.player.level * 0.5);
    return playerDamage * 100;
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
