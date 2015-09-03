package fi.vm.sade.virkailijanstp.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;


@Controller
public class ConfigController {
	
	@Value("${virkailijan-stp-ui.authentication-service-url}")
	private String stpAuthURL;
	  
	
    @Value("${virkailijan-stp-ui.virkailijan-stp-service-url.rest}")
    private String stpServiceRestURL;

    @Value("${virkailijan-stp-ui.wp-api-url}")
    private String wpApiURL;
    
    @Value("${auth.mode:}")
    private String authMode;

    @Value("${virkailijan-stp-ui.cas.url:/cas/myroles}")
    private String casUrl;
    
    @Value("${virkailijan-stp-ui.session-keepalive-interval.seconds:60}")
    private Integer sessionKeepAliveIntervalInSeconds;
    
    @Value("${virkailijan-stp-ui.session-max-idle-time.seconds:1800}")
    private Integer maxSessionIdleTimeInSeconds;

    @RequestMapping(value = "configuration.js", method = RequestMethod.GET, produces = "text/javascript", headers = "Accept=*/*")
    @ResponseBody
    public String index() {
        StringBuilder b = new StringBuilder();
        append(b, "AUTH_URL_BASE", stpAuthURL);
        append(b, "SERVICE_URL_BASE", stpServiceRestURL);
        append(b, "WP_API_BASE", wpApiURL);
        append(b, "TEMPLATE_URL_BASE", "");
        append(b, "CAS_URL", casUrl);
        append(b, "SESSION_KEEPALIVE_INTERVAL_IN_SECONDS", Integer.toString(sessionKeepAliveIntervalInSeconds));
        append(b, "MAX_SESSION_IDLE_TIME_IN_SECONDS", Integer.toString(maxSessionIdleTimeInSeconds));
        if (!authMode.isEmpty()) {
            append(b, "AUTH_MODE", authMode);

        }
        return b.toString();
    }

    private void append(StringBuilder b, String key, String value) {
        b.append(key);
        b.append(" = \"");
        b.append(value);
        b.append("\";\n");
    }

}
