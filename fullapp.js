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
        };
        App.prototype.registerFactories = function () {
            var defaultStyle = {
                fill: '#FFF'
            };
            var selectedStyle = {
                fill: '#FF3'
            };
            Main.menuFactory = new Main.UI.MenuFactory(this.game, defaultStyle, selectedStyle);
        };
        App.prototype.registerStates = function () {
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
        var MapService = /** @class */ (function () {
            function MapService(game) {
                this.game = game;
            }
            MapService.prototype.createMap = function (tileMapKey, tileSetKey, tileSize, mapTileWidth, mapTileHeight, aspectScale) {
                var map = this.game.add.tilemap(tileMapKey, tileSize, tileSize);
                map.addTilesetImage(tileSetKey, 'tiles', tileSize, tileSize);
                var layer = map.createLayer(0);
                layer.resizeWorld();
                layer.setScale(aspectScale, aspectScale);
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
                this.game.load.image('tiles', 'assets/images/tiles.png');
                this.game.load.tilemap('test-map', 'assets/maps/overworld.csv', null, Phaser.Tilemap.CSV);
            };
            GameState.prototype.create = function () {
                Main.mapService.createMap('test-map', 'tiles', 16, 4, 4, 3);
                this.game.physics.startSystem(Phaser.Physics.ARCADE);
                this.cursors = this.game.input.keyboard.createCursorKeys();
            };
            GameState.prototype.update = function () {
                if (this.cursors.left.isDown)
                    this.game.camera.x--;
                else if (this.cursors.right.isDown)
                    this.game.camera.x++;
                if (this.cursors.up.isDown)
                    this.game.camera.y--;
                else if (this.cursors.down.isDown)
                    this.game.camera.y++;
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
        var TitleState = /** @class */ (function (_super) {
            __extends(TitleState, _super);
            function TitleState() {
                return _super.call(this) || this;
            }
            TitleState.prototype.preload = function () {
            };
            TitleState.prototype.create = function () {
                var _this = this;
                var toGameState = function () {
                    console.log('Pressed!');
                    Main.stateService.load('game');
                };
                var data = new Main.UI.MenuData([
                    new Main.UI.MenuOptionData('New Game', 8, 240, toGameState),
                    new Main.UI.MenuOptionData('Continue', 8, 280, toGameState)
                ], 0);
                this.mainMenu = Main.menuFactory.create(data);
                this.cursors = this.game.input.keyboard.createCursorKeys();
                this.cursors.down
                    .onDown.add(function () {
                    _this.mainMenu.selectNext();
                });
                this.cursors.up
                    .onDown.add(function () {
                    _this.mainMenu.selectPrevious();
                });
                this.game.input.keyboard.addKey(Phaser.KeyCode.ENTER)
                    .onDown.add(function () {
                    _this.mainMenu.executeSelection();
                });
            };
            TitleState.prototype.update = function () {
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
                this.currentOption = 0;
                this.currentOption = this.data.defaultOption;
            }
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
                for (var _i = 0, _a = menuData.options; _i < _a.length; _i++) {
                    var current = _a[_i];
                    var newText = this.game.add.text(current.screenX, current.screenY, current.optionText);
                    newText.mousedown = current.onSelection;
                    menuLabels.push(newText);
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