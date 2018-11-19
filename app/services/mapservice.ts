namespace Main.Services {
    export class Map {
        public layers: Phaser.TilemapLayer[] = [];

        public constructor(
            public map: Phaser.Tilemap,
            public tileSetKey: string,
            public tileSize: number,
            public tileScale: number
        ) {
            this.map.addTilesetImage(tileSetKey, tileSetKey, tileSize, tileSize);
            this.addLayer(0);
        }

        public addLayer(layerIndex: number): Phaser.TilemapLayer {
            const newLayer: Phaser.TilemapLayer = this.map.createLayer(layerIndex);
            newLayer.resizeWorld();
            newLayer.setScale(this.tileScale, this.tileScale);

            this.layers.push(newLayer);
            return newLayer;
        }

        public addCollisionLayer(
            layerIndex: number,
            firstCollisionTileIndex: number = 1, 
            lastCollisionTileIndex: number = 1
        ): Phaser.TilemapLayer {
            const collisionLayer: Phaser.TilemapLayer = this.map.createLayer(layerIndex);
            const collisionIndices: number[] = [];
            for (let index = firstCollisionTileIndex; index <= lastCollisionTileIndex; index++) {
                collisionIndices.push(index);
            }
            this.map.setCollision(firstCollisionTileIndex, true, collisionLayer, false);

            return collisionLayer;
        }
    }

    export class MapService {
        public constructor(
            public game: Phaser.Game
        ) {
        }

        public createMap(
            tileMapKey: string,
            tileSetKey: string,
            tileSize: number,
            tileScale: number = 1.0
        ): Map {
            const map: Phaser.Tilemap = this.game.add.tilemap(tileMapKey, tileSize, tileSize);
            const result: Map = new Map(map, tileSetKey, tileSize, tileScale);
            return result;
        }
    }
}