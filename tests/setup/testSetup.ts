declare let global: any;

class LocalStorageMock {
	private store: any;

	constructor() {
		this.store = {};
	}

	clear() {
		this.store = {};
	}

	getItem(key: string) {
		return this.store[key];
	}

	setItem(key: string, value: string) {
		this.store[key] = value;
	}

	removeItem(key: string) {
		delete this.store[key];
	}
}

(global as any).localStorage = new LocalStorageMock;
