function doPost(e) {
    var rawData = JSON.parse(e.postData.contents);
    var data = rawData.data; // Your product data
    var columnTitles = rawData.columnTitles; // Column titles

    // Validate data structure
    if (!Array.isArray(data) || !data.length || !Array.isArray(columnTitles)) {
        return ContentService.createTextOutput(JSON.stringify({ "result": "error", "message": "Invalid data structure" }))
            .setMimeType(ContentService.MimeType.JSON);
    }

    // Get sheet name for the week
    var sheetName = getSheetNameForWeek(new Date(rawData.weekDate)); 
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(sheetName);

    // Create sheet if it doesn't exist
    if (!sheet) {
        sheet = ss.insertSheet(sheetName, 0);
        sheet.appendRow(columnTitles);
    }

    // Append data to the sheet
    try {
        sheet.getRange(sheet.getLastRow() + 1, 1, data.length, data[0].length).setValues(data);
    } catch (error) {
        return ContentService.createTextOutput(JSON.stringify({ "result": "error", "message": error.message }))
            .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({ "result": "success" }))
        .setMimeType(ContentService.MimeType.JSON);
}

function getSheetNameForWeek(date) {
    var start = new Date(date);
    start.setDate(start.getDate() - start.getDay() + 1); // Get Monday of the current week
    var end = new Date(start);
    end.setDate(end.getDate() + 6); // Get Sunday of the current week

    return Utilities.formatDate(start, Session.getScriptTimeZone(), "MMM d") + 
           " - " + 
           Utilities.formatDate(end, Session.getScriptTimeZone(), "MMM d yyyy");
}
