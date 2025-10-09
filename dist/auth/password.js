"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = hashPassword;
exports.verifyPassword = verifyPassword;
exports.validatePasswordStrength = validatePasswordStrength;
exports.generateRandomPassword = generateRandomPassword;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const env_1 = require("../config/env");
/**
 * Hash a plain text password using bcrypt
 * @param password - The plain text password to hash
 * @returns Promise resolving to the hashed password
 */
function hashPassword(password) {
    return __awaiter(this, void 0, void 0, function* () {
        const saltRounds = env_1.config.bcrypt.rounds;
        return bcryptjs_1.default.hash(password, saltRounds);
    });
}
/**
 * Compare a plain text password with a hashed password
 * @param password - The plain text password to verify
 * @param hashedPassword - The hashed password to compare against
 * @returns Promise resolving to true if passwords match, false otherwise
 */
function verifyPassword(password, hashedPassword) {
    return __awaiter(this, void 0, void 0, function* () {
        return bcryptjs_1.default.compare(password, hashedPassword);
    });
}
/**
 * Validate password strength
 * @param password - The password to validate
 * @returns Object with validation result and error message if invalid
 */
function validatePasswordStrength(password) {
    const errors = [];
    // Minimum length check
    if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    }
    // Maximum length check
    if (password.length > 128) {
        errors.push('Password must not exceed 128 characters');
    }
    // Contains lowercase letter
    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }
    // Contains uppercase letter
    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }
    // Contains digit
    if (!/\d/.test(password)) {
        errors.push('Password must contain at least one number');
    }
    // Contains special character
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        errors.push('Password must contain at least one special character');
    }
    return {
        isValid: errors.length === 0,
        errors,
    };
}
/**
 * Generate a random password that meets strength requirements
 * @param length - The desired password length (default: 16)
 * @returns A randomly generated password
 */
function generateRandomPassword(length = 16) {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const special = '!@#$%^&*()_+-=[]{};\':"|,.<>/?';
    const allChars = lowercase + uppercase + numbers + special;
    let password = '';
    // Ensure at least one character from each category
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += special[Math.floor(Math.random() * special.length)];
    // Fill the rest randomly
    for (let i = password.length; i < length; i++) {
        password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    // Shuffle the password
    return password
        .split('')
        .sort(() => Math.random() - 0.5)
        .join('');
}
