$(document).ready(function () {
	$("#btnEdit").click(toggleEditing);
});

function toggleEditing () {
	if ($("#btnEdit").hasClass("btn-warning"))
		disableEditing();
	else
		enableEditing();
}

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
			groupsStore.getAll().onsuccess = function (getAllEvt) {
				var groups = getAllEvt.target.result;

				if (newIndex > oldIndex) {
					for (let g of groups) {
						if (g.groupIndex > oldIndex && g.groupIndex <= newIndex) {
							g.groupIndex--;
							groupsStore.put(g);

							// modify the group's card
							var cardContainer = $("#group-" + (g.groupIndex + 1))
								.attr("id", "group" + g.groupIndex);

							var card = $(cardContainer.children()[0])
								.attr("data-group-index", g.groupIndex);
						}
					}
				} else { // oldIndex > newIndex
					for (let g of groups) {
						if (g.groupIndex < oldIndex && g.groupIndex >= newIndex) {
							g.groupIndex++;
							groupsStore.put(g);

							// modify the group's card
							var cardContainer = $("#group-" + (g.groupIndex - 1));
							cardContainer.attr("id", "group" + g.groupIndex);

							var card = $(cardContainer.children()[0]);
							card.attr("data-group-index", g.groupIndex);
						}
					}
				}

				// update the moved group's data
				var movedGroupData = groups[oldIndex];
				movedGroupData.groupIndex = newIndex;
				groupsStore.put(movedGroupData);

				// update the group's card
				$(dropEvt.item).attr("id", "group" + newIndex);
				movedCard.attr("data-group-index", newIndex);

				db.close();
			}
		}

		openDBRequest.onerror = function (err) {
			console.log(err);
			window.alert("Error moving group");
		}
	}
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

			groupsStore.getAll().onsuccess = function (getAllEvt) {
				var groups = getAllEvt.target.result;

				var oldGroupData = groups[oldGroupIndex];
				var newGroupData = groups[newGroupIndex];

				oldGroupData.bookmarks = removeFromArray(oldGroupData.bookmarks, oldIndex);
				groupsStore.put(oldGroupData);

				newGroupData.bookmarks = addToArray(newGroupData.bookmarks, itemData, newIndex);
				groupsStore.put(newGroupData);

				db.close();
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
			bookmarkItem.hide(300, "swing", e => bookmarkItem.remove());

			db.close();
		}
	}

	openDBRequest.onerror = function (err) {
		console.log("Error", err);
		window.alert("There was an error deleting the bookmark");
	}
}

function deleteGroup() {
	var group = $(this); // the delete group button
	var groupIndex = group.parent().parent().data("group-index");

	var openDBRequest = window.indexedDB.open("bookmarks");

	openDBRequest.onsuccess = function (openEvt) {
		var db = openEvt.target.result;
		var groupsStore = db.transaction("Groups", "readwrite").objectStore("Groups");

		groupsStore.getAll().onsuccess = function (getAllEvt) {
			var groups = getAllEvt.target.result;

			for (let item of groups) {
				if (item.groupIndex > groupIndex) {
					item.groupIndex--;
					groupsStore.put(item);
				}
			}

			groupsStore.delete(groups.length - 1);
			db.close();

			$("#cardList").children().each(function (index, item) {
				item = $(item);
				if (index == groupIndex) {
					item.hide(300, "swing", e => item.remove());
				} else if (index > groupIndex) {
					// modify id and data to reflect new index
					$(item.children()[0]).attr("data-group-index", index - 1);
					item.attr("id", "group-" + (index - 1));
				}
			});
		}
	}

	openDBRequest.onerror = function (err) {
		console.error(err);
		window.alert("There was an error deleting the group");
	}
}

function enableEditing() {
	$("#btnEdit").removeClass("btn-light btn-dark").addClass("btn-warning");
	$("#btnImport").prop("disabled", true);
	$("#btnAdd").prop("disabled", true);

	$(".bookmarkGroup").each(function (index, item) {
		var item = $(item);
		item.sortable({
			group: { name: "bookmarkLists", pull: true, put: true },
			draggable: ".bookmark",
			handle: ".dragHandle",
			animation: 100,
			onEnd: bookmarkMoved
		});
	});

	$("#cardList").sortable({
		group: { name: "bookmarksGroups" },
		draggable: ".bookmarkGroupContainer",
		handle: ".dragGroupHandle",
		animation: 100,
		onEnd: groupMoved
	});

	$(".btnDel").show(200);
	$(".btnDelGroup").show(200);
	$(".dragHandle").show(200);
	$(".dragGroupHandle").show(200);
	$(".bookmark").click(disableLink);
	$(".btnDel").click(deleteBookmark);
	$(".btnDelGroup").click(deleteGroup);
}

function disableEditing() {
	$(".bookmarkGroup").each(function (index, item) {
		$(item).sortable("destroy");
	});
	$("#cardList").sortable("destroy");

	$("#btnEdit").removeClass("btn-warning");
	$("#btnImport").prop("disabled", false);
	$("#btnAdd").prop("disabled", false);

	if ($("#btnAbout").hasClass("btn-light")) {
		$("#btnEdit").addClass("btn-light");
	} else {
		$("#btnEdit").addClass("btn-dark");
	}

	$(".btnDel").hide(200);
	$(".btnDelGroup").hide(200);
	$(".dragHandle").hide(200);
	$(".dragGroupHandle").hide(200);
	$(".bookmark").off("click", disableLink);
	$(".btnDel").off("click", deleteBookmark);
	$(".btnDelGroup").off("click", deleteGroup);
}

function removeFromArray(arr, index) {
	var newArr = [];
	arr.forEach(function (item, i) {
		if (i != index)
			newArr.push(item);
	});

	return newArr;
}

function addToArray(arr, itemToAdd, index) {
	if (index == arr.length) {
		arr.push(item);
		return arr;
	}

	var newArr = [];
	arr.forEach(function (item, i) {
		if (i == index)
			newArr.push(itemToAdd);

		newArr.push(item);
	});

	return newArr;
}

function disableLink(e) {
	e.preventDefault();
}
