/* ==========================================================
   RSVP → Google Sheet  (opens in Excel: File > Download > .xlsx or .csv)

   SETUP (5 minutes, once)
   1. Create a new Google Sheet (e.g. "Wedding RSVPs").
   2. Extensions > Apps Script. Delete the sample code and paste this whole file.
   3. Deploy > New deployment > type "Web app".
        Execute as: Me      Who has access: Anyone
      Authorise when asked, then copy the "Web app" URL.
   4. Paste that URL into RSVP_ENDPOINT in js/guests.js.
   5. After any later change to this script: Deploy > Manage deployments >
      edit > New version (the URL stays the same).

   Each answer is added as a new row. If a guest changes their answer, a new
   row is added: the most recent row (Received column) is the one that counts.
   ========================================================== */

const SHEET_NAME = "RSVP";
const HEADERS = ["Received", "Name", "Surname", "Attending", "Program", "Language",
                 "+1 allowed", "Bringing +1", "+1 name", "+1 surname"];

/* Stops anything typed by a guest from being run as a spreadsheet formula */
function clean(v) {
  v = String(v == null ? "" : v).trim().slice(0, 100);
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const d = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.setFrozenRows(1);
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
    }
    sheet.appendRow([new Date(), clean(d.first), clean(d.last), clean(d.attending), clean(d.program),
                     clean(d.lang), clean(d.plusOneAllowed), clean(d.plusOneComing),
                     clean(d.plusOneFirst), clean(d.plusOneLast)]);
    return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err) })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
