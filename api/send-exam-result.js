export default async function handler(request, response) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method not allowed' });
    }

    const apiKey = process.env.RESEND_API_KEY;
    const recipient = process.env.EXAM_ALERT_EMAIL || 'emmanuelkittikaa@gmail.com';
    const fromAddress = process.env.RESEND_FROM_EMAIL || 'Kiddie Creative School <onboarding@resend.dev>';

    if (!apiKey) {
        return response.status(500).json({ error: 'Email service is not configured.' });
    }

    const { studentName, registrationNumber, selectedClass, score, total, percentage, status, verificationCode, submittedByTimer } = request.body || {};

    if (!studentName || !registrationNumber || !selectedClass || typeof score !== 'number' || typeof total !== 'number') {
        return response.status(400).json({ error: 'Incomplete exam result.' });
    }

    const emailText = [
        'A student has submitted the Kiddie Creative School exam.',
        '',
        'Student Name: ' + studentName,
        'Registration Number: ' + registrationNumber,
        'Class: ' + selectedClass,
        'Score: ' + score + ' / ' + total,
        'Percentage: ' + Number(percentage).toFixed(0) + '%',
        'Status: ' + status,
        'Verification Code: ' + verificationCode,
        'Submitted by timer: ' + (submittedByTimer ? 'Yes' : 'No')
    ].join('\n');

    try {
        const emailResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                Authorization: 'Bearer ' + apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: fromAddress,
                to: [recipient],
                subject: 'New student exam result: ' + studentName,
                text: emailText
            })
        });

        const emailData = await emailResponse.json();

        if (!emailResponse.ok) {
            return response.status(502).json({ error: 'Email provider rejected the message.', details: emailData });
        }

        return response.status(200).json({ sent: true, id: emailData.id });
    } catch (error) {
        return response.status(500).json({ error: 'Could not send exam alert.' });
    }
}
