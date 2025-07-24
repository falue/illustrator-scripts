#target illustrator

function displayPolygonPerimetersSimple() {
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

    function distance(p1, p2) {
        var dx = p2[0] - p1[0];
        var dy = p2[1] - p1[1];
        return Math.sqrt(dx * dx + dy * dy);
    }

    for (var i = 0; i < sel.length; i++) {
        var path = sel[i];
        if (path.typename !== "PathItem" || !path.closed) continue;

        var points = path.pathPoints;
        var total = 0;

        for (var j = 0; j < points.length; j++) {
            var curr = points[j];
            var next = points[(j + 1) % points.length];

            var anchor1 = curr.anchor;
            var right = curr.rightDirection;
            var left = next.leftDirection;
            var anchor2 = next.anchor;

            // Approximate Bézier segments
            if (
                anchor1.toString() !== right.toString() ||
                anchor2.toString() !== left.toString()
            ) {
                var steps = 10;
                var prev = anchor1;
                for (var t = 1; t <= steps; t++) {
                    var tt = t / steps;
                    var x = Math.pow(1 - tt, 3) * anchor1[0] +
                            3 * Math.pow(1 - tt, 2) * tt * right[0] +
                            3 * (1 - tt) * Math.pow(tt, 2) * left[0] +
                            Math.pow(tt, 3) * anchor2[0];
                    var y = Math.pow(1 - tt, 3) * anchor1[1] +
                            3 * Math.pow(1 - tt, 2) * tt * right[1] +
                            3 * (1 - tt) * Math.pow(tt, 2) * left[1] +
                            Math.pow(tt, 3) * anchor2[1];
                    total += distance(prev, [x, y]);
                    prev = [x, y];
                }
            } else {
                total += distance(anchor1, anchor2);
            }
        }

        var lengthMM = total / 2.834645669;
        var textContent = "Perimeter: " + lengthMM.toFixed(2);

        var bounds = path.geometricBounds;
        var centerX = (bounds[0] + bounds[2]) / 2;
        var centerY = (bounds[1] + bounds[3]) / 2;

        var textFrame = doc.textFrames.add();
        textFrame.position = [centerX, centerY];
        textFrame.contents = textContent;
        textFrame.textRange.characterAttributes.size = 8;
        textFrame.textRange.justification = Justification.CENTER;
    }

    // alert("Perimeter labels added in mm.");
}

displayPolygonPerimetersSimple();
