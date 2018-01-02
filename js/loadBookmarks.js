$(document).ready(function () {
	loadBookmarks();
});

function loadBookmarks() {
	$("#cardList").empty();
	var openDBRequest = window.indexedDB.open("bookmarks");

	openDBRequest.onsuccess = function (openEvt) {
		db = openEvt.target.result;

		db.transaction("Groups", "readonly").objectStore("Groups").getAll().onsuccess = function (groupsEvt) {
			var groups = groupsEvt.target.result;
			groups.sort(function (a, b) {
				return a.groupIndex - b.groupIndex;
			});

			// use a placholder to prevent problems with sortable
			var cardList = $("#cardList");
			for (let groupData of groups) {
				var placeholder = $("<div>").attr("id", "group-" + groupData.groupIndex)
					.addClass("bookmarkGroupContainer")
					.appendTo(cardList);
				buildCard(groupData.title, groupData.groupIndex, groupData.bookmarks)
					.appendTo(placeholder);
			}

			db.close();
		};
	}

	openDBRequest.onupgradeneeded = function (openEvt) {
		db = openEvt.target.result;

		var groupStore = db.createObjectStore("Groups", { keyPath: "groupIndex" });
		groupStore.createIndex("groupIndex", "groupIndex", { unique: true });
		groupStore.createIndex("title", "title", { unique: false });
		groupStore.createIndex("bookmarks", "bookmarks", { unique: false });

		var groupData = {
			groupIndex: 0,
			title: "Examples",
			bookmarks: [
				{
					"name": "Github",
					"address": "https://github.com/"
				},
				{
					"name": "This project on Github",
					"address": "https://github.com/NeilBrommer/NewTabPage"
				}
			]
		};

		groupStore.add(groupData);

		$("#aboutModal").modal("show");
	}

	openDBRequest.onerror = function (err) {
		console.error(err);
		window.alert("Error loading bookmarks");
	}
}

function buildCard(title, groupIndex, itemList) {
	var card = $("<div>");
	card.attr({
		"id": "group-" + title,
		"class": "card",
		"data-group-name": title,
		"data-group-index": groupIndex
	});

	var cardHead = $("<div>").addClass("card-header").text(title).appendTo(card);
	$("<span>") // use wrapper, sortable has issues with <svg> dragHandle
		.addClass("mr-2 start-hidden dragGroupHandle")
		.append($("<span>").addClass("fas fa-bars")) // move group icon
		.prependTo(cardHead);
	$("<span>") // delete group button
		.addClass("btnDelGroup far fa-trash-alt float-right mt-1 start-hidden text-danger clickable")
		.appendTo(cardHead);

	var cardList = $("<div>")
		.addClass("list-group list-group-flush bookmarkGroup")
		.appendTo(card);

	itemList.forEach(function (item, i) {
		var handle = $("<span>") // use wrapper, sortable has issues with <svg> dragHandle
			.addClass("mr-2 start-hidden dragHandle")
			.append($("<span>").addClass("fas fa-bars"));

		var del = $("<span>")
			.addClass("btnDel far fa-trash-alt float-right mt-1 start-hidden text-danger");
		del.css("cursor: pointer;");

		$("<a>")
			.attr({
				"id": title + "-" + i,
				"class": "list-group-item list-group-item-action bookmark",
				"href": item.address,
				"data-name": item.name,
				"data-address": item.address
			})
			.text(item.name)
			.prepend(handle)
			.append(del)
			.appendTo(cardList);
	});

	return card;
}
