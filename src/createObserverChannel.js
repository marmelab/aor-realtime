import { eventChannel } from 'redux-saga';
import queryObserver from './queryObserver';

export const queryObserverFactory = queryObserverImpl => (watcher, emitter) => {
    const observer = queryObserverImpl(emitter);
    watcher.subscribe(observer);

    const unsubscribe = () => {
        observer.unsubscribe();
    };

    return unsubscribe;
};

export default watcher => eventChannel(emitter => queryObserverFactory(queryObserver)(watcher, emitter));
