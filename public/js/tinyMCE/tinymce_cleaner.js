tinyMceCleaner = function(editor) {
	//console.log("tinymce_cleaner.js tinyMceCleaner() reference function!!");
	editor.serializer.addNodeFilter('script,style', function(nodes, name) {
		var i = nodes.length, node, value, type;

		function trim(value) {
			return value.replace(/(<!--\[CDATA\[|\]\]-->)/g, '\n')
				.replace(/^[\r\n]*|[\r\n]*$/g, '')
				.replace(/^\s*((<!--)?(\s*\/\/)?\s*<!\[CDATA\[|(<!--\s*)?\/\*\s*<!\[CDATA\[\s*\*\/|(\/\/)?\s*<!--|\/\*\s*<!--\s*\*\/)\s*[\r\n]*/gi, '')
				.replace(/\s*(\/\*\s*\]\]>\s*\*\/(-->)?|\s*\/\/\s*\]\]>(-->)?|\/\/\s*(-->)?|\]\]>|\/\*\s*-->\s*\*\/|\s*-->\s*)\s*$/g, '');
		}
		while (i--) {
			node = nodes[i];
			value = node.firstChild ? node.firstChild.value : '';

			if (value.length > 0) {
				node.firstChild.value = trim(value);
			}
		}
	});
	/* console.log("tinymce_cleaner.js inside tinyMceCleaner()");
	editor.on("ExecCommand", function(e) {
		console.log("tinymce_cleaner.js tinyMceCleaner() editor.on ExecCommand e: ", e);
	}); */
};