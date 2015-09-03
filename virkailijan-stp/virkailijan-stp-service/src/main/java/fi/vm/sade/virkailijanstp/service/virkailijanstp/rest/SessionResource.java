package fi.vm.sade.virkailijanstp.service.virkailijanstp.rest;


import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;

import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import fi.vm.sade.organisaatio.api.search.OrganisaatioPerustieto;
import fi.vm.sade.organisaatio.service.search.OrganisaatioSearchService;


@Component
@Path("session")
public class SessionResource {

    @Autowired
    protected OrganisaatioSearchService organisaatioSearchService;
    public void setOrganisaatioSearchService(
            OrganisaatioSearchService organisaatioSearchService) {
        this.organisaatioSearchService = organisaatioSearchService;
    }

    @GET
    @Path("/maxinactiveinterval")
    @Produces(MediaType.TEXT_PLAIN)
    public String maxInactiveInterval(@Context HttpServletRequest req) {
        return Integer.toString(req.getSession().getMaxInactiveInterval());
    }
    
    @POST
    @Path("/defaultprofile")
    @Consumes("application/json")
    @Produces("application/json")
    public List defaultprofile(List<String> orgOids) {
    	List<String> resultList = new LinkedList<String>();
    	for (String orgOid : orgOids) {
	    	Set<String> parentOids = new HashSet<String>(organisaatioSearchService.findParentOids(orgOid));
	    	List<OrganisaatioPerustieto> parents = organisaatioSearchService.findByOidSet(parentOids);
	    	for(OrganisaatioPerustieto p : parents) {
	    		if(!StringUtils.isEmpty(p.getOppilaitostyyppi())) {
	    			for (String slug : slugs.keySet()) {
	    				if (((List) slugs.get(slug)).contains(p.getOppilaitostyyppi())){
	    					resultList.add(slug);
	    					continue;
	    				}
	    			}
	    		}
	    	}
    	}
        return resultList;
    }
    
    Map<String, List<String>> slugs = new HashMap<String, List<String>>();
    
    @Value("${slug-map}")
    public void setSlugmap(String slug_map) {
    	String [] slugs_orgtypes =  slug_map.split(";");
    	for (String slug_orgtypes : slugs_orgtypes) {
    		String [] so = slug_orgtypes.split(":");
    		slugs.put(so[0], Arrays.asList(so[1].split(",")));
    	}
    }
}
