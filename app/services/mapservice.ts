namespace Main.Services {
    export class MapService {
        public constructor(
            public game: Phaser.Game
        ) {
        }

        public createMap(
            tileMapKey: string,
            tileSetKey: string,
            tileSize: number,
            mapTileWidth: number,
            mapTileHeight: number,
            aspectScale: number
        ): void {
            const map = this.game.add.tilemap(tileMapKey, tileSize, tileSize);
            map.addTilesetImage(tileSetKey, 'tiles', tileSize, tileSize);
            const layer = map.createLayer(0);
            layer.resizeWorld();
            layer.setScale(aspectScale, aspectScale);
        }
    }
}