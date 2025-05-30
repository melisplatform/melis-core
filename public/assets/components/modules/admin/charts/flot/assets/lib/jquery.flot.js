(function ($) { $.color = {}; $.color.make = function (r, g, b, a) { var o = {}; o.r = r || 0; o.g = g || 0; o.b = b || 0; o.a = a != null ? a : 1; o.add = function (c, d) { for (var i = 0; i < c.length; ++i)o[c.charAt(i)] += d; return o.normalize() }; o.scale = function (c, f) { for (var i = 0; i < c.length; ++i)o[c.charAt(i)] *= f; return o.normalize() }; o.toString = function () { if (o.a >= 1) { return "rgb(" + [o.r, o.g, o.b].join(",") + ")" } else { return "rgba(" + [o.r, o.g, o.b, o.a].join(",") + ")" } }; o.normalize = function () { function clamp(min, value, max) { return value < min ? min : value > max ? max : value } o.r = clamp(0, parseInt(o.r), 255); o.g = clamp(0, parseInt(o.g), 255); o.b = clamp(0, parseInt(o.b), 255); o.a = clamp(0, o.a, 1); return o }; o.clone = function () { return $.color.make(o.r, o.b, o.g, o.a) }; return o.normalize() }; $.color.extract = function (elem, css) { var c; do { c = elem.css(css).toLowerCase(); if (c != "" && c != "transparent") break; elem = elem.parent() } while (elem.length && !$.nodeName(elem.get(0), "body")); if (c == "rgba(0, 0, 0, 0)") c = "transparent"; return $.color.parse(c) }; $.color.parse = function (str) { var res, m = $.color.make; if (res = /rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)/.exec(str)) return m(parseInt(res[1], 10), parseInt(res[2], 10), parseInt(res[3], 10)); if (res = /rgba\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]+(?:\.[0-9]+)?)\s*\)/.exec(str)) return m(parseInt(res[1], 10), parseInt(res[2], 10), parseInt(res[3], 10), parseFloat(res[4])); if (res = /rgb\(\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*\)/.exec(str)) return m(parseFloat(res[1]) * 2.55, parseFloat(res[2]) * 2.55, parseFloat(res[3]) * 2.55); if (res = /rgba\(\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\s*\)/.exec(str)) return m(parseFloat(res[1]) * 2.55, parseFloat(res[2]) * 2.55, parseFloat(res[3]) * 2.55, parseFloat(res[4])); if (res = /#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/.exec(str)) return m(parseInt(res[1], 16), parseInt(res[2], 16), parseInt(res[3], 16)); if (res = /#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])/.exec(str)) return m(parseInt(res[1] + res[1], 16), parseInt(res[2] + res[2], 16), parseInt(res[3] + res[3], 16)); var name = str.trim().toLowerCase(); if (name == "transparent") return m(255, 255, 255, 0); else { res = lookupColors[name] || [0, 0, 0]; return m(res[0], res[1], res[2]) } }; var lookupColors = { aqua: [0, 255, 255], azure: [240, 255, 255], beige: [245, 245, 220], black: [0, 0, 0], blue: [0, 0, 255], brown: [165, 42, 42], cyan: [0, 255, 255], darkblue: [0, 0, 139], darkcyan: [0, 139, 139], darkgrey: [169, 169, 169], darkgreen: [0, 100, 0], darkkhaki: [189, 183, 107], darkmagenta: [139, 0, 139], darkolivegreen: [85, 107, 47], darkorange: [255, 140, 0], darkorchid: [153, 50, 204], darkred: [139, 0, 0], darksalmon: [233, 150, 122], darkviolet: [148, 0, 211], fuchsia: [255, 0, 255], gold: [255, 215, 0], green: [0, 128, 0], indigo: [75, 0, 130], khaki: [240, 230, 140], lightblue: [173, 216, 230], lightcyan: [224, 255, 255], lightgreen: [144, 238, 144], lightgrey: [211, 211, 211], lightpink: [255, 182, 193], lightyellow: [255, 255, 224], lime: [0, 255, 0], magenta: [255, 0, 255], maroon: [128, 0, 0], navy: [0, 0, 128], olive: [128, 128, 0], orange: [255, 165, 0], pink: [255, 192, 203], purple: [128, 0, 128], violet: [128, 0, 128], red: [255, 0, 0], silver: [192, 192, 192], white: [255, 255, 255], yellow: [255, 255, 0] } })(jQuery); (function ($) {
    var hasOwnProperty = Object.prototype.hasOwnProperty; if (!$.fn.detach) { $.fn.detach = function () { return this.each(function () { if (this.parentNode) { this.parentNode.removeChild(this) } }) } }
    function Canvas(cls, container) {
        var element = container.children("." + cls)[0]; if (element == null) { element = document.createElement("canvas"); element.className = cls; $(element).css({ direction: "ltr", position: "absolute", left: 0, top: 0 }).appendTo(container); if (!element.getContext) { if (window.G_vmlCanvasManager) { element = window.G_vmlCanvasManager.initElement(element) } else { throw new Error("Canvas is not available. If you're using IE with a fall-back such as Excanvas, then there's either a mistake in your conditional include, or the page has no DOCTYPE and is rendering in Quirks Mode.") } } }
        this.element = element; var context = this.context = element.getContext("2d"); var devicePixelRatio = window.devicePixelRatio || 1, backingStoreRatio = context.webkitBackingStorePixelRatio || context.mozBackingStorePixelRatio || context.msBackingStorePixelRatio || context.oBackingStorePixelRatio || context.backingStorePixelRatio || 1; this.pixelRatio = devicePixelRatio / backingStoreRatio; this.resize(container.width(), container.height()); this.textContainer = null; this.text = {}; this._textCache = {}
    }
    Canvas.prototype.resize = function (width, height) {
        if (width <= 0 || height <= 0) { throw new Error("Invalid dimensions for plot, width = " + width + ", height = " + height) }
        var element = this.element, context = this.context, pixelRatio = this.pixelRatio; if (this.width != width) { element.width = width * pixelRatio; element.style.width = width + "px"; this.width = width }
        if (this.height != height) { element.height = height * pixelRatio; element.style.height = height + "px"; this.height = height }
        context.restore(); context.save(); context.scale(pixelRatio, pixelRatio)
    }; Canvas.prototype.clear = function () { this.context.clearRect(0, 0, this.width, this.height) }; Canvas.prototype.render = function () {
        var cache = this._textCache; for (var layerKey in cache) {
            if (hasOwnProperty.call(cache, layerKey)) {
                var layer = this.getTextLayer(layerKey), layerCache = cache[layerKey]; layer.hide(); for (var styleKey in layerCache) {
                    if (hasOwnProperty.call(layerCache, styleKey)) {
                        var styleCache = layerCache[styleKey]; for (var key in styleCache) {
                            if (hasOwnProperty.call(styleCache, key)) {
                                var positions = styleCache[key].positions; for (var i = 0, position; position = positions[i]; i++) { if (position.active) { if (!position.rendered) { layer.append(position.element); position.rendered = !0 } } else { positions.splice(i--, 1); if (position.rendered) { position.element.detach() } } }
                                if (positions.length == 0) { delete styleCache[key] }
                            }
                        }
                    }
                }
                layer.show()
            }
        }
    }; Canvas.prototype.getTextLayer = function (classes) {
        var layer = this.text[classes]; if (layer == null) {
            if (this.textContainer == null) { this.textContainer = $("<div class='flot-text'></div>").css({ position: "absolute", top: 0, left: 0, bottom: 0, right: 0, 'font-size': "smaller", color: "#545454" }).insertAfter(this.element) }
            layer = this.text[classes] = $("<div></div>").addClass(classes).css({ position: "absolute", top: 0, left: 0, bottom: 0, right: 0 }).appendTo(this.textContainer)
        }
        return layer
    }; Canvas.prototype.getTextInfo = function (layer, text, font, angle, width) {
        var textStyle, layerCache, styleCache, info; text = "" + text; if (typeof font === "object") { textStyle = font.style + " " + font.variant + " " + font.weight + " " + font.size + "px/" + font.lineHeight + "px " + font.family } else { textStyle = font }
        layerCache = this._textCache[layer]; if (layerCache == null) { layerCache = this._textCache[layer] = {} }
        styleCache = layerCache[textStyle]; if (styleCache == null) { styleCache = layerCache[textStyle] = {} }
        info = styleCache[text]; if (info == null) {
            var element = $("<div></div>").html(text).css({ position: "absolute", 'max-width': width, top: -9999 }).appendTo(this.getTextLayer(layer)); if (typeof font === "object") { element.css({ font: textStyle, color: font.color }) } else if (typeof font === "string") { element.addClass(font) }
            info = styleCache[text] = { width: element.outerWidth(!0), height: element.outerHeight(!0), element: element, positions: [] }; element.detach()
        }
        return info
    }; Canvas.prototype.addText = function (layer, x, y, text, font, angle, width, halign, valign) {
        var info = this.getTextInfo(layer, text, font, angle, width), positions = info.positions; if (halign == "center") { x -= info.width / 2 } else if (halign == "right") { x -= info.width }
        if (valign == "middle") { y -= info.height / 2 } else if (valign == "bottom") { y -= info.height }
        for (var i = 0, position; position = positions[i]; i++) { if (position.x == x && position.y == y) { position.active = !0; return } }
        position = { active: !0, rendered: !1, element: positions.length ? info.element.clone() : info.element, x: x, y: y }; positions.push(position); position.element.css({ top: Math.round(y), left: Math.round(x), 'text-align': halign })
    }; Canvas.prototype.removeText = function (layer, x, y, text, font, angle) { if (text == null) { var layerCache = this._textCache[layer]; if (layerCache != null) { for (var styleKey in layerCache) { if (hasOwnProperty.call(layerCache, styleKey)) { var styleCache = layerCache[styleKey]; for (var key in styleCache) { if (hasOwnProperty.call(styleCache, key)) { var positions = styleCache[key].positions; for (var i = 0, position; position = positions[i]; i++) { position.active = !1 } } } } } } } else { var positions = this.getTextInfo(layer, text, font, angle).positions; for (var i = 0, position; position = positions[i]; i++) { if (position.x == x && position.y == y) { position.active = !1 } } } }; function Plot(placeholder, data_, options_, plugins) {
        var series = [], options = { colors: ["#edc240", "#afd8f8", "#cb4b4b", "#4da74d", "#9440ed"], legend: { show: !0, noColumns: 1, labelFormatter: null, labelBoxBorderColor: "#ccc", container: null, position: "ne", margin: 5, backgroundColor: null, backgroundOpacity: 0.85, sorted: null }, xaxis: { show: null, position: "bottom", mode: null, font: null, color: null, tickColor: null, transform: null, inverseTransform: null, min: null, max: null, autoscaleMargin: null, ticks: null, tickFormatter: null, labelWidth: null, labelHeight: null, reserveSpace: null, tickLength: null, alignTicksWithAxis: null, tickDecimals: null, tickSize: null, minTickSize: null }, yaxis: { autoscaleMargin: 0.02, position: "left" }, xaxes: [], yaxes: [], series: { points: { show: !1, radius: 3, lineWidth: 2, fill: !0, fillColor: "#ffffff", symbol: "circle" }, lines: { lineWidth: 2, fill: !1, fillColor: null, steps: !1 }, bars: { show: !1, lineWidth: 2, barWidth: 1, fill: !0, fillColor: null, align: "left", horizontal: !1, zero: !0 }, shadowSize: 3, highlightColor: null }, grid: { show: !0, aboveData: !1, color: "#545454", backgroundColor: null, borderColor: null, tickColor: null, margin: 0, labelMargin: 5, axisMargin: 8, borderWidth: 2, minBorderMargin: null, markings: null, markingsColor: "#f4f4f4", markingsLineWidth: 2, clickable: !1, hoverable: !1, autoHighlight: !0, mouseActiveRadius: 10 }, interaction: { redrawOverlayInterval: 1000 / 60 }, hooks: {} }, surface = null, overlay = null, eventHolder = null, ctx = null, octx = null, xaxes = [], yaxes = [], plotOffset = { left: 0, right: 0, top: 0, bottom: 0 }, plotWidth = 0, plotHeight = 0, hooks = { processOptions: [], processRawData: [], processDatapoints: [], processOffset: [], drawBackground: [], drawSeries: [], draw: [], bindEvents: [], drawOverlay: [], shutdown: [] }, plot = this; plot.setData = setData; plot.setupGrid = setupGrid; plot.draw = draw; plot.getPlaceholder = function () { return placeholder }; plot.getCanvas = function () { return surface.element }; plot.getPlotOffset = function () { return plotOffset }; plot.width = function () { return plotWidth }; plot.height = function () { return plotHeight }; plot.offset = function () { var o = eventHolder.offset(); o.left += plotOffset.left; o.top += plotOffset.top; return o }; plot.getData = function () { return series }; plot.getAxes = function () {
            var res = {}, i; $.each(xaxes.concat(yaxes), function (_, axis) {
                if (axis)
                    res[axis.direction + (axis.n != 1 ? axis.n : "") + "axis"] = axis
            }); return res
        }; plot.getXAxes = function () { return xaxes }; plot.getYAxes = function () { return yaxes }; plot.c2p = canvasToAxisCoords; plot.p2c = axisToCanvasCoords; plot.getOptions = function () { return options }; plot.highlight = highlight; plot.unhighlight = unhighlight; plot.triggerRedrawOverlay = triggerRedrawOverlay; plot.pointOffset = function (point) { return { left: parseInt(xaxes[axisNumber(point, "x") - 1].p2c(+point.x) + plotOffset.left, 10), top: parseInt(yaxes[axisNumber(point, "y") - 1].p2c(+point.y) + plotOffset.top, 10) } }; plot.shutdown = shutdown; plot.destroy = function () { shutdown(); placeholder.removeData("plot").empty(); series = []; options = null; surface = null; overlay = null; eventHolder = null; ctx = null; octx = null; xaxes = []; yaxes = []; hooks = null; highlights = []; plot = null }; plot.resize = function () { var width = placeholder.width(), height = placeholder.height(); surface.resize(width, height); overlay.resize(width, height) }; plot.hooks = hooks; initPlugins(plot); parseOptions(options_); setupCanvases(); setData(data_); setupGrid(); draw(); bindEvents(); function executeHooks(hook, args) {
            args = [plot].concat(args); for (var i = 0; i < hook.length; ++i)
                hook[i].apply(this, args);
        }
        function initPlugins() {
            var classes = { Canvas: Canvas }; for (var i = 0; i < plugins.length; ++i) {
                var p = plugins[i]; p.init(plot, classes); if (p.options)
                    $.extend(!0, options, p.options)
            }
        }
        function parseOptions(opts) {
            $.extend(!0, options, opts); if (opts && opts.colors) { options.colors = opts.colors }
            if (options.xaxis.color == null)
                options.xaxis.color = $.color.parse(options.grid.color).scale('a', 0.22).toString(); if (options.yaxis.color == null)
                options.yaxis.color = $.color.parse(options.grid.color).scale('a', 0.22).toString(); if (options.xaxis.tickColor == null)
                options.xaxis.tickColor = options.grid.tickColor || options.xaxis.color; if (options.yaxis.tickColor == null)
                options.yaxis.tickColor = options.grid.tickColor || options.yaxis.color; if (options.grid.borderColor == null)
                options.grid.borderColor = options.grid.color; if (options.grid.tickColor == null)
                options.grid.tickColor = $.color.parse(options.grid.color).scale('a', 0.22).toString(); var i, axisOptions, axisCount, fontSize = placeholder.css("font-size"), fontSizeDefault = fontSize ? +fontSize.replace("px", "") : 13, fontDefaults = { style: placeholder.css("font-style"), size: Math.round(0.8 * fontSizeDefault), variant: placeholder.css("font-variant"), weight: placeholder.css("font-weight"), family: placeholder.css("font-family") }; axisCount = options.xaxes.length || 1; for (i = 0; i < axisCount; ++i) {
                    axisOptions = options.xaxes[i]; if (axisOptions && !axisOptions.tickColor) { axisOptions.tickColor = axisOptions.color }
                    axisOptions = $.extend(!0, {}, options.xaxis, axisOptions); options.xaxes[i] = axisOptions; if (axisOptions.font) {
                        axisOptions.font = $.extend({}, fontDefaults, axisOptions.font); if (!axisOptions.font.color) { axisOptions.font.color = axisOptions.color }
                        if (!axisOptions.font.lineHeight) { axisOptions.font.lineHeight = Math.round(axisOptions.font.size * 1.15) }
                    }
                }
            axisCount = options.yaxes.length || 1; for (i = 0; i < axisCount; ++i) {
                axisOptions = options.yaxes[i]; if (axisOptions && !axisOptions.tickColor) { axisOptions.tickColor = axisOptions.color }
                axisOptions = $.extend(!0, {}, options.yaxis, axisOptions); options.yaxes[i] = axisOptions; if (axisOptions.font) {
                    axisOptions.font = $.extend({}, fontDefaults, axisOptions.font); if (!axisOptions.font.color) { axisOptions.font.color = axisOptions.color }
                    if (!axisOptions.font.lineHeight) { axisOptions.font.lineHeight = Math.round(axisOptions.font.size * 1.15) }
                }
            }
            if (options.xaxis.noTicks && options.xaxis.ticks == null)
                options.xaxis.ticks = options.xaxis.noTicks; if (options.yaxis.noTicks && options.yaxis.ticks == null)
                options.yaxis.ticks = options.yaxis.noTicks; if (options.x2axis) {
                    options.xaxes[1] = $.extend(!0, {}, options.xaxis, options.x2axis); options.xaxes[1].position = "top"; if (options.x2axis.min == null) { options.xaxes[1].min = null }
                    if (options.x2axis.max == null) { options.xaxes[1].max = null }
                }
            if (options.y2axis) {
                options.yaxes[1] = $.extend(!0, {}, options.yaxis, options.y2axis); options.yaxes[1].position = "right"; if (options.y2axis.min == null) { options.yaxes[1].min = null }
                if (options.y2axis.max == null) { options.yaxes[1].max = null }
            }
            if (options.grid.coloredAreas)
                options.grid.markings = options.grid.coloredAreas; if (options.grid.coloredAreasColor)
                options.grid.markingsColor = options.grid.coloredAreasColor; if (options.lines)
                $.extend(!0, options.series.lines, options.lines); if (options.points)
                $.extend(!0, options.series.points, options.points); if (options.bars)
                $.extend(!0, options.series.bars, options.bars); if (options.shadowSize != null)
                options.series.shadowSize = options.shadowSize; if (options.highlightColor != null)
                options.series.highlightColor = options.highlightColor; for (i = 0; i < options.xaxes.length; ++i)
                getOrCreateAxis(xaxes, i + 1).options = options.xaxes[i]; for (i = 0; i < options.yaxes.length; ++i)
                getOrCreateAxis(yaxes, i + 1).options = options.yaxes[i]; for (var n in hooks)
                if (options.hooks[n] && options.hooks[n].length)
                    hooks[n] = hooks[n].concat(options.hooks[n]); executeHooks(hooks.processOptions, [options])
        }
        function setData(d) { series = parseData(d); fillInSeriesOptions(); processData() }
        function parseData(d) {
            var res = []; for (var i = 0; i < d.length; ++i) {
                var s = $.extend(!0, {}, options.series); if (d[i].data != null) { s.data = d[i].data; delete d[i].data; $.extend(!0, s, d[i]); d[i].data = s.data }
                else s.data = d[i]; res.push(s)
            }
            return res
        }
        function axisNumber(obj, coord) {
            var a = obj[coord + "axis"]; if (typeof a == "object")
                a = a.n; if (typeof a != "number")
                a = 1; return a
        }
        function allAxes() { return $.grep(xaxes.concat(yaxes), function (a) { return a }) }
        function canvasToAxisCoords(pos) {
            var res = {}, i, axis; for (i = 0; i < xaxes.length; ++i) {
                axis = xaxes[i]; if (axis && axis.used)
                    res["x" + axis.n] = axis.c2p(pos.left)
            }
            for (i = 0; i < yaxes.length; ++i) {
                axis = yaxes[i]; if (axis && axis.used)
                    res["y" + axis.n] = axis.c2p(pos.top)
            }
            if (res.x1 !== undefined)
                res.x = res.x1; if (res.y1 !== undefined)
                res.y = res.y1; return res
        }
        function axisToCanvasCoords(pos) {
            var res = {}, i, axis, key; for (i = 0; i < xaxes.length; ++i) {
                axis = xaxes[i]; if (axis && axis.used) {
                    key = "x" + axis.n; if (pos[key] == null && axis.n == 1)
                        key = "x"; if (pos[key] != null) { res.left = axis.p2c(pos[key]); break }
                }
            }
            for (i = 0; i < yaxes.length; ++i) {
                axis = yaxes[i]; if (axis && axis.used) {
                    key = "y" + axis.n; if (pos[key] == null && axis.n == 1)
                        key = "y"; if (pos[key] != null) { res.top = axis.p2c(pos[key]); break }
                }
            }
            return res
        }
        function getOrCreateAxis(axes, number) {
            if (!axes[number - 1])
                axes[number - 1] = { n: number, direction: axes == xaxes ? "x" : "y", options: $.extend(!0, {}, axes == xaxes ? options.xaxis : options.yaxis) }; return axes[number - 1]
        }
        function fillInSeriesOptions() {
            var neededColors = series.length, maxIndex = -1, i; for (i = 0; i < series.length; ++i) { var sc = series[i].color; if (sc != null) { neededColors--; if (typeof sc == "number" && sc > maxIndex) { maxIndex = sc } } }
            if (neededColors <= maxIndex) { neededColors = maxIndex + 1 }
            var c, colors = [], colorPool = options.colors, colorPoolSize = colorPool.length, variation = 0; for (i = 0; i < neededColors; i++) {
                c = $.color.parse(colorPool[i % colorPoolSize] || "#666"); if (i % colorPoolSize == 0 && i) { if (variation >= 0) { if (variation < 0.5) { variation = -variation - 0.2 } else variation = 0 } else variation = -variation }
                colors[i] = c.scale('rgb', 1 + variation)
            }
            var colori = 0, s; for (i = 0; i < series.length; ++i) {
                s = series[i]; if (s.color == null) { s.color = colors[colori].toString(); ++colori }
                else if (typeof s.color == "number")
                    s.color = colors[s.color].toString(); if (s.lines.show == null) {
                        var v, show = !0; for (v in s)
                            if (s[v] && s[v].show) { show = !1; break }
                        if (show)
                            s.lines.show = !0
                    }
                if (s.lines.zero == null) { s.lines.zero = !!s.lines.fill }
                s.xaxis = getOrCreateAxis(xaxes, axisNumber(s, "x")); s.yaxis = getOrCreateAxis(yaxes, axisNumber(s, "y"))
            }
        }
        function processData() {
            var topSentry = Number.POSITIVE_INFINITY, bottomSentry = Number.NEGATIVE_INFINITY, fakeInfinity = Number.MAX_VALUE, i, j, k, m, length, s, points, ps, x, y, axis, val, f, p, data, format; function updateAxis(axis, min, max) {
                if (min < axis.datamin && min != -fakeInfinity)
                    axis.datamin = min; if (max > axis.datamax && max != fakeInfinity)
                    axis.datamax = max
            }
            $.each(allAxes(), function (_, axis) { axis.datamin = topSentry; axis.datamax = bottomSentry; axis.used = !1 }); for (i = 0; i < series.length; ++i) { s = series[i]; s.datapoints = { points: [] }; executeHooks(hooks.processRawData, [s, s.data, s.datapoints]) }
            for (i = 0; i < series.length; ++i) {
                s = series[i]; data = s.data; format = s.datapoints.format; if (!format) {
                    format = []; format.push({ x: !0, number: !0, required: !0 }); format.push({ y: !0, number: !0, required: !0 }); if (s.bars.show || (s.lines.show && s.lines.fill)) { var autoscale = !!((s.bars.show && s.bars.zero) || (s.lines.show && s.lines.zero)); format.push({ y: !0, number: !0, required: !1, defaultValue: 0, autoscale: autoscale }); if (s.bars.horizontal) { delete format[format.length - 1].y; format[format.length - 1].x = !0 } }
                    s.datapoints.format = format
                }
                if (s.datapoints.pointsize != null)
                    continue; s.datapoints.pointsize = format.length; ps = s.datapoints.pointsize; points = s.datapoints.points; var insertSteps = s.lines.show && s.lines.steps; s.xaxis.used = s.yaxis.used = !0; for (j = k = 0; j < data.length; ++j, k += ps) {
                        p = data[j]; var nullify = p == null; if (!nullify) {
                            for (m = 0; m < ps; ++m) {
                                val = p[m]; f = format[m]; if (f) {
                                    if (f.number && val != null) {
                                        val = +val; if (isNaN(val))
                                            val = null; else if (val == Infinity)
                                            val = fakeInfinity; else if (val == -Infinity)
                                            val = -fakeInfinity
                                    }
                                    if (val == null) {
                                        if (f.required)
                                            nullify = !0; if (f.defaultValue != null)
                                            val = f.defaultValue
                                    }
                                }
                                points[k + m] = val
                            }
                        }
                        if (nullify) {
                            for (m = 0; m < ps; ++m) {
                                val = points[k + m]; if (val != null) {
                                    f = format[m]; if (f.autoscale !== !1) {
                                        if (f.x) { updateAxis(s.xaxis, val, val) }
                                        if (f.y) { updateAxis(s.yaxis, val, val) }
                                    }
                                }
                                points[k + m] = null
                            }
                        }
                        else {
                            if (insertSteps && k > 0 && points[k - ps] != null && points[k - ps] != points[k] && points[k - ps + 1] != points[k + 1]) {
                                for (m = 0; m < ps; ++m)
                                    points[k + ps + m] = points[k + m]; points[k + 1] = points[k - ps + 1]; k += ps
                            }
                        }
                    }
            }
            for (i = 0; i < series.length; ++i) { s = series[i]; executeHooks(hooks.processDatapoints, [s, s.datapoints]) }
            for (i = 0; i < series.length; ++i) {
                s = series[i]; points = s.datapoints.points; ps = s.datapoints.pointsize; format = s.datapoints.format; var xmin = topSentry, ymin = topSentry, xmax = bottomSentry, ymax = bottomSentry; for (j = 0; j < points.length; j += ps) {
                    if (points[j] == null)
                        continue; for (m = 0; m < ps; ++m) {
                            val = points[j + m]; f = format[m]; if (!f || f.autoscale === !1 || val == fakeInfinity || val == -fakeInfinity)
                                continue; if (f.x) {
                                    if (val < xmin)
                                        xmin = val; if (val > xmax)
                                        xmax = val
                                }
                            if (f.y) {
                                if (val < ymin)
                                    ymin = val; if (val > ymax)
                                    ymax = val
                            }
                        }
                }
                if (s.bars.show) {
                    var delta; switch (s.bars.align) { case "left": delta = 0; break; case "right": delta = -s.bars.barWidth; break; default: delta = -s.bars.barWidth / 2 }
                    if (s.bars.horizontal) { ymin += delta; ymax += delta + s.bars.barWidth }
                    else { xmin += delta; xmax += delta + s.bars.barWidth }
                }
                updateAxis(s.xaxis, xmin, xmax); updateAxis(s.yaxis, ymin, ymax)
            }
            $.each(allAxes(), function (_, axis) {
                if (axis.datamin == topSentry)
                    axis.datamin = null; if (axis.datamax == bottomSentry)
                    axis.datamax = null
            })
        }
        function setupCanvases() {
            placeholder.css("padding", 0).children().filter(function () { return !$(this).hasClass("flot-overlay") && !$(this).hasClass('flot-base') }).remove(); if (placeholder.css("position") == 'static')
                placeholder.css("position", "relative"); surface = new Canvas("flot-base", placeholder); overlay = new Canvas("flot-overlay", placeholder); ctx = surface.context; octx = overlay.context; eventHolder = $(overlay.element).off(); var existing = placeholder.data("plot"); if (existing) { existing.shutdown(); overlay.clear() }
            placeholder.data("plot", plot)
        }
        function bindEvents() {
            if (options.grid.hoverable) { eventHolder.on("mousemove", onMouseMove); eventHolder.on("mouseleave", onMouseLeave) }
            if (options.grid.clickable)
                eventHolder.on("click", onClick); executeHooks(hooks.bindEvents, [eventHolder])
        }
        function shutdown() {
            if (redrawTimeout)
                clearTimeout(redrawTimeout); eventHolder.off("mousemove", onMouseMove); eventHolder.off("mouseleave", onMouseLeave); eventHolder.off("click", onClick); executeHooks(hooks.shutdown, [eventHolder])
        }
        function setTransformationHelpers(axis) {
            function identity(x) { return x }
            var s, m, t = axis.options.transform || identity, it = axis.options.inverseTransform; if (axis.direction == "x") { s = axis.scale = plotWidth / Math.abs(t(axis.max) - t(axis.min)); m = Math.min(t(axis.max), t(axis.min)) }
            else { s = axis.scale = plotHeight / Math.abs(t(axis.max) - t(axis.min)); s = -s; m = Math.max(t(axis.max), t(axis.min)) }
            if (t == identity)
                axis.p2c = function (p) { return (p - m) * s }; else axis.p2c = function (p) { return (t(p) - m) * s }; if (!it)
                axis.c2p = function (c) { return m + c / s }; else axis.c2p = function (c) { return it(m + c / s) }
        }
        function measureTickLabels(axis) {
            var opts = axis.options, ticks = axis.ticks || [], labelWidth = opts.labelWidth || 0, labelHeight = opts.labelHeight || 0, maxWidth = labelWidth || (axis.direction == "x" ? Math.floor(surface.width / (ticks.length || 1)) : null), legacyStyles = axis.direction + "Axis " + axis.direction + axis.n + "Axis", layer = "flot-" + axis.direction + "-axis flot-" + axis.direction + axis.n + "-axis " + legacyStyles, font = opts.font || "flot-tick-label tickLabel"; for (var i = 0; i < ticks.length; ++i) {
                var t = ticks[i]; if (!t.label)
                    continue; var info = surface.getTextInfo(layer, t.label, font, null, maxWidth); labelWidth = Math.max(labelWidth, info.width); labelHeight = Math.max(labelHeight, info.height)
            }
            axis.labelWidth = opts.labelWidth || labelWidth; axis.labelHeight = opts.labelHeight || labelHeight
        }
        function allocateAxisBoxFirstPhase(axis) {
            var lw = axis.labelWidth, lh = axis.labelHeight, pos = axis.options.position, isXAxis = axis.direction === "x", tickLength = axis.options.tickLength, axisMargin = options.grid.axisMargin, padding = options.grid.labelMargin, innermost = !0, outermost = !0, first = !0, found = !1; $.each(isXAxis ? xaxes : yaxes, function (i, a) {
                if (a && (a.show || a.reserveSpace)) {
                    if (a === axis) { found = !0 } else if (a.options.position === pos) { if (found) { outermost = !1 } else { innermost = !1 } }
                    if (!found) { first = !1 }
                }
            }); if (outermost) { axisMargin = 0 }
            if (tickLength == null) { tickLength = first ? "full" : 5 }
            if (!isNaN(+tickLength))
                padding += +tickLength; if (isXAxis) {
                    lh += padding; if (pos == "bottom") { plotOffset.bottom += lh + axisMargin; axis.box = { top: surface.height - plotOffset.bottom, height: lh } }
                    else { axis.box = { top: plotOffset.top + axisMargin, height: lh }; plotOffset.top += lh + axisMargin }
                }
            else {
                lw += padding; if (pos == "left") { axis.box = { left: plotOffset.left + axisMargin, width: lw }; plotOffset.left += lw + axisMargin }
                else { plotOffset.right += lw + axisMargin; axis.box = { left: surface.width - plotOffset.right, width: lw } }
            }
            axis.position = pos; axis.tickLength = tickLength; axis.box.padding = padding; axis.innermost = innermost
        }
        function allocateAxisBoxSecondPhase(axis) {
            if (axis.direction == "x") { axis.box.left = plotOffset.left - axis.labelWidth / 2; axis.box.width = surface.width - plotOffset.left - plotOffset.right + axis.labelWidth }
            else { axis.box.top = plotOffset.top - axis.labelHeight / 2; axis.box.height = surface.height - plotOffset.bottom - plotOffset.top + axis.labelHeight }
        }
        function adjustLayoutForThingsStickingOut() {
            var minMargin = options.grid.minBorderMargin, axis, i; if (minMargin == null) {
                minMargin = 0; for (i = 0; i < series.length; ++i)
                    minMargin = Math.max(minMargin, 2 * (series[i].points.radius + series[i].points.lineWidth / 2));
            }
            var margins = { left: minMargin, right: minMargin, top: minMargin, bottom: minMargin }; $.each(allAxes(), function (_, axis) { if (axis.reserveSpace && axis.ticks && axis.ticks.length) { if (axis.direction === "x") { margins.left = Math.max(margins.left, axis.labelWidth / 2); margins.right = Math.max(margins.right, axis.labelWidth / 2) } else { margins.bottom = Math.max(margins.bottom, axis.labelHeight / 2); margins.top = Math.max(margins.top, axis.labelHeight / 2) } } }); plotOffset.left = Math.ceil(Math.max(margins.left, plotOffset.left)); plotOffset.right = Math.ceil(Math.max(margins.right, plotOffset.right)); plotOffset.top = Math.ceil(Math.max(margins.top, plotOffset.top)); plotOffset.bottom = Math.ceil(Math.max(margins.bottom, plotOffset.bottom))
        }
        function setupGrid() {
            var i, axes = allAxes(), showGrid = options.grid.show; for (var a in plotOffset) { var margin = options.grid.margin || 0; plotOffset[a] = typeof margin == "number" ? margin : margin[a] || 0 }
            executeHooks(hooks.processOffset, [plotOffset]); for (var a in plotOffset) {
                if (typeof (options.grid.borderWidth) == "object") { plotOffset[a] += showGrid ? options.grid.borderWidth[a] : 0 }
                else { plotOffset[a] += showGrid ? options.grid.borderWidth : 0 }
            }
            $.each(axes, function (_, axis) { var axisOpts = axis.options; axis.show = axisOpts.show == null ? axis.used : axisOpts.show; axis.reserveSpace = axisOpts.reserveSpace == null ? axis.show : axisOpts.reserveSpace; setRange(axis) }); if (showGrid) {
                var allocatedAxes = $.grep(axes, function (axis) { return axis.show || axis.reserveSpace }); $.each(allocatedAxes, function (_, axis) { setupTickGeneration(axis); setTicks(axis); snapRangeToTicks(axis, axis.ticks); measureTickLabels(axis) }); for (i = allocatedAxes.length - 1; i >= 0; --i)
                    allocateAxisBoxFirstPhase(allocatedAxes[i]); adjustLayoutForThingsStickingOut(); $.each(allocatedAxes, function (_, axis) { allocateAxisBoxSecondPhase(axis) })
            }
            plotWidth = surface.width - plotOffset.left - plotOffset.right; plotHeight = surface.height - plotOffset.bottom - plotOffset.top; $.each(axes, function (_, axis) { setTransformationHelpers(axis) }); if (showGrid) { drawAxisLabels() }
            insertLegend()
        }
        function setRange(axis) {
            var opts = axis.options, min = +(opts.min != null ? opts.min : axis.datamin), max = +(opts.max != null ? opts.max : axis.datamax), delta = max - min; if (delta == 0.0) {
                var widen = max == 0 ? 1 : 0.01; if (opts.min == null)
                    min -= widen; if (opts.max == null || opts.min != null)
                    max += widen
            }
            else {
                var margin = opts.autoscaleMargin; if (margin != null) {
                    if (opts.min == null) {
                        min -= delta * margin; if (min < 0 && axis.datamin != null && axis.datamin >= 0)
                            min = 0
                    }
                    if (opts.max == null) {
                        max += delta * margin; if (max > 0 && axis.datamax != null && axis.datamax <= 0)
                            max = 0
                    }
                }
            }
            axis.min = min; axis.max = max
        }
        function setupTickGeneration(axis) {
            var opts = axis.options; var noTicks; if (typeof opts.ticks == "number" && opts.ticks > 0)
                noTicks = opts.ticks; else noTicks = 0.3 * Math.sqrt(axis.direction == "x" ? surface.width : surface.height); var delta = (axis.max - axis.min) / noTicks, dec = -Math.floor(Math.log(delta) / Math.LN10), maxDec = opts.tickDecimals; if (maxDec != null && dec > maxDec) { dec = maxDec }
            var magn = Math.pow(10, -dec), norm = delta / magn, size; if (norm < 1.5) { size = 1 } else if (norm < 3) { size = 2; if (norm > 2.25 && (maxDec == null || dec + 1 <= maxDec)) { size = 2.5; ++dec } } else if (norm < 7.5) { size = 5 } else { size = 10 }
            size *= magn; if (opts.minTickSize != null && size < opts.minTickSize) { size = opts.minTickSize }
            axis.delta = delta; axis.tickDecimals = Math.max(0, maxDec != null ? maxDec : dec); axis.tickSize = opts.tickSize || size; if (opts.mode == "time" && !axis.tickGenerator) { throw new Error("Time mode requires the flot.time plugin.") }
            if (!axis.tickGenerator) {
                axis.tickGenerator = function (axis) { var ticks = [], start = floorInBase(axis.min, axis.tickSize), i = 0, v = Number.NaN, prev; do { prev = v; v = start + i * axis.tickSize; ticks.push(v); ++i } while (v < axis.max && v != prev); return ticks }; axis.tickFormatter = function (value, axis) {
                    var factor = axis.tickDecimals ? Math.pow(10, axis.tickDecimals) : 1; var formatted = "" + Math.round(value * factor) / factor; if (axis.tickDecimals != null) { var decimal = formatted.indexOf("."); var precision = decimal == -1 ? 0 : formatted.length - decimal - 1; if (precision < axis.tickDecimals) { return (precision ? formatted : formatted + ".") + ("" + factor).substr(1, axis.tickDecimals - precision) } }
                    return formatted
                }
            }
            if (typeof opts.tickFormatter === "function")
                axis.tickFormatter = function (v, axis) { return "" + opts.tickFormatter(v, axis) }; if (opts.alignTicksWithAxis != null) {
                    var otherAxis = (axis.direction == "x" ? xaxes : yaxes)[opts.alignTicksWithAxis - 1]; if (otherAxis && otherAxis.used && otherAxis != axis) {
                        var niceTicks = axis.tickGenerator(axis); if (niceTicks.length > 0) {
                            if (opts.min == null)
                                axis.min = Math.min(axis.min, niceTicks[0]); if (opts.max == null && niceTicks.length > 1)
                                axis.max = Math.max(axis.max, niceTicks[niceTicks.length - 1])
                        }
                        axis.tickGenerator = function (axis) {
                            var ticks = [], v, i; for (i = 0; i < otherAxis.ticks.length; ++i) { v = (otherAxis.ticks[i].v - otherAxis.min) / (otherAxis.max - otherAxis.min); v = axis.min + v * (axis.max - axis.min); ticks.push(v) }
                            return ticks
                        }; if (!axis.mode && opts.tickDecimals == null) {
                            var extraDec = Math.max(0, -Math.floor(Math.log(axis.delta) / Math.LN10) + 1), ts = axis.tickGenerator(axis); if (!(ts.length > 1 && /\..*0$/.test((ts[1] - ts[0]).toFixed(extraDec))))
                                axis.tickDecimals = extraDec
                        }
                    }
                }
        }
        function setTicks(axis) {
            var oticks = axis.options.ticks, ticks = []; if (oticks == null || (typeof oticks == "number" && oticks > 0))
                ticks = axis.tickGenerator(axis); else if (oticks) {
                    if (typeof oticks === "function")
                        ticks = oticks(axis); else ticks = oticks
                }
            var i, v; axis.ticks = []; for (i = 0; i < ticks.length; ++i) {
                var label = null; var t = ticks[i]; if (typeof t == "object") {
                    v = +t[0]; if (t.length > 1)
                        label = t[1]
                }
                else v = +t; if (label == null)
                    label = axis.tickFormatter(v, axis); if (!isNaN(v))
                    axis.ticks.push({ v: v, label: label })
            }
        }
        function snapRangeToTicks(axis, ticks) {
            if (axis.options.autoscaleMargin && ticks.length > 0) {
                if (axis.options.min == null)
                    axis.min = Math.min(axis.min, ticks[0].v); if (axis.options.max == null && ticks.length > 1)
                    axis.max = Math.max(axis.max, ticks[ticks.length - 1].v)
            }
        }
        function draw() {
            surface.clear(); executeHooks(hooks.drawBackground, [ctx]); var grid = options.grid; if (grid.show && grid.backgroundColor)
                drawBackground(); if (grid.show && !grid.aboveData) { drawGrid() }
            for (var i = 0; i < series.length; ++i) { executeHooks(hooks.drawSeries, [ctx, series[i]]); drawSeries(series[i]) }
            executeHooks(hooks.draw, [ctx]); if (grid.show && grid.aboveData) { drawGrid() }
            surface.render(); triggerRedrawOverlay()
        }
        function extractRange(ranges, coord) {
            var axis, from, to, key, axes = allAxes(); for (var i = 0; i < axes.length; ++i) {
                axis = axes[i]; if (axis.direction == coord) {
                    key = coord + axis.n + "axis"; if (!ranges[key] && axis.n == 1)
                        key = coord + "axis"; if (ranges[key]) { from = ranges[key].from; to = ranges[key].to; break }
                }
            }
            if (!ranges[key]) { axis = coord == "x" ? xaxes[0] : yaxes[0]; from = ranges[coord + "1"]; to = ranges[coord + "2"] }
            if (from != null && to != null && from > to) { var tmp = from; from = to; to = tmp }
            return { from: from, to: to, axis: axis }
        }
        function drawBackground() { ctx.save(); ctx.translate(plotOffset.left, plotOffset.top); ctx.fillStyle = getColorOrGradient(options.grid.backgroundColor, plotHeight, 0, "rgba(255, 255, 255, 0)"); ctx.fillRect(0, 0, plotWidth, plotHeight); ctx.restore() }
        function drawGrid() {
            var i, axes, bw, bc; ctx.save(); ctx.translate(plotOffset.left, plotOffset.top); var markings = options.grid.markings; if (markings) {
                if (typeof markings === "function") { axes = plot.getAxes(); axes.xmin = axes.xaxis.min; axes.xmax = axes.xaxis.max; axes.ymin = axes.yaxis.min; axes.ymax = axes.yaxis.max; markings = markings(axes) }
                for (i = 0; i < markings.length; ++i) {
                    var m = markings[i], xrange = extractRange(m, "x"), yrange = extractRange(m, "y"); if (xrange.from == null)
                        xrange.from = xrange.axis.min; if (xrange.to == null)
                        xrange.to = xrange.axis.max; if (yrange.from == null)
                        yrange.from = yrange.axis.min; if (yrange.to == null)
                        yrange.to = yrange.axis.max; if (xrange.to < xrange.axis.min || xrange.from > xrange.axis.max || yrange.to < yrange.axis.min || yrange.from > yrange.axis.max)
                        continue; xrange.from = Math.max(xrange.from, xrange.axis.min); xrange.to = Math.min(xrange.to, xrange.axis.max); yrange.from = Math.max(yrange.from, yrange.axis.min); yrange.to = Math.min(yrange.to, yrange.axis.max); var xequal = xrange.from === xrange.to, yequal = yrange.from === yrange.to; if (xequal && yequal) { continue }
                    xrange.from = Math.floor(xrange.axis.p2c(xrange.from)); xrange.to = Math.floor(xrange.axis.p2c(xrange.to)); yrange.from = Math.floor(yrange.axis.p2c(yrange.from)); yrange.to = Math.floor(yrange.axis.p2c(yrange.to)); if (xequal || yequal) {
                        var lineWidth = m.lineWidth || options.grid.markingsLineWidth, subPixel = lineWidth % 2 ? 0.5 : 0; ctx.beginPath(); ctx.strokeStyle = m.color || options.grid.markingsColor; ctx.lineWidth = lineWidth; if (xequal) { ctx.moveTo(xrange.to + subPixel, yrange.from); ctx.lineTo(xrange.to + subPixel, yrange.to) } else { ctx.moveTo(xrange.from, yrange.to + subPixel); ctx.lineTo(xrange.to, yrange.to + subPixel) }
                        ctx.stroke()
                    } else { ctx.fillStyle = m.color || options.grid.markingsColor; ctx.fillRect(xrange.from, yrange.to, xrange.to - xrange.from, yrange.from - yrange.to) }
                }
            }
            axes = allAxes(); bw = options.grid.borderWidth; for (var j = 0; j < axes.length; ++j) {
                var axis = axes[j], box = axis.box, t = axis.tickLength, x, y, xoff, yoff; if (!axis.show || axis.ticks.length == 0)
                    continue; ctx.lineWidth = 1; if (axis.direction == "x") {
                        x = 0; if (t == "full")
                            y = (axis.position == "top" ? 0 : plotHeight); else y = box.top - plotOffset.top + (axis.position == "top" ? box.height : 0)
                    }
                else {
                    y = 0; if (t == "full")
                        x = (axis.position == "left" ? 0 : plotWidth); else x = box.left - plotOffset.left + (axis.position == "left" ? box.width : 0)
                }
                if (!axis.innermost) {
                    ctx.strokeStyle = axis.options.color; ctx.beginPath(); xoff = yoff = 0; if (axis.direction == "x")
                        xoff = plotWidth + 1; else yoff = plotHeight + 1; if (ctx.lineWidth == 1) { if (axis.direction == "x") { y = Math.floor(y) + 0.5 } else { x = Math.floor(x) + 0.5 } }
                    ctx.moveTo(x, y); ctx.lineTo(x + xoff, y + yoff); ctx.stroke()
                }
                ctx.strokeStyle = axis.options.tickColor; ctx.beginPath(); for (i = 0; i < axis.ticks.length; ++i) {
                    var v = axis.ticks[i].v; xoff = yoff = 0; if (isNaN(v) || v < axis.min || v > axis.max || (t == "full" && ((typeof bw == "object" && bw[axis.position] > 0) || bw > 0) && (v == axis.min || v == axis.max)))
                        continue; if (axis.direction == "x") {
                            x = axis.p2c(v); yoff = t == "full" ? -plotHeight : t; if (axis.position == "top")
                                yoff = -yoff
                        }
                    else {
                        y = axis.p2c(v); xoff = t == "full" ? -plotWidth : t; if (axis.position == "left")
                            xoff = -xoff
                    }
                    if (ctx.lineWidth == 1) {
                        if (axis.direction == "x")
                            x = Math.floor(x) + 0.5; else y = Math.floor(y) + 0.5
                    }
                    ctx.moveTo(x, y); ctx.lineTo(x + xoff, y + yoff)
                }
                ctx.stroke()
            }
            if (bw) {
                bc = options.grid.borderColor; if (typeof bw == "object" || typeof bc == "object") {
                    if (typeof bw !== "object") { bw = { top: bw, right: bw, bottom: bw, left: bw } }
                    if (typeof bc !== "object") { bc = { top: bc, right: bc, bottom: bc, left: bc } }
                    if (bw.top > 0) { ctx.strokeStyle = bc.top; ctx.lineWidth = bw.top; ctx.beginPath(); ctx.moveTo(0 - bw.left, 0 - bw.top / 2); ctx.lineTo(plotWidth, 0 - bw.top / 2); ctx.stroke() }
                    if (bw.right > 0) { ctx.strokeStyle = bc.right; ctx.lineWidth = bw.right; ctx.beginPath(); ctx.moveTo(plotWidth + bw.right / 2, 0 - bw.top); ctx.lineTo(plotWidth + bw.right / 2, plotHeight); ctx.stroke() }
                    if (bw.bottom > 0) { ctx.strokeStyle = bc.bottom; ctx.lineWidth = bw.bottom; ctx.beginPath(); ctx.moveTo(plotWidth + bw.right, plotHeight + bw.bottom / 2); ctx.lineTo(0, plotHeight + bw.bottom / 2); ctx.stroke() }
                    if (bw.left > 0) { ctx.strokeStyle = bc.left; ctx.lineWidth = bw.left; ctx.beginPath(); ctx.moveTo(0 - bw.left / 2, plotHeight + bw.bottom); ctx.lineTo(0 - bw.left / 2, 0); ctx.stroke() }
                }
                else { ctx.lineWidth = bw; ctx.strokeStyle = options.grid.borderColor; ctx.strokeRect(-bw / 2, -bw / 2, plotWidth + bw, plotHeight + bw) }
            }
            ctx.restore()
        }
        function drawAxisLabels() {
            $.each(allAxes(), function (_, axis) {
                var box = axis.box, legacyStyles = axis.direction + "Axis " + axis.direction + axis.n + "Axis", layer = "flot-" + axis.direction + "-axis flot-" + axis.direction + axis.n + "-axis " + legacyStyles, font = axis.options.font || "flot-tick-label tickLabel", tick, x, y, halign, valign; surface.removeText(layer); if (!axis.show || axis.ticks.length == 0)
                    return; for (var i = 0; i < axis.ticks.length; ++i) {
                        tick = axis.ticks[i]; if (!tick.label || tick.v < axis.min || tick.v > axis.max)
                            continue; if (axis.direction == "x") { halign = "center"; x = plotOffset.left + axis.p2c(tick.v); if (axis.position == "bottom") { y = box.top + box.padding } else { y = box.top + box.height - box.padding; valign = "bottom" } } else { valign = "middle"; y = plotOffset.top + axis.p2c(tick.v); if (axis.position == "left") { x = box.left + box.width - box.padding; halign = "right" } else { x = box.left + box.padding } }
                        surface.addText(layer, x, y, tick.label, font, null, null, halign, valign)
                    }
            })
        }
        function drawSeries(series) {
            if (series.lines.show)
                drawSeriesLines(series); if (series.bars.show)
                drawSeriesBars(series); if (series.points.show)
                drawSeriesPoints(series)
        }
        function drawSeriesLines(series) {
            function plotLine(datapoints, xoffset, yoffset, axisx, axisy) {
                var points = datapoints.points, ps = datapoints.pointsize, prevx = null, prevy = null; ctx.beginPath(); for (var i = ps; i < points.length; i += ps) {
                    var x1 = points[i - ps], y1 = points[i - ps + 1], x2 = points[i], y2 = points[i + 1]; if (x1 == null || x2 == null)
                        continue; if (y1 <= y2 && y1 < axisy.min) {
                            if (y2 < axisy.min)
                                continue; x1 = (axisy.min - y1) / (y2 - y1) * (x2 - x1) + x1; y1 = axisy.min
                        }
                    else if (y2 <= y1 && y2 < axisy.min) {
                        if (y1 < axisy.min)
                            continue; x2 = (axisy.min - y1) / (y2 - y1) * (x2 - x1) + x1; y2 = axisy.min
                    }
                    if (y1 >= y2 && y1 > axisy.max) {
                        if (y2 > axisy.max)
                            continue; x1 = (axisy.max - y1) / (y2 - y1) * (x2 - x1) + x1; y1 = axisy.max
                    }
                    else if (y2 >= y1 && y2 > axisy.max) {
                        if (y1 > axisy.max)
                            continue; x2 = (axisy.max - y1) / (y2 - y1) * (x2 - x1) + x1; y2 = axisy.max
                    }
                    if (x1 <= x2 && x1 < axisx.min) {
                        if (x2 < axisx.min)
                            continue; y1 = (axisx.min - x1) / (x2 - x1) * (y2 - y1) + y1; x1 = axisx.min
                    }
                    else if (x2 <= x1 && x2 < axisx.min) {
                        if (x1 < axisx.min)
                            continue; y2 = (axisx.min - x1) / (x2 - x1) * (y2 - y1) + y1; x2 = axisx.min
                    }
                    if (x1 >= x2 && x1 > axisx.max) {
                        if (x2 > axisx.max)
                            continue; y1 = (axisx.max - x1) / (x2 - x1) * (y2 - y1) + y1; x1 = axisx.max
                    }
                    else if (x2 >= x1 && x2 > axisx.max) {
                        if (x1 > axisx.max)
                            continue; y2 = (axisx.max - x1) / (x2 - x1) * (y2 - y1) + y1; x2 = axisx.max
                    }
                    if (x1 != prevx || y1 != prevy)
                        ctx.moveTo(axisx.p2c(x1) + xoffset, axisy.p2c(y1) + yoffset); prevx = x2; prevy = y2; ctx.lineTo(axisx.p2c(x2) + xoffset, axisy.p2c(y2) + yoffset)
                }
                ctx.stroke()
            }
            function plotLineArea(datapoints, axisx, axisy) {
                var points = datapoints.points, ps = datapoints.pointsize, bottom = Math.min(Math.max(0, axisy.min), axisy.max), i = 0, top, areaOpen = !1, ypos = 1, segmentStart = 0, segmentEnd = 0; while (!0) {
                    if (ps > 0 && i > points.length + ps)
                        break; i += ps; var x1 = points[i - ps], y1 = points[i - ps + ypos], x2 = points[i], y2 = points[i + ypos]; if (areaOpen) {
                            if (ps > 0 && x1 != null && x2 == null) { segmentEnd = i; ps = -ps; ypos = 2; continue }
                            if (ps < 0 && i == segmentStart + ps) { ctx.fill(); areaOpen = !1; ps = -ps; ypos = 1; i = segmentStart = segmentEnd + ps; continue }
                        }
                    if (x1 == null || x2 == null)
                        continue; if (x1 <= x2 && x1 < axisx.min) {
                            if (x2 < axisx.min)
                                continue; y1 = (axisx.min - x1) / (x2 - x1) * (y2 - y1) + y1; x1 = axisx.min
                        }
                    else if (x2 <= x1 && x2 < axisx.min) {
                        if (x1 < axisx.min)
                            continue; y2 = (axisx.min - x1) / (x2 - x1) * (y2 - y1) + y1; x2 = axisx.min
                    }
                    if (x1 >= x2 && x1 > axisx.max) {
                        if (x2 > axisx.max)
                            continue; y1 = (axisx.max - x1) / (x2 - x1) * (y2 - y1) + y1; x1 = axisx.max
                    }
                    else if (x2 >= x1 && x2 > axisx.max) {
                        if (x1 > axisx.max)
                            continue; y2 = (axisx.max - x1) / (x2 - x1) * (y2 - y1) + y1; x2 = axisx.max
                    }
                    if (!areaOpen) { ctx.beginPath(); ctx.moveTo(axisx.p2c(x1), axisy.p2c(bottom)); areaOpen = !0 }
                    if (y1 >= axisy.max && y2 >= axisy.max) { ctx.lineTo(axisx.p2c(x1), axisy.p2c(axisy.max)); ctx.lineTo(axisx.p2c(x2), axisy.p2c(axisy.max)); continue }
                    else if (y1 <= axisy.min && y2 <= axisy.min) { ctx.lineTo(axisx.p2c(x1), axisy.p2c(axisy.min)); ctx.lineTo(axisx.p2c(x2), axisy.p2c(axisy.min)); continue }
                    var x1old = x1, x2old = x2; if (y1 <= y2 && y1 < axisy.min && y2 >= axisy.min) { x1 = (axisy.min - y1) / (y2 - y1) * (x2 - x1) + x1; y1 = axisy.min }
                    else if (y2 <= y1 && y2 < axisy.min && y1 >= axisy.min) { x2 = (axisy.min - y1) / (y2 - y1) * (x2 - x1) + x1; y2 = axisy.min }
                    if (y1 >= y2 && y1 > axisy.max && y2 <= axisy.max) { x1 = (axisy.max - y1) / (y2 - y1) * (x2 - x1) + x1; y1 = axisy.max }
                    else if (y2 >= y1 && y2 > axisy.max && y1 <= axisy.max) { x2 = (axisy.max - y1) / (y2 - y1) * (x2 - x1) + x1; y2 = axisy.max }
                    if (x1 != x1old) { ctx.lineTo(axisx.p2c(x1old), axisy.p2c(y1)) }
                    ctx.lineTo(axisx.p2c(x1), axisy.p2c(y1)); ctx.lineTo(axisx.p2c(x2), axisy.p2c(y2)); if (x2 != x2old) { ctx.lineTo(axisx.p2c(x2), axisy.p2c(y2)); ctx.lineTo(axisx.p2c(x2old), axisy.p2c(y2)) }
                }
            }
            ctx.save(); ctx.translate(plotOffset.left, plotOffset.top); ctx.lineJoin = "round"; var lw = series.lines.lineWidth, sw = series.shadowSize; if (lw > 0 && sw > 0) { ctx.lineWidth = sw; ctx.strokeStyle = "rgba(0,0,0,0.1)"; var angle = Math.PI / 18; plotLine(series.datapoints, Math.sin(angle) * (lw / 2 + sw / 2), Math.cos(angle) * (lw / 2 + sw / 2), series.xaxis, series.yaxis); ctx.lineWidth = sw / 2; plotLine(series.datapoints, Math.sin(angle) * (lw / 2 + sw / 4), Math.cos(angle) * (lw / 2 + sw / 4), series.xaxis, series.yaxis) }
            ctx.lineWidth = lw; ctx.strokeStyle = series.color; var fillStyle = getFillStyle(series.lines, series.color, 0, plotHeight); if (fillStyle) { ctx.fillStyle = fillStyle; plotLineArea(series.datapoints, series.xaxis, series.yaxis) }
            if (lw > 0)
                plotLine(series.datapoints, 0, 0, series.xaxis, series.yaxis); ctx.restore()
        }
        function drawSeriesPoints(series) {
            function plotPoints(datapoints, radius, fillStyle, offset, shadow, axisx, axisy, symbol) {
                var points = datapoints.points, ps = datapoints.pointsize; for (var i = 0; i < points.length; i += ps) {
                    var x = points[i], y = points[i + 1]; if (x == null || x < axisx.min || x > axisx.max || y < axisy.min || y > axisy.max)
                        continue; ctx.beginPath(); x = axisx.p2c(x); y = axisy.p2c(y) + offset; if (symbol == "circle")
                        ctx.arc(x, y, radius, 0, shadow ? Math.PI : Math.PI * 2, !1); else symbol(ctx, x, y, radius, shadow); ctx.closePath(); if (fillStyle) { ctx.fillStyle = fillStyle; ctx.fill() }
                    ctx.stroke()
                }
            }
            ctx.save(); ctx.translate(plotOffset.left, plotOffset.top); var lw = series.points.lineWidth, sw = series.shadowSize, radius = series.points.radius, symbol = series.points.symbol; if (lw == 0)
                lw = 0.0001; if (lw > 0 && sw > 0) { var w = sw / 2; ctx.lineWidth = w; ctx.strokeStyle = "rgba(0,0,0,0.1)"; plotPoints(series.datapoints, radius, null, w + w / 2, !0, series.xaxis, series.yaxis, symbol); ctx.strokeStyle = "rgba(0,0,0,0.2)"; plotPoints(series.datapoints, radius, null, w / 2, !0, series.xaxis, series.yaxis, symbol) }
            ctx.lineWidth = lw; ctx.strokeStyle = series.color; plotPoints(series.datapoints, radius, getFillStyle(series.points, series.color), 0, !1, series.xaxis, series.yaxis, symbol); ctx.restore()
        }
        function drawBar(x, y, b, barLeft, barRight, fillStyleCallback, axisx, axisy, c, horizontal, lineWidth) {
            var left, right, bottom, top, drawLeft, drawRight, drawTop, drawBottom, tmp; if (horizontal) { drawBottom = drawRight = drawTop = !0; drawLeft = !1; left = b; right = x; top = y + barLeft; bottom = y + barRight; if (right < left) { tmp = right; right = left; left = tmp; drawLeft = !0; drawRight = !1 } }
            else { drawLeft = drawRight = drawTop = !0; drawBottom = !1; left = x + barLeft; right = x + barRight; bottom = b; top = y; if (top < bottom) { tmp = top; top = bottom; bottom = tmp; drawBottom = !0; drawTop = !1 } }
            if (right < axisx.min || left > axisx.max || top < axisy.min || bottom > axisy.max)
                return; if (left < axisx.min) { left = axisx.min; drawLeft = !1 }
            if (right > axisx.max) { right = axisx.max; drawRight = !1 }
            if (bottom < axisy.min) { bottom = axisy.min; drawBottom = !1 }
            if (top > axisy.max) { top = axisy.max; drawTop = !1 }
            left = axisx.p2c(left); bottom = axisy.p2c(bottom); right = axisx.p2c(right); top = axisy.p2c(top); if (fillStyleCallback) { c.fillStyle = fillStyleCallback(bottom, top); c.fillRect(left, top, right - left, bottom - top) }
            if (lineWidth > 0 && (drawLeft || drawRight || drawTop || drawBottom)) {
                c.beginPath(); c.moveTo(left, bottom); if (drawLeft)
                    c.lineTo(left, top); else c.moveTo(left, top); if (drawTop)
                    c.lineTo(right, top); else c.moveTo(right, top); if (drawRight)
                    c.lineTo(right, bottom); else c.moveTo(right, bottom); if (drawBottom)
                    c.lineTo(left, bottom); else c.moveTo(left, bottom); c.stroke()
            }
        }
        function drawSeriesBars(series) {
            function plotBars(datapoints, barLeft, barRight, fillStyleCallback, axisx, axisy) {
                var points = datapoints.points, ps = datapoints.pointsize; for (var i = 0; i < points.length; i += ps) {
                    if (points[i] == null)
                        continue; drawBar(points[i], points[i + 1], points[i + 2], barLeft, barRight, fillStyleCallback, axisx, axisy, ctx, series.bars.horizontal, series.bars.lineWidth)
                }
            }
            ctx.save(); ctx.translate(plotOffset.left, plotOffset.top); ctx.lineWidth = series.bars.lineWidth; ctx.strokeStyle = series.color; var barLeft; switch (series.bars.align) { case "left": barLeft = 0; break; case "right": barLeft = -series.bars.barWidth; break; default: barLeft = -series.bars.barWidth / 2 }
            var fillStyleCallback = series.bars.fill ? function (bottom, top) { return getFillStyle(series.bars, series.color, bottom, top) } : null; plotBars(series.datapoints, barLeft, barLeft + series.bars.barWidth, fillStyleCallback, series.xaxis, series.yaxis); ctx.restore()
        }
        function getFillStyle(filloptions, seriesColor, bottom, top) {
            var fill = filloptions.fill; if (!fill)
                return null; if (filloptions.fillColor)
                return getColorOrGradient(filloptions.fillColor, bottom, top, seriesColor); var c = $.color.parse(seriesColor); c.a = typeof fill == "number" ? fill : 0.4; c.normalize(); return c.toString()
        }
        function insertLegend() {
            if (options.legend.container != null) { $(options.legend.container).html("") } else { placeholder.find(".legend").remove() }
            if (!options.legend.show) { return }
            var fragments = [], entries = [], rowStarted = !1, lf = options.legend.labelFormatter, s, label; for (var i = 0; i < series.length; ++i) { s = series[i]; if (s.label) { label = lf ? lf(s.label, s) : s.label; if (label) { entries.push({ label: label, color: s.color }) } } }
            if (options.legend.sorted) { if (typeof options.legend.sorted === "function") { entries.sort(options.legend.sorted) } else if (options.legend.sorted == "reverse") { entries.reverse() } else { var ascending = options.legend.sorted != "descending"; entries.sort(function (a, b) { return a.label == b.label ? 0 : ((a.label < b.label) != ascending ? 1 : -1) }) } }
            for (var i = 0; i < entries.length; ++i) {
                var entry = entries[i]; if (i % options.legend.noColumns == 0) {
                    if (rowStarted)
                        fragments.push('</tr>'); fragments.push('<tr>'); rowStarted = !0
                }
                fragments.push('<td class="legendColorBox"><div style="border:1px solid ' + options.legend.labelBoxBorderColor + ';padding:1px"><div style="width:4px;height:0;border:5px solid ' + entry.color + ';overflow:hidden"></div></div></td>' + '<td class="legendLabel">' + entry.label + '</td>')
            }
            if (rowStarted)
                fragments.push('</tr>'); if (fragments.length == 0)
                return; var table = '<table style="font-size:smaller;color:' + options.grid.color + '">' + fragments.join("") + '</table>'; if (options.legend.container != null)
                $(options.legend.container).html(table); else {
                    var pos = "", p = options.legend.position, m = options.legend.margin; if (m[0] == null)
                        m = [m, m]; if (p.charAt(0) == "n")
                    pos += 'top:' + (m[1] + plotOffset.top) + 'px;'; else if (p.charAt(0) == "s")
                    pos += 'bottom:' + (m[1] + plotOffset.bottom) + 'px;'; if (p.charAt(1) == "e")
                    pos += 'right:' + (m[0] + plotOffset.right) + 'px;'; else if (p.charAt(1) == "w")
                    pos += 'left:' + (m[0] + plotOffset.left) + 'px;'; var legend = $('<div class="legend">' + table.replace('style="', 'style="position:absolute;' + pos + ';') + '</div>').appendTo(placeholder); if (options.legend.backgroundOpacity != 0.0) {
                        var c = options.legend.backgroundColor; if (c == null) {
                            c = options.grid.backgroundColor; if (c && typeof c == "string")
                                c = $.color.parse(c); else c = $.color.extract(legend, 'background-color'); c.a = 1; c = c.toString()
                        }
                        var div = legend.children(); $('<div style="position:absolute;width:' + div.width() + 'px;height:' + div.height() + 'px;' + pos + 'background-color:' + c + ';"> </div>').prependTo(legend).css('opacity', options.legend.backgroundOpacity)
                    }
            }
        }
        var highlights = [], redrawTimeout = null; function findNearbyItem(mouseX, mouseY, seriesFilter) {
            var maxDistance = options.grid.mouseActiveRadius, smallestDistance = maxDistance * maxDistance + 1, item = null, foundPoint = !1, i, j, ps; for (i = series.length - 1; i >= 0; --i) {
                if (!seriesFilter(series[i]))
                    continue; var s = series[i], axisx = s.xaxis, axisy = s.yaxis, points = s.datapoints.points, mx = axisx.c2p(mouseX), my = axisy.c2p(mouseY), maxx = maxDistance / axisx.scale, maxy = maxDistance / axisy.scale; ps = s.datapoints.pointsize; if (axisx.options.inverseTransform)
                    maxx = Number.MAX_VALUE; if (axisy.options.inverseTransform)
                    maxy = Number.MAX_VALUE; if (s.lines.show || s.points.show) {
                        for (j = 0; j < points.length; j += ps) {
                            var x = points[j], y = points[j + 1]; if (x == null)
                                continue; if (x - mx > maxx || x - mx < -maxx || y - my > maxy || y - my < -maxy)
                                continue; var dx = Math.abs(axisx.p2c(x) - mouseX), dy = Math.abs(axisy.p2c(y) - mouseY), dist = dx * dx + dy * dy; if (dist < smallestDistance) { smallestDistance = dist; item = [i, j / ps] }
                        }
                    }
                if (s.bars.show && !item) {
                    var barLeft, barRight; switch (s.bars.align) { case "left": barLeft = 0; break; case "right": barLeft = -s.bars.barWidth; break; default: barLeft = -s.bars.barWidth / 2 }
                    barRight = barLeft + s.bars.barWidth; for (j = 0; j < points.length; j += ps) {
                        var x = points[j], y = points[j + 1], b = points[j + 2]; if (x == null)
                            continue; if (series[i].bars.horizontal ? (mx <= Math.max(b, x) && mx >= Math.min(b, x) && my >= y + barLeft && my <= y + barRight) : (mx >= x + barLeft && mx <= x + barRight && my >= Math.min(b, y) && my <= Math.max(b, y)))
                            item = [i, j / ps]
                    }
                }
            }
            if (item) { i = item[0]; j = item[1]; ps = series[i].datapoints.pointsize; return { datapoint: series[i].datapoints.points.slice(j * ps, (j + 1) * ps), dataIndex: j, series: series[i], seriesIndex: i } }
            return null
        }
        function onMouseMove(e) {
            if (options.grid.hoverable)
                triggerClickHoverEvent("plothover", e, function (s) { return s.hoverable != !1 })
        }
        function onMouseLeave(e) {
            if (options.grid.hoverable)
                triggerClickHoverEvent("plothover", e, function (s) { return !1 })
        }
        function onClick(e) { triggerClickHoverEvent("plotclick", e, function (s) { return s.clickable != !1 }) }
        function triggerClickHoverEvent(eventname, event, seriesFilter) {
            var offset = eventHolder.offset(), canvasX = event.pageX - offset.left - plotOffset.left, canvasY = event.pageY - offset.top - plotOffset.top, pos = canvasToAxisCoords({ left: canvasX, top: canvasY }); pos.pageX = event.pageX; pos.pageY = event.pageY; var item = findNearbyItem(canvasX, canvasY, seriesFilter); if (item) { item.pageX = parseInt(item.series.xaxis.p2c(item.datapoint[0]) + offset.left + plotOffset.left, 10); item.pageY = parseInt(item.series.yaxis.p2c(item.datapoint[1]) + offset.top + plotOffset.top, 10) }
            if (options.grid.autoHighlight) {
                for (var i = 0; i < highlights.length; ++i) {
                    var h = highlights[i]; if (h.auto == eventname && !(item && h.series == item.series && h.point[0] == item.datapoint[0] && h.point[1] == item.datapoint[1]))
                        unhighlight(h.series, h.point)
                }
                if (item)
                    highlight(item.series, item.datapoint, eventname)
            }
            placeholder.trigger(eventname, [pos, item])
        }
        function triggerRedrawOverlay() {
            var t = options.interaction.redrawOverlayInterval; if (t == -1) { drawOverlay(); return }
            if (!redrawTimeout)
                redrawTimeout = setTimeout(drawOverlay, t)
        }
        function drawOverlay() {
            redrawTimeout = null; octx.save(); overlay.clear(); octx.translate(plotOffset.left, plotOffset.top); var i, hi; for (i = 0; i < highlights.length; ++i) {
                hi = highlights[i]; if (hi.series.bars.show)
                    drawBarHighlight(hi.series, hi.point); else drawPointHighlight(hi.series, hi.point)
            }
            octx.restore(); executeHooks(hooks.drawOverlay, [octx])
        }
        function highlight(s, point, auto) {
            if (typeof s == "number")
                s = series[s]; if (typeof point == "number") { var ps = s.datapoints.pointsize; point = s.datapoints.points.slice(ps * point, ps * (point + 1)) }
            var i = indexOfHighlight(s, point); if (i == -1) { highlights.push({ series: s, point: point, auto: auto }); triggerRedrawOverlay() }
            else if (!auto)
                highlights[i].auto = !1
        }
        function unhighlight(s, point) {
            if (s == null && point == null) { highlights = []; triggerRedrawOverlay(); return }
            if (typeof s == "number")
                s = series[s]; if (typeof point == "number") { var ps = s.datapoints.pointsize; point = s.datapoints.points.slice(ps * point, ps * (point + 1)) }
            var i = indexOfHighlight(s, point); if (i != -1) { highlights.splice(i, 1); triggerRedrawOverlay() }
        }
        function indexOfHighlight(s, p) {
            for (var i = 0; i < highlights.length; ++i) {
                var h = highlights[i]; if (h.series == s && h.point[0] == p[0] && h.point[1] == p[1])
                    return i
            }
            return -1
        }
        function drawPointHighlight(series, point) {
            var x = point[0], y = point[1], axisx = series.xaxis, axisy = series.yaxis, highlightColor = (typeof series.highlightColor === "string") ? series.highlightColor : $.color.parse(series.color).scale('a', 0.5).toString(); if (x < axisx.min || x > axisx.max || y < axisy.min || y > axisy.max)
                return; var pointRadius = series.points.radius + series.points.lineWidth / 2; octx.lineWidth = pointRadius; octx.strokeStyle = highlightColor; var radius = 1.5 * pointRadius; x = axisx.p2c(x); y = axisy.p2c(y); octx.beginPath(); if (series.points.symbol == "circle")
                octx.arc(x, y, radius, 0, 2 * Math.PI, !1); else series.points.symbol(octx, x, y, radius, !1); octx.closePath(); octx.stroke()
        }
        function drawBarHighlight(series, point) {
            var highlightColor = (typeof series.highlightColor === "string") ? series.highlightColor : $.color.parse(series.color).scale('a', 0.5).toString(), fillStyle = highlightColor, barLeft; switch (series.bars.align) { case "left": barLeft = 0; break; case "right": barLeft = -series.bars.barWidth; break; default: barLeft = -series.bars.barWidth / 2 }
            octx.lineWidth = series.bars.lineWidth; octx.strokeStyle = highlightColor; drawBar(point[0], point[1], point[2] || 0, barLeft, barLeft + series.bars.barWidth, function () { return fillStyle }, series.xaxis, series.yaxis, octx, series.bars.horizontal, series.bars.lineWidth)
        }
        function getColorOrGradient(spec, bottom, top, defaultColor) {
            if (typeof spec == "string")
                return spec; else {
                    var gradient = ctx.createLinearGradient(0, top, 0, bottom); for (var i = 0, l = spec.colors.length; i < l; ++i) {
                        var c = spec.colors[i]; if (typeof c != "string") {
                            var co = $.color.parse(defaultColor); if (c.brightness != null)
                                co = co.scale('rgb', c.brightness); if (c.opacity != null)
                                co.a *= c.opacity; c = co.toString()
                        }
                        gradient.addColorStop(i / (l - 1), c)
                    }
                return gradient
            }
        }
    }
    $.plot = function (placeholder, data, options) { var plot = new Plot($(placeholder), data, options, $.plot.plugins); return plot }; $.plot.version = "0.8.3"; $.plot.plugins = []; $.fn.plot = function (data, options) { return this.each(function () { $.plot(this, data, options) }) }; function floorInBase(n, base) { return base * Math.floor(n / base) }
})(jQuery);