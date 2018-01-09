function deleteGroup() {
	var group = $(this); // the delete group button
	var groupIndex = group.parent().parent().data("group-index");

	var openDBRequest = window.indexedDB.open("bookmarks");

	openDBRequest.onsuccess = function (openEvt) {
		var db = openEvt.target.result;
		var groupsStore = db.transaction("Groups", "readwrite").objectStore("Groups");

		var lastIndex = -1;
		groupsStore.openCursor().onsuccess = function (cursorEvt) {
			var cursor = cursorEvt.target.result;
			if (cursor) {
				var item = cursor.value;
				var cardContainer = $("#group-" + item.groupIndex);

				if (item.groupIndex > lastIndex)
					lastIndex = item.groupIndex;

				if (item.groupIndex == groupIndex) {
					cardContainer.hide(300, "swing", function () { cardContainer.remove(); });
				}

				if (item.groupIndex > groupIndex) {
					item.groupIndex--;
					groupsStore.put(item);

					$(cardContainer.children()[0]).attr("data-group-index", item.groupIndex);
					cardContainer.attr("id", "group-" + item.groupIndex);
				}

				cursor.continue();
			} else {
				groupsStore.delete(lastIndex);
				db.close();
			}
		}
	}

	openDBRequest.onerror = function (err) {
		console.error(err);
		window.alert("There was an error deleting the group");
	}
}

function deleteBookmark(e) {
	var item = $(this).parent();
	var groupName = item.parent().parent().data("group-name");
	var groupIndex = item.parent().parent().data("group-index");
	var bookmarkIndex = item.index();
	var bookmarkItem = $("#" + groupName + "-" + bookmarkIndex);

	var openDBRequest = window.indexedDB.open("bookmarks");

	openDBRequest.onsuccess = function (openEvt) {
		var db = openEvt.target.result;
		var groupsStore = db.transaction("Groups", "readwrite").objectStore("Groups");

		groupsStore.get(groupIndex).onsuccess = function (getEvt) {
			var groupData = getEvt.target.result;

			groupData.bookmarks = removeFromArray(groupData.bookmarks, bookmarkIndex);

			groupsStore.put(groupData);
			bookmarkItem.hide(300, "swing", function () { bookmarkItem.remove(); });

			db.close();
		}
	}

	openDBRequest.onerror = function (err) {
		console.log("Error", err);
		window.alert("There was an error deleting the bookmark");
	}
}
