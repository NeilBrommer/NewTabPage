$(document).ready(function () {
	$("#newBookmarkModal").on("shown.bs.modal", populateGroupList);
	$("#addBookmarkForm").submit(addNewBookmark);
	$("#newBookmarkGroup").on("change", selectGroupChanged);
});

function populateGroupList() {
	var combo = $("#newBookmarkGroup");
	combo.empty();
	combo.append($("<option>").attr({ "value": "--" })
		.text("New Group"));

	var openDBRequest = window.indexedDB.open("bookmarks");

	openDBRequest.onsuccess = function (openEvt) {
		var db = openEvt.target.result;
		var groupsStore = db.transaction("Groups", "readwrite").objectStore("Groups");

		groupsStore.getAll().onsuccess = function (getAllEvt) {
			var groups = getAllEvt.target.result;

			for (let group of groups) {
				combo.append($("<option>")
					.attr({ "value": group.groupIndex })
					.text(group.title));
			}

			$("#createGroup").prop("required", true);
			db.close();
		}
	}

	openDBRequest.onerror = function (err) {
		console.error(err);
		window.alert("Error building groups list");
	}
}

function addNewBookmark(e) {
	e.preventDefault();

	// read in data from the form
	var bkmkName = $("#newBookmarkName").val();
	var bkmkAddress = $("#newBookmarkURL").val();
	var bkmkGroup = $("#newBookmarkGroup").val();

	if (bkmkGroup == "--") { // create a new group
		var newGroupName = $("#newBookMarkGroupNew").val();

		var openDBRequest = window.indexedDB.open("bookmarks");
		openDBRequest.onsuccess = function (openEvt) {
			var db = openEvt.target.result;
			var groupsStore = db.transaction("Groups", "readwrite").objectStore("Groups");

			groupsStore.count().onsuccess = function (countEvt) {
				var numGroups = countEvt.target.result;

				var newGroup = {
					groupIndex: numGroups,
					title: newGroupName,
					bookmarks: [ { name: bkmkName, address: bkmkAddress } ]
				};

				groupsStore.add(newGroup);

				db.close();
				loadBookmarks();
				$("#newBookmarkModal").modal("hide");
			}
		}

		openDBRequest.onerror = function (err) {
			console.log(err);
			window.alert("There was an error creating the bookmark");
		}
	} else { // add to existing group
		var openDBRequest = window.indexedDB.open("bookmarks");
		openDBRequest.onsuccess = function (openEvt) {
			var db = openEvt.target.result;
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

		openDBRequest.onerror = function (err) {
			console.log(err);
			window.alert("There was an error creating the bookmark");
		}
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
