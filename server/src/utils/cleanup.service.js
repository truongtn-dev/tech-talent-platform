import TestAssignment from "../challenges/testAssignment.model.js";
import Application from "../applications/application.model.js";
import { createNotification } from "../notifications/notification.service.js";
import { emitToUser } from "./socket.js";

/**
 * Service to handle automated cleanup of recruitment objects.
 * This can be run as a cron job or triggered manually.
 */
export const cleanupExpiredTests = async () => {
    console.log("[Cleanup] Checking for expired test assignments...");
    
    const now = new Date();
    
    // 1. Find PENDING/IN_PROGRESS tests that have passed their expiresAt
    const expiredAssignments = await TestAssignment.find({
        status: { $in: ["PENDING", "IN_PROGRESS"] },
        expiresAt: { $lt: now }
    }).populate("applicationId");
    
    console.log(`[Cleanup] Found ${expiredAssignments.length} expired assignments.`);
    
    for (const assignment of expiredAssignments) {
        try {
            // Update Assignment Status
            assignment.status = "TIMEOUT";
            await assignment.save();
            
            // Update Application Status to REJECTED (Test Expired)
            const app = assignment.applicationId;
            if (app && app.status === "TEST_ASSIGNED") {
                app.status = "REJECTED";
                app.history.push({
                    status: "REJECTED",
                    at: new Date(),
                    note: "Automatic rejection: Technical test expired."
                });
                await app.save();
                
                // Notify Candidate
                const notifData = {
                    userId: app.candidateId.toString(),
                    title: "Application Closed",
                    message: "Your application has been closed because the technical test deadline has passed.",
                    type: "STATUS_CHANGE",
                    link: "/my-applications"
                };
                await createNotification(notifData);
                emitToUser(app.candidateId.toString(), "NEW_NOTIFICATION", notifData);
                
                console.log(`[Cleanup] Rejected application ${app._id} due to test timeout.`);
            }
        } catch (error) {
            console.error(`[Cleanup] Error processing assignment ${assignment._id}:`, error);
        }
    }
    
    return expiredAssignments.length;
};
