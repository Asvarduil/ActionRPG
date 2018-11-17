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
    var App = /** @class */ (function () {
        function App() {
            this.game = null;
            this.game = new Phaser.Game(640, 480, Phaser.CANVAS, 'content');
            Main.mapService = new Main.Services.MapService(this.game);
            this.registerStates();
            Main.stateService.startFirstState();
        }
        App.prototype.registerStates = function () {
            Main.stateService = new Main.Services.StateService(this.game);
            Main.stateService.addState('game', Main.States.GameState);
            Main.stateService.readyStates();
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
//# sourceMappingURL=fullapp.js.map