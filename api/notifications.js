const notificationKey = 'kcs_notifications';

function storageConfig() {
    return {
        url: process.env.KV_REST_API_URL,
        token: process.env.KV_REST_API_TOKEN
    };
}

async function readNotifications() {
    const { url, token } = storageConfig();
    if (!url || !token) {
        throw new Error('Notification storage is not configured.');
    }

    const response = await fetch(url + '/get/' + notificationKey, {
        headers: { Authorization: 'Bearer ' + token }
    });
    if (!response.ok) {
        throw new Error('Could not read notifications.');
    }

    const data = await response.json();
    if (!data.result) {
        return [];
    }

    return typeof data.result === 'string' ? JSON.parse(data.result) : data.result;
}

async function writeNotifications(notifications) {
    const { url, token } = storageConfig();
    const response = await fetch(url + '/set/' + notificationKey, {
        method: 'POST',
        headers: {
            Authorization: 'Bearer ' + token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(notifications)
    });

    if (!response.ok) {
        throw new Error('Could not save notification.');
    }
}

export default async function handler(request, response) {
    if (request.method === 'GET') {
        try {
            return response.status(200).json(await readNotifications());
        } catch (error) {
            return response.status(503).json({ error: 'Notification storage is not configured.' });
        }
    }

    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method not allowed' });
    }

    const expectedPassword = process.env.NOTIFICATIONS_PASSWORD || 'KCS2009';
    if (request.headers['x-admin-password'] !== expectedPassword) {
        return response.status(401).json({ error: 'Incorrect password.' });
    }

    const { title, message } = request.body || {};
    if (typeof title !== 'string' || typeof message !== 'string' || !title.trim() || !message.trim()) {
        return response.status(400).json({ error: 'Title and message are required.' });
    }

    if (title.length > 120 || message.length > 2000) {
        return response.status(400).json({ error: 'The title or message is too long.' });
    }

    try {
        const notifications = await readNotifications();
        notifications.unshift({
            title: title.trim(),
            message: message.trim(),
            createdAt: new Date().toISOString()
        });
        await writeNotifications(notifications.slice(0, 30));
        return response.status(201).json({ sent: true });
    } catch (error) {
        return response.status(503).json({ error: 'Notification storage is not configured.' });
    }
}