(function(exports) {
    var Util = {
        extend: function() {
            arguments[0] = arguments[0] || {};
            for (var i = 1; i < arguments.length; i += 1) {
                for (var key in arguments[i]) {
                    if (arguments[i].hasOwnProperty(key)) {
                        if (typeof(arguments[i][key]) === 'object') {
                            if (arguments[i][key] instanceof Array) {
                                arguments[0][key] = arguments[i][key]
                            } else {
                                arguments[0][key] = Util.extend(arguments[0][key], arguments[i][key])
                            }
                        } else {
                            arguments[0][key] = arguments[i][key]
                        }
                    }
                }
            }
            return arguments[0]
        }
    };

    function TimeSeries(options) {
        this.options = Util.extend({}, TimeSeries.defaultOptions, options);
        this.clear()
    }
    TimeSeries.defaultOptions = {
        resetBoundsInterval: 3000,
        resetBounds: true
    };
    TimeSeries.prototype.clear = function() {
        this.data = [];
        this.maxValue = Number.NaN;
        this.minValue = Number.NaN;
    };
    TimeSeries.prototype.resetBounds = function() {
        if (this.data.length) {
            this.maxValue = this.data[0][1];
            this.minValue = this.data[0][1];
            for (var i = 1; i < this.data.length; i += 1) {
                var value = this.data[i][1];
                if (value > this.maxValue) {
                    this.maxValue = value
                }
                if (value < this.minValue) {
                    this.minValue = value
                }
            }
        } else {
            this.maxValue = Number.NaN;
            this.minValue = Number.NaN
        }
    };
    TimeSeries.prototype.append = function(timestamp, value, sumRepeatedTimeStampValues) {
        var i = this.data.length - 1;
        while (i >= 0 && this.data[i][0] > timestamp) {
            i -= 1
        }
        if (i === -1) {
            this.data.splice(0, 0, [timestamp, value])
        } else if (this.data.length > 0 && this.data[i][0] === timestamp) {
            if (sumRepeatedTimeStampValues) {
                this.data[i][1] += value;
                value = this.data[i][1]
            } else {
                this.data[i][1] = value
            }
        } else if (i < this.data.length - 1) {
            this.data.splice(i + 1, 0, [timestamp, value])
        } else {
            this.data.push([timestamp, value])
        }
        this.maxValue = isNaN(this.maxValue) ? value : Math.max(this.maxValue, value);
        this.minValue = isNaN(this.minValue) ? value : Math.min(this.minValue, value)
    };
    TimeSeries.prototype.dropOldData = function(oldestValidTime, maxDataSetLength) {
        var removeCount = 0;
        while (this.data.length - removeCount >= maxDataSetLength && this.data[removeCount + 1][0] < oldestValidTime) {
            removeCount += 1
        }
        if (removeCount !== 0) {
            this.data.splice(0, removeCount)
        }
    };

    function SmoothieChart(options) {
        this.options = Util.extend({}, SmoothieChart.defaultChartOptions, options);
        this.seriesSet = [];
        this.currentValueRange = 1;
        this.currentVisMinValue = 0;
        this.lastRenderTimeMillis = 0
    }
    SmoothieChart.defaultChartOptions = {
        millisPerPixel: 20,
        enableDpiScaling: true,
        yMinFormatter: function(min, precision) {
            return parseFloat(min).toFixed(precision)
        },
        yMaxFormatter: function(max, precision) {
            return parseFloat(max).toFixed(precision)
        },
        maxValueScale: 1,
        minValueScale: 1,
        interpolation: 'bezier',
        scaleSmoothing: 0.125,
        maxDataSetLength: 2,
        scrollBackwards: false,
        grid: {
            fillStyle: '#000000',
            strokeStyle: '#777777',
            lineWidth: 1,
            sharpLines: false,
            millisPerLine: 1000,
            verticalSections: 2,
            borderVisible: true
        },
        labels: {
            fillStyle: '#ffffff',
            disabled: false,
            fontSize: 10,
            fontFamily: 'monospace',
            precision: 2
        },
        horizontalLines: []
    };
    SmoothieChart.AnimateCompatibility = (function() {
        var requestAnimationFrame = function(callback, element) {
                var requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) {
                    return window.setTimeout(function() {
                        callback(new Date().getTime())
                    }, 16)
                };
                return requestAnimationFrame.call(window, callback, element)
            },
            cancelAnimationFrame = function(id) {
                var cancelAnimationFrame = window.cancelAnimationFrame || function(id) {
                    clearTimeout(id)
                };
                return cancelAnimationFrame.call(window, id)
            };
        return {
            requestAnimationFrame: requestAnimationFrame,
            cancelAnimationFrame: cancelAnimationFrame
        }
    })();
    SmoothieChart.defaultSeriesPresentationOptions = {
        lineWidth: 1,
        strokeStyle: '#ffffff'
    };
    SmoothieChart.prototype.addTimeSeries = function(timeSeries, options) {
        this.seriesSet.push({
            timeSeries: timeSeries,
            options: Util.extend({}, SmoothieChart.defaultSeriesPresentationOptions, options)
        });
        if (timeSeries.options.resetBounds && timeSeries.options.resetBoundsInterval > 0) {
            timeSeries.resetBoundsTimerId = setInterval(function() {
                timeSeries.resetBounds()
            }, timeSeries.options.resetBoundsInterval)
        }
    };
    SmoothieChart.prototype.removeTimeSeries = function(timeSeries) {
        var numSeries = this.seriesSet.length;
        for (var i = 0; i < numSeries; i += 1) {
            if (this.seriesSet[i].timeSeries === timeSeries) {
                this.seriesSet.splice(i, 1);
                break
            }
        }
        if (timeSeries.resetBoundsTimerId) {
            clearInterval(timeSeries.resetBoundsTimerId)
        }
    };
    SmoothieChart.prototype.getTimeSeriesOptions = function(timeSeries) {
        var numSeries = this.seriesSet.length;
        for (var i = 0; i < numSeries; i += 1) {
            if (this.seriesSet[i].timeSeries === timeSeries) {
                return this.seriesSet[i].options
            }
        }
    };
    SmoothieChart.prototype.bringToFront = function(timeSeries) {
        var numSeries = this.seriesSet.length;
        for (var i = 0; i < numSeries; i += 1) {
            if (this.seriesSet[i].timeSeries === timeSeries) {
                var set = this.seriesSet.splice(i, 1);
                this.seriesSet.push(set[0]);
                break
            }
        }
    };
    SmoothieChart.prototype.streamTo = function(canvas, delayMillis) {
        this.canvas = canvas;
        this.delay = delayMillis;
        this.start()
    };
    SmoothieChart.prototype.resize = function() {
        if (!this.options.enableDpiScaling || !window || window.devicePixelRatio === 1) {
            return
        }
        var dpr = window.devicePixelRatio;
        var width = parseInt(this.canvas.getAttribute('width'));
        var height = parseInt(this.canvas.getAttribute('height'));
        if (!this.originalWidth || (Math.floor(this.originalWidth * dpr) !== width)) {
            this.originalWidth = width;
            this.canvas.setAttribute('width', (Math.floor(width * dpr)).toString());
            this.canvas.style.width = width + 'px';
            this.canvas.getContext('2d').scale(dpr, dpr)
        }
        if (!this.originalHeight || (Math.floor(this.originalHeight * dpr) !== height)) {
            this.originalHeight = height;
            this.canvas.setAttribute('height', (Math.floor(height * dpr)).toString());
            this.canvas.style.height = height + 'px';
            this.canvas.getContext('2d').scale(dpr, dpr)
        }
    };
    SmoothieChart.prototype.start = function() {
        if (this.frame) {
            return
        }
        var animate = function() {
            this.frame = SmoothieChart.AnimateCompatibility.requestAnimationFrame(function() {
                this.render();
                animate()
            }.bind(this))
        }.bind(this);
        animate()
    };
    SmoothieChart.prototype.stop = function() {
        if (this.frame) {
            SmoothieChart.AnimateCompatibility.cancelAnimationFrame(this.frame);
            delete this.frame
        }
    };
    SmoothieChart.prototype.updateValueRange = function() {
        var chartOptions = this.options,
            chartMaxValue = Number.NaN,
            chartMinValue = Number.NaN;
        for (var d = 0; d < this.seriesSet.length; d += 1) {
            var timeSeries = this.seriesSet[d].timeSeries;
            if (!isNaN(timeSeries.maxValue)) {
                chartMaxValue = !isNaN(chartMaxValue) ? Math.max(chartMaxValue, timeSeries.maxValue) : timeSeries.maxValue
            }
            if (!isNaN(timeSeries.minValue)) {
                chartMinValue = !isNaN(chartMinValue) ? Math.min(chartMinValue, timeSeries.minValue) : timeSeries.minValue
            }
        }
        if (chartOptions.maxValue != null) {
            chartMaxValue = chartOptions.maxValue
        } else {
            chartMaxValue *= chartOptions.maxValueScale
        }
        if (chartOptions.minValue != null) {
            chartMinValue = chartOptions.minValue
        } else {
            chartMinValue -= Math.abs(chartMinValue * chartOptions.minValueScale - chartMinValue)
        }
        if (this.options.yRangeFunction) {
            var range = this.options.yRangeFunction({
                min: chartMinValue,
                max: chartMaxValue
            });
            chartMinValue = range.min;
            chartMaxValue = range.max
        }
        if (!isNaN(chartMaxValue) && !isNaN(chartMinValue)) {
            var targetValueRange = chartMaxValue - chartMinValue;
            var valueRangeDiff = (targetValueRange - this.currentValueRange);
            var minValueDiff = (chartMinValue - this.currentVisMinValue);
            this.isAnimatingScale = Math.abs(valueRangeDiff) > 0.1 || Math.abs(minValueDiff) > 0.1;
            this.currentValueRange += chartOptions.scaleSmoothing * valueRangeDiff;
            this.currentVisMinValue += chartOptions.scaleSmoothing * minValueDiff
        }
        this.valueRange = {
            min: chartMinValue,
            max: chartMaxValue
        }
    };
    SmoothieChart.prototype.render = function(canvas, time) {
        var nowMillis = new Date().getTime();
        if (!this.isAnimatingScale) {
            var maxIdleMillis = Math.min(1000 / 6, this.options.millisPerPixel);
            if (nowMillis - this.lastRenderTimeMillis < maxIdleMillis) {
                return
            }
        }
        this.resize();
        this.lastRenderTimeMillis = nowMillis;
        canvas = canvas || this.canvas;
        time = time || nowMillis - (this.delay || 0);
        time -= time % this.options.millisPerPixel;
        var context = canvas.getContext('2d'),
            chartOptions = this.options,
            dimensions = {
                top: 0,
                left: 0,
                width: canvas.clientWidth,
                height: canvas.clientHeight
            },
            oldestValidTime = time - (dimensions.width * chartOptions.millisPerPixel),
            valueToYPixel = function(value) {
                var offset = value - this.currentVisMinValue;
                return this.currentValueRange === 0 ? dimensions.height : dimensions.height - (Math.round((offset / this.currentValueRange) * dimensions.height))
            }.bind(this),
            timeToXPixel = function(t) {
                if (chartOptions.scrollBackwards) {
                    return Math.round((time - t) / chartOptions.millisPerPixel)
                }
                return Math.round(dimensions.width - ((time - t) / chartOptions.millisPerPixel))
            };
        this.updateValueRange();
        context.font = chartOptions.labels.fontSize + 'px ' + chartOptions.labels.fontFamily;
        context.save();
        context.translate(dimensions.left, dimensions.top);
        context.beginPath();
        context.rect(0, 0, dimensions.width, dimensions.height);
        context.clip();
        context.save();
        context.fillStyle = chartOptions.grid.fillStyle;
        context.clearRect(0, 0, dimensions.width, dimensions.height);
        context.fillRect(0, 0, dimensions.width, dimensions.height);
        context.restore();
        context.save();
        context.lineWidth = chartOptions.grid.lineWidth;
        context.strokeStyle = chartOptions.grid.strokeStyle;
        if (chartOptions.grid.millisPerLine > 0) {
            context.beginPath();
            for (var t = time - (time % chartOptions.grid.millisPerLine); t >= oldestValidTime; t -= chartOptions.grid.millisPerLine) {
                var gx = timeToXPixel(t);
                if (chartOptions.grid.sharpLines) {
                    gx -= 0.5
                }
                context.moveTo(gx, 0);
                context.lineTo(gx, dimensions.height)
            }
            context.stroke();
            context.closePath()
        }
        for (var v = 1; v < chartOptions.grid.verticalSections; v += 1) {
            var gy = Math.round(v * dimensions.height / chartOptions.grid.verticalSections);
            if (chartOptions.grid.sharpLines) {
                gy -= 0.5
            }
            context.beginPath();
            context.moveTo(0, gy);
            context.lineTo(dimensions.width, gy);
            context.stroke();
            context.closePath()
        }
        if (chartOptions.grid.borderVisible) {
            context.beginPath();
            context.strokeRect(0, 0, dimensions.width, dimensions.height);
            context.closePath()
        }
        context.restore();
        if (chartOptions.horizontalLines && chartOptions.horizontalLines.length) {
            for (var hl = 0; hl < chartOptions.horizontalLines.length; hl += 1) {
                var line = chartOptions.horizontalLines[hl],
                    hly = Math.round(valueToYPixel(line.value)) - 0.5;
                context.strokeStyle = line.color || '#ffffff';
                context.lineWidth = line.lineWidth || 1;
                context.beginPath();
                context.moveTo(0, hly);
                context.lineTo(dimensions.width, hly);
                context.stroke();
                context.closePath()
            }
        }
        for (var d = 0; d < this.seriesSet.length; d += 1) {
            context.save();
            var timeSeries = this.seriesSet[d].timeSeries,
                dataSet = timeSeries.data,
                seriesOptions = this.seriesSet[d].options;
            timeSeries.dropOldData(oldestValidTime, chartOptions.maxDataSetLength);
            context.lineWidth = seriesOptions.lineWidth;
            context.strokeStyle = seriesOptions.strokeStyle;
            context.beginPath();
            var firstX = 0,
                lastX = 0,
                lastY = 0;
            for (var i = 0; i < dataSet.length && dataSet.length !== 1; i += 1) {
                var x = timeToXPixel(dataSet[i][0]),
                    y = valueToYPixel(dataSet[i][1]);
                if (i === 0) {
                    firstX = x;
                    context.moveTo(x, y)
                } else {
                    switch (chartOptions.interpolation) {
                        case "linear":
                        case "line":
                            {
                                context.lineTo(x, y);
                                break
                            }
                        case "bezier":
                        default:
                            {
                                context.bezierCurveTo(Math.round((lastX + x) / 2), lastY, Math.round((lastX + x)) / 2, y, x, y);
                                break
                            }
                        case "step":
                            {
                                context.lineTo(x, lastY);context.lineTo(x, y);
                                break
                            }
                    }
                }
                lastX = x;
                lastY = y
            }
            if (dataSet.length > 1) {
                if (seriesOptions.fillStyle) {
                    context.lineTo(dimensions.width + seriesOptions.lineWidth + 1, lastY);
                    context.lineTo(dimensions.width + seriesOptions.lineWidth + 1, dimensions.height + seriesOptions.lineWidth + 1);
                    context.lineTo(firstX, dimensions.height + seriesOptions.lineWidth);
                    context.fillStyle = seriesOptions.fillStyle;
                    context.fill()
                }
                if (seriesOptions.strokeStyle && seriesOptions.strokeStyle !== 'none') {
                    context.stroke()
                }
                context.closePath()
            }
            context.restore()
        }
        if (!chartOptions.labels.disabled && !isNaN(this.valueRange.min) && !isNaN(this.valueRange.max)) {
            var maxValueString = chartOptions.yMaxFormatter(this.valueRange.max, chartOptions.labels.precision),
                minValueString = chartOptions.yMinFormatter(this.valueRange.min, chartOptions.labels.precision),
                maxLabelPos = chartOptions.scrollBackwards ? 0 : dimensions.width - context.measureText(maxValueString).width - 2,
                minLabelPos = chartOptions.scrollBackwards ? 0 : dimensions.width - context.measureText(minValueString).width - 2;
            context.fillStyle = chartOptions.labels.fillStyle;
            context.fillText(maxValueString, maxLabelPos, chartOptions.labels.fontSize);
            context.fillText(minValueString, minLabelPos, dimensions.height - 2)
        }
        if (chartOptions.timestampFormatter && chartOptions.grid.millisPerLine > 0) {
            var textUntilX = chartOptions.scrollBackwards ? context.measureText(minValueString).width : dimensions.width - context.measureText(minValueString).width + 4;
            for (var t = time - (time % chartOptions.grid.millisPerLine); t >= oldestValidTime; t -= chartOptions.grid.millisPerLine) {
                var gx = timeToXPixel(t);
                if ((!chartOptions.scrollBackwards && gx < textUntilX) || (chartOptions.scrollBackwards && gx > textUntilX)) {
                    var tx = new Date(t),
                        ts = chartOptions.timestampFormatter(tx),
                        tsWidth = context.measureText(ts).width;
                    textUntilX = chartOptions.scrollBackwards ? gx + tsWidth + 2 : gx - tsWidth - 2;
                    context.fillStyle = chartOptions.labels.fillStyle;
                    if (chartOptions.scrollBackwards) {
                        context.fillText(ts, gx, dimensions.height - 2)
                    } else {
                        context.fillText(ts, gx - tsWidth, dimensions.height - 2)
                    }
                }
            }
        }
        context.restore();
    };
    SmoothieChart.timeFormatter = function(date) {
        function pad2(number) {
            return (number < 10 ? '0' : '') + number
        }
        return pad2(date.getHours()) + ':' + pad2(date.getMinutes()) + ':' + pad2(date.getSeconds())
    };
    exports.TimeSeries = TimeSeries;
    exports.SmoothieChart = SmoothieChart
})(typeof exports === 'undefined' ? this : exports);


