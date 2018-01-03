$(document).ready(function () {
	$("#importExportModal").on("shown.bs.modal", showBookmarkData);
	$("#importExportModal").on("show.bs.modal", showImportModal);
	$("#btnImportDialog").click(importBookmarks);
	$("#copyExport").click(copyExport);
});

function showImportModal() {
	$("#copyExportTxt").removeClass("text-success text-danger").addClass("text-muted").text("Copy");
	$("#exportText").val("");
	$("#importText").val("");
}

function showBookmarkData() {
	var openDBRequest = window.indexedDB.open("bookmarks");

	openDBRequest.onsuccess = function (openEvt) {
		var db = openEvt.target.result;

		var bookmarkList = [];
		db.transaction("Groups").objectStore("Groups").openCursor().onsuccess = function (cursorEvt) {
			var cursor = cursorEvt.target.result;
			if (cursor) {
				bookmarkList.push(cursor.value);
				cursor.continue();
			} else {
				var data = JSON.stringify(bookmarkList, null, 4);
				$("#exportText").val(data);
				db.close();
			}
		}
	}
}

function importBookmarks() {
	try {
		var newData = $.parseJSON($("#importText").val());
	} catch (err) {
		console.error(err);
		window.alert("Invalid Format");
		return;
	}

	if (validateBookmarks(newData)) {
		$("#btnImportDialog").prop("disabled", true);
		setList(newData);
	} else {
		window.alert("Invalid Format");
	}
}

function setList(data) {
	// empty the DB and fill it with the new data
	var openDBRequest = window.indexedDB.open("bookmarks");

	openDBRequest.onsuccess = function (openEvt) {
		db = openEvt.target.result;

		var groupStore = db.transaction("Groups", "readwrite").objectStore("Groups");
		groupStore.clear();

		for (var i = 0; i < data.length; i++) {
			groupStore.add(data[i]);
		}

		$("#importExportModal").modal("hide");
		$("#btnImportDialog").prop("disabled", false);

		db.close();
		loadBookmarks();
	}

	openDBRequest.onerror = function (err) {
		console.error(err);
		window.alert("Error importing bookmarks");
	}
}

function validateBookmarks(bookmarks) {
	var indexes = [];

	if (!Array.isArray(bookmarks))
		return false;

	for (var i = 0; i < bookmarks.length; i++) {
		var item = bookmarks[i];

		if (item == null || typeof item != "object")
			return false;

		if (item.title == null || typeof item.title != "string")
			return false;

		if (item.groupIndex == null || typeof item.groupIndex != "number")
			return false;

		if (arrayContains(indexes, item.groupIndex))
			return false;

		indexes.push(item.groupIndex);

		for (var j = 0; j < item.bookmarks.length; j++) {
			var bkmk = item.bookmarks[j];

			if (bkmk == null || typeof bkmk != "object")
				return false;

			if (bkmk.name == null || typeof bkmk.name != "string")
				return false;

			if (bkmk.address == null || typeof bkmk.address != "string")
				return false;
		}
	}

	return true;
}

function arrayContains(array, searchFor) {
	for (var i = 0; i < array.length; i++) {
		if (array[i] == searchFor)
			return true;
	}

	return false;
}

function copyExport(e) {
	e.preventDefault();

	var exportBox = $("#exportText");
	var copyLink = $("#copyExportTxt");
	exportBox.select();

	try {
		var successful = document.execCommand("copy");
		if (successful) {
			copyLink.removeClass("text-muted").addClass("text-success").text("Copied successfully!");
		} else {
			copyLink.removeClass("text-muted").addClass("text-danger").text("Copy failed");
		}
	} catch (err) {
		copyLink.removeClass("text-muted").addClass("text-danger").text("Copy failed");
	}
}
