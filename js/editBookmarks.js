$(document).ready(function () {
	$("#btnEdit").click(toggleEditing);
});

function toggleEditing (e) {
	var btnEdit = $("#btnEdit");
	if (btnEdit.hasClass("btn-warning")) {
		btnEdit.removeClass("btn-warning");
		$("#btnImport").prop("disabled", false);
		$("#btnAdd").prop("disabled", false);

		if ($("#btnAbout").hasClass("btn-light")) {
			btnEdit.addClass("btn-light");
		} else {
			btnEdit.addClass("btn-dark");
		}

		$(".btnDel").hide(200);
		$(".btnDelGroup").hide(200);
		$(".bookmark").off("click", disableLink);
		$(".btnDel").off("click", deleteBookmark);
		$(".btnDelGroup").off("click", deleteGroup);
	} else {
		btnEdit.removeClass("btn-light btn-dark").addClass("btn-warning");
		$("#btnImport").prop("disabled", true);
		$("#btnAdd").prop("disabled", true);

		$(".btnDel").show(200);
		$(".btnDelGroup").show(200);
		$(".bookmark").click(disableLink);
		$(".btnDel").click(deleteBookmark);
		$(".btnDelGroup").click(deleteGroup);
	}
}

function deleteBookmark(e) {
	var item = $(this);
	var group = item.data("group");
	var key = item.data("key");
	var groupIndex = item.data("group-index");

	var bookmarkItem = $("#" + group + "-" + key);

	var openDBRequest = window.indexedDB.open("bookmarks");

	openDBRequest.onsuccess = function (e) {
		var db = e.target.result;
		var groupsStore = db.transaction("Groups", "readwrite").objectStore("Groups");

		groupsStore.get(groupIndex).onsuccess = function (getEvt) {
			var groupData = getEvt.target.result;

			// remove the bookmark from the group object
			var bookmarkData = {name: bookmarkItem.data("name"), address: bookmarkItem.data("address")};
			groupData.bookmarks = groupData.bookmarks.filter(function (item) {
				if (item.name != bookmarkData.name && item.address != bookmarkData.address)
					return true;
				return false;
			});

			// no need to provide key since keyPath is set
			groupsStore.put(groupData);
			bookmarkItem.remove();
		}
	}

	openDBRequest.onerror = function (evt) {
		console.log("Error", evt);
		window.alert("There was an error deleting the bookmark");
	}
}

function deleteGroup(e) {
	var group = $(this); // the delete group button
	var groupIndex = group.data("group");

	var openDBRequest = window.indexedDB.open("bookmarks");

	openDBRequest.onsuccess = function (dbe) {
		var db = dbe.target.result;

		var groupsStore = db.transaction("Groups", "readwrite").objectStore("Groups");

		groupsStore.getAll().onsuccess = function (getEvt) {
			var groups = getEvt.target.result;

			var lastIndex = -1;
			for (item of groups) {
				if (item.groupIndex > groupIndex) {
					lastIndex = item.groupIndex;
					item.groupIndex--;
					groupsStore.put(item);
				}
			}

			groupsStore.delete(lastIndex);
			loadBookmarks();
		}
	}

	openDBRequest.onerror = function (e) {
		console.error(e);
		window.alert("There was an error deleting the group");
	}
}

function disableLink(e) {
	e.preventDefault();
}
