export default async function handler(request, response) {
    if (request.method !== 'GET') {
        return response.status(405).json({ error: 'Method not allowed' });
    }

    const expectedPassword = process.env.NOTIFICATIONS_PASSWORD || 'KCS2009';
    if (request.headers['x-admin-password'] !== expectedPassword) {
        return response.status(401).json({ error: 'Incorrect password.' });
    }

    const url = process.env.KV_REST_API_URL;
    const token = process.env.KV_REST_API_TOKEN;
    if (!url || !token) {
        return response.status(503).json({ error: 'Exam result storage is not configured.' });
    }

    try {
        const resultResponse = await fetch(url + '/get/kcs_exam_results', {
            headers: { Authorization: 'Bearer ' + token }
        });
        if (!resultResponse.ok) {
            throw new Error('Could not read exam results.');
        }

        const data = await resultResponse.json();
        const results = data.result
            ? (typeof data.result === 'string' ? JSON.parse(data.result) : data.result)
            : [];

        const presenceResponse = await fetch(url + '/get/kcs_exam_presence', {
            headers: { Authorization: 'Bearer ' + token }
        });
        const presenceData = await presenceResponse.json();
        const presence = presenceData.result
            ? (typeof presenceData.result === 'string' ? JSON.parse(presenceData.result) : presenceData.result)
            : [];
        const activeCutoff = Date.now() - 90000;
        const activeCount = presence.filter((entry) => entry.lastSeen > activeCutoff).length;

        return response.status(200).json({ activeCount, results });
    } catch (error) {
        return response.status(503).json({ error: 'Could not load exam results.' });
    }
}