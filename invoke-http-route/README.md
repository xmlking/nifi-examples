invoke-http-route
=================

This flow demonstrates how to call an HTTP service based on an incoming FlowFile, and route the original FlowFile 
based on the status code returned from the invocation. In this example, every 30 seconds a FlowFile is produced, 
an attribute is added to the FlowFile that sets q=nifi, the google.com is invoked for that FlowFile, and any response 
with a 200 is routed to a relationship called 200.