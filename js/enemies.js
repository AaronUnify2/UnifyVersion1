// ============================================
// ENEMY SYSTEM
// ============================================

// Enemy type definitions with varied stats
const enemyTypes = [
    { name: 'slime', texture: createSlimeTexture, scale: [2.5, 2.5], speed: 0.025, healthMult: 0.5, damageMult: 0.5, xp: 10, gold: 0, goldChance: 0.1 },
    { name: 'goblin', texture: createGoblinTexture, scale: [2.5, 3.2], speed: 0.055, healthMult: 0.9, damageMult: 0.95, xp: 15, gold: 5, goldChance: 0.4 },
    { name: 'skeleton', texture: createSkeletonTexture, scale: [2.5, 4], speed: 0.038, healthMult: 1.1, damageMult: 1.05, xp: 20, gold: 8, goldChance: 0.5 },
    { name: 'ghost', texture: createGhostTexture, scale: [2.5, 3.2], speed: 0.05, healthMult: 0.8, damageMult: 1.2, xp: 25, gold: 10, goldChance: 0.3 },
    { name: 'bat', texture: createBatTexture, scale: [3, 2], speed: 0.07, healthMult: 0.4, damageMult: 0.6, xp: 12, gold: 3, goldChance: 0.2 },
    { name: 'wizard', texture: createWizardTexture, scale: [2.5, 4], speed: 0.028, healthMult: 1.3, damageMult: 1.4, xp: 35, gold: 20, goldChance: 0.7 }
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
        hitFlash: 0
    };

    scene.add(sprite);
    gameState.enemies.push(enemy);
}

function updateEnemies(delta) {
    // Pause during dialogue
    if (gameState.dialogueTimer > 0) return;
    
    for (let i = gameState.enemies.length - 1; i >= 0; i--) {
        const enemy = gameState.enemies[i];
        
        // Move towards player using individual speed
        const dx = gameState.player.position.x - enemy.sprite.position.x;
        const dz = gameState.player.position.z - enemy.sprite.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);

        if (dist > 1.5) {
            enemy.sprite.position.x += (dx / dist) * enemy.speed;
            enemy.sprite.position.z += (dz / dist) * enemy.speed;
        } else if (enemy.attackCooldown <= 0) {
            // Attack player
            takeDamage(enemy.damage);
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

        // Remove if too far
        if (dist > CONFIG.renderDistance * 1.5) {
            scene.remove(enemy.sprite);
            gameState.enemies.splice(i, 1);
        }
    }
}
