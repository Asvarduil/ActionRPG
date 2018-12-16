namespace Main.Entities {
    export class MobPool {
        private entityData: (IMobMetaData & IMobStatData)[] = []
        public mobs: Mob[] = [];

        public constructor() {
            const rawData = game.cache.getJSON('entity-stats');
            this.entityData = rawData['entities'];
        }

        public getByName(name: string): Mob {
            return <Mob>this.mobs.getByName(name);
        }

        public getFirstInactive(): Mob {
            let result: Mob = null;
            for (let current of this.mobs) {
                if (current.isActive)
                    continue;

                result = current;
                break;
            }

            return result;
        }

        public add(
            name: string,
            mobType: string,
            x: number,
            y: number,
            dontOverwriteExisting: boolean = false
        ): Mob {
            let existingEntry = this.getFirstInactive();
            if (!existingEntry || dontOverwriteExisting) {
                const newEntry = this.create(name, mobType, x, y);
                this.mobs.push(newEntry);
                return newEntry;
            }
            else {
                existingEntry = this.create(name, mobType, x, y);
                return existingEntry;
            }
        }

        private create(
            name: string,
            mobType: string,
            x: number,
            y: number
        ): Mob {
            const data: INamed = this.entityData.getByName(mobType);
            const mobData: IMobMetaData = <IMobMetaData>data;
            const statData: IMobStatData = <IMobStatData>data;

            let newMob: Mob;
            if (!mobData.isPlayerCharacter) {
                newMob = new Mob(
                    name,                    
                    x,
                    y,
                    mobData.tileSize,
                    mobData.imageKey,
                    mobData.animationKey,
                    gfxMagnification
                );

                newMob.setStatsFromData(statData);
            } else {
                newMob = new Player(
                    name,
                    x,
                    y,
                    mobData.tileSize,
                    mobData.imageKey,
                    mobData.animationKey,
                    statData,
                    gfxMagnification
                );
            }

            return newMob;
        }

        public inactivate(mobName: string): Mob {
            const mob: Mob = this.getByName(mobName);
            if (!mob) {
                console.error(`Can't inactivate mob ${mobName}, as they don't exist in the pool.`);
                return;
            }
    
            mob.gameObject.alive = false;
        }

        public remove(mobName: string): void {
            const removeMob = this.inactivate(mobName);
            const index = this.mobs.indexOf(removeMob);
            if (index === -1) {
                console.error(`Can't remove ${mobName} from the mob pool as they're not registered in it.`);
                return;
            }

            this.mobs.splice(index, 1);
        }
    }
}