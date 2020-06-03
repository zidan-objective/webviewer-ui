var Sr = 2;
var Pr = 4;
var xr = 2;
var Er = 16;

function draw(params) {
  /*
  canvas: canvas
color: t {__ownerID: undefined, _values: t}
container: div.PSPDFKit-8ugcetk8xmqjqzmd9g1g3jjxg3.PSPDFKit-Stamp-Editor
defaultStampWidth: 192
stampHeight: 96
subtitle: '05/26/2020, 03:33 PM'
title: 'S'
  */
  var _canvas = params.canvas;
  var pTitle = params.title;
  var str = params.subtitle;
  var stroke = params.color;
  var width = params.defaultStampWidth;
  var scale = params.stampHeight;
  var _container = params.container;
  var size = width * Sr;
  if (_canvas && _container && _container.offsetWidth) {
    var ctx = _canvas.getContext('2d');
    var l = 'string' === typeof str && str.length > 0;
    var template = function(options) {
      var context = options.ctx;
      var value = options.title;
      var size = options.fontSize;
      var containerWidth = options.containerWidth;
      context.font = 'bold '.concat(size, 'px Arial');
      var item = context.measureText(value);
      var largetsBoxHeight = containerWidth ;
      var pad = size;
      return item.width + pad > largetsBoxHeight ? size = largetsBoxHeight / ((item.width + pad) / size) : largetsBoxHeight = item.width + pad, {
        fontSize : size,
        stampWidth : largetsBoxHeight
      };
    }({
      ctx : ctx,
      title : pTitle,
      fontSize : (l ? .6 : .7) * Sr * scale,
      containerWidth : _container.offsetWidth
    });


    size = Math.max(template.stampWidth, width * Sr);
    _canvas.width = size;
    _canvas.height = scale * Sr;
    ctx.clearRect(0, 0, _canvas.width, _canvas.height);

    (function(result) {
      var ctx = result.ctx;
      var x = result.stampWidth;
      var courseSections = result.stampHeight;
      var out = result.color;
      ctx.lineWidth = Pr;
      var width = x - xr;
      var y2 = Sr * courseSections - xr;
      ctx.strokeStyle = out.toCSSValue();
      ctx.fillStyle = out.lighter(50 /*ne.w*/).toCSSValue();
      ctx.beginPath();
      ctx.moveTo(Er + xr, xr);
      ctx.lineTo(width - Er, xr);
      ctx.quadraticCurveTo(width - 1, xr, width - 1, Er + xr);
      ctx.lineTo(width - 1, y2 - Er);
      ctx.quadraticCurveTo(width - 1, y2, width - Er, y2);
      ctx.lineTo(Er + xr, y2);
      ctx.quadraticCurveTo(xr, y2, xr, y2 - Er);
      ctx.lineTo(xr, Er + xr);
      ctx.quadraticCurveTo(xr, xr, Er + xr, xr);
      ctx.closePath();
      ctx.stroke();
      ctx.fill();
    })({
      ctx: ctx,
      stampWidth: size,
      color: stroke,
      stampHeight: scale
    });

    (function(data) {
      var context = data.ctx;
      var size = data.fontSize;
      var oldValue = data.color;
      var width = data.stampWidth;
      var height = data.stampHeight;
      var id = data.title;
      var show = data.hasSubTitle;
      context.font = 'bold '.concat(size, 'px Arial');
      context.fillStyle = oldValue.toCSSValue();
      context.textBaseline = 'middle';
      context.textAlign = 'center';
      context.fillText(id, width / 2, (show ? .4 * height : .5 * height) * Sr);
    })({
      ctx: ctx,
      fontSize: template.fontSize,
      color : stroke,
      stampWidth : size,
      stampHeight : scale,
      title : pTitle,
      hasSubTitle : l
    });


    if (l) {
      ctx.font = ''.concat(Sr * scale * .175, 'px Arial');
      ctx.fillText(str, size / 2, .85 * scale * Sr);
    }


  }
  return size / Sr;
};