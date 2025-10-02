var MelisCoreDashboardBubbleUpdatesPlugin = {
	init: function() {
		// initialize card
		$('.melis-dashboard-bubble-updates-plugin[style=""]')
			.addClass("flip-default")
			.each(function(i) {
				var t = $(this);
				setTimeout(function() {
					t.css("visibility", "visible").addClass("animated fadeInLeft");
				}, (i + 1) * 300);
				setTimeout(function() {
					t.removeClass("flip-default fadeInLeft");
					setTimeout(function() {
						t.find('[class*="icon-"]')
							.css("visibility", "visible")
							.addClass("animated fadeInDown");
					}, (i + 1) * 200);
				}, (i + 1) * 800);
			});

		this.getUpdates();

		//test remove this after testing
		this.sleep();
	},
	getUpdates: function() {
		$.ajax({
			type: "POST",
			url: "/melis/dashboard-plugin/MelisCoreDashboardBubbleUpdatesPlugin/getUpdates"
		}).done(function(response) {
			// plugin front text
			var text = translations.tr_meliscore_dashboard_bubble_plugins_update;

			if (response.count > 1) {
				text = translations.tr_meliscore_dashboard_bubble_plugins_updates;
			}

			$(".dashboard-bubble-updates-text").empty();
			$(".dashboard-bubble-updates-text").text(text);

			// plugin front button text
			if (response.count > 0) {
				var buttonText =
					translations.tr_meliscore_dashboard_bubble_plugins_view_update;

				if (response.count > 1) {
					buttonText =
						translations.tr_meliscore_dashboard_bubble_plugins_view_updates;
				}

				var button =
					'<button id="dashboard-bubble-updates-back-btn" class="btn btn-default">' +
					buttonText +
					"</button>";
				$(".dashboard-bubble-updates-back-btn-container").each(function() {
					$(this).empty();
					$(this).append(button);
				});
			} else {
				$(".dashboard-bubble-updates-back-btn-container").each(function() {
					$(this).empty();
				});
			}

			// plugin front counter
			$(".dashboard-bubble-updates-counter").each(function() {
				$(this).text(response.count);
			});

			// plugin back content/list
			$.each(response.data, function(key, value) {
				if (value.status === -1) {
					var update =
						'<tr class="dashboard-bubble-update-details" data-packageid="' +
						value.packageId +
						'" data-packagename="' +
						value.module_name +
						'">\n' +
						'<td class="center">' +
						value.module_name +
						"</td>\n" +
						'<td class="center">' +
						value.currentVersion +
						"</td>\n" +
						'<td class="center">' +
						value.latestVersion +
						"</td>\n" +
						"</tr>";

					$(".dashboard-bubble-updates-list").each(function() {
						$(this).append(update);
					});
				}
			});
		})
		.fail(function(xhr, textStatus, errorThrown) {
            alert( translations.tr_meliscore_error_message );
        });
	},

	sleep: function() {
		$.ajax({
			type: "POST",
			url: "/melis/dashboard-plugin/MelisCoreDashboardBubbleUpdatesPlugin/sleep"
		}).done(function(response) {
			console.log(response);
		})
		.fail(function(xhr, textStatus, errorThrown) {
            alert( translations.tr_meliscore_error_message );
        });
	},
};

$(function() {
	var $body = $("body");
	var showBubblePlugins = MelisCoreDashboardBubblePlugin.showBubblePlugins();	
		if (showBubblePlugins) {
			console.log('show bubble updates');
			MelisCoreDashboardBubbleUpdatesPlugin.init();
		} else {
			console.log('do not show bubble updates');
		}

		$body.on("click", ".dashboard-bubble-update-details", function() {
			var packageId = $(this).data("packageid");
			var packageTitle = $(this).data("packagename");

				melisHelper.tabOpen(
					translations.tr_market_place,
					"fa-shopping-cart",
					"id_melis_market_place_tool_display",
					"melis_market_place_tool_display"
				);

				var alreadyOpen = $(
					"body #melis-id-nav-bar-tabs li a.tab-element[data-id='id_melis_market_place_tool_display']"
				);
					var checkTab = setInterval(function() {
						if (alreadyOpen.length) {
							melisHelper.tabOpen(
								packageTitle,
								"fa-shopping-cart",
								packageId + "_id_melis_market_place_tool_package_display",
								"melis_market_place_tool_package_display",
								{
									packageId: packageId,
								},
								"id_melis_market_place_tool_display"
							);

							clearInterval(checkTab);
						}
					}, 500);
		});
});
