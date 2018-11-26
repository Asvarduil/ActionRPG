namespace Main.Services {
    export class Map {
        public layers: Phaser.TilemapLayer[] = [];
        public collisionLayers: Phaser.TilemapLayer[] = [];

        public constructor(
            public map: Phaser.Tilemap,
            public tileSetKey: string,
            public tileSize: number,
            public tileScale: number
        ) {
            this.map.addTilesetImage(tileSetKey, tileSetKey, tileSize, tileSize);
            const firstLayer = this.addLayer(0);
            firstLayer.resizeWorld();
        }

        public addLayer(layerIndex: number): Phaser.TilemapLayer {
            const newLayer: Phaser.TilemapLayer = this.map.createLayer(layerIndex);
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
            collisionLayer.setScale(this.tileScale, this.tileScale);

            game.add.existing(collisionLayer);
            // Physics have to be enabled for a collision layer to work...right?
            game.physics.arcade.enable(collisionLayer);

            this.map.setCollisionBetween(
                firstCollisionTileIndex, 
                lastCollisionTileIndex, 
                true, 
                collisionLayer
            );
            
            this.layers.push(collisionLayer);
            this.collisionLayers.push(collisionLayer);

            return collisionLayer;
        }
    }

    export class MapService {
        public constructor(
        ) {
        }

        public loadMap(
            key: string
        ): Map {
            const data: any = game.cache.getJSON('map-data');
            const generationData = data['maps'].getByName(key);

            // Create the general map from the data...
            const tileSize: number = generationData["tileSize"];
            const map: Phaser.Tilemap = game.add.tilemap(generationData["key"], tileSize, tileSize);
            const result: Map = new Map(map, generationData["tilesetKey"], tileSize, generationData["tileScale"]);

            // Build layers from data...
            for (let currentLayer of generationData["layers"]) {
                const index: number = currentLayer["index"];
                if (currentLayer["type"]) {
                    if (currentLayer["type"].toLowerCase() == "collision") {
                        console.log(`Adding layer ${index} as a collision layer...`);
                        result.addCollisionLayer(index, currentLayer["startCollisionIndex"], currentLayer["endCollisionIndex"]);
                    }
                } else {
                    result.addLayer(index);
                }
            }
            
            return result;
        }
    }
}