$(document).ready(function () {
	$("#btnEdit").click(toggleEditing);
});

function toggleEditing () {
	if ($("#btnEdit").hasClass("btn-warning"))
		disableEditing();
	else
		enableEditing();
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
