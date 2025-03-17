import * as dotenv from "dotenv";

dotenv.config();

const NOTIFICATION_EVENT_URL = process.env.NOTIFICATION_EVENT_URL || 'http://localhost:8080';

export const sendNotification = async (data: Record<string, any>) => {
    try {
        const response = await fetch(`${NOTIFICATION_EVENT_URL}/notify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`Failed to send notification: ${response.statusText}`);
        }

        console.log('Notification sent successfully');
        return await response.json();
    } catch (error) {
        console.error('Error sending notification:', error);
        throw error;
    }
};