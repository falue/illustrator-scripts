// Isogrid Generator Script for Illustrator
#target illustrator

function mmToPt(mm) {
    return mm * 2.83464567;
}

function showDialog() {
    var dlg = new Window("dialog", "Isogrid Generator");
    dlg.alignChildren = "fill";

    function addField(label, def) {
        var g = dlg.add("group");
        g.add("statictext", undefined, label);
        var input = g.add("edittext", undefined, def);
        input.characters = 6;
        return input;
    }

    var triangleWidthField = addField("Triangle width (mm):", "45");
    var strokeWidthField   = addField("Thickness (mm):", "4.0");
    var xOffsetField       = addField("X offset (mm):", "0");
    var yOffsetField       = addField("Y offset (mm):", "0");

    var circleGroup = dlg.add("panel", undefined, "Circles at Intersections");
    circleGroup.orientation = "column";
    circleGroup.alignChildren = "left";
    var enableCircles = circleGroup.add("checkbox", undefined, "Draw Circles ø (mm)");
    var circleSizeField = circleGroup.add("edittext", undefined, "2");
    circleSizeField.characters = 6;

    var buttons = dlg.add("group");
    buttons.alignment = "center";
    buttons.add("button", undefined, "Cancel", { name: "cancel" });
    var okBtn = buttons.add("button", undefined, "Generate", { name: "ok" });

    if (dlg.show() !== 1) return null;

    var legVal = parseFloat(triangleWidthField.text);
    if (isNaN(legVal) || legVal <= 0) {
        alert("Please enter a valid triangle width (mm). It must be a number greater than 0.");
        return null;
    }

    return {
        leg: mmToPt(legVal),
        stroke: mmToPt(parseFloat(strokeWidthField.text)),
        offsetX: mmToPt(parseFloat(xOffsetField.text)),
        offsetY: mmToPt(parseFloat(yOffsetField.text)),
        drawCircles: enableCircles.value,
        circleSize: mmToPt(parseFloat(circleSizeField.text))
    };
}

function outlineStroke(obj) {
    if (!obj) return;
    app.selection = null;
    try {
        if (obj.length && typeof obj.length === "number") {
            for (var i = 0; i < obj.length; i++) {
                if (obj[i]) obj[i].selected = true;
            }
        } else {
            obj.selected = true;
        }
        // If you're here, create an action that is named
        // "Isogrid-helper-outlineStroke" in a new action folder called "Custom".
        // The only action in it is "Object > path > create Outlines" as this cannot be done by scripting
        app.doScript("Isogrid-helper-outlineStroke", "Custom", false);
    } catch (e) {
        alert("Error in outlineStroke():\n" + e);
    }
}

function intersect() {
    app.executeMenuCommand("group");
    app.executeMenuCommand("Live Pathfinder Intersect");
    app.executeMenuCommand("expandStyle");
    app.executeMenuCommand("ungroup");
}

function subtract() {
    app.executeMenuCommand("group");
    app.executeMenuCommand("Live Pathfinder Subtract");
    app.executeMenuCommand("expandStyle");
    app.executeMenuCommand("ungroup");
}

