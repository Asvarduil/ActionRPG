"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
/// <reference path="../node_modules/phaser-ce/typescript/phaser.d.ts" />
var Main;
(function (Main) {
    Main.game = null;
    Main.mapService = null;
    Main.stateService = null;
    Main.inputService = null;
    Main.cameraService = null;
    Main.menuFactory = null;
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
            Main.cameraService = new Main.Services.CameraService();
        };
        App.prototype.registerFactories = function () {
            var defaultStyle = {
                fill: '#FFF'
            };
            var selectedStyle = {
                fill: '#FF3'
            };
            Main.menuFactory = new Main.UI.MenuFactory(defaultStyle, selectedStyle);
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
            function Mob(x, y, tileSize, imageKey, animationKey, spriteScale, enablePhysics, frameRate) {
                if (spriteScale === void 0) { spriteScale = 1; }
                if (enablePhysics === void 0) { enablePhysics = true; }
                if (frameRate === void 0) { frameRate = 8; }
                this.frameRate = frameRate;
                this.gameObject = null;
                this.direction = EntityDirections.DOWN;
                this.health = null;
                this.stats = [];
                this.skillLines = [];
                this.skillLines = Main.skillLineFactory.generateSkillLines();
                // Default stats; these should be overwritten by each type of mob.
                this.health = new Main.Mechanics.HealthSystem(4, this.onHealed, this.onHurt, this.onDeath);
                // Create the actual game object for the mob.
                this.gameObject = Main.game.add.tileSprite(x, y, tileSize, tileSize, imageKey);
                this.gameObject.scale = new Phaser.Point(spriteScale, spriteScale);
                if (enablePhysics) {
                    Main.game.physics.arcade.enable(this.gameObject);
                    this.gameObject.body.tilePadding.set(32, 32);
                }
                // Bind animations...
                this.addAnimationsFromFile(animationKey);
            }
            Mob.prototype.onHealed = function () {
            };
            Mob.prototype.onHurt = function () {
            };
            Mob.prototype.onDeath = function () {
            };
            Mob.prototype.onUpdate = function (deltaTime) {
            };
            Mob.prototype.setStatsFromFile = function (entityTypeName) {
                var data = Main.game.cache.getJSON('entity-stats');
                var entityData = data["entities"].getByName(entityTypeName);
                // Overwrite stats based on the data for the type of mob.
                this.health = new Main.Mechanics.HealthSystem(entityData["maxHP"], this.onHealed, this.onHurt, this.onDeath);
                for (var _i = 0, _a = entityData["stats"]; _i < _a.length; _i++) {
                    var current = _a[_i];
                    var loadedStat = new Main.Mechanics.ModifiableStat(current["name"], current["value"]);
                    this.stats.push(loadedStat);
                }
            };
            Mob.prototype.addAnimationsFromFile = function (jsonKey) {
                // Data should be pre-loaded with this.game.load.json().
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
            Mob.prototype.addAnimation = function (key, frames, isLooped) {
                if (isLooped === void 0) { isLooped = true; }
                return this.gameObject.animations.add(key, frames, this.frameRate, isLooped);
            };
            Mob.prototype.checkCollisionWith = function (other) {
                Main.game.physics.arcade.collide(this.gameObject, other);
            };
            Mob.prototype.checkMapCollisions = function (map) {
                for (var _i = 0, _a = map.collisionLayers; _i < _a.length; _i++) {
                    var collisionLayer = _a[_i];
                    this.checkCollisionWith(collisionLayer);
                }
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
        var Player = /** @class */ (function (_super) {
            __extends(Player, _super);
            function Player(x, y, imageKey, animationKey, spriteScale) {
                var _this = _super.call(this, x, y, 16, imageKey, animationKey, spriteScale, true) || this;
                _this.setStatsFromFile('player');
                return _this;
                // TODO: Overwrite the defaults with stats from the player state store instead.
                //       This will also cover skill line levels, and other things.
            }
            Player.prototype.onUpdate = function (deltaTime) {
                var hAxis = Main.inputService.getAxis('horizontal').value();
                var vAxis = Main.inputService.getAxis('vertical').value();
                this.selectAnimation(hAxis, vAxis);
                this.performMovement(hAxis, vAxis, deltaTime);
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
                if (vAxis > 0) {
                    this.gameObject.animations.play('walk-down');
                    this.direction = Entities.EntityDirections.DOWN;
                }
                else if (vAxis < 0) {
                    this.gameObject.animations.play('walk-up');
                    this.direction = Entities.EntityDirections.UP;
                }
            };
            Player.prototype.performMovement = function (hAxis, vAxis, deltaTime) {
                var physicsBody = this.gameObject.body;
                var speed = this.getStatByName("speed");
                var conditioningSkill = this.getSkillLineByName("conditioning");
                speed.clearModifiers();
                if (Main.inputService.getAxis('dash').isPressed()
                    && (hAxis !== 0 || vAxis !== 0)) {
                    speed.addScaledEffect(0.6);
                    conditioningSkill.gainXP(deltaTime);
                }
                physicsBody.velocity.x = hAxis * speed.modifiedValue();
                physicsBody.velocity.y = vAxis * speed.modifiedValue();
            };
            return Player;
        }(Entities.Mob));
        Entities.Player = Player;
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
        var HealthSystem = /** @class */ (function () {
            function HealthSystem(maxHP, onHealed, onHurt, onDeath) {
                this.maxHP = maxHP;
                this.onHealed = onHealed;
                this.onHurt = onHurt;
                this.onDeath = onDeath;
                this.HP = this.maxHP;
            }
            HealthSystem.prototype.heal = function (amount) {
                if (amount <= 0)
                    return;
                var preHealHP = this.HP;
                this.HP += amount;
                if (this.HP >= this.workingMaxHP)
                    this.HP = this.workingMaxHP;
                var postHealHP = this.HP;
                if (preHealHP !== postHealHP)
                    this.onHealed();
            };
            HealthSystem.prototype.harm = function (amount) {
                if (amount <= 0)
                    return;
                var preHurtHP = this.HP;
                this.HP -= amount;
                if (this.HP <= 0)
                    this.HP = 0;
                var postHurtHP = this.HP;
                if (preHurtHP !== postHurtHP) {
                    this.onHurt();
                    this.checkForDeath();
                }
            };
            HealthSystem.prototype.checkForDeath = function () {
                if (this.HP >= 0)
                    return;
                this.onDeath();
            };
            HealthSystem.prototype.augment = function (amount) {
                this.workingMaxHP += amount;
                if (this.workingMaxHP > this.maxHP)
                    this.workingMaxHP = this.maxHP;
            };
            HealthSystem.prototype.diminish = function (amount) {
                this.workingMaxHP -= amount;
                if (this.workingMaxHP > this.HP) {
                    this.HP = this.workingMaxHP;
                    this.onHurt();
                    this.checkForDeath();
                }
            };
            return HealthSystem;
        }());
        Mechanics.HealthSystem = HealthSystem;
    })(Mechanics = Main.Mechanics || (Main.Mechanics = {}));
})(Main || (Main = {}));
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
        var SkillLine = /** @class */ (function () {
            function SkillLine(name, description, defaultLevel, defaultXp, defaultXpToNextLevel, onLevelUp) {
                if (defaultLevel === void 0) { defaultLevel = 1; }
                if (defaultXp === void 0) { defaultXp = 0; }
                if (defaultXpToNextLevel === void 0) { defaultXpToNextLevel = 5; }
                this.name = name;
                this.description = description;
                this.onLevelUp = onLevelUp;
                this.level = defaultLevel;
                this.xp = defaultXp;
                this.xpToNextLevel = defaultXpToNextLevel;
            }
            SkillLine.prototype.gainXP = function (amount) {
                this.xp += amount;
                if (this.xp >= this.xpToNextLevel) {
                    this.xp = this.xp - this.xpToNextLevel;
                    this.onLevelUp();
                }
            };
            SkillLine.prototype.loseXP = function (amount) {
                this.xp -= amount;
                if (this.xp <= 0)
                    this.xp = 0;
            };
            SkillLine.prototype.clone = function () {
                var clone = new SkillLine(this.name, this.description, this.level, this.xp, this.xpToNextLevel, this.onLevelUp);
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
        var CameraService = /** @class */ (function () {
            function CameraService() {
            }
            CameraService.prototype.bindCamera = function (mob) {
                Main.game.camera.follow(mob.gameObject.animations.sprite);
            };
            CameraService.prototype.pan = function (x, y) {
                Main.game.camera.x += x;
                Main.game.camera.y += y;
            };
            CameraService.prototype.fadeOut = function (onComplete, durationMs, fadeColor) {
                if (durationMs === void 0) { durationMs = 1000; }
                if (fadeColor === void 0) { fadeColor = 0x000000; }
                var onNextFadeDone = function () {
                    onComplete();
                    Main.game.camera.onFadeComplete.removeAll();
                };
                Main.game.camera.onFadeComplete.add(onNextFadeDone);
                Main.game.camera.fade(fadeColor, durationMs);
            };
            CameraService.prototype.fadeIn = function (onComplete, durationMs, fadeColor) {
                if (durationMs === void 0) { durationMs = 1000; }
                if (fadeColor === void 0) { fadeColor = 0x000000; }
                var onNextFadeDone = function () {
                    onComplete();
                    Main.game.camera.onFlashComplete.removeAll();
                };
                Main.game.camera.onFlashComplete.add(onNextFadeDone);
                Main.game.camera.flash(fadeColor, durationMs);
            };
            return CameraService;
        }());
        Services.CameraService = CameraService;
    })(Services = Main.Services || (Main.Services = {}));
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
                this.collisionLayers = [];
                this.map.addTilesetImage(tileSetKey, tileSetKey, tileSize, tileSize);
                var firstLayer = this.addLayer(0);
                firstLayer.resizeWorld();
            }
            Map.prototype.addLayer = function (layerIndex) {
                var newLayer = this.map.createLayer(layerIndex);
                newLayer.setScale(this.tileScale, this.tileScale);
                this.layers.push(newLayer);
                return newLayer;
            };
            Map.prototype.addCollisionLayer = function (layerIndex, firstCollisionTileIndex, lastCollisionTileIndex) {
                if (firstCollisionTileIndex === void 0) { firstCollisionTileIndex = 1; }
                if (lastCollisionTileIndex === void 0) { lastCollisionTileIndex = 1; }
                var collisionLayer = this.map.createLayer(layerIndex);
                collisionLayer.setScale(this.tileScale, this.tileScale);
                Main.game.add.existing(collisionLayer);
                Main.game.physics.arcade.enable(collisionLayer);
                this.map.setCollisionBetween(firstCollisionTileIndex, lastCollisionTileIndex, true, layerIndex);
                this.layers.push(collisionLayer);
                this.collisionLayers.push(collisionLayer);
                return collisionLayer;
            };
            return Map;
        }());
        Services.Map = Map;
        var MapService = /** @class */ (function () {
            function MapService() {
            }
            MapService.prototype.loadMap = function (key) {
                var data = Main.game.cache.getJSON('map-data');
                var generationData = data['maps'].getByName(key);
                // Create the general map from the data...
                var tileSize = generationData["tileSize"];
                var map = Main.game.add.tilemap(generationData["key"], tileSize, tileSize);
                var result = new Map(map, generationData["tilesetKey"], tileSize, generationData["tileScale"]);
                // Build layers from data...
                for (var _i = 0, _a = generationData["layers"]; _i < _a.length; _i++) {
                    var currentLayer = _a[_i];
                    if (currentLayer["type"]) {
                        if (currentLayer["type"].toLowerCase() == "collision") {
                            console.log("Adding layer " + currentLayer["index"] + " as a collision layer...");
                            result.addCollisionLayer(currentLayer["index"], currentLayer["startCollisionIndex"], currentLayer["endCollisionIndex"]);
                        }
                    }
                    else {
                        result.addLayer(currentLayer["index"]);
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
                _this.map = null;
                _this.cursors = null;
                _this.player = null;
                return _this;
            }
            GameState.prototype.preload = function () {
            };
            GameState.prototype.create = function () {
                this.map = Main.mapService.loadMap('overworld');
                this.player = new Main.Entities.Player(96, 96, 'hero-male', 'template-animations', 3);
                Main.cameraService.bindCamera(this.player);
                Main.cameraService.fadeIn(function () { });
                Main.game.physics.startSystem(Phaser.Physics.ARCADE);
            };
            GameState.prototype.update = function () {
                var deltaTime = this.game.time.physicsElapsed;
                Main.game.physics.arcade.TILE_BIAS = 90;
                this.player.onUpdate(deltaTime);
                this.player.checkMapCollisions(this.map);
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
            function MenuFactory(defaultStyle, selectedStyle) {
                this.defaultStyle = defaultStyle;
                this.selectedStyle = selectedStyle;
            }
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
//# sourceMappingURL=fullapp.js.map