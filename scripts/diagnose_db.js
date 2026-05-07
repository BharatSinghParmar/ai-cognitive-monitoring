const mongoose = require('mongoose');
const IntegrityEvent = require('./backend/models/integrityEventModel');
const PerformanceSnapshot = require('./backend/models/performanceSnapshotModel');
const ExamResponse = require('./backend/models/examResponseModel');

async function diagnose() {
    try {
        await mongoose.connect('mongodb://localhost:27017/exam_portal');
        console.log("Connected to DB");

        const events = await IntegrityEvent.find({});
        console.log(`Total Integrity Events: ${events.length}`);

        const snapshots = await PerformanceSnapshot.find({});
        console.log(`Total Performance Snapshots: ${snapshots.length}`);

        const responses = await ExamResponse.find({});
        console.log(`Total Exam Responses: ${responses.length}`);

        if (events.length > 0) {
            console.log("Integrity Event Sample:", JSON.stringify({
                userId: events[0].userId,
                examId: events[0].examId,
                type: events[0].eventType
            }, null, 2));
        }

        if (responses.length > 0) {
            const first = responses[0];
            console.log("ExamResponse Sample:", JSON.stringify({
                studentId: first.studentId,
                examId: first.examId,
                integrityScore: first.integrityScore
            }, null, 2));
        }

        process.exit(0);
    } catch (err) {
        console.error("DIAGNOSE ERROR:", err);
        process.exit(1);
    }
}

diagnose();
