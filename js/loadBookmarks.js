$(document).ready(function () {
	loadBookmarks();
});

function loadBookmarks() {
	$("#cardList").empty();
	var openDBRequest = window.indexedDB.open("bookmarks");

	openDBRequest.onsuccess = function (dbEvt) {
		db = dbEvt.target.result;
		dbVersion = db.version;

		db.transaction(["Groups"], "readonly").objectStore("Groups").getAll().onsuccess = function (groupsEvt) {
			var groups = groupsEvt.target.result;
			groups.sort(function (a, b) {
				return a.groupIndex - b.groupIndex;
			});

			// use a placholder
			var cardList = $("#cardList");
			for (let groupData of groups) {
				$("<div>").attr("id", "group-" + groupData.groupIndex)
					.addClass("bookmarkGroupContainer")
					.appendTo(cardList);
			}

			bookmarkList = [];

			for (let groupData of groups) {
				buildGroup(groupData, $("#group-" + groupData.groupIndex));
				bookmarkList.push(groupData);
			}

			db.close();
		};
	}

	openDBRequest.onerror = function (e) { console.log(e); }

	openDBRequest.onupgradeneeded = function (e) {
		// the database doesn't exist
		console.log("Creating database");
		db = e.target.result;

		var groupStore = db.createObjectStore("Groups", {keyPath: "groupIndex"});
		groupStore.createIndex("groupIndex", "groupIndex", {unique: true});
		groupStore.createIndex("title", "title", {unique: false});
		groupStore.createIndex("bookmarks", "bookmarks", {unique: false});

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
}

function buildGroup(groupInfo, placeholder) {
	buildCard(groupInfo.title, groupInfo.groupIndex, groupInfo.bookmarks).appendTo(placeholder);
}

function buildCard(title, groupIndex, itemList) {
	var card = $("<div>");
	card.attr({
		"id": "group-" + title,
		"class": "card",
		"data-group-name": title,
		"data-group-index": groupIndex
	});

	var cardHead = $("<div>");
	cardHead.addClass("card-header");
	cardHead.text(title);
	var btnDrag = $("<span>").addClass("mr-2 start-hidden dragGroupHandle")
		.append($("<span>").addClass("fas fa-bars"));
	var btnDel = $("<span>")
		.attr("data-group", groupIndex)
		.addClass("btnDelGroup far fa-trash-alt float-right mt-1 start-hidden text-danger clickable");
	btnDel.appendTo(cardHead);
	btnDrag.prependTo(cardHead);
	card.append(cardHead);

	var cardList = $("<div>");
	cardList.addClass("list-group list-group-flush bookmarkGroup")
		.attr({"data-group": title, "data-group-index": groupIndex});
	card.append(cardList);

	for (var i = 0; i < itemList.length; i++) {
		var item = itemList[i];
		// the fa span gets replaced with an svg element, which causes problems
		// with using it as a drag handle, so wrap it in the drag element
		var handle = $("<span>").addClass("mr-2 start-hidden dragHandle")
			.append($("<span>").addClass("fas fa-bars"));

		var del = $("<span>")
			.attr({"data-group": title, "data-group-index": groupIndex, "data-key": i})
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
	}

	return card;
}
