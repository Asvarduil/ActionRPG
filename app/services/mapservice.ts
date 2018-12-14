namespace Main.Services {
    export class Map {
        public layers: Phaser.TilemapLayer[] = [];
        public collisionLayer: Phaser.TilemapLayer = null;

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

        public addLayer(layerId: number | string): Phaser.TilemapLayer {
            const newLayer: Phaser.TilemapLayer = this.map.createLayer(layerId);
            newLayer.setScale(this.tileScale, this.tileScale);

            this.layers.push(newLayer);
            return newLayer;
        }

        public addCollisionLayer(
            layerId: number | string,
            firstCollisionTileIndex: number = 1, 
            lastCollisionTileIndex: number = 1,
            collisionGroup?: Phaser.Group
        ): Phaser.TilemapLayer {
            const collisionLayer: Phaser.TilemapLayer = this.addLayer(layerId);
            this.map.setCollisionBetween(
                firstCollisionTileIndex, 
                lastCollisionTileIndex, 
                true, 
                collisionLayer,
                true
            );

            if (collisionGroup) {
                // Assume that a collision group exists,
                // and that it has or will have physics and collisions
                // set up on it.
                collisionGroup.add(collisionLayer);
            } else {
                game.physics.enable(collisionLayer, Phaser.Physics.ARCADE);
                const body = <Phaser.Physics.Arcade.Body>collisionLayer.body;
                body.immovable = true;
            }

            this.collisionLayer = collisionLayer;
            return collisionLayer;
        }

        public checkCollisionWith(other: any, onCollide?: () => void): void {
            let collidingObject: ICollidableObject;
            switch (other.constructor) {
                case Entities.Mob:
                    collidingObject = other.gameObject;
                    break;

                default:
                    collidingObject = other;
                    break;
            }

            game.physics.arcade.collide(this.collisionLayer, collidingObject, onCollide);
        }
    }

    export class MapService {
        public constructor(
        ) {
        }

        public loadMap(
            key: string,
            collisionGroup?: Phaser.Group
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

                switch (currentLayer["type"].toLowerCase()) {
                    case "collision":
                        console.log(`Adding layer ${index} as a collision layer...`);
                        if (!currentLayer["layerName"])
                            result.addCollisionLayer(
                                index, 
                                currentLayer["startCollisionIndex"], 
                                currentLayer["endCollisionIndex"], 
                                collisionGroup
                            );
                        else
                            result.addCollisionLayer(
                                currentLayer["layerName"],
                                currentLayer["startCollisionIndex"], 
                                currentLayer["endCollisionIndex"], 
                                collisionGroup
                            );
                        break;

                    default:
                        result.addLayer(index);
                        break;
                }
            }
            
            return result;
        }
    }
}