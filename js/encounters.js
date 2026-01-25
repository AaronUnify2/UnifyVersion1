// ============================================
// ENCOUNTER SYSTEM
// ============================================

// Note: Requires createPixelTexture() function from main file

// ============================================
// ENCOUNTER SPRITE TEXTURES
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
        // Hair
        ctx.fillStyle = '#f4d03f';
        ctx.fillRect(27, 53, 10, 5);
        ctx.fillRect(26, 56, 3, 8);
        ctx.fillRect(35, 56, 3, 8);
        // Crown
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(28, 51, 8, 3);
        ctx.fillRect(29, 49, 2, 3);
        ctx.fillRect(33, 49, 2, 3);
        // Eyes
        ctx.fillStyle = '#3498db';
        ctx.fillRect(29, 58, 2, 2);
        ctx.fillRect(33, 58, 2, 2);
        
        // Door
        ctx.fillStyle = '#8b4513';
        ctx.fillRect(24, 100, 16, 28);
        ctx.fillStyle = '#5d4037';
        ctx.fillRect(26, 102, 12, 24);
        // Door handle
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
        
        // Dress details
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
        
        // Gems on crown
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
        // Door handle
        ctx.fillStyle = '#9b59b6';
        ctx.fillRect(42, 80, 3, 3);
        
        // Window
        ctx.fillStyle = '#1a1a3a';
        ctx.fillRect(20, 60, 10, 12);
        ctx.fillStyle = '#9b59b6';
        ctx.fillRect(21, 61, 8, 10);
        // Window glow
        ctx.fillStyle = '#bb8fce';
        ctx.fillRect(23, 63, 4, 6);
        
        // Cauldron outside
        ctx.fillStyle = '#2c2c2c';
        ctx.beginPath();
        ctx.ellipse(70, 90, 8, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        // Bubbles
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
        
        // Robe trim
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
        
        // Hat band
        ctx.fillStyle = '#9b59b6';
        ctx.fillRect(10, 10, 12, 2);
        
        // Hat buckle
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
        // Left bump
        ctx.beginPath();
        ctx.arc(8, 9, 6, 0, Math.PI * 2);
        ctx.fill();
        // Right bump
        ctx.beginPath();
        ctx.arc(16, 9, 6, 0, Math.PI * 2);
        ctx.fill();
        // Bottom point
        ctx.beginPath();
        ctx.moveTo(2, 10);
        ctx.lineTo(12, 22);
        ctx.lineTo(22, 10);
        ctx.fill();
        
        // Shine
        ctx.fillStyle = '#f48fb1';
        ctx.beginPath();
        ctx.arc(7, 7, 2, 0, Math.PI * 2);
        ctx.fill();
    });
}

// ============================================
// ENCOUNTER TYPE DEFINITIONS
// ============================================

// Initialize encounter textures
const encounterTextures = {
    princessTower: createPrincessTowerTexture(),
    princess: createPrincessTexture(),
    goldenSkeleton: createGoldenSkeletonTexture(),
    swordInStone: createSwordInStoneTexture(),
    witchHut: createWitchHutTexture(),
    witch: createWitchTexture(),
    heart: createHeartTexture()
};

const encounterTypes = [
    {
        name: 'princessTower',
        texture: 'princessTower',
        scale: [8, 16],
        guardType: 'goldenSkeleton',
        guardCount: 15,
        guardHealthMult: 2,
        cameraZoom: 2.5,
        reward: 'magnet',
        rewardText: '🧲 MAGNET UPGRADED!'
    },
    {
        name: 'swordInStone',
        texture: 'swordInStone',
        scale: [6, 8],
        guardType: 'goblin',
        guardCount: 20,
        guardHealthMult: 1,
        cameraZoom: 2.2,
        reward: 'swords',
        rewardText: '⚔️ SWORD ADDED!'
    },
    {
        name: 'witchHut',
        texture: 'witchHut',
        scale: [10, 12],
        guardType: 'wizard',
        guardCount: 20,
        guardHealthMult: 1,
        cameraZoom: 2.3,
        reward: 'boom',
        rewardText: '💥 BOOM UPGRADED!'
    }
];

function spawnEncounter() {
    console.log('Spawning encounter!');
    const angle = Math.random() * Math.PI * 2;
    const dist = CONFIG.enemySpawnRadius * 1.3;
    
    const x = gameState.player.position.x + Math.cos(angle) * dist;
    const z = gameState.player.position.z + Math.sin(angle) * dist;

    const typeIndex = Math.floor(Math.random() * encounterTypes.length);
    const type = encounterTypes[typeIndex];

    // Create main structure
    const material = new THREE.SpriteMaterial({
        map: encounterTextures[type.texture],
        transparent: true
    });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(type.scale[0], type.scale[1], 1);
    sprite.position.set(x, type.scale[1] / 2, z);
    scene.add(sprite);

    // Spawn guards around the structure
    const guards = [];
    for (let i = 0; i < type.guardCount; i++) {
        const guardAngle = (i / type.guardCount) * Math.PI * 2;
        const guardDist = 6 + Math.random() * 4;
        const gx = x + Math.cos(guardAngle) * guardDist;
        const gz = z + Math.sin(guardAngle) * guardDist;

        let guardTexture, guardScale;
        if (type.guardType === 'goldenSkeleton') {
            guardTexture = encounterTextures.goldenSkeleton;
            guardScale = [2.5, 4];
        } else if (type.guardType === 'goblin') {
            guardTexture = createGoblinTexture();
            guardScale = [2.5, 3.2];
        } else {
            guardTexture = createWizardTexture();
            guardScale = [2.5, 4];
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
            health: baseHealth * type.guardHealthMult,
            maxHealth: baseHealth * type.guardHealthMult,
            damage: CONFIG.enemyBaseDamage * (1 + gameState.player.level * 0.15),
            speed: 0.04,
            attackCooldown: 0,
            hitFlash: 0,
            isGuard: true
        };
        guards.push(guard);
    }
    gameState.encounterGuards = guards;

    gameState.encounter = {
        sprite,
        type,
        position: new THREE.Vector3(x, 0, z),
        cleared: false
    };
    
    gameState.targetCameraZoom = type.cameraZoom;
}

