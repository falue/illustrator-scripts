#target illustrator

function displayPolygonAreasWithText() {
    if (app.documents.length === 0) {
        alert("No document is open.");
        return;
    }

    var doc = app.activeDocument;
    var sel = doc.selection;

    if (sel.length === 0) {
        alert("Please select at least one polygon.");
        return;
    }

    for (var i = 0; i < sel.length; i++) {
        var path = sel[i];

        // Check if the item is a closed PathItem
        if (path.typename === "PathItem" && path.closed) {
            var areaInPoints = Math.abs(path.area);

            // Convert area from square points to square millimeters
            var areaInMM = areaInPoints * Math.pow(1 / 2.834645669, 2);
            var areaInCM = areaInMM / 100;
            var areaInM = areaInCM / 10000;

            // Format the area measurements
            /* var textContent = "Area:\n" +
                areaInMM.toFixed(2) + " mm²\n" +
                areaInCM.toFixed(2) + " cm²\n" +
                areaInM.toFixed(6) + " m²"; */

            var textContent = areaInMM.toFixed(2)

            // Calculate the center of the polygon
            var bounds = path.geometricBounds; // [left, top, right, bottom]
            var centerX = (bounds[0] + bounds[2]) / 2; // (left + right) / 2
            var centerY = (bounds[1] + bounds[3]) / 2; // (top + bottom) / 2
            var textPosition = [centerX, centerY];

            // Create a text frame at the center of the polygon
            var textFrame = doc.textFrames.add();
            textFrame.position = textPosition;
            textFrame.contents = textContent;

            // Optional: Style the text (e.g., font size)
            textFrame.textRange.characterAttributes.size = 8; // Set font size
            textFrame.textRange.justification = Justification.CENTER; // Center the text
        }
    }
}

// Run the function
displayPolygonAreasWithText();
