$(document).ready(function () {
	$("#newBookmarkModal").on("shown.bs.modal", function () {
		var combo = $("#newBookmarkGroup");
		combo.empty();
		combo.append($("<option>").attr({ "value": "--" })
			.text("New Group"));

		for (let group of bookmarkList) {
			if (group != null)
				combo.append($("<option>").attr({ "value": group.title })
					.text(group.title));
		}

		$("#createGroup").prop("required", true);
	});

	$("#addBookmarkForm").submit(addNewBookmark);

	$("#newBookmarkGroup").on("change", selectGroupChanged);
});

function addNewBookmark(e) {
	e.preventDefault();

	// read in data from the form
	var bkmkName = $("#newBookmarkName").val();
	var bkmkAddress = $("#newBookmarkURL").val();
	var bkmkGroup = $("#newBookmarkGroup").val();

	if (bkmkGroup == "--") { // create a new group
		var newGroupName = $("#newBookMarkGroupNew").val();

		var newGroup = {
			"title": newGroupName,
			"bookmarks": [ { "name": bkmkName, "address": bkmkAddress } ]
		};

		var openDBRequest = window.indexedDB.open("bookmarks", dbVersion + 1);
		openDBRequest.onupgradeneeded = function (e) {
			var db = e.target.result;
			dbVersion++;

			if (db.objectStoreNames.contains(newGroup.title)) {
				window.alert("The group already exists");
				return;
			}

			var objStore = db.createObjectStore(newGroup.title, { autoIncrement: true });
			objStore.createIndex("name", "name", { unique: false });
			objStore.createIndex("address", "address", { unique: false });


			var bookmarks = newGroup.bookmarks;
			for (var i = 0; i < bookmarks.length; i++) {
				var bkmk = bookmarks[i];
				objStore.add({ "name": bkmk.name, "address": bkmk.address }, i);
			}
		}
		openDBRequest.onsuccess = function (e) {
			var db = e.target.result;

			var indexStore = db.transaction(["groupIndexes"], "readwrite")
				.objectStore("groupIndexes");

			indexStore.getAll().onsuccess = function (evt) {
				var items = evt.target.result;
				var largest = 0;
				for (let item of items) {
					if (item.groupIndex >= largest)
						largest = item.groupIndex + 1;
				}

				indexStore.add({ "title": newGroup.title, "groupIndex": largest });
				bookmarkList[largest] = newGroup;

				db.close();
				loadBookmarks();
				$(".modal").modal("hide");
			}
		}

		openDBRequest.onerror = function (e) { console.log(e); }
	} else { // add to existing group
		var openDBRequest = window.indexedDB.open("bookmarks");
		openDBRequest.onsuccess = function (e) {
			var db = e.target.result;
			var newItem = { "name": bkmkName, "address": bkmkAddress };

			db.transaction([bkmkGroup], "readwrite")
				.objectStore(bkmkGroup)
				.add(newItem);

			for (let group of bookmarkList) {
				if (group.title == bkmkGroup) {
					group.bookmarks.push(newItem);
					break;
				}
			}

			db.close();
			loadBookmarks();
			$(".modal").modal("hide");
		}

		openDBRequest.onerror = function (e) { console.log(e); }
	}
}

function selectGroupChanged(value) {
	var groupText = $("#createGroup");
	if (value == "--") {
		groupText.show();
		groupText.prop("required", true);
	} else {
		groupText.hide();
		groupText.prop("required", false);
	}
}
