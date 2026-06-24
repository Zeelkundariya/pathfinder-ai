/**
 * lib/google/gmail.js
 * Helper functions to interact with the Gmail API.
 */

/**
 * Extracts plain text from a Gmail message payload.
 */
function extractBody(payload) {
  let body = "";
  if (payload.parts) {
    for (const part of payload.parts) {
      if (part.mimeType === "text/plain") {
        if (part.body && part.body.data) {
          body += Buffer.from(part.body.data, "base64").toString("utf-8");
        }
      } else if (part.parts) {
        body += extractBody(part);
      }
    }
  } else if (payload.body && payload.body.data) {
    body = Buffer.from(payload.body.data, "base64").toString("utf-8");
  }
  return body;
}

/**
 * Fetches recent emails that match job application patterns.
 * @param {string} accessToken - Google OAuth Access Token
 * @param {number} days - Number of days to look back
 * @returns {Promise<Array<{ id: string, subject: string, snippet: string, body: string, date: string }>>}
 */
export async function fetchRecentJobEmails(accessToken, days = 7) {
  if (!accessToken) {
    throw new Error("Missing Google Access Token");
  }

  // Construct query to match potential job application emails
  const query = `newer_than:${days}d (subject:application OR subject:interview OR subject:offer OR subject:rejection OR subject:rejected OR subject:"next steps")`;
  const listUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=20`;

  const listRes = await fetch(listUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });

  if (!listRes.ok) {
    const errData = await listRes.json();
    console.error("Failed to list Gmail messages:", errData);
    throw new Error(errData.error?.message || "Failed to fetch emails");
  }

  const listData = await listRes.json();
  const messages = listData.messages || [];

  const parsedEmails = [];

  // Fetch full details for each message
  for (const msg of messages) {
    try {
      const msgUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=full`;
      const msgRes = await fetch(msgUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      });

      if (!msgRes.ok) continue;

      const msgData = await msgRes.json();
      const headers = msgData.payload?.headers || [];
      const subjectHeader = headers.find((h) => h.name.toLowerCase() === "subject");
      const dateHeader = headers.find((h) => h.name.toLowerCase() === "date");

      const subject = subjectHeader ? subjectHeader.value : "No Subject";
      const date = dateHeader ? dateHeader.value : new Date().toISOString();
      const body = extractBody(msgData.payload);

      parsedEmails.push({
        id: msg.id,
        subject,
        snippet: msgData.snippet,
        body: body.substring(0, 5000), // Truncate to save AI tokens, usually the start of the email has the relevant info
        date,
      });
    } catch (e) {
      console.error(`Failed to fetch message ${msg.id}:`, e);
    }
  }

  return parsedEmails;
}
