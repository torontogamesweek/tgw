const fetch = require('node-fetch');

exports.handler = async function (event, context) {
    const API_KEY = process.env.GOOGLE_CALENDAR_API_KEY;
    const calendarId = '642094f75197b3b8113d17477797d5dfd74db3216e88d0a6f09a7d1c5580b571@group.calendar.google.com';
    const apiUrl = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?key=${API_KEY}`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*', // Allows any origin to access this function
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*', // Allows any origin to access this function
            },
            body: JSON.stringify({ error: 'Failed to fetch calendar events' }),
        };
    }
};
