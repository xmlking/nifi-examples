package com.crossbusiness.loggen

import groovy.json.JsonBuilder
import groovy.util.logging.Slf4j

@Slf4j
class AppLogGenerator {

    static final int DEFAULT_NUM_LOGS = 100;
    static final long DEFAULT_DELAY = 100;

    public static final String ERROR = "ERROR";
    public static final String WARN = "WARN";
    public static final String INFO = "INFO";
    public static final String DEBUG = "DEBUG";
    public static final String TRACE = "TRACE";

    static final String[] LEVELS = [ERROR, WARN, INFO, DEBUG, TRACE];

    static final String[] MESSAGES =["Solr is cool", "NiFi rocks!", "Lucene is awesome" ];

    static final Exception[] EXCEPTIONS =[
        new IllegalStateException("Uh-oh something went wrong"),
        new IllegalArgumentException("Invalid value"),
        new NullPointerException("Value was null")
    ];


    AppLogGenerator() {
        println 'Hello World'
    }

    def produce(long numLogs, long delay) {
        Random rand = new Random();
        for (int i=0; i < numLogs; i++) {
            switch(LEVELS[rand.nextInt(5)]) {
                case ERROR:
                    final Exception e = EXCEPTIONS[rand.nextInt(EXCEPTIONS.length)];
                    log.error(e.getMessage(), e);
                    break;
                case WARN:
                    log.warn(MESSAGES[rand.nextInt(MESSAGES.length)]);
                    break;
                case INFO:
                    log.info(MESSAGES[rand.nextInt(MESSAGES.length)]);
                    break;
                case DEBUG:
                    log.debug(MESSAGES[rand.nextInt(MESSAGES.length)]);
                    break;
                case TRACE:
                    log.trace(MESSAGES[rand.nextInt(MESSAGES.length)]);
                    break;
                default:
                    log.debug("Default message");
            }

            if (delay > 0) {
                try {
                    Thread.sleep(delay);
                } catch (InterruptedException e) {
                    log.error(e.getMessage(), e);
                }
            }
        }
    }

    static main(args) {
        def generator = new AppLogGenerator()

        int numLogs = DEFAULT_NUM_LOGS;
        long delay = DEFAULT_DELAY;

        if (args.length == 2) {
            numLogs = Integer.parseInt(args[0]);
            delay = Long.parseLong(args[1]);
        }

        generator.produce(numLogs, delay);
    }
}