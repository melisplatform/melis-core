var melisDataTable = (() => {
	var tableLanguage = new Object();

	var getTableLanguage = () => {
		$.get("/melis/MelisCore/Language/getDataTableTranslations", (res) => {
			$.each(res, (key, trans) => {
				tableLanguage[key] = trans;
			});
		});
	};

	return {
		getTableLanguage: getTableLanguage(),
		tableLanguage: tableLanguage,
	};
})();

melisDataTable.getTableLanguage;
