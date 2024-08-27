import { MongoClient } from 'mongodb';

const client = new MongoClient('mongodb://localhost:27017');
const db = client.db('tic-tac-toe');
const usersCollection = db.collection('users');

export const addUser = async (socketId) => {
    await usersCollection.updateOne(
        { socketId },
        { $set: { status: 'available' } },
        { upsert: true }
    );
};

export const removeUser = async (socketId) => {
    await usersCollection.deleteOne({ socketId });
};

export const updateUserStatus = async (socketId, status) => {
    await usersCollection.updateOne(
        { socketId },
        { $set: { status } }
    );
};

export const updatePoints = async (socketId, result) => {
    const update = result === 'win' ? { $inc: { points: 1 } } : { $inc: { points: -1 } };
    await usersCollection.updateOne(
        { socketId },
        update
    );
};

export const findOpponent = async (socketId) => {
    const user = await usersCollection.findOne({ status: 'available', socketId: { $ne: socketId } });
    return user ? user.socketId : null;
};
