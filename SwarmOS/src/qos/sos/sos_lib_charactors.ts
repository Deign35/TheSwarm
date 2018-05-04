/**
 * Initial commit was copied from 
 * https://github.com/ScreepsQuorum/screeps-quorum/tree/7254e727868fdc30e93b4e4dc8e015021d08a6ef
 * 
 */

const alpha = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTYVWXYZ';
const numbers = '0123456789';
const symbols = '-_=+/?>,<[]{}\\|!@#$%^&*()_+:';

export const chars = {
    alpha: alpha,
    numbers: numbers,
    symbols: symbols,
    alphanum: alpha + numbers,
    all: alpha + numbers + symbols
}