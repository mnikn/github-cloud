import * as request from 'request';
import { Observable } from 'rxjs';
import { Maybe } from './maybe';

export function requestGet<T>(url: string, options?: request.CoreOptions): Observable<Maybe<T>> {
    return new Observable(subscriber => {
        const instance = request.get(url, options, (error, response, body) => {
            if (response.statusCode !== 200 && response.statusCode !== 304) {
                // subscriber.error(error);
                subscriber.next(Maybe.nothing<T>());
            } else {
                subscriber.next(Maybe.just(JSON.parse(body) as T));
            }
            subscriber.complete();
        });
        return () => {
            instance.abort();
        }
    });
}