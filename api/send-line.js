export default async function handler(req, res) {
    // Enable CORS headers for browser calls
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    try {
        const body = req.body || {};
        const token = body.token || (req.headers.authorization ? req.headers.authorization.replace("Bearer ", "") : "");
        
        if (!token) {
            return res.status(400).json({ message: "Missing LINE Channel Access Token" });
        }

        const payload = body.payload || {
            to: body.to,
            messages: body.messages
        };

        const response = await fetch("https://api.line.me/v2/bot/message/push", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json().catch(() => ({}));
        return res.status(response.status).json(data);
    } catch (error) {
        console.error("Vercel LINE API Error:", error);
        return res.status(500).json({ message: error.message });
    }
}