function updateEncounter() {
    if (!gameState.encounter) return;
    
    const encounter = gameState.encounter;
    
    // Update guards
    for (let i = gameState.encounterGuards.length - 1; i >= 0; i--) {
        const guard = gameState.encounterGuards[i];
        
        // Move towards player
        const dx = gameState.player.position.x - guard.sprite.position.x;
        const dz = gameState.player.position.z - guard.sprite.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);

        if (dist > 1.5) {
            guard.sprite.position.x += (dx / dist) * guard.speed;
            guard.sprite.position.z += (dz / dist) * guard.speed;
        } else if (guard.attackCooldown <= 0) {
            takeDamage(guard.damage);
            guard.attackCooldown = 60;
        }

        guard.attackCooldown = Math.max(0, guard.attackCooldown - 1);

        // Hit flash effect
        if (guard.hitFlash > 0) {
            guard.hitFlash--;
            guard.sprite.material.color.setHex(guard.hitFlash % 4 < 2 ? 0xffffff : 0xff0000);
        } else {
            guard.sprite.material.color.setHex(0xffffff);
        }

        // Remove if dead
        if (guard.health <= 0) {
            spawnXPOrb(guard.sprite.position.clone(), 15);
            spawnGoldOrb(guard.sprite.position.clone(), 5);
            scene.remove(guard.sprite);
            gameState.encounterGuards.splice(i, 1);
            gameState.kills++;
            document.getElementById('kills').textContent = gameState.kills;
        }
    }

    // Check if all guards defeated
    if (gameState.encounterGuards.length === 0 && !encounter.cleared) {
        encounter.cleared = true;
        
        // Show completion dialogue
        let dialogueText = '';
        let rewardSprite = null;
        
        if (encounter.type.name === 'princessTower') {
            dialogueText = 'Thank you for saving me! Here, take this magical magnet!';
            const material = new THREE.SpriteMaterial({
                map: encounterTextures.princess,
                transparent: true
            });
            rewardSprite = new THREE.Sprite(material);
            rewardSprite.scale.set(2.5, 4, 1);
        } else if (encounter.type.name === 'swordInStone') {
            dialogueText = 'You have proven worthy! The sword is yours!';
        } else if (encounter.type.name === 'witchHut') {
            dialogueText = 'My my! You cleared out those pests! Have a BOOM spell!';
            const material = new THREE.SpriteMaterial({
                map: encounterTextures.witch,
                transparent: true
            });
            rewardSprite = new THREE.Sprite(material);
            rewardSprite.scale.set(2.5, 4.5, 1);
        }
        
        if (rewardSprite) {
            rewardSprite.position.copy(encounter.sprite.position);
            scene.add(rewardSprite);
            setTimeout(() => scene.remove(rewardSprite), 3000);
        }
        
        showDialogue(dialogueText, encounter.type.rewardText);
        
        // Apply reward
        if (encounter.type.reward === 'magnet') {
            gameState.upgrades.magnet.level = Math.min(
                gameState.upgrades.magnet.level + 1,
                gameState.upgrades.magnet.maxLevel
            );
        } else if (encounter.type.reward === 'swords') {
            gameState.upgrades.swords.level = Math.min(
                gameState.upgrades.swords.level + 1,
                gameState.upgrades.swords.maxLevel
            );
        } else if (encounter.type.reward === 'boom') {
            gameState.upgrades.boom.level = Math.min(
                gameState.upgrades.boom.level + 1,
                gameState.upgrades.boom.maxLevel
            );
        }
        
        // Drop a heart
        const heartMaterial = new THREE.SpriteMaterial({
            map: encounterTextures.heart,
            transparent: true
        });
        const heartSprite = new THREE.Sprite(heartMaterial);
        heartSprite.scale.set(2, 2, 1);
        heartSprite.position.copy(encounter.sprite.position);
        heartSprite.position.y = 2;
        scene.add(heartSprite);
        
        gameState.hearts.push({
            sprite: heartSprite,
            position: heartSprite.position.clone()
        });
        
        // Clean up encounter
        setTimeout(() => {
            scene.remove(encounter.sprite);
            gameState.encounter = null;
            gameState.targetCameraZoom = 1;
        }, 3000);
    }
}

function damageEncounterGuard(guard, damage) {
    guard.health -= damage;
    guard.hitFlash = 10;
}
