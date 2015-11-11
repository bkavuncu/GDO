import { EventEmitter } from 'events';
import Dispatcher from '../Dispatcher';

let EVENT = 'CHANGE';
class BaseStore extends EventEmitter {

    constructor() {
        super();
    }

    subscribe(actionSubscribe) {
        this._dispatchToken = Dispatcher.register(actionSubscribe());
    }

    get dispatchToken() {
        return this._dispatchToken;
    }

    emitChange() {
        this.emit(EVENT);
    }

    addChangeListener(cb) {
        this.on(EVENT, cb);
    }

    removeChangeListener(cb) {
        this.removeListener(EVENT, cb);
    }
}

module.exports = BaseStore;