function drawIsogrid(opts) {
    var doc = app.activeDocument;
    var sel = doc.selection;

    if (sel.length !== 1) {
        alert("Please select exactly one closed polygon.");
        return;
    }

    var originalShape = sel[0];
    var bounds = originalShape.geometricBounds;
    var leg = opts.leg;
    var triHeight = Math.sqrt(3) / 2 * leg;
    var hatchGroup = doc.activeLayer.groupItems.add();

    var xMin = bounds[0] + opts.offsetX;
    var yMax = bounds[1] + opts.offsetY;
    var xMax = bounds[2] + opts.offsetX;
    var yMin = bounds[3] + opts.offsetY;

    for (var y = yMin; y <= yMax + triHeight * 6; y += triHeight) {
        var isEven = Math.round((y - yMin) / triHeight) % 2 === 0;
        for (var x = xMin - leg; x <= xMax + leg; x += leg) {
            var xOff = isEven ? 0 : leg / 2;
            var x0 = x + xOff;
            var y0 = y;
            var p1 = [x0, y0];
            var p2 = [x0 + leg / 2, y0 + triHeight];
            var p3 = [x0 - leg / 2, y0 + triHeight];

            var l1 = doc.pathItems.add();
            l1.setEntirePath([p1, p2]);
            l1.stroked = true;
            l1.strokeWidth = opts.stroke;
            l1.filled = false;
            l1.move(hatchGroup, ElementPlacement.PLACEATEND);

            var l2 = doc.pathItems.add();
            l2.setEntirePath([p1, p3]);
            l2.stroked = true;
            l2.strokeWidth = opts.stroke;
            l2.filled = false;
            l2.move(hatchGroup, ElementPlacement.PLACEATEND);

            var l3 = doc.pathItems.add();
            l3.setEntirePath([p2, p3]);
            l3.stroked = true;
            l3.strokeWidth = opts.stroke;
            l3.filled = false;
            l3.move(hatchGroup, ElementPlacement.PLACEATEND);
        }
    }

    outlineStroke(hatchGroup);

    var shapeOutline = originalShape.duplicate();
    shapeOutline.stroked = true;
    shapeOutline.strokeWidth = opts.leg;
    shapeOutline.filled = false;
    outlineStroke(shapeOutline);
    
    var filledMask = originalShape.duplicate();
    filledMask.stroked = false;
    filledMask.filled = true;

    app.selection = null;
    filledMask.selected = true;
    hatchGroup.selected = true;
    intersect();
    var clippedGrid = app.selection[0];

    clippedGrid.zOrder(ZOrderMethod.BRINGTOFRONT);
    app.selection = null;
    shapeOutline.selected = true;
    clippedGrid.selected = true;
    subtract();

    var finalSelection = app.selection;
    for (var i = 0; i < finalSelection.length; i++) {
        if (finalSelection[i].stroked) finalSelection[i].strokeWidth = 1;
    }

    // Create triangle group
    var triangleGroup = doc.activeLayer.groupItems.add();
    for (var i = 0; i < finalSelection.length; i++) {
        finalSelection[i].move(triangleGroup, ElementPlacement.PLACEATEND);
    }

    // Only draw and group circles if enabled
    if (opts.drawCircles) {
        var circleGroup = doc.activeLayer.groupItems.add();

        for (var y = yMin; y <= yMax + triHeight * 6; y += triHeight) {
            var isEven = Math.round((y - yMin) / triHeight) % 2 === 0;
            for (var x = xMin - leg; x <= xMax + leg; x += leg) {
                var xOff = isEven ? 0 : leg / 2;
                var x0 = x + xOff;
                var y0 = y;
                var pts = [
                    [x0, y0],
                    [x0 + leg / 2, y0 + triHeight],
                    [x0 - leg / 2, y0 + triHeight]
                ];
                for (var i = 0; i < pts.length; i++) {
                    var pt = pts[i];
                    if (pt[0] >= bounds[0] && pt[0] <= bounds[2] && pt[1] <= bounds[1] && pt[1] >= bounds[3]) {
                        var circ = doc.pathItems.ellipse(
                            pt[1] + opts.circleSize / 2,
                            pt[0] - opts.circleSize / 2,
                            opts.circleSize,
                            opts.circleSize
                        );
                        circ.stroked = true;
                        circ.strokeWidth = 1;
                        circ.filled = false;
                        circ.move(circleGroup, ElementPlacement.PLACEATEND);
                    }
                }
            }
        }

        // Group triangles and circles together
        var masterGroup = doc.activeLayer.groupItems.add();
        triangleGroup.move(masterGroup, ElementPlacement.PLACEATEND);
        circleGroup.move(masterGroup, ElementPlacement.PLACEATEND);
    }


    // alert("Isogrid complete.");
}

if (app.documents.length === 0 || app.activeDocument.selection.length !== 1) {
    alert("No document open or not 1 object selected.");
} else {
    var options = showDialog();
    if (options) drawIsogrid(options);
}
