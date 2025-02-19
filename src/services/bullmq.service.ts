import { Queue, Worker, Job } from 'bullmq'
import { logger } from './logger.service'
import { uploadToS3 } from './s3.service'
import {
    getTicketById,
    getTicketsMarkedAsGiven,
    updateEmailSentStatus,
    updateTicket,
} from '../utils/dbUtils'
import { formatReadableDate } from '../utils/timeUtils'
import { appendToSheet } from '../utils/sheets'
import { sendEmail } from './nodemailer.service'
import * as dotenv from "dotenv";

dotenv.config();

const connection = { host: process.env.REDIS_HOST, port: 6379 }

export const progressQueue = new Queue('finalize', { connection })
export const emailQueue = new Queue('bulk-email', { connection })
export const onboardingEmailQueue = new Queue('onboarding-email', {
    connection,
})

const worker = new Worker(
    'finalize',
    async (job: Job) => {
        const { id, buffer, fileName, mimetype } = job.data
        logger.info(`Processing file upload for ID: ${id}`)

        try {
            const base64data = Buffer.from(buffer, 'binary')
            const s3Response = await uploadToS3(
                'bucket.tedx',
                base64data,
                fileName,
                mimetype
            )

            logger.info(`File uploaded to S3 for ID: ${id}. URL: ${s3Response}`)

            await updateTicket(id, { stage: '2', payment_proof: s3Response })
            const result = await getTicketById(id)
            const row = {
                Timestamp: formatReadableDate(result?.createdAt) || 'undefined',
                Email: result?.email || 'undefined',
                Name: result?.name || 'undefined',
                'Roll Number': result?.rollNumber || 'undefined',
                'Contact Number': result?.contactNumber || 'undefined',
                Course: result?.degree || 'undefined',
                Year: result?.year || 'undefined',
                Branch: result?.branch || 'undefined',
                payment_proof: result?.payment_proof || 'null',
            }

            const values = Object.values(row)

            const sheetRange = 'Sheet1!A1'

            const sheetValues = [values]
            await appendToSheet(sheetRange, sheetValues)

            logger.info(`Database updated for ID: ${id}`)
        } catch (error) {
            logger.error(`Error processing file upload for ID: ${id}: ${error}`)
            throw error
        }
    },
    { connection }
)

const emailWorker = new Worker(
    'bulk-email',
    async (job: Job) => {
        const { templateId, subject, body } = job.data
        logger.info(`Processing email job for Ticket(s)`)

        try {
            const tickets = await getTicketsMarkedAsGiven(templateId)

            if (tickets.length === 0) {
                logger.info('No tickets marked as given, no emails to send.')
                return
            }

            for (const ticket of tickets) {
                const { _id, email, name, ticket_number } = ticket

                if (!email) {
                    logger.warn(`No email found for Ticket ID: ${_id}`)
                    continue
                }

                let personalizedBody = body.replace('{{name}}', name || 'Guest')
                personalizedBody = personalizedBody.replace(
                    '{{ticket_number}}',
                    ticket_number || 'N/A'
                )

                // Send the email
                await sendEmail(email, subject, personalizedBody)

                // After sending the email, update the ticket status
                const updateResult = await updateEmailSentStatus(
                    _id.toString(),
                    templateId
                )

                if (updateResult) {
                    logger.info(
                        `Email sent successfully to ${email} for Ticket ID: ${_id}. Email status updated.`
                    )
                } else {
                    logger.warn(
                        `Failed to update email sent status for Ticket ID: ${_id}`
                    )
                }
            }
        } catch (error) {
            logger.error(`Error processing email job: ${error}`)
            throw error
        }
    },
    { connection }
)

const onboardingEmailWorker = new Worker(
    'onboarding-email',
    async (job: Job) => {
        const { email, password } = job.data
        logger.info(`Processing onboarding email for: ${email}`)

        try {
            const subject = 'Welcome to the TEDxNITKKR Management Portal 🎉'
            const body =`WELCOME TO THE TEDxNITKKR MANAGEMENT PORTAL! 🚀  
We're thrilled to have you on board as a key part of our team.  

🔑 Your login credentials:  
EMAIL: ${email} 
PASSWORD: ${password}

🌐 ACCESS THE PORTAL:  
https://mgmttedx.sanniv.tech 

✅ WHAT’S NEXT?  
- Log in using the credentials above.  
- Reset your password after logging in for security reasons.  
- Explore the portal and manage tasks effortlessly.  

📩 NEED HELP?  
If you have any questions, reach out to us at support@tedxnitkkr.com.  

LOOKING FORWARD TO AN AMAZING JOURNEY TOGETHER! 🎭🔥  

BEST REGARDS,  
TEDxNITKKR TEAM  
`

            await sendEmail(email, subject, body)
            logger.info(`Onboarding email sent successfully to: ${email}`)
        } catch (error) {
            logger.error(`Error sending onboarding email to ${email}: ${error}`)
            throw error
        }
    },
    { connection }
)

emailWorker.on('completed', (job) => {
    logger.info(`Email job ${job.id} completed successfully.`)
})

emailWorker.on('failed', (job, err) => {
    logger.error(`Email job ${job?.id} failed with error: ${err.message}`)
})

worker.on('completed', (job) => {
    logger.info(`Job ${job.id} completed successfully.`)
})

worker.on('failed', (job, err) => {
    logger.error(`Job ${job?.id} failed with error: ${err.message}`)
})

onboardingEmailWorker.on("completed", (job) => {
  logger.info(`Onboarding email job ${job.id} completed successfully.`);
});

onboardingEmailWorker.on("failed", (job, err) => {
  logger.error(`Onboarding email job ${job?.id} failed with error: ${err.message}`);
});
