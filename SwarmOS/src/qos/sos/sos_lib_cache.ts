/**
 * Initial commit was copied from 
 * https://github.com/ScreepsQuorum/screeps-quorum/tree/7254e727868fdc30e93b4e4dc8e015021d08a6ef
 * 
 */
const defaultOpts = {
    'persist': false,
    'compress': false,
    'maxttl': false,
    'lastuse': 50,
    'chance': 1
}

export class cache {
    private __items = {}
    get(label: string, opts: any) {
        if (Array.isArray(label)) {
            label = label.join('.');
        }

        opts = Object.assign({}, defaultOpts, opts);

        if (opts.ttl && opts.chance < 1) {
            opts.allow_refresh = Math.random() <= opts.chance
        } else {
            opts.allow_refresh = true
        }

        // "Global Cache"
        if (!!this.__items[label]) {
            if (!!this.__items[label].exp) {
                if (this.__items[label].exp < Game.time) {
                    delete this.__items[label]
                }
            }
        }

        if (!!this.__items[label]) {
            if (!opts.ttl || (this.__items[label].tick + opts.ttl) > Game.time) {
                return this.__items[label].data
            }
        }

        // Memory Cache
        //let item: any = _.get(Memory.sos.cache, label, undefined)
        let item = !!Memory.sos.cache[label] ? Memory.sos.cache[label] : undefined
        if (!!item) {
            if (!!item.exp) {
                if (item.exp < Game.time) {
                    delete Memory.sos.cache[label]
                    //_.set(Memory.sos.cache, label, undefined)
                    return
                }
            }
        }


        //item = _.get(Memory.sos.cache, label, undefined)
        item = !!Memory.sos.cache[label] ? Memory.sos.cache[label] : undefined;

        if (!!item) {
            // Advance "lu" cache time
            let lu = Game.time + opts.lastuse
            if (item.lu != lu) {
                item.lu = Game.time + opts.lastuse
                _.set(Memory.sos.cache, label, item)
            }
            if (opts.allow_refresh && (item.tick + opts.ttl) < Game.time) {
                return
            }
            return item.data
        }
    }
    set(label: string, data: any, opts: any = {}) {

        if (Array.isArray(label)) {
            label = label.join('.')
        }

        opts = Object.assign({}, defaultOpts, opts);

        let exp = 0
        if (opts.maxttl) {
            exp = opts.maxttl + Game.time
        }

        if (!opts.persist) {
            this.__items[label] = {
                data: data,
                tick: Game.time,
                exp: exp
            }
            return
        }

        let save_item = {
            tick: Game.time,
            lu: Game.time + opts.lastuse,
            exp: exp ? exp : undefined,
            data: data
        }

        //_.set(Memory.sos.cache, label, save_item)
        Memory.sos.cache[label] = save_item
    }
    clear() {
        Memory.sos.cache = {}
    }
    clean() {
        let keys = Object.keys(Memory.sos.cache);
        for (let i = 0; i < keys.length; i++) {
            this.__cleankey(Memory.sos.cache, keys[i])
        }

        const globalKeys = Object.keys(this.__items)
        for (const label of globalKeys) {
            if (!!this.__items[label].exp) {
                if (this.__items[label].exp < Game.time) {
                    delete this.__items[label]
                }
            }
        }
    }
    private __cleankey(object: any, key: string) {
        if (object[key].tick) {
            if (object[key].exp && object[key].exp < Game.time) {
                delete object[key]
            } else if (object[key].lu && object[key].lu < Game.time) {
                delete object[key]
            }
        } else {
            for (let label in object[key]) {
                try {
                    this.__cleankey(object[key], label)
                } catch (e) {
                    console.log('FAILURE:A113');
                    if (object[key][label]) {
                        console.log('FAILURE:A113-1');
                        if (object[key][label].tick) {
                            console.log('FAILURE:A113-2');
                            if (object[key][label] && object[key][label].exp && object[key][label].exp < Game.time) {
                                console.log('FAILURE:A113-3');
                                delete object[key][label]
                            } else if (object[key][label] && object[key][label].lu && object[key][label].lu < Game.time) {
                                console.log('FAILURE:A113-4');
                                delete object[key][label]
                            }
                        } else {
                            console.log('FAILURE:A113-5?????');
                            this.__cleankey(object[key], label)
                        }
                    }
                }
            }
            if (Object.keys(object[key]).length < 0) {
                delete object[key]
            }
        }
    }
    getOrUpdate(label: string, updateFunc: any, opts: any) {
        let result = this.get(label, opts)
        if (result === undefined) {
            result = updateFunc()
            if (result !== undefined) {
                this.set(label, result, opts)
            }
        }

        return result
    }
}