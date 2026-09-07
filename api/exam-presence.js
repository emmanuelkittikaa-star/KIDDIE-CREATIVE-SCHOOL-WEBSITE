const presenceKey = 'kcs_exam_presence';

export default async function handler(request, response) {
    if (request.method !== 'POST' && request.method !== 'DELETE') {
        return response.status(405).json({ error: 'Method not allowed' });
    }

    const url = process.env.KV_REST_API_URL;
    const token = process.env.KV_REST_API_TOKEN;
    const sessionId = request.headers['x-exam-session'];
    if (!url || !token || typeof sessionId !== 'string' || !sessionId) {
        return response.status(400).json({ error: 'Exam session is required.' });
    }

    try {
        const readResponse = await fetch(url + '/get/' + presenceKey, {
            headers: { Authorization: 'Bearer ' + token }
        });
        const data = await readResponse.json();
        const activeCutoff = Date.now() - 90000;
        const presence = (data.result
            ? (typeof data.result === 'string' ? JSON.parse(data.result) : data.result)
            : []).filter((entry) => entry.lastSeen > activeCutoff && entry.sessionId !== sessionId);

        if (request.method === 'POST') {
            presence.push({ sessionId, lastSeen: Date.now() });
        }

        const writeResponse = await fetch(url + '/set/' + presenceKey, {
            method: 'POST',
            headers: {
                Authorization: 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(presence)
        });
        if (!writeResponse.ok) {
            throw new Error('Could not update exam presence.');
        }

        return response.status(200).json({ active: request.method === 'POST' });
    } catch (error) {
        return response.status(503).json({ error: 'Exam presence storage is not configured.' });
    }
}