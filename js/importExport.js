$(document).ready(function () {
	$("#importExportModal").on("shown.bs.modal", function () {
		var data = JSON.stringify(bookmarkList, null, 4);
		if (data != null)
			$("#exportText").text(data);
		else
			$("#exportText").text("[]");
	});

	$("#btnImportDialog").click(importBookmarks);

	$("#exportText").click(function () {
		$("#exportText").select();
	});
});

function importBookmarks() {
	try {
		var newData = $.parseJSON($("#importText").val());
	} catch (err) {
		console.error("Import failed: " + err.message);
		window.alert("Invalid Format");
		return;
	}

	if (verifyBookmarks(newData)) {
		setList(newData);

		$("#importExportModal").modal("hide");
	} else {
		window.alert("Invalid Format");
	}
}

function setList(data) {
	// empty the DB and fill it with the new data
	bookmarkList = data;

	try {
		indexedDB.deleteDatabase("bookmarks");
	} catch (err) {
		// it's OK if the DB doesn't exist
		if (err.name != "NotFoundError") {
			console.error(err);
			return;
		}
	}
	var openDBRequest = window.indexedDB.open("bookmarks", 1);

	openDBRequest.onsuccess = function (e) {
		dbVersion = db.version;
		db.close();
		loadBookmarks();
	}

	openDBRequest.onerror = function (err) { console.error(err); }

	openDBRequest.onupgradeneeded = function (e) {
		db = e.target.result;

		var groupStore = initDB(db);

		// create the object stores
		for (var i = 0; i < data.length; i++) {
			addGroup(data[i], groupStore, db, i);
		}
	}
}

function verifyBookmarks(bookmarks) {
	if (!Array.isArray(bookmarks))
		return false;

	for (var i = 0; i < bookmarks.length; i++) {
		var item = bookmarks[i];

		if (item == null || typeof item != "object")
			return false;

		if (item.title == null || typeof item.title != "string")
			return false;

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
