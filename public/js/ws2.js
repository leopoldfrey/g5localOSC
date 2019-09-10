	var ws2;
	var wsServer2 = "ws://localhost:4000";
    
    /* -- Web Sockets -- */
    document.addEventListener("visibilitychange", function() {
        //console.log("Visibility changed to: " + document.visibilityState);
        if(document.visibilityState == "visible" ) {
            checkWSStateAndReconnectIfNecessary(ws2.readyState);

            // Check again in one second
            setTimeout(function(){
                checkWSStateAndReconnectIfNecessary(ws2.readyState);
            }, 3000);
        }
    });

    document.addEventListener("onfocus", function() {
        //console.log("Gained focus");
        checkWSStateAndReconnectIfNecessary(ws2.readyState);

        // Check again in one second
        setTimeout(function(){
            checkWSStateAndReconnectIfNecessary(ws2.readyState);
        }, 3000);
    });

    function checkWSStateAndReconnectIfNecessary(wsReadyState) {
        switch(wsReadyState) {
            case ws2.CONNECTING:
                console.log("- OscWebSocket Connecting...");
                break;
            case ws2.OPEN:
                console.log("- OscWebSocket Open :)");
                break;
            case ws2.CLOSING:
                console.log("- OscWebSocket Closing...");
                break;
            case ws2.CLOSED:
                console.log("* OscWebSocket Closed :(");
                connectToWS();
                break;
        }
    }
