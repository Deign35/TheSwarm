// type shim for nodejs' `require()` syntax
declare const require: (module: string) => any;
declare var global: any;

declare type CallbackFunction = (...args: any[]) => void;
//declare type DisposeFunc<T> = (resource: T) => void;

declare type DisposeFunc<T> = CallbackFunction;

declare type Callbacks<T> = CallbackFunction | DisposeFunc<T>;