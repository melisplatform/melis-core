/**
 * Created by conta on 8/18/2017.
 */
/* jquery.dataTables.min.js */
/*!
 DataTables 1.10.10
 ©2008-2015 SpryMedia Ltd - datatables.net/license
 */
(function(h){"function"===typeof define&&define.amd?define(["jquery"],function(E){return h(E,window,document)}):"object"===typeof exports?module.exports=function(E,H){E||(E=window);H||(H="undefined"!==typeof window?require("jquery"):require("jquery")(E));return h(H,E,E.document)}:h(jQuery,window,document)})(function(h,E,H,k){function Y(a){var b,c,d={};h.each(a,function(e){if((b=e.match(/^([^A-Z]+?)([A-Z])/))&&-1!=="a aa ai ao as b fn i m o s ".indexOf(b[1]+" "))c=e.replace(b[0],b[2].toLowerCase()),
    d[c]=e,"o"===b[1]&&Y(a[e])});a._hungarianMap=d}function J(a,b,c){a._hungarianMap||Y(a);var d;h.each(b,function(e){d=a._hungarianMap[e];if(d!==k&&(c||b[d]===k))"o"===d.charAt(0)?(b[d]||(b[d]={}),h.extend(!0,b[d],b[e]),J(a[d],b[d],c)):b[d]=b[e]})}function Fa(a){var b=m.defaults.oLanguage,c=a.sZeroRecords;!a.sEmptyTable&&(c&&"No data available in table"===b.sEmptyTable)&&F(a,a,"sZeroRecords","sEmptyTable");!a.sLoadingRecords&&(c&&"Loading..."===b.sLoadingRecords)&&F(a,a,"sZeroRecords","sLoadingRecords");
    a.sInfoThousands&&(a.sThousands=a.sInfoThousands);(a=a.sDecimal)&&db(a)}function eb(a){A(a,"ordering","bSort");A(a,"orderMulti","bSortMulti");A(a,"orderClasses","bSortClasses");A(a,"orderCellsTop","bSortCellsTop");A(a,"order","aaSorting");A(a,"orderFixed","aaSortingFixed");A(a,"paging","bPaginate");A(a,"pagingType","sPaginationType");A(a,"pageLength","iDisplayLength");A(a,"searching","bFilter");"boolean"===typeof a.sScrollX&&(a.sScrollX=a.sScrollX?"100%":"");"boolean"===typeof a.scrollX&&(a.scrollX=
    a.scrollX?"100%":"");if(a=a.aoSearchCols)for(var b=0,c=a.length;b<c;b++)a[b]&&J(m.models.oSearch,a[b])}function fb(a){A(a,"orderable","bSortable");A(a,"orderData","aDataSort");A(a,"orderSequence","asSorting");A(a,"orderDataType","sortDataType");var b=a.aDataSort;b&&!h.isArray(b)&&(a.aDataSort=[b])}function gb(a){if(!m.__browser){var b={};m.__browser=b;var c=h("<div/>").css({position:"fixed",top:0,left:0,height:1,width:1,overflow:"hidden"}).append(h("<div/>").css({position:"absolute",top:1,left:1,
    width:100,overflow:"scroll"}).append(h("<div/>").css({width:"100%",height:10}))).appendTo("body"),d=c.children(),e=d.children();b.barWidth=d[0].offsetWidth-d[0].clientWidth;b.bScrollOversize=100===e[0].offsetWidth&&100!==d[0].clientWidth;b.bScrollbarLeft=1!==Math.round(e.offset().left);b.bBounding=c[0].getBoundingClientRect().width?!0:!1;c.remove()}h.extend(a.oBrowser,m.__browser);a.oScroll.iBarWidth=m.__browser.barWidth}function hb(a,b,c,d,e,f){var g,j=!1;c!==k&&(g=c,j=!0);for(;d!==e;)a.hasOwnProperty(d)&&
(g=j?b(g,a[d],d,a):a[d],j=!0,d+=f);return g}function Ga(a,b){var c=m.defaults.column,d=a.aoColumns.length,c=h.extend({},m.models.oColumn,c,{nTh:b?b:H.createElement("th"),sTitle:c.sTitle?c.sTitle:b?b.innerHTML:"",aDataSort:c.aDataSort?c.aDataSort:[d],mData:c.mData?c.mData:d,idx:d});a.aoColumns.push(c);c=a.aoPreSearchCols;c[d]=h.extend({},m.models.oSearch,c[d]);la(a,d,h(b).data())}function la(a,b,c){var b=a.aoColumns[b],d=a.oClasses,e=h(b.nTh);if(!b.sWidthOrig){b.sWidthOrig=e.attr("width")||null;var f=
    (e.attr("style")||"").match(/width:\s*(\d+[pxem%]+)/);f&&(b.sWidthOrig=f[1])}c!==k&&null!==c&&(fb(c),J(m.defaults.column,c),c.mDataProp!==k&&!c.mData&&(c.mData=c.mDataProp),c.sType&&(b._sManualType=c.sType),c.className&&!c.sClass&&(c.sClass=c.className),h.extend(b,c),F(b,c,"sWidth","sWidthOrig"),c.iDataSort!==k&&(b.aDataSort=[c.iDataSort]),F(b,c,"aDataSort"));var g=b.mData,j=Q(g),i=b.mRender?Q(b.mRender):null,c=function(a){return"string"===typeof a&&-1!==a.indexOf("@")};b._bAttrSrc=h.isPlainObject(g)&&
    (c(g.sort)||c(g.type)||c(g.filter));b.fnGetData=function(a,b,c){var d=j(a,b,k,c);return i&&b?i(d,b,a,c):d};b.fnSetData=function(a,b,c){return R(g)(a,b,c)};"number"!==typeof g&&(a._rowReadObject=!0);a.oFeatures.bSort||(b.bSortable=!1,e.addClass(d.sSortableNone));a=-1!==h.inArray("asc",b.asSorting);c=-1!==h.inArray("desc",b.asSorting);!b.bSortable||!a&&!c?(b.sSortingClass=d.sSortableNone,b.sSortingClassJUI=""):a&&!c?(b.sSortingClass=d.sSortableAsc,b.sSortingClassJUI=d.sSortJUIAscAllowed):!a&&c?(b.sSortingClass=
                d.sSortableDesc,b.sSortingClassJUI=d.sSortJUIDescAllowed):(b.sSortingClass=d.sSortable,b.sSortingClassJUI=d.sSortJUI)}function U(a){if(!1!==a.oFeatures.bAutoWidth){var b=a.aoColumns;Ha(a);for(var c=0,d=b.length;c<d;c++)b[c].nTh.style.width=b[c].sWidth}b=a.oScroll;(""!==b.sY||""!==b.sX)&&Z(a);v(a,null,"column-sizing",[a])}function $(a,b){var c=aa(a,"bVisible");return"number"===typeof c[b]?c[b]:null}function ba(a,b){var c=aa(a,"bVisible"),c=h.inArray(b,c);return-1!==c?c:null}function ca(a){return aa(a,
    "bVisible").length}function aa(a,b){var c=[];h.map(a.aoColumns,function(a,e){a[b]&&c.push(e)});return c}function Ia(a){var b=a.aoColumns,c=a.aoData,d=m.ext.type.detect,e,f,g,j,i,h,l,q,u;e=0;for(f=b.length;e<f;e++)if(l=b[e],u=[],!l.sType&&l._sManualType)l.sType=l._sManualType;else if(!l.sType){g=0;for(j=d.length;g<j;g++){i=0;for(h=c.length;i<h;i++){u[i]===k&&(u[i]=B(a,i,e,"type"));q=d[g](u[i],a);if(!q&&g!==d.length-1)break;if("html"===q)break}if(q){l.sType=q;break}}l.sType||(l.sType="string")}}function ib(a,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  b,c,d){var e,f,g,j,i,o,l=a.aoColumns;if(b)for(e=b.length-1;0<=e;e--){o=b[e];var q=o.targets!==k?o.targets:o.aTargets;h.isArray(q)||(q=[q]);f=0;for(g=q.length;f<g;f++)if("number"===typeof q[f]&&0<=q[f]){for(;l.length<=q[f];)Ga(a);d(q[f],o)}else if("number"===typeof q[f]&&0>q[f])d(l.length+q[f],o);else if("string"===typeof q[f]){j=0;for(i=l.length;j<i;j++)("_all"==q[f]||h(l[j].nTh).hasClass(q[f]))&&d(j,o)}}if(c){e=0;for(a=c.length;e<a;e++)d(e,c[e])}}function N(a,b,c,d){var e=a.aoData.length,f=h.extend(!0,
    {},m.models.oRow,{src:c?"dom":"data",idx:e});f._aData=b;a.aoData.push(f);for(var g=a.aoColumns,j=0,i=g.length;j<i;j++)g[j].sType=null;a.aiDisplayMaster.push(e);b=a.rowIdFn(b);b!==k&&(a.aIds[b]=f);(c||!a.oFeatures.bDeferRender)&&Ja(a,e,c,d);return e}function ma(a,b){var c;b instanceof h||(b=h(b));return b.map(function(b,e){c=Ka(a,e);return N(a,c.data,e,c.cells)})}function B(a,b,c,d){var e=a.iDraw,f=a.aoColumns[c],g=a.aoData[b]._aData,j=f.sDefaultContent,i=f.fnGetData(g,d,{settings:a,row:b,col:c});
    if(i===k)return a.iDrawError!=e&&null===j&&(K(a,0,"Requested unknown parameter "+("function"==typeof f.mData?"{function}":"'"+f.mData+"'")+" for row "+b+", column "+c,4),a.iDrawError=e),j;if((i===g||null===i)&&null!==j)i=j;else if("function"===typeof i)return i.call(g);return null===i&&"display"==d?"":i}function jb(a,b,c,d){a.aoColumns[c].fnSetData(a.aoData[b]._aData,d,{settings:a,row:b,col:c})}function La(a){return h.map(a.match(/(\\.|[^\.])+/g)||[""],function(a){return a.replace(/\\./g,".")})}function Q(a){if(h.isPlainObject(a)){var b=
    {};h.each(a,function(a,c){c&&(b[a]=Q(c))});return function(a,c,f,g){var j=b[c]||b._;return j!==k?j(a,c,f,g):a}}if(null===a)return function(a){return a};if("function"===typeof a)return function(b,c,f,g){return a(b,c,f,g)};if("string"===typeof a&&(-1!==a.indexOf(".")||-1!==a.indexOf("[")||-1!==a.indexOf("("))){var c=function(a,b,f){var g,j;if(""!==f){j=La(f);for(var i=0,o=j.length;i<o;i++){f=j[i].match(da);g=j[i].match(V);if(f){j[i]=j[i].replace(da,"");""!==j[i]&&(a=a[j[i]]);g=[];j.splice(0,i+1);j=
    j.join(".");if(h.isArray(a)){i=0;for(o=a.length;i<o;i++)g.push(c(a[i],b,j))}a=f[0].substring(1,f[0].length-1);a=""===a?g:g.join(a);break}else if(g){j[i]=j[i].replace(V,"");a=a[j[i]]();continue}if(null===a||a[j[i]]===k)return k;a=a[j[i]]}}return a};return function(b,e){return c(b,e,a)}}return function(b){return b[a]}}function R(a){if(h.isPlainObject(a))return R(a._);if(null===a)return function(){};if("function"===typeof a)return function(b,d,e){a(b,"set",d,e)};if("string"===typeof a&&(-1!==a.indexOf(".")||
    -1!==a.indexOf("[")||-1!==a.indexOf("("))){var b=function(a,d,e){var e=La(e),f;f=e[e.length-1];for(var g,j,i=0,o=e.length-1;i<o;i++){g=e[i].match(da);j=e[i].match(V);if(g){e[i]=e[i].replace(da,"");a[e[i]]=[];f=e.slice();f.splice(0,i+1);g=f.join(".");if(h.isArray(d)){j=0;for(o=d.length;j<o;j++)f={},b(f,d[j],g),a[e[i]].push(f)}else a[e[i]]=d;return}j&&(e[i]=e[i].replace(V,""),a=a[e[i]](d));if(null===a[e[i]]||a[e[i]]===k)a[e[i]]={};a=a[e[i]]}if(f.match(V))a[f.replace(V,"")](d);else a[f.replace(da,"")]=
    d};return function(c,d){return b(c,d,a)}}return function(b,d){b[a]=d}}function Ma(a){return D(a.aoData,"_aData")}function na(a){a.aoData.length=0;a.aiDisplayMaster.length=0;a.aiDisplay.length=0;a.aIds={}}function oa(a,b,c){for(var d=-1,e=0,f=a.length;e<f;e++)a[e]==b?d=e:a[e]>b&&a[e]--; -1!=d&&c===k&&a.splice(d,1)}function ea(a,b,c,d){var e=a.aoData[b],f,g=function(c,d){for(;c.childNodes.length;)c.removeChild(c.firstChild);c.innerHTML=B(a,b,d,"display")};if("dom"===c||(!c||"auto"===c)&&"dom"===e.src)e._aData=
    Ka(a,e,d,d===k?k:e._aData).data;else{var j=e.anCells;if(j)if(d!==k)g(j[d],d);else{c=0;for(f=j.length;c<f;c++)g(j[c],c)}}e._aSortData=null;e._aFilterData=null;g=a.aoColumns;if(d!==k)g[d].sType=null;else{c=0;for(f=g.length;c<f;c++)g[c].sType=null;Na(a,e)}}function Ka(a,b,c,d){var e=[],f=b.firstChild,g,j,i=0,o,l=a.aoColumns,q=a._rowReadObject,d=d!==k?d:q?{}:[],u=function(a,b){if("string"===typeof a){var c=a.indexOf("@");-1!==c&&(c=a.substring(c+1),R(a)(d,b.getAttribute(c)))}},S=function(a){if(c===k||
    c===i)j=l[i],o=h.trim(a.innerHTML),j&&j._bAttrSrc?(R(j.mData._)(d,o),u(j.mData.sort,a),u(j.mData.type,a),u(j.mData.filter,a)):q?(j._setter||(j._setter=R(j.mData)),j._setter(d,o)):d[i]=o;i++};if(f)for(;f;){g=f.nodeName.toUpperCase();if("TD"==g||"TH"==g)S(f),e.push(f);f=f.nextSibling}else{e=b.anCells;f=0;for(g=e.length;f<g;f++)S(e[f])}if(b=b.firstChild?b:b.nTr)(b=b.getAttribute("id"))&&R(a.rowId)(d,b);return{data:d,cells:e}}function Ja(a,b,c,d){var e=a.aoData[b],f=e._aData,g=[],j,i,h,l,q;if(null===
    e.nTr){j=c||H.createElement("tr");e.nTr=j;e.anCells=g;j._DT_RowIndex=b;Na(a,e);l=0;for(q=a.aoColumns.length;l<q;l++){h=a.aoColumns[l];i=c?d[l]:H.createElement(h.sCellType);i._DT_CellIndex={row:b,column:l};g.push(i);if(!c||h.mRender||h.mData!==l)i.innerHTML=B(a,b,l,"display");h.sClass&&(i.className+=" "+h.sClass);h.bVisible&&!c?j.appendChild(i):!h.bVisible&&c&&i.parentNode.removeChild(i);h.fnCreatedCell&&h.fnCreatedCell.call(a.oInstance,i,B(a,b,l),f,b,l)}v(a,"aoRowCreatedCallback",null,[j,f,b])}e.nTr.setAttribute("role",
    "row")}function Na(a,b){var c=b.nTr,d=b._aData;if(c){var e=a.rowIdFn(d);e&&(c.id=e);d.DT_RowClass&&(e=d.DT_RowClass.split(" "),b.__rowc=b.__rowc?pa(b.__rowc.concat(e)):e,h(c).removeClass(b.__rowc.join(" ")).addClass(d.DT_RowClass));d.DT_RowAttr&&h(c).attr(d.DT_RowAttr);d.DT_RowData&&h(c).data(d.DT_RowData)}}function kb(a){var b,c,d,e,f,g=a.nTHead,j=a.nTFoot,i=0===h("th, td",g).length,o=a.oClasses,l=a.aoColumns;i&&(e=h("<tr/>").appendTo(g));b=0;for(c=l.length;b<c;b++)f=l[b],d=h(f.nTh).addClass(f.sClass),
i&&d.appendTo(e),a.oFeatures.bSort&&(d.addClass(f.sSortingClass),!1!==f.bSortable&&(d.attr("tabindex",a.iTabIndex).attr("aria-controls",a.sTableId),Oa(a,f.nTh,b))),f.sTitle!=d[0].innerHTML&&d.html(f.sTitle),Pa(a,"header")(a,d,f,o);i&&fa(a.aoHeader,g);h(g).find(">tr").attr("role","row");h(g).find(">tr>th, >tr>td").addClass(o.sHeaderTH);h(j).find(">tr>th, >tr>td").addClass(o.sFooterTH);if(null!==j){a=a.aoFooter[0];b=0;for(c=a.length;b<c;b++)f=l[b],f.nTf=a[b].cell,f.sClass&&h(f.nTf).addClass(f.sClass)}}
    function ga(a,b,c){var d,e,f,g=[],j=[],i=a.aoColumns.length,o;if(b){c===k&&(c=!1);d=0;for(e=b.length;d<e;d++){g[d]=b[d].slice();g[d].nTr=b[d].nTr;for(f=i-1;0<=f;f--)!a.aoColumns[f].bVisible&&!c&&g[d].splice(f,1);j.push([])}d=0;for(e=g.length;d<e;d++){if(a=g[d].nTr)for(;f=a.firstChild;)a.removeChild(f);f=0;for(b=g[d].length;f<b;f++)if(o=i=1,j[d][f]===k){a.appendChild(g[d][f].cell);for(j[d][f]=1;g[d+i]!==k&&g[d][f].cell==g[d+i][f].cell;)j[d+i][f]=1,i++;for(;g[d][f+o]!==k&&g[d][f].cell==g[d][f+o].cell;){for(c=
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      0;c<i;c++)j[d+c][f+o]=1;o++}h(g[d][f].cell).attr("rowspan",i).attr("colspan",o)}}}}function O(a){var b=v(a,"aoPreDrawCallback","preDraw",[a]);if(-1!==h.inArray(!1,b))C(a,!1);else{var b=[],c=0,d=a.asStripeClasses,e=d.length,f=a.oLanguage,g=a.iInitDisplayStart,j="ssp"==y(a),i=a.aiDisplay;a.bDrawing=!0;g!==k&&-1!==g&&(a._iDisplayStart=j?g:g>=a.fnRecordsDisplay()?0:g,a.iInitDisplayStart=-1);var g=a._iDisplayStart,o=a.fnDisplayEnd();if(a.bDeferLoading)a.bDeferLoading=!1,a.iDraw++,C(a,!1);else if(j){if(!a.bDestroying&&
        !lb(a))return}else a.iDraw++;if(0!==i.length){f=j?a.aoData.length:o;for(j=j?0:g;j<f;j++){var l=i[j],q=a.aoData[l];null===q.nTr&&Ja(a,l);l=q.nTr;if(0!==e){var u=d[c%e];q._sRowStripe!=u&&(h(l).removeClass(q._sRowStripe).addClass(u),q._sRowStripe=u)}v(a,"aoRowCallback",null,[l,q._aData,c,j]);b.push(l);c++}}else c=f.sZeroRecords,1==a.iDraw&&"ajax"==y(a)?c=f.sLoadingRecords:f.sEmptyTable&&0===a.fnRecordsTotal()&&(c=f.sEmptyTable),b[0]=h("<tr/>",{"class":e?d[0]:""}).append(h("<td />",{valign:"top",colSpan:ca(a),
        "class":a.oClasses.sRowEmpty}).html(c))[0];v(a,"aoHeaderCallback","header",[h(a.nTHead).children("tr")[0],Ma(a),g,o,i]);v(a,"aoFooterCallback","footer",[h(a.nTFoot).children("tr")[0],Ma(a),g,o,i]);d=h(a.nTBody);d.children().detach();d.append(h(b));v(a,"aoDrawCallback","draw",[a]);a.bSorted=!1;a.bFiltered=!1;a.bDrawing=!1}}function T(a,b){var c=a.oFeatures,d=c.bFilter;c.bSort&&mb(a);d?ha(a,a.oPreviousSearch):a.aiDisplay=a.aiDisplayMaster.slice();!0!==b&&(a._iDisplayStart=0);a._drawHold=b;O(a);a._drawHold=
        !1}function nb(a){var b=a.oClasses,c=h(a.nTable),c=h("<div/>").insertBefore(c),d=a.oFeatures,e=h("<div/>",{id:a.sTableId+"_wrapper","class":b.sWrapper+(a.nTFoot?"":" "+b.sNoFooter)});a.nHolding=c[0];a.nTableWrapper=e[0];a.nTableReinsertBefore=a.nTable.nextSibling;for(var f=a.sDom.split(""),g,j,i,o,l,q,u=0;u<f.length;u++){g=null;j=f[u];if("<"==j){i=h("<div/>")[0];o=f[u+1];if("'"==o||'"'==o){l="";for(q=2;f[u+q]!=o;)l+=f[u+q],q++;"H"==l?l=b.sJUIHeader:"F"==l&&(l=b.sJUIFooter);-1!=l.indexOf(".")?(o=l.split("."),
            i.id=o[0].substr(1,o[0].length-1),i.className=o[1]):"#"==l.charAt(0)?i.id=l.substr(1,l.length-1):i.className=l;u+=q}e.append(i);e=h(i)}else if(">"==j)e=e.parent();else if("l"==j&&d.bPaginate&&d.bLengthChange)g=ob(a);else if("f"==j&&d.bFilter)g=pb(a);else if("r"==j&&d.bProcessing)g=qb(a);else if("t"==j)g=rb(a);else if("i"==j&&d.bInfo)g=sb(a);else if("p"==j&&d.bPaginate)g=tb(a);else if(0!==m.ext.feature.length){i=m.ext.feature;q=0;for(o=i.length;q<o;q++)if(j==i[q].cFeature){g=i[q].fnInit(a);break}}g&&
    (i=a.aanFeatures,i[j]||(i[j]=[]),i[j].push(g),e.append(g))}c.replaceWith(e);a.nHolding=null}function fa(a,b){var c=h(b).children("tr"),d,e,f,g,j,i,o,l,q,u;a.splice(0,a.length);f=0;for(i=c.length;f<i;f++)a.push([]);f=0;for(i=c.length;f<i;f++){d=c[f];for(e=d.firstChild;e;){if("TD"==e.nodeName.toUpperCase()||"TH"==e.nodeName.toUpperCase()){l=1*e.getAttribute("colspan");q=1*e.getAttribute("rowspan");l=!l||0===l||1===l?1:l;q=!q||0===q||1===q?1:q;g=0;for(j=a[f];j[g];)g++;o=g;u=1===l?!0:!1;for(j=0;j<l;j++)for(g=
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    0;g<q;g++)a[f+g][o+j]={cell:e,unique:u},a[f+g].nTr=d}e=e.nextSibling}}}function qa(a,b,c){var d=[];c||(c=a.aoHeader,b&&(c=[],fa(c,b)));for(var b=0,e=c.length;b<e;b++)for(var f=0,g=c[b].length;f<g;f++)if(c[b][f].unique&&(!d[f]||!a.bSortCellsTop))d[f]=c[b][f].cell;return d}function ra(a,b,c){v(a,"aoServerParams","serverParams",[b]);if(b&&h.isArray(b)){var d={},e=/(.*?)\[\]$/;h.each(b,function(a,b){var c=b.name.match(e);c?(c=c[0],d[c]||(d[c]=[]),d[c].push(b.value)):d[b.name]=b.value});b=d}var f,g=a.ajax,
        j=a.oInstance,i=function(b){v(a,null,"xhr",[a,b,a.jqXHR]);c(b)};if(h.isPlainObject(g)&&g.data){f=g.data;var o=h.isFunction(f)?f(b,a):f,b=h.isFunction(f)&&o?o:h.extend(!0,b,o);delete g.data}o={data:b,success:function(b){var c=b.error||b.sError;c&&K(a,0,c);a.json=b;i(b)},dataType:"json",cache:!1,type:a.sServerMethod,error:function(b,c){var d=v(a,null,"xhr",[a,null,a.jqXHR]);-1===h.inArray(!0,d)&&("parsererror"==c?K(a,0,"Invalid JSON response",1):4===b.readyState&&K(a,0,"Ajax error",7));C(a,!1)}};a.oAjaxData=
        b;v(a,null,"preXhr",[a,b]);a.fnServerData?a.fnServerData.call(j,a.sAjaxSource,h.map(b,function(a,b){return{name:b,value:a}}),i,a):a.sAjaxSource||"string"===typeof g?a.jqXHR=h.ajax(h.extend(o,{url:g||a.sAjaxSource})):h.isFunction(g)?a.jqXHR=g.call(j,b,i,a):(a.jqXHR=h.ajax(h.extend(o,g)),g.data=f)}function lb(a){return a.bAjaxDataGet?(a.iDraw++,C(a,!0),ra(a,ub(a),function(b){vb(a,b)}),!1):!0}function ub(a){var b=a.aoColumns,c=b.length,d=a.oFeatures,e=a.oPreviousSearch,f=a.aoPreSearchCols,g,j=[],i,o,
        l,q=W(a);g=a._iDisplayStart;i=!1!==d.bPaginate?a._iDisplayLength:-1;var k=function(a,b){j.push({name:a,value:b})};k("sEcho",a.iDraw);k("iColumns",c);k("sColumns",D(b,"sName").join(","));k("iDisplayStart",g);k("iDisplayLength",i);var S={draw:a.iDraw,columns:[],order:[],start:g,length:i,search:{value:e.sSearch,regex:e.bRegex}};for(g=0;g<c;g++)o=b[g],l=f[g],i="function"==typeof o.mData?"function":o.mData,S.columns.push({data:i,name:o.sName,searchable:o.bSearchable,orderable:o.bSortable,search:{value:l.sSearch,
        regex:l.bRegex}}),k("mDataProp_"+g,i),d.bFilter&&(k("sSearch_"+g,l.sSearch),k("bRegex_"+g,l.bRegex),k("bSearchable_"+g,o.bSearchable)),d.bSort&&k("bSortable_"+g,o.bSortable);d.bFilter&&(k("sSearch",e.sSearch),k("bRegex",e.bRegex));d.bSort&&(h.each(q,function(a,b){S.order.push({column:b.col,dir:b.dir});k("iSortCol_"+a,b.col);k("sSortDir_"+a,b.dir)}),k("iSortingCols",q.length));b=m.ext.legacy.ajax;return null===b?a.sAjaxSource?j:S:b?j:S}function vb(a,b){var c=sa(a,b),d=b.sEcho!==k?b.sEcho:b.draw,e=
        b.iTotalRecords!==k?b.iTotalRecords:b.recordsTotal,f=b.iTotalDisplayRecords!==k?b.iTotalDisplayRecords:b.recordsFiltered;if(d){if(1*d<a.iDraw)return;a.iDraw=1*d}na(a);a._iRecordsTotal=parseInt(e,10);a._iRecordsDisplay=parseInt(f,10);d=0;for(e=c.length;d<e;d++)N(a,c[d]);a.aiDisplay=a.aiDisplayMaster.slice();a.bAjaxDataGet=!1;O(a);a._bInitComplete||ta(a,b);a.bAjaxDataGet=!0;C(a,!1)}function sa(a,b){var c=h.isPlainObject(a.ajax)&&a.ajax.dataSrc!==k?a.ajax.dataSrc:a.sAjaxDataProp;return"data"===c?b.aaData||
        b[c]:""!==c?Q(c)(b):b}function pb(a){var b=a.oClasses,c=a.sTableId,d=a.oLanguage,e=a.oPreviousSearch,f=a.aanFeatures,g='<input type="search" class="'+b.sFilterInput+'"/>',j=d.sSearch,j=j.match(/_INPUT_/)?j.replace("_INPUT_",g):j+g,b=h("<div/>",{id:!f.f?c+"_filter":null,"class":b.sFilter}).append(h("<label/>").append(j)),f=function(){var b=!this.value?"":this.value;b!=e.sSearch&&(ha(a,{sSearch:b,bRegex:e.bRegex,bSmart:e.bSmart,bCaseInsensitive:e.bCaseInsensitive}),a._iDisplayStart=0,O(a))},g=null!==
    a.searchDelay?a.searchDelay:"ssp"===y(a)?400:0,i=h("input",b).val(e.sSearch).attr("placeholder",d.sSearchPlaceholder).bind("keyup.DT search.DT input.DT paste.DT cut.DT",g?ua(f,g):f).bind("keypress.DT",function(a){if(13==a.keyCode)return!1}).attr("aria-controls",c);h(a.nTable).on("search.dt.DT",function(b,c){if(a===c)try{i[0]!==H.activeElement&&i.val(e.sSearch)}catch(d){}});return b[0]}function ha(a,b,c){var d=a.oPreviousSearch,e=a.aoPreSearchCols,f=function(a){d.sSearch=a.sSearch;d.bRegex=a.bRegex;
        d.bSmart=a.bSmart;d.bCaseInsensitive=a.bCaseInsensitive};Ia(a);if("ssp"!=y(a)){wb(a,b.sSearch,c,b.bEscapeRegex!==k?!b.bEscapeRegex:b.bRegex,b.bSmart,b.bCaseInsensitive);f(b);for(b=0;b<e.length;b++)xb(a,e[b].sSearch,b,e[b].bEscapeRegex!==k?!e[b].bEscapeRegex:e[b].bRegex,e[b].bSmart,e[b].bCaseInsensitive);yb(a)}else f(b);a.bFiltered=!0;v(a,null,"search",[a])}function yb(a){for(var b=m.ext.search,c=a.aiDisplay,d,e,f=0,g=b.length;f<g;f++){for(var j=[],i=0,o=c.length;i<o;i++)e=c[i],d=a.aoData[e],b[f](a,
        d._aFilterData,e,d._aData,i)&&j.push(e);c.length=0;h.merge(c,j)}}function xb(a,b,c,d,e,f){if(""!==b)for(var g=a.aiDisplay,d=Qa(b,d,e,f),e=g.length-1;0<=e;e--)b=a.aoData[g[e]]._aFilterData[c],d.test(b)||g.splice(e,1)}function wb(a,b,c,d,e,f){var d=Qa(b,d,e,f),e=a.oPreviousSearch.sSearch,f=a.aiDisplayMaster,g;0!==m.ext.search.length&&(c=!0);g=zb(a);if(0>=b.length)a.aiDisplay=f.slice();else{if(g||c||e.length>b.length||0!==b.indexOf(e)||a.bSorted)a.aiDisplay=f.slice();b=a.aiDisplay;for(c=b.length-1;0<=
    c;c--)d.test(a.aoData[b[c]]._sFilterRow)||b.splice(c,1)}}function Qa(a,b,c,d){a=b?a:va(a);c&&(a="^(?=.*?"+h.map(a.match(/"[^"]+"|[^ ]+/g)||[""],function(a){if('"'===a.charAt(0))var b=a.match(/^"(.*)"$/),a=b?b[1]:a;return a.replace('"',"")}).join(")(?=.*?")+").*$");return RegExp(a,d?"i":"")}function va(a){return a.replace(Yb,"\\$1")}function zb(a){var b=a.aoColumns,c,d,e,f,g,j,i,h,l=m.ext.type.search;c=!1;d=0;for(f=a.aoData.length;d<f;d++)if(h=a.aoData[d],!h._aFilterData){j=[];e=0;for(g=b.length;e<
    g;e++)c=b[e],c.bSearchable?(i=B(a,d,e,"filter"),l[c.sType]&&(i=l[c.sType](i)),null===i&&(i=""),"string"!==typeof i&&i.toString&&(i=i.toString())):i="",i.indexOf&&-1!==i.indexOf("&")&&(wa.innerHTML=i,i=Zb?wa.textContent:wa.innerText),i.replace&&(i=i.replace(/[\r\n]/g,"")),j.push(i);h._aFilterData=j;h._sFilterRow=j.join("  ");c=!0}return c}function Ab(a){return{search:a.sSearch,smart:a.bSmart,regex:a.bRegex,caseInsensitive:a.bCaseInsensitive}}function Bb(a){return{sSearch:a.search,bSmart:a.smart,bRegex:a.regex,
        bCaseInsensitive:a.caseInsensitive}}function sb(a){var b=a.sTableId,c=a.aanFeatures.i,d=h("<div/>",{"class":a.oClasses.sInfo,id:!c?b+"_info":null});c||(a.aoDrawCallback.push({fn:Cb,sName:"information"}),d.attr("role","status").attr("aria-live","polite"),h(a.nTable).attr("aria-describedby",b+"_info"));return d[0]}function Cb(a){var b=a.aanFeatures.i;if(0!==b.length){var c=a.oLanguage,d=a._iDisplayStart+1,e=a.fnDisplayEnd(),f=a.fnRecordsTotal(),g=a.fnRecordsDisplay(),j=g?c.sInfo:c.sInfoEmpty;g!==f&&
    (j+=" "+c.sInfoFiltered);j+=c.sInfoPostFix;j=Db(a,j);c=c.fnInfoCallback;null!==c&&(j=c.call(a.oInstance,a,d,e,f,g,j));h(b).html(j)}}function Db(a,b){var c=a.fnFormatNumber,d=a._iDisplayStart+1,e=a._iDisplayLength,f=a.fnRecordsDisplay(),g=-1===e;return b.replace(/_START_/g,c.call(a,d)).replace(/_END_/g,c.call(a,a.fnDisplayEnd())).replace(/_MAX_/g,c.call(a,a.fnRecordsTotal())).replace(/_TOTAL_/g,c.call(a,f)).replace(/_PAGE_/g,c.call(a,g?1:Math.ceil(d/e))).replace(/_PAGES_/g,c.call(a,g?1:Math.ceil(f/
            e)))}function ia(a){var b,c,d=a.iInitDisplayStart,e=a.aoColumns,f;c=a.oFeatures;var g=a.bDeferLoading;if(a.bInitialised){nb(a);kb(a);ga(a,a.aoHeader);ga(a,a.aoFooter);C(a,!0);c.bAutoWidth&&Ha(a);b=0;for(c=e.length;b<c;b++)f=e[b],f.sWidth&&(f.nTh.style.width=w(f.sWidth));v(a,null,"preInit",[a]);T(a);e=y(a);if("ssp"!=e||g)"ajax"==e?ra(a,[],function(c){var f=sa(a,c);for(b=0;b<f.length;b++)N(a,f[b]);a.iInitDisplayStart=d;T(a);C(a,!1);ta(a,c)},a):(C(a,!1),ta(a))}else setTimeout(function(){ia(a)},200)}
    function ta(a,b){a._bInitComplete=!0;(b||a.oInit.aaData)&&U(a);v(a,null,"plugin-init",[a,b]);v(a,"aoInitComplete","init",[a,b])}function Ra(a,b){var c=parseInt(b,10);a._iDisplayLength=c;Sa(a);v(a,null,"length",[a,c])}function ob(a){for(var b=a.oClasses,c=a.sTableId,d=a.aLengthMenu,e=h.isArray(d[0]),f=e?d[0]:d,d=e?d[1]:d,e=h("<select/>",{name:c+"_length","aria-controls":c,"class":b.sLengthSelect}),g=0,j=f.length;g<j;g++)e[0][g]=new Option(d[g],f[g]);var i=h("<div><label/></div>").addClass(b.sLength);
        a.aanFeatures.l||(i[0].id=c+"_length");i.children().append(a.oLanguage.sLengthMenu.replace("_MENU_",e[0].outerHTML));h("select",i).val(a._iDisplayLength).bind("change.DT",function(){Ra(a,h(this).val());O(a)});h(a.nTable).bind("length.dt.DT",function(b,c,d){a===c&&h("select",i).val(d)});return i[0]}function tb(a){var b=a.sPaginationType,c=m.ext.pager[b],d="function"===typeof c,e=function(a){O(a)},b=h("<div/>").addClass(a.oClasses.sPaging+b)[0],f=a.aanFeatures;d||c.fnInit(a,b,e);f.p||(b.id=a.sTableId+
        "_paginate",a.aoDrawCallback.push({fn:function(a){if(d){var b=a._iDisplayStart,i=a._iDisplayLength,h=a.fnRecordsDisplay(),l=-1===i,b=l?0:Math.ceil(b/i),i=l?1:Math.ceil(h/i),h=c(b,i),k,l=0;for(k=f.p.length;l<k;l++)Pa(a,"pageButton")(a,f.p[l],l,h,b,i)}else c.fnUpdate(a,e)},sName:"pagination"}));return b}function Ta(a,b,c){var d=a._iDisplayStart,e=a._iDisplayLength,f=a.fnRecordsDisplay();0===f||-1===e?d=0:"number"===typeof b?(d=b*e,d>f&&(d=0)):"first"==b?d=0:"previous"==b?(d=0<=e?d-e:0,0>d&&(d=0)):"next"==
                    b?d+e<f&&(d+=e):"last"==b?d=Math.floor((f-1)/e)*e:K(a,0,"Unknown paging action: "+b,5);b=a._iDisplayStart!==d;a._iDisplayStart=d;b&&(v(a,null,"page",[a]),c&&O(a));return b}function qb(a){return h("<div/>",{id:!a.aanFeatures.r?a.sTableId+"_processing":null,"class":a.oClasses.sProcessing}).html(a.oLanguage.sProcessing).insertBefore(a.nTable)[0]}function C(a,b){a.oFeatures.bProcessing&&h(a.aanFeatures.r).css("display",b?"block":"none");v(a,null,"processing",[a,b])}function rb(a){var b=h(a.nTable);b.attr("role",
        "grid");var c=a.oScroll;if(""===c.sX&&""===c.sY)return a.nTable;var d=c.sX,e=c.sY,f=a.oClasses,g=b.children("caption"),j=g.length?g[0]._captionSide:null,i=h(b[0].cloneNode(!1)),o=h(b[0].cloneNode(!1)),l=b.children("tfoot");l.length||(l=null);i=h("<div/>",{"class":f.sScrollWrapper}).append(h("<div/>",{"class":f.sScrollHead}).css({overflow:"hidden",position:"relative",border:0,width:d?!d?null:w(d):"100%"}).append(h("<div/>",{"class":f.sScrollHeadInner}).css({"box-sizing":"content-box",width:c.sXInner||
    "100%"}).append(i.removeAttr("id").css("margin-left",0).append("top"===j?g:null).append(b.children("thead"))))).append(h("<div/>",{"class":f.sScrollBody}).css({position:"relative",overflow:"auto",width:!d?null:w(d)}).append(b));l&&i.append(h("<div/>",{"class":f.sScrollFoot}).css({overflow:"hidden",border:0,width:d?!d?null:w(d):"100%"}).append(h("<div/>",{"class":f.sScrollFootInner}).append(o.removeAttr("id").css("margin-left",0).append("bottom"===j?g:null).append(b.children("tfoot")))));var b=i.children(),
        k=b[0],f=b[1],u=l?b[2]:null;if(d)h(f).on("scroll.DT",function(){var a=this.scrollLeft;k.scrollLeft=a;l&&(u.scrollLeft=a)});h(f).css(e&&c.bCollapse?"max-height":"height",e);a.nScrollHead=k;a.nScrollBody=f;a.nScrollFoot=u;a.aoDrawCallback.push({fn:Z,sName:"scrolling"});return i[0]}function Z(a){var b=a.oScroll,c=b.sX,d=b.sXInner,e=b.sY,b=b.iBarWidth,f=h(a.nScrollHead),g=f[0].style,j=f.children("div"),i=j[0].style,o=j.children("table"),j=a.nScrollBody,l=h(j),q=j.style,u=h(a.nScrollFoot).children("div"),
        m=u.children("table"),n=h(a.nTHead),p=h(a.nTable),t=p[0],v=t.style,r=a.nTFoot?h(a.nTFoot):null,Eb=a.oBrowser,Ua=Eb.bScrollOversize,s,L,P,x,y=[],z=[],A=[],B,C=function(a){a=a.style;a.paddingTop="0";a.paddingBottom="0";a.borderTopWidth="0";a.borderBottomWidth="0";a.height=0};L=j.scrollHeight>j.clientHeight;if(a.scrollBarVis!==L&&a.scrollBarVis!==k)a.scrollBarVis=L,U(a);else{a.scrollBarVis=L;p.children("thead, tfoot").remove();x=n.clone().prependTo(p);n=n.find("tr");L=x.find("tr");x.find("th, td").removeAttr("tabindex");
        r&&(P=r.clone().prependTo(p),s=r.find("tr"),P=P.find("tr"));c||(q.width="100%",f[0].style.width="100%");h.each(qa(a,x),function(b,c){B=$(a,b);c.style.width=a.aoColumns[B].sWidth});r&&I(function(a){a.style.width=""},P);f=p.outerWidth();if(""===c){v.width="100%";if(Ua&&(p.find("tbody").height()>j.offsetHeight||"scroll"==l.css("overflow-y")))v.width=w(p.outerWidth()-b);f=p.outerWidth()}else""!==d&&(v.width=w(d),f=p.outerWidth());I(C,L);I(function(a){A.push(a.innerHTML);y.push(w(h(a).css("width")))},
            L);I(function(a,b){a.style.width=y[b]},n);h(L).height(0);r&&(I(C,P),I(function(a){z.push(w(h(a).css("width")))},P),I(function(a,b){a.style.width=z[b]},s),h(P).height(0));I(function(a,b){a.innerHTML='<div class="dataTables_sizing" style="height:0;overflow:hidden;">'+A[b]+"</div>";a.style.width=y[b]},L);r&&I(function(a,b){a.innerHTML="";a.style.width=z[b]},P);if(p.outerWidth()<f){s=j.scrollHeight>j.offsetHeight||"scroll"==l.css("overflow-y")?f+b:f;if(Ua&&(j.scrollHeight>j.offsetHeight||"scroll"==l.css("overflow-y")))v.width=
            w(s-b);(""===c||""!==d)&&K(a,1,"Possible column misalignment",6)}else s="100%";q.width=w(s);g.width=w(s);r&&(a.nScrollFoot.style.width=w(s));!e&&Ua&&(q.height=w(t.offsetHeight+b));c=p.outerWidth();o[0].style.width=w(c);i.width=w(c);d=p.height()>j.clientHeight||"scroll"==l.css("overflow-y");e="padding"+(Eb.bScrollbarLeft?"Left":"Right");i[e]=d?b+"px":"0px";r&&(m[0].style.width=w(c),u[0].style.width=w(c),u[0].style[e]=d?b+"px":"0px");l.scroll();if((a.bSorted||a.bFiltered)&&!a._drawHold)j.scrollTop=
            0}}function I(a,b,c){for(var d=0,e=0,f=b.length,g,j;e<f;){g=b[e].firstChild;for(j=c?c[e].firstChild:null;g;)1===g.nodeType&&(c?a(g,j,d):a(g,d),d++),g=g.nextSibling,j=c?j.nextSibling:null;e++}}function Ha(a){var b=a.nTable,c=a.aoColumns,d=a.oScroll,e=d.sY,f=d.sX,g=d.sXInner,j=c.length,i=aa(a,"bVisible"),o=h("th",a.nTHead),l=b.getAttribute("width"),k=b.parentNode,u=!1,m,n,p=a.oBrowser,d=p.bScrollOversize;(m=b.style.width)&&-1!==m.indexOf("%")&&(l=m);for(m=0;m<i.length;m++)n=c[i[m]],null!==n.sWidth&&
    (n.sWidth=Fb(n.sWidthOrig,k),u=!0);if(d||!u&&!f&&!e&&j==ca(a)&&j==o.length)for(m=0;m<j;m++)i=$(a,m),null!==i&&(c[i].sWidth=w(o.eq(m).width()));else{j=h(b).clone().css("visibility","hidden").removeAttr("id");j.find("tbody tr").remove();var t=h("<tr/>").appendTo(j.find("tbody"));j.find("thead, tfoot").remove();j.append(h(a.nTHead).clone()).append(h(a.nTFoot).clone());j.find("tfoot th, tfoot td").css("width","");o=qa(a,j.find("thead")[0]);for(m=0;m<i.length;m++)n=c[i[m]],o[m].style.width=null!==n.sWidthOrig&&
    ""!==n.sWidthOrig?w(n.sWidthOrig):"",n.sWidthOrig&&f&&h(o[m]).append(h("<div/>").css({width:n.sWidthOrig,margin:0,padding:0,border:0,height:1}));if(a.aoData.length)for(m=0;m<i.length;m++)u=i[m],n=c[u],h(Gb(a,u)).clone(!1).append(n.sContentPadding).appendTo(t);n=h("<div/>").css(f||e?{position:"absolute",top:0,left:0,height:1,right:0,overflow:"hidden"}:{}).append(j).appendTo(k);f&&g?j.width(g):f?(j.css("width","auto"),j.removeAttr("width"),j.width()<k.clientWidth&&l&&j.width(k.clientWidth)):e?j.width(k.clientWidth):
                l&&j.width(l);for(m=e=0;m<i.length;m++)k=h(o[m]),g=k.outerWidth()-k.width(),k=p.bBounding?Math.ceil(o[m].getBoundingClientRect().width):k.outerWidth(),e+=k,c[i[m]].sWidth=w(k-g);b.style.width=w(e);n.remove()}l&&(b.style.width=w(l));if((l||f)&&!a._reszEvt)b=function(){h(E).bind("resize.DT-"+a.sInstance,ua(function(){U(a)}))},d?setTimeout(b,1E3):b(),a._reszEvt=!0}function ua(a,b){var c=b!==k?b:200,d,e;return function(){var b=this,g=+new Date,j=arguments;d&&g<d+c?(clearTimeout(e),e=setTimeout(function(){d=
            k;a.apply(b,j)},c)):(d=g,a.apply(b,j))}}function Fb(a,b){if(!a)return 0;var c=h("<div/>").css("width",w(a)).appendTo(b||H.body),d=c[0].offsetWidth;c.remove();return d}function Gb(a,b){var c=Hb(a,b);if(0>c)return null;var d=a.aoData[c];return!d.nTr?h("<td/>").html(B(a,c,b,"display"))[0]:d.anCells[b]}function Hb(a,b){for(var c,d=-1,e=-1,f=0,g=a.aoData.length;f<g;f++)c=B(a,f,b,"display")+"",c=c.replace($b,""),c=c.replace(/&nbsp;/g," "),c.length>d&&(d=c.length,e=f);return e}function w(a){return null===
    a?"0px":"number"==typeof a?0>a?"0px":a+"px":a.match(/\d$/)?a+"px":a}function W(a){var b,c,d=[],e=a.aoColumns,f,g,j,i;b=a.aaSortingFixed;c=h.isPlainObject(b);var o=[];f=function(a){a.length&&!h.isArray(a[0])?o.push(a):h.merge(o,a)};h.isArray(b)&&f(b);c&&b.pre&&f(b.pre);f(a.aaSorting);c&&b.post&&f(b.post);for(a=0;a<o.length;a++){i=o[a][0];f=e[i].aDataSort;b=0;for(c=f.length;b<c;b++)g=f[b],j=e[g].sType||"string",o[a]._idx===k&&(o[a]._idx=h.inArray(o[a][1],e[g].asSorting)),d.push({src:i,col:g,dir:o[a][1],
        index:o[a]._idx,type:j,formatter:m.ext.type.order[j+"-pre"]})}return d}function mb(a){var b,c,d=[],e=m.ext.type.order,f=a.aoData,g=0,j,i=a.aiDisplayMaster,h;Ia(a);h=W(a);b=0;for(c=h.length;b<c;b++)j=h[b],j.formatter&&g++,Ib(a,j.col);if("ssp"!=y(a)&&0!==h.length){b=0;for(c=i.length;b<c;b++)d[i[b]]=b;g===h.length?i.sort(function(a,b){var c,e,g,j,i=h.length,k=f[a]._aSortData,m=f[b]._aSortData;for(g=0;g<i;g++)if(j=h[g],c=k[j.col],e=m[j.col],c=c<e?-1:c>e?1:0,0!==c)return"asc"===j.dir?c:-c;c=d[a];e=d[b];
            return c<e?-1:c>e?1:0}):i.sort(function(a,b){var c,g,j,i,k=h.length,m=f[a]._aSortData,p=f[b]._aSortData;for(j=0;j<k;j++)if(i=h[j],c=m[i.col],g=p[i.col],i=e[i.type+"-"+i.dir]||e["string-"+i.dir],c=i(c,g),0!==c)return c;c=d[a];g=d[b];return c<g?-1:c>g?1:0})}a.bSorted=!0}function Jb(a){for(var b,c,d=a.aoColumns,e=W(a),a=a.oLanguage.oAria,f=0,g=d.length;f<g;f++){c=d[f];var j=c.asSorting;b=c.sTitle.replace(/<.*?>/g,"");var i=c.nTh;i.removeAttribute("aria-sort");c.bSortable&&(0<e.length&&e[0].col==f?(i.setAttribute("aria-sort",
            "asc"==e[0].dir?"ascending":"descending"),c=j[e[0].index+1]||j[0]):c=j[0],b+="asc"===c?a.sSortAscending:a.sSortDescending);i.setAttribute("aria-label",b)}}function Va(a,b,c,d){var e=a.aaSorting,f=a.aoColumns[b].asSorting,g=function(a,b){var c=a._idx;c===k&&(c=h.inArray(a[1],f));return c+1<f.length?c+1:b?null:0};"number"===typeof e[0]&&(e=a.aaSorting=[e]);c&&a.oFeatures.bSortMulti?(c=h.inArray(b,D(e,"0")),-1!==c?(b=g(e[c],!0),null===b&&1===e.length&&(b=0),null===b?e.splice(c,1):(e[c][1]=f[b],e[c]._idx=
                    b)):(e.push([b,f[0],0]),e[e.length-1]._idx=0)):e.length&&e[0][0]==b?(b=g(e[0]),e.length=1,e[0][1]=f[b],e[0]._idx=b):(e.length=0,e.push([b,f[0]]),e[0]._idx=0);T(a);"function"==typeof d&&d(a)}function Oa(a,b,c,d){var e=a.aoColumns[c];Wa(b,{},function(b){!1!==e.bSortable&&(a.oFeatures.bProcessing?(C(a,!0),setTimeout(function(){Va(a,c,b.shiftKey,d);"ssp"!==y(a)&&C(a,!1)},0)):Va(a,c,b.shiftKey,d))})}function xa(a){var b=a.aLastSort,c=a.oClasses.sSortColumn,d=W(a),e=a.oFeatures,f,g;if(e.bSort&&e.bSortClasses){e=
        0;for(f=b.length;e<f;e++)g=b[e].src,h(D(a.aoData,"anCells",g)).removeClass(c+(2>e?e+1:3));e=0;for(f=d.length;e<f;e++)g=d[e].src,h(D(a.aoData,"anCells",g)).addClass(c+(2>e?e+1:3))}a.aLastSort=d}function Ib(a,b){var c=a.aoColumns[b],d=m.ext.order[c.sSortDataType],e;d&&(e=d.call(a.oInstance,a,b,ba(a,b)));for(var f,g=m.ext.type.order[c.sType+"-pre"],j=0,i=a.aoData.length;j<i;j++)if(c=a.aoData[j],c._aSortData||(c._aSortData=[]),!c._aSortData[b]||d)f=d?e[j]:B(a,j,b,"sort"),c._aSortData[b]=g?g(f):f}function ya(a){if(a.oFeatures.bStateSave&&
        !a.bDestroying){var b={time:+new Date,start:a._iDisplayStart,length:a._iDisplayLength,order:h.extend(!0,[],a.aaSorting),search:Ab(a.oPreviousSearch),columns:h.map(a.aoColumns,function(b,d){return{visible:b.bVisible,search:Ab(a.aoPreSearchCols[d])}})};v(a,"aoStateSaveParams","stateSaveParams",[a,b]);a.oSavedState=b;a.fnStateSaveCallback.call(a.oInstance,a,b)}}function Kb(a){var b,c,d=a.aoColumns;if(a.oFeatures.bStateSave){var e=a.fnStateLoadCallback.call(a.oInstance,a);if(e&&e.time&&(b=v(a,"aoStateLoadParams",
            "stateLoadParams",[a,e]),-1===h.inArray(!1,b)&&(b=a.iStateDuration,!(0<b&&e.time<+new Date-1E3*b)&&d.length===e.columns.length))){a.oLoadedState=h.extend(!0,{},e);e.start!==k&&(a._iDisplayStart=e.start,a.iInitDisplayStart=e.start);e.length!==k&&(a._iDisplayLength=e.length);e.order!==k&&(a.aaSorting=[],h.each(e.order,function(b,c){a.aaSorting.push(c[0]>=d.length?[0,c[1]]:c)}));e.search!==k&&h.extend(a.oPreviousSearch,Bb(e.search));b=0;for(c=e.columns.length;b<c;b++){var f=e.columns[b];f.visible!==
    k&&(d[b].bVisible=f.visible);f.search!==k&&h.extend(a.aoPreSearchCols[b],Bb(f.search))}v(a,"aoStateLoaded","stateLoaded",[a,e])}}}function za(a){var b=m.settings,a=h.inArray(a,D(b,"nTable"));return-1!==a?b[a]:null}function K(a,b,c,d){c="DataTables warning: "+(a?"table id="+a.sTableId+" - ":"")+c;d&&(c+=". For more information about this error, please see http://datatables.net/tn/"+d);if(b)E.console&&console.log&&console.log(c);else if(b=m.ext,b=b.sErrMode||b.errMode,a&&v(a,null,"error",[a,d,c]),"alert"==
        b)alert(c);else{if("throw"==b)throw Error(c);"function"==typeof b&&b(a,d,c)}}function F(a,b,c,d){h.isArray(c)?h.each(c,function(c,d){h.isArray(d)?F(a,b,d[0],d[1]):F(a,b,d)}):(d===k&&(d=c),b[c]!==k&&(a[d]=b[c]))}function Lb(a,b,c){var d,e;for(e in b)b.hasOwnProperty(e)&&(d=b[e],h.isPlainObject(d)?(h.isPlainObject(a[e])||(a[e]={}),h.extend(!0,a[e],d)):a[e]=c&&"data"!==e&&"aaData"!==e&&h.isArray(d)?d.slice():d);return a}function Wa(a,b,c){h(a).bind("click.DT",b,function(b){a.blur();c(b)}).bind("keypress.DT",
        b,function(a){13===a.which&&(a.preventDefault(),c(a))}).bind("selectstart.DT",function(){return!1})}function z(a,b,c,d){c&&a[b].push({fn:c,sName:d})}function v(a,b,c,d){var e=[];b&&(e=h.map(a[b].slice().reverse(),function(b){return b.fn.apply(a.oInstance,d)}));null!==c&&(b=h.Event(c+".dt"),h(a.nTable).trigger(b,d),e.push(b.result));return e}function Sa(a){var b=a._iDisplayStart,c=a.fnDisplayEnd(),d=a._iDisplayLength;b>=c&&(b=c-d);b-=b%d;if(-1===d||0>b)b=0;a._iDisplayStart=b}function Pa(a,b){var c=
        a.renderer,d=m.ext.renderer[b];return h.isPlainObject(c)&&c[b]?d[c[b]]||d._:"string"===typeof c?d[c]||d._:d._}function y(a){return a.oFeatures.bServerSide?"ssp":a.ajax||a.sAjaxSource?"ajax":"dom"}function Aa(a,b){var c=[],c=Mb.numbers_length,d=Math.floor(c/2);b<=c?c=X(0,b):a<=d?(c=X(0,c-2),c.push("ellipsis"),c.push(b-1)):(a>=b-1-d?c=X(b-(c-2),b):(c=X(a-d+2,a+d-1),c.push("ellipsis"),c.push(b-1)),c.splice(0,0,"ellipsis"),c.splice(0,0,0));c.DT_el="span";return c}function db(a){h.each({num:function(b){return Ba(b,
        a)},"num-fmt":function(b){return Ba(b,a,Xa)},"html-num":function(b){return Ba(b,a,Ca)},"html-num-fmt":function(b){return Ba(b,a,Ca,Xa)}},function(b,c){s.type.order[b+a+"-pre"]=c;b.match(/^html\-/)&&(s.type.search[b+a]=s.type.search.html)})}function Nb(a){return function(){var b=[za(this[m.ext.iApiIndex])].concat(Array.prototype.slice.call(arguments));return m.ext.internal[a].apply(this,b)}}var m,s,t,p,r,Ya={},Ob=/[\r\n]/g,Ca=/<.*?>/g,ac=/^[\w\+\-]/,bc=/[\w\+\-]$/,Yb=RegExp("(\\/|\\.|\\*|\\+|\\?|\\||\\(|\\)|\\[|\\]|\\{|\\}|\\\\|\\$|\\^|\\-)",
        "g"),Xa=/[',$£€¥%\u2009\u202F\u20BD\u20a9\u20BArfk]/gi,M=function(a){return!a||!0===a||"-"===a?!0:!1},Pb=function(a){var b=parseInt(a,10);return!isNaN(b)&&isFinite(a)?b:null},Qb=function(a,b){Ya[b]||(Ya[b]=RegExp(va(b),"g"));return"string"===typeof a&&"."!==b?a.replace(/\./g,"").replace(Ya[b],"."):a},Za=function(a,b,c){var d="string"===typeof a;if(M(a))return!0;b&&d&&(a=Qb(a,b));c&&d&&(a=a.replace(Xa,""));return!isNaN(parseFloat(a))&&isFinite(a)},Rb=function(a,b,c){return M(a)?!0:!(M(a)||"string"===
        typeof a)?null:Za(a.replace(Ca,""),b,c)?!0:null},D=function(a,b,c){var d=[],e=0,f=a.length;if(c!==k)for(;e<f;e++)a[e]&&a[e][b]&&d.push(a[e][b][c]);else for(;e<f;e++)a[e]&&d.push(a[e][b]);return d},ja=function(a,b,c,d){var e=[],f=0,g=b.length;if(d!==k)for(;f<g;f++)a[b[f]][c]&&e.push(a[b[f]][c][d]);else for(;f<g;f++)e.push(a[b[f]][c]);return e},X=function(a,b){var c=[],d;b===k?(b=0,d=a):(d=b,b=a);for(var e=b;e<d;e++)c.push(e);return c},Sb=function(a){for(var b=[],c=0,d=a.length;c<d;c++)a[c]&&b.push(a[c]);
        return b},pa=function(a){var b=[],c,d,e=a.length,f,g=0;d=0;a:for(;d<e;d++){c=a[d];for(f=0;f<g;f++)if(b[f]===c)continue a;b.push(c);g++}return b},A=function(a,b,c){a[b]!==k&&(a[c]=a[b])},da=/\[.*?\]$/,V=/\(\)$/,wa=h("<div>")[0],Zb=wa.textContent!==k,$b=/<.*?>/g;m=function(a){this.$=function(a,b){return this.api(!0).$(a,b)};this._=function(a,b){return this.api(!0).rows(a,b).data()};this.api=function(a){return a?new t(za(this[s.iApiIndex])):new t(this)};this.fnAddData=function(a,b){var c=this.api(!0),
        d=h.isArray(a)&&(h.isArray(a[0])||h.isPlainObject(a[0]))?c.rows.add(a):c.row.add(a);(b===k||b)&&c.draw();return d.flatten().toArray()};this.fnAdjustColumnSizing=function(a){var b=this.api(!0).columns.adjust(),c=b.settings()[0],d=c.oScroll;a===k||a?b.draw(!1):(""!==d.sX||""!==d.sY)&&Z(c)};this.fnClearTable=function(a){var b=this.api(!0).clear();(a===k||a)&&b.draw()};this.fnClose=function(a){this.api(!0).row(a).child.hide()};this.fnDeleteRow=function(a,b,c){var d=this.api(!0),a=d.rows(a),e=a.settings()[0],
        h=e.aoData[a[0][0]];a.remove();b&&b.call(this,e,h);(c===k||c)&&d.draw();return h};this.fnDestroy=function(a){this.api(!0).destroy(a)};this.fnDraw=function(a){this.api(!0).draw(a)};this.fnFilter=function(a,b,c,d,e,h){e=this.api(!0);null===b||b===k?e.search(a,c,d,h):e.column(b).search(a,c,d,h);e.draw()};this.fnGetData=function(a,b){var c=this.api(!0);if(a!==k){var d=a.nodeName?a.nodeName.toLowerCase():"";return b!==k||"td"==d||"th"==d?c.cell(a,b).data():c.row(a).data()||null}return c.data().toArray()};
        this.fnGetNodes=function(a){var b=this.api(!0);return a!==k?b.row(a).node():b.rows().nodes().flatten().toArray()};this.fnGetPosition=function(a){var b=this.api(!0),c=a.nodeName.toUpperCase();return"TR"==c?b.row(a).index():"TD"==c||"TH"==c?(a=b.cell(a).index(),[a.row,a.columnVisible,a.column]):null};this.fnIsOpen=function(a){return this.api(!0).row(a).child.isShown()};this.fnOpen=function(a,b,c){return this.api(!0).row(a).child(b,c).show().child()[0]};this.fnPageChange=function(a,b){var c=this.api(!0).page(a);
            (b===k||b)&&c.draw(!1)};this.fnSetColumnVis=function(a,b,c){a=this.api(!0).column(a).visible(b);(c===k||c)&&a.columns.adjust().draw()};this.fnSettings=function(){return za(this[s.iApiIndex])};this.fnSort=function(a){this.api(!0).order(a).draw()};this.fnSortListener=function(a,b,c){this.api(!0).order.listener(a,b,c)};this.fnUpdate=function(a,b,c,d,e){var h=this.api(!0);c===k||null===c?h.row(b).data(a):h.cell(b,c).data(a);(e===k||e)&&h.columns.adjust();(d===k||d)&&h.draw();return 0};this.fnVersionCheck=
            s.fnVersionCheck;var b=this,c=a===k,d=this.length;c&&(a={});this.oApi=this.internal=s.internal;for(var e in m.ext.internal)e&&(this[e]=Nb(e));this.each(function(){var e={},e=1<d?Lb(e,a,!0):a,g=0,j,i=this.getAttribute("id"),o=!1,l=m.defaults,q=h(this);if("table"!=this.nodeName.toLowerCase())K(null,0,"Non-table node initialisation ("+this.nodeName+")",2);else{eb(l);fb(l.column);J(l,l,!0);J(l.column,l.column,!0);J(l,h.extend(e,q.data()));var u=m.settings,g=0;for(j=u.length;g<j;g++){var p=u[g];if(p.nTable==
            this||p.nTHead.parentNode==this||p.nTFoot&&p.nTFoot.parentNode==this){g=e.bRetrieve!==k?e.bRetrieve:l.bRetrieve;if(c||g)return p.oInstance;if(e.bDestroy!==k?e.bDestroy:l.bDestroy){p.oInstance.fnDestroy();break}else{K(p,0,"Cannot reinitialise DataTable",3);return}}if(p.sTableId==this.id){u.splice(g,1);break}}if(null===i||""===i)this.id=i="DataTables_Table_"+m.ext._unique++;var n=h.extend(!0,{},m.models.oSettings,{sDestroyWidth:q[0].style.width,sInstance:i,sTableId:i});n.nTable=this;n.oApi=b.internal;
            n.oInit=e;u.push(n);n.oInstance=1===b.length?b:q.dataTable();eb(e);e.oLanguage&&Fa(e.oLanguage);e.aLengthMenu&&!e.iDisplayLength&&(e.iDisplayLength=h.isArray(e.aLengthMenu[0])?e.aLengthMenu[0][0]:e.aLengthMenu[0]);e=Lb(h.extend(!0,{},l),e);F(n.oFeatures,e,"bPaginate bLengthChange bFilter bSort bSortMulti bInfo bProcessing bAutoWidth bSortClasses bServerSide bDeferRender".split(" "));F(n,e,["asStripeClasses","ajax","fnServerData","fnFormatNumber","sServerMethod","aaSorting","aaSortingFixed","aLengthMenu",
                "sPaginationType","sAjaxSource","sAjaxDataProp","iStateDuration","sDom","bSortCellsTop","iTabIndex","fnStateLoadCallback","fnStateSaveCallback","renderer","searchDelay","rowId",["iCookieDuration","iStateDuration"],["oSearch","oPreviousSearch"],["aoSearchCols","aoPreSearchCols"],["iDisplayLength","_iDisplayLength"],["bJQueryUI","bJUI"]]);F(n.oScroll,e,[["sScrollX","sX"],["sScrollXInner","sXInner"],["sScrollY","sY"],["bScrollCollapse","bCollapse"]]);F(n.oLanguage,e,"fnInfoCallback");z(n,"aoDrawCallback",
                e.fnDrawCallback,"user");z(n,"aoServerParams",e.fnServerParams,"user");z(n,"aoStateSaveParams",e.fnStateSaveParams,"user");z(n,"aoStateLoadParams",e.fnStateLoadParams,"user");z(n,"aoStateLoaded",e.fnStateLoaded,"user");z(n,"aoRowCallback",e.fnRowCallback,"user");z(n,"aoRowCreatedCallback",e.fnCreatedRow,"user");z(n,"aoHeaderCallback",e.fnHeaderCallback,"user");z(n,"aoFooterCallback",e.fnFooterCallback,"user");z(n,"aoInitComplete",e.fnInitComplete,"user");z(n,"aoPreDrawCallback",e.fnPreDrawCallback,
                "user");n.rowIdFn=Q(e.rowId);gb(n);i=n.oClasses;e.bJQueryUI?(h.extend(i,m.ext.oJUIClasses,e.oClasses),e.sDom===l.sDom&&"lfrtip"===l.sDom&&(n.sDom='<"H"lfr>t<"F"ip>'),n.renderer)?h.isPlainObject(n.renderer)&&!n.renderer.header&&(n.renderer.header="jqueryui"):n.renderer="jqueryui":h.extend(i,m.ext.classes,e.oClasses);q.addClass(i.sTable);n.iInitDisplayStart===k&&(n.iInitDisplayStart=e.iDisplayStart,n._iDisplayStart=e.iDisplayStart);null!==e.iDeferLoading&&(n.bDeferLoading=!0,g=h.isArray(e.iDeferLoading),
                n._iRecordsDisplay=g?e.iDeferLoading[0]:e.iDeferLoading,n._iRecordsTotal=g?e.iDeferLoading[1]:e.iDeferLoading);var t=n.oLanguage;h.extend(!0,t,e.oLanguage);""!==t.sUrl&&(h.ajax({dataType:"json",url:t.sUrl,success:function(a){Fa(a);J(l.oLanguage,a);h.extend(true,t,a);ia(n)},error:function(){ia(n)}}),o=!0);null===e.asStripeClasses&&(n.asStripeClasses=[i.sStripeOdd,i.sStripeEven]);var g=n.asStripeClasses,r=q.children("tbody").find("tr").eq(0);-1!==h.inArray(!0,h.map(g,function(a){return r.hasClass(a)}))&&
            (h("tbody tr",this).removeClass(g.join(" ")),n.asDestroyStripes=g.slice());u=[];g=this.getElementsByTagName("thead");0!==g.length&&(fa(n.aoHeader,g[0]),u=qa(n));if(null===e.aoColumns){p=[];g=0;for(j=u.length;g<j;g++)p.push(null)}else p=e.aoColumns;g=0;for(j=p.length;g<j;g++)Ga(n,u?u[g]:null);ib(n,e.aoColumnDefs,p,function(a,b){la(n,a,b)});if(r.length){var s=function(a,b){return a.getAttribute("data-"+b)!==null?b:null};h(r[0]).children("th, td").each(function(a,b){var c=n.aoColumns[a];if(c.mData===
                a){var d=s(b,"sort")||s(b,"order"),e=s(b,"filter")||s(b,"search");if(d!==null||e!==null){c.mData={_:a+".display",sort:d!==null?a+".@data-"+d:k,type:d!==null?a+".@data-"+d:k,filter:e!==null?a+".@data-"+e:k};la(n,a)}}})}var w=n.oFeatures;e.bStateSave&&(w.bStateSave=!0,Kb(n,e),z(n,"aoDrawCallback",ya,"state_save"));if(e.aaSorting===k){u=n.aaSorting;g=0;for(j=u.length;g<j;g++)u[g][1]=n.aoColumns[g].asSorting[0]}xa(n);w.bSort&&z(n,"aoDrawCallback",function(){if(n.bSorted){var a=W(n),b={};h.each(a,function(a,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          c){b[c.src]=c.dir});v(n,null,"order",[n,a,b]);Jb(n)}});z(n,"aoDrawCallback",function(){(n.bSorted||y(n)==="ssp"||w.bDeferRender)&&xa(n)},"sc");g=q.children("caption").each(function(){this._captionSide=q.css("caption-side")});j=q.children("thead");0===j.length&&(j=h("<thead/>").appendTo(this));n.nTHead=j[0];j=q.children("tbody");0===j.length&&(j=h("<tbody/>").appendTo(this));n.nTBody=j[0];j=q.children("tfoot");if(0===j.length&&0<g.length&&(""!==n.oScroll.sX||""!==n.oScroll.sY))j=h("<tfoot/>").appendTo(this);
            0===j.length||0===j.children().length?q.addClass(i.sNoFooter):0<j.length&&(n.nTFoot=j[0],fa(n.aoFooter,n.nTFoot));if(e.aaData)for(g=0;g<e.aaData.length;g++)N(n,e.aaData[g]);else(n.bDeferLoading||"dom"==y(n))&&ma(n,h(n.nTBody).children("tr"));n.aiDisplay=n.aiDisplayMaster.slice();n.bInitialised=!0;!1===o&&ia(n)}});b=null;return this};var Tb=[],x=Array.prototype,cc=function(a){var b,c,d=m.settings,e=h.map(d,function(a){return a.nTable});if(a){if(a.nTable&&a.oApi)return[a];if(a.nodeName&&"table"===a.nodeName.toLowerCase())return b=
        h.inArray(a,e),-1!==b?[d[b]]:null;if(a&&"function"===typeof a.settings)return a.settings().toArray();"string"===typeof a?c=h(a):a instanceof h&&(c=a)}else return[];if(c)return c.map(function(){b=h.inArray(this,e);return-1!==b?d[b]:null}).toArray()};t=function(a,b){if(!(this instanceof t))return new t(a,b);var c=[],d=function(a){(a=cc(a))&&(c=c.concat(a))};if(h.isArray(a))for(var e=0,f=a.length;e<f;e++)d(a[e]);else d(a);this.context=pa(c);b&&h.merge(this,b);this.selector={rows:null,cols:null,opts:null};
        t.extend(this,this,Tb)};m.Api=t;h.extend(t.prototype,{any:function(){return 0!==this.count()},concat:x.concat,context:[],count:function(){return this.flatten().length},each:function(a){for(var b=0,c=this.length;b<c;b++)a.call(this,this[b],b,this);return this},eq:function(a){var b=this.context;return b.length>a?new t(b[a],this[a]):null},filter:function(a){var b=[];if(x.filter)b=x.filter.call(this,a,this);else for(var c=0,d=this.length;c<d;c++)a.call(this,this[c],c,this)&&b.push(this[c]);return new t(this.context,
        b)},flatten:function(){var a=[];return new t(this.context,a.concat.apply(a,this.toArray()))},join:x.join,indexOf:x.indexOf||function(a,b){for(var c=b||0,d=this.length;c<d;c++)if(this[c]===a)return c;return-1},iterator:function(a,b,c,d){var e=[],f,g,h,i,o,l=this.context,m,p,r=this.selector;"string"===typeof a&&(d=c,c=b,b=a,a=!1);g=0;for(h=l.length;g<h;g++){var n=new t(l[g]);if("table"===b)f=c.call(n,l[g],g),f!==k&&e.push(f);else if("columns"===b||"rows"===b)f=c.call(n,l[g],this[g],g),f!==k&&e.push(f);
    else if("column"===b||"column-rows"===b||"row"===b||"cell"===b){p=this[g];"column-rows"===b&&(m=Da(l[g],r.opts));i=0;for(o=p.length;i<o;i++)f=p[i],f="cell"===b?c.call(n,l[g],f.row,f.column,g,i):c.call(n,l[g],f,g,i,m),f!==k&&e.push(f)}}return e.length||d?(a=new t(l,a?e.concat.apply([],e):e),b=a.selector,b.rows=r.rows,b.cols=r.cols,b.opts=r.opts,a):this},lastIndexOf:x.lastIndexOf||function(a,b){return this.indexOf.apply(this.toArray.reverse(),arguments)},length:0,map:function(a){var b=[];if(x.map)b=
        x.map.call(this,a,this);else for(var c=0,d=this.length;c<d;c++)b.push(a.call(this,this[c],c));return new t(this.context,b)},pluck:function(a){return this.map(function(b){return b[a]})},pop:x.pop,push:x.push,reduce:x.reduce||function(a,b){return hb(this,a,b,0,this.length,1)},reduceRight:x.reduceRight||function(a,b){return hb(this,a,b,this.length-1,-1,-1)},reverse:x.reverse,selector:null,shift:x.shift,sort:x.sort,splice:x.splice,toArray:function(){return x.slice.call(this)},to$:function(){return h(this)},
        toJQuery:function(){return h(this)},unique:function(){return new t(this.context,pa(this))},unshift:x.unshift});t.extend=function(a,b,c){if(c.length&&b&&(b instanceof t||b.__dt_wrapper)){var d,e,f,g=function(a,b,c){return function(){var d=b.apply(a,arguments);t.extend(d,d,c.methodExt);return d}};d=0;for(e=c.length;d<e;d++)f=c[d],b[f.name]="function"===typeof f.val?g(a,f.val,f):h.isPlainObject(f.val)?{}:f.val,b[f.name].__dt_wrapper=!0,t.extend(a,b[f.name],f.propExt)}};t.register=p=function(a,b){if(h.isArray(a))for(var c=
        0,d=a.length;c<d;c++)t.register(a[c],b);else for(var e=a.split("."),f=Tb,g,j,c=0,d=e.length;c<d;c++){g=(j=-1!==e[c].indexOf("()"))?e[c].replace("()",""):e[c];var i;a:{i=0;for(var k=f.length;i<k;i++)if(f[i].name===g){i=f[i];break a}i=null}i||(i={name:g,val:{},methodExt:[],propExt:[]},f.push(i));c===d-1?i.val=b:f=j?i.methodExt:i.propExt}};t.registerPlural=r=function(a,b,c){t.register(a,c);t.register(b,function(){var a=c.apply(this,arguments);return a===this?this:a instanceof t?a.length?h.isArray(a[0])?
                    new t(a.context,a[0]):a[0]:k:a})};p("tables()",function(a){var b;if(a){b=t;var c=this.context;if("number"===typeof a)a=[c[a]];else var d=h.map(c,function(a){return a.nTable}),a=h(d).filter(a).map(function(){var a=h.inArray(this,d);return c[a]}).toArray();b=new b(a)}else b=this;return b});p("table()",function(a){var a=this.tables(a),b=a.context;return b.length?new t(b[0]):a});r("tables().nodes()","table().node()",function(){return this.iterator("table",function(a){return a.nTable},1)});r("tables().body()",
        "table().body()",function(){return this.iterator("table",function(a){return a.nTBody},1)});r("tables().header()","table().header()",function(){return this.iterator("table",function(a){return a.nTHead},1)});r("tables().footer()","table().footer()",function(){return this.iterator("table",function(a){return a.nTFoot},1)});r("tables().containers()","table().container()",function(){return this.iterator("table",function(a){return a.nTableWrapper},1)});p("draw()",function(a){return this.iterator("table",
        function(b){"page"===a?O(b):("string"===typeof a&&(a="full-hold"===a?!1:!0),T(b,!1===a))})});p("page()",function(a){return a===k?this.page.info().page:this.iterator("table",function(b){Ta(b,a)})});p("page.info()",function(){if(0===this.context.length)return k;var a=this.context[0],b=a._iDisplayStart,c=a.oFeatures.bPaginate?a._iDisplayLength:-1,d=a.fnRecordsDisplay(),e=-1===c;return{page:e?0:Math.floor(b/c),pages:e?1:Math.ceil(d/c),start:b,end:a.fnDisplayEnd(),length:c,recordsTotal:a.fnRecordsTotal(),
        recordsDisplay:d,serverSide:"ssp"===y(a)}});p("page.len()",function(a){return a===k?0!==this.context.length?this.context[0]._iDisplayLength:k:this.iterator("table",function(b){Ra(b,a)})});var Ub=function(a,b,c){if(c){var d=new t(a);d.one("draw",function(){c(d.ajax.json())})}if("ssp"==y(a))T(a,b);else{C(a,!0);var e=a.jqXHR;e&&4!==e.readyState&&e.abort();ra(a,[],function(c){na(a);for(var c=sa(a,c),d=0,e=c.length;d<e;d++)N(a,c[d]);T(a,b);C(a,!1)})}};p("ajax.json()",function(){var a=this.context;if(0<
        a.length)return a[0].json});p("ajax.params()",function(){var a=this.context;if(0<a.length)return a[0].oAjaxData});p("ajax.reload()",function(a,b){return this.iterator("table",function(c){Ub(c,!1===b,a)})});p("ajax.url()",function(a){var b=this.context;if(a===k){if(0===b.length)return k;b=b[0];return b.ajax?h.isPlainObject(b.ajax)?b.ajax.url:b.ajax:b.sAjaxSource}return this.iterator("table",function(b){h.isPlainObject(b.ajax)?b.ajax.url=a:b.ajax=a})});p("ajax.url().load()",function(a,b){return this.iterator("table",
        function(c){Ub(c,!1===b,a)})});var $a=function(a,b,c,d,e){var f=[],g,j,i,o,l,m;i=typeof b;if(!b||"string"===i||"function"===i||b.length===k)b=[b];i=0;for(o=b.length;i<o;i++){j=b[i]&&b[i].split?b[i].split(","):[b[i]];l=0;for(m=j.length;l<m;l++)(g=c("string"===typeof j[l]?h.trim(j[l]):j[l]))&&g.length&&(f=f.concat(g))}a=s.selector[a];if(a.length){i=0;for(o=a.length;i<o;i++)f=a[i](d,e,f)}return pa(f)},ab=function(a){a||(a={});a.filter&&a.search===k&&(a.search=a.filter);return h.extend({search:"none",
        order:"current",page:"all"},a)},bb=function(a){for(var b=0,c=a.length;b<c;b++)if(0<a[b].length)return a[0]=a[b],a[0].length=1,a.length=1,a.context=[a.context[b]],a;a.length=0;return a},Da=function(a,b){var c,d,e,f=[],g=a.aiDisplay;c=a.aiDisplayMaster;var j=b.search;d=b.order;e=b.page;if("ssp"==y(a))return"removed"===j?[]:X(0,c.length);if("current"==e){c=a._iDisplayStart;for(d=a.fnDisplayEnd();c<d;c++)f.push(g[c])}else if("current"==d||"applied"==d)f="none"==j?c.slice():"applied"==j?g.slice():h.map(c,
                function(a){return-1===h.inArray(a,g)?a:null});else if("index"==d||"original"==d){c=0;for(d=a.aoData.length;c<d;c++)"none"==j?f.push(c):(e=h.inArray(c,g),(-1===e&&"removed"==j||0<=e&&"applied"==j)&&f.push(c))}return f};p("rows()",function(a,b){a===k?a="":h.isPlainObject(a)&&(b=a,a="");var b=ab(b),c=this.iterator("table",function(c){var e=b;return $a("row",a,function(a){var b=Pb(a);if(b!==null&&!e)return[b];var j=Da(c,e);if(b!==null&&h.inArray(b,j)!==-1)return[b];if(!a)return j;if(typeof a==="function")return h.map(j,
        function(b){var e=c.aoData[b];return a(b,e._aData,e.nTr)?b:null});b=Sb(ja(c.aoData,j,"nTr"));if(a.nodeName&&h.inArray(a,b)!==-1)return[a._DT_RowIndex];if(typeof a==="string"&&a.charAt(0)==="#"){j=c.aIds[a.replace(/^#/,"")];if(j!==k)return[j.idx]}return h(b).filter(a).map(function(){return this._DT_RowIndex}).toArray()},c,e)},1);c.selector.rows=a;c.selector.opts=b;return c});p("rows().nodes()",function(){return this.iterator("row",function(a,b){return a.aoData[b].nTr||k},1)});p("rows().data()",function(){return this.iterator(!0,
        "rows",function(a,b){return ja(a.aoData,b,"_aData")},1)});r("rows().cache()","row().cache()",function(a){return this.iterator("row",function(b,c){var d=b.aoData[c];return"search"===a?d._aFilterData:d._aSortData},1)});r("rows().invalidate()","row().invalidate()",function(a){return this.iterator("row",function(b,c){ea(b,c,a)})});r("rows().indexes()","row().index()",function(){return this.iterator("row",function(a,b){return b},1)});r("rows().ids()","row().id()",function(a){for(var b=[],c=this.context,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           d=0,e=c.length;d<e;d++)for(var f=0,g=this[d].length;f<g;f++){var h=c[d].rowIdFn(c[d].aoData[this[d][f]]._aData);b.push((!0===a?"#":"")+h)}return new t(c,b)});r("rows().remove()","row().remove()",function(){var a=this;this.iterator("row",function(b,c,d){var e=b.aoData,f=e[c],g,h,i,o,l;e.splice(c,1);g=0;for(h=e.length;g<h;g++)if(i=e[g],l=i.anCells,null!==i.nTr&&(i.nTr._DT_RowIndex=g),null!==l){i=0;for(o=l.length;i<o;i++)l[i]._DT_CellIndex.row=g}oa(b.aiDisplayMaster,c);oa(b.aiDisplay,c);oa(a[d],c,!1);
        Sa(b);c=b.rowIdFn(f._aData);c!==k&&delete b.aIds[c]});this.iterator("table",function(a){for(var c=0,d=a.aoData.length;c<d;c++)a.aoData[c].idx=c});return this});p("rows.add()",function(a){var b=this.iterator("table",function(b){var c,f,g,h=[];f=0;for(g=a.length;f<g;f++)c=a[f],c.nodeName&&"TR"===c.nodeName.toUpperCase()?h.push(ma(b,c)[0]):h.push(N(b,c));return h},1),c=this.rows(-1);c.pop();h.merge(c,b);return c});p("row()",function(a,b){return bb(this.rows(a,b))});p("row().data()",function(a){var b=
        this.context;if(a===k)return b.length&&this.length?b[0].aoData[this[0]]._aData:k;b[0].aoData[this[0]]._aData=a;ea(b[0],this[0],"data");return this});p("row().node()",function(){var a=this.context;return a.length&&this.length?a[0].aoData[this[0]].nTr||null:null});p("row.add()",function(a){a instanceof h&&a.length&&(a=a[0]);var b=this.iterator("table",function(b){return a.nodeName&&"TR"===a.nodeName.toUpperCase()?ma(b,a)[0]:N(b,a)});return this.row(b[0])});var cb=function(a,b){var c=a.context;if(c.length&&
        (c=c[0].aoData[b!==k?b:a[0]])&&c._details)c._details.remove(),c._detailsShow=k,c._details=k},Vb=function(a,b){var c=a.context;if(c.length&&a.length){var d=c[0].aoData[a[0]];if(d._details){(d._detailsShow=b)?d._details.insertAfter(d.nTr):d._details.detach();var e=c[0],f=new t(e),g=e.aoData;f.off("draw.dt.DT_details column-visibility.dt.DT_details destroy.dt.DT_details");0<D(g,"_details").length&&(f.on("draw.dt.DT_details",function(a,b){e===b&&f.rows({page:"current"}).eq(0).each(function(a){a=g[a];
        a._detailsShow&&a._details.insertAfter(a.nTr)})}),f.on("column-visibility.dt.DT_details",function(a,b){if(e===b)for(var c,d=ca(b),f=0,h=g.length;f<h;f++)c=g[f],c._details&&c._details.children("td[colspan]").attr("colspan",d)}),f.on("destroy.dt.DT_details",function(a,b){if(e===b)for(var c=0,d=g.length;c<d;c++)g[c]._details&&cb(f,c)}))}}};p("row().child()",function(a,b){var c=this.context;if(a===k)return c.length&&this.length?c[0].aoData[this[0]]._details:k;if(!0===a)this.child.show();else if(!1===
        a)cb(this);else if(c.length&&this.length){var d=c[0],c=c[0].aoData[this[0]],e=[],f=function(a,b){if(h.isArray(a)||a instanceof h)for(var c=0,k=a.length;c<k;c++)f(a[c],b);else a.nodeName&&"tr"===a.nodeName.toLowerCase()?e.push(a):(c=h("<tr><td/></tr>").addClass(b),h("td",c).addClass(b).html(a)[0].colSpan=ca(d),e.push(c[0]))};f(a,b);c._details&&c._details.remove();c._details=h(e);c._detailsShow&&c._details.insertAfter(c.nTr)}return this});p(["row().child.show()","row().child().show()"],function(){Vb(this,
        !0);return this});p(["row().child.hide()","row().child().hide()"],function(){Vb(this,!1);return this});p(["row().child.remove()","row().child().remove()"],function(){cb(this);return this});p("row().child.isShown()",function(){var a=this.context;return a.length&&this.length?a[0].aoData[this[0]]._detailsShow||!1:!1});var dc=/^(.+):(name|visIdx|visible)$/,Wb=function(a,b,c,d,e){for(var c=[],d=0,f=e.length;d<f;d++)c.push(B(a,e[d],b));return c};p("columns()",function(a,b){a===k?a="":h.isPlainObject(a)&&
        (b=a,a="");var b=ab(b),c=this.iterator("table",function(c){var e=a,f=b,g=c.aoColumns,j=D(g,"sName"),i=D(g,"nTh");return $a("column",e,function(a){var b=Pb(a);if(a==="")return X(g.length);if(b!==null)return[b>=0?b:g.length+b];if(typeof a==="function"){var e=Da(c,f);return h.map(g,function(b,f){return a(f,Wb(c,f,0,0,e),i[f])?f:null})}var k=typeof a==="string"?a.match(dc):"";if(k)switch(k[2]){case "visIdx":case "visible":b=parseInt(k[1],10);if(b<0){var m=h.map(g,function(a,b){return a.bVisible?b:null});
        return[m[m.length+b]]}return[$(c,b)];case "name":return h.map(j,function(a,b){return a===k[1]?b:null})}else return h(i).filter(a).map(function(){return h.inArray(this,i)}).toArray()},c,f)},1);c.selector.cols=a;c.selector.opts=b;return c});r("columns().header()","column().header()",function(){return this.iterator("column",function(a,b){return a.aoColumns[b].nTh},1)});r("columns().footer()","column().footer()",function(){return this.iterator("column",function(a,b){return a.aoColumns[b].nTf},1)});r("columns().data()",
        "column().data()",function(){return this.iterator("column-rows",Wb,1)});r("columns().dataSrc()","column().dataSrc()",function(){return this.iterator("column",function(a,b){return a.aoColumns[b].mData},1)});r("columns().cache()","column().cache()",function(a){return this.iterator("column-rows",function(b,c,d,e,f){return ja(b.aoData,f,"search"===a?"_aFilterData":"_aSortData",c)},1)});r("columns().nodes()","column().nodes()",function(){return this.iterator("column-rows",function(a,b,c,d,e){return ja(a.aoData,
        e,"anCells",b)},1)});r("columns().visible()","column().visible()",function(a,b){return this.iterator("column",function(c,d){if(a===k)return c.aoColumns[d].bVisible;var e=c.aoColumns,f=e[d],g=c.aoData,j,i,m;if(a!==k&&f.bVisible!==a){if(a){var l=h.inArray(!0,D(e,"bVisible"),d+1);j=0;for(i=g.length;j<i;j++)m=g[j].nTr,e=g[j].anCells,m&&m.insertBefore(e[d],e[l]||null)}else h(D(c.aoData,"anCells",d)).detach();f.bVisible=a;ga(c,c.aoHeader);ga(c,c.aoFooter);if(b===k||b)U(c),(c.oScroll.sX||c.oScroll.sY)&&
    Z(c);v(c,null,"column-visibility",[c,d,a,b]);ya(c)}})});r("columns().indexes()","column().index()",function(a){return this.iterator("column",function(b,c){return"visible"===a?ba(b,c):c},1)});p("columns.adjust()",function(){return this.iterator("table",function(a){U(a)},1)});p("column.index()",function(a,b){if(0!==this.context.length){var c=this.context[0];if("fromVisible"===a||"toData"===a)return $(c,b);if("fromData"===a||"toVisible"===a)return ba(c,b)}});p("column()",function(a,b){return bb(this.columns(a,
        b))});p("cells()",function(a,b,c){h.isPlainObject(a)&&(a.row===k?(c=a,a=null):(c=b,b=null));h.isPlainObject(b)&&(c=b,b=null);if(null===b||b===k)return this.iterator("table",function(b){var d=a,e=ab(c),f=b.aoData,g=Da(b,e),j=Sb(ja(f,g,"anCells")),i=h([].concat.apply([],j)),l,m=b.aoColumns.length,o,p,t,r,s,v;return $a("cell",d,function(a){var c=typeof a==="function";if(a===null||a===k||c){o=[];p=0;for(t=g.length;p<t;p++){l=g[p];for(r=0;r<m;r++){s={row:l,column:r};if(c){v=f[l];a(s,B(b,l,r),v.anCells?
        v.anCells[r]:null)&&o.push(s)}else o.push(s)}}return o}return h.isPlainObject(a)?[a]:i.filter(a).map(function(a,b){return{row:b._DT_CellIndex.row,column:b._DT_CellIndex.column}}).toArray()},b,e)});var d=this.columns(b,c),e=this.rows(a,c),f,g,j,i,m,l=this.iterator("table",function(a,b){f=[];g=0;for(j=e[b].length;g<j;g++){i=0;for(m=d[b].length;i<m;i++)f.push({row:e[b][g],column:d[b][i]})}return f},1);h.extend(l.selector,{cols:b,rows:a,opts:c});return l});r("cells().nodes()","cell().node()",function(){return this.iterator("cell",
        function(a,b,c){return(a=a.aoData[b].anCells)?a[c]:k},1)});p("cells().data()",function(){return this.iterator("cell",function(a,b,c){return B(a,b,c)},1)});r("cells().cache()","cell().cache()",function(a){a="search"===a?"_aFilterData":"_aSortData";return this.iterator("cell",function(b,c,d){return b.aoData[c][a][d]},1)});r("cells().render()","cell().render()",function(a){return this.iterator("cell",function(b,c,d){return B(b,c,d,a)},1)});r("cells().indexes()","cell().index()",function(){return this.iterator("cell",
        function(a,b,c){return{row:b,column:c,columnVisible:ba(a,c)}},1)});r("cells().invalidate()","cell().invalidate()",function(a){return this.iterator("cell",function(b,c,d){ea(b,c,a,d)})});p("cell()",function(a,b,c){return bb(this.cells(a,b,c))});p("cell().data()",function(a){var b=this.context,c=this[0];if(a===k)return b.length&&c.length?B(b[0],c[0].row,c[0].column):k;jb(b[0],c[0].row,c[0].column,a);ea(b[0],c[0].row,"data",c[0].column);return this});p("order()",function(a,b){var c=this.context;if(a===
        k)return 0!==c.length?c[0].aaSorting:k;"number"===typeof a?a=[[a,b]]:h.isArray(a[0])||(a=Array.prototype.slice.call(arguments));return this.iterator("table",function(b){b.aaSorting=a.slice()})});p("order.listener()",function(a,b,c){return this.iterator("table",function(d){Oa(d,a,b,c)})});p("order.fixed()",function(a){if(!a){var b=this.context,b=b.length?b[0].aaSortingFixed:k;return h.isArray(b)?{pre:b}:b}return this.iterator("table",function(b){b.aaSortingFixed=h.extend(!0,{},a)})});p(["columns().order()",
        "column().order()"],function(a){var b=this;return this.iterator("table",function(c,d){var e=[];h.each(b[d],function(b,c){e.push([c,a])});c.aaSorting=e})});p("search()",function(a,b,c,d){var e=this.context;return a===k?0!==e.length?e[0].oPreviousSearch.sSearch:k:this.iterator("table",function(e){e.oFeatures.bFilter&&ha(e,h.extend({},e.oPreviousSearch,{sSearch:a+"",bRegex:null===b?!1:b,bSmart:null===c?!0:c,bCaseInsensitive:null===d?!0:d}),1)})});r("columns().search()","column().search()",function(a,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            b,c,d){return this.iterator("column",function(e,f){var g=e.aoPreSearchCols;if(a===k)return g[f].sSearch;e.oFeatures.bFilter&&(h.extend(g[f],{sSearch:a+"",bRegex:null===b?!1:b,bSmart:null===c?!0:c,bCaseInsensitive:null===d?!0:d}),ha(e,e.oPreviousSearch,1))})});p("state()",function(){return this.context.length?this.context[0].oSavedState:null});p("state.clear()",function(){return this.iterator("table",function(a){a.fnStateSaveCallback.call(a.oInstance,a,{})})});p("state.loaded()",function(){return this.context.length?
        this.context[0].oLoadedState:null});p("state.save()",function(){return this.iterator("table",function(a){ya(a)})});m.versionCheck=m.fnVersionCheck=function(a){for(var b=m.version.split("."),a=a.split("."),c,d,e=0,f=a.length;e<f;e++)if(c=parseInt(b[e],10)||0,d=parseInt(a[e],10)||0,c!==d)return c>d;return!0};m.isDataTable=m.fnIsDataTable=function(a){var b=h(a).get(0),c=!1;h.each(m.settings,function(a,e){var f=e.nScrollHead?h("table",e.nScrollHead)[0]:null,g=e.nScrollFoot?h("table",e.nScrollFoot)[0]:
        null;if(e.nTable===b||f===b||g===b)c=!0});return c};m.tables=m.fnTables=function(a){var b=!1;h.isPlainObject(a)&&(b=a.api,a=a.visible);var c=h.map(m.settings,function(b){if(!a||a&&h(b.nTable).is(":visible"))return b.nTable});return b?new t(c):c};m.util={throttle:ua,escapeRegex:va};m.camelToHungarian=J;p("$()",function(a,b){var c=this.rows(b).nodes(),c=h(c);return h([].concat(c.filter(a).toArray(),c.find(a).toArray()))});h.each(["on","one","off"],function(a,b){p(b+"()",function(){var a=Array.prototype.slice.call(arguments);
        a[0].match(/\.dt\b/)||(a[0]+=".dt");var d=h(this.tables().nodes());d[b].apply(d,a);return this})});p("clear()",function(){return this.iterator("table",function(a){na(a)})});p("settings()",function(){return new t(this.context,this.context)});p("init()",function(){var a=this.context;return a.length?a[0].oInit:null});p("data()",function(){return this.iterator("table",function(a){return D(a.aoData,"_aData")}).flatten()});p("destroy()",function(a){a=a||!1;return this.iterator("table",function(b){var c=
        b.nTableWrapper.parentNode,d=b.oClasses,e=b.nTable,f=b.nTBody,g=b.nTHead,j=b.nTFoot,i=h(e),f=h(f),k=h(b.nTableWrapper),l=h.map(b.aoData,function(a){return a.nTr}),p;b.bDestroying=!0;v(b,"aoDestroyCallback","destroy",[b]);a||(new t(b)).columns().visible(!0);k.unbind(".DT").find(":not(tbody *)").unbind(".DT");h(E).unbind(".DT-"+b.sInstance);e!=g.parentNode&&(i.children("thead").detach(),i.append(g));j&&e!=j.parentNode&&(i.children("tfoot").detach(),i.append(j));b.aaSorting=[];b.aaSortingFixed=[];xa(b);
        h(l).removeClass(b.asStripeClasses.join(" "));h("th, td",g).removeClass(d.sSortable+" "+d.sSortableAsc+" "+d.sSortableDesc+" "+d.sSortableNone);b.bJUI&&(h("th span."+d.sSortIcon+", td span."+d.sSortIcon,g).detach(),h("th, td",g).each(function(){var a=h("div."+d.sSortJUIWrapper,this);h(this).append(a.contents());a.detach()}));f.children().detach();f.append(l);g=a?"remove":"detach";i[g]();k[g]();!a&&c&&(c.insertBefore(e,b.nTableReinsertBefore),i.css("width",b.sDestroyWidth).removeClass(d.sTable),(p=
            b.asDestroyStripes.length)&&f.children().each(function(a){h(this).addClass(b.asDestroyStripes[a%p])}));c=h.inArray(b,m.settings);-1!==c&&m.settings.splice(c,1)})});h.each(["column","row","cell"],function(a,b){p(b+"s().every()",function(a){var d=this.selector.opts,e=this;return this.iterator(b,function(f,g,h,i,m){a.call(e[b](g,"cell"===b?h:d,"cell"===b?d:k),g,h,i,m)})})});p("i18n()",function(a,b,c){var d=this.context[0],a=Q(a)(d.oLanguage);a===k&&(a=b);c!==k&&h.isPlainObject(a)&&(a=a[c]!==k?a[c]:a._);
        return a.replace("%d",c)});m.version="1.10.10";m.settings=[];m.models={};m.models.oSearch={bCaseInsensitive:!0,sSearch:"",bRegex:!1,bSmart:!0};m.models.oRow={nTr:null,anCells:null,_aData:[],_aSortData:null,_aFilterData:null,_sFilterRow:null,_sRowStripe:"",src:null,idx:-1};m.models.oColumn={idx:null,aDataSort:null,asSorting:null,bSearchable:null,bSortable:null,bVisible:null,_sManualType:null,_bAttrSrc:!1,fnCreatedCell:null,fnGetData:null,fnSetData:null,mData:null,mRender:null,nTh:null,nTf:null,sClass:null,
        sContentPadding:null,sDefaultContent:null,sName:null,sSortDataType:"std",sSortingClass:null,sSortingClassJUI:null,sTitle:null,sType:null,sWidth:null,sWidthOrig:null};m.defaults={aaData:null,aaSorting:[[0,"asc"]],aaSortingFixed:[],ajax:null,aLengthMenu:[10,25,50,100],aoColumns:null,aoColumnDefs:null,aoSearchCols:[],asStripeClasses:null,bAutoWidth:!0,bDeferRender:!1,bDestroy:!1,bFilter:!0,bInfo:!0,bJQueryUI:!1,bLengthChange:!0,bPaginate:!0,bProcessing:!1,bRetrieve:!1,bScrollCollapse:!1,bServerSide:!1,
        bSort:!0,bSortMulti:!0,bSortCellsTop:!1,bSortClasses:!0,bStateSave:!1,fnCreatedRow:null,fnDrawCallback:null,fnFooterCallback:null,fnFormatNumber:function(a){return a.toString().replace(/\B(?=(\d{3})+(?!\d))/g,this.oLanguage.sThousands)},fnHeaderCallback:null,fnInfoCallback:null,fnInitComplete:null,fnPreDrawCallback:null,fnRowCallback:null,fnServerData:null,fnServerParams:null,fnStateLoadCallback:function(a){try{return JSON.parse((-1===a.iStateDuration?sessionStorage:localStorage).getItem("DataTables_"+
            a.sInstance+"_"+location.pathname))}catch(b){}},fnStateLoadParams:null,fnStateLoaded:null,fnStateSaveCallback:function(a,b){try{(-1===a.iStateDuration?sessionStorage:localStorage).setItem("DataTables_"+a.sInstance+"_"+location.pathname,JSON.stringify(b))}catch(c){}},fnStateSaveParams:null,iStateDuration:7200,iDeferLoading:null,iDisplayLength:10,iDisplayStart:0,iTabIndex:0,oClasses:{},oLanguage:{oAria:{sSortAscending:": activate to sort column ascending",sSortDescending:": activate to sort column descending"},
            oPaginate:{sFirst:"First",sLast:"Last",sNext:"Next",sPrevious:"Previous"},sEmptyTable:"No data available in table",sInfo:"Showing _START_ to _END_ of _TOTAL_ entries",sInfoEmpty:"Showing 0 to 0 of 0 entries",sInfoFiltered:"(filtered from _MAX_ total entries)",sInfoPostFix:"",sDecimal:"",sThousands:",",sLengthMenu:"Show _MENU_ entries",sLoadingRecords:"Loading...",sProcessing:"Processing...",sSearch:"Search:",sSearchPlaceholder:"",sUrl:"",sZeroRecords:"No matching records found"},oSearch:h.extend({},
            m.models.oSearch),sAjaxDataProp:"data",sAjaxSource:null,sDom:"lfrtip",searchDelay:null,sPaginationType:"simple_numbers",sScrollX:"",sScrollXInner:"",sScrollY:"",sServerMethod:"GET",renderer:null,rowId:"DT_RowId"};Y(m.defaults);m.defaults.column={aDataSort:null,iDataSort:-1,asSorting:["asc","desc"],bSearchable:!0,bSortable:!0,bVisible:!0,fnCreatedCell:null,mData:null,mRender:null,sCellType:"td",sClass:"",sContentPadding:"",sDefaultContent:null,sName:"",sSortDataType:"std",sTitle:null,sType:null,sWidth:null};
    Y(m.defaults.column);m.models.oSettings={oFeatures:{bAutoWidth:null,bDeferRender:null,bFilter:null,bInfo:null,bLengthChange:null,bPaginate:null,bProcessing:null,bServerSide:null,bSort:null,bSortMulti:null,bSortClasses:null,bStateSave:null},oScroll:{bCollapse:null,iBarWidth:0,sX:null,sXInner:null,sY:null},oLanguage:{fnInfoCallback:null},oBrowser:{bScrollOversize:!1,bScrollbarLeft:!1,bBounding:!1,barWidth:0},ajax:null,aanFeatures:[],aoData:[],aiDisplay:[],aiDisplayMaster:[],aIds:{},aoColumns:[],aoHeader:[],
        aoFooter:[],oPreviousSearch:{},aoPreSearchCols:[],aaSorting:null,aaSortingFixed:[],asStripeClasses:null,asDestroyStripes:[],sDestroyWidth:0,aoRowCallback:[],aoHeaderCallback:[],aoFooterCallback:[],aoDrawCallback:[],aoRowCreatedCallback:[],aoPreDrawCallback:[],aoInitComplete:[],aoStateSaveParams:[],aoStateLoadParams:[],aoStateLoaded:[],sTableId:"",nTable:null,nTHead:null,nTFoot:null,nTBody:null,nTableWrapper:null,bDeferLoading:!1,bInitialised:!1,aoOpenRows:[],sDom:null,searchDelay:null,sPaginationType:"two_button",
        iStateDuration:0,aoStateSave:[],aoStateLoad:[],oSavedState:null,oLoadedState:null,sAjaxSource:null,sAjaxDataProp:null,bAjaxDataGet:!0,jqXHR:null,json:k,oAjaxData:k,fnServerData:null,aoServerParams:[],sServerMethod:null,fnFormatNumber:null,aLengthMenu:null,iDraw:0,bDrawing:!1,iDrawError:-1,_iDisplayLength:10,_iDisplayStart:0,_iRecordsTotal:0,_iRecordsDisplay:0,bJUI:null,oClasses:{},bFiltered:!1,bSorted:!1,bSortCellsTop:null,oInit:null,aoDestroyCallback:[],fnRecordsTotal:function(){return"ssp"==y(this)?
            1*this._iRecordsTotal:this.aiDisplayMaster.length},fnRecordsDisplay:function(){return"ssp"==y(this)?1*this._iRecordsDisplay:this.aiDisplay.length},fnDisplayEnd:function(){var a=this._iDisplayLength,b=this._iDisplayStart,c=b+a,d=this.aiDisplay.length,e=this.oFeatures,f=e.bPaginate;return e.bServerSide?!1===f||-1===a?b+d:Math.min(b+a,this._iRecordsDisplay):!f||c>d||-1===a?d:c},oInstance:null,sInstance:null,iTabIndex:0,nScrollHead:null,nScrollFoot:null,aLastSort:[],oPlugins:{},rowIdFn:null,rowId:null};
    m.ext=s={buttons:{},classes:{},builder:"-source-",errMode:"alert",feature:[],search:[],selector:{cell:[],column:[],row:[]},internal:{},legacy:{ajax:null},pager:{},renderer:{pageButton:{},header:{}},order:{},type:{detect:[],search:{},order:{}},_unique:0,fnVersionCheck:m.fnVersionCheck,iApiIndex:0,oJUIClasses:{},sVersion:m.version};h.extend(s,{afnFiltering:s.search,aTypes:s.type.detect,ofnSearch:s.type.search,oSort:s.type.order,afnSortData:s.order,aoFeatures:s.feature,oApi:s.internal,oStdClasses:s.classes,
        oPagination:s.pager});h.extend(m.ext.classes,{sTable:"dataTable",sNoFooter:"no-footer",sPageButton:"paginate_button",sPageButtonActive:"current",sPageButtonDisabled:"disabled",sStripeOdd:"odd",sStripeEven:"even",sRowEmpty:"dataTables_empty",sWrapper:"dataTables_wrapper",sFilter:"dataTables_filter",sInfo:"dataTables_info",sPaging:"dataTables_paginate paging_",sLength:"dataTables_length",sProcessing:"dataTables_processing",sSortAsc:"sorting_asc",sSortDesc:"sorting_desc",sSortable:"sorting",sSortableAsc:"sorting_asc_disabled",
        sSortableDesc:"sorting_desc_disabled",sSortableNone:"sorting_disabled",sSortColumn:"sorting_",sFilterInput:"",sLengthSelect:"",sScrollWrapper:"dataTables_scroll",sScrollHead:"dataTables_scrollHead",sScrollHeadInner:"dataTables_scrollHeadInner",sScrollBody:"dataTables_scrollBody",sScrollFoot:"dataTables_scrollFoot",sScrollFootInner:"dataTables_scrollFootInner",sHeaderTH:"",sFooterTH:"",sSortJUIAsc:"",sSortJUIDesc:"",sSortJUI:"",sSortJUIAscAllowed:"",sSortJUIDescAllowed:"",sSortJUIWrapper:"",sSortIcon:"",
        sJUIHeader:"",sJUIFooter:""});var Ea="",Ea="",G=Ea+"ui-state-default",ka=Ea+"css_right ui-icon ui-icon-",Xb=Ea+"fg-toolbar ui-toolbar ui-widget-header ui-helper-clearfix";h.extend(m.ext.oJUIClasses,m.ext.classes,{sPageButton:"fg-button ui-button "+G,sPageButtonActive:"ui-state-disabled",sPageButtonDisabled:"ui-state-disabled",sPaging:"dataTables_paginate fg-buttonset ui-buttonset fg-buttonset-multi ui-buttonset-multi paging_",sSortAsc:G+" sorting_asc",sSortDesc:G+" sorting_desc",sSortable:G+" sorting",
        sSortableAsc:G+" sorting_asc_disabled",sSortableDesc:G+" sorting_desc_disabled",sSortableNone:G+" sorting_disabled",sSortJUIAsc:ka+"triangle-1-n",sSortJUIDesc:ka+"triangle-1-s",sSortJUI:ka+"carat-2-n-s",sSortJUIAscAllowed:ka+"carat-1-n",sSortJUIDescAllowed:ka+"carat-1-s",sSortJUIWrapper:"DataTables_sort_wrapper",sSortIcon:"DataTables_sort_icon",sScrollHead:"dataTables_scrollHead "+G,sScrollFoot:"dataTables_scrollFoot "+G,sHeaderTH:G,sFooterTH:G,sJUIHeader:Xb+" ui-corner-tl ui-corner-tr",sJUIFooter:Xb+
        " ui-corner-bl ui-corner-br"});var Mb=m.ext.pager;h.extend(Mb,{simple:function(){return["previous","next"]},full:function(){return["first","previous","next","last"]},numbers:function(a,b){return[Aa(a,b)]},simple_numbers:function(a,b){return["previous",Aa(a,b),"next"]},full_numbers:function(a,b){return["first","previous",Aa(a,b),"next","last"]},_numbers:Aa,numbers_length:7});h.extend(!0,m.ext.renderer,{pageButton:{_:function(a,b,c,d,e,f){var g=a.oClasses,j=a.oLanguage.oPaginate,i=a.oLanguage.oAria.paginate||
        {},k,l,m=0,p=function(b,d){var n,r,t,s,v=function(b){Ta(a,b.data.action,true)};n=0;for(r=d.length;n<r;n++){s=d[n];if(h.isArray(s)){t=h("<"+(s.DT_el||"div")+"/>").appendTo(b);p(t,s)}else{k=null;l="";switch(s){case "ellipsis":b.append('<span class="ellipsis">&#x2026;</span>');break;case "first":k=j.sFirst;l=s+(e>0?"":" "+g.sPageButtonDisabled);break;case "previous":k=j.sPrevious;l=s+(e>0?"":" "+g.sPageButtonDisabled);break;case "next":k=j.sNext;l=s+(e<f-1?"":" "+g.sPageButtonDisabled);break;case "last":k=
        j.sLast;l=s+(e<f-1?"":" "+g.sPageButtonDisabled);break;default:k=s+1;l=e===s?g.sPageButtonActive:""}if(k!==null){t=h("<a>",{"class":g.sPageButton+" "+l,"aria-controls":a.sTableId,"aria-label":i[s],"data-dt-idx":m,tabindex:a.iTabIndex,id:c===0&&typeof s==="string"?a.sTableId+"_"+s:null}).html(k).appendTo(b);Wa(t,{action:s},v);m++}}}},r;try{r=h(b).find(H.activeElement).data("dt-idx")}catch(n){}p(h(b).empty(),d);r&&h(b).find("[data-dt-idx="+r+"]").focus()}}});h.extend(m.ext.type.detect,[function(a,b){var c=
        b.oLanguage.sDecimal;return Za(a,c)?"num"+c:null},function(a){if(a&&!(a instanceof Date)&&(!ac.test(a)||!bc.test(a)))return null;var b=Date.parse(a);return null!==b&&!isNaN(b)||M(a)?"date":null},function(a,b){var c=b.oLanguage.sDecimal;return Za(a,c,!0)?"num-fmt"+c:null},function(a,b){var c=b.oLanguage.sDecimal;return Rb(a,c)?"html-num"+c:null},function(a,b){var c=b.oLanguage.sDecimal;return Rb(a,c,!0)?"html-num-fmt"+c:null},function(a){return M(a)||"string"===typeof a&&-1!==a.indexOf("<")?"html":
        null}]);h.extend(m.ext.type.search,{html:function(a){return M(a)?a:"string"===typeof a?a.replace(Ob," ").replace(Ca,""):""},string:function(a){return M(a)?a:"string"===typeof a?a.replace(Ob," "):a}});var Ba=function(a,b,c,d){if(0!==a&&(!a||"-"===a))return-Infinity;b&&(a=Qb(a,b));a.replace&&(c&&(a=a.replace(c,"")),d&&(a=a.replace(d,"")));return 1*a};h.extend(s.type.order,{"date-pre":function(a){return Date.parse(a)||0},"html-pre":function(a){return M(a)?"":a.replace?a.replace(/<.*?>/g,"").toLowerCase():
            a+""},"string-pre":function(a){return M(a)?"":"string"===typeof a?a.toLowerCase():!a.toString?"":a.toString()},"string-asc":function(a,b){return a<b?-1:a>b?1:0},"string-desc":function(a,b){return a<b?1:a>b?-1:0}});db("");h.extend(!0,m.ext.renderer,{header:{_:function(a,b,c,d){h(a.nTable).on("order.dt.DT",function(e,f,g,h){if(a===f){e=c.idx;b.removeClass(c.sSortingClass+" "+d.sSortAsc+" "+d.sSortDesc).addClass(h[e]=="asc"?d.sSortAsc:h[e]=="desc"?d.sSortDesc:c.sSortingClass)}})},jqueryui:function(a,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                b,c,d){h("<div/>").addClass(d.sSortJUIWrapper).append(b.contents()).append(h("<span/>").addClass(d.sSortIcon+" "+c.sSortingClassJUI)).appendTo(b);h(a.nTable).on("order.dt.DT",function(e,f,g,h){if(a===f){e=c.idx;b.removeClass(d.sSortAsc+" "+d.sSortDesc).addClass(h[e]=="asc"?d.sSortAsc:h[e]=="desc"?d.sSortDesc:c.sSortingClass);b.find("span."+d.sSortIcon).removeClass(d.sSortJUIAsc+" "+d.sSortJUIDesc+" "+d.sSortJUI+" "+d.sSortJUIAscAllowed+" "+d.sSortJUIDescAllowed).addClass(h[e]=="asc"?d.sSortJUIAsc:
        h[e]=="desc"?d.sSortJUIDesc:c.sSortingClassJUI)}})}}});m.render={number:function(a,b,c,d,e){return{display:function(f){if("number"!==typeof f&&"string"!==typeof f)return f;var g=0>f?"-":"",h=parseFloat(f);if(isNaN(h))return f;f=Math.abs(h);h=parseInt(f,10);f=c?b+(f-h).toFixed(c).substring(2):"";return g+(d||"")+h.toString().replace(/\B(?=(\d{3})+(?!\d))/g,a)+f+(e||"")}}},text:function(){return{display:function(a){return"string"===typeof a?a.replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"):
        a}}}};h.extend(m.ext.internal,{_fnExternApiFunc:Nb,_fnBuildAjax:ra,_fnAjaxUpdate:lb,_fnAjaxParameters:ub,_fnAjaxUpdateDraw:vb,_fnAjaxDataSrc:sa,_fnAddColumn:Ga,_fnColumnOptions:la,_fnAdjustColumnSizing:U,_fnVisibleToColumnIndex:$,_fnColumnIndexToVisible:ba,_fnVisbleColumns:ca,_fnGetColumns:aa,_fnColumnTypes:Ia,_fnApplyColumnDefs:ib,_fnHungarianMap:Y,_fnCamelToHungarian:J,_fnLanguageCompat:Fa,_fnBrowserDetect:gb,_fnAddData:N,_fnAddTr:ma,_fnNodeToDataIndex:function(a,b){return b._DT_RowIndex!==k?b._DT_RowIndex:
        null},_fnNodeToColumnIndex:function(a,b,c){return h.inArray(c,a.aoData[b].anCells)},_fnGetCellData:B,_fnSetCellData:jb,_fnSplitObjNotation:La,_fnGetObjectDataFn:Q,_fnSetObjectDataFn:R,_fnGetDataMaster:Ma,_fnClearTable:na,_fnDeleteIndex:oa,_fnInvalidate:ea,_fnGetRowElements:Ka,_fnCreateTr:Ja,_fnBuildHead:kb,_fnDrawHead:ga,_fnDraw:O,_fnReDraw:T,_fnAddOptionsHtml:nb,_fnDetectHeader:fa,_fnGetUniqueThs:qa,_fnFeatureHtmlFilter:pb,_fnFilterComplete:ha,_fnFilterCustom:yb,_fnFilterColumn:xb,_fnFilter:wb,_fnFilterCreateSearch:Qa,
        _fnEscapeRegex:va,_fnFilterData:zb,_fnFeatureHtmlInfo:sb,_fnUpdateInfo:Cb,_fnInfoMacros:Db,_fnInitialise:ia,_fnInitComplete:ta,_fnLengthChange:Ra,_fnFeatureHtmlLength:ob,_fnFeatureHtmlPaginate:tb,_fnPageChange:Ta,_fnFeatureHtmlProcessing:qb,_fnProcessingDisplay:C,_fnFeatureHtmlTable:rb,_fnScrollDraw:Z,_fnApplyToChildren:I,_fnCalculateColumnWidths:Ha,_fnThrottle:ua,_fnConvertToWidth:Fb,_fnGetWidestNode:Gb,_fnGetMaxLenString:Hb,_fnStringToCss:w,_fnSortFlatten:W,_fnSort:mb,_fnSortAria:Jb,_fnSortListener:Va,
        _fnSortAttachListener:Oa,_fnSortingClasses:xa,_fnSortData:Ib,_fnSaveState:ya,_fnLoadState:Kb,_fnSettingsFromNode:za,_fnLog:K,_fnMap:F,_fnBindAction:Wa,_fnCallbackReg:z,_fnCallbackFire:v,_fnLengthOverflow:Sa,_fnRenderer:Pa,_fnDataSource:y,_fnRowAttributes:Na,_fnCalculateEnd:function(){}});h.fn.dataTable=m;m.$=h;h.fn.dataTableSettings=m.settings;h.fn.dataTableExt=m.ext;h.fn.DataTable=function(a){return h(this).dataTable(a).api()};h.each(m,function(a,b){h.fn.DataTable[a]=b});return h.fn.dataTable});


/* dataTables.bootstrap.js */
/*! DataTables Bootstrap 3 integration
 * ©2011-2015 SpryMedia Ltd - datatables.net/license
 */

/**
 * DataTables integration for Bootstrap 3. This requires Bootstrap 3 and
 * DataTables 1.10 or newer.
 *
 * This file sets the defaults and adds options to DataTables to style its
 * controls using Bootstrap. See http://datatables.net/manual/styling/bootstrap
 * for further information.
 */
(function( factory ){
    if ( typeof define === 'function' && define.amd ) {
        // AMD
        define( ['jquery', 'datatables.net'], function ( $ ) {
            return factory( $, window, document );
        } );
    }
    else if ( typeof exports === 'object' ) {
        // CommonJS
        module.exports = function (root, $) {
            if ( ! root ) {
                root = window;
            }

            if ( ! $ || ! $.fn.dataTable ) {
                // Require DataTables, which attaches to jQuery, including
                // jQuery if needed and have a $ property so we can access the
                // jQuery object that is used
                $ = require('datatables.net')(root, $).$;
            }

            return factory( $, root, root.document );
        };
    }
    else {
        // Browser
        factory( jQuery, window, document );
    }
}(function( $, window, document, undefined ) {
    'use strict';
    var DataTable = $.fn.dataTable;


    /* Set the defaults for DataTables initialisation */
    $.extend( true, DataTable.defaults, {
        dom:
        "<'row'<'col-sm-6'l><'col-sm-6'f>>" +
        "<'row'<'col-sm-12'tr>>" +
        "<'row'<'col-sm-5'i><'col-sm-7'p>>",
        renderer: 'bootstrap'
    } );


    /* Default class modification */
    $.extend( DataTable.ext.classes, {
        sWrapper:      "dataTables_wrapper form-inline dt-bootstrap",
        sFilterInput:  "form-control input-sm",
        sLengthSelect: "form-control input-sm",
        sProcessing:   "dataTables_processing panel panel-default"
    } );


    /* Bootstrap paging button renderer */
    DataTable.ext.renderer.pageButton.bootstrap = function ( settings, host, idx, buttons, page, pages ) {
        var api     = new DataTable.Api( settings );
        var classes = settings.oClasses;
        var lang    = settings.oLanguage.oPaginate;
        var aria = settings.oLanguage.oAria.paginate || {};
        var btnDisplay, btnClass, counter=0;

        var attach = function( container, buttons ) {
            var i, ien, node, button;
            var clickHandler = function ( e ) {
                e.preventDefault();
                if ( !$(e.currentTarget).hasClass('disabled') && api.page() != e.data.action ) {
                    api.page( e.data.action ).draw( 'page' );
                }
            };

            for ( i=0, ien=buttons.length ; i<ien ; i++ ) {
                button = buttons[i];

                if ( $.isArray( button ) ) {
                    attach( container, button );
                }
                else {
                    btnDisplay = '';
                    btnClass = '';

                    switch ( button ) {
                        case 'ellipsis':
                            btnDisplay = '&#x2026;';
                            btnClass = 'disabled';
                            break;

                        case 'first':
                            btnDisplay = lang.sFirst;
                            btnClass = button + (page > 0 ?
                                    '' : ' disabled');
                            break;

                        case 'previous':
                            btnDisplay = lang.sPrevious;
                            btnClass = button + (page > 0 ?
                                    '' : ' disabled');
                            break;

                        case 'next':
                            btnDisplay = lang.sNext;
                            btnClass = button + (page < pages-1 ?
                                    '' : ' disabled');
                            break;

                        case 'last':
                            btnDisplay = lang.sLast;
                            btnClass = button + (page < pages-1 ?
                                    '' : ' disabled');
                            break;

                        default:
                            btnDisplay = button + 1;
                            btnClass = page === button ?
                                'active' : '';
                            break;
                    }

                    if ( btnDisplay ) {
                        node = $('<li>', {
                            'class': classes.sPageButton+' '+btnClass,
                            'id': idx === 0 && typeof button === 'string' ?
                                settings.sTableId +'_'+ button :
                                null
                        } )
                            .append( $('<a>', {
                                    'href': '#',
                                    'aria-controls': settings.sTableId,
                                    'aria-label': aria[ button ],
                                    'data-dt-idx': counter,
                                    'tabindex': settings.iTabIndex
                                } )
                                    .html( btnDisplay )
                            )
                            .appendTo( container );

                        settings.oApi._fnBindAction(
                            node, {action: button}, clickHandler
                        );

                        counter++;
                    }
                }
            }
        };

        // IE9 throws an 'unknown error' if document.activeElement is used
        // inside an iframe or frame.
        var activeEl;

        try {
            // Because this approach is destroying and recreating the paging
            // elements, focus is lost on the select button which is bad for
            // accessibility. So we want to restore focus once the draw has
            // completed
            activeEl = $(host).find(document.activeElement).data('dt-idx');
        }
        catch (e) {}

        attach(
            $(host).empty().html('<ul class="pagination"/>').children('ul'),
            buttons
        );

        if ( activeEl ) {
            $(host).find( '[data-dt-idx='+activeEl+']' ).focus();
        }
    };


    /*
     * TableTools Bootstrap compatibility
     * Required TableTools 2.1+
     */
    if ( DataTable.TableTools ) {
        // Set the classes that TableTools uses to something suitable for Bootstrap
        $.extend( true, DataTable.TableTools.classes, {
            "container": "DTTT btn-group",
            "buttons": {
                "normal": "btn btn-default",
                "disabled": "disabled"
            },
            "collection": {
                "container": "DTTT_dropdown dropdown-menu",
                "buttons": {
                    "normal": "",
                    "disabled": "disabled"
                }
            },
            "print": {
                "info": "DTTT_print_info"
            },
            "select": {
                "row": "active"
            }
        } );

        // Have the collection use a bootstrap compatible drop down
        $.extend( true, DataTable.TableTools.DEFAULTS.oTags, {
            "collection": {
                "container": "ul",
                "button": "li",
                "liner": "a"
            }
        } );
    }


    return DataTable;
}));

/* dataTables.buttons.js */
/*! Buttons for DataTables 1.1.2
 * ©2015 SpryMedia Ltd - datatables.net/license
 */

(function( factory ){
    if ( typeof define === 'function' && define.amd ) {
        // AMD
        define( ['jquery', 'datatables.net'], function ( $ ) {
            return factory( $, window, document );
        } );
    }
    else if ( typeof exports === 'object' ) {
        // CommonJS
        module.exports = function (root, $) {
            if ( ! root ) {
                root = window;
            }

            if ( ! $ || ! $.fn.dataTable ) {
                $ = require('datatables.net')(root, $).$;
            }

            return factory( $, root, root.document );
        };
    }
    else {
        // Browser
        factory( jQuery, window, document );
    }
}(function( $, window, document, undefined ) {
    'use strict';
    var DataTable = $.fn.dataTable;


// Used for namespacing events added to the document by each instance, so they
// can be removed on destroy
    var _instCounter = 0;

// Button namespacing counter for namespacing events on individual buttons
    var _buttonCounter = 0;

    var _dtButtons = DataTable.ext.buttons;

    /**
     * [Buttons description]
     * @param {[type]}
     * @param {[type]}
     */
    var Buttons = function( dt, config )
    {
        // Allow a boolean true for defaults
        if ( config === true ) {
            config = {};
        }

        // For easy configuration of buttons an array can be given
        if ( $.isArray( config ) ) {
            config = { buttons: config };
        }

        this.c = $.extend( true, {}, Buttons.defaults, config );

        // Don't want a deep copy for the buttons
        if ( config.buttons ) {
            this.c.buttons = config.buttons;
        }

        this.s = {
            dt: new DataTable.Api( dt ),
            buttons: [],
            subButtons: [],
            listenKeys: '',
            namespace: 'dtb'+(_instCounter++)
        };

        this.dom = {
            container: $('<'+this.c.dom.container.tag+'/>')
                .addClass( this.c.dom.container.className )
        };

        this._constructor();
    };


    $.extend( Buttons.prototype, {
        /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
         * Public methods
         */

        /**
         * Get the action of a button
         * @param  {int|string} Button index
         * @return {function}
         *//**
         * Set the action of a button
         * @param  {int|string} Button index
         * @param  {function} Function to set
         * @return {Buttons} Self for chaining
         */
        action: function ( idx, action )
        {
            var button = this._indexToButton( idx ).conf;
            var dt = this.s.dt;

            if ( action === undefined ) {
                return button.action;
            }

            button.action = action;

            return this;
        },

        /**
         * Add an active class to the button to make to look active or get current
         * active state.
         * @param  {int|string} Button index
         * @param  {boolean} [flag] Enable / disable flag
         * @return {Buttons} Self for chaining or boolean for getter
         */
        active: function ( idx, flag ) {
            var button = this._indexToButton( idx );
            var klass = this.c.dom.button.active;

            if ( flag === undefined ) {
                return button.node.hasClass( klass );
            }

            button.node.toggleClass( klass, flag === undefined ? true : flag );

            return this;
        },

        /**
         * Add a new button
         * @param {int|string} Button index for where to insert the button
         * @param {object} Button configuration object, base string name or function
         * @return {Buttons} Self for chaining
         */
        add: function ( idx, config )
        {
            if ( typeof idx === 'string' && idx.indexOf('-') !== -1 ) {
                var idxs = idx.split('-');
                this.c.buttons[idxs[0]*1].buttons.splice( idxs[1]*1, 0, config );
            }
            else {
                this.c.buttons.splice( idx*1, 0, config );
            }

            this.dom.container.empty();
            this._buildButtons( this.c.buttons );

            return this;
        },

        /**
         * Get the container node for the buttons
         * @return {jQuery} Buttons node
         */
        container: function ()
        {
            return this.dom.container;
        },

        /**
         * Disable a button
         * @param  {int|string} Button index
         * @return {Buttons} Self for chaining
         */
        disable: function ( idx ) {
            var button = this._indexToButton( idx );
            button.node.addClass( this.c.dom.button.disabled );

            return this;
        },

        /**
         * Destroy the instance, cleaning up event handlers and removing DOM
         * elements
         * @return {Buttons} Self for chaining
         */
        destroy: function ()
        {
            // Key event listener
            $('body').off( 'keyup.'+this.s.namespace );

            // Individual button destroy (so they can remove their own events if
            // needed
            var buttons = this.s.buttons;
            var subButtons = this.s.subButtons;
            var i, ien, j, jen;

            for ( i=0, ien=buttons.length ; i<ien ; i++ ) {
                this.removePrep( i );

                for ( j=0, jen=subButtons[i].length ; j<jen ; j++ ) {
                    this.removePrep( i+'-'+j );
                }
            }

            this.removeCommit();

            // Container
            this.dom.container.remove();

            // Remove from the settings object collection
            var buttonInsts = this.s.dt.settings()[0];

            for ( i=0, ien=buttonInsts.length ; i<ien ; i++ ) {
                if ( buttonInsts.inst === this ) {
                    buttonInsts.splice( i, 1 );
                    break;
                }
            }

            return this;
        },

        /**
         * Enable / disable a button
         * @param  {int|string} Button index
         * @param  {boolean} [flag=true] Enable / disable flag
         * @return {Buttons} Self for chaining
         */
        enable: function ( idx, flag )
        {
            if ( flag === false ) {
                return this.disable( idx );
            }

            var button = this._indexToButton( idx );
            button.node.removeClass( this.c.dom.button.disabled );

            return this;
        },

        /**
         * Get the instance name for the button set selector
         * @return {string} Instance name
         */
        name: function ()
        {
            return this.c.name;
        },

        /**
         * Get a button's node
         * @param  {int|string} Button index
         * @return {jQuery} Button element
         */
        node: function ( idx )
        {
            var button = this._indexToButton( idx );
            return button.node;
        },

        /**
         * Tidy up any buttons that have been scheduled for removal. This is
         * required so multiple buttons can be removed without upsetting the button
         * indexes while removing them.
         * @param  {int|string} Button index
         * @return {Buttons} Self for chaining
         */
        removeCommit: function ()
        {
            var buttons = this.s.buttons;
            var subButtons = this.s.subButtons;
            var i, ien, j;

            for ( i=buttons.length-1 ; i>=0 ; i-- ) {
                if ( buttons[i] === null ) {
                    buttons.splice( i, 1 );
                    subButtons.splice( i, 1 );
                    this.c.buttons.splice( i, 1 );
                }
            }

            for ( i=0, ien=subButtons.length ; i<ien ; i++ ) {
                for ( j=subButtons[i].length-1 ; j>=0 ; j-- ) {
                    if ( subButtons[i][j] === null ) {
                        subButtons[i].splice( j, 1 );
                        this.c.buttons[i].buttons.splice( j, 1 );
                    }
                }
            }

            return this;
        },

        /**
         * Scheduled a button for removal. This is required so multiple buttons can
         * be removed without upsetting the button indexes while removing them.
         * @return {Buttons} Self for chaining
         */
        removePrep: function ( idx )
        {
            var button;
            var dt = this.s.dt;

            if ( typeof idx === 'number' || idx.indexOf('-') === -1 ) {
                // Top level button
                button = this.s.buttons[ idx*1 ];

                if ( button.conf.destroy ) {
                    button.conf.destroy.call( dt.button(idx), dt, button, button.conf );
                }

                button.node.remove();
                this._removeKey( button.conf );
                this.s.buttons[ idx*1 ] = null;
            }
            else {
                // Collection button
                var idxs = idx.split('-');
                button = this.s.subButtons[ idxs[0]*1 ][ idxs[1]*1 ];

                if ( button.conf.destroy ) {
                    button.conf.destroy.call( dt.button(idx), dt, button, button.conf );
                }

                button.node.remove();
                this._removeKey( button.conf );
                this.s.subButtons[ idxs[0]*1 ][ idxs[1]*1 ] = null;
            }

            return this;
        },

        /**
         * Get the text for a button
         * @param  {int|string} Button index
         * @return {string} Button text
         *//**
         * Set the text for a button
         * @param  {int|string|function} Button index
         * @param  {string} Text
         * @return {Buttons} Self for chaining
         */
        text: function ( idx, label )
        {
            var button = this._indexToButton( idx );
            var buttonLiner = this.c.dom.collection.buttonLiner;
            var linerTag = typeof idx === 'string' && idx.indexOf( '-' ) !== -1 && buttonLiner && buttonLiner.tag ?
                buttonLiner.tag :
                this.c.dom.buttonLiner.tag;
            var dt = this.s.dt;
            var text = function ( opt ) {
                return typeof opt === 'function' ?
                    opt( dt, button.node, button.conf ) :
                    opt;
            };

            if ( label === undefined ) {
                return text( button.conf.text );
            }

            button.conf.text = label;

            if ( linerTag ) {
                button.node.children( linerTag ).html( text(label) );
            }
            else {
                button.node.html( text(label) );
            }

            return this;
        },

        /**
         * Calculate button index from a node
         * @param  {node} Button node (_not_ a jQuery object)
         * @return {string} Index. Undefined if not found
         */
        toIndex: function ( node )
        {
            var i, ien, j, jen;
            var buttons = this.s.buttons;
            var subButtons = this.s.subButtons;

            // Loop the main buttons first
            for ( i=0, ien=buttons.length ; i<ien ; i++ ) {
                if ( buttons[i].node[0] === node ) {
                    return i+'';
                }
            }

            // Then the sub-buttons
            for ( i=0, ien=subButtons.length ; i<ien ; i++ ) {
                for ( j=0, jen=subButtons[i].length ; j<jen ; j++ ) {
                    if ( subButtons[i][j].node[0] === node ) {
                        return i+'-'+j;
                    }
                }
            }
        },


        /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
         * Constructor
         */

        /**
         * Buttons constructor
         * @private
         */
        _constructor: function ()
        {
            var that = this;
            var dt = this.s.dt;
            var dtSettings = dt.settings()[0];

            if ( ! dtSettings._buttons ) {
                dtSettings._buttons = [];
            }

            dtSettings._buttons.push( {
                inst: this,
                name: this.c.name
            } );

            this._buildButtons( this.c.buttons );

            dt.on( 'destroy', function () {
                that.destroy();
            } );

            // Global key event binding to listen for button keys
            $('body').on( 'keyup.'+this.s.namespace, function ( e ) {
                if ( ! document.activeElement || document.activeElement === document.body ) {
                    // SUse a string of characters for fast lookup of if we need to
                    // handle this
                    var character = String.fromCharCode(e.keyCode).toLowerCase();

                    if ( that.s.listenKeys.toLowerCase().indexOf( character ) !== -1 ) {
                        that._keypress( character, e );
                    }
                }
            } );
        },


        /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
         * Private methods
         */

        /**
         * Add a new button to the key press listener
         * @param {object} Resolved button configuration object
         * @private
         */
        _addKey: function ( conf )
        {
            if ( conf.key ) {
                this.s.listenKeys += $.isPlainObject( conf.key ) ?
                    conf.key.key :
                    conf.key;
            }
        },

        /**
         * Create buttons from an array of buttons
         * @param  {array} Buttons to create
         * @param  {jQuery} Container node into which the created button should be
         *   inserted.
         * @param  {int} Counter for sub-buttons to be stored in a collection
         * @private
         */
        _buildButtons: function ( buttons, container, collectionCounter )
        {
            var dt = this.s.dt;
            var buttonCounter = 0;

            if ( ! container ) {
                container = this.dom.container;
                this.s.buttons = [];
                this.s.subButtons = [];
            }

            for ( var i=0, ien=buttons.length ; i<ien ; i++ ) {
                var conf = this._resolveExtends( buttons[i] );

                if ( ! conf ) {
                    continue;
                }

                // If the configuration is an array, then expand the buttons at this
                // point
                if ( $.isArray( conf ) ) {
                    this._buildButtons( conf, container, collectionCounter );
                    continue;
                }

                var button = this._buildButton(
                    conf,
                    collectionCounter!==undefined ? true : false
                );

                if ( ! button ) {
                    continue;
                }

                var buttonNode = button.node;
                container.append( button.inserter );

                if ( collectionCounter === undefined ) {
                    this.s.buttons.push( {
                        node:     buttonNode,
                        conf:     conf,
                        inserter: button.inserter
                    } );
                    this.s.subButtons.push( [] );
                }
                else {
                    this.s.subButtons[ collectionCounter ].push( {
                        node:     buttonNode,
                        conf:     conf,
                        inserter: button.inserter
                    } );
                }

                if ( conf.buttons ) {
                    var collectionDom = this.c.dom.collection;
                    conf._collection = $('<'+collectionDom.tag+'/>')
                        .addClass( collectionDom.className );

                    this._buildButtons( conf.buttons, conf._collection, buttonCounter );
                }

                // init call is made here, rather than buildButton as it needs to
                // have been added to the buttons / subButtons array first
                if ( conf.init ) {
                    conf.init.call( dt.button( buttonNode ), dt, buttonNode, conf );
                }

                buttonCounter++;
            }
        },

        /**
         * Create an individual button
         * @param  {object} config            Resolved button configuration
         * @param  {boolean} collectionButton `true` if a collection button
         * @return {jQuery} Created button node (jQuery)
         * @private
         */
        _buildButton: function ( config, collectionButton )
        {
            var that = this;
            var buttonDom = this.c.dom.button;
            var linerDom = this.c.dom.buttonLiner;
            var collectionDom = this.c.dom.collection;
            var dt = this.s.dt;
            var text = function ( opt ) {
                return typeof opt === 'function' ?
                    opt( dt, button, config ) :
                    opt;
            };

            if ( collectionButton && collectionDom.button ) {
                buttonDom = collectionDom.button;
            }

            if ( collectionButton && collectionDom.buttonLiner ) {
                linerDom = collectionDom.buttonLiner;
            }

            // Make sure that the button is available based on whatever requirements
            // it has. For example, Flash buttons require Flash
            if ( config.available && ! config.available( dt, config ) ) {
                return false;
            }

            var action = function ( e, dt, button, config ) {
                config.action.call( dt.button( button ), e, dt, button, config );

                $(dt.table().node()).triggerHandler( 'buttons-action.dt', [
                    dt.button( button ), dt, button, config
                ] );
            };

            var button = $('<'+buttonDom.tag+'/>')
                .addClass( buttonDom.className )
                .attr( 'tabindex', this.s.dt.settings()[0].iTabIndex )
                .attr( 'aria-controls', this.s.dt.table().node().id )
                .on( 'click.dtb', function (e) {
                    e.preventDefault();

                    if ( ! button.hasClass( buttonDom.disabled ) && config.action ) {
                        action( e, dt, button, config );
                    }

                    button.blur();
                } )
                .on( 'keyup.dtb', function (e) {
                    if ( e.keyCode === 13 ) {
                        if ( ! button.hasClass( buttonDom.disabled ) && config.action ) {
                            action( e, dt, button, config );
                        }
                    }
                } );

            if ( linerDom.tag ) {
                button.append(
                    $('<'+linerDom.tag+'/>')
                        .html( text( config.text ) )
                        .addClass( linerDom.className )
                );
            }
            else {
                button.html( text( config.text ) );
            }

            if ( config.enabled === false ) {
                button.addClass( buttonDom.disabled );
            }

            if ( config.className ) {
                button.addClass( config.className );
            }

            if ( config.titleAttr ) {
                button.attr( 'title', config.titleAttr );
            }

            if ( ! config.namespace ) {
                config.namespace = '.dt-button-'+(_buttonCounter++);
            }

            var buttonContainer = this.c.dom.buttonContainer;
            var inserter;
            if ( buttonContainer && buttonContainer.tag ) {
                inserter = $('<'+buttonContainer.tag+'/>')
                    .addClass( buttonContainer.className )
                    .append( button );
            }
            else {
                inserter = button;
            }

            this._addKey( config );

            return {
                node: button,
                inserter: inserter
            };
        },

        /**
         * Get a button's host information from a button index
         * @param  {int|string} Button index
         * @return {object} Button information - object contains `node` and `conf`
         *   properties
         * @private
         */
        _indexToButton: function ( idx )
        {
            if ( typeof idx === 'number' || idx.indexOf('-') === -1 ) {
                return this.s.buttons[ idx*1 ];
            }

            var idxs = idx.split('-');
            return this.s.subButtons[ idxs[0]*1 ][ idxs[1]*1 ];
        },

        /**
         * Handle a key press - determine if any button's key configured matches
         * what was typed and trigger the action if so.
         * @param  {string} The character pressed
         * @param  {object} Key event that triggered this call
         * @private
         */
        _keypress: function ( character, e )
        {
            var i, ien, j, jen;
            var buttons = this.s.buttons;
            var subButtons = this.s.subButtons;
            var run = function ( conf, node ) {
                if ( ! conf.key ) {
                    return;
                }

                if ( conf.key === character ) {
                    node.click();
                }
                else if ( $.isPlainObject( conf.key ) ) {
                    if ( conf.key.key !== character ) {
                        return;
                    }

                    if ( conf.key.shiftKey && ! e.shiftKey ) {
                        return;
                    }

                    if ( conf.key.altKey && ! e.altKey ) {
                        return;
                    }

                    if ( conf.key.ctrlKey && ! e.ctrlKey ) {
                        return;
                    }

                    if ( conf.key.metaKey && ! e.metaKey ) {
                        return;
                    }

                    // Made it this far - it is good
                    node.click();
                }
            };

            // Loop the main buttons first
            for ( i=0, ien=buttons.length ; i<ien ; i++ ) {
                run( buttons[i].conf, buttons[i].node );
            }

            // Then the sub-buttons
            for ( i=0, ien=subButtons.length ; i<ien ; i++ ) {
                for ( j=0, jen=subButtons[i].length ; j<jen ; j++ ) {
                    run( subButtons[i][j].conf, subButtons[i][j].node );
                }
            }
        },

        /**
         * Remove a key from the key listener for this instance (to be used when a
         * button is removed)
         * @param  {object} Button configuration
         */
        _removeKey: function ( conf )
        {
            if ( conf.key ) {
                var character = $.isPlainObject( conf.key ) ?
                    conf.key.key :
                    conf.key;

                // Remove only one character, as multiple buttons could have the
                // same listening key
                var a = this.s.listenKeys.split('');
                var idx = $.inArray( character, a );
                a.splice( idx, 1 );
                this.s.listenKeys = a.join('');
            }
        },

        /**
         * Resolve a button configuration
         * @param  {string|function|object} Button config to resolve
         * @return {object} Button configuration
         */
        _resolveExtends: function ( conf )
        {
            var dt = this.s.dt;
            var i, ien;
            var toConfObject = function ( base ) {
                var loop = 0;

                // Loop until we have resolved to a button configuration, or an
                // array of button configurations (which will be iterated
                // separately)
                while ( ! $.isPlainObject(base) && ! $.isArray(base) ) {
                    if ( base === undefined ) {
                        return;
                    }

                    if ( typeof base === 'function' ) {
                        base = base( dt, conf );

                        if ( ! base ) {
                            return false;
                        }
                    }
                    else if ( typeof base === 'string' ) {
                        if ( ! _dtButtons[ base ] ) {
                            throw 'Unknown button type: '+base;
                        }

                        base = _dtButtons[ base ];
                    }

                    loop++;
                    if ( loop > 30 ) {
                        // Protect against misconfiguration killing the browser
                        throw 'Buttons: Too many iterations';
                    }
                }

                return $.isArray( base ) ?
                    base :
                    $.extend( {}, base );
            };

            conf = toConfObject( conf );

            while ( conf && conf.extend ) {
                // Use `toConfObject` in case the button definition being extended
                // is itself a string or a function
                if ( ! _dtButtons[ conf.extend ] ) {
                    throw 'Cannot extend unknown button type: '+conf.extend;
                }

                var objArray = toConfObject( _dtButtons[ conf.extend ] );
                if ( $.isArray( objArray ) ) {
                    return objArray;
                }
                else if ( ! objArray ) {
                    // This is a little brutal as it might be possible to have a
                    // valid button without the extend, but if there is no extend
                    // then the host button would be acting in an undefined state
                    return false;
                }

                // Stash the current class name
                var originalClassName = objArray.className;

                conf = $.extend( {}, objArray, conf );

                // The extend will have overwritten the original class name if the
                // `conf` object also assigned a class, but we want to concatenate
                // them so they are list that is combined from all extended buttons
                if ( originalClassName && conf.className !== originalClassName ) {
                    conf.className = originalClassName+' '+conf.className;
                }

                // Buttons to be added to a collection  -gives the ability to define
                // if buttons should be added to the start or end of a collection
                var postfixButtons = conf.postfixButtons;
                if ( postfixButtons ) {
                    if ( ! conf.buttons ) {
                        conf.buttons = [];
                    }

                    for ( i=0, ien=postfixButtons.length ; i<ien ; i++ ) {
                        conf.buttons.push( postfixButtons[i] );
                    }

                    conf.postfixButtons = null;
                }

                var prefixButtons = conf.prefixButtons;
                if ( prefixButtons ) {
                    if ( ! conf.buttons ) {
                        conf.buttons = [];
                    }

                    for ( i=0, ien=prefixButtons.length ; i<ien ; i++ ) {
                        conf.buttons.splice( i, 0, prefixButtons[i] );
                    }

                    conf.prefixButtons = null;
                }

                // Although we want the `conf` object to overwrite almost all of
                // the properties of the object being extended, the `extend`
                // property should come from the object being extended
                conf.extend = objArray.extend;
            }

            return conf;
        }
    } );



    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * Statics
     */

    /**
     * Show / hide a background layer behind a collection
     * @param  {boolean} Flag to indicate if the background should be shown or
     *   hidden
     * @param  {string} Class to assign to the background
     * @static
     */
    Buttons.background = function ( show, className, fade ) {
        if ( fade === undefined ) {
            fade = 400;
        }

        if ( show ) {
            $('<div/>')
                .addClass( className )
                .css( 'display', 'none' )
                .appendTo( 'body' )
                .fadeIn( fade );
        }
        else {
            $('body > div.'+className)
                .fadeOut( fade, function () {
                    $(this).remove();
                } );
        }
    };

    /**
     * Instance selector - select Buttons instances based on an instance selector
     * value from the buttons assigned to a DataTable. This is only useful if
     * multiple instances are attached to a DataTable.
     * @param  {string|int|array} Instance selector - see `instance-selector`
     *   documentation on the DataTables site
     * @param  {array} Button instance array that was attached to the DataTables
     *   settings object
     * @return {array} Buttons instances
     * @static
     */
    Buttons.instanceSelector = function ( group, buttons )
    {
        if ( ! group ) {
            return $.map( buttons, function ( v ) {
                return v.inst;
            } );
        }

        var ret = [];
        var names = $.map( buttons, function ( v ) {
            return v.name;
        } );

        // Flatten the group selector into an array of single options
        var process = function ( input ) {
            if ( $.isArray( input ) ) {
                for ( var i=0, ien=input.length ; i<ien ; i++ ) {
                    process( input[i] );
                }
                return;
            }

            if ( typeof input === 'string' ) {
                if ( input.indexOf( ',' ) !== -1 ) {
                    // String selector, list of names
                    process( input.split(',') );
                }
                else {
                    // String selector individual name
                    var idx = $.inArray( $.trim(input), names );

                    if ( idx !== -1 ) {
                        ret.push( buttons[ idx ].inst );
                    }
                }
            }
            else if ( typeof input === 'number' ) {
                // Index selector
                ret.push( buttons[ input ].inst );
            }
        };

        process( group );

        return ret;
    };

    /**
     * Button selector - select one or more buttons from a selector input so some
     * operation can be performed on them.
     * @param  {array} Button instances array that the selector should operate on
     * @param  {string|int|node|jQuery|array} Button selector - see
     *   `button-selector` documentation on the DataTables site
     * @return {array} Array of objects containing `inst` and `idx` properties of
     *   the selected buttons so you know which instance each button belongs to.
     * @static
     */
    Buttons.buttonSelector = function ( insts, selector )
    {
        var ret = [];
        var run = function ( selector, inst ) {
            var i, ien, j, jen;
            var buttons = [];

            $.each( inst.s.buttons, function (i, v) {
                if ( v !== null ) {
                    buttons.push( {
                        node: v.node[0],
                        name: v.conf.name
                    } );
                }
            } );

            $.each( inst.s.subButtons, function (i, v) {
                $.each( v, function (j, w) {
                    if ( w !== null ) {
                        buttons.push( {
                            node: w.node[0],
                            name: w.conf.name
                        } );
                    }
                } );
            } );

            var nodes = $.map( buttons, function (v) {
                return v.node;
            } );

            if ( $.isArray( selector ) || selector instanceof $ ) {
                for ( i=0, ien=selector.length ; i<ien ; i++ ) {
                    run( selector[i], inst );
                }
                return;
            }

            if ( selector === null || selector === undefined || selector === '*' ) {
                // Select all
                for ( i=0, ien=buttons.length ; i<ien ; i++ ) {
                    ret.push( {
                        inst: inst,
                        idx: inst.toIndex( buttons[i].node )
                    } );
                }
            }
            else if ( typeof selector === 'number' ) {
                // Main button index selector
                ret.push( {
                    inst: inst,
                    idx: selector
                } );
            }
            else if ( typeof selector === 'string' ) {
                if ( selector.indexOf( ',' ) !== -1 ) {
                    // Split
                    var a = selector.split(',');

                    for ( i=0, ien=a.length ; i<ien ; i++ ) {
                        run( $.trim(a[i]), inst );
                    }
                }
                else if ( selector.match( /^\d+(\-\d+)?$/ ) ) {
                    // Sub-button index selector
                    ret.push( {
                        inst: inst,
                        idx: selector
                    } );
                }
                else if ( selector.indexOf( ':name' ) !== -1 ) {
                    // Button name selector
                    var name = selector.replace( ':name', '' );

                    for ( i=0, ien=buttons.length ; i<ien ; i++ ) {
                        if ( buttons[i].name === name ) {
                            ret.push( {
                                inst: inst,
                                idx: inst.toIndex( buttons[i].node )
                            } );
                        }
                    }
                }
                else {
                    // jQuery selector on the nodes
                    $( nodes ).filter( selector ).each( function () {
                        ret.push( {
                            inst: inst,
                            idx: inst.toIndex( this )
                        } );
                    } );
                }
            }
            else if ( typeof selector === 'object' && selector.nodeName ) {
                // Node selector
                var idx = $.inArray( selector, nodes );

                if ( idx !== -1 ) {
                    ret.push( {
                        inst: inst,
                        idx: inst.toIndex( nodes[ idx ] )
                    } );
                }
            }
        };


        for ( var i=0, ien=insts.length ; i<ien ; i++ ) {
            var inst = insts[i];

            run( selector, inst );
        }

        return ret;
    };


    /**
     * Buttons defaults. For full documentation, please refer to the docs/option
     * directory or the DataTables site.
     * @type {Object}
     * @static
     */
    Buttons.defaults = {
        buttons: [ 'copy', 'excel', 'csv', 'pdf', 'print' ],
        name: 'main',
        tabIndex: 0,
        dom: {
            container: {
                tag: 'div',
                className: 'dt-buttons'
            },
            collection: {
                tag: 'div',
                className: 'dt-button-collection'
            },
            button: {
                tag: 'a',
                className: 'dt-button',
                active: 'active',
                disabled: 'disabled'
            },
            buttonLiner: {
                tag: 'span',
                className: ''
            }
        }
    };

    /**
     * Version information
     * @type {string}
     * @static
     */
    Buttons.version = '1.1.2';


    $.extend( _dtButtons, {
        collection: {
            text: function ( dt, button, config ) {
                return dt.i18n( 'buttons.collection', 'Collection' );
            },
            className: 'buttons-collection',
            action: function ( e, dt, button, config ) {
                var background;
                var host = button;
                var hostOffset = host.offset();
                var tableContainer = $( dt.table().container() );
                var multiLevel = false;

                // Remove any old collection
                if ( $('div.dt-button-background').length ) {
                    multiLevel = $('div.dt-button-collection').offset();
                    $(document).trigger( 'click.dtb-collection' );
                }

                config._collection
                    .addClass( config.collectionLayout )
                    .css( 'display', 'none' )
                    .appendTo( 'body' )
                    .fadeIn( config.fade );

                var position = config._collection.css( 'position' );

                if ( multiLevel && position === 'absolute' ) {
                    config._collection.css( {
                        top: multiLevel.top + 5, // magic numbers for a little offset
                        left: multiLevel.left + 5
                    } );
                }
                else if ( position === 'absolute' ) {
                    config._collection.css( {
                        top: hostOffset.top + host.outerHeight(),
                        left: hostOffset.left
                    } );

                    var listRight = hostOffset.left + config._collection.outerWidth();
                    var tableRight = tableContainer.offset().left + tableContainer.width();
                    if ( listRight > tableRight ) {
                        config._collection.css( 'left', hostOffset.left - ( listRight - tableRight ) );
                    }
                }
                else {
                    // Fix position - centre on screen
                    var top = config._collection.height() / 2;
                    if ( top > $(window).height() / 2 ) {
                        top = $(window).height() / 2;
                    }

                    config._collection.css( 'marginTop', top*-1 );
                }

                if ( config.background ) {
                    Buttons.background( true, config.backgroundClassName, config.fade );
                }

                // Need to break the 'thread' for the collection button being
                // activated by a click - it would also trigger this event
                setTimeout( function () {
                    // This is bonkers, but if we don't have a click listener on the
                    // background element, iOS Safari will ignore the body click
                    // listener below. An empty function here is all that is
                    // required to make it work...
                    $('div.dt-button-background').on( 'click.dtb-collection', function () {} );

                    $('body').on( 'click.dtb-collection', function (e) {
                        if ( ! $(e.target).parents().andSelf().filter( config._collection ).length ) {
                            config._collection
                                .fadeOut( config.fade, function () {
                                    config._collection.detach();
                                } );

                            $('div.dt-button-background').off( 'click.dtb-collection' );
                            Buttons.background( false, config.backgroundClassName, config.fade );

                            $('body').off( 'click.dtb-collection' );
                            dt.off( 'buttons-action.b-internal' );
                        }
                    } );
                }, 10 );

                if ( config.autoClose ) {
                    dt.on( 'buttons-action.b-internal', function () {
                        $('div.dt-button-background').click();
                    } );
                }
            },
            background: true,
            collectionLayout: '',
            backgroundClassName: 'dt-button-background',
            autoClose: false,
            fade: 400
        },
        copy: function ( dt, conf ) {
            if ( _dtButtons.copyHtml5 ) {
                return 'copyHtml5';
            }
            if ( _dtButtons.copyFlash && _dtButtons.copyFlash.available( dt, conf ) ) {
                return 'copyFlash';
            }
        },
        csv: function ( dt, conf ) {
            // Common option that will use the HTML5 or Flash export buttons
            if ( _dtButtons.csvHtml5 && _dtButtons.csvHtml5.available( dt, conf ) ) {
                return 'csvHtml5';
            }
            if ( _dtButtons.csvFlash && _dtButtons.csvFlash.available( dt, conf ) ) {
                return 'csvFlash';
            }
        },
        excel: function ( dt, conf ) {
            // Common option that will use the HTML5 or Flash export buttons
            if ( _dtButtons.excelHtml5 && _dtButtons.excelHtml5.available( dt, conf ) ) {
                return 'excelHtml5';
            }
            if ( _dtButtons.excelFlash && _dtButtons.excelFlash.available( dt, conf ) ) {
                return 'excelFlash';
            }
        },
        pdf: function ( dt, conf ) {
            // Common option that will use the HTML5 or Flash export buttons
            if ( _dtButtons.pdfHtml5 && _dtButtons.pdfHtml5.available( dt, conf ) ) {
                return 'pdfHtml5';
            }
            if ( _dtButtons.pdfFlash && _dtButtons.pdfFlash.available( dt, conf ) ) {
                return 'pdfFlash';
            }
        },
        pageLength: function ( dt, conf ) {
            var lengthMenu = dt.settings()[0].aLengthMenu;
            var vals = $.isArray( lengthMenu[0] ) ? lengthMenu[0] : lengthMenu;
            var lang = $.isArray( lengthMenu[0] ) ? lengthMenu[1] : lengthMenu;
            var text = function ( dt ) {
                return dt.i18n( 'buttons.pageLength', {
                    "-1": 'Show all rows',
                    _:    'Show %d rows'
                }, dt.page.len() );
            };

            return {
                extend: 'collection',
                text: text,
                className: 'buttons-page-length',
                autoClose: true,
                buttons: $.map( vals, function ( val, i ) {
                    return {
                        text: lang[i],
                        action: function ( e, dt, button, conf ) {
                            dt.page.len( val ).draw();
                        },
                        init: function ( dt, node, conf ) {
                            var that = this;
                            var fn = function () {
                                that.active( dt.page.len() === val );
                            };

                            dt.on( 'length.dt'+conf.namespace, fn );
                            fn();
                        },
                        destroy: function ( dt, node, conf ) {
                            dt.off( 'length.dt'+conf.namespace );
                        }
                    };
                } ),
                init: function ( dt, node, conf ) {
                    var that = this;
                    dt.on( 'length.dt'+conf.namespace, function () {
                        that.text( text( dt ) );
                    } );
                },
                destroy: function ( dt, node, conf ) {
                    dt.off( 'length.dt'+conf.namespace );
                }
            };
        }
    } );


    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * DataTables API
     *
     * For complete documentation, please refer to the docs/api directory or the
     * DataTables site
     */

// Buttons group and individual button selector
    DataTable.Api.register( 'buttons()', function ( group, selector ) {
        // Argument shifting
        if ( selector === undefined ) {
            selector = group;
            group = undefined;
        }

        return this.iterator( true, 'table', function ( ctx ) {
            if ( ctx._buttons ) {
                return Buttons.buttonSelector(
                    Buttons.instanceSelector( group, ctx._buttons ),
                    selector
                );
            }
        }, true );
    } );

// Individual button selector
    DataTable.Api.register( 'button()', function ( group, selector ) {
        // just run buttons() and truncate
        var buttons = this.buttons( group, selector );

        if ( buttons.length > 1 ) {
            buttons.splice( 1, buttons.length );
        }

        return buttons;
    } );

// Active buttons
    DataTable.Api.registerPlural( 'buttons().active()', 'button().active()', function ( flag ) {
        if ( flag === undefined ) {
            return this.map( function ( set ) {
                return set.inst.active( set.idx );
            } );
        }

        return this.each( function ( set ) {
            set.inst.active( set.idx, flag );
        } );
    } );

// Get / set button action
    DataTable.Api.registerPlural( 'buttons().action()', 'button().action()', function ( action ) {
        if ( action === undefined ) {
            return this.map( function ( set ) {
                return set.inst.action( set.idx );
            } );
        }

        return this.each( function ( set ) {
            set.inst.action( set.idx, action );
        } );
    } );

// Enable / disable buttons
    DataTable.Api.register( ['buttons().enable()', 'button().enable()'], function ( flag ) {
        return this.each( function ( set ) {
            set.inst.enable( set.idx, flag );
        } );
    } );

// Disable buttons
    DataTable.Api.register( ['buttons().disable()', 'button().disable()'], function () {
        return this.each( function ( set ) {
            set.inst.disable( set.idx );
        } );
    } );

// Get button nodes
    DataTable.Api.registerPlural( 'buttons().nodes()', 'button().node()', function () {
        var jq = $();

        // jQuery will automatically reduce duplicates to a single entry
        $( this.each( function ( set ) {
            jq = jq.add( set.inst.node( set.idx ) );
        } ) );

        return jq;
    } );

// Get / set button text (i.e. the button labels)
    DataTable.Api.registerPlural( 'buttons().text()', 'button().text()', function ( label ) {
        if ( label === undefined ) {
            return this.map( function ( set ) {
                return set.inst.text( set.idx );
            } );
        }

        return this.each( function ( set ) {
            set.inst.text( set.idx, label );
        } );
    } );

// Trigger a button's action
    DataTable.Api.registerPlural( 'buttons().trigger()', 'button().trigger()', function () {
        return this.each( function ( set ) {
            set.inst.node( set.idx ).trigger( 'click' );
        } );
    } );

// Get the container elements for the button sets selected
    DataTable.Api.registerPlural( 'buttons().containers()', 'buttons().container()', function () {
        var jq = $();

        // jQuery will automatically reduce duplicates to a single entry
        $( this.each( function ( set ) {
            jq = jq.add( set.inst.container() );
        } ) );

        return jq;
    } );

// Add a new button
    DataTable.Api.register( 'button().add()', function ( idx, conf ) {
        if ( this.length === 1 ) {
            this[0].inst.add( idx, conf );
        }

        return this.button( idx );
    } );

// Destroy the button sets selected
    DataTable.Api.register( 'buttons().destroy()', function ( idx ) {
        this.pluck( 'inst' ).unique().each( function ( inst ) {
            inst.destroy();
        } );

        return this;
    } );

// Remove a button
    DataTable.Api.registerPlural( 'buttons().remove()', 'buttons().remove()', function () {
        // Need to split into prep and commit so the indexes remain constant during the remove
        this.each( function ( set ) {
            set.inst.removePrep( set.idx );
        } );

        this.pluck( 'inst' ).unique().each( function ( inst ) {
            inst.removeCommit();
        } );

        return this;
    } );

// Information box that can be used by buttons
    var _infoTimer;
    DataTable.Api.register( 'buttons.info()', function ( title, message, time ) {
        var that = this;

        if ( title === false ) {
            $('#datatables_buttons_info').fadeOut( function () {
                $(this).remove();
            } );
            clearTimeout( _infoTimer );
            _infoTimer = null;

            return this;
        }

        if ( _infoTimer ) {
            clearTimeout( _infoTimer );
        }

        if ( $('#datatables_buttons_info').length ) {
            $('#datatables_buttons_info').remove();
        }

        title = title ? '<h2>'+title+'</h2>' : '';

        $('<div id="datatables_buttons_info" class="dt-button-info"/>')
            .html( title )
            .append( $('<div/>')[ typeof message === 'string' ? 'html' : 'append' ]( message ) )
            .css( 'display', 'none' )
            .appendTo( 'body' )
            .fadeIn();

        if ( time !== undefined && time !== 0 ) {
            _infoTimer = setTimeout( function () {
                that.buttons.info( false );
            }, time );
        }

        return this;
    } );

// Get data from the table for export - this is common to a number of plug-in
// buttons so it is included in the Buttons core library
    DataTable.Api.register( 'buttons.exportData()', function ( options ) {
        if ( this.context.length ) {
            return _exportData( new DataTable.Api( this.context[0] ), options );
        }
    } );


    var _exportTextarea = $('<textarea/>')[0];
    var _exportData = function ( dt, inOpts )
    {
        var config = $.extend( true, {}, {
            rows:           null,
            columns:        '',
            modifier:       {
                search: 'applied',
                order:  'applied'
            },
            orthogonal:     'display',
            stripHtml:      true,
            stripNewlines:  true,
            decodeEntities: true,
            trim:           true,
            format:         {
                header: function ( d ) {
                    return strip( d );
                },
                footer: function ( d ) {
                    return strip( d );
                },
                body: function ( d ) {
                    return strip( d );
                }
            }
        }, inOpts );

        var strip = function ( str ) {
            if ( typeof str !== 'string' ) {
                return str;
            }

            if ( config.stripHtml ) {
                str = str.replace( /<.*?>/g, '' );
            }

            if ( config.trim ) {
                str = str.replace( /^\s+|\s+$/g, '' );
            }

            if ( config.stripNewlines ) {
                str = str.replace( /\n/g, ' ' );
            }

            if ( config.decodeEntities ) {
                _exportTextarea.innerHTML = str;
                str = _exportTextarea.value;
            }

            return str;
        };


        var header = dt.columns( config.columns ).indexes().map( function (idx, i) {
            return config.format.header( dt.column( idx ).header().innerHTML, idx );
        } ).toArray();

        var footer = dt.table().footer() ?
            dt.columns( config.columns ).indexes().map( function (idx, i) {
                var el = dt.column( idx ).footer();
                return config.format.footer( el ? el.innerHTML : '', idx );
            } ).toArray() :
            null;

        var rowIndexes = dt.rows( config.rows, config.modifier ).indexes().toArray();
        var cells = dt
            .cells( rowIndexes, config.columns )
            .render( config.orthogonal )
            .toArray();
        var columns = header.length;
        var rows = columns > 0 ? cells.length / columns : 0;
        var body = new Array( rows );
        var cellCounter = 0;

        for ( var i=0, ien=rows ; i<ien ; i++ ) {
            var row = new Array( columns );

            for ( var j=0 ; j<columns ; j++ ) {
                row[j] = config.format.body( cells[ cellCounter ], j, i );
                cellCounter++;
            }

            body[i] = row;
        }

        return {
            header: header,
            footer: footer,
            body:   body
        };
    };


    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * DataTables interface
     */

// Attach to DataTables objects for global access
    $.fn.dataTable.Buttons = Buttons;
    $.fn.DataTable.Buttons = Buttons;



// DataTables creation - check if the buttons have been defined for this table,
// they will have been if the `B` option was used in `dom`, otherwise we should
// create the buttons instance here so they can be inserted into the document
// using the API. Listen for `init` for compatibility with pre 1.10.10, but to
// be removed in future.
    $(document).on( 'init.dt plugin-init.dt', function (e, settings, json) {
        if ( e.namespace !== 'dt' ) {
            return;
        }

        var opts = settings.oInit.buttons || DataTable.defaults.buttons;

        if ( opts && ! settings._buttons ) {
            new Buttons( settings, opts ).container();
        }
    } );

// DataTables `dom` feature option
    DataTable.ext.feature.push( {
        fnInit: function( settings ) {
            var api = new DataTable.Api( settings );
            var opts = api.init().buttons || DataTable.defaults.buttons;

            return new Buttons( api, opts ).container();
        },
        cFeature: "B"
    } );


    return Buttons;
}));

/* buttons.bootstrap.js */
/*! Bootstrap integration for DataTables' Buttons
 * ©2015 SpryMedia Ltd - datatables.net/license
 */

(function( factory ){
    if ( typeof define === 'function' && define.amd ) {
        // AMD
        define( ['jquery', 'datatables.net-bs', 'datatables.net-buttons'], function ( $ ) {
            return factory( $, window, document );
        } );
    }
    else if ( typeof exports === 'object' ) {
        // CommonJS
        module.exports = function (root, $) {
            if ( ! root ) {
                root = window;
            }

            if ( ! $ || ! $.fn.dataTable ) {
                $ = require('datatables.net-bs')(root, $).$;
            }

            if ( ! $.fn.dataTable.Buttons ) {
                require('datatables.net-buttons')(root, $);
            }

            return factory( $, root, root.document );
        };
    }
    else {
        // Browser
        factory( jQuery, window, document );
    }
}(function( $, window, document, undefined ) {
    'use strict';
    var DataTable = $.fn.dataTable;


    $.extend( true, DataTable.Buttons.defaults, {
        dom: {
            container: {
                className: 'dt-buttons btn-group'
            },
            button: {
                className: 'btn btn-default'
            },
            collection: {
                tag: 'ul',
                className: 'dt-button-collection dropdown-menu',
                button: {
                    tag: 'li',
                    className: 'dt-button'
                },
                buttonLiner: {
                    tag: 'a',
                    className: ''
                }
            }
        }
    } );

    DataTable.ext.buttons.collection.text = function ( dt ) {
        return dt.i18n('buttons.collection', 'Collection <span class="caret"/>');
    };


    return DataTable.Buttons;
}));

/* buttons.html5.js */
/*!
 * HTML5 export buttons for Buttons and DataTables.
 * 2015 SpryMedia Ltd - datatables.net/license
 *
 * FileSaver.js (2015-05-07.2) - MIT license
 * Copyright © 2015 Eli Grey - http://eligrey.com
 */

(function( factory ){
    if ( typeof define === 'function' && define.amd ) {
        // AMD
        define( ['jquery', 'datatables.net', 'datatables.net-buttons'], function ( $ ) {
            return factory( $, window, document );
        } );
    }
    else if ( typeof exports === 'object' ) {
        // CommonJS
        module.exports = function (root, $) {
            if ( ! root ) {
                root = window;
            }

            if ( ! $ || ! $.fn.dataTable ) {
                $ = require('datatables.net')(root, $).$;
            }

            if ( ! $.fn.dataTable.Buttons ) {
                require('datatables.net-buttons')(root, $);
            }

            return factory( $, root, root.document );
        };
    }
    else {
        // Browser
        factory( jQuery, window, document );
    }
}(function( $, window, document, undefined ) {
    'use strict';
    var DataTable = $.fn.dataTable;


    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * FileSaver.js dependency
     */

    /*jslint bitwise: true, indent: 4, laxbreak: true, laxcomma: true, smarttabs: true, plusplus: true */

    var _saveAs = (function(view) {
        // IE <10 is explicitly unsupported
        if (typeof navigator !== "undefined" && /MSIE [1-9]\./.test(navigator.userAgent)) {
            return;
        }
        var
            doc = view.document
            // only get URL when necessary in case Blob.js hasn't overridden it yet
            , get_URL = function() {
                return view.URL || view.webkitURL || view;
            }
            , save_link = doc.createElementNS("http://www.w3.org/1999/xhtml", "a")
            , can_use_save_link = "download" in save_link
            , click = function(node) {
                var event = doc.createEvent("MouseEvents");
                event.initMouseEvent(
                    "click", true, false, view, 0, 0, 0, 0, 0
                    , false, false, false, false, 0, null
                );
                node.dispatchEvent(event);
            }
            , webkit_req_fs = view.webkitRequestFileSystem
            , req_fs = view.requestFileSystem || webkit_req_fs || view.mozRequestFileSystem
            , throw_outside = function(ex) {
                (view.setImmediate || view.setTimeout)(function() {
                    throw ex;
                }, 0);
            }
            , force_saveable_type = "application/octet-stream"
            , fs_min_size = 0
            // See https://code.google.com/p/chromium/issues/detail?id=375297#c7 and
            // https://github.com/eligrey/FileSaver.js/commit/485930a#commitcomment-8768047
            // for the reasoning behind the timeout and revocation flow
            , arbitrary_revoke_timeout = 500 // in ms
            , revoke = function(file) {
                var revoker = function() {
                    if (typeof file === "string") { // file is an object URL
                        get_URL().revokeObjectURL(file);
                    } else { // file is a File
                        file.remove();
                    }
                };
                if (view.chrome) {
                    revoker();
                } else {
                    setTimeout(revoker, arbitrary_revoke_timeout);
                }
            }
            , dispatch = function(filesaver, event_types, event) {
                event_types = [].concat(event_types);
                var i = event_types.length;
                while (i--) {
                    var listener = filesaver["on" + event_types[i]];
                    if (typeof listener === "function") {
                        try {
                            listener.call(filesaver, event || filesaver);
                        } catch (ex) {
                            throw_outside(ex);
                        }
                    }
                }
            }
            , auto_bom = function(blob) {
                // prepend BOM for UTF-8 XML and text/* types (including HTML)
                if (/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(blob.type)) {
                    return new Blob(["\ufeff", blob], {type: blob.type});
                }
                return blob;
            }
            , FileSaver = function(blob, name) {
                blob = auto_bom(blob);
                // First try a.download, then web filesystem, then object URLs
                var
                    filesaver = this
                    , type = blob.type
                    , blob_changed = false
                    , object_url
                    , target_view
                    , dispatch_all = function() {
                        dispatch(filesaver, "writestart progress write writeend".split(" "));
                    }
                    // on any filesys errors revert to saving with object URLs
                    , fs_error = function() {
                        // don't create more object URLs than needed
                        if (blob_changed || !object_url) {
                            object_url = get_URL().createObjectURL(blob);
                        }
                        if (target_view) {
                            target_view.location.href = object_url;
                        } else {
                            var new_tab = view.open(object_url, "_blank");
                            if (new_tab === undefined && typeof safari !== "undefined") {
                                //Apple do not allow window.open, see http://bit.ly/1kZffRI
                                view.location.href = object_url;
                            }
                        }
                        filesaver.readyState = filesaver.DONE;
                        dispatch_all();
                        revoke(object_url);
                    }
                    , abortable = function(func) {
                        return function() {
                            if (filesaver.readyState !== filesaver.DONE) {
                                return func.apply(this, arguments);
                            }
                        };
                    }
                    , create_if_not_found = {create: true, exclusive: false}
                    , slice
                    ;
                filesaver.readyState = filesaver.INIT;
                if (!name) {
                    name = "download";
                }
                if (can_use_save_link) {
                    object_url = get_URL().createObjectURL(blob);
                    save_link.href = object_url;
                    save_link.download = name;
                    click(save_link);
                    filesaver.readyState = filesaver.DONE;
                    dispatch_all();
                    revoke(object_url);
                    return;
                }
                // Object and web filesystem URLs have a problem saving in Google Chrome when
                // viewed in a tab, so I force save with application/octet-stream
                // http://code.google.com/p/chromium/issues/detail?id=91158
                // Update: Google errantly closed 91158, I submitted it again:
                // https://code.google.com/p/chromium/issues/detail?id=389642
                if (view.chrome && type && type !== force_saveable_type) {
                    slice = blob.slice || blob.webkitSlice;
                    blob = slice.call(blob, 0, blob.size, force_saveable_type);
                    blob_changed = true;
                }
                // Since I can't be sure that the guessed media type will trigger a download
                // in WebKit, I append .download to the filename.
                // https://bugs.webkit.org/show_bug.cgi?id=65440
                if (webkit_req_fs && name !== "download") {
                    name += ".download";
                }
                if (type === force_saveable_type || webkit_req_fs) {
                    target_view = view;
                }
                if (!req_fs) {
                    fs_error();
                    return;
                }
                fs_min_size += blob.size;
                req_fs(view.TEMPORARY, fs_min_size, abortable(function(fs) {
                    fs.root.getDirectory("saved", create_if_not_found, abortable(function(dir) {
                        var save = function() {
                            dir.getFile(name, create_if_not_found, abortable(function(file) {
                                file.createWriter(abortable(function(writer) {
                                    writer.onwriteend = function(event) {
                                        target_view.location.href = file.toURL();
                                        filesaver.readyState = filesaver.DONE;
                                        dispatch(filesaver, "writeend", event);
                                        revoke(file);
                                    };
                                    writer.onerror = function() {
                                        var error = writer.error;
                                        if (error.code !== error.ABORT_ERR) {
                                            fs_error();
                                        }
                                    };
                                    "writestart progress write abort".split(" ").forEach(function(event) {
                                        writer["on" + event] = filesaver["on" + event];
                                    });
                                    writer.write(blob);
                                    filesaver.abort = function() {
                                        writer.abort();
                                        filesaver.readyState = filesaver.DONE;
                                    };
                                    filesaver.readyState = filesaver.WRITING;
                                }), fs_error);
                            }), fs_error);
                        };
                        dir.getFile(name, {create: false}, abortable(function(file) {
                            // delete file if it already exists
                            file.remove();
                            save();
                        }), abortable(function(ex) {
                            if (ex.code === ex.NOT_FOUND_ERR) {
                                save();
                            } else {
                                fs_error();
                            }
                        }));
                    }), fs_error);
                }), fs_error);
            }
            , FS_proto = FileSaver.prototype
            , saveAs = function(blob, name) {
                return new FileSaver(blob, name);
            }
            ;
        // IE 10+ (native saveAs)
        if (typeof navigator !== "undefined" && navigator.msSaveOrOpenBlob) {
            return function(blob, name) {
                return navigator.msSaveOrOpenBlob(auto_bom(blob), name);
            };
        }

        FS_proto.abort = function() {
            var filesaver = this;
            filesaver.readyState = filesaver.DONE;
            dispatch(filesaver, "abort");
        };
        FS_proto.readyState = FS_proto.INIT = 0;
        FS_proto.WRITING = 1;
        FS_proto.DONE = 2;

        FS_proto.error =
            FS_proto.onwritestart =
                FS_proto.onprogress =
                    FS_proto.onwrite =
                        FS_proto.onabort =
                            FS_proto.onerror =
                                FS_proto.onwriteend =
                                    null;

        return saveAs;
    }(window));



    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * Local (private) functions
     */

    /**
     * Get the file name for an exported file.
     *
     * @param {object}  config       Button configuration
     * @param {boolean} incExtension Include the file name extension
     */
    var _filename = function ( config, incExtension )
    {
        // Backwards compatibility
        var filename = config.filename === '*' && config.title !== '*' && config.title !== undefined ?
            config.title :
            config.filename;

        if ( typeof filename === 'function' ) {
            filename = filename();
        }

        if ( filename.indexOf( '*' ) !== -1 ) {
            filename = filename.replace( '*', $('title').text() );
        }

        // Strip characters which the OS will object to
        filename = filename.replace(/[^a-zA-Z0-9_\u00A1-\uFFFF\.,\-_ !\(\)]/g, "");

        return incExtension === undefined || incExtension === true ?
            filename+config.extension :
            filename;
    };

    /**
     * Get the sheet name for Excel exports.
     *
     * @param {object}  config       Button configuration
     */
    var _sheetname = function ( config )
    {
        var sheetName = 'Sheet1';

        if ( config.sheetName ) {
            sheetName = config.sheetName.replace(/[\[\]\*\/\\\?\:]/g, '');
        }

        return sheetName;
    };

    /**
     * Get the title for an exported file.
     *
     * @param {object}  config  Button configuration
     */
    var _title = function ( config )
    {
        var title = config.title;

        if ( typeof title === 'function' ) {
            title = title();
        }

        return title.indexOf( '*' ) !== -1 ?
            title.replace( '*', $('title').text() ) :
            title;
    };

    /**
     * Get the newline character(s)
     *
     * @param {object}  config Button configuration
     * @return {string}        Newline character
     */
    var _newLine = function ( config )
    {
        return config.newline ?
            config.newline :
            navigator.userAgent.match(/Windows/) ?
                '\r\n' :
                '\n';
    };

    /**
     * Combine the data from the `buttons.exportData` method into a string that
     * will be used in the export file.
     *
     * @param  {DataTable.Api} dt     DataTables API instance
     * @param  {object}        config Button configuration
     * @return {object}               The data to export
     */
    var _exportData = function ( dt, config )
    {
        var newLine = _newLine( config );
        var data = dt.buttons.exportData( config.exportOptions );
        var boundary = config.fieldBoundary;
        var separator = config.fieldSeparator;
        var reBoundary = new RegExp( boundary, 'g' );
        var escapeChar = config.escapeChar !== undefined ?
            config.escapeChar :
            '\\';
        var join = function ( a ) {
            var s = '';

            // If there is a field boundary, then we might need to escape it in
            // the source data
            for ( var i=0, ien=a.length ; i<ien ; i++ ) {
                if ( i > 0 ) {
                    s += separator;
                }

                s += boundary ?
                    boundary + ('' + a[i]).replace( reBoundary, escapeChar+boundary ) + boundary :
                    a[i];
            }

            return s;
        };

        var header = config.header ? join( data.header )+newLine : '';
        var footer = config.footer && data.footer ? newLine+join( data.footer ) : '';
        var body = [];

        for ( var i=0, ien=data.body.length ; i<ien ; i++ ) {
            body.push( join( data.body[i] ) );
        }

        return {
            str: header + body.join( newLine ) + footer,
            rows: body.length
        };
    };

    /**
     * Safari's data: support for creating and downloading files is really poor, so
     * various options need to be disabled in it. See
     * https://bugs.webkit.org/show_bug.cgi?id=102914
     *
     * @return {Boolean} `true` if Safari
     */
    var _isSafari = function ()
    {
        return navigator.userAgent.indexOf('Safari') !== -1 &&
            navigator.userAgent.indexOf('Chrome') === -1 &&
            navigator.userAgent.indexOf('Opera') === -1;
    };


// Excel - Pre-defined strings to build a minimal XLSX file
    var excelStrings = {
        "_rels/.rels": '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">\
	<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>\
</Relationships>',

        "xl/_rels/workbook.xml.rels": '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">\
	<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>\
</Relationships>',

        "[Content_Types].xml": '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">\
	<Default Extension="xml" ContentType="application/xml"/>\
	<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>\
	<Default Extension="jpeg" ContentType="image/jpeg"/>\
	<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>\
	<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>\
</Types>',

        "xl/workbook.xml": '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">\
	<fileVersion appName="xl" lastEdited="5" lowestEdited="5" rupBuild="24816"/>\
	<workbookPr showInkAnnotation="0" autoCompressPictures="0"/>\
	<bookViews>\
		<workbookView xWindow="0" yWindow="0" windowWidth="25600" windowHeight="19020" tabRatio="500"/>\
	</bookViews>\
	<sheets>\
		<sheet name="__SHEET_NAME__" sheetId="1" r:id="rId1"/>\
	</sheets>\
</workbook>',

        "xl/worksheets/sheet1.xml": '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" mc:Ignorable="x14ac" xmlns:x14ac="http://schemas.microsoft.com/office/spreadsheetml/2009/9/ac">\
	<sheetData>\
		__DATA__\
	</sheetData>\
</worksheet>'
    };



    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * Buttons
     */

//
// Copy to clipboard
//
    DataTable.ext.buttons.copyHtml5 = {
        className: 'buttons-copy buttons-html5',

        text: function ( dt ) {
            return dt.i18n( 'buttons.copy', 'Copy' );
        },

        action: function ( e, dt, button, config ) {
            var exportData = _exportData( dt, config );
            var output = exportData.str;
            var hiddenDiv = $('<div/>')
                .css( {
                    height: 1,
                    width: 1,
                    overflow: 'hidden',
                    position: 'fixed',
                    top: 0,
                    left: 0
                } );

            if ( config.customize ) {
                output = config.customize( output, config );
            }

            var textarea = $('<textarea readonly/>')
                .val( output )
                .appendTo( hiddenDiv );

            // For browsers that support the copy execCommand, try to use it
            if ( document.queryCommandSupported('copy') ) {
                hiddenDiv.appendTo( dt.table().container() );
                textarea[0].focus();
                textarea[0].select();

                try {
                    document.execCommand( 'copy' );
                    hiddenDiv.remove();

                    dt.buttons.info(
                        dt.i18n( 'buttons.copyTitle', 'Copy to clipboard' ),
                        dt.i18n( 'buttons.copySuccess', {
                            1: "Copied one row to clipboard",
                            _: "Copied %d rows to clipboard"
                        }, exportData.rows ),
                        2000
                    );

                    return;
                }
                catch (t) {}
            }

            // Otherwise we show the text box and instruct the user to use it
            var message = $('<span>'+dt.i18n( 'buttons.copyKeys',
                    'Press <i>ctrl</i> or <i>\u2318</i> + <i>C</i> to copy the table data<br>to your system clipboard.<br><br>'+
                    'To cancel, click this message or press escape.' )+'</span>'
            )
                .append( hiddenDiv );

            dt.buttons.info( dt.i18n( 'buttons.copyTitle', 'Copy to clipboard' ), message, 0 );

            // Select the text so when the user activates their system clipboard
            // it will copy that text
            textarea[0].focus();
            textarea[0].select();

            // Event to hide the message when the user is done
            var container = $(message).closest('.dt-button-info');
            var close = function () {
                container.off( 'click.buttons-copy' );
                $(document).off( '.buttons-copy' );
                dt.buttons.info( false );
            };

            container.on( 'click.buttons-copy', close );
            $(document)
                .on( 'keydown.buttons-copy', function (e) {
                    if ( e.keyCode === 27 ) { // esc
                        close();
                    }
                } )
                .on( 'copy.buttons-copy cut.buttons-copy', function () {
                    close();
                } );
        },

        exportOptions: {},

        fieldSeparator: '\t',

        fieldBoundary: '',

        header: true,

        footer: false
    };

//
// CSV export
//
    DataTable.ext.buttons.csvHtml5 = {
        className: 'buttons-csv buttons-html5',

        available: function () {
            return window.FileReader !== undefined && window.Blob;
        },

        text: function ( dt ) {
            return dt.i18n( 'buttons.csv', 'CSV' );
        },

        action: function ( e, dt, button, config ) {
            // Set the text
            var newLine = _newLine( config );
            var output = _exportData( dt, config ).str;
            var charset = config.charset;

            if ( config.customize ) {
                output = config.customize( output, config );
            }

            if ( charset !== false ) {
                if ( ! charset ) {
                    charset = document.characterSet || document.charset;
                }

                if ( charset ) {
                    charset = ';charset='+charset;
                }
            }
            else {
                charset = '';
            }

            _saveAs(
                new Blob( [output], {type: 'text/csv'+charset} ),
                _filename( config )
            );
        },

        filename: '*',

        extension: '.csv',

        exportOptions: {},

        fieldSeparator: ',',

        fieldBoundary: '"',

        escapeChar: '"',

        charset: null,

        header: true,

        footer: false
    };

//
// Excel (xlsx) export
//
    DataTable.ext.buttons.excelHtml5 = {
        className: 'buttons-excel buttons-html5',

        available: function () {
            return window.FileReader !== undefined && window.JSZip !== undefined && ! _isSafari();
        },

        text: function ( dt ) {
            return dt.i18n( 'buttons.excel', 'Excel' );
        },

        action: function ( e, dt, button, config ) {
            // Set the text
            var xml = '';
            var data = dt.buttons.exportData( config.exportOptions );
            var addRow = function ( row ) {
                var cells = [];

                for ( var i=0, ien=row.length ; i<ien ; i++ ) {
                    if ( row[i] === null || row[i] === undefined ) {
                        row[i] = '';
                    }

                    // Don't match numbers with leading zeros or a negative anywhere
                    // but the start
                    cells.push( typeof row[i] === 'number' || (row[i].match && $.trim(row[i]).match(/^-?\d+(\.\d+)?$/) && row[i].charAt(0) !== '0') ?
                        '<c t="n"><v>'+row[i]+'</v></c>' :
                        '<c t="inlineStr"><is><t>'+(
                            ! row[i].replace ?
                                row[i] :
                                row[i]
                                    .replace(/&(?!amp;)/g, '&amp;')
                                    .replace(/</g, '&lt;')
                                    .replace(/>/g, '&gt;')
                                    .replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, ''))+ // remove control characters
                        '</t></is></c>'                                                      // they are not valid in XML
                    );
                }

                return '<row>'+cells.join('')+'</row>';
            };

            if ( config.header ) {
                xml += addRow( data.header );
            }

            for ( var i=0, ien=data.body.length ; i<ien ; i++ ) {
                xml += addRow( data.body[i] );
            }

            if ( config.footer ) {
                xml += addRow( data.footer );
            }

            var zip           = new window.JSZip();
            var _rels         = zip.folder("_rels");
            var xl            = zip.folder("xl");
            var xl_rels       = zip.folder("xl/_rels");
            var xl_worksheets = zip.folder("xl/worksheets");

            zip.file(           '[Content_Types].xml', excelStrings['[Content_Types].xml'] );
            _rels.file(         '.rels',               excelStrings['_rels/.rels'] );
            xl.file(            'workbook.xml',        excelStrings['xl/workbook.xml'].replace( '__SHEET_NAME__', _sheetname( config ) ) );
            xl_rels.file(       'workbook.xml.rels',   excelStrings['xl/_rels/workbook.xml.rels'] );
            xl_worksheets.file( 'sheet1.xml',          excelStrings['xl/worksheets/sheet1.xml'].replace( '__DATA__', xml ) );

            _saveAs(
                zip.generate( {type:"blob", mimeType:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'} ),
                _filename( config )
            );
        },

        filename: '*',

        extension: '.xlsx',

        exportOptions: {},

        header: true,

        footer: false
    };

//
// PDF export - using pdfMake - http://pdfmake.org
//
    DataTable.ext.buttons.pdfHtml5 = {
        className: 'buttons-pdf buttons-html5',

        available: function () {
            return window.FileReader !== undefined && window.pdfMake;
        },

        text: function ( dt ) {
            return dt.i18n( 'buttons.pdf', 'PDF' );
        },

        action: function ( e, dt, button, config ) {
            var newLine = _newLine( config );
            var data = dt.buttons.exportData( config.exportOptions );
            var rows = [];

            if ( config.header ) {
                rows.push( $.map( data.header, function ( d ) {
                    return {
                        text: typeof d === 'string' ? d : d+'',
                        style: 'tableHeader'
                    };
                } ) );
            }

            for ( var i=0, ien=data.body.length ; i<ien ; i++ ) {
                rows.push( $.map( data.body[i], function ( d ) {
                    return {
                        text: typeof d === 'string' ? d : d+'',
                        style: i % 2 ? 'tableBodyEven' : 'tableBodyOdd'
                    };
                } ) );
            }

            if ( config.footer ) {
                rows.push( $.map( data.footer, function ( d ) {
                    return {
                        text: typeof d === 'string' ? d : d+'',
                        style: 'tableFooter'
                    };
                } ) );
            }

            var doc = {
                pageSize: config.pageSize,
                pageOrientation: config.orientation,
                content: [
                    {
                        table: {
                            headerRows: 1,
                            body: rows
                        },
                        layout: 'noBorders'
                    }
                ],
                styles: {
                    tableHeader: {
                        bold: true,
                        fontSize: 11,
                        color: 'white',
                        fillColor: '#2d4154',
                        alignment: 'center'
                    },
                    tableBodyEven: {},
                    tableBodyOdd: {
                        fillColor: '#f3f3f3'
                    },
                    tableFooter: {
                        bold: true,
                        fontSize: 11,
                        color: 'white',
                        fillColor: '#2d4154'
                    },
                    title: {
                        alignment: 'center',
                        fontSize: 15
                    },
                    message: {}
                },
                defaultStyle: {
                    fontSize: 10
                }
            };

            if ( config.message ) {
                doc.content.unshift( {
                    text: config.message,
                    style: 'message',
                    margin: [ 0, 0, 0, 12 ]
                } );
            }

            if ( config.title ) {
                doc.content.unshift( {
                    text: _title( config, false ),
                    style: 'title',
                    margin: [ 0, 0, 0, 12 ]
                } );
            }

            if ( config.customize ) {
                config.customize( doc, config );
            }

            var pdf = window.pdfMake.createPdf( doc );

            if ( config.download === 'open' && ! _isSafari() ) {
                pdf.open();
            }
            else {
                pdf.getBuffer( function (buffer) {
                    var blob = new Blob( [buffer], {type:'application/pdf'} );

                    _saveAs( blob, _filename( config ) );
                } );
            }
        },

        title: '*',

        filename: '*',

        extension: '.pdf',

        exportOptions: {},

        orientation: 'portrait',

        pageSize: 'A4',

        header: true,

        footer: false,

        message: null,

        customize: null,

        download: 'download'
    };


    return DataTable.Buttons;
}));

/* dataTables.select.min.js */
/*!
 Select for DataTables 1.2.0
 2015-2016 SpryMedia Ltd - datatables.net/license/mit
 */
(function(e){"function"===typeof define&&define.amd?define(["jquery","datatables.net"],function(i){return e(i,window,document)}):"object"===typeof exports?module.exports=function(i,l){i||(i=window);if(!l||!l.fn.dataTable)l=require("datatables.net")(i,l).$;return e(l,i,i.document)}:e(jQuery,window,document)})(function(e,i,l,h){function t(b,a,c){var d;d=function(c,a){if(c>a)var d=a,a=c,c=d;var f=!1;return b.columns(":visible").indexes().filter(function(b){b===c&&(f=!0);return b===a?(f=!1,!0):f})};var f=
    function(c,a){var d=b.rows({search:"applied"}).indexes();if(d.indexOf(c)>d.indexOf(a))var f=a,a=c,c=f;var e=!1;return d.filter(function(b){b===c&&(e=!0);return b===a?(e=!1,!0):e})};!b.cells({selected:!0}).any()&&!c?(d=d(0,a.column),c=f(0,a.row)):(d=d(c.column,a.column),c=f(c.row,a.row));c=b.cells(c,d).flatten();b.cells(a,{selected:!0}).any()?b.cells(c).deselect():b.cells(c).select()}function r(b){var a=b.settings()[0]._select.selector;e(b.table().body()).off("mousedown.dtSelect",a).off("mouseup.dtSelect",
    a).off("click.dtSelect",a);e("body").off("click.dtSelect")}function v(b){var a=e(b.table().body()),c=b.settings()[0],d=c._select.selector;a.on("mousedown.dtSelect",d,function(c){if(c.shiftKey||c.metaKey||c.ctrlKey)a.css("-moz-user-select","none").one("selectstart.dtSelect",d,function(){return!1})}).on("mouseup.dtSelect",d,function(){a.css("-moz-user-select","")}).on("click.dtSelect",d,function(c){var a=b.select.items();if(!i.getSelection||!i.getSelection().toString()){var d=b.settings()[0];if(e(c.target).closest("div.dataTables_wrapper")[0]==
    b.table().container()){var g=b.cell(e(c.target).closest("td, th"));if(g.any()){var h=e.Event("user-select.dt");k(b,h,[a,g,c]);h.isDefaultPrevented()||(h=g.index(),"row"===a?(a=h.row,s(c,b,d,"row",a)):"column"===a?(a=g.index().column,s(c,b,d,"column",a)):"cell"===a&&(a=g.index(),s(c,b,d,"cell",a)),d._select_lastCell=h)}}}});e("body").on("click.dtSelect",function(a){c._select.blurable&&!e(a.target).parents().filter(b.table().container()).length&&(e(a.target).parents("div.DTE").length||p(c,!0))})}function k(b,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  a,c,d){if(!d||b.flatten().length)"string"===typeof a&&(a+=".dt"),c.unshift(b),e(b.table().node()).triggerHandler(a,c)}function w(b){var a=b.settings()[0];if(a._select.info&&a.aanFeatures.i){var c=e('<span class="select-info"/>'),d=function(a,d){c.append(e('<span class="select-item"/>').append(b.i18n("select."+a+"s",{_:"%d "+a+"s selected","0":"",1:"1 "+a+" selected"},d)))};d("row",b.rows({selected:!0}).flatten().length);d("column",b.columns({selected:!0}).flatten().length);d("cell",b.cells({selected:!0}).flatten().length);
    e.each(a.aanFeatures.i,function(a,b){var b=e(b),d=b.children("span.select-info");d.length&&d.remove();""!==c.text()&&b.append(c)})}}function x(b,a,c,d){var f=b[a+"s"]({search:"applied"}).indexes(),d=e.inArray(d,f),m=e.inArray(c,f);if(!b[a+"s"]({selected:!0}).any()&&-1===d)f.splice(e.inArray(c,f)+1,f.length);else{if(d>m)var j=m,m=d,d=j;f.splice(m+1,f.length);f.splice(0,d)}b[a](c,{selected:!0}).any()?(f.splice(e.inArray(c,f),1),b[a+"s"](f).deselect()):b[a+"s"](f).select()}function p(b,a){if(a||"single"===
    b._select.style){var c=new g.Api(b);c.rows({selected:!0}).deselect();c.columns({selected:!0}).deselect();c.cells({selected:!0}).deselect()}}function s(b,a,c,d,f){var e=a.select.style(),j=a[d](f,{selected:!0}).any();"os"===e?b.ctrlKey||b.metaKey?a[d](f).select(!j):b.shiftKey?"cell"===d?t(a,f,c._select_lastCell||null):x(a,d,f,c._select_lastCell?c._select_lastCell[d]:null):(b=a[d+"s"]({selected:!0}),j&&1===b.flatten().length?a[d](f).deselect():(b.deselect(),a[d](f).select())):"multi+shift"==e?b.shiftKey?
            "cell"===d?t(a,f,c._select_lastCell||null):x(a,d,f,c._select_lastCell?c._select_lastCell[d]:null):a[d](f).select(!j):a[d](f).select(!j)}function q(b,a){return function(c){return c.i18n("buttons."+b,a)}}var g=e.fn.dataTable;g.select={};g.select.version="1.2.0";g.select.init=function(b){var a=b.settings()[0],c=a.oInit.select,d=g.defaults.select,c=c===h?d:c,d="row",f="api",m=!1,j=!0,u="td, th",i="selected";a._select={};if(!0===c)f="os";else if("string"===typeof c)f=c;else if(e.isPlainObject(c)&&(c.blurable!==
    h&&(m=c.blurable),c.info!==h&&(j=c.info),c.items!==h&&(d=c.items),c.style!==h&&(f=c.style),c.selector!==h&&(u=c.selector),c.className!==h))i=c.className;b.select.selector(u);b.select.items(d);b.select.style(f);b.select.blurable(m);b.select.info(j);a._select.className=i;e.fn.dataTable.ext.order["select-checkbox"]=function(a,c){return this.api().column(c,{order:"index"}).nodes().map(function(c){return"row"===a._select.items?e(c).parent().hasClass(a._select.className):"cell"===a._select.items?e(c).hasClass(a._select.className):
        !1})};e(b.table().node()).hasClass("selectable")&&b.select.style("os")};e.each([{type:"row",prop:"aoData"},{type:"column",prop:"aoColumns"}],function(b,a){g.ext.selector[a.type].push(function(c,b,f){var b=b.selected,e,j=[];if(b===h)return f;for(var g=0,i=f.length;g<i;g++)e=c[a.prop][f[g]],(!0===b&&!0===e._select_selected||!1===b&&!e._select_selected)&&j.push(f[g]);return j})});g.ext.selector.cell.push(function(b,a,c){var a=a.selected,d,f=[];if(a===h)return c;for(var e=0,g=c.length;e<g;e++)d=b.aoData[c[e].row],
(!0===a&&d._selected_cells&&!0===d._selected_cells[c[e].column]||!1===a&&(!d._selected_cells||!d._selected_cells[c[e].column]))&&f.push(c[e]);return f});var n=g.Api.register,o=g.Api.registerPlural;n("select()",function(){return this.iterator("table",function(b){g.select.init(new g.Api(b))})});n("select.blurable()",function(b){return b===h?this.context[0]._select.blurable:this.iterator("table",function(a){a._select.blurable=b})});n("select.info()",function(b){return w===h?this.context[0]._select.info:
    this.iterator("table",function(a){a._select.info=b})});n("select.items()",function(b){return b===h?this.context[0]._select.items:this.iterator("table",function(a){a._select.items=b;k(new g.Api(a),"selectItems",[b])})});n("select.style()",function(b){return b===h?this.context[0]._select.style:this.iterator("table",function(a){a._select.style=b;if(!a._select_init){var c=new g.Api(a);a.aoRowCreatedCallback.push({fn:function(c,b,d){b=a.aoData[d];b._select_selected&&e(c).addClass(a._select.className);
        c=0;for(d=a.aoColumns.length;c<d;c++)(a.aoColumns[c]._select_selected||b._selected_cells&&b._selected_cells[c])&&e(b.anCells[c]).addClass(a._select.className)},sName:"select-deferRender"});c.on("preXhr.dt.dtSelect",function(){var a=c.rows({selected:!0}).ids(!0).filter(function(c){return c!==h}),b=c.cells({selected:!0}).eq(0).map(function(a){var b=c.row(a.row).id(!0);return b?{row:b,column:a.column}:h}).filter(function(c){return c!==h});c.one("draw.dt.dtSelect",function(){c.rows(a).select();b.any()&&
    b.each(function(a){c.cells(a.row,a.column).select()})})});c.on("draw.dtSelect.dt select.dtSelect.dt deselect.dtSelect.dt info.dt",function(){w(c)});c.on("destroy.dtSelect",function(){r(c);c.off(".dtSelect")})}var d=new g.Api(a);r(d);"api"!==b&&v(d);k(new g.Api(a),"selectStyle",[b])})});n("select.selector()",function(b){return b===h?this.context[0]._select.selector:this.iterator("table",function(a){r(new g.Api(a));a._select.selector=b;"api"!==a._select.style&&v(new g.Api(a))})});o("rows().select()",
    "row().select()",function(b){var a=this;if(!1===b)return this.deselect();this.iterator("row",function(c,a){p(c);c.aoData[a]._select_selected=!0;e(c.aoData[a].nTr).addClass(c._select.className)});this.iterator("table",function(c,b){k(a,"select",["row",a[b]],!0)});return this});o("columns().select()","column().select()",function(b){var a=this;if(!1===b)return this.deselect();this.iterator("column",function(a,b){p(a);a.aoColumns[b]._select_selected=!0;var f=(new g.Api(a)).column(b);e(f.header()).addClass(a._select.className);
    e(f.footer()).addClass(a._select.className);f.nodes().to$().addClass(a._select.className)});this.iterator("table",function(c,b){k(a,"select",["column",a[b]],!0)});return this});o("cells().select()","cell().select()",function(b){var a=this;if(!1===b)return this.deselect();this.iterator("cell",function(a,b,f){p(a);b=a.aoData[b];b._selected_cells===h&&(b._selected_cells=[]);b._selected_cells[f]=!0;b.anCells&&e(b.anCells[f]).addClass(a._select.className)});this.iterator("table",function(b,d){k(a,"select",
    ["cell",a[d]],!0)});return this});o("rows().deselect()","row().deselect()",function(){var b=this;this.iterator("row",function(a,b){a.aoData[b]._select_selected=!1;e(a.aoData[b].nTr).removeClass(a._select.className)});this.iterator("table",function(a,c){k(b,"deselect",["row",b[c]],!0)});return this});o("columns().deselect()","column().deselect()",function(){var b=this;this.iterator("column",function(a,b){a.aoColumns[b]._select_selected=!1;var d=new g.Api(a),f=d.column(b);e(f.header()).removeClass(a._select.className);
    e(f.footer()).removeClass(a._select.className);d.cells(null,b).indexes().each(function(b){var c=a.aoData[b.row],d=c._selected_cells;c.anCells&&(!d||!d[b.column])&&e(c.anCells[b.column]).removeClass(a._select.className)})});this.iterator("table",function(a,c){k(b,"deselect",["column",b[c]],!0)});return this});o("cells().deselect()","cell().deselect()",function(){var b=this;this.iterator("cell",function(a,b,d){b=a.aoData[b];b._selected_cells[d]=!1;b.anCells&&!a.aoColumns[d]._select_selected&&e(b.anCells[d]).removeClass(a._select.className)});
    this.iterator("table",function(a,c){k(b,"deselect",["cell",b[c]],!0)});return this});e.extend(g.ext.buttons,{selected:{text:q("selected","Selected"),className:"buttons-selected",init:function(b){var a=this;b.on("draw.dt.DT select.dt.DT deselect.dt.DT",function(){var b=a.rows({selected:!0}).any()||a.columns({selected:!0}).any()||a.cells({selected:!0}).any();a.enable(b)});this.disable()}},selectedSingle:{text:q("selectedSingle","Selected single"),className:"buttons-selected-single",init:function(b){var a=
    this;b.on("draw.dt.DT select.dt.DT deselect.dt.DT",function(){var c=b.rows({selected:!0}).flatten().length+b.columns({selected:!0}).flatten().length+b.cells({selected:!0}).flatten().length;a.enable(1===c)});this.disable()}},selectAll:{text:q("selectAll","Select all"),className:"buttons-select-all",action:function(){this[this.select.items()+"s"]().select()}},selectNone:{text:q("selectNone","Deselect all"),className:"buttons-select-none",action:function(){p(this.settings()[0],!0)},init:function(b){var a=
    this;b.on("draw.dt.DT select.dt.DT deselect.dt.DT",function(){var c=b.rows({selected:!0}).flatten().length+b.columns({selected:!0}).flatten().length+b.cells({selected:!0}).flatten().length;a.enable(0<c)});this.disable()}}});e.each(["Row","Column","Cell"],function(b,a){var c=a.toLowerCase();g.ext.buttons["select"+a+"s"]={text:q("select"+a+"s","Select "+c+"s"),className:"buttons-select-"+c+"s",action:function(){this.select.items(c)},init:function(a){var b=this;a.on("selectItems.dt.DT",function(a,d,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     e){b.active(e===c)})}}});e(l).on("preInit.dt.dtSelect",function(b,a){"dt"===b.namespace&&g.select.init(new g.Api(a))});return g.select});

/* dataTables.rowReorder.min.js */
/*!
 RowReorder 1.1.2
 2015-2016 SpryMedia Ltd - datatables.net/license
 */
(function(e){"function"===typeof define&&define.amd?define(["jquery","datatables.net"],function(f){return e(f,window,document)}):"object"===typeof exports?module.exports=function(f,g){f||(f=window);if(!g||!g.fn.dataTable)g=require("datatables.net")(f,g).$;return e(g,f,f.document)}:e(jQuery,window,document)})(function(e,f,g){var j=e.fn.dataTable,i=function(b,a){if(!j.versionCheck||!j.versionCheck("1.10.8"))throw"DataTables RowReorder requires DataTables 1.10.8 or newer";this.c=e.extend(!0,{},j.defaults.rowReorder,
    i.defaults,a);this.s={bodyTop:null,dt:new j.Api(b),getDataFn:j.ext.oApi._fnGetObjectDataFn(this.c.dataSrc),middles:null,scroll:{},scrollInterval:null,setDataFn:j.ext.oApi._fnSetObjectDataFn(this.c.dataSrc),start:{top:0,left:0,offsetTop:0,offsetLeft:0,nodes:[]},windowHeight:0};this.dom={clone:null,dtScroll:e("div.dataTables_scrollBody",this.s.dt.table().container())};var c=this.s.dt.settings()[0],d=c.rowreorder;if(d)return d;c.rowreorder=this;this._constructor()};e.extend(i.prototype,{_constructor:function(){var b=
    this,a=this.s.dt,c=e(a.table().node());"static"===c.css("position")&&c.css("position","relative");e(a.table().container()).on("mousedown.rowReorder touchstart.rowReorder",this.c.selector,function(d){var c=e(this).closest("tr");if(a.row(c).any())return b._mouseDown(d,c),!1});a.on("destroy.rowReorder",function(){e(a.table().container()).off(".rowReorder");a.off(".rowReorder")})},_cachePositions:function(){var b=this.s.dt,a=e(b.table().node()).find("thead").outerHeight(),c=e.unique(b.rows({page:"current"}).nodes().toArray()),
    d=e.map(c,function(b){return e(b).position().top-a}),c=e.map(d,function(a,c){return d.length<c-1?(a+d[c+1])/2:(a+a+e(b.row(":last-child").node()).outerHeight())/2});this.s.middles=c;this.s.bodyTop=e(b.table().body()).offset().top;this.s.windowHeight=e(f).height()},_clone:function(b){var a=e(this.s.dt.table().node().cloneNode(!1)).addClass("dt-rowReorder-float").append("<tbody/>").append(b.clone(!1)),c=b.outerWidth(),d=b.outerHeight(),h=b.children().map(function(){return e(this).width()});a.width(c).height(d).find("tr").children().each(function(a){this.style.width=
    h[a]+"px"});a.appendTo("body");this.dom.clone=a},_clonePosition:function(b){var a=this.s.start,c=this._eventToPage(b,"Y")-a.top,b=this._eventToPage(b,"X")-a.left,d=this.c.snapX;this.dom.clone.css({top:c+a.offsetTop,left:!0===d?a.offsetLeft:"number"===typeof d?a.offsetLeft+d:b+a.offsetLeft})},_emitEvent:function(b,a){this.s.dt.iterator("table",function(c){e(c.nTable).triggerHandler(b+".dt",a)})},_eventToPage:function(b,a){return-1!==b.type.indexOf("touch")?b.originalEvent.touches[0]["page"+a]:b["page"+
    a]},_mouseDown:function(b,a){var c=this,d=this.s.dt,h=this.s.start,k=a.offset();h.top=this._eventToPage(b,"Y");h.left=this._eventToPage(b,"X");h.offsetTop=k.top;h.offsetLeft=k.left;h.nodes=e.unique(d.rows({page:"current"}).nodes().toArray());this._cachePositions();this._clone(a);this._clonePosition(b);this.dom.target=a;a.addClass("dt-rowReorder-moving");e(g).on("mouseup.rowReorder touchend.rowReorder",function(a){c._mouseUp(a)}).on("mousemove.rowReorder touchmove.rowReorder",function(a){c._mouseMove(a)});
    e(f).width()===e(g).width()&&e(g.body).addClass("dt-rowReorder-noOverflow");d=this.dom.dtScroll;this.s.scroll={windowHeight:e(f).height(),windowWidth:e(f).width(),dtTop:d.length?d.offset().top:null,dtLeft:d.length?d.offset().left:null,dtHeight:d.length?d.outerHeight():null,dtWidth:d.length?d.outerWidth():null}},_mouseMove:function(b){this._clonePosition(b);for(var a=this._eventToPage(b,"Y")-this.s.bodyTop,c=this.s.middles,d=null,h=this.s.dt,k=h.table().body(),g=0,f=c.length;g<f;g++)if(a<c[g]){d=g;
    break}null===d&&(d=c.length);if(null===this.s.lastInsert||this.s.lastInsert!==d)0===d?this.dom.target.prependTo(k):(a=e.unique(h.rows({page:"current"}).nodes().toArray()),d>this.s.lastInsert?this.dom.target.insertAfter(a[d-1]):this.dom.target.insertBefore(a[d])),this._cachePositions(),this.s.lastInsert=d;this._shiftScroll(b)},_mouseUp:function(){var b=this.s.dt,a,c,d=this.c.dataSrc;this.dom.clone.remove();this.dom.clone=null;this.dom.target.removeClass("dt-rowReorder-moving");e(g).off(".rowReorder");
    e(g.body).removeClass("dt-rowReorder-noOverflow");clearInterval(this.s.scrollInterval);this.s.scrollInterval=null;var h=this.s.start.nodes,k=e.unique(b.rows({page:"current"}).nodes().toArray()),f={},l=[],i=[],j=this.s.getDataFn,o=this.s.setDataFn;a=0;for(c=h.length;a<c;a++)if(h[a]!==k[a]){var m=b.row(k[a]).id(),p=b.row(k[a]).data(),n=b.row(h[a]).data();m&&(f[m]=j(n));l.push({node:k[a],oldData:j(p),newData:j(n),newPosition:a,oldPosition:e.inArray(k[a],h)});i.push(k[a])}h=[l,{dataSrc:d,nodes:i,values:f,
        triggerRow:b.row(this.dom.target)}];this._emitEvent("row-reorder",h);this.c.editor&&this.c.editor.edit(i,!1,{submit:"changed"}).multiSet(d,f).submit();if(this.c.update){a=0;for(c=l.length;a<c;a++)f=b.row(l[a].node).data(),o(f,l[a].newData),b.columns().every(function(){this.dataSrc()===d&&b.cell(l[a].node,this.index()).invalidate("data")});this._emitEvent("row-reordered",h);b.draw(!1)}},_shiftScroll:function(b){var a=this,c=this.s.scroll,d=!1,e=b.pageY-g.body.scrollTop,f,i;65>e?f=-5:e>c.windowHeight-
    65&&(f=5);null!==c.dtTop&&b.pageY<c.dtTop+65?i=-5:null!==c.dtTop&&b.pageY>c.dtTop+c.dtHeight-65&&(i=5);f||i?(c.windowVert=f,c.dtVert=i,d=!0):this.s.scrollInterval&&(clearInterval(this.s.scrollInterval),this.s.scrollInterval=null);!this.s.scrollInterval&&d&&(this.s.scrollInterval=setInterval(function(){if(c.windowVert)g.body.scrollTop=g.body.scrollTop+c.windowVert;if(c.dtVert){var b=a.dom.dtScroll[0];if(c.dtVert)b.scrollTop=b.scrollTop+c.dtVert}},20))}});i.defaults={dataSrc:0,editor:null,selector:"td:first-child",
    snapX:!1,update:!0};i.version="1.1.2";e.fn.dataTable.RowReorder=i;e.fn.DataTable.RowReorder=i;e(g).on("init.dt.dtr",function(b,a){if("dt"===b.namespace){var c=a.oInit.rowReorder,d=j.defaults.rowReorder;if(c||d)d=e.extend({},c,d),!1!==c&&new i(a,d)}});return i});

/* dataTables.responsive.js */
/*! Responsive 2.0.2
 * 2014-2016 SpryMedia Ltd - datatables.net/license
 */

/**
 * @summary     Responsive
 * @description Responsive tables plug-in for DataTables
 * @version     2.0.2
 * @file        dataTables.responsive.js
 * @author      SpryMedia Ltd (www.sprymedia.co.uk)
 * @contact     www.sprymedia.co.uk/contact
 * @copyright   Copyright 2014-2016 SpryMedia Ltd.
 *
 * This source file is free software, available under the following license:
 *   MIT license - http://datatables.net/license/mit
 *
 * This source file is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
 * or FITNESS FOR A PARTICULAR PURPOSE. See the license files for details.
 *
 * For details please refer to: http://www.datatables.net
 */
(function( factory ){
    if ( typeof define === 'function' && define.amd ) {
        // AMD
        define( ['jquery', 'datatables.net'], function ( $ ) {
            return factory( $, window, document );
        } );
    }
    else if ( typeof exports === 'object' ) {
        // CommonJS
        module.exports = function (root, $) {
            if ( ! root ) {
                root = window;
            }

            if ( ! $ || ! $.fn.dataTable ) {
                $ = require('datatables.net')(root, $).$;
            }

            return factory( $, root, root.document );
        };
    }
    else {
        // Browser
        factory( jQuery, window, document );
    }
}(function( $, window, document, undefined ) {
    'use strict';
    var DataTable = $.fn.dataTable;


    /**
     * Responsive is a plug-in for the DataTables library that makes use of
     * DataTables' ability to change the visibility of columns, changing the
     * visibility of columns so the displayed columns fit into the table container.
     * The end result is that complex tables will be dynamically adjusted to fit
     * into the viewport, be it on a desktop, tablet or mobile browser.
     *
     * Responsive for DataTables has two modes of operation, which can used
     * individually or combined:
     *
     * * Class name based control - columns assigned class names that match the
     *   breakpoint logic can be shown / hidden as required for each breakpoint.
     * * Automatic control - columns are automatically hidden when there is no
     *   room left to display them. Columns removed from the right.
     *
     * In additional to column visibility control, Responsive also has built into
     * options to use DataTables' child row display to show / hide the information
     * from the table that has been hidden. There are also two modes of operation
     * for this child row display:
     *
     * * Inline - when the control element that the user can use to show / hide
     *   child rows is displayed inside the first column of the table.
     * * Column - where a whole column is dedicated to be the show / hide control.
     *
     * Initialisation of Responsive is performed by:
     *
     * * Adding the class `responsive` or `dt-responsive` to the table. In this case
     *   Responsive will automatically be initialised with the default configuration
     *   options when the DataTable is created.
     * * Using the `responsive` option in the DataTables configuration options. This
     *   can also be used to specify the configuration options, or simply set to
     *   `true` to use the defaults.
     *
     *  @class
     *  @param {object} settings DataTables settings object for the host table
     *  @param {object} [opts] Configuration options
     *  @requires jQuery 1.7+
     *  @requires DataTables 1.10.3+
     *
     *  @example
     *      $('#example').DataTable( {
 *        responsive: true
 *      } );
     *    } );
     */
    var Responsive = function ( settings, opts ) {
        // Sanity check that we are using DataTables 1.10 or newer
        if ( ! DataTable.versionCheck || ! DataTable.versionCheck( '1.10.3' ) ) {
            throw 'DataTables Responsive requires DataTables 1.10.3 or newer';
        }

        this.s = {
            dt: new DataTable.Api( settings ),
            columns: [],
            current: []
        };

        // Check if responsive has already been initialised on this table
        if ( this.s.dt.settings()[0].responsive ) {
            return;
        }

        // details is an object, but for simplicity the user can give it as a string
        // or a boolean
        if ( opts && typeof opts.details === 'string' ) {
            opts.details = { type: opts.details };
        }
        else if ( opts && opts.details === false ) {
            opts.details = { type: false };
        }
        else if ( opts && opts.details === true ) {
            opts.details = { type: 'inline' };
        }

        this.c = $.extend( true, {}, Responsive.defaults, DataTable.defaults.responsive, opts );
        settings.responsive = this;
        this._constructor();
    };

    $.extend( Responsive.prototype, {
        /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
         * Constructor
         */

        /**
         * Initialise the Responsive instance
         *
         * @private
         */
        _constructor: function ()
        {
            var that = this;
            var dt = this.s.dt;
            var dtPrivateSettings = dt.settings()[0];
            var oldWindowWidth = $(window).width();

            dt.settings()[0]._responsive = this;

            // Use DataTables' throttle function to avoid processor thrashing on
            // resize
            $(window).on( 'resize.dtr orientationchange.dtr', DataTable.util.throttle( function () {
                // iOS has a bug whereby resize can fire when only scrolling
                // See: http://stackoverflow.com/questions/8898412
                var width = $(window).width();

                if ( width !== oldWindowWidth ) {
                    that._resize();
                    oldWindowWidth = width;
                }
            } ) );

            // DataTables doesn't currently trigger an event when a row is added, so
            // we need to hook into its private API to enforce the hidden rows when
            // new data is added
            dtPrivateSettings.oApi._fnCallbackReg( dtPrivateSettings, 'aoRowCreatedCallback', function (tr, data, idx) {
                if ( $.inArray( false, that.s.current ) !== -1 ) {
                    $('td, th', tr).each( function ( i ) {
                        var idx = dt.column.index( 'toData', i );

                        if ( that.s.current[idx] === false ) {
                            $(this).css('display', 'none');
                        }
                    } );
                }
            } );

            // Destroy event handler
            dt.on( 'destroy.dtr', function () {
                dt.off( '.dtr' );
                $( dt.table().body() ).off( '.dtr' );
                $(window).off( 'resize.dtr orientationchange.dtr' );

                // Restore the columns that we've hidden
                $.each( that.s.current, function ( i, val ) {
                    if ( val === false ) {
                        that._setColumnVis( i, true );
                    }
                } );
            } );

            // Reorder the breakpoints array here in case they have been added out
            // of order
            this.c.breakpoints.sort( function (a, b) {
                return a.width < b.width ? 1 :
                    a.width > b.width ? -1 : 0;
            } );

            this._classLogic();
            this._resizeAuto();

            // Details handler
            var details = this.c.details;

            if ( details.type !== false ) {
                that._detailsInit();

                // DataTables will trigger this event on every column it shows and
                // hides individually
                dt.on( 'column-visibility.dtr', function (e, ctx, col, vis) {
                    that._classLogic();
                    that._resizeAuto();
                    that._resize();
                } );

                // Redraw the details box on each draw which will happen if the data
                // has changed. This is used until DataTables implements a native
                // `updated` event for rows
                dt.on( 'draw.dtr', function () {
                    that._redrawChildren();
                } );

                $(dt.table().node()).addClass( 'dtr-'+details.type );
            }

            dt.on( 'column-reorder.dtr', function (e, settings, details) {
                that._classLogic();
                that._resizeAuto();
                that._resize();
            } );

            // Change in column sizes means we need to calc
            dt.on( 'column-sizing.dtr', function () {
                that._resize();
            });

            dt.on( 'init.dtr', function (e, settings, details) {
                that._resizeAuto();
                that._resize();

                // If columns were hidden, then DataTables needs to adjust the
                // column sizing
                if ( $.inArray( false, that.s.current ) ) {
                    dt.columns.adjust();
                }
            } );

            // First pass - draw the table for the current viewport size
            this._resize();
        },


        /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
         * Private methods
         */

        /**
         * Calculate the visibility for the columns in a table for a given
         * breakpoint. The result is pre-determined based on the class logic if
         * class names are used to control all columns, but the width of the table
         * is also used if there are columns which are to be automatically shown
         * and hidden.
         *
         * @param  {string} breakpoint Breakpoint name to use for the calculation
         * @return {array} Array of boolean values initiating the visibility of each
         *   column.
         *  @private
         */
        _columnsVisiblity: function ( breakpoint )
        {
            var dt = this.s.dt;
            var columns = this.s.columns;
            var i, ien;

            // Create an array that defines the column ordering based first on the
            // column's priority, and secondly the column index. This allows the
            // columns to be removed from the right if the priority matches
            var order = columns
                .map( function ( col, idx ) {
                    return {
                        columnIdx: idx,
                        priority: col.priority
                    };
                } )
                .sort( function ( a, b ) {
                    if ( a.priority !== b.priority ) {
                        return a.priority - b.priority;
                    }
                    return a.columnIdx - b.columnIdx;
                } );

            // Class logic - determine which columns are in this breakpoint based
            // on the classes. If no class control (i.e. `auto`) then `-` is used
            // to indicate this to the rest of the function
            var display = $.map( columns, function ( col ) {
                return col.auto && col.minWidth === null ?
                    false :
                    col.auto === true ?
                        '-' :
                        $.inArray( breakpoint, col.includeIn ) !== -1;
            } );

            // Auto column control - first pass: how much width is taken by the
            // ones that must be included from the non-auto columns
            var requiredWidth = 0;
            for ( i=0, ien=display.length ; i<ien ; i++ ) {
                if ( display[i] === true ) {
                    requiredWidth += columns[i].minWidth;
                }
            }

            // Second pass, use up any remaining width for other columns. For
            // scrolling tables we need to subtract the width of the scrollbar. It
            // may not be requires which makes this sub-optimal, but it would
            // require another full redraw to make complete use of those extra few
            // pixels
            var scrolling = dt.settings()[0].oScroll;
            var bar = scrolling.sY || scrolling.sX ? scrolling.iBarWidth : 0;
            var widthAvailable = dt.table().container().offsetWidth - bar;
            var usedWidth = widthAvailable - requiredWidth;

            // Control column needs to always be included. This makes it sub-
            // optimal in terms of using the available with, but to stop layout
            // thrashing or overflow. Also we need to account for the control column
            // width first so we know how much width is available for the other
            // columns, since the control column might not be the first one shown
            for ( i=0, ien=display.length ; i<ien ; i++ ) {
                if ( columns[i].control ) {
                    usedWidth -= columns[i].minWidth;
                }
            }

            // Allow columns to be shown (counting by priority and then right to
            // left) until we run out of room
            var empty = false;
            for ( i=0, ien=order.length ; i<ien ; i++ ) {
                var colIdx = order[i].columnIdx;

                if ( display[colIdx] === '-' && ! columns[colIdx].control && columns[colIdx].minWidth ) {
                    // Once we've found a column that won't fit we don't let any
                    // others display either, or columns might disappear in the
                    // middle of the table
                    if ( empty || usedWidth - columns[colIdx].minWidth < 0 ) {
                        empty = true;
                        display[colIdx] = false;
                    }
                    else {
                        display[colIdx] = true;
                    }

                    usedWidth -= columns[colIdx].minWidth;
                }
            }

            // Determine if the 'control' column should be shown (if there is one).
            // This is the case when there is a hidden column (that is not the
            // control column). The two loops look inefficient here, but they are
            // trivial and will fly through. We need to know the outcome from the
            // first , before the action in the second can be taken
            var showControl = false;

            for ( i=0, ien=columns.length ; i<ien ; i++ ) {
                if ( ! columns[i].control && ! columns[i].never && ! display[i] ) {
                    showControl = true;
                    break;
                }
            }

            for ( i=0, ien=columns.length ; i<ien ; i++ ) {
                if ( columns[i].control ) {
                    display[i] = showControl;
                }
            }

            // Finally we need to make sure that there is at least one column that
            // is visible
            if ( $.inArray( true, display ) === -1 ) {
                display[0] = true;
            }

            return display;
        },


        /**
         * Create the internal `columns` array with information about the columns
         * for the table. This includes determining which breakpoints the column
         * will appear in, based upon class names in the column, which makes up the
         * vast majority of this method.
         *
         * @private
         */
        _classLogic: function ()
        {
            var that = this;
            var calc = {};
            var breakpoints = this.c.breakpoints;
            var dt = this.s.dt;
            var columns = dt.columns().eq(0).map( function (i) {
                var column = this.column(i);
                var className = column.header().className;
                var priority = dt.settings()[0].aoColumns[i].responsivePriority;

                if ( priority === undefined ) {
                    var dataPriority = $(column.header()).data('priority');

                    priority = dataPriority !== undefined ?
                        dataPriority * 1 :
                        10000;
                }

                return {
                    className: className,
                    includeIn: [],
                    auto:      false,
                    control:   false,
                    never:     className.match(/\bnever\b/) ? true : false,
                    priority:  priority
                };
            } );

            // Simply add a breakpoint to `includeIn` array, ensuring that there are
            // no duplicates
            var add = function ( colIdx, name ) {
                var includeIn = columns[ colIdx ].includeIn;

                if ( $.inArray( name, includeIn ) === -1 ) {
                    includeIn.push( name );
                }
            };

            var column = function ( colIdx, name, operator, matched ) {
                var size, i, ien;

                if ( ! operator ) {
                    columns[ colIdx ].includeIn.push( name );
                }
                else if ( operator === 'max-' ) {
                    // Add this breakpoint and all smaller
                    size = that._find( name ).width;

                    for ( i=0, ien=breakpoints.length ; i<ien ; i++ ) {
                        if ( breakpoints[i].width <= size ) {
                            add( colIdx, breakpoints[i].name );
                        }
                    }
                }
                else if ( operator === 'min-' ) {
                    // Add this breakpoint and all larger
                    size = that._find( name ).width;

                    for ( i=0, ien=breakpoints.length ; i<ien ; i++ ) {
                        if ( breakpoints[i].width >= size ) {
                            add( colIdx, breakpoints[i].name );
                        }
                    }
                }
                else if ( operator === 'not-' ) {
                    // Add all but this breakpoint
                    for ( i=0, ien=breakpoints.length ; i<ien ; i++ ) {
                        if ( breakpoints[i].name.indexOf( matched ) === -1 ) {
                            add( colIdx, breakpoints[i].name );
                        }
                    }
                }
            };

            // Loop over each column and determine if it has a responsive control
            // class
            columns.each( function ( col, i ) {
                var classNames = col.className.split(' ');
                var hasClass = false;

                // Split the class name up so multiple rules can be applied if needed
                for ( var k=0, ken=classNames.length ; k<ken ; k++ ) {
                    var className = $.trim( classNames[k] );

                    if ( className === 'all' ) {
                        // Include in all
                        hasClass = true;
                        col.includeIn = $.map( breakpoints, function (a) {
                            return a.name;
                        } );
                        return;
                    }
                    else if ( className === 'none' || col.never ) {
                        // Include in none (default) and no auto
                        hasClass = true;
                        return;
                    }
                    else if ( className === 'control' ) {
                        // Special column that is only visible, when one of the other
                        // columns is hidden. This is used for the details control
                        hasClass = true;
                        col.control = true;
                        return;
                    }

                    $.each( breakpoints, function ( j, breakpoint ) {
                        // Does this column have a class that matches this breakpoint?
                        var brokenPoint = breakpoint.name.split('-');
                        var re = new RegExp( '(min\\-|max\\-|not\\-)?('+brokenPoint[0]+')(\\-[_a-zA-Z0-9])?' );
                        var match = className.match( re );

                        if ( match ) {
                            hasClass = true;

                            if ( match[2] === brokenPoint[0] && match[3] === '-'+brokenPoint[1] ) {
                                // Class name matches breakpoint name fully
                                column( i, breakpoint.name, match[1], match[2]+match[3] );
                            }
                            else if ( match[2] === brokenPoint[0] && ! match[3] ) {
                                // Class name matched primary breakpoint name with no qualifier
                                column( i, breakpoint.name, match[1], match[2] );
                            }
                        }
                    } );
                }

                // If there was no control class, then automatic sizing is used
                if ( ! hasClass ) {
                    col.auto = true;
                }
            } );

            this.s.columns = columns;
        },


        /**
         * Show the details for the child row
         *
         * @param  {DataTables.Api} row    API instance for the row
         * @param  {boolean}        update Update flag
         * @private
         */
        _detailsDisplay: function ( row, update )
        {
            var that = this;
            var dt = this.s.dt;
            var details = this.c.details;

            if ( details && details.type ) {
                var res = details.display( row, update, function () {
                    return details.renderer(
                        dt, row[0], that._detailsObj(row[0])
                    );
                } );

                if ( res === true || res === false ) {
                    $(dt.table().node()).triggerHandler( 'responsive-display.dt', [dt, row, res, update] );
                }
            }
        },


        /**
         * Initialisation for the details handler
         *
         * @private
         */
        _detailsInit: function ()
        {
            var that    = this;
            var dt      = this.s.dt;
            var details = this.c.details;

            // The inline type always uses the first child as the target
            if ( details.type === 'inline' ) {
                details.target = 'td:first-child, th:first-child';
            }

            // Keyboard accessibility
            dt.on( 'draw.dtr', function () {
                that._tabIndexes();
            } );
            that._tabIndexes(); // Initial draw has already happened

            $( dt.table().body() ).on( 'keyup.dtr', 'td, th', function (e) {
                if ( e.keyCode === 13 && $(this).data('dtr-keyboard') ) {
                    $(this).click();
                }
            } );

            // type.target can be a string jQuery selector or a column index
            var target   = details.target;
            var selector = typeof target === 'string' ? target : 'td, th';

            // Click handler to show / hide the details rows when they are available
            $( dt.table().body() )
                .on( 'click.dtr mousedown.dtr mouseup.dtr', selector, function (e) {
                    // If the table is not collapsed (i.e. there is no hidden columns)
                    // then take no action
                    if ( ! $(dt.table().node()).hasClass('collapsed' ) ) {
                        return;
                    }

                    // Check that the row is actually a DataTable's controlled node
                    if ( ! dt.row( $(this).closest('tr') ).length ) {
                        return;
                    }

                    // For column index, we determine if we should act or not in the
                    // handler - otherwise it is already okay
                    if ( typeof target === 'number' ) {
                        var targetIdx = target < 0 ?
                            dt.columns().eq(0).length + target :
                            target;

                        if ( dt.cell( this ).index().column !== targetIdx ) {
                            return;
                        }
                    }

                    // $().closest() includes itself in its check
                    var row = dt.row( $(this).closest('tr') );

                    // Check event type to do an action
                    if ( e.type === 'click' ) {
                        // The renderer is given as a function so the caller can execute it
                        // only when they need (i.e. if hiding there is no point is running
                        // the renderer)
                        that._detailsDisplay( row, false );
                    }
                    else if ( e.type === 'mousedown' ) {
                        // For mouse users, prevent the focus ring from showing
                        $(this).css('outline', 'none');
                    }
                    else if ( e.type === 'mouseup' ) {
                        // And then re-allow at the end of the click
                        $(this).blur().css('outline', '');
                    }
                } );
        },


        /**
         * Get the details to pass to a renderer for a row
         * @param  {int} rowIdx Row index
         * @private
         */
        _detailsObj: function ( rowIdx )
        {
            var that = this;
            var dt = this.s.dt;

            return $.map( this.s.columns, function( col, i ) {
                if ( col.never ) {
                    return;
                }

                return {
                    title:       dt.settings()[0].aoColumns[ i ].sTitle,
                    data:        dt.cell( rowIdx, i ).render( that.c.orthogonal ),
                    hidden:      dt.column( i ).visible() && !that.s.current[ i ],
                    columnIndex: i,
                    rowIndex:    rowIdx
                };
            } );
        },


        /**
         * Find a breakpoint object from a name
         *
         * @param  {string} name Breakpoint name to find
         * @return {object}      Breakpoint description object
         * @private
         */
        _find: function ( name )
        {
            var breakpoints = this.c.breakpoints;

            for ( var i=0, ien=breakpoints.length ; i<ien ; i++ ) {
                if ( breakpoints[i].name === name ) {
                    return breakpoints[i];
                }
            }
        },


        /**
         * Re-create the contents of the child rows as the display has changed in
         * some way.
         *
         * @private
         */
        _redrawChildren: function ()
        {
            var that = this;
            var dt = this.s.dt;

            dt.rows( {page: 'current'} ).iterator( 'row', function ( settings, idx ) {
                var row = dt.row( idx );

                that._detailsDisplay( dt.row( idx ), true );
            } );
        },


        /**
         * Alter the table display for a resized viewport. This involves first
         * determining what breakpoint the window currently is in, getting the
         * column visibilities to apply and then setting them.
         *
         * @private
         */
        _resize: function ()
        {
            var that = this;
            var dt = this.s.dt;
            var width = $(window).width();
            var breakpoints = this.c.breakpoints;
            var breakpoint = breakpoints[0].name;
            var columns = this.s.columns;
            var i, ien;
            var oldVis = this.s.current.slice();

            // Determine what breakpoint we are currently at
            for ( i=breakpoints.length-1 ; i>=0 ; i-- ) {
                if ( width <= breakpoints[i].width ) {
                    breakpoint = breakpoints[i].name;
                    break;
                }
            }

            // Show the columns for that break point
            var columnsVis = this._columnsVisiblity( breakpoint );
            this.s.current = columnsVis;

            // Set the class before the column visibility is changed so event
            // listeners know what the state is. Need to determine if there are
            // any columns that are not visible but can be shown
            var collapsedClass = false;
            for ( i=0, ien=columns.length ; i<ien ; i++ ) {
                if ( columnsVis[i] === false && ! columns[i].never && ! columns[i].control ) {
                    collapsedClass = true;
                    break;
                }
            }

            $( dt.table().node() ).toggleClass( 'collapsed', collapsedClass );

            var changed = false;

            dt.columns().eq(0).each( function ( colIdx, i ) {
                if ( columnsVis[i] !== oldVis[i] ) {
                    changed = true;
                    that._setColumnVis( colIdx, columnsVis[i] );
                }
            } );

            if ( changed ) {
                this._redrawChildren();

                // Inform listeners of the change
                $(dt.table().node()).trigger( 'responsive-resize.dt', [dt, this.s.current] );
            }
        },


        /**
         * Determine the width of each column in the table so the auto column hiding
         * has that information to work with. This method is never going to be 100%
         * perfect since column widths can change slightly per page, but without
         * seriously compromising performance this is quite effective.
         *
         * @private
         */
        _resizeAuto: function ()
        {
            var dt = this.s.dt;
            var columns = this.s.columns;

            // Are we allowed to do auto sizing?
            if ( ! this.c.auto ) {
                return;
            }

            // Are there any columns that actually need auto-sizing, or do they all
            // have classes defined
            if ( $.inArray( true, $.map( columns, function (c) { return c.auto; } ) ) === -1 ) {
                return;
            }

            // Clone the table with the current data in it
            var tableWidth   = dt.table().node().offsetWidth;
            var columnWidths = dt.columns;
            var clonedTable  = dt.table().node().cloneNode( false );
            var clonedHeader = $( dt.table().header().cloneNode( false ) ).appendTo( clonedTable );
            var clonedBody   = $( dt.table().body() ).clone( false, false ).empty().appendTo( clonedTable ); // use jQuery because of IE8

            // Header
            var headerCells = dt.columns()
                .header()
                .filter( function (idx) {
                    return dt.column(idx).visible();
                } )
                .to$()
                .clone( false )
                .css( 'display', 'table-cell' );

            // Body rows - we don't need to take account of DataTables' column
            // visibility since we implement our own here (hence the `display` set)
            $(clonedBody)
                .append( $(dt.rows( { page: 'current' } ).nodes()).clone( false ) )
                .find( 'th, td' ).css( 'display', '' );

            // Footer
            var footer = dt.table().footer();
            if ( footer ) {
                var clonedFooter = $( footer.cloneNode( false ) ).appendTo( clonedTable );
                var footerCells = dt.columns()
                    .header()
                    .filter( function (idx) {
                        return dt.column(idx).visible();
                    } )
                    .to$()
                    .clone( false )
                    .css( 'display', 'table-cell' );

                $('<tr/>')
                    .append( footerCells )
                    .appendTo( clonedFooter );
            }

            $('<tr/>')
                .append( headerCells )
                .appendTo( clonedHeader );

            // In the inline case extra padding is applied to the first column to
            // give space for the show / hide icon. We need to use this in the
            // calculation
            if ( this.c.details.type === 'inline' ) {
                $(clonedTable).addClass( 'dtr-inline collapsed' );
            }

            var inserted = $('<div/>')
                .css( {
                    width: 1,
                    height: 1,
                    overflow: 'hidden'
                } )
                .append( clonedTable );

            inserted.insertBefore( dt.table().node() );

            // The cloned header now contains the smallest that each column can be
            headerCells.each( function (i) {
                var idx = dt.column.index( 'fromVisible', i );
                columns[ idx ].minWidth =  this.offsetWidth || 0;
            } );

            inserted.remove();
        },

        /**
         * Set a column's visibility.
         *
         * We don't use DataTables' column visibility controls in order to ensure
         * that column visibility can Responsive can no-exist. Since only IE8+ is
         * supported (and all evergreen browsers of course) the control of the
         * display attribute works well.
         *
         * @param {integer} col      Column index
         * @param {boolean} showHide Show or hide (true or false)
         * @private
         */
        _setColumnVis: function ( col, showHide )
        {
            var dt = this.s.dt;
            var display = showHide ? '' : 'none'; // empty string will remove the attr

            $( dt.column( col ).header() ).css( 'display', display );
            $( dt.column( col ).footer() ).css( 'display', display );
            dt.column( col ).nodes().to$().css( 'display', display );
        },


        /**
         * Update the cell tab indexes for keyboard accessibility. This is called on
         * every table draw - that is potentially inefficient, but also the least
         * complex option given that column visibility can change on the fly. Its a
         * shame user-focus was removed from CSS 3 UI, as it would have solved this
         * issue with a single CSS statement.
         *
         * @private
         */
        _tabIndexes: function ()
        {
            var dt = this.s.dt;
            var cells = dt.cells( { page: 'current' } ).nodes().to$();
            var ctx = dt.settings()[0];
            var target = this.c.details.target;

            cells.filter( '[data-dtr-keyboard]' ).removeData( '[data-dtr-keyboard]' );

            var selector = typeof target === 'number' ?
                ':eq('+target+')' :
                target;

            $( selector, dt.rows( { page: 'current' } ).nodes() )
                .attr( 'tabIndex', ctx.iTabIndex )
                .data( 'dtr-keyboard', 1 );
        }
    } );


    /**
     * List of default breakpoints. Each item in the array is an object with two
     * properties:
     *
     * * `name` - the breakpoint name.
     * * `width` - the breakpoint width
     *
     * @name Responsive.breakpoints
     * @static
     */
    Responsive.breakpoints = [
        { name: 'desktop',  width: Infinity },
        { name: 'tablet-l', width: 1024 },
        { name: 'tablet-p', width: 768 },
        { name: 'mobile-l', width: 480 },
        { name: 'mobile-p', width: 320 }
    ];


    /**
     * Display methods - functions which define how the hidden data should be shown
     * in the table.
     *
     * @namespace
     * @name Responsive.defaults
     * @static
     */
    Responsive.display = {
        childRow: function ( row, update, render ) {
            if ( update ) {
                if ( $(row.node()).hasClass('parent') ) {
                    row.child( render(), 'child' ).show();

                    return true;
                }
            }
            else {
                if ( ! row.child.isShown()  ) {
                    row.child( render(), 'child' ).show();
                    $( row.node() ).addClass( 'parent' );

                    return true;
                }
                else {
                    row.child( false );
                    $( row.node() ).removeClass( 'parent' );

                    return false;
                }
            }
        },

        childRowImmediate: function ( row, update, render ) {
            if ( (! update && row.child.isShown()) || ! row.responsive.hasHidden() ) {
                // User interaction and the row is show, or nothing to show
                row.child( false );
                $( row.node() ).removeClass( 'parent' );

                return false;
            }
            else {
                // Display
                row.child( render(), 'child' ).show();
                $( row.node() ).addClass( 'parent' );

                return true;
            }
        },

        // This is a wrapper so the modal options for Bootstrap and jQuery UI can
        // have options passed into them. This specific one doesn't need to be a
        // function but it is for consistency in the `modal` name
        modal: function ( options ) {
            return function ( row, update, render ) {
                if ( ! update ) {
                    // Show a modal
                    var close = function () {
                        modal.remove(); // will tidy events for us
                        $(document).off( 'keypress.dtr' );
                    };

                    var modal = $('<div class="dtr-modal"/>')
                        .append( $('<div class="dtr-modal-display"/>')
                            .append( $('<div class="dtr-modal-content"/>')
                                .append( render() )
                            )
                            .append( $('<div class="dtr-modal-close">&times;</div>' )
                                .click( function () {
                                    close();
                                } )
                            )
                        )
                        .append( $('<div class="dtr-modal-background"/>')
                            .click( function () {
                                close();
                            } )
                        )
                        .appendTo( 'body' );

                    $(document).on( 'keyup.dtr', function (e) {
                        if ( e.keyCode === 27 ) {
                            e.stopPropagation();

                            close();
                        }
                    } );
                }
                else {
                    $('div.dtr-modal-content')
                        .empty()
                        .append( render() );
                }

                if ( options && options.header ) {
                    $('div.dtr-modal-content').prepend(
                        '<h2>'+options.header( row )+'</h2>'
                    );
                }
            };
        }
    };


    /**
     * Responsive default settings for initialisation
     *
     * @namespace
     * @name Responsive.defaults
     * @static
     */
    Responsive.defaults = {
        /**
         * List of breakpoints for the instance. Note that this means that each
         * instance can have its own breakpoints. Additionally, the breakpoints
         * cannot be changed once an instance has been creased.
         *
         * @type {Array}
         * @default Takes the value of `Responsive.breakpoints`
         */
        breakpoints: Responsive.breakpoints,

        /**
         * Enable / disable auto hiding calculations. It can help to increase
         * performance slightly if you disable this option, but all columns would
         * need to have breakpoint classes assigned to them
         *
         * @type {Boolean}
         * @default  `true`
         */
        auto: true,

        /**
         * Details control. If given as a string value, the `type` property of the
         * default object is set to that value, and the defaults used for the rest
         * of the object - this is for ease of implementation.
         *
         * The object consists of the following properties:
         *
         * * `display` - A function that is used to show and hide the hidden details
         * * `renderer` - function that is called for display of the child row data.
         *   The default function will show the data from the hidden columns
         * * `target` - Used as the selector for what objects to attach the child
         *   open / close to
         * * `type` - `false` to disable the details display, `inline` or `column`
         *   for the two control types
         *
         * @type {Object|string}
         */
        details: {
            display: Responsive.display.childRow,

            renderer: function ( api, rowIdx, columns ) {
                var data = $.map( columns, function ( col, i ) {
                    return col.hidden ?
                        '<li data-dtr-index="'+col.columnIndex+'" data-dt-row="'+col.rowIndex+'" data-dt-column="'+col.columnIndex+'">'+
                        '<span class="dtr-title">'+
                        col.title+
                        '</span> '+
                        '<span class="dtr-data">'+
                        col.data+
                        '</span>'+
                        '</li>' :
                        '';
                } ).join('');

                return data ?
                    $('<ul data-dtr-index="'+rowIdx+'"/>').append( data ) :
                    false;
            },

            target: 0,

            type: 'inline'
        },

        /**
         * Orthogonal data request option. This is used to define the data type
         * requested when Responsive gets the data to show in the child row.
         *
         * @type {String}
         */
        orthogonal: 'display'
    };


    /*
     * API
     */
    var Api = $.fn.dataTable.Api;

// Doesn't do anything - work around for a bug in DT... Not documented
    Api.register( 'responsive()', function () {
        return this;
    } );

    Api.register( 'responsive.index()', function ( li ) {
        li = $(li);

        return {
            column: li.data('dtr-index'),
            row:    li.parent().data('dtr-index')
        };
    } );

    Api.register( 'responsive.rebuild()', function () {
        return this.iterator( 'table', function ( ctx ) {
            if ( ctx._responsive ) {
                ctx._responsive._classLogic();
            }
        } );
    } );

    Api.register( 'responsive.recalc()', function () {
        return this.iterator( 'table', function ( ctx ) {
            if ( ctx._responsive ) {
                ctx._responsive._resizeAuto();
                ctx._responsive._resize();
            }
        } );
    } );

    Api.register( 'responsive.hasHidden()', function () {
        var ctx = this.context[0];

        return ctx._responsive ?
            $.inArray( false, ctx._responsive.s.current ) !== -1 :
            false;
    } );


    /**
     * Version information
     *
     * @name Responsive.version
     * @static
     */
    Responsive.version = '2.0.2';


    $.fn.dataTable.Responsive = Responsive;
    $.fn.DataTable.Responsive = Responsive;

// Attach a listener to the document which listens for DataTables initialisation
// events so we can automatically initialise
    $(document).on( 'preInit.dt.dtr', function (e, settings, json) {
        if ( e.namespace !== 'dt' ) {
            return;
        }

        if ( $(settings.nTable).hasClass( 'responsive' ) ||
            $(settings.nTable).hasClass( 'dt-responsive' ) ||
            settings.oInit.responsive ||
            DataTable.defaults.responsive
        ) {
            var init = settings.oInit.responsive;

            if ( init !== false ) {
                new Responsive( settings, $.isPlainObject( init ) ? init : {}  );
            }
        }
    } );


    return Responsive;
}));

/* responsive.bootstrap.js */
/*! Bootstrap integration for DataTables' Responsive
 * ©2015 SpryMedia Ltd - datatables.net/license
 */

(function( factory ){
    if ( typeof define === 'function' && define.amd ) {
        // AMD
        define( ['jquery', 'datatables.net-bs', 'datatables.net-responsive'], function ( $ ) {
            return factory( $, window, document );
        } );
    }
    else if ( typeof exports === 'object' ) {
        // CommonJS
        module.exports = function (root, $) {
            if ( ! root ) {
                root = window;
            }

            if ( ! $ || ! $.fn.dataTable ) {
                $ = require('datatables.net-bs')(root, $).$;
            }

            if ( ! $.fn.dataTable.Responsive ) {
                require('datatables.net-responsive')(root, $);
            }

            return factory( $, root, root.document );
        };
    }
    else {
        // Browser
        factory( jQuery, window, document );
    }
}(function( $, window, document, undefined ) {
    'use strict';
    var DataTable = $.fn.dataTable;


    var _display = DataTable.Responsive.display;
    var _original = _display.modal;

    _display.modal = function ( options ) {
        return function ( row, update, render ) {
            if ( ! $.fn.modal ) {
                _original( row, update, render );
            }
            else {
                if ( ! update ) {
                    var modal = $(
                        '<div class="modal fade" role="dialog">'+
                        '<div class="modal-dialog" role="document">'+
                        '<div class="modal-content">'+
                        '<div class="modal-header">'+
                        '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>'+
                        '</div>'+
                        '<div class="modal-body"/>'+
                        '</div>'+
                        '</div>'+
                        '</div>'
                    );

                    if ( options && options.header ) {
                        modal.find('div.modal-header')
                            .append( '<h4 class="modal-title">'+options.header( row )+'</h4>' );
                    }

                    modal.find( 'div.modal-body' ).append( render() );
                    modal
                        .appendTo( 'body' )
                        .modal();
                }
            }
        };
    };


    return DataTable.Responsive;
}));


