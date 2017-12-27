$(document).ready(function () {
	$("#newBookmarkModal").on("shown.bs.modal", function () {
		var combo = $("#newBookmarkGroup");
		combo.empty();
		combo.append($("<option>").attr({ "value": "--" })
			.text("New Group"));

		for (let group of bookmarkList) {
			if (group != null)
				combo.append($("<option>").attr({ "value": group.groupIndex })
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

		var openDBRequest = window.indexedDB.open("bookmarks");
		openDBRequest.onsuccess = function (e) {
			var db = e.target.result;
			var groupsStore = db.transaction("Groups", "readwrite").objectStore("Groups");

			groupsStore.getAll().onsuccess = function (evt) {
				// find the largest index and use that +1
				var groups = evt.target.result;

				var largest = -1;
				for (var group of groups) {
					if (group.groupIndex > largest)
						largest = group.groupIndex;
				}

				var newGroup = {
					groupIndex: largest + 1,
					title: newGroupName,
					bookmarks: [ { name: bkmkName, address: bkmkAddress } ]
				};

				groupsStore.add(newGroup);
				// don't need to add to bookmarkList because loadBookmarks is
				// being called

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

			var groupsStore = db.transaction("Groups", "readwrite").objectStore("Groups");

			var groupReq = groupsStore.get(parseInt(bkmkGroup));
			groupReq.onsuccess = function (evt) {
				var group = groupReq.result;

				var newItem = { "name": bkmkName, "address": bkmkAddress };
				group.bookmarks.push(newItem);
				groupsStore.put(group);

				db.close();
				loadBookmarks();
				$(".modal").modal("hide");
			}
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
