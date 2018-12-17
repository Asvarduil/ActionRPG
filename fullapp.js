"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
/// <reference path="../node_modules/phaser-ce/typescript/phaser.d.ts" />
var Main;
(function (Main) {
    Main.gfxMagnification = 3;
    Main.game = null;
    Main.mapService = null;
    Main.stateService = null;
    Main.inputService = null;
    Main.cameraService = null;
    Main.menuFactory = null;
    Main.textFactory = null;
    Main.resourceGaugeFactory = null;
    Main.skillLineFactory = null;
    var App = /** @class */ (function () {
        function App() {
            this.game = null;
            this.game = new Phaser.Game(640, 480, Phaser.CANVAS, 'content', null, false, false);
            this.registerFactories();
            this.registerServices();
            this.registerStates();
            Main.game = this.game;
            this.appStart();
        }
        App.prototype.registerServices = function () {
            Main.stateService = new Main.Services.StateService(this.game);
            Main.inputService = new Main.Services.InputService();
            Main.mapService = new Main.Services.MapService();
            Main.cameraService = new Main.Services.SceneService();
        };
        App.prototype.registerFactories = function () {
            Main.menuFactory = new Main.UI.MenuFactory();
            Main.textFactory = new Main.UI.TextFactory();
            Main.resourceGaugeFactory = new Main.UI.ResourceGaugeFactory();
            Main.skillLineFactory = new Main.Mechanics.SkillLineFactory();
            // TODO: More factories.
        };
        App.prototype.registerStates = function () {
            Main.stateService.addState('init', Main.States.InitState);
            Main.stateService.addState('title', Main.States.TitleState);
            Main.stateService.addState('game', Main.States.GameState);
            Main.stateService.readyStates();
        };
        App.prototype.appStart = function () {
            Main.stateService.startFirstState();
        };
        return App;
    }());
    Main.App = App;
})(Main || (Main = {}));
window.onload = function () {
    var app = new Main.App();
};
var Main;
(function (Main) {
    var Entities;
    (function (Entities) {
        var EntityDirections;
        (function (EntityDirections) {
            EntityDirections[EntityDirections["DOWN"] = 0] = "DOWN";
            EntityDirections[EntityDirections["LEFT"] = 1] = "LEFT";
            EntityDirections[EntityDirections["RIGHT"] = 2] = "RIGHT";
            EntityDirections[EntityDirections["UP"] = 3] = "UP";
        })(EntityDirections = Entities.EntityDirections || (Entities.EntityDirections = {}));
        var Mob = /** @class */ (function () {
            function Mob(name, x, y, tileSize, imageKey, animationKey, spriteScale, enablePhysics, frameRate) {
                if (spriteScale === void 0) { spriteScale = 1; }
                if (enablePhysics === void 0) { enablePhysics = true; }
                if (frameRate === void 0) { frameRate = 8; }
                this.name = name;
                this.frameRate = frameRate;
                this.isActive = true;
                this.mobType = '';
                this.gameObject = null;
                this.direction = EntityDirections.DOWN;
                this.health = null;
                this.resources = [];
                this.stats = [];
                this.skillLines = [];
                this.skillLines = Main.skillLineFactory.generateSkillLines();
                // Default stats; these should be overwritten by each type of mob.
                this.health = new Main.Mechanics.HealthSystem(4, this.onHealed, this.onHurt, this.onDeath);
                // Create the actual game object for the mob.
                this.gameObject = Main.game.add.tileSprite(x, y, tileSize, tileSize, imageKey);
                this.gameObject.scale = new Phaser.Point(spriteScale, spriteScale);
                if (enablePhysics) {
                    this.readyPhysics();
                }
                // Bind animations...
                this.addAnimationsFromFile(animationKey);
            }
            Mob.prototype.readyPhysics = function () {
                Main.game.physics.enable(this.gameObject, Phaser.Physics.ARCADE);
                this.gameObject.anchor.set(0.5, 0.5);
                var body = this.body();
                body.bounce.setTo(0, 0);
                body.collideWorldBounds = true;
                body.allowDrag = true;
                body.angularDrag = 1.0;
            };
            Mob.prototype.body = function () {
                return this.gameObject.body;
            };
            Mob.prototype.onHealed = function () {
            };
            Mob.prototype.onHurt = function () {
            };
            Mob.prototype.onDeath = function () {
            };
            Mob.prototype.onUpdate = function (deltaTime) {
            };
            Mob.prototype.setStatsFromData = function (data, mobType) {
                if (mobType)
                    this.mobType = mobType;
                this.health = new Main.Mechanics.HealthSystem(data.maxHP, this.onHealed, this.onHurt, this.onDeath);
                for (var _i = 0, _a = data.resources; _i < _a.length; _i++) {
                    var current = _a[_i];
                    var loadedResource = new Main.Mechanics.Resource(current.name, current.max);
                    this.resources.push(loadedResource);
                }
                for (var _b = 0, _c = data.stats; _b < _c.length; _b++) {
                    var current = _c[_b];
                    var loadedStat = new Main.Mechanics.ModifiableStat(current.name, current.value);
                    this.stats.push(loadedStat);
                }
            };
            Mob.prototype.addAnimationsFromFile = function (jsonKey) {
                var data = Main.game.cache.getJSON(jsonKey);
                var result = [];
                for (var _i = 0, _a = data.animations; _i < _a.length; _i++) {
                    var current = _a[_i];
                    var newAnimation = this.addAnimation(current['key'], current['frames'], current['isLooped']);
                    result.push(newAnimation);
                }
                return result;
            };
            Mob.prototype.getStatByName = function (name) {
                return this.stats.getByName(name);
            };
            Mob.prototype.getSkillLineByName = function (name) {
                return this.skillLines.getByName(name);
            };
            Mob.prototype.getResourceByName = function (name) {
                return this.resources.getByName(name);
            };
            Mob.prototype.addXpForSkill = function (xp, skill) {
                var skillLine = this.getSkillLineByName(skill);
                if (!skillLine) {
                    console.error("Skill line " + skill + " does not exist.  Can't get XP for that line.");
                    return;
                }
                var preXpLevel = skillLine.level;
                skillLine.gainXP(xp);
                var postXpLevel = skillLine.level;
                if (postXpLevel > preXpLevel) {
                    if (this.onSkillUp)
                        this.onSkillUp(skillLine);
                }
            };
            Mob.prototype.getLevelForSkill = function (skill) {
                var skillLine = this.getSkillLineByName(skill);
                if (!skillLine) {
                    console.error("Skill line " + skill + " does not exist.  Can't get XP for that line.");
                    return -1;
                }
                return skillLine.level;
            };
            Mob.prototype.addAnimation = function (key, frames, isLooped) {
                if (isLooped === void 0) { isLooped = true; }
                return this.gameObject.animations.add(key, frames, this.frameRate, isLooped);
            };
            Mob.prototype.checkCollisionWith = function (other, onCollide) {
                var collidingObject;
                switch (other.constructor) {
                    case Mob:
                        collidingObject = (other).gameObject;
                        break;
                    case Main.Services.Map:
                        collidingObject = (other).collisionLayer;
                        break;
                    default:
                        collidingObject = other;
                        break;
                }
                Main.game.physics.arcade.collide(this.gameObject, collidingObject, onCollide);
            };
            return Mob;
        }());
        Entities.Mob = Mob;
    })(Entities = Main.Entities || (Main.Entities = {}));
})(Main || (Main = {}));
var Main;
(function (Main) {
    var Entities;
    (function (Entities) {
        var MobPool = /** @class */ (function () {
            function MobPool() {
                this.entityData = [];
                this.mobs = [];
                var rawData = Main.game.cache.getJSON('entity-stats');
                this.entityData = rawData['entities'];
            }
            MobPool.prototype.getByName = function (name) {
                return this.mobs.getByName(name);
            };
            MobPool.prototype.getFirstInactive = function () {
                var result = null;
                for (var _i = 0, _a = this.mobs; _i < _a.length; _i++) {
                    var current = _a[_i];
                    if (current.isActive)
                        continue;
                    result = current;
                    break;
                }
                return result;
            };
            MobPool.prototype.add = function (name, mobType, x, y, dontOverwriteExisting) {
                if (dontOverwriteExisting === void 0) { dontOverwriteExisting = false; }
                var existingEntry = this.getFirstInactive();
                if (!existingEntry || dontOverwriteExisting) {
                    var newEntry = this.create(name, mobType, x, y);
                    this.mobs.push(newEntry);
                    return newEntry;
                }
                else {
                    existingEntry = this.create(name, mobType, x, y);
                    return existingEntry;
                }
            };
            MobPool.prototype.create = function (name, mobType, x, y) {
                var data = this.entityData.getByName(mobType);
                var mobData = data;
                var statData = data;
                var newMob;
                if (!mobData.isPlayerCharacter) {
                    newMob = new Entities.Mob(name, x, y, mobData.tileSize, mobData.imageKey, mobData.animationKey, Main.gfxMagnification);
                    newMob.setStatsFromData(statData);
                }
                else {
                    newMob = new Entities.Player(name, x, y, mobData.tileSize, mobData.imageKey, mobData.animationKey, statData, Main.gfxMagnification);
                }
                return newMob;
            };
            MobPool.prototype.inactivate = function (mobName) {
                var mob = this.getByName(mobName);
                if (!mob) {
                    console.error("Can't inactivate mob " + mobName + ", as they don't exist in the pool.");
                    return;
                }
                mob.gameObject.alive = false;
            };
            MobPool.prototype.remove = function (mobName) {
                var removeMob = this.inactivate(mobName);
                var index = this.mobs.indexOf(removeMob);
                if (index === -1) {
                    console.error("Can't remove " + mobName + " from the mob pool as they're not registered in it.");
                    return;
                }
                this.mobs.splice(index, 1);
            };
            return MobPool;
        }());
        Entities.MobPool = MobPool;
    })(Entities = Main.Entities || (Main.Entities = {}));
})(Main || (Main = {}));
var Main;
(function (Main) {
    var Entities;
    (function (Entities) {
        var Player = /** @class */ (function (_super) {
            __extends(Player, _super);
            function Player(name, x, y, tileSize, imageKey, animationKey, statData, spriteScale) {
                var _this = _super.call(this, name, x, y, tileSize, imageKey, animationKey, spriteScale, true) || this;
                _this.setStatsFromData(statData);
                return _this;
            }
            Player.prototype.onUpdate = function (deltaTime) {
                var hAxis = Main.inputService.getAxis('horizontal').value();
                var vAxis = Main.inputService.getAxis('vertical').value();
                this.selectAnimation(hAxis, vAxis);
                this.performMovement(hAxis, vAxis, deltaTime);
                this.resourceRegeneration(deltaTime);
            };
            Player.prototype.selectAnimation = function (hAxis, vAxis) {
                if (hAxis === 0)
                    if (this.direction === Entities.EntityDirections.RIGHT)
                        this.gameObject.animations.play('idle-right');
                    else if (this.direction === Entities.EntityDirections.LEFT)
                        this.gameObject.animations.play('idle-left');
                if (vAxis === 0)
                    if (this.direction === Entities.EntityDirections.DOWN)
                        this.gameObject.animations.play('idle-down');
                    else if (this.direction === Entities.EntityDirections.UP)
                        this.gameObject.animations.play('idle-up');
                if (hAxis > 0) {
                    this.gameObject.animations.play('walk-right');
                    this.direction = Entities.EntityDirections.RIGHT;
                }
                else if (hAxis < 0) {
                    this.gameObject.animations.play('walk-left');
                    this.direction = Entities.EntityDirections.LEFT;
                }
                else if (vAxis > 0) {
                    this.gameObject.animations.play('walk-down');
                    this.direction = Entities.EntityDirections.DOWN;
                }
                else if (vAxis < 0) {
                    this.gameObject.animations.play('walk-up');
                    this.direction = Entities.EntityDirections.UP;
                }
            };
            Player.prototype.performMovement = function (hAxis, vAxis, deltaTime) {
                var physicsBody = this.body();
                var speed = this.getStatByName("speed");
                var dashCost = this.getStatByName("Dash Cost");
                var stamina = this.getResourceByName("Stamina");
                speed.clearModifiers();
                if (Main.inputService.getAxis('dash').isPressed()
                    && (hAxis !== 0 || vAxis !== 0)
                    && stamina.consume(dashCost.modifiedValue() * deltaTime)) {
                    speed.addScaledEffect(0.6);
                    this.addXpForSkill(deltaTime, "Conditioning");
                }
                // Since I'm using physics why aren't I colliding?
                physicsBody.velocity.x = hAxis * speed.modifiedValue();
                physicsBody.velocity.y = vAxis * speed.modifiedValue();
            };
            Player.prototype.resourceRegeneration = function (deltaTime) {
                var stamina = this.getResourceByName("Stamina");
                var staminaRegen = this.getStatByName("Stamina Regen");
                var conditioning = this.getLevelForSkill("Conditioning");
                stamina.gain(staminaRegen.modifiedValue() + ((conditioning / 1000) * 0.25) * deltaTime);
            };
            return Player;
        }(Entities.Mob));
        Entities.Player = Player;
    })(Entities = Main.Entities || (Main.Entities = {}));
})(Main || (Main = {}));
var Main;
(function (Main) {
    var Entities;
    (function (Entities) {
        var Trigger = /** @class */ (function () {
            function Trigger(x, y, width, height, onEnter) {
                this.x = x;
                this.y = y;
                this.width = width;
                this.height = height;
                this.onEnter = onEnter;
                this.gameObject = null;
                this.isTriggered = false;
                var spriteData = Main.game.add.bitmapData(width, height).fill(0, 0, 0, 0);
                this.gameObject = Main.game.add.sprite(x, y, spriteData);
                this.gameObject.scale = new Phaser.Point(Main.gfxMagnification, Main.gfxMagnification);
                this.readyPhysics();
            }
            Trigger.prototype.readyPhysics = function () {
                Main.game.physics.enable(this.gameObject, Phaser.Physics.ARCADE);
                this.gameObject.anchor.set(0.5, 0.5);
                var body = this.body();
                body.immovable = true;
                body.bounce.setTo(0);
                body.collideWorldBounds = true;
            };
            Trigger.prototype.body = function () {
                return this.gameObject.body;
            };
            Trigger.prototype.checkOverlapsWith = function (other) {
                var collidableObject;
                switch (other.constructor) {
                    case Entities.Mob:
                    case Entities.Player:
                        collidableObject = (other).gameObject;
                        break;
                    default:
                        collidableObject = other;
                        break;
                }
                // HACK: Have to use collision, overlap does not work.
                //this.isTriggered = game.physics.arcade.collide(this.gameObject, collidableObject, this.onEnter);
                this.isTriggered = Main.game.physics.arcade.overlap(this.gameObject, collidableObject, this.onEnter);
            };
            return Trigger;
        }());
        Entities.Trigger = Trigger;
    })(Entities = Main.Entities || (Main.Entities = {}));
})(Main || (Main = {}));
Array.prototype.getByName = function (name) {
    var result = null;
    for (var _i = 0, _a = this; _i < _a.length; _i++) {
        var current = _a[_i];
        if (current.name !== name)
            continue;
        result = current;
        break;
    }
    return result;
};
var Main;
(function (Main) {
    var Mechanics;
    (function (Mechanics) {
        var ModifiableStat = /** @class */ (function () {
            function ModifiableStat(name, value) {
                this.name = name;
                this.value = value;
                this.scalingModifier = 1.0;
                this.staticModifier = 0.0;
            }
            ModifiableStat.prototype.modifiedValue = function () {
                return (this.value * this.scalingModifier) + this.staticModifier;
            };
            ModifiableStat.prototype.addBaseValue = function (baseChange) {
                this.value += baseChange;
            };
            ModifiableStat.prototype.addScaledEffect = function (scalingChange) {
                this.scalingModifier += scalingChange;
            };
            ModifiableStat.prototype.addStaticEffect = function (staticChange) {
                this.scalingModifier += staticChange;
            };
            ModifiableStat.prototype.clearModifiers = function () {
                this.scalingModifier = 1.0;
                this.staticModifier = 0.0;
            };
            return ModifiableStat;
        }());
        Mechanics.ModifiableStat = ModifiableStat;
    })(Mechanics = Main.Mechanics || (Main.Mechanics = {}));
})(Main || (Main = {}));
var Main;
(function (Main) {
    var Mechanics;
    (function (Mechanics) {
        var Resource = /** @class */ (function () {
            function Resource(name, max) {
                this.name = name;
                this.max = max;
                this.current = this.max;
                this.workingMax = this.max;
            }
            Resource.prototype.hasEnough = function (amount) {
                return this.current >= amount;
            };
            Resource.prototype.gain = function (amount) {
                var preGain = this.current;
                this.current += amount;
                if (this.current > this.workingMax)
                    this.current = this.workingMax;
                var postGain = this.current;
                if (preGain != postGain)
                    this.fireChangeEvent();
            };
            Resource.prototype.consume = function (amount) {
                if (!this.hasEnough(amount))
                    return false;
                var preConsume = this.current;
                this.current -= amount;
                if (this.current <= 0)
                    this.current = 0;
                var postConsume = this.current;
                if (preConsume != postConsume)
                    this.fireChangeEvent();
                return true;
            };
            Resource.prototype.augment = function (amount) {
                this.workingMax += amount;
                if (this.workingMax > this.max)
                    this.workingMax = this.max;
            };
            Resource.prototype.diminish = function (amount) {
                this.workingMax -= amount;
                if (this.workingMax <= 0)
                    this.workingMax = 0;
                if (this.current >= this.workingMax) {
                    var preDiminish = this.current;
                    this.current = this.workingMax;
                    if (this.current < 0)
                        this.current = 0;
                    var postDiminish = this.current;
                    if (preDiminish != postDiminish)
                        this.fireChangeEvent();
                }
            };
            Resource.prototype.fireChangeEvent = function () {
                if (!this.onChange)
                    return false;
                this.onChange();
                return true;
            };
            return Resource;
        }());
        Mechanics.Resource = Resource;
        var HealthSystem = /** @class */ (function (_super) {
            __extends(HealthSystem, _super);
            function HealthSystem(max, onHealed, onHurt, onDeath) {
                var _this = _super.call(this, "Health", max) || this;
                _this.max = max;
                _this.onHealed = onHealed;
                _this.onHurt = onHurt;
                _this.onDeath = onDeath;
                return _this;
            }
            HealthSystem.prototype.gain = function (amount) {
                if (amount <= 0)
                    return;
                var preHealHP = this.current;
                this.current += amount;
                if (this.current >= this.workingMax)
                    this.current = this.workingMax;
                var postHealHP = this.current;
                if (preHealHP !== postHealHP) {
                    this.fireChangeEvent();
                    this.onHealed();
                }
            };
            HealthSystem.prototype.consume = function (amount) {
                if (amount <= 0)
                    return false;
                var preHurtHP = this.current;
                this.current -= amount;
                if (this.current <= 0)
                    this.current = 0;
                var postHurtHP = this.current;
                if (preHurtHP !== postHurtHP) {
                    this.fireChangeEvent();
                    this.onHurt();
                    this.checkForDeath();
                    return true;
                }
                return false;
            };
            HealthSystem.prototype.checkForDeath = function () {
                if (this.current >= 0)
                    return;
                this.onDeath();
            };
            HealthSystem.prototype.diminish = function (amount) {
                this.workingMax -= amount;
                if (this.workingMax > this.current) {
                    this.current = this.workingMax;
                    this.fireChangeEvent();
                    this.onHurt();
                    this.checkForDeath();
                }
            };
            return HealthSystem;
        }(Resource));
        Mechanics.HealthSystem = HealthSystem;
    })(Mechanics = Main.Mechanics || (Main.Mechanics = {}));
})(Main || (Main = {}));
var Main;
(function (Main) {
    var Mechanics;
    (function (Mechanics) {
        var SkillLineLevelupType;
        (function (SkillLineLevelupType) {
            SkillLineLevelupType[SkillLineLevelupType["LINEAR"] = 0] = "LINEAR";
            SkillLineLevelupType[SkillLineLevelupType["EXPONENTIAL"] = 1] = "EXPONENTIAL";
            SkillLineLevelupType[SkillLineLevelupType["LOGARITHMIC"] = 2] = "LOGARITHMIC";
        })(SkillLineLevelupType = Mechanics.SkillLineLevelupType || (Mechanics.SkillLineLevelupType = {}));
        var SkillLineLevelupData = /** @class */ (function () {
            // Programmer's Notes:
            // -------------------
            // Based on the levelup type, generate a
            // function to raise the amount of XP
            // required to raise a skill line.
            //
            // Linear: ttnl = base + (modifier * previous)
            // Exponential: ttnl = base + (previous ^ modifier)
            // Logarithmic: ttnl = base + previous LOG modifier
            function SkillLineLevelupData(type, base, modifier) {
                if (type === void 0) { type = SkillLineLevelupType.LINEAR; }
                if (base === void 0) { base = 1; }
                if (modifier === void 0) { modifier = 1; }
                this.type = type;
                this.base = base;
                this.modifier = modifier;
            }
            SkillLineLevelupData.prototype.generateNextXPTNL = function () {
                var _this = this;
                switch (this.type) {
                    case SkillLineLevelupType.LINEAR:
                        return function (previous) { return _this.base + (_this.modifier * previous); };
                    case SkillLineLevelupType.EXPONENTIAL:
                        return function (previous) { return _this.base + (previous ^ _this.modifier); };
                    case SkillLineLevelupType.LOGARITHMIC:
                        return function (previous) { return _this.base + (previous * Math.log(_this.modifier)); };
                    default:
                        console.error("Unexpected levelup type: " + this.type);
                        return function (previous) { return _this.base; };
                }
            };
            return SkillLineLevelupData;
        }());
        Mechanics.SkillLineLevelupData = SkillLineLevelupData;
        var SkillLine = /** @class */ (function () {
            function SkillLine(name, description, defaultLevel, defaultXp, defaultXpToNextLevel, levelupData, onLevelUp) {
                if (defaultLevel === void 0) { defaultLevel = 1; }
                if (defaultXp === void 0) { defaultXp = 0; }
                if (defaultXpToNextLevel === void 0) { defaultXpToNextLevel = 5; }
                if (levelupData === void 0) { levelupData = new SkillLineLevelupData(); }
                this.name = name;
                this.description = description;
                this.levelupData = levelupData;
                this.onLevelUp = onLevelUp;
                this.level = defaultLevel;
                this.xp = defaultXp;
                this.xpToNextLevel = defaultXpToNextLevel;
            }
            SkillLine.prototype.gainXP = function (amount) {
                this.xp += amount;
                if (this.xp >= this.xpToNextLevel) {
                    this.xp = this.xp - this.xpToNextLevel;
                    this.level++;
                    console.log(this.name + " has increased to " + this.level);
                    this.xpToNextLevel = this.levelupData.generateNextXPTNL()(this.xpToNextLevel);
                    if (this.onLevelUp)
                        this.onLevelUp();
                }
            };
            SkillLine.prototype.loseXP = function (amount) {
                this.xp -= amount;
                if (this.xp <= 0)
                    this.xp = 0;
            };
            SkillLine.prototype.clone = function () {
                var clone = new SkillLine(this.name, this.description, this.level, this.xp, this.xpToNextLevel, this.levelupData, this.onLevelUp);
                return clone;
            };
            return SkillLine;
        }());
        Mechanics.SkillLine = SkillLine;
        var SkillLineFactory = /** @class */ (function () {
            function SkillLineFactory() {
                this.skillLines = [];
            }
            SkillLineFactory.prototype.initialize = function () {
                var data = Main.game.cache.getJSON('skill-line-defaults');
                for (var _i = 0, _a = data['skillLines']; _i < _a.length; _i++) {
                    var current = _a[_i];
                    var newSkill = new SkillLine(current['name'], current['description'], current['defaultLevel'], current['defaultXp'], current['defaultXpToNextLevel']);
                    this.skillLines.push(newSkill);
                }
            };
            SkillLineFactory.prototype.generateSkillLines = function () {
                var clone = [];
                for (var _i = 0, _a = this.skillLines; _i < _a.length; _i++) {
                    var current = _a[_i];
                    clone.push(current.clone());
                }
                return clone;
            };
            return SkillLineFactory;
        }());
        Mechanics.SkillLineFactory = SkillLineFactory;
    })(Mechanics = Main.Mechanics || (Main.Mechanics = {}));
})(Main || (Main = {}));
var Main;
(function (Main) {
    var Services;
    (function (Services) {
        var InputAxis = /** @class */ (function () {
            function InputAxis(name, positiveBindings, negativeBindings) {
                if (name === void 0) { name = ''; }
                this.name = name;
                this.positiveBindings = positiveBindings;
                this.negativeBindings = negativeBindings;
            }
            InputAxis.prototype.value = function () {
                var result = 0;
                var checkBindingContribution = function (binding, addedValue) {
                    var contribution = 0;
                    if (binding instanceof Phaser.Key || binding instanceof Phaser.DeviceButton)
                        if (binding.isDown)
                            contribution = addedValue;
                    return contribution;
                };
                for (var _i = 0, _a = this.positiveBindings; _i < _a.length; _i++) {
                    var current = _a[_i];
                    result += checkBindingContribution(current, 1);
                }
                for (var _b = 0, _c = this.negativeBindings; _b < _c.length; _b++) {
                    var current = _c[_b];
                    result += checkBindingContribution(current, -1);
                }
                return result;
            };
            InputAxis.prototype.isPressed = function () {
                var result = false;
                var checkBindingState = function (binding) {
                    if (binding instanceof Phaser.Key || binding instanceof Phaser.DeviceButton)
                        return binding.isDown;
                    return false;
                };
                for (var _i = 0, _a = this.positiveBindings; _i < _a.length; _i++) {
                    var current = _a[_i];
                    result = result || checkBindingState(current);
                }
                for (var _b = 0, _c = this.negativeBindings; _b < _c.length; _b++) {
                    var current = _c[_b];
                    result = result || checkBindingState(current);
                }
                return result;
            };
            return InputAxis;
        }());
        Services.InputAxis = InputAxis;
        var InputService = /** @class */ (function () {
            function InputService() {
                this.axes = [];
            }
            // This should only be ran in state create() methods, so that game.input is
            // set up.
            InputService.prototype.initialize = function () {
                this.axes.length = 0; // Clear the axes...
                this.cursors = Main.game.input.keyboard.createCursorKeys();
                // TODO: ...Can we make a factory, and source these bindings from JSON?
                this.addAxis("horizontal", [this.cursors.right], [this.cursors.left]);
                this.addAxis("vertical", [this.cursors.down], [this.cursors.up]);
                this.addAxis("dash", [Main.game.input.keyboard.addKey(Phaser.KeyCode.SHIFT)]);
                this.addAxis("attack", [Main.game.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR)]);
                this.addAxis("block", [Main.game.input.keyboard.addKey(Phaser.KeyCode.TAB)]);
                this.addAxis("confirm", [Main.game.input.keyboard.addKey(Phaser.KeyCode.ENTER)]);
                this.addAxis("cancel", [Main.game.input.keyboard.addKey(Phaser.KeyCode.ESC)]);
                // this.pad = this.game.input.gamepad.pad1;
                // this.pad.addCallbacks(this, {
                //     onConnect: this.addGamepadSupport
                // });
            };
            // public addGamepadSupport(): void {
            //     const vAxis = this.getAxis('vertical');
            //     const hAxis = this.getAxis('horizontal');
            //     const dash = this.getAxis('dash');
            //     const confirm = this.getAxis('confirm');
            //     const cancel = this.getAxis('cancel');
            //     const attack = this.getAxis('attack');
            //     const block = this.getAxis('block');
            //     // TODO: Detect common gamepad types, and set the gamepad up as appropriate.
            //     const dpadUp = this.pad.getButton(Phaser.Gamepad.XBOX360_DPAD_UP);
            //     const dpadDown = this.pad.getButton(Phaser.Gamepad.XBOX360_DPAD_DOWN);
            //     const dpadLeft = this.pad.getButton(Phaser.Gamepad.XBOX360_DPAD_LEFT);
            //     const dpadRight = this.pad.getButton(Phaser.Gamepad.XBOX360_DPAD_RIGHT);
            //     const dpadA = this.pad.getButton(Phaser.Gamepad.XBOX360_A);
            //     const dpadB = this.pad.getButton(Phaser.Gamepad.XBOX360_A);
            //     const dpadX = this.pad.getButton(Phaser.Gamepad.XBOX360_A);
            //     const dpadY = this.pad.getButton(Phaser.Gamepad.XBOX360_A);
            //     const dpadL2 = this.pad.getButton(Phaser.Gamepad.XBOX360_LEFT_TRIGGER);
            //     const dpadR2 = this.pad.getButton(Phaser.Gamepad.XBOX360_RIGHT_TRIGGER);
            //     vAxis.positiveBindings.push(dpadUp);
            //     vAxis.negativeBindings.push(dpadDown);
            //     hAxis.positiveBindings.push(dpadRight);
            //     hAxis.negativeBindings.push(dpadLeft);
            //     dash.positiveBindings.push(dpadX);
            //     confirm.positiveBindings.push(dpadA);
            //     cancel.positiveBindings.push(dpadB);
            //     attack.positiveBindings.push(dpadR2);
            //     block.positiveBindings.push(dpadL2);
            // }
            InputService.prototype.addAxis = function (name, positiveBindings, negativeBindings) {
                if (this.getAxis(name) != null) {
                    console.error("Axis not registered - " + name + " is already registered in the Input Service.");
                    return;
                }
                if (!positiveBindings && !negativeBindings) {
                    console.error("Axis " + name + " requires at least a positive or a negative binding to be registered.");
                    return;
                }
                if (!positiveBindings)
                    positiveBindings = [];
                if (!negativeBindings)
                    negativeBindings = [];
                var axis = new InputAxis(name, positiveBindings, negativeBindings);
                this.axes.push(axis);
            };
            InputService.prototype.getAxis = function (name) {
                return (this.axes.getByName(name));
            };
            InputService.prototype.addHandlerToAxis = function (name, positiveHandler, negativeHandler) {
                if (!positiveHandler && !negativeHandler) {
                    console.error("addHandlerToAxis requires at least a positive or a negative control handler.");
                    return;
                }
                var axis = this.getAxis(name);
                if (axis == null) {
                    console.error("Axis " + axis.name + " has not been registered in the Input Service.");
                    return;
                }
                var bindHandler = function (control, handler) {
                    if (control instanceof Phaser.Key) {
                        control.onDown.add(positiveHandler);
                    }
                    else if (control instanceof Phaser.DeviceButton) {
                        control.onDown.add(positiveHandler);
                    }
                };
                if (positiveHandler) {
                    for (var _i = 0, _a = axis.positiveBindings; _i < _a.length; _i++) {
                        var current = _a[_i];
                        bindHandler(current, positiveHandler);
                    }
                }
                if (negativeHandler) {
                    for (var _b = 0, _c = axis.negativeBindings; _b < _c.length; _b++) {
                        var current = _c[_b];
                        bindHandler(current, negativeHandler);
                    }
                }
            };
            InputService.prototype.removeHandlerFromAxis = function (name, positiveHandler, negativeHandler) {
                if (!positiveHandler && !negativeHandler) {
                    console.error("addHandlerToAxis requires at least a positive or a negative control handler.");
                    return;
                }
                var axis = this.getAxis(name);
                if (axis == null) {
                    console.error("Axis " + axis.name + " has not been registered in the Input Service.");
                    return;
                }
                var removeHandler = function (control, handler) {
                    control.onDown.remove(handler);
                };
                if (positiveHandler)
                    for (var _i = 0, _a = axis.positiveBindings; _i < _a.length; _i++) {
                        var current = _a[_i];
                        removeHandler(current, positiveHandler);
                    }
                if (negativeHandler)
                    for (var _b = 0, _c = axis.negativeBindings; _b < _c.length; _b++) {
                        var current = _c[_b];
                        removeHandler(current, negativeHandler);
                    }
            };
            return InputService;
        }());
        Services.InputService = InputService;
    })(Services = Main.Services || (Main.Services = {}));
})(Main || (Main = {}));
var Main;
(function (Main) {
    var Services;
    (function (Services) {
        var Map = /** @class */ (function () {
            function Map(map, tileSetKey, tileSize, tileScale) {
                this.map = map;
                this.tileSetKey = tileSetKey;
                this.tileSize = tileSize;
                this.tileScale = tileScale;
                this.layers = [];
                this.collisionLayer = null;
                this.map.addTilesetImage(tileSetKey, tileSetKey, tileSize, tileSize);
                var firstLayer = this.addLayer(0);
                firstLayer.resizeWorld();
            }
            Map.prototype.addLayer = function (layerId) {
                var newLayer = this.map.createLayer(layerId);
                newLayer.setScale(this.tileScale, this.tileScale);
                this.layers.push(newLayer);
                return newLayer;
            };
            Map.prototype.addCollisionLayer = function (layerId, firstCollisionTileIndex, lastCollisionTileIndex, collisionGroup) {
                if (firstCollisionTileIndex === void 0) { firstCollisionTileIndex = 1; }
                if (lastCollisionTileIndex === void 0) { lastCollisionTileIndex = 1; }
                var collisionLayer = this.addLayer(layerId);
                this.map.setCollisionBetween(firstCollisionTileIndex, lastCollisionTileIndex, true, collisionLayer, true);
                if (collisionGroup) {
                    // Assume that a collision group exists,
                    // and that it has or will have physics and collisions
                    // set up on it.
                    collisionGroup.add(collisionLayer);
                }
                else {
                    Main.game.physics.enable(collisionLayer, Phaser.Physics.ARCADE);
                    var body = collisionLayer.body;
                    body.immovable = true;
                }
                this.collisionLayer = collisionLayer;
                return collisionLayer;
            };
            Map.prototype.checkCollisionWith = function (other, onCollide) {
                var collidingObject;
                switch (other.constructor) {
                    case Main.Entities.Mob:
                        collidingObject = other.gameObject;
                        break;
                    default:
                        collidingObject = other;
                        break;
                }
                Main.game.physics.arcade.collide(this.collisionLayer, collidingObject, onCollide);
            };
            return Map;
        }());
        Services.Map = Map;
        var MapService = /** @class */ (function () {
            function MapService() {
            }
            MapService.prototype.loadMap = function (key, collisionGroup) {
                var data = Main.game.cache.getJSON('map-data');
                var generationData = data['maps'].getByName(key);
                // Create the general map from the data...
                var tileSize = generationData["tileSize"];
                var map = Main.game.add.tilemap(generationData["key"], tileSize, tileSize);
                var result = new Map(map, generationData["tilesetKey"], tileSize, generationData["tileScale"]);
                // Build layers from data...
                for (var _i = 0, _a = generationData["layers"]; _i < _a.length; _i++) {
                    var currentLayer = _a[_i];
                    var index = currentLayer["index"];
                    switch (currentLayer["type"].toLowerCase()) {
                        case "collision":
                            console.log("Adding layer " + index + " as a collision layer...");
                            if (!currentLayer["layerName"])
                                result.addCollisionLayer(index, currentLayer["startCollisionIndex"], currentLayer["endCollisionIndex"], collisionGroup);
                            else
                                result.addCollisionLayer(currentLayer["layerName"], currentLayer["startCollisionIndex"], currentLayer["endCollisionIndex"], collisionGroup);
                            break;
                        default:
                            result.addLayer(index);
                            break;
                    }
                }
                return result;
            };
            return MapService;
        }());
        Services.MapService = MapService;
    })(Services = Main.Services || (Main.Services = {}));
})(Main || (Main = {}));
var Main;
(function (Main) {
    var Services;
    (function (Services) {
        var SceneService = /** @class */ (function () {
            function SceneService() {
            }
            SceneService.prototype.bindCamera = function (mob) {
                Main.game.camera.follow(mob.gameObject.animations.sprite);
            };
            SceneService.prototype.pan = function (x, y) {
                Main.game.camera.x += x;
                Main.game.camera.y += y;
            };
            SceneService.prototype.fadeOut = function (onComplete, durationMs, fadeColor) {
                if (durationMs === void 0) { durationMs = 1000; }
                if (fadeColor === void 0) { fadeColor = 0x000000; }
                var onNextFadeDone = function () {
                    onComplete();
                    Main.game.camera.onFadeComplete.removeAll();
                };
                Main.game.camera.onFadeComplete.add(onNextFadeDone);
                Main.game.camera.fade(fadeColor, durationMs);
            };
            SceneService.prototype.fadeIn = function (onComplete, durationMs, fadeColor) {
                if (durationMs === void 0) { durationMs = 1000; }
                if (fadeColor === void 0) { fadeColor = 0x000000; }
                var onNextFadeDone = function () {
                    onComplete();
                    Main.game.camera.onFlashComplete.removeAll();
                };
                Main.game.camera.onFlashComplete.add(onNextFadeDone);
                Main.game.camera.flash(fadeColor, durationMs);
            };
            return SceneService;
        }());
        Services.SceneService = SceneService;
    })(Services = Main.Services || (Main.Services = {}));
})(Main || (Main = {}));
var Main;
(function (Main) {
    var Services;
    (function (Services) {
        var StateService = /** @class */ (function () {
            function StateService(game) {
                this.game = game;
                this.states = [];
            }
            StateService.prototype.addState = function (key, state) {
                this.states.push({
                    key: key,
                    state: state
                });
            };
            StateService.prototype.readyStates = function () {
                for (var _i = 0, _a = this.states; _i < _a.length; _i++) {
                    var current = _a[_i];
                    this.game.state.add(current.key, current.state);
                }
            };
            StateService.prototype.startFirstState = function () {
                this.game.state.start(this.states[0].key);
            };
            StateService.prototype.load = function (state) {
                this.game.state.start(state, true, false);
            };
            StateService.prototype.overlay = function (state) {
                this.game.state.start(state, false, false);
            };
            return StateService;
        }());
        Services.StateService = StateService;
    })(Services = Main.Services || (Main.Services = {}));
})(Main || (Main = {}));
var Main;
(function (Main) {
    var States;
    (function (States) {
        var GameState = /** @class */ (function (_super) {
            __extends(GameState, _super);
            function GameState() {
                var _this = _super !== null && _super.apply(this, arguments) || this;
                // TODO: Entity pools
                // TODO: Global sprite scaling
                _this.map = null;
                _this.player = null;
                _this.layout = null;
                _this.mobPool = null;
                _this.npc = null;
                _this.testTrigger = null;
                return _this;
            }
            GameState.prototype.preload = function () {
            };
            GameState.prototype.create = function () {
                Main.game.physics.startSystem(Phaser.Physics.ARCADE);
                this.map = Main.mapService.loadMap('overworld');
                this.mobPool = new Main.Entities.MobPool();
                this.player = this.mobPool.add('player', 'player', 96, 96);
                this.npc = this.mobPool.add('npc', 'npc', 96, 192);
                this.testTrigger = new Main.Entities.Trigger(16, 192, 16, 32, this.onEnterSceneChangeTrigger.bind(this));
                this.layout = new Main.UI.Layout('game-ui');
                var skillUpLabel = (this.layout.getElement('skillUpLabel'));
                skillUpLabel.alpha = 0;
                skillUpLabel.fixedToCamera = true;
                this.player.onSkillUp = this.onPlayerSkillUp.bind(this);
                var healthGauge = this.layout.getElement('health');
                healthGauge.bindResource(this.player.health);
                this.player.health.onChange = this.onPlayerHealthChange.bind(this);
                var staminaGauge = (this.layout.getElement('stamina'));
                var playerStamina = this.player.getResourceByName("Stamina");
                staminaGauge.bindResource(playerStamina);
                playerStamina.onChange = this.onPlayerStaminaChange.bind(this);
                Main.cameraService.bindCamera(this.player);
                Main.cameraService.fadeIn(function () { });
            };
            GameState.prototype.onEnterSceneChangeTrigger = function () {
                if (this.testTrigger.isTriggered)
                    return;
                Main.cameraService.fadeOut(function () {
                    Main.stateService.load('title');
                });
            };
            GameState.prototype.onPlayerSkillUp = function (skill) {
                var skillUpLabel = (this.layout.getElement('skillUpLabel'));
                skillUpLabel.setText(skill.name + " has increased to " + skill.level);
                skillUpLabel.x = Main.game.canvas.width / 2 - skillUpLabel.width / 2;
                skillUpLabel.y = 100;
                skillUpLabel.fixedToCamera = true;
                Main.game.add.tween(skillUpLabel).to({ alpha: 1 }, 500, Phaser.Easing.Linear.None, true);
                Main.game.time.events.add(3000, function () {
                    Main.game.add.tween(skillUpLabel).to({ alpha: 0 }, 500, Phaser.Easing.Linear.None, true);
                });
            };
            GameState.prototype.onPlayerHealthChange = function () {
                var healthGauge = (this.layout.getElement('health'));
                healthGauge.update();
            };
            GameState.prototype.onPlayerStaminaChange = function () {
                var staminaGauge = (this.layout.getElement('stamina'));
                staminaGauge.update();
            };
            GameState.prototype.update = function () {
                var deltaTime = this.game.time.physicsElapsed;
                this.player.onUpdate(deltaTime);
                this.player.checkCollisionWith(this.npc);
                this.player.checkCollisionWith(this.map);
                this.npc.checkCollisionWith(this.map);
                this.testTrigger.checkOverlapsWith(this.player);
            };
            GameState.prototype.render = function () {
            };
            return GameState;
        }(Phaser.State));
        States.GameState = GameState;
    })(States = Main.States || (Main.States = {}));
})(Main || (Main = {}));
var Main;
(function (Main) {
    var States;
    (function (States) {
        var InitState = /** @class */ (function (_super) {
            __extends(InitState, _super);
            function InitState() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            InitState.prototype.preload = function () {
                Main.game.load.image('overworld-tiles', 'assets/images/tiles.png');
                Main.game.load.tilemap('test-map', 'assets/maps/test-3.json', null, Phaser.Tilemap.TILED_JSON);
                Main.game.load.spritesheet('human-template', 'assets/images/human-template.png', 16, 16);
                Main.game.load.spritesheet('hero-male', 'assets/images/hero-male.png', 16, 16);
                // Used by UI factories
                Main.game.load.json('ui-styles', 'assets/ui/styles.json');
                // Used to auto-create UIs
                Main.game.load.json('ui-layouts', 'assets/ui/layouts.json');
                // Used by the Map Service to build maps on the fly without hardcoding every single map.
                Main.game.load.json('map-data', 'assets/maps/map-data.json');
                // Used by the Entity system to set up mob stats, also without hardcoding every single one.
                Main.game.load.json('entity-stats', 'assets/entities/entities.json');
                // Used by various Mobs to set up their animations, again without hardcoding every single one.
                Main.game.load.json('template-animations', 'assets/animations/template-animations.json');
                Main.game.load.json('player-animations', 'assets/animations/player-animations.json');
                // Used by the Skill Line factory, to ensure that all mobs have the same skill lines.
                Main.game.load.json('skill-line-defaults', 'assets/mechanics/skill-line-defaults.json');
            };
            InitState.prototype.create = function () {
                // Ready any services...
                Main.inputService.initialize();
                // Ready any factories...
                Main.textFactory.initialize();
                Main.menuFactory.iniitalize();
                Main.resourceGaugeFactory.initialize();
                Main.skillLineFactory.initialize();
                // Actually start the game proper.
                Main.stateService.load('title');
            };
            InitState.prototype.update = function () {
            };
            return InitState;
        }(Phaser.State));
        States.InitState = InitState;
    })(States = Main.States || (Main.States = {}));
})(Main || (Main = {}));
var Main;
(function (Main) {
    var States;
    (function (States) {
        var TitleState = /** @class */ (function (_super) {
            __extends(TitleState, _super);
            function TitleState() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            TitleState.prototype.preload = function () {
            };
            TitleState.prototype.create = function () {
                Main.inputService.initialize();
                var toGameState = function () {
                    Main.cameraService.fadeOut(function () {
                        Main.stateService.load('game');
                    });
                };
                var data = new Main.UI.MenuData([
                    new Main.UI.MenuOptionData('New Game', 8, 240, toGameState),
                    new Main.UI.MenuOptionData('Continue', 8, 280, toGameState)
                ], 0);
                this.mainMenu = Main.menuFactory.create(data);
                this.mainMenu.grantKeyControl();
            };
            TitleState.prototype.update = function () {
            };
            TitleState.prototype.shutdown = function () {
                this.mainMenu.releaseKeyControl();
            };
            return TitleState;
        }(Phaser.State));
        States.TitleState = TitleState;
    })(States = Main.States || (Main.States = {}));
})(Main || (Main = {}));
var Main;
(function (Main) {
    var UI;
    (function (UI) {
        var ResourceGauge = /** @class */ (function () {
            function ResourceGauge(name, x, y, style, resource) {
                this.name = name;
                this.x = x;
                this.y = y;
                this.style = style;
                this.resource = resource;
                this.background = null;
                this.foreground = null;
                var bgData = Main.game.add.bitmapData(style.backgroundWidth, style.backgroundHeight);
                var fgData = Main.game.add.bitmapData(style.foregroundWidth, style.foregroundHeight);
                if (this.style.backgroundColor && this.style.foregroundColor) {
                    bgData.ctx.beginPath();
                    fgData.ctx.beginPath();
                    bgData.ctx.rect(0, 0, 2, 2);
                    fgData.ctx.rect(0, 0, 2, 2);
                    bgData.ctx.fillStyle = style.backgroundColor;
                    fgData.ctx.fillStyle = style.foregroundColor;
                    bgData.ctx.fill();
                    fgData.ctx.fill();
                    this.background = Main.game.add.sprite(this.x, this.y, bgData);
                    this.foreground = Main.game.add.sprite(this.x + this.style.foregroundOffsetX, this.y + this.style.foregroundOffsetY, fgData);
                }
                else if (this.style.backgroundImageKey && this.style.foregroundImageKey) {
                    this.background = Main.game.add.sprite(this.x, this.y, this.style.backgroundImageKey);
                    this.foreground = Main.game.add.sprite(this.x + this.style.foregroundOffsetX, this.y + this.style.foregroundOffsetY, this.style.foregroundImageKey);
                }
                else {
                    console.error("Gauge style " + this.style.name + " requires either a bg/fg image key or a bg/fg style.  This type of gauge will throw errors.");
                }
                this.background.fixedToCamera = true;
                this.foreground.fixedToCamera = true;
                var bgWidth = 0;
                var bgHeight = 0;
                var fgWidth = 0;
                var fgHeight = 0;
                if (this.style.isHorizontal) {
                    bgHeight = this.style.backgroundHeight;
                    bgWidth = this.style.backgroundWidth;
                    fgHeight = this.style.foregroundHeight;
                    var newWidth = void 0;
                    if (resource)
                        newWidth = (this.resource.current / this.resource.workingMax) * this.style.foregroundWidth;
                    else
                        newWidth = 0;
                    fgWidth = newWidth;
                }
                else {
                    bgWidth = this.style.backgroundWidth;
                    bgHeight = this.style.backgroundHeight;
                    fgWidth = this.style.foregroundWidth;
                    var newHeight = void 0;
                    if (resource)
                        newHeight = (this.resource.current / this.resource.workingMax) * this.style.foregroundHeight;
                    else
                        newHeight = 0;
                    fgHeight = newHeight;
                }
                this.background.scale.setTo(bgWidth, bgHeight);
                this.foreground.scale.setTo(fgWidth, fgHeight);
            }
            ResourceGauge.prototype.bindResource = function (resource) {
                this.resource = resource;
                this.update();
            };
            ResourceGauge.prototype.update = function () {
                if (this.style.isHorizontal) {
                    var newWidth = (this.resource.current / this.resource.workingMax) * this.style.foregroundWidth;
                    this.foreground.scale.x = newWidth;
                }
                else {
                    var newHeight = (this.resource.current / this.resource.workingMax) * this.style.foregroundHeight;
                    this.foreground.scale.y = newHeight;
                }
            };
            return ResourceGauge;
        }());
        UI.ResourceGauge = ResourceGauge;
        var ResourceGaugeFactory = /** @class */ (function () {
            function ResourceGaugeFactory() {
                this.styles = [];
            }
            ResourceGaugeFactory.prototype.initialize = function () {
                var data = Main.game.cache.getJSON('ui-styles');
                var gaugeData = data["gauges"];
                for (var _i = 0, gaugeData_1 = gaugeData; _i < gaugeData_1.length; _i++) {
                    var current = gaugeData_1[_i];
                    this.styles.push(current);
                }
            };
            ResourceGaugeFactory.prototype.create = function (name, x, y, style, resource) {
                var gaugeStyle;
                if (!style) {
                    if (this.styles.length === 0) {
                        console.error("Styles need to be added for Gauges.");
                        return null;
                    }
                    gaugeStyle = this.styles[0];
                }
                else {
                    gaugeStyle = this.styles.getByName(style);
                    if (gaugeStyle == null) {
                        console.error("There's no Gauge style named " + style);
                        console.error("" + JSON.stringify(this.styles));
                        return null;
                    }
                }
                var gauge = new ResourceGauge(name, x, y, gaugeStyle, resource);
                return gauge;
            };
            return ResourceGaugeFactory;
        }());
        UI.ResourceGaugeFactory = ResourceGaugeFactory;
    })(UI = Main.UI || (Main.UI = {}));
})(Main || (Main = {}));
var Main;
(function (Main) {
    var UI;
    (function (UI) {
        var Layout = /** @class */ (function () {
            function Layout(layoutKey) {
                this.elements = [];
                this.generateElements(layoutKey);
            }
            Layout.prototype.getElement = function (elementKey) {
                return this.elements.getByName(elementKey);
            };
            Layout.prototype.generateElements = function (layoutKey) {
                var layoutData = Main.game.cache.getJSON('ui-layouts');
                var chosenLayout = (layoutData['layouts'].getByName(layoutKey));
                if (chosenLayout == null) {
                    console.error("UI Layout " + layoutKey + " doesn't exist in the layouts JSON file.");
                    return;
                }
                for (var _i = 0, _a = chosenLayout.elements; _i < _a.length; _i++) {
                    var current = _a[_i];
                    switch (current.type) {
                        case "text":
                            var newText = Main.textFactory.create(current.name, current.x, current.y, current.style);
                            this.elements.push(newText);
                            break;
                        case "gauge":
                            var newGauge = Main.resourceGaugeFactory.create(current.name, current.x, current.y, current.style);
                            this.elements.push(newGauge);
                            break;
                        default:
                            console.warn("Element " + current.name + " won't be added, as element type " + current.type + " has no generation behavior defined.");
                            break;
                    }
                }
            };
            return Layout;
        }());
        UI.Layout = Layout;
    })(UI = Main.UI || (Main.UI = {}));
})(Main || (Main = {}));
var Main;
(function (Main) {
    var UI;
    (function (UI) {
        var MenuData = /** @class */ (function () {
            function MenuData(options, defaultOption) {
                this.options = options;
                this.defaultOption = defaultOption;
            }
            return MenuData;
        }());
        UI.MenuData = MenuData;
        var MenuOptionData = /** @class */ (function () {
            function MenuOptionData(optionText, screenX, screenY, onSelection, otherData) {
                if (optionText === void 0) { optionText = ''; }
                if (screenX === void 0) { screenX = 0; }
                if (screenY === void 0) { screenY = 0; }
                this.optionText = optionText;
                this.screenX = screenX;
                this.screenY = screenY;
                this.onSelection = onSelection;
                this.otherData = otherData;
            }
            return MenuOptionData;
        }());
        UI.MenuOptionData = MenuOptionData;
        var Menu = /** @class */ (function () {
            function Menu(data, labels, defaultStyle, selectedStyle, selectionDelay) {
                if (selectionDelay === void 0) { selectionDelay = 250; }
                this.data = data;
                this.labels = labels;
                this.defaultStyle = defaultStyle;
                this.selectedStyle = selectedStyle;
                this.selectionDelay = selectionDelay;
                this.isActive = true;
                this.currentOption = 0;
                this.currentOption = this.data.defaultOption;
            }
            Menu.prototype.pause = function () {
                this.isActive = false;
            };
            Menu.prototype.activate = function () {
                this.isActive = true;
            };
            Menu.prototype.nextOptionHandler = function () {
                if (!this.isActive)
                    return;
                this.selectNext();
            };
            Menu.prototype.lastOptionHandler = function () {
                if (!this.isActive)
                    return;
                this.selectPrevious();
            };
            Menu.prototype.confirmHandler = function () {
                if (!this.isActive)
                    return;
                this.executeSelection();
            };
            Menu.prototype.grantKeyControl = function () {
                Main.inputService.addHandlerToAxis("vertical", this.nextOptionHandler.bind(this), this.lastOptionHandler.bind(this));
                Main.inputService.addHandlerToAxis("confirm", this.confirmHandler.bind(this));
            };
            Menu.prototype.releaseKeyControl = function () {
                Main.inputService.removeHandlerFromAxis('vertical', this.nextOptionHandler, this.lastOptionHandler);
                Main.inputService.removeHandlerFromAxis('confirm', this.confirmHandler);
            };
            Menu.prototype.selectNext = function () {
                if (this.data.options.length <= 1)
                    return;
                this.clearSelectedOption();
                this.currentOption++;
                if (this.currentOption > this.data.options.length - 1)
                    this.currentOption = 0;
                this.setSelectedOption();
            };
            Menu.prototype.selectPrevious = function () {
                if (this.data.options.length <= 1)
                    return;
                console.log('selectPrevious called...');
                this.clearSelectedOption();
                this.currentOption--;
                if (this.currentOption < 0)
                    this.currentOption = this.data.options.length - 1;
                this.setSelectedOption();
            };
            Menu.prototype.executeSelection = function () {
                this.data.options[this.currentOption].onSelection();
            };
            Menu.prototype.clearSelectedOption = function () {
                this.labels[this.currentOption].setStyle(this.defaultStyle);
            };
            Menu.prototype.setSelectedOption = function () {
                this.labels[this.currentOption].setStyle(this.selectedStyle);
            };
            return Menu;
        }());
        UI.Menu = Menu;
        var MenuFactory = /** @class */ (function () {
            function MenuFactory() {
            }
            MenuFactory.prototype.iniitalize = function () {
                var data = Main.game.cache.getJSON('ui-styles');
                this.defaultStyle = data['menu']['default'];
                this.selectedStyle = data['menu']['selected'];
            };
            MenuFactory.prototype.create = function (menuData) {
                var menuLabels = [];
                var index = 0;
                for (var _i = 0, _a = menuData.options; _i < _a.length; _i++) {
                    var current = _a[_i];
                    var newText = Main.game.add.text(current.screenX, current.screenY, current.optionText);
                    newText.mousedown = current.onSelection;
                    // This causes the options to render with the appropriate styling.
                    if (index !== menuData.defaultOption)
                        newText.setStyle(this.defaultStyle);
                    else
                        newText.setStyle(this.selectedStyle);
                    menuLabels.push(newText);
                    index++;
                }
                var result = new Menu(menuData, menuLabels, this.defaultStyle, this.selectedStyle);
                return result;
            };
            return MenuFactory;
        }());
        UI.MenuFactory = MenuFactory;
    })(UI = Main.UI || (Main.UI = {}));
})(Main || (Main = {}));
var Main;
(function (Main) {
    var UI;
    (function (UI) {
        var TextFactory = /** @class */ (function () {
            function TextFactory() {
                this.styles = [];
            }
            TextFactory.prototype.initialize = function () {
                var data = Main.game.cache.getJSON('ui-styles');
                var styleData = data['text'];
                for (var _i = 0, styleData_1 = styleData; _i < styleData_1.length; _i++) {
                    var current = styleData_1[_i];
                    this.styles.push(current);
                }
            };
            TextFactory.prototype.create = function (name, x, y, text, style) {
                var styleData;
                if (!style) {
                    styleData = JSON.parse(JSON.stringify(this.styles[0]));
                }
                else {
                    styleData = JSON.parse(JSON.stringify(this.styles.getByName(style)));
                }
                var newText = Main.game.add.text(x, y, text, styleData);
                newText.name = name;
                this.setSecondaryStyleData(newText, styleData);
                return newText;
            };
            TextFactory.prototype.setSecondaryStyleData = function (text, style) {
                if (style["alpha"]) {
                    var alpha = style["alpha"];
                    text.alpha = alpha;
                }
            };
            return TextFactory;
        }());
        UI.TextFactory = TextFactory;
    })(UI = Main.UI || (Main.UI = {}));
})(Main || (Main = {}));
//# sourceMappingURL=fullapp.js.map