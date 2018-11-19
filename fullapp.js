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
    Main.mapService = null;
    Main.stateService = null;
    Main.inputService = null;
    Main.menuFactory = null;
    var App = /** @class */ (function () {
        function App() {
            this.game = null;
            this.game = new Phaser.Game(640, 480, Phaser.CANVAS, 'content');
            this.registerFactories();
            this.registerServices();
            this.registerStates();
            this.appStart();
        }
        App.prototype.registerServices = function () {
            Main.mapService = new Main.Services.MapService(this.game);
            Main.stateService = new Main.Services.StateService(this.game);
            Main.inputService = new Main.Services.InputService(this.game);
        };
        App.prototype.registerFactories = function () {
            var defaultStyle = {
                fill: '#FFF'
            };
            var selectedStyle = {
                fill: '#FF3'
            };
            Main.menuFactory = new Main.UI.MenuFactory(this.game, defaultStyle, selectedStyle);
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
    var Services;
    (function (Services) {
        var InputAxis = /** @class */ (function () {
            function InputAxis(name, positiveBindings, negativeBindings) {
                if (name === void 0) { name = ''; }
                this.name = name;
                this.positiveBindings = positiveBindings;
                this.negativeBindings = negativeBindings;
            }
            return InputAxis;
        }());
        Services.InputAxis = InputAxis;
        var InputService = /** @class */ (function () {
            function InputService(game) {
                this.game = game;
                this.axes = [];
            }
            // This should only be ran in state create() methods, so that game.input is
            // set up.
            InputService.prototype.initialize = function () {
                this.axes.length = 0; // Clear the axes...
                this.cursors = this.game.input.keyboard.createCursorKeys();
                this.addAxis("horizontal", [this.cursors.right], [this.cursors.left]);
                this.addAxis("vertical", [this.cursors.down], [this.cursors.up]);
                this.addAxis("confirm", [this.game.input.keyboard.addKey(Phaser.KeyCode.ENTER)], []);
                this.addAxis("cancel", [this.game.input.keyboard.addKey(Phaser.KeyCode.ESC)], []);
            };
            InputService.prototype.addAxis = function (name, positiveBindings, negativeBindings) {
                if (this.getAxis(name) != null) {
                    console.error("Axis not registered - " + name + " is already registered in the Input Service.");
                    return;
                }
                var axis = new InputAxis(name, positiveBindings, negativeBindings);
                this.axes.push(axis);
            };
            InputService.prototype.getAxis = function (name) {
                var result = null;
                for (var _i = 0, _a = this.axes; _i < _a.length; _i++) {
                    var current = _a[_i];
                    if (current.name !== name)
                        continue;
                    result = current;
                    break;
                }
                return result;
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
                this.map.addTilesetImage(tileSetKey, tileSetKey, tileSize, tileSize);
                this.addLayer(0);
            }
            Map.prototype.addLayer = function (layerIndex) {
                var newLayer = this.map.createLayer(layerIndex);
                newLayer.resizeWorld();
                newLayer.setScale(this.tileScale, this.tileScale);
                this.layers.push(newLayer);
                return newLayer;
            };
            Map.prototype.addCollisionLayer = function (layerIndex, firstCollisionTileIndex, lastCollisionTileIndex) {
                if (firstCollisionTileIndex === void 0) { firstCollisionTileIndex = 1; }
                if (lastCollisionTileIndex === void 0) { lastCollisionTileIndex = 1; }
                var collisionLayer = this.map.createLayer(layerIndex);
                var collisionIndices = [];
                for (var index = firstCollisionTileIndex; index <= lastCollisionTileIndex; index++) {
                    collisionIndices.push(index);
                }
                this.map.setCollision(firstCollisionTileIndex, true, collisionLayer, false);
                return collisionLayer;
            };
            return Map;
        }());
        Services.Map = Map;
        var MapService = /** @class */ (function () {
            function MapService(game) {
                this.game = game;
            }
            MapService.prototype.createMap = function (tileMapKey, tileSetKey, tileSize, tileScale) {
                if (tileScale === void 0) { tileScale = 1.0; }
                var map = this.game.add.tilemap(tileMapKey, tileSize, tileSize);
                var result = new Map(map, tileSetKey, tileSize, tileScale);
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
                if (game === void 0) { game = null; }
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
                _this.cursors = null;
                return _this;
            }
            GameState.prototype.preload = function () {
                this.game.load.image('overworld-tiles', 'assets/images/tiles.png');
                this.game.load.tilemap('test-map', 'assets/maps/overworld.csv', null, Phaser.Tilemap.CSV);
            };
            GameState.prototype.create = function () {
                var _this = this;
                Main.inputService.initialize();
                Main.mapService.createMap('test-map', 'overworld-tiles', 16, 3);
                this.game.physics.startSystem(Phaser.Physics.ARCADE);
                Main.inputService.addHandlerToAxis('horizontal', function () {
                    _this.game.camera.x++;
                }, function () {
                    _this.game.camera.x--;
                });
                Main.inputService.addHandlerToAxis('vertical', function () {
                    _this.game.camera.y++;
                }, function () {
                    _this.game.camera.y--;
                });
            };
            GameState.prototype.update = function () {
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
            };
            InitState.prototype.create = function () {
                Main.inputService.initialize();
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
                    Main.stateService.load('game');
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
            function MenuFactory(game, defaultStyle, selectedStyle) {
                this.game = game;
                this.defaultStyle = defaultStyle;
                this.selectedStyle = selectedStyle;
            }
            MenuFactory.prototype.create = function (menuData) {
                var menuLabels = [];
                var index = 0;
                for (var _i = 0, _a = menuData.options; _i < _a.length; _i++) {
                    var current = _a[_i];
                    var newText = this.game.add.text(current.screenX, current.screenY, current.optionText);
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