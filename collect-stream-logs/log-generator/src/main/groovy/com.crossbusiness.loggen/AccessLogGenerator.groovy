package com.crossbusiness.loggen

import groovy.json.JsonBuilder
import groovy.util.logging.Slf4j

@Slf4j
class AccessLogGenerator {

    public static final String[] ips=["123.221.14.56","16.180.70.237","10.182.189.79","218.193.16.244","198.122.118.164","114.214.178.92","233.192.62.103","244.157.45.12","81.73.150.239","237.43.24.118"]
    public static final String[] referers=["-","http://www.casualcyclist.com","http://bestcyclingreviews.com/top_online_shops","http://bleater.com","http://searchengine.com"]
    public static final String[] resources=["/handle-bars","/stems","/wheelsets","/forks","/seatposts","/saddles","/shifters","/Store/cart.jsp?productID="]
    public static final String[] useragents=["Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.0)","Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/36.0.1944.0 Safari/537.36","Mozilla/5.0 (Linux; U; Android 2.3.5; en-us; HTC Vision Build/GRI40) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1","Mozilla/5.0 (iPad; CPU OS 6_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A5355d Safari/8536.25","Mozilla/5.0 (Windows; U; Windows NT 6.1; rv:2.2) Gecko/20110201","Mozilla/5.0 (Windows NT 5.1; rv:31.0) Gecko/20100101 Firefox/31.0","Mozilla/5.0 (Windows; U; MSIE 9.0; WIndows NT 9.0; en-US))"]

    AccessLogGenerator() {
        println 'Hello World'
    }

    def produce() {
        println "starting log events..........."
        def ranDumb     = new Random();
        //127.0.0.1 - - [07/Mar/2012:23:21:47 +0100] "GET / HTTP/1.0" 200 454 "-" "ApacheBench/2.3"
        //def regex = ~/([0-9]+\.[0-9]+\.[0-9]+\.[0-9]+).+\[(.+)\] "(\w+) ([^ ]+) .*" (\w+) (\w+)/;
        def regex = ~/^([^ ]*).+\[(.+)\] "(\w+) ([^ ]+) .*" (\w+) ([^ ]*)/

        while (true) {
            AccessLogGenerator.class.getResource( '/example.log' ).eachLine { line ->
                def matcher = regex.matcher(line)
                if (matcher.find()) {
                    def logJson = new JsonBuilder(["ip": matcher.group(1), "time": matcher.group(2), "method": matcher.group(3), "path": matcher.group(4), "result": matcher.group(5), "size": matcher.group(6)])

                    log.info logJson.toString()
                } else {
                    println "no match: " + line
                }
                //sleep(ranDumb.nextInt(2000-1000+1)+100)
                sleep(ranDumb.nextInt(200-100+1)+100)
                //sleep(ranDumb.nextInt(20-10+1)+50)
            }
            println "re-starting log events..........."
        }
    }

    static main(args) {
        def generator = new AccessLogGenerator()
        generator.produce()
    }
}