//Applicaiton code
var volt, current, power, factor;

function setMsg(cls, text) {
    sbox = document.getElementById('status_box');
    sbox.className = "siimple-alert  siimple-alert--" + cls;
    sbox.innerHTML = text;
    console.log(text);
}

var WS = {
    ws: undefined,
    connected: false,
    open: function(uri) {
        this.instance = null;
        this.ref = null;
        this.ws = new WebSocket(uri, ['arduino']);
        this.ws.binaryType = 'arraybuffer';
        this.ws.onopen = function(evt) {
            setMsg("done", "WebSocket is open.");
            WS.connected = true;
        };
        this.ws.onerror = function(evt) {
            setMsg("error", "WebSocket error!");
            this.connected = false;
        };
        this.ws.onmessage = function(evt) {
            console.log(evt.data);
            var data = JSON.parse(evt.data);
            //🔓
            if (data.status != 'ok')
                return;
            switch (data.action) {
                case 'wifi':
                    if (WS.instance) {
                        WS.instance.innerHTML = WS.instance.getAttribute('data-name');
                        WS.instance.disabled = false;
                        WS.instance.className = 'button-primary';
                    }
                    if (WS.ref) {
                        var tableRef = WS.ref.getElementsByTagName('tbody')[0];
                        var tableRows = tableRef.getElementsByTagName('tr');
                        for (var x = tableRef.rows.length - 1; x >= 0; x--) {
                            tableRef.removeChild(tableRows[x]);
                        }
                        for (var i = 0; i < data.result.length; i++) {

                            // Insert a row in the table at the last row
                            var newRow = tableRef.insertRow(tableRef.rows.length);

                            // Insert a cell in the row at index 0
                            var newSsidCell = newRow.insertCell(0);
                            var newRssiCell = newRow.insertCell(1);

                            // Append a text node to the cell
                            var newSsidCellText = '<a href="#" onclick="set_ssid(this.innerHTML)">' + data.result[i].ssid + '</a>';
                            newSsidCell.innerHTML = newSsidCellText;
                            var newRssiCellText = document.createTextNode(data.result[i].rssi == 0 ? '' : '🔓' + data.result[i].rssi);
                            newRssiCell.appendChild(newRssiCellText);
                        }
                    }
            }
        };
    },
    write: function(data) {
        if (this.connected)
            this.ws.send(data);
    },
    request: function(action, method, params, instance, ref) {
        var reqObject = {
            type: 'req',
            method: method,
            action: action,
            param: params
        }
        console.log(reqObject, this);
        this.instance = instance;
        this.ref = ref;
        this.write(JSON.stringify(reqObject));
    }
}

