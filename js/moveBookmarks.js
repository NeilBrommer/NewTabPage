function groupMoved(dropEvt) {
	var newIndex = dropEvt.newIndex;
	var oldIndex = dropEvt.oldIndex;

	var movedCard = $($(dropEvt.item).children()[0]);
	var groupName = movedCard.data("group-name");

	if (oldIndex != newIndex) {
		var openDBRequest = window.indexedDB.open("bookmarks");

		openDBRequest.onsuccess = function (openEvt) {
			var db = openEvt.target.result;
			var groupsStore = db.transaction("Groups", "readwrite").objectStore("Groups");

			// build an array of all groups
			var groups = [];
			groupsStore.openCursor().onsuccess = function (cursorEvt) {
				var cursor = cursorEvt.target.result;
				if (cursor) {
					groups.push(cursor.value);
					cursor.continue();
				} else {
					rearrangeGroups(groupsStore, groups, newIndex, oldIndex);
					db.close();
				}
			}
		}

		openDBRequest.onerror = function (err) {
			console.log(err);
			window.alert("Error moving group");
		}
	}
}

function rearrangeGroups(groupsStore, groups, newIndex, oldIndex) {
	var movedGroup = $("#group-" + oldIndex);

	if (newIndex > oldIndex) {
		for (var i = 0; i < groups.length; i++) {
			var g = groups[i];

			if (g.groupIndex > oldIndex && g.groupIndex <= newIndex) {
				g.groupIndex--;
				groupsStore.put(g);

				// modify the group's card
				var cardContainer = $("#group-" + (g.groupIndex + 1))
					.attr("id", "group" + g.groupIndex);

				$(cardContainer.children()[0]) // the card
					.attr("data-group-index", g.groupIndex);
			}
		}
	} else { // oldIndex > newIndex
		for (var i = 0; i < groups.length; i++) {
			var g = groups[i];

			if (g.groupIndex < oldIndex && g.groupIndex >= newIndex) {
				g.groupIndex++;
				groupsStore.put(g);

				// modify the group's card
				var cardContainer = $("#group-" + (g.groupIndex - 1))
					.attr("id", "group" + g.groupIndex);

				$(cardContainer.children()[0]) // the card
					.attr("data-group-index", g.groupIndex);
			}
		}
	}

	// update the moved group's data
	var movedGroupData = groups[oldIndex];
	movedGroupData.groupIndex = newIndex;
	groupsStore.put(movedGroupData);

	// update the group's card
	movedGroup.attr("id", "group" + newIndex);
	$(movedGroup.children()[0]).attr("data-group-index", newIndex);
}

function bookmarkMoved(dropEvt) {
	var oldIndex = dropEvt.oldIndex;
	var newIndex = dropEvt.newIndex;

	if (dropEvt.from != dropEvt.to) {
		var oldGroupIndex = $(dropEvt.from).parent().data("group-index");
		var newGroupIndex = $(dropEvt.to).parent().data("group-index");

		var item = $(dropEvt.item);
		var itemData = {name: item.data("name"), address: item.data("address")};

		var openDBRequest = window.indexedDB.open("bookmarks");

		openDBRequest.onsuccess = function (openEvt) {
			var db = openEvt.target.result;
			var groupsStore = db.transaction("Groups", "readwrite").objectStore("Groups");

			groupsStore.get(oldGroupIndex).onsuccess = function (getOldEvt) {
				var oldGroupData = getOldEvt.target.result;

				groupsStore.get(newGroupIndex).onsuccess = function (getNewEvt) {
					var newGroupData = getNewEvt.target.result;

					oldGroupData.bookmarks = removeFromArray(oldGroupData.bookmarks, oldIndex);
					groupsStore.put(oldGroupData);

					newGroupData.bookmarks = addToArray(newGroupData.bookmarks, itemData, newIndex);
					groupsStore.put(newGroupData);

					db.close();
				}
			}
		}

		openDBRequest.onerror = function (err) {
			console.error(err);
			window.alert("Error moving bookmark");
		}
	} else if (oldIndex != newIndex) {
		var groupIndex = $(dropEvt.from).parent().data("group-index");

		var openDBRequest = window.indexedDB.open("bookmarks");

		openDBRequest.onsuccess = function (openEvt) {
			var db = openEvt.target.result;
			var groupsStore = db.transaction("Groups", "readwrite").objectStore("Groups");

			groupsStore.get(groupIndex).onsuccess = function (getEvt) {
				var groupData = getEvt.target.result;

				var item = groupData.bookmarks[oldIndex];

				groupData.bookmarks = removeFromArray(groupData.bookmarks, oldIndex);
				groupData.bookmarks = addToArray(groupData.bookmarks, item, newIndex);

				groupsStore.put(groupData);
				db.close();
			}
		}

		openDBRequest.onerror = function (err) {
			console.error(err);
			window.alert("Error moving bookmark");
		}
	}
}
