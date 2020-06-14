var EventEmitter = require("events");

class Collection extends Map {
	constructor(type) {
		super();
		this.type = type;
		this._emitter = new EventEmitter();
	}
	add(objects) {
		if (typeof objects == "array") {
			for (let x = 0; x < objects; x++) {
				if (!(objects[x] instanceof this.type)) throw new TypeError(`Collection type is ${this.type.constructor.name } but got ${objects[x].constructor.name}.`);
				this.set(objects[x].id, objects[x]);
				this._emitter.emit("add", this.resolve(objects[x]));
			}
		} else if (typeof objects == "object") {
			if (objects instanceof Collection) {
				objects.forEach((value, key, map) => {
					if (!(value instanceof this.type)) throw new TypeError(`Collection type is ${this.type.constructor.name } but got ${value.constructor.name}.`);
					this.set(key, value);
					this._emitter.emit("add", this.resolve(value));
				});
			} else {
				this.set(objects.id, objects);
				this._emitter.emit("add", this.resolve(objects));
			}
		}
		return this;
	}
	remove(objectResolvables) {
		if (typeof objectResolvables == "array") {
			for (let x = 0; x < objectResolvables; x++) {
				if (typeof objectResolvables[x] == "object") {
					if (!(objectResolvables[x] instanceof this.type)) throw new TypeError(`Collection type is ${this.type.constructor.name } but got ${objectResolvables[x].constructor.name}.`);
					this._emitter.emit("remove", this.resolve(objectResolvables[x]));
					this.delete(objectResolvables[x].id);
				} else if (typeof objectResolvables[x] == "string") {
					this._emitter.emit("remove", this.resolve(objectResolvables[x]));
					this.delete(objectResolvables[x]);
				}
			}
		} else if (typeof objectResolvables == "object") {
			if (objectResolvables instanceof Collection) {
				objectResolvables.forEach((value, key, map) => {
					if (!(value instanceof this.type)) throw new TypeError(`Collection type is ${this.type.constructor.name } but got ${value.constructor.name}.`);
					this._emitter.emit("remove", this.resolve(value));
					this.delete(key);
				});
			} else {
				if (!(objectResolvables instanceof this.type)) throw new TypeError(`Collection type is ${this.type.constructor.name } but got ${objectResolvables.constructor.name}.`);
				this._emitter.emit("remove", this.resolve(objectResolvables));
				this.delete(objectResolvables.id);
			}
		} else if (typeof objectResolvables == "string") {
			this._emitter.emit("remove", this.resolve(objectResolvables));
			this.delete(objectResolvables);
		}
		return this;
	}
	resolve(objectResolvables) {
		if (typeof objectResolvables == "array") {
			let outputArray = [];
			for (let x = 0; x < objectResolvables; x++) {
				if (typeof objectResolvables[x] == "object") {
					outputArray.push(this.get(objectResolvables[x].id));
				} else if (typeof objectResolvables[x] == "string") {
					outputArray.push(this.get(objectResolvables[x]));
				}
			}
			return outputArray;
		} else if (objectResolvables instanceof Collection) {
			let outputCollection = new Collection();
			objectResolvables.forEach((value, key, map) => {
				outputCollection.set(key, this.get(key));
			});
			return outputCollection;
		} else if (typeof objectResolvables == "object") {
			return this.get(objectResolvables.id);
		} else if (typeof objectResolvables == "string") {
			return this.get(objectResolvables);
		} else if (objectResolvables == undefined) {
			return undefined;
		}
	}
}

module.exports = Collection;