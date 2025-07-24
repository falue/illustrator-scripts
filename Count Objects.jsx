#target illustrator

function countSelectedObjects() {
    if (app.documents.length === 0) {
        alert("No document is open.");
        return;
    }

    var sel = app.activeDocument.selection;

    if (sel.length === 0) {
        alert("No objects selected.");
        return;
    }

    var total = sel.length;
    var groups = 0;

    for (var i = 0; i < sel.length; i++) {
        if (sel[i].typename === "GroupItem") {
            groups++;
        }
    }

    var msg = total + " object" + (total === 1 ? "" : "s") + " selected";
    if (groups > 0) {
        msg += ", of which " + groups + " " + (groups === 1 ? "is a" : "are") + " group" + (groups === 1 ? "" : "s");
    }

    alert(msg + ".");
}

countSelectedObjects();
