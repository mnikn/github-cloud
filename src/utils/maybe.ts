import { Observable } from 'rxjs';
// import { catchError } from 'rxjs/operators';

export class Maybe<T>
{
    private _value: T | null;

    constructor(value: T | null = null) {
        this._value = value;
    }

    public static nothing<T>(): Maybe<T> {
        return new Maybe<T>();
    }

    public static just<T>(value: T): Maybe<T> {
        return new Maybe<T>(value);
    }

    public isNothing(): boolean {
        return !this._value;
    }

    public getValue(): T {
        return this._value as T;
    }

    /**
     * Transform to another item if has value
     * @param transform transform function
     */
    public safeTansform<U>(transform: (value: T) => U): Maybe<U> {
        return this.isNothing() ? Maybe.nothing<U>() : Maybe.just(transform(this.getValue()));
    }

    /**
     * Async transform to another item if has value
     * @param transform transform function
     */
    public asyncSafeTansform<U>(transform: (value: T) => Observable<U>): Observable<Maybe<U>> {
        return new Observable<Maybe<U>>((observer) => {
            if (this.isNothing()) {
                observer.next(Maybe.nothing<U>());
            } else {
                transform(this.getValue()).subscribe((transformValue) => {
                    observer.next(Maybe.just(transformValue));
                }, () => {
                    console.log('error!');
                });
            }
        });
    }

    /**
     * Do something if has value
     * @param doSomething callback function
     */
    public safeDo(doSomething: (value: T) => void, defaultValue?: T): Maybe<T> {
        if (this.isNothing() && !defaultValue) return this;
        const value = this.isNothing()? defaultValue as T : this.getValue();
        doSomething(value);
        return this;
    }

    /**
     * Async transform to another item if has value
     * @param transform transform function
     */
    public asyncSafeDo(doSomething: (value: T) => Observable<any>): Observable<Maybe<T>> {
        return new Observable<Maybe<T>>((observer) => {
            if (this.isNothing()) {
                observer.next(Maybe.nothing<T>());
            } else {
                doSomething(this.getValue()).subscribe(() => {
                    observer.next(this);
                });
            }
        })
    }
}