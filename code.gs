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
    var sheetName = getSheetNameForWeek(rawData.weekDate); 
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(sheetName);

    // Create sheet if it doesn't exist
    if (!sheet) {
      sheet = ss.insertSheet(sheetName, 0);
      sheet.appendRow(columnTitles);
    }

    if (rawData.delete === true) {
      if (sheet) {
        sheet.clear(); // Clear the contents of the sheet
        return ContentService.createTextOutput(JSON.stringify({ "result": "cleared"}))
            .setMimeType(ContentService.MimeType.JSON);
      }
    }

    // Append data to the sheet
    try {
      var rowsToAppend = [];
      var existingIdentifiers = getExistingIdentifiers(sheet);

      for (var i = 0; i < data.length; i++) {
          var row = data[i];
          var identifier = row.ProductId + '-' + row.MunicipalityName;

          if (!existingIdentifiers.has(identifier)) {
              // Convert the object to an array of values
              var rowArray = Object.values(row);
              rowsToAppend.push(rowArray);
          }
      }

      // Check if there are any rows to append
      if (rowsToAppend.length > 0) {
          // Append rowsToAppend to the sheet
          var startRow = sheet.getLastRow() + 1; // Start appending after the last row
          var numberOfColumns = rowsToAppend[0].length; // Number of columns to append
          sheet.getRange(startRow, 1, rowsToAppend.length, numberOfColumns).setValues(rowsToAppend);
      }

    } catch (error) {
        return ContentService.createTextOutput(JSON.stringify({ "result": "error", "message": error.message }))
            .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({ "result": "success" }))
        .setMimeType(ContentService.MimeType.JSON);
}

function getExistingIdentifiers(sheet) {
    var existingData = sheet.getDataRange().getValues();
    var identifiers = new Set();
    var productIdIndex = 5; // Assuming ProductId is at index 5
    var municipalityNameIndex = 34; // Assuming MunicipalityName is at index 34

    // Starting from 1 to skip the header row
    for (var i = 1; i < existingData.length; i++) {
        var row = existingData[i];
        var identifier = row[productIdIndex] + '-' + row[municipalityNameIndex];
        identifiers.add(identifier);
    }

    return identifiers;
}


function getSheetNameForWeek(date) {
    var start = new Date(date);
    if (isNaN(start.getTime())) {  // getTime() returns NaN for invalid dates
      return date; // Return default date if input is invalid
    }
    start.setDate(start.getDate() - start.getDay() + 1); // Get Monday of the current week
    var end = new Date(start);
    end.setDate(end.getDate() + 6); // Get Sunday of the current week

    return Utilities.formatDate(start, Session.getScriptTimeZone(), "MMM d") + 
           " - " + 
           Utilities.formatDate(end, Session.getScriptTimeZone(), "MMM d yyyy");
}
