import mongoose from 'mongoose';
import { DB_URI, NODE_ENV } from '../config/env.js';

if (!DB_URI) {
    throw new Error('Please define the DB_URI environment variable inside .env.<development/production>.local');
}

const connectToDatabase = async () => {
    try {
        if (DB_URI.includes('<db_password>')) {
            console.warn('⚠️ Warning: DB_URI contains the placeholder <db_password>. Please update your MongoDB password in .env.development.local');
            return;
        }

        await mongoose.connect(DB_URI);
        console.log(`Connected to database in ${NODE_ENV || 'development'} mode`);
    } catch (error) {
        console.error('Error connecting to database: ', error.message);
        process.exit(1);
    }
};

export default connectToDatabase;