class Chart {
    random(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    }
    constructor(el, width, min, max) {
        this.chart = new SmoothieChart({
            millisPerPixel: 100,
            grid: {
                fillStyle: '#ffffff',
                strokeStyle: '#ffffff',
                borderVisible: true
            },
            labels: {
                fillStyle: '#000000'
            },
            maxValue: max,
            minValue: min
        });
        this.series = new TimeSeries();
        this.min = min;
        this.max = max;
        this.chart.addTimeSeries(this.series, {
            lineWidth: 2,
            strokeStyle: '#03a9f4',
            fillStyle: '#f1f5fa'
        });
        this.chart.streamTo(document.getElementById(el), width);
    }
    add(time, data) {
        this.series.append(time, data);
    }
    addTest() {
        this.series.append(new Date().getTime(), this.random(this.min, this.max));
    }
}

//open websocket

    
    var ws, ledID;

window.onload = function() {
        ws = new WebSocket('wss://' + url + '/ws');
        ledID = document.getElementById('led-switch');
        var url = window.location.host;

    ws.onopen = function() {
        ws.send("Message to send");
    };

    ws.onmessage = function (evt) {
    var arr = evt.data.split('&');
        if (arr[1] == "LED_OFF") {
            ledID.checked = false;
        }
        else if (arr[1] == "LED_ON") {
            ledID.checked = true;
        }
    }

    if (document.getElementById('volt-chart') == null)
        return;
    volt = new Chart('volt-chart', 500, 0, 220);

    setInterval(function() {
        volt.addTest();
    }, 500);
}

function led() {
    var led_status = "LED_OFF";
    if (ledID.checked)
        {
            led_status = "LED_ON";
         }
         ws.send(led_status);   
}

function scan(el) {
    el.innerHTML = "Scanning...";
    el.disabled = true;
    el.className = '';
    WS.request('wifi', 'get', [], el, document.getElementById('scan-table'));
}

function set_ssid(value) {
    console.log(value);
    document.getElementById('ssid').value = value;
}