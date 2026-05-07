const mongoose = require('mongoose');
const User = require('./models/usermodel.js');

async function checkUsers() {
    try {
        await mongoose.connect('mongodb://localhost:27017/exam_portal');
        console.log("Connected to DB");

        const users = await User.find({}, { username: 1, role: 1 });
        console.log("USERS:", JSON.stringify(users, null, 2));

        process.exit(0);
    } catch (err) {
        console.error("DIAGNOSE ERROR:", err);
        process.exit(1);
    }
}

checkUsers();
