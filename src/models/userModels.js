import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    points: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    tokenId: { type: String, default: null },
    // Add any other fields you need
});

const User = mongoose.model('User', userSchema);

export default User;
