/**
 *   Nodestalgia websocket & canvas experiment
 *   2012 fcsonline
 *   Sumo: This file is copied from https://github.com/fcsonline/nodestalgia/tree/develop/public/javascripts and modified to use Vert.X EventBus
 */
(function () {

    var PI_2 = Math.PI * 2;
    var MAX_MSG_TTL = 50;
    var MARGIN_LEFT = 150;
    var MARGIN_RIGHT = 150;
    var MARGIN_TOP = 50;
    var MARGIN_BOTTOM = 50;
    var BULLET_POPUP_DIST = 20;
    var BULLET_SIZE = 4;
    var DEFAULT_FONT = "10pt Arial";
    var PONG_HEIGHT = 50;

    var canvasW = 1000;
    var canvasH = 560;
    var friction = 0.99;
    var requests = [];
    var typerequests = {};
    var messages = [];
    var srcslots = [];
    var dstslots = [];
    var origins = [];
    var total = 0;
    var pongy = 0;
    var bulletpopup = -1;
    var pauseinfo = {};

    var canvas;
    var ctx;

    var longDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var longMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    var intervalId = null;
    var intervalLoopTime = 30;

    var speed = 0;
    var sumarize = true;
    var colorize = true;
    var time = true;

    function init() {
        $canvas = $("#mainCanvas");
        canvas = $canvas[0];

        // Load dynamic properties
        intervalLoopTime = $canvas.data("frame-rate");
        speed = $canvas.data("speed");
        colorize = $canvas.data("colorize");
        sumarize = $canvas.data("sumarize");
        time = $canvas.data("time");

        if (canvas.getContext) {
            setup();
            resetcounters();
            intervalId = setInterval(run, intervalLoopTime);
        }
        else {
            alert("Sorry, needs a recent version of Chrome, Firefox, Opera, Safari, or Internet Explorer 9.");
        }
    }

    function setup() {
        var canvasDiv = $("#canvasContainer");

        canvasW = canvasDiv.outerWidth();
        canvasH = canvasDiv.outerHeight();

        canvas.setAttribute("width", canvasW);
        canvas.setAttribute("height", canvasH);

        pongy = canvasH / 2 - PONG_HEIGHT / 2;

        console.log("Initialized canvas with size: " + canvasW + "x" + canvasH);
        console.log("Initialized " + Math.floor(canvasH / 20) + " request and resource vertical slots");

        ctx = canvas.getContext("2d");
    }

    function resetcounters() {
        // Init label display responses
        typerequests['200'] = 0;
        typerequests['404'] = 0;
        typerequests['304'] = 0;
    }

    function run(readonly) {

        if (readonly === undefined || readonly === false) {
            // For paused information
            pauseinfo ['200'] = typerequests['200'];
            pauseinfo ['304'] = typerequests['304'];
            pauseinfo ['404'] = typerequests['404'];
            pauseinfo.date = new Date();
        }

        ctx.globalCompositeOperation = "source-over";
        ctx.fillStyle = "rgb(0,0,0)";
        ctx.fillRect(0, 0, canvasW, canvasH);
        ctx.font = DEFAULT_FONT;
        ctx.globalCompositeOperation = "lighter";

        var Mrnd = Math.random;
        var Mabs = Math.abs;

        // Obsolete arrays
        var orequests = [];
        var omessages = [];
        var osrcslots = [];
        var odstslots = [];

        var i = requests.length;
        while (i--) {
            var m = requests[i];
            var x = m.x;
            var y = m.y;
            var vX = m.vX;
            var vY = m.vY;

            var nextX = x + vX;
            var nextY = y + vY;

            if (nextX > canvasW - MARGIN_RIGHT) {
                nextX = canvasW - MARGIN_RIGHT;
                vX *= -1;

                // Establish the repplied attribute for pong
                m.repplied = true;

                // Push a new message
                var msg = new Message();
                msg.x = nextX - 50;
                msg.y = nextY;
                msg.color = m.color;
                msg.text = m.req.result;
                msg.ttl = MAX_MSG_TTL; // Aprox: 1.5s
                messages.push(msg);

                var g = ctx.createRadialGradient(nextX, nextY, BULLET_SIZE, nextX, nextY, BULLET_SIZE * 20);
                g.addColorStop(0, "rgba(" + m.color.r + "," + m.color.g + "," + m.color.b + "," + 1 + ")");
                g.addColorStop(0.2, "rgba(" + m.color.r + "," + m.color.g + "," + m.color.b + ", 0.4)");
                g.addColorStop(1.0, "rgba(255,255,255,0)");

                ctx.save();
                ctx.fillStyle = g;
                ctx.beginPath();
                ctx.arc(nextX, nextY, BULLET_SIZE, 0, PI_2, false);
                ctx.fill();
                ctx.restore();

                // Search the source slot, for removing
                var dstslotpos = findSlotByTarget(m.req.path);

                if (dstslotpos >= 0) {
                    dstslots[dstslotpos].count--;
                    if (dstslots[dstslotpos].count === 0) {
                        console.log('Removed obsoleted resource slot at: ' + dstslotpos);
                        odstslots.push(dstslotpos);
                    }
                }

            } else if (nextX < MARGIN_LEFT) {
                // Remove the request from the stack
                orequests.push(i);

                // Search the request slot, for removing
                var srcslotpos = findSlotByIp(m.req.ip);

                if (srcslotpos >= 0) {
                    srcslots[srcslotpos].count--;
                    if (srcslots[srcslotpos].count === 0) {
                        console.log('Removed obsoleted request slot at: ' + srcslotpos);
                        osrcslots.push(srcslotpos);
                    }
                }
            }

            if (nextY > canvasH) {
                nextY = canvasH;
                vY *= -1;
            } else if (nextY < 0) {
                nextY = 0;
                vY *= -1;
            }

            if (readonly === undefined || readonly === false) {
                m.vX = vX;
                m.vY = vY;
                m.x = nextX;
                m.y = nextY;
            }

            ctx.save();
            ctx.fillStyle = colorDef(m.color);
            ctx.beginPath();
            ctx.arc(nextX, nextY, BULLET_SIZE, 0, PI_2, true);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }

        // DNS Source ip label
        var j = srcslots.length;
        ctx.save();
        ctx.font = DEFAULT_FONT;
        ctx.shadowColor = "#fff";
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#ffffff";

        function fitText(text, maxwidth) {

            while (ctx.measureText(text).width > maxwidth) {
                text = text.substring(0, text.length - 1);
            }

            return text;
        }

        while (j--) {
            var s = srcslots[j];


            ctx.fillText(fitText(s.ip, MARGIN_LEFT), 10, s.y);
        }

        ctx.restore();

        // Target label
        var k = dstslots.length;
        ctx.save();
        ctx.font = DEFAULT_FONT;
        ctx.shadowColor = "#fff";
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#ffffff";

        while (k--) {
            var t = dstslots[k];
            ctx.fillText(t.path, canvasW - MARGIN_RIGHT + 10, t.y);
        }

        ctx.restore();

        // HTTP Result labels
        var n = messages.length;
        ctx.save();
        ctx.font = DEFAULT_FONT;
        ctx.shadowColor = "#fff";
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        while (n--) {
            var title = messages[n];

            if (--title.ttl > 0) {
                ctx.fillStyle = colorDef(title.color, title.ttl / MAX_MSG_TTL);
                ctx.shadowBlur = title.ttl / 5;
                ctx.fillText(title.text, title.x, title.y);
            } else {
                omessages.push(n);
            }

        }

        ctx.restore();

        // Next Pong position
        var nrpos = findNextNonReppliedRequest();
        if (nrpos >= 0) {
            pongy = Math.max(requests[nrpos].y - PONG_HEIGHT / 2, 0);
        }

        // Display pong
        ctx.save();
        ctx.fillStyle = "rgb(150,29,28)";
        ctx.fillRect(canvasW - MARGIN_RIGHT, pongy, 10, PONG_HEIGHT);
        ctx.restore();

        // Type requests and total label
        if (sumarize) {
            var st = '';

            st += ' HTTP OK: ' + pad(pauseinfo['200'], 7);
            st += ' HTTP NOT FOUND: ' + pad(pauseinfo['404'], 5);
            st += ' HTTP NOT MODIFIED: ' + pad(pauseinfo['304'], 5);
            st += ' TOTAL: ' + pad(total, 8);

            var tx = canvasW - 600;
            var ty = canvasH - 5;
            ctx.save();
            ctx.font = DEFAULT_FONT;
            ctx.shadowColor = "#fff";
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            ctx.shadowBlur = 0;
            ctx.fillStyle = "#ffffff";
            ctx.fillText(st, tx, ty);
            ctx.restore();
        }

        // Date & Time display
        if (time) {
            var date = pauseinfo.date;
            ctx.save();
            ctx.font = DEFAULT_FONT;
            ctx.shadowColor = "#fff";
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            ctx.shadowBlur = 0;
            ctx.fillStyle = "#ffffff";
            ctx.fillText(getDateDisplay(date), 5, 15);
            ctx.fillText(getTimeDisplay(date), 5, 35);
            ctx.restore();
        }

        // Remove obsolete requests
        requests = $.grep(requests, function (n, i) {
            return $.inArray(i, orequests) < 0;
        });

        // Remove obsolete messages
        messages = $.grep(messages, function (n, i) {
            return $.inArray(i, omessages) < 0;
        });

        // Remove obsolete resources slots
        dstslots = $.grep(dstslots, function (n, i) {
            return $.inArray(i, odstslots) < 0;
        });

        // Remove obsolete requests slots
        srcslots = $.grep(srcslots, function (n, i) {
            return $.inArray(i, osrcslots) < 0;
        });

    }

    function RemoteRequest() {
        this.color = ''; // Defined by origin color o random for only one origin
        this.x = 0;
        this.y = 0;
        this.vX = 0;
        this.vY = 0;
        this.req = null; // Filled by websocket
        this.repplied = false; // For pong targets
    }

    function Slot() {
        this.x = 0;
        this.y = 0;
        this.count = 0;
        this.ip = ''; // For request slots
        this.path = ''; // For resource slots
    }

    function Origin() {
        this.color = '';
        this.path = '';
    }

    function colorDef(obj, alpha) {
        if (alpha !== undefined) {
            return "rgba(" + obj.r + "," + obj.g + "," + obj.b + "," + alpha + ")";
        } else {
            return "rgb(" + obj.r + "," + obj.g + "," + obj.b + ")";
        }
    }

    function Message() {
        this.x = 0;
        this.y = 0;
        this.text = "";
    }

    function rect(context, x, y, w, h) {
        context.beginPath();
        context.rect(x, y, w, h);
        context.closePath();
        context.fill();
    }

    function pad(num, length) {
        var str = '' + num;
        while (str.length < length) {
            str = '0' + str;
        }

        return str;
    }

    function getDateDisplay(date) {
        return longDays[date.getDay()] + ', ' + longMonths[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear() + '\r\n';
    }

    function getTimeDisplay(date) {
        return (date.getHours() < 10 ? '0' : '') + date.getHours() + ':' +
            (date.getMinutes() < 10 ? '0' : '') + date.getMinutes() + ':' +
            (date.getSeconds() < 10 ? '0' : '') + date.getSeconds();
    }

    function findNextNonReppliedRequest() {
        var j;
        for (j = 0; j < requests.length; j++) {
            if (!requests[j].repplied) {
                return j;
            }
        }

        return -1;
    }

    function findSlotByIp(ip) {
        var j;
        for (j = 0; j < srcslots.length; j++) {
            if (ip === srcslots[j].ip) {
                return j;
            }
        }

        return -1;
    }

    function findSlotByTarget(target) {
        var j;
        for (j = 0; j < dstslots.length; j++) {
            if (target === dstslots[j].path) {
                return j;
            }
        }

        return -1;
    }

    function findOriginByName(filename) {
        var j;
        for (j = 0; j < origins.length; j++) {
            if (filename === origins[j].path) {
                return j;
            }
        }

        return -1;
    }

    window.onload = init;

    // Establish the websocket connection
    //var eb = new EventBus('http://localhost:5555/eventbus');
    var eb = new EventBus('http://apsrt1451:5555/eventbus');

    eb.onopen = function () {

        eb.registerHandler('log', function (err, res) {
            console.log(res.body);
            var robj = res.body;


            if (typerequests[robj.result] === undefined) {
                typerequests[robj.result] = 0;
            }

            typerequests[robj.result]++;

            // if not paused, then add it to buffer
            if (intervalId) {
                var m = new RemoteRequest();
                m.x = MARGIN_LEFT; // canvasW * 0.5;
                m.vX = speed;
                m.req = robj;
                requests.push(m);

                if (robj.origin !== undefined) {
                    // Find pre generated origin, for inherit color
                    var originpos = findOriginByName(robj.origin);

                    if (originpos < 0) {
                        // New origin assignment
                        var origin = new Origin();
                        origin.path = robj.origin;
                        origin.color = {
                            r: Math.floor(Math.random() * 155 + 100),
                            g: Math.floor(Math.random() * 155 + 100),
                            b: Math.floor(Math.random() * 155 + 100)
                        };
                        originpos = origins.push(origin) - 1;
                        console.log('New origin: ' + robj.origin);
                    }

                    m.color = origins[originpos].color;
                } else {
                    // For no origin request, only one origin, then random color
                    m.color = {
                        r: Math.floor(Math.random() * 155 + 100),
                        g: Math.floor(Math.random() * 155 + 100),
                        b: Math.floor(Math.random() * 155 + 100)
                    };
                }

                // Search a request slot
                var srcslotpos = findSlotByIp(robj.ip);

                if (srcslotpos < 0) {
                    // New slot assignment
                    var sslot = new Slot();
                    sslot.ip = robj.ip;
                    sslot.count = 1;
                    sslot.y = Math.floor(Math.random() * (canvasH - MARGIN_TOP - MARGIN_BOTTOM) + MARGIN_TOP); // TODO: Find a correct slot vertical position
                    srcslotpos = srcslots.push(sslot) - 1;
                    console.log('New request sslot at: ' + sslot.y);
                } else {
                    srcslots[srcslotpos].count++;
                    console.log('Recycled request slot at: ' + srcslots[srcslotpos].y);
                }

                // Search a resource slot
                var dstslotpos = findSlotByTarget(robj.path);

                if (dstslotpos < 0) {
                    // New slot assignment
                    var dslot = new Slot();
                    dslot.path = robj.path;
                    dslot.count = 1;
                    dslot.y = Math.floor(Math.random() * (canvasH - MARGIN_TOP - MARGIN_BOTTOM) + MARGIN_TOP); // TODO: Find a correct slot vertical position
                    dstslotpos = dstslots.push(dslot) - 1;
                    console.log('New resource dslot at: ' + dslot.y);
                } else {
                    dstslots[dstslotpos].count++;
                    console.log('Recycled resource slot at: ' + dstslots[dstslotpos].y);
                }

                m.y = srcslots[srcslotpos].y;

                // When the origin and target slots are set, then the vertical speed can be calculated
                m.vY = (dstslots[dstslotpos].y - srcslots[srcslotpos].y) / (canvasW - MARGIN_LEFT - MARGIN_RIGHT) * speed;
                console.log('New request with vertical speed at: ' + m.vY);

            }

            ++total;
        });

    };

    function bulletInfoPopup(e) {
        var minpos;
        var mindist;
        var j;

        for (j = 0; j < requests.length; j++) {
            var tr = requests[j];
            var dist = Math.sqrt(Math.pow(e.pageX - tr.x, 2) + Math.pow(e.pageY - tr.y, 2));

            if (mindist === undefined || dist < mindist) {
                minpos = j;
                mindist = dist;
            }
        }

        if (mindist < BULLET_POPUP_DIST) {
            if (minpos !== bulletpopup || bulletpopup < 0) {
                console.log('Showing popup of request: ' + minpos);
                console.log(requests[minpos]);
                bulletpopup = minpos;

                // Refresh canvas
                run(true);

                // Display popup rectangle
                var r = requests[bulletpopup];
                var rx = r.x + 20;
                var ry = r.y + 20;

                ctx.save();
                ctx.fillStyle = colorDef(r.color);
                ctx.fillRect(rx, ry, 220, 95);
                ctx.font = DEFAULT_FONT;
                ctx.fillStyle = "#ffffff";
                ctx.fillText(r.req.method + ' ' + r.req.path, rx + 10, ry + 20);
                ctx.fillText("From: " + r.req.ip, rx + 10, ry + 35);
                ctx.fillText("Result: " + r.req.result, rx + 10, ry + 50);
                ctx.fillText("Size: " + r.req.size, rx + 10, ry + 65);
                ctx.fillText("Time: " + r.req.time, rx + 10, ry + 80);
                ctx.restore();

                $canvas.css('cursor', 'pointer');
            }
        } else {
            if (bulletpopup >= 0) {
                console.log('Hidding popup');
                bulletpopup = -1;

                // Refresh canvas
                run(true);

                $canvas.css('cursor', 'default');
            }
        }

    }

    // Pause
    $(document).bind('keypress', function (e) {
        var unicode = e.keyCode ? e.keyCode : e.charCode;

        if (unicode == 32) { // Space - Pause
            if (intervalId) {
                clearInterval(intervalId);
                intervalId = null;

                // Refresh canvas
                run(true);

                // Bind the mousemove event
                $canvas.bind('mousemove', bulletInfoPopup);
            } else {
                // Unbind the mousemove event
                $canvas.unbind('mousemove', bulletInfoPopup);
                intervalId = setInterval(run, intervalLoopTime);
            }
        } else if (unicode == 43) { // + more horizontal speed
            speed = Math.min(speed + 5, 200);
            console.log("Speed set to: " + speed);
        } else if (unicode == 45) { // - less horizontal speed
            speed = Math.max(speed - 5, 10);
            console.log("Speed set to: " + speed);
        }
    });

    // Resize window event
    $(window).resize(function () {
        setup();
    });

})();
