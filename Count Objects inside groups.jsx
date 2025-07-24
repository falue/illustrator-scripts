#target illustrator

function countAllObjectsRecursive(items) {
    var count = 0;

    for (var i = 0; i < items.length; i++) {
        var item = items[i];

        if (item.typename === "GroupItem") {
            count += countAllObjectsRecursive(item.pageItems); // count children recursively
        } else {
            count++;
        }
    }

    return count;
}

function countSelectedDeep() {
    if (app.documents.length === 0) {
        alert("No document is open.");
        return;
    }

    var sel = app.activeDocument.selection;

    if (sel.length === 0) {
        alert("No objects selected.");
        return;
    }

    var total = countAllObjectsRecursive(sel);
    alert("Total objects selected (including inside groups and sub-groups): " + total);
}

countSelectedDeep();
