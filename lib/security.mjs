import { randomBytes, scrypt as scryptCb, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
const scrypt=promisify(scryptCb);
export const validEmail=x=>typeof x==='string'&&x.length<=254&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(x);
export const validPassword=x=>typeof x==='string'&&x.length>=12&&x.length<=200;
export async function hashPassword(password){const salt=randomBytes(16);const derived=await scrypt(password,salt,64);return `scrypt:${salt.toString('hex')}:${Buffer.from(derived).toString('hex')}`;}
export async function verifyPassword(password,stored){try{const [scheme,saltHex,hashHex]=stored.split(':');if(scheme!=='scrypt')return false;const actual=Buffer.from(await scrypt(password,Buffer.from(saltHex,'hex'),64));const expected=Buffer.from(hashHex,'hex');return actual.length===expected.length&&timingSafeEqual(actual,expected);}catch{return false;}}
export const token=()=>randomBytes(32).toString('base64url');